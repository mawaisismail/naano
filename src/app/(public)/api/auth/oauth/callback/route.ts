import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { signSession } from "@/lib/auth";
import { SESSION_COOKIE } from "@/lib/session";
import {
  OAUTH_COOKIES,
  callbackUrl,
  exchangeCode,
  fetchProfile,
  isProviderId,
  safeEqual,
} from "@/lib/oauth";

/**
 * GET /api/auth/oauth/callback
 *
 * The provider sends the browser back here with a code. Everything that could
 * have been tampered with in transit is checked before a session is issued:
 * the state must match the cookie minted at /start, and the code is only
 * redeemable with the PKCE verifier that never left this server.
 */

const SESSION_MAX_AGE = 60 * 60 * 24 * 30;

function fail(request: NextRequest, reason: string, role: string) {
  const url = new URL(`/register?role=${role}&error=${reason}`, request.url);
  const res = NextResponse.redirect(url);
  for (const name of Object.values(OAUTH_COOKIES)) res.cookies.delete(name);
  return res;
}

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const jar = request.cookies;
  const role = jar.get(OAUTH_COOKIES.role)?.value === "saas" ? "saas" : "influencer";

  // The user pressed cancel on the consent screen.
  if (params.get("error")) return fail(request, "denied", role);

  const code = params.get("code") ?? "";
  const returnedState = params.get("state") ?? "";
  const cookieState = jar.get(OAUTH_COOKIES.state)?.value ?? "";
  const verifier = jar.get(OAUTH_COOKIES.verifier)?.value ?? "";

  const [provider, expectedState] = cookieState.split(":");
  if (!code || !verifier || !isProviderId(provider) || !expectedState) {
    return fail(request, "state", role);
  }
  if (!safeEqual(returnedState, expectedState)) return fail(request, "state", role);

  let profile;
  try {
    const { accessToken } = await exchangeCode({
      provider,
      code,
      redirectUri: callbackUrl(request.nextUrl.origin),
      verifier,
    });
    profile = await fetchProfile(provider, accessToken);
  } catch {
    // The underlying message can carry credentials, so it is not surfaced.
    return fail(request, "exchange", role);
  }

  // An unverified provider email is an account-takeover route: anyone who can
  // register that address with the provider would inherit the matching user.
  if (!profile.emailVerified) return fail(request, "unverified", role);

  const name = [profile.firstName, profile.lastName].filter(Boolean).join(" ").trim();

  // Link by provider subject first, then by verified email, so a user who
  // signed up with a password and later uses Google lands on the same account
  // instead of hitting the unique-email constraint.
  const linked = await prisma.user.findFirst({
    where: { authProvider: provider, providerAccountId: profile.providerAccountId },
  });
  const byEmail = linked ?? (await prisma.user.findUnique({ where: { email: profile.email } }));

  const user = byEmail
    ? await prisma.user.update({
        where: { id: byEmail.id },
        data: {
          authProvider: provider,
          providerAccountId: profile.providerAccountId,
          avatarUrl: byEmail.avatarUrl ?? profile.avatarUrl,
          emailVerified: true,
          emailVerifiedAt: byEmail.emailVerifiedAt ?? new Date(),
        },
      })
    : await prisma.user.create({
        data: {
          email: profile.email,
          // No password is ever set for an OAuth-only account. The login action
          // refuses to compare against an empty hash, so this cannot be used to
          // sign in with a blank password.
          passwordHash: "",
          name: name || profile.email.split("@")[0],
          role: role === "saas" ? "brand" : "creator",
          authProvider: provider,
          providerAccountId: profile.providerAccountId,
          avatarUrl: profile.avatarUrl,
          // The provider asserted this address and we refused the sign-in
          // above if it had not verified it, so there is nothing left to check.
          emailVerified: true,
          emailVerifiedAt: new Date(),
          onboardingStep: role === "saas" ? 1 : 2,
        },
      });

  const destination =
    user.role === "creator" && !user.onboardedAt
      ? "/register?role=influencer"
      : user.role === "creator"
        ? "/creator"
        : "/app";

  const res = NextResponse.redirect(new URL(destination, request.url));
  for (const name of Object.values(OAUTH_COOKIES)) res.cookies.delete(name);
  res.cookies.set(SESSION_COOKIE, signSession(user.id), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
  return res;
}

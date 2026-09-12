import { NextResponse, type NextRequest } from "next/server";
import {
  OAUTH_COOKIES,
  OAUTH_COOKIE_MAX_AGE,
  authorizeUrl,
  callbackUrl,
  isConfigured,
  isProviderId,
  randomUrlToken,
} from "@/lib/oauth";

/**
 * GET /api/auth/oauth/start?provider=google|linkedin_oidc&role=influencer|saas
 *
 * Mints the PKCE verifier, state and nonce, parks them in httpOnly cookies and
 * sends the browser to the provider. The role rides in a cookie rather than in
 * the redirect URI, because the redirect URI has to match what is registered
 * with the provider exactly — a query string on it fails the comparison.
 */
export async function GET(request: NextRequest) {
  const provider = request.nextUrl.searchParams.get("provider");
  const role = request.nextUrl.searchParams.get("role") === "saas" ? "saas" : "influencer";

  if (!isProviderId(provider)) {
    return NextResponse.redirect(new URL("/register?error=provider", request.url));
  }
  if (!isConfigured(provider)) {
    // No credentials configured: say so on the sign-up page rather than
    // bouncing the user to a provider that will show them a raw OAuth error.
    return NextResponse.redirect(
      new URL(`/register?role=${role}&error=unconfigured&provider=${provider}`, request.url)
    );
  }

  const state = randomUrlToken();
  const nonce = randomUrlToken(16);
  const verifier = randomUrlToken(48);

  const redirect = NextResponse.redirect(
    authorizeUrl({
      provider,
      redirectUri: callbackUrl(request.nextUrl.origin),
      state,
      nonce,
      verifier,
    })
  );

  const opts = {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: OAUTH_COOKIE_MAX_AGE,
  };
  redirect.cookies.set(OAUTH_COOKIES.state, `${provider}:${state}`, opts);
  redirect.cookies.set(OAUTH_COOKIES.verifier, verifier, opts);
  redirect.cookies.set(OAUTH_COOKIES.nonce, nonce, opts);
  redirect.cookies.set(OAUTH_COOKIES.role, role, opts);
  return redirect;
}

"use server";

import { redirect } from "next/navigation";
import { cookies, headers } from "next/headers";
import { prisma } from "@/lib/db";
import { verifyPassword, hashPassword } from "@/lib/password";
import { signSession } from "@/lib/auth";
import { SESSION_COOKIE } from "@/lib/session";
import { rateLimit } from "@/lib/rate-limit";
import { safeNextPath } from "@/lib/auth";

const COOKIE_OPTS = {
  httpOnly: true,
  sameSite: "lax" as const,
  path: "/",
  maxAge: 60 * 60 * 24 * 7,
  secure: process.env.NODE_ENV === "production",
};

async function startSession(userId: string) {
  const jar = await cookies();
  jar.set(SESSION_COOKIE, signSession(userId), COOKIE_OPTS);
}

async function callerKey(scope: string) {
  const h = await headers();
  const ip =
    h.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    h.get("x-real-ip")?.trim() ||
    "local";
  return `${scope}:${ip}`;
}

export async function login(_prev: unknown, formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  // Password guessing is only useful in bulk, so cap the bulk.
  const gate = await rateLimit(await callerKey("login"), 10, 60_000);
  if (!gate.ok) {
    return {
      error: `Too many attempts. Try again in ${gate.retryAfterSec} seconds.`,
    };
  }

  const user = await prisma.user.findUnique({ where: { email } });

  // Same message either way — telling the caller which half was wrong is a
  // free account-enumeration oracle.
  //
  // The empty-hash check is load-bearing: an account created through Google or
  // LinkedIn has no password, and verifyPassword must never be asked to
  // compare against "" in case a future hash format treats it as a match.
  if (!user || !user.passwordHash || !verifyPassword(password, user.passwordHash)) {
    return { error: "That email and password do not match." };
  }

  await startSession(user.id);

  const next = safeNextPath(String(formData.get("next") ?? ""));
  // Straight to the workspace. /studio still resolves for old links, but it
  // only redirects here, and bouncing a fresh sign-in through it is a wasted
  // round trip.
  redirect(next ?? (user.role === "creator" ? "/creator" : "/app"));
}

export async function register(_prev: unknown, formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const role = String(formData.get("role") ?? "brand");
  const companyName = String(formData.get("companyName") ?? "").trim();
  const heardAbout = String(formData.get("heardAbout") ?? "").trim().slice(0, 40);

  // The sign-up form posts the name in halves, which is what both providers
  // return too, so the two paths store the same shape.
  const first = String(formData.get("firstName") ?? "").trim();
  const last = String(formData.get("lastName") ?? "").trim();
  const name = [first, last].filter(Boolean).join(" ") || String(formData.get("name") ?? "").trim();

  const gate = await rateLimit(await callerKey("register"), 5, 60_000);
  if (!gate.ok) {
    return {
      error: `Too many attempts. Try again in ${gate.retryAfterSec} seconds.`,
    };
  }

  if (!email.includes("@")) return { error: "Enter a valid email address." };
  if (password.length < 8) return { error: "Use at least 8 characters." };
  if (!name) return { error: "Tell us your name." };

  // Login deliberately refuses to say whether an email exists. Register said so
  // outright, which handed back the same oracle through the other door. It now
  // points at sign-in instead of confirming the account, and is rate limited so
  // the remaining signal cannot be harvested in bulk.
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { error: "That email cannot be used. Try signing in instead." };
  }

  const user = await prisma.user.create({
    data: {
      email,
      passwordHash: hashPassword(password),
      name,
      role: role === "influencer" || role === "creator" ? "creator" : "brand",
      companyName: companyName || null,
      heardAbout: heardAbout || null,
      // No verification mail is sent in this build, but the state is recorded
      // on every signup so switching it on later is a send plus a flip rather
      // than a migration. An email signup starts unverified by definition.
      emailVerified: false,
      // Step 1 of the wizard is this form; the creator resumes at step 2.
      onboardingStep: role === "influencer" || role === "creator" ? 2 : 1,
    },
  });

  await startSession(user.id);
  // naano keeps the whole creator wizard on /register?role=influencer and
  // advances it in place, so a new creator goes back to the same URL and lands
  // on step 2 rather than being moved to a different route.
  redirect(user.role === "creator" ? "/register?role=influencer" : "/app");
}

export async function logout() {
  const jar = await cookies();
  jar.delete(SESSION_COOKIE);
  redirect("/");
}

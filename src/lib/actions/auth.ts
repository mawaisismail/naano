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
  const gate = rateLimit(await callerKey("login"), 10, 60_000);
  if (!gate.ok) {
    return {
      error: `Too many attempts. Try again in ${gate.retryAfterSec} seconds.`,
    };
  }

  const user = await prisma.user.findUnique({ where: { email } });

  // Same message either way — telling the caller which half was wrong is a
  // free account-enumeration oracle.
  if (!user || !verifyPassword(password, user.passwordHash)) {
    return { error: "That email and password do not match." };
  }

  await startSession(user.id);

  const next = safeNextPath(String(formData.get("next") ?? ""));
  redirect(next ?? (user.role === "creator" ? "/studio" : "/app"));
}

export async function register(_prev: unknown, formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const role = String(formData.get("role") ?? "brand");
  const companyName = String(formData.get("companyName") ?? "").trim();

  const gate = rateLimit(await callerKey("register"), 5, 60_000);
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
    },
  });

  await startSession(user.id);
  // A creator with no profile has no marketplace card, so no brand can find or
  // book them. Onboarding is the first thing they see, not an empty studio.
  redirect(user.role === "creator" ? "/studio/onboarding" : "/app");
}

export async function logout() {
  const jar = await cookies();
  jar.delete(SESSION_COOKIE);
  redirect("/");
}

"use server";

import { createHash, randomInt, timingSafeEqual } from "node:crypto";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { hashPassword } from "@/lib/password";
import { rateLimit } from "@/lib/rate-limit";
import { headers } from "next/headers";
import { DEMO_RESET_CODE, demoResetEnabled, emailConfigured, sendEmail } from "@/lib/email";

/**
 * Password recovery: request a 6-digit code, then redeem it for a new password.
 *
 * Rules this follows, all of which exist because the obvious version leaks:
 *
 *   - The response never says whether an email is registered. "If that address
 *     has an account, a code is on its way" is returned either way, and the
 *     work done is the same shape in both branches.
 *   - Only a SHA-256 of the code is stored, so the table is useless if dumped.
 *   - A code is single use, expires in 15 minutes, and is compared in constant
 *     time. Five wrong attempts burn it, which stops a 6-digit code (one in a
 *     million) from being brute-forced in a few thousand requests.
 *   - Requesting a code invalidates any earlier unused one for that address, so
 *     a user who asks twice cannot be confused about which code is live.
 */

const CODE_TTL_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 5;

const sha = (v: string) => createHash("sha256").update(v).digest("hex");

async function callerKey(scope: string) {
  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  return `${scope}:${ip}`;
}

export type RecoveryState = {
  error?: string;
  notice?: string;
  stage?: "request" | "verify";
  /** Set only in demo mode, so the screen can show the PIN it would email. */
  demoCode?: string;
} | null;

/** Step one: the user gives an email and we post a code to it. */
export async function requestRecoveryCode(
  _prev: RecoveryState,
  formData: FormData
): Promise<RecoveryState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();

  const gate = rateLimit(await callerKey("recovery-request"), 5, 60_000);
  if (!gate.ok) {
    return { error: `Too many requests. Try again in ${gate.retryAfterSec} seconds.` };
  }
  if (!email.includes("@")) return { error: "Enter a valid email address." };

  // With no mailbox and no demo override there is no way to deliver a code, so
  // say that rather than issuing one nobody can receive.
  if (!emailConfigured() && !demoResetEnabled()) {
    return { error: "Password reset is unavailable: no email provider is configured." };
  }

  const demo = demoResetEnabled();
  const user = await prisma.user.findUnique({ where: { email } });

  // In demo mode, say plainly that there is no such account.
  //
  // The non-committal "if that address has an account…" exists to stop the
  // form being used to test which emails are registered. Demo mode already
  // publishes the PIN on screen, so that protection buys nothing there, and
  // staying silent produces the worst possible dead end: a visible code that
  // cannot work, rejected with a message about the code rather than about the
  // address. Production keeps the original behaviour.
  if (demo && !user) {
    return {
      error: `No account found for ${email}. Sign up first, or use a demo account — brand@naano.demo or creator@naano.demo.`,
    };
  }

  // Only mint a code for a real account, but return the same message either
  // way. A caller must not be able to tell the two apart.
  if (user) {
    // In demo mode the code is fixed and shown on screen. It is still hashed
    // and still expires, so the rest of the flow is exercised exactly as it
    // would be in production rather than short-circuited.
    const code = demo ? DEMO_RESET_CODE : String(randomInt(0, 1_000_000)).padStart(6, "0");
    await prisma.passwordResetCode.updateMany({
      where: { email, usedAt: null },
      data: { usedAt: new Date() },
    });
    await prisma.passwordResetCode.create({
      data: { email, codeHash: sha(code), expiresAt: new Date(Date.now() + CODE_TTL_MS) },
    });
    await sendEmail({
      to: email,
      subject: "Your Naano password reset code",
      text: `Your password reset code is ${code}. It expires in 15 minutes.\n\nIf you did not ask for this, you can ignore this email.`,
    });
  }

  return {
    stage: "verify",
    notice: demo
      ? "This build has no email provider, so no message was sent."
      : "If that address has an account, a 6-digit code is on its way.",
    // Returned regardless of whether the account exists, so the demo PIN is
    // not itself an oracle for which addresses are registered.
    demoCode: demo ? DEMO_RESET_CODE : undefined,
  };
}

/** Step two: the code plus a new password. */
export async function redeemRecoveryCode(
  _prev: RecoveryState,
  formData: FormData
): Promise<RecoveryState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const code = String(formData.get("code") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  const gate = rateLimit(await callerKey("recovery-redeem"), 10, 60_000);
  if (!gate.ok) {
    return { stage: "verify", error: `Too many attempts. Try again in ${gate.retryAfterSec} seconds.` };
  }
  if (password.length < 8) {
    return { stage: "verify", error: "Use at least 8 characters for the new password." };
  }

  const row = await prisma.passwordResetCode.findFirst({
    where: { email, usedAt: null, expiresAt: { gt: new Date() } },
    orderBy: { createdAt: "desc" },
  });

  // One message for every failure mode: wrong code, expired code, no code, no
  // account. Anything more specific is an oracle.
  const wrong = { stage: "verify" as const, error: "That code is not valid or has expired." };
  if (!row) return wrong;

  if (row.attempts + 1 >= MAX_ATTEMPTS) {
    await prisma.passwordResetCode.update({
      where: { id: row.id },
      data: { usedAt: new Date(), attempts: { increment: 1 } },
    });
    return wrong;
  }

  const given = Buffer.from(sha(code));
  const held = Buffer.from(row.codeHash);
  const matches = given.length === held.length && timingSafeEqual(given, held);
  if (!matches) {
    await prisma.passwordResetCode.update({
      where: { id: row.id },
      data: { attempts: { increment: 1 } },
    });
    return wrong;
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return wrong;

  await prisma.$transaction([
    prisma.user.update({
      where: { id: user.id },
      data: { passwordHash: hashPassword(password) },
    }),
    prisma.passwordResetCode.update({
      where: { id: row.id },
      data: { usedAt: new Date() },
    }),
  ]);

  // No session is issued here on purpose. Whoever reset the password now has to
  // sign in with it, which is one more thing an attacker holding only a
  // mailbox has to do, and it matches what the user expects to happen.
  redirect("/login?reset=1");
}

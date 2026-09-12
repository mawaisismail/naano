"use server";

import { randomBytes } from "node:crypto";
import { prisma } from "@/lib/db";

/**
 * The code behind naano.com/invite/<code>.
 *
 * Generated rather than derived from the user id: an id in a public URL is a
 * free handle for enumerating accounts. Eight base32-ish characters is short
 * enough to read out loud and long enough not to be guessed.
 */
const ALPHABET = "abcdefghjkmnpqrstuvwxyz23456789";

function newCode() {
  const bytes = randomBytes(8);
  return Array.from(bytes, (b) => ALPHABET[b % ALPHABET.length]).join("");
}

export async function ensureReferralCode(userId: string): Promise<string> {
  const existing = await prisma.user.findUnique({
    where: { id: userId },
    select: { referralCode: true },
  });
  if (existing?.referralCode) return existing.referralCode;

  // The column is unique, so a collision is a retry rather than a corruption.
  for (let attempt = 0; attempt < 5; attempt++) {
    const code = newCode();
    try {
      const updated = await prisma.user.update({
        where: { id: userId },
        data: { referralCode: code },
        select: { referralCode: true },
      });
      return updated.referralCode!;
    } catch {
      // taken — try another
    }
  }
  throw new Error("Could not allocate a referral code");
}

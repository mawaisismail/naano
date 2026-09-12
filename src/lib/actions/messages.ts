"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";

/**
 * Messaging between a brand and the creator it booked.
 *
 * A thread is a Deal, so "may this person post here" is the same question as
 * "is this deal theirs" — the brand that owns the campaign, or the creator the
 * booking names. No separate participant table to fall out of step with the
 * booking it describes.
 */

export type MessageState = { error?: string } | null;

const MAX_LENGTH = 4000;

/** The deal, if this user is party to it. Null for everyone else. */
async function authorise(dealId: string, userId: string) {
  const deal = await prisma.deal.findUnique({
    where: { id: dealId },
    include: { campaign: { select: { brandId: true } } },
  });
  if (!deal) return null;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true, creatorSlug: true },
  });
  if (!user) return null;

  if (user.role === "brand") return deal.campaign.brandId === userId ? deal : null;
  return user.creatorSlug && deal.creatorSlug === user.creatorSlug ? deal : null;
}

export async function sendMessage(_prev: MessageState, formData: FormData): Promise<MessageState> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const dealId = String(formData.get("dealId") ?? "");
  const body = String(formData.get("body") ?? "").trim().slice(0, MAX_LENGTH);
  if (!body) return { error: "Write something first." };

  // Checked server-side every time: a thread id in a form field is a request,
  // not a permission.
  const deal = await authorise(dealId, user.id);
  if (!deal) return { error: "That conversation is not yours." };

  await prisma.message.create({
    data: {
      dealId,
      senderRole: user.role,
      senderName: user.name,
      body,
    },
  });

  revalidatePath("/creator/messages");
  revalidatePath("/app/messages");
  return null;
}

/** Mark the other side's messages in this thread as read. */
export async function markThreadRead(dealId: string) {
  const user = await getCurrentUser();
  if (!user) return;
  const deal = await authorise(dealId, user.id);
  if (!deal) return;

  await prisma.message.updateMany({
    where: { dealId, senderRole: { not: user.role }, readAt: null },
    data: { readAt: new Date() },
  });
}

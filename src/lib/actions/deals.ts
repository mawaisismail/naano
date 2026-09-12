"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireCreator } from "@/lib/session";

/**
 * The creator's half of a booking.
 *
 * Every one of these re-checks that the deal belongs to THIS creator. The deal
 * id arrives in a form post, so trusting it would let any signed-in creator
 * accept or publish somebody else's booking.
 *
 * Which side may accept is not a matter of taste: the side that did NOT start
 * the conversation answers it. A creator can accept a brand's invitation and a
 * brand can accept a creator's application, and neither can accept its own —
 * otherwise either party could book the other unilaterally.
 */
async function ownDeal(dealId: string) {
  const creator = await requireCreator();
  if (!creator) return null;
  const deal = await prisma.deal.findUnique({ where: { id: dealId } });
  if (!deal || deal.creatorId !== creator.id) return null;
  return deal;
}

function touch() {
  revalidatePath("/creator");
  revalidatePath("/creator/collaborations");
  revalidatePath("/creator/opportunities");
  revalidatePath("/app");
  revalidatePath("/app/collaborations");
}

/** Accept an invitation the BRAND sent. */
export async function acceptOffer(dealId: string) {
  const deal = await ownDeal(dealId);
  if (!deal) redirect("/creator/collaborations");
  if (deal.status !== "invited") return;
  // Accepting your own application would be booking yourself.
  if (deal.initiatedBy !== "brand") return;

  await prisma.deal.update({ where: { id: deal.id }, data: { status: "accepted" } });
  touch();
}

/** Turn down an invitation, or withdraw an application. Terminal either way. */
export async function declineOffer(dealId: string) {
  const deal = await ownDeal(dealId);
  if (!deal) redirect("/creator/collaborations");
  if (deal.status !== "invited") return;

  await prisma.deal.update({ where: { id: deal.id }, data: { status: "declined" } });
  touch();
}

/** The draft is written and ready for the brand to look at. */
export async function markDraftReady(dealId: string) {
  const deal = await ownDeal(dealId);
  if (!deal) redirect("/creator/collaborations");
  if (deal.status !== "accepted") return;

  await prisma.deal.update({ where: { id: deal.id }, data: { status: "draft" } });
  touch();
}

/** Scheduled to go out. */
export async function markScheduled(dealId: string) {
  const deal = await ownDeal(dealId);
  if (!deal) redirect("/creator/collaborations");
  if (deal.status !== "draft") return;

  await prisma.deal.update({ where: { id: deal.id }, data: { status: "scheduled" } });
  touch();
}

export type PublishState = { error?: string } | null;

/**
 * The post is live. This is the only transition that takes data, because it is
 * the one that makes attribution possible: without the URL there is nothing to
 * check the tracked link against, and "live" would be a claim rather than a
 * fact. So it is required, and it has to look like a LinkedIn post.
 */
export async function markPublished(
  _prev: PublishState,
  formData: FormData
): Promise<PublishState> {
  const dealId = String(formData.get("dealId") ?? "");
  const deal = await ownDeal(dealId);
  if (!deal) return { error: "That booking is not yours." };
  if (deal.status !== "scheduled" && deal.status !== "draft" && deal.status !== "accepted") {
    return { error: "This booking is not at a stage where it can be published." };
  }

  const postUrl = String(formData.get("postUrl") ?? "").trim();
  if (!/^https?:\/\/(www\.)?linkedin\.com\/.+/i.test(postUrl)) {
    return { error: "Paste the link to the published LinkedIn post." };
  }

  await prisma.deal.update({
    where: { id: deal.id },
    data: {
      status: "live",
      postUrl,
      publishedAt: deal.publishedAt ?? new Date(),
    },
  });
  touch();
  return null;
}

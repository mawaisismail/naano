"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireCreator } from "@/lib/session";

/**
 * Creator-side transitions.
 *
 * Every one of these re-checks that the deal belongs to THIS creator. The deal
 * id arrives in a form post, so trusting it would let any signed-in creator
 * accept or publish somebody else's booking.
 */
async function ownDeal(dealId: string) {
  const creator = await requireCreator();
  if (!creator?.creatorSlug) return null;
  const deal = await prisma.deal.findUnique({ where: { id: dealId } });
  if (!deal || deal.creatorSlug !== creator.creatorSlug) return null;
  return deal;
}

function touch() {
  revalidatePath("/studio");
  revalidatePath("/app/deals");
  revalidatePath("/app");
}

export async function acceptOffer(dealId: string) {
  const deal = await ownDeal(dealId);
  if (!deal) redirect("/studio");
  if (deal.status !== "invited") return;

  await prisma.deal.update({ where: { id: deal.id }, data: { status: "accepted" } });
  touch();
}

export async function declineOffer(dealId: string) {
  const deal = await ownDeal(dealId);
  if (!deal) redirect("/studio");
  if (deal.status !== "invited") return;

  await prisma.deal.update({ where: { id: deal.id }, data: { status: "declined" } });
  touch();
}

export async function markPublished(dealId: string, formData: FormData) {
  const deal = await ownDeal(dealId);
  if (!deal) redirect("/studio");
  if (deal.status === "paid" || deal.status === "declined") return;

  const postUrl = String(formData.get("postUrl") ?? "").trim();

  await prisma.deal.update({
    where: { id: deal.id },
    data: {
      status: "live",
      postUrl: postUrl || deal.postUrl,
      publishedAt: deal.publishedAt ?? new Date(),
    },
  });
  touch();
}

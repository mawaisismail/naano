"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireBrand } from "@/lib/session";
import { makeTrackingCode } from "@/lib/tracking";

/**
 * A brand inviting a creator onto a campaign.
 *
 * The other half of applying. Both produce the same thing — a booking at
 * "invited" — and differ only in who has to answer it, which is what
 * initiatedBy records.
 *
 * The price is the creator's own published rate, taken from their card at the
 * moment of invitation. A brand naming its own number would make the card
 * meaningless, and reading it later would let a creator change what they are
 * owed after the fact.
 */
export type InviteState = { ok?: true; error?: string } | null;

export async function inviteCreator(_prev: InviteState, formData: FormData): Promise<InviteState> {
  const brand = await requireBrand();
  if (!brand) return { error: "Sign in as a brand to invite creators." };

  const campaignId = String(formData.get("campaignId") ?? "");
  const creatorId = String(formData.get("creatorId") ?? "");

  const [campaign, creator] = await Promise.all([
    prisma.campaign.findUnique({ where: { id: campaignId }, select: { id: true, brandId: true } }),
    prisma.user.findUnique({ where: { id: creatorId } }),
  ]);

  if (!campaign || campaign.brandId !== brand.id) {
    return { error: "That campaign is not yours." };
  }
  if (!creator || creator.role !== "creator" || !creator.onboardedAt) {
    return { error: "That creator does not have a live card." };
  }
  if (!creator.postCost || creator.postCost <= 0) {
    return { error: `${creator.name} has not published a rate yet, so they cannot be booked.` };
  }

  // One booking per creator per campaign, enforced by the database as well.
  // Re-inviting someone who already declined is a new conversation, so that
  // case reopens the existing row rather than failing.
  const existing = await prisma.deal.findFirst({ where: { campaignId, creatorId } });
  if (existing) {
    if (existing.status !== "declined") return { ok: true };

    await prisma.deal.update({
      where: { id: existing.id },
      data: { status: "invited", initiatedBy: "brand", price: creator.postCost },
    });
  } else {
    await prisma.deal.create({
      data: {
        campaignId,
        creatorId,
        price: creator.postCost,
        // The brand started this, so the creator is the side that answers.
        initiatedBy: "brand",
        status: "invited",
        trackingCode: makeTrackingCode(),
      },
    });
  }

  revalidatePath("/app/creators");
  revalidatePath("/app/collaborations");
  revalidatePath("/app");
  return { ok: true };
}

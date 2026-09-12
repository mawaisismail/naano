"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireCreator } from "@/lib/session";
import { makeTrackingCode } from "@/lib/tracking";

/**
 * A creator applying to an open campaign.
 *
 * naano's flow is "apply, the brand accepts, and the booking is created on
 * your terms", so applying creates the deal at the first stage of the existing
 * lifecycle — "invited" — priced at the creator's own published rate. The
 * brand's side of the board already knows how to move it from there, which is
 * why this does not invent a parallel state.
 */
export type ApplyState = { ok?: true; error?: string } | null;

export async function applyToCampaign(_prev: ApplyState, formData: FormData): Promise<ApplyState> {
  const user = await requireCreator();
  if (!user) redirect("/login?next=/creator/opportunities");

  if (!user.creatorSlug || !user.onboardedAt) {
    return { error: "Finish your card before applying to campaigns." };
  }

  const campaignId = String(formData.get("campaignId") ?? "");
  const campaign = await prisma.campaign.findUnique({ where: { id: campaignId } });
  if (!campaign || campaign.status !== "live") {
    return { error: "That campaign is no longer open." };
  }

  // Applying twice must not create a second booking for the same post.
  const existing = await prisma.deal.findFirst({
    where: { campaignId, creatorId: user.id },
  });
  if (existing) return { ok: true };

  await prisma.deal.create({
    data: {
      campaignId,
      creatorId: user.id,
      price: user.postCost ?? 0,
      // The creator started this, so the brand is the side that answers it.
      initiatedBy: "creator",
      status: "invited",
      trackingCode: makeTrackingCode(),
    },
  });

  revalidatePath("/creator/opportunities");
  revalidatePath("/creator");
  return { ok: true };
}

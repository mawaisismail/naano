"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireBrand } from "@/lib/session";
import { STAGES, stageIndex, isTerminal, canAdvance, type Stage } from "@/lib/lifecycle";

async function touch(campaignId: string) {
  revalidatePath("/app");
  revalidatePath("/app/collaborations");
  revalidatePath("/app/campaigns");
  revalidatePath(`/app/campaigns/${campaignId}`);
}

/** Move a deal one stage along the lifecycle. */
export async function advanceDeal(dealId: string) {
  const brand = await requireBrand();
  if (!brand) redirect("/login");

  const deal = await prisma.deal.findUnique({
    where: { id: dealId },
    include: { campaign: { select: { brandId: true } } },
  });
  if (!deal || deal.campaign.brandId !== brand.id) return;
  if (isTerminal(deal.status)) return;

  // Owning the campaign is not the same as owning this step. A brand cannot
  // accept on the creator's behalf, and cannot publish a post it does not
  // control — see ownerOf() for why that distinction is the product.
  if (!canAdvance(deal.status, deal.initiatedBy, "brand")) return;

  const next: Stage = STAGES[Math.min(stageIndex(deal.status) + 1, STAGES.length - 1)];

  await prisma.deal.update({
    where: { id: dealId },
    data: {
      status: next,
      // stamp the publish time the first time it goes live, and never again
      publishedAt: next === "live" && !deal.publishedAt ? new Date() : deal.publishedAt,
    },
  });

  await touch(deal.campaignId);
}

/** The brand turns down an application, or withdraws its own invitation. */
export async function declineDeal(dealId: string) {
  const brand = await requireBrand();
  if (!brand) redirect("/login");

  const deal = await prisma.deal.findUnique({
    where: { id: dealId },
    include: { campaign: { select: { brandId: true } } },
  });
  if (!deal || deal.campaign.brandId !== brand.id) return;

  await prisma.deal.update({ where: { id: dealId }, data: { status: "declined" } });
  await touch(deal.campaignId);
}

/** Put a declined deal back at the start. */
export async function reopenDeal(dealId: string) {
  const brand = await requireBrand();
  if (!brand) redirect("/login");

  const deal = await prisma.deal.findUnique({
    where: { id: dealId },
    include: { campaign: { select: { brandId: true } } },
  });
  if (!deal || deal.campaign.brandId !== brand.id) return;

  await prisma.deal.update({ where: { id: dealId }, data: { status: "invited" } });
  await touch(deal.campaignId);
}

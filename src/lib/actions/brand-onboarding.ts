"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { readBrandSite } from "@/lib/brand-import";
import { makeTrackingCode } from "@/lib/tracking";

/**
 * Brand onboarding, naano's three steps on /register?role=saas.
 *
 *   1  the site URL, and the read that follows it
 *   2  value proposition and three ICPs, editable
 *   3  AI matching — which is where the workspace opens
 *
 * Progress lives on the user row, so a refresh resumes rather than restarts,
 * exactly as the creator wizard does.
 */

export type BrandState = { error?: string } | null;

async function requireBrand() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/register%3Frole%3Dsaas");
  if (user.role !== "brand") redirect("/creator");
  return user;
}

/** Step 1 — read the site and write what it returned. */
export async function readSite(_prev: BrandState, formData: FormData): Promise<BrandState> {
  const user = await requireBrand();
  const url = String(formData.get("websiteUrl") ?? "");
  const read = await readBrandSite(url);
  if (!read) return { error: "Enter a website address, like fasttools.com." };

  await prisma.user.update({
    where: { id: user.id },
    data: {
      websiteUrl: url.trim(),
      companyName: read.company,
      valueProp: read.valueProp,
      icps: read.icps.map((i) => `${i.title} — ${i.description}`),
      brandDataSource: read.source,
    },
  });

  revalidatePath("/register");
  return null;
}

/** Step 2 — accept or edit what the read produced, then open AI matching. */
export async function confirmBrandProfile(
  _prev: BrandState,
  formData: FormData
): Promise<BrandState> {
  const user = await requireBrand();

  const valueProp = String(formData.get("valueProp") ?? "").trim().slice(0, 2000);
  if (valueProp.length < 40) {
    return { error: "The value proposition needs a few sentences for creators to work from." };
  }

  const icps = [0, 1, 2]
    .map((i) => String(formData.get(`icp${i}`) ?? "").trim())
    .filter(Boolean)
    .slice(0, 3);
  if (icps.length === 0) return { error: "Keep at least one ideal customer." };

  await prisma.user.update({
    where: { id: user.id },
    data: { valueProp, icps, brandOnboardedAt: new Date() },
  });

  // naano creates the starter campaign here — the brief every invited creator
  // receives — so the workspace is not empty when it opens.
  const existing = await prisma.campaign.findFirst({
    where: { brandId: user.id, name: { endsWith: "creator brief" } },
  });
  if (!existing) {
    await prisma.campaign.create({
      data: {
        brandId: user.id,
        name: `${user.companyName ?? "Your"} creator brief`,
        objective: `Introduce ${user.companyName ?? "the product"} to the audiences above.`,
        keyMessages: valueProp,
        guidelines:
          "Creators can adapt the angle to their expertise, while keeping every product claim factual.",
        landingUrl: user.websiteUrl ?? "",
        status: "live",
        channel: "linkedin",
        industries: [],
        countries: [],
      },
    });
  }

  redirect("/app?welcome=matching");
}

/** Top up the balance. No processor is connected, so this credits directly. */
export async function addBudget(_prev: BrandState, formData: FormData): Promise<BrandState> {
  const user = await requireBrand();

  const amount = Math.round(Number(formData.get("amount") ?? 0));
  if (!Number.isFinite(amount) || amount < 500) {
    return { error: "The minimum top-up is €500." };
  }
  if (amount > 250_000) return { error: "That is above the single top-up limit." };

  // Balance and ledger move together: a balance that can disagree with its own
  // entries is worse than no ledger at all.
  await prisma.$transaction([
    prisma.user.update({
      where: { id: user.id },
      data: { walletBalance: { increment: amount } },
    }),
    prisma.walletEntry.create({
      data: {
        brandId: user.id,
        kind: "demo_topup",
        amount,
        reference: `DEMO-${makeTrackingCode(6).toUpperCase()}`,
      },
    }),
  ]);

  revalidatePath("/app/billing");
  revalidatePath("/app");
  return null;
}

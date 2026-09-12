"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireCreator } from "@/lib/session";
import { reserveCreatorSlug } from "@/lib/creator-profile";
import { importPublicProfile, recommendedPostPrice } from "@/lib/linkedin-import";

/**
 * The four-step creator wizard, matching naano's.
 *
 *   1  account          (the sign-up form itself)
 *   2  LinkedIn import
 *   3  industries
 *   4  card + price     then an optional professional-information step
 *
 * Progress is persisted on the user row after every step, so a refresh, a
 * closed tab or "finish later" all resume from the right place rather than
 * restarting. Nothing here trusts a step number sent by the browser.
 */

export type WizardState = { error?: string } | null;

const str = (v: FormDataEntryValue | null, max: number) =>
  String(v ?? "").trim().slice(0, max);

/** Step 2 — read the public profile and write what it returned. */
export async function importLinkedIn(_prev: WizardState, formData: FormData): Promise<WizardState> {
  const user = await requireCreator();
  if (!user) redirect("/login?next=/register%3Frole%3Dinfluencer");

  const url = str(formData.get("linkedinUrl"), 300);
  const profile = importPublicProfile(url);
  if (!profile) {
    return { error: "That does not look like a public LinkedIn profile URL." };
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      linkedinUrl: url,
      linkedinImportedAt: new Date(),
      profileDataSource: profile.source,
      headline: profile.headline,
      country: profile.country,
      countryCode: profile.countryCode,
      flag: profile.flag,
      followers: profile.followers,
      avatarUrl: user.avatarUrl ?? profile.avatarUrl,
      // The recommendation is computed now so step 4 shows the same number the
      // creator was quoted even if they come back to it days later.
      postCost: recommendedPostPrice(profile.followers),
      onboardingStep: 3,
    },
  });

  revalidatePath("/register");
  return null;
}

/** Step 3 — the industries the card is filed under. */
export async function saveIndustries(_prev: WizardState, formData: FormData): Promise<WizardState> {
  const user = await requireCreator();
  if (!user) redirect("/login");

  const industries = String(formData.get("industries") ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 5);

  if (industries.length === 0) return { error: "Pick at least one industry." };

  await prisma.user.update({
    where: { id: user.id },
    data: { industries, verticals: industries, onboardingStep: 4 },
  });
  revalidatePath("/register");
  return null;
}

/** Back a step, for naano's "Edit my industries" link. */
export async function goToStep(step: number) {
  const user = await requireCreator();
  if (!user) redirect("/login");
  const clamped = Math.min(4, Math.max(2, Math.round(step)));
  await prisma.user.update({ where: { id: user.id }, data: { onboardingStep: clamped } });
  revalidatePath("/register");
}

/** Step 4 — accept or adjust the price, and publish the marketplace card. */
export async function createMarketplaceProfile(
  _prev: WizardState,
  formData: FormData
): Promise<WizardState> {
  const user = await requireCreator();
  if (!user) redirect("/login");

  const price = Math.round(Number(formData.get("postCost") ?? 0));
  if (!Number.isFinite(price) || price < 20 || price > 5000) {
    return { error: "Set a price per post between €20 and €5,000." };
  }

  const slug = user.creatorSlug ?? (await reserveCreatorSlug(user.name, user.id));

  await prisma.user.update({
    where: { id: user.id },
    data: {
      postCost: price,
      creatorSlug: slug,
      // onboardedAt is what puts the card in the marketplace. The professional
      // details that follow are optional, so the card goes live here.
      onboardedAt: new Date(),
      onboardingStep: 5,
    },
  });

  revalidatePath("/marketplace");
  revalidatePath("/register");
  return null;
}

/** The optional professional-information step after the card is created. */
export async function saveProfessionalInfo(
  _prev: WizardState,
  formData: FormData
): Promise<WizardState> {
  const user = await requireCreator();
  if (!user) redirect("/login");

  const hasBusiness = formData.get("hasBusiness") === "yes";
  const legalName = str(formData.get("legalName"), 160);
  const legalAddress = str(formData.get("legalAddress"), 300);
  const taxAccepted = formData.get("taxDeclaration") === "on";
  const invoiceAccepted = formData.get("invoiceMandate") === "on";

  if (hasBusiness && (!legalName || !legalAddress)) {
    return { error: "A registered business needs a legal name and address." };
  }
  if (!taxAccepted || !invoiceAccepted) {
    return { error: "Both confirmations are required to invoice through Naano." };
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      businessCountry: str(formData.get("businessCountry"), 80) || user.country,
      hasBusiness,
      legalName: legalName || null,
      legalAddress: legalAddress || null,
      taxDeclarationAcceptedAt: new Date(),
      invoiceMandateAcceptedAt: new Date(),
      onboardingStep: 6,
    },
  });

  redirect("/creator");
}

/**
 * "Go to my workspace — finish later".
 *
 * Moves past the professional step without filling it in. Step 6 means "the
 * wizard is done with you", not "everything is filled in" — the workspace
 * still shows a prompt to complete it, and payouts still depend on it. Leaving
 * the step at 5 here would drop the creator straight back into the wizard on
 * their next visit, which is the opposite of finishing later.
 */
export async function finishLater() {
  const user = await requireCreator();
  if (!user) redirect("/login");
  await prisma.user.update({
    where: { id: user.id },
    data: { onboardingStep: 6 },
  });
  redirect("/creator");
}

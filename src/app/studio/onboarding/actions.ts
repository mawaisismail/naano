"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireCreator } from "@/lib/session";
import { reserveCreatorSlug } from "@/lib/creator-profile";

const int = (v: FormDataEntryValue | null, min: number, max: number) => {
  const n = Math.round(Number(String(v ?? "").replace(/[^0-9.]/g, "")));
  if (!Number.isFinite(n)) return min;
  return Math.min(max, Math.max(min, n));
};

const str = (v: FormDataEntryValue | null, max: number) =>
  String(v ?? "").trim().slice(0, max);

export async function completeOnboarding(formData: FormData) {
  const user = await requireCreator();
  if (!user) redirect("/login?next=/studio/onboarding");

  const name = str(formData.get("name"), 80) || user.name;
  const slug = user.creatorSlug ?? (await reserveCreatorSlug(name, user.id));

  // Every number is clamped server-side. These drive what a brand pays and what
  // the marketplace ranks on, so a hand-edited form must not be able to claim
  // 50 million followers or a EUR 0 post.
  await prisma.user.update({
    where: { id: user.id },
    data: {
      name,
      creatorSlug: slug,
      headline: str(formData.get("headline"), 160),
      bio: str(formData.get("bio"), 600),
      country: str(formData.get("country"), 60),
      countryCode: str(formData.get("countryCode"), 2).toUpperCase(),
      flag: str(formData.get("flag"), 8) || "🌍",
      verticals: str(formData.get("verticals"), 120),
      icp: str(formData.get("icp"), 160),
      followers: int(formData.get("followers"), 0, 5_000_000),
      medianViews: int(formData.get("medianViews"), 0, 20_000_000),
      postCost: int(formData.get("postCost"), 20, 5000),
      reactionsPerPost: int(formData.get("reactionsPerPost"), 0, 500_000),
      commentsPerPost: int(formData.get("commentsPerPost"), 0, 100_000),
      onboardedAt: new Date(),
    },
  });

  revalidatePath("/studio");
  revalidatePath("/marketplace");
  redirect("/studio?welcome=1");
}

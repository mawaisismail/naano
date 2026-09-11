import type { User } from "@prisma/client";
import { CREATORS, type Creator } from "@/lib/creators";
import { prisma } from "@/lib/db";
import { slugify } from "@/lib/slug";

export { slugify };

const split = (s: string | null | undefined) =>
  (s ?? "").split(",").map((x) => x.trim()).filter(Boolean);

/** Has this creator finished onboarding and therefore got a marketplace card? */
export const isOnboarded = (u: Pick<User, "onboardedAt" | "creatorSlug">) =>
  Boolean(u.onboardedAt && u.creatorSlug);

/**
 * Render a signed-up creator in the same shape as a seeded one, so the
 * marketplace card, the profile page and the booking flow do not need to know
 * whether a creator came from the seed file or from the database.
 */
export function toCreator(u: User): Creator | null {
  if (!u.creatorSlug) return null;

  const followers = u.followers ?? 0;
  const medianViews = u.medianViews ?? 0;
  const reactions = u.reactionsPerPost ?? 0;

  return {
    id: `usr_${u.id}`,
    slug: u.creatorSlug,
    name: u.name,
    headline: u.headline ?? "",
    avatar:
      u.avatarUrl ??
      `https://api.dicebear.com/9.x/notionists/svg?seed=${u.creatorSlug}&backgroundColor=e8f0fe,dceaff,f3f4f6`,
    country: u.country ?? "",
    countryCode: u.countryCode ?? "",
    flag: u.flag ?? "🌍",
    verticals: split(u.verticals),
    bio: u.bio ?? "",
    followers,
    medianViews,
    postCost: u.postCost ?? 0,
    // Real signups have no attribution history yet, so there is nothing to
    // score a genuine fit on. A flat, honest baseline beats inventing a number
    // that looks like earned data.
    matchScore: 75,
    engagementRate: medianViews > 0 ? Number(((reactions / medianViews) * 100).toFixed(2)) : 0,
    reactionsPerPost: reactions,
    commentsPerPost: u.commentsPerPost ?? 0,
    icp: split(u.icp),
  };
}


/**
 * Pick a slug that collides with neither a seeded creator nor another account.
 * The seeded creators are not database rows, so a unique index cannot see them.
 */
export async function reserveCreatorSlug(name: string, userId: string) {
  const base = slugify(name);
  const seeded = new Set(CREATORS.map((c) => c.slug));

  for (let i = 0; i < 50; i++) {
    const candidate = i === 0 ? base : `${base}-${i + 1}`;
    if (seeded.has(candidate)) continue;

    const taken = await prisma.user.findFirst({
      where: { creatorSlug: candidate, NOT: { id: userId } },
      select: { id: true },
    });
    if (!taken) return candidate;
  }

  return `${base}-${userId.slice(-6)}`;
}

/** Seeded creators plus every onboarded signup, as one list. */
export async function allCreators(): Promise<Creator[]> {
  const rows = await prisma.user.findMany({
    where: { role: "creator", onboardedAt: { not: null } },
    orderBy: { onboardedAt: "desc" },
  });

  const live = rows
    .map(toCreator)
    .filter((c): c is Creator => c !== null)
    // a signed-up creator must not shadow a seeded slug
    .filter((c) => !CREATORS.some((s) => s.slug === c.slug));

  return [...live, ...CREATORS];
}

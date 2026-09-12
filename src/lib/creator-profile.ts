import type { User } from "@prisma/client";
import type { Creator } from "@/lib/creators";
import { prisma } from "@/lib/db";
import { slugify } from "@/lib/slug";

export { slugify };

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
    verticals: u.verticals,
    bio: u.bio ?? "",
    followers,
    medianViews,
    postCost: u.postCost ?? 0,
    // A creator card carries no intrinsic match score — fit is a question
    // about a specific brand's ICPs, answered in matching.ts. This field is
    // the neutral value the marketplace sorts nothing by.
    matchScore: 0,
    engagementRate: medianViews > 0 ? Number(((reactions / medianViews) * 100).toFixed(2)) : 0,
    reactionsPerPost: reactions,
    commentsPerPost: u.commentsPerPost ?? 0,
    icp: u.icp,
  };
}


/** Pick a slug no other account is already using. */
export async function reserveCreatorSlug(name: string, userId: string) {
  const base = slugify(name);

  for (let i = 0; i < 50; i++) {
    const candidate = i === 0 ? base : `${base}-${i + 1}`;
    const taken = await prisma.user.findFirst({
      where: { creatorSlug: candidate, NOT: { id: userId } },
      select: { id: true },
    });
    if (!taken) return candidate;
  }

  return `${base}-${userId.slice(-6)}`;
}

/**
 * The marketplace: every creator who has finished onboarding.
 *
 * There is no second source. If this list is empty, no creator has completed a
 * card yet, and the screens say exactly that rather than padding it out.
 */
export async function allCreators(): Promise<Creator[]> {
  const rows = await prisma.user.findMany({
    where: { role: "creator", onboardedAt: { not: null }, creatorSlug: { not: null } },
    orderBy: { onboardedAt: "desc" },
  });

  return rows.map(toCreator).filter((c): c is Creator => c !== null);
}

/** One creator by their public slug, or null. */
export async function getCreatorBySlug(slug: string): Promise<Creator | null> {
  const row = await prisma.user.findFirst({
    where: { role: "creator", creatorSlug: slug, onboardedAt: { not: null } },
  });
  return row ? toCreator(row) : null;
}

/** The user id behind a creator card. Bookings need the row, not the slug. */
export async function creatorUserIdFor(slug: string): Promise<string | null> {
  const row = await prisma.user.findFirst({
    where: { role: "creator", creatorSlug: slug, onboardedAt: { not: null } },
    select: { id: true },
  });
  return row?.id ?? null;
}

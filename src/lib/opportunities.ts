/**
 * Scoring and filtering for the creator-side Opportunities board.
 *
 * The match figure naano shows on each card is not decoration — it is what
 * orders the board, so it is computed from things that actually exist on both
 * sides: how much the campaign's target industries overlap the creator's, and
 * whether the creator's audience is the size the brand is buying.
 */

export type Scoreable = {
  industries: string[];
  countries: string[];
};

export type Creator = {
  industries: string[];
  country: string | null;
  followers: number | null;
};

/** 0–100. Whole numbers, because a card that says "87.4/100" reads as noise. */
export function matchScore(campaign: Scoreable, creator: Creator): number {
  // Industry overlap carries most of it: a campaign for DevTools readers is
  // worth little to an HR-Tech audience however large it is.
  // Both lists are defaulted rather than assumed: a row read through a client
  // generated before these columns existed hands back undefined, and a scoring
  // function is not the right place to crash a whole page over it.
  const mine = new Set((creator.industries ?? []).map((s) => s.toLowerCase()));
  const theirs = (campaign.industries ?? []).map((s) => s.toLowerCase());
  const overlap = theirs.filter((t) => mine.has(t)).length;
  const industryFit = theirs.length === 0 ? 0.6 : overlap / theirs.length;

  // A campaign with no country list is open to everyone.
  const countries = campaign.countries ?? [];
  const countryFit =
    countries.length === 0 ||
    (creator.country ? countries.includes(creator.country) : false)
      ? 1
      : 0.55;

  // Under a thousand followers a brand is buying very little reach; past
  // twenty thousand the extra reach stops being the deciding factor.
  const followers = creator.followers ?? 0;
  const reachFit = followers <= 0 ? 0.4 : Math.min(1, 0.55 + Math.min(followers, 20_000) / 44_000);

  const score = 100 * (industryFit * 0.6 + countryFit * 0.2 + reachFit * 0.2);
  return Math.max(0, Math.min(100, Math.round(score)));
}

/** Whole days until the post is due, or null when the brand set no deadline. */
export function daysUntil(deadline: Date | null): number | null {
  if (!deadline) return null;
  const ms = deadline.getTime() - Date.now();
  return Math.max(0, Math.ceil(ms / 86_400_000));
}

export const SORTS = ["Relevance (default)", "Deadline", "Newest"] as const;
export type Sort = (typeof SORTS)[number];

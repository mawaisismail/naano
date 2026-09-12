/**
 * The shape a creator card is rendered from.
 *
 * This file used to hold thirty invented people as well. It does not any
 * more: every creator is a User row, produced by someone finishing onboarding,
 * and the list comes from the database in creator-profile.ts. What is left
 * here is the type and the buckets the marketplace filters by — things that
 * describe creators rather than being them.
 */

export type Creator = {
  id: string;
  slug: string;
  name: string;
  headline: string;
  avatar: string;
  country: string;
  countryCode: string;
  flag: string;
  verticals: string[];
  bio: string;
  followers: number;
  medianViews: number;
  postCost: number;
  matchScore: number;
  engagementRate: number;
  reactionsPerPost: number;
  commentsPerPost: number;
  icp: string[];
};

export const VERTICALS = ["Sales", "RevOps", "DevTools", "HR-Tech", "Product", "Marketing Ops", "Fintech", "Vertical SaaS"] as const;

export const followerTier = (f: number) =>
  f < 5000 ? "1K-5K" : f < 10000 ? "5K-10K" : f < 25000 ? "10K-25K" : f < 75000 ? "25K-75K" : "75K+";

export const TIERS = ["1K-5K", "5K-10K", "10K-25K", "25K-75K", "75K+"] as const;

/** The countries actually represented in a list, for the marketplace filter. */
export const countriesOf = (creators: Creator[]) =>
  Array.from(
    new Map(
      creators
        .filter((c) => c.countryCode)
        .map((c) => [c.countryCode, { code: c.countryCode, name: c.country, flag: c.flag }])
    ).values()
  ).sort((a, b) => a.name.localeCompare(b.name));

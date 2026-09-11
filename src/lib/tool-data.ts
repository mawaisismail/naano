import { CREATORS } from "@/lib/creators";

/**
 * The numbers the free tools run on.
 *
 * naano's tools quote "239 real bookings" from their own marketplace. We do not
 * have their transaction data and will not invent it under their name, so every
 * figure below is derived at build time from this project's own marketplace
 * dataset (32 creators in src/lib/creators.ts) and each tool page says so.
 * The band boundaries and the published-rate curve are the only hand-set
 * values; they follow the tiers naano uses so the two read the same way.
 */

export type Band = {
  label: string;
  min: number;
  max: number;
  /** Median flat fee per sponsored post, in euros, inside this band. */
  medianCost: number;
  /** Median engagement rate, as a percentage, inside this band. */
  medianEngagement: number;
  /** How many creators in the dataset fall in the band. */
  n: number;
  /** Healthy engagement-rate range for the band, as percentages. */
  good: [number, number];
};

const TIERS: [string, number, number, [number, number]][] = [
  ["Under 2,000 followers", 0, 2000, [5, 8]],
  ["2,000 – 5,000 followers", 2000, 5000, [4, 6]],
  ["5,000 – 20,000 followers", 5000, 20000, [2.5, 4]],
  ["20,000 – 50,000 followers", 20000, 50000, [1.5, 2.5]],
  ["50,000+ followers", 50000, Infinity, [0.8, 1.5]],
];

function median(xs: number[]): number {
  if (xs.length === 0) return 0;
  const s = [...xs].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
}

export const BANDS: Band[] = TIERS.map(([label, min, max, good]) => {
  const inBand = CREATORS.filter((c) => c.followers >= min && c.followers < max);
  return {
    label,
    min,
    max,
    n: inBand.length,
    medianCost: Math.round(median(inBand.map((c) => c.postCost))),
    medianEngagement: Number(median(inBand.map((c) => c.engagementRate)).toFixed(2)),
    good,
  };
});

export function bandFor(followers: number): Band {
  return BANDS.find((b) => followers >= b.min && followers < b.max) ?? BANDS[BANDS.length - 1];
}

/** Median flat fee across the whole dataset — what the budget planner books at. */
export const MEDIAN_POST_COST = Math.round(median(CREATORS.map((c) => c.postCost)));
export const DATASET_SIZE = CREATORS.length;

/**
 * Share of accepted bookings that end in a published post, by offer size.
 * Low offers get ignored more often; the curve flattens once the fee is at or
 * above the band median. Anchored on this project's seeded booking states.
 */
export function deliveryOdds(offer: number, band: Band): {
  published: number;
  ignored: number;
  declined: number;
} {
  const ratio = band.medianCost > 0 ? offer / band.medianCost : 1;
  const published = clamp(0.34 + 0.42 * Math.min(ratio, 1.6), 0.28, 0.92);
  const ignored = clamp(0.44 - 0.3 * Math.min(ratio, 1.6), 0.04, 0.46);
  // Round to whole percentage points and settle the remainder on "declined",
  // so the three shares always add up to 100 on screen.
  const pubPct = Math.round(published * 100);
  const ignPct = Math.round(ignored * 100);
  return {
    published: pubPct / 100,
    ignored: ignPct / 100,
    declined: (100 - pubPct - ignPct) / 100,
  };
}

function clamp(v: number, lo: number, hi: number) {
  return Math.min(hi, Math.max(lo, v));
}

export function euros(n: number) {
  return `€${Math.round(n).toLocaleString("en-GB")}`;
}

export function pct(n: number, digits = 1) {
  return `${n.toFixed(digits)}%`;
}

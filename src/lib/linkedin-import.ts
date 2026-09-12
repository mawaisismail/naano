/**
 * The public-profile import behind step 2 of creator onboarding.
 *
 * naano reads a creator's public LinkedIn profile here — name, photo,
 * headline, country and follower count. We have no LinkedIn API access, so
 * this returns generated data instead, and every screen that displays a figure
 * from it says so. The shape is the one a real import would return, so wiring
 * the API in later means replacing the body of importPublicProfile() and
 * nothing else.
 *
 * The numbers are derived from the profile slug rather than random, so the
 * same URL always imports the same profile: a demo that changes its own
 * follower count on every reload reads as broken rather than as a placeholder.
 */

export type ImportedProfile = {
  handle: string;
  headline: string;
  country: string;
  countryCode: string;
  flag: string;
  followers: number;
  avatarUrl: string;
  /** "demo" until a real import exists — the UI labels itself from this. */
  source: "demo" | "linkedin";
};

const HEADLINES = [
  "Engineering Team Lead | Full Stack — React, Next.js, Node.js | I build and scale high-traffic SaaS",
  "RevOps lead | I write about the pipeline data nobody wants to look at",
  "Founder | Selling B2B software to people who have been sold to before",
  "Head of Growth | Demand generation that survives a CFO review",
  "Staff Engineer | Distributed systems, and the incidents that taught me them",
  "Talent partner | Hiring engineers without wasting anybody's afternoon",
];

const PLACES: [string, string, string][] = [
  ["Pakistan", "PK", "🇵🇰"],
  ["France", "FR", "🇫🇷"],
  ["Germany", "DE", "🇩🇪"],
  ["Netherlands", "NL", "🇳🇱"],
  ["Spain", "ES", "🇪🇸"],
  ["United Kingdom", "GB", "🇬🇧"],
];

/** A LinkedIn profile URL, loosely: we only need the vanity handle from it. */
export function parseLinkedInUrl(raw: string): { ok: boolean; handle: string } {
  const trimmed = raw.trim();
  if (!trimmed) return { ok: false, handle: "" };
  const match = trimmed.match(
    /^(?:https?:\/\/)?(?:[a-z]{2,3}\.)?linkedin\.com\/in\/([A-Za-z0-9\-_%]{3,100})\/?/i
  );
  if (!match) return { ok: false, handle: "" };
  return { ok: true, handle: decodeURIComponent(match[1]).toLowerCase() };
}

function seedFrom(handle: string): number {
  let h = 0;
  for (const ch of handle) h = (h * 31 + ch.charCodeAt(0)) % 1_000_003;
  return h;
}

export function importPublicProfile(url: string): ImportedProfile | null {
  const { ok, handle } = parseLinkedInUrl(url);
  if (!ok) return null;

  const seed = seedFrom(handle);
  const [country, countryCode, flag] = PLACES[seed % PLACES.length];

  // 900–24,000, weighted toward the low thousands, which is where B2B
  // micro-creators actually sit.
  const followers = 900 + (seed % 2300) * 10;

  return {
    handle,
    headline: HEADLINES[seed % HEADLINES.length],
    country,
    countryCode,
    flag,
    followers,
    avatarUrl: `https://api.dicebear.com/9.x/notionists/svg?seed=${encodeURIComponent(handle)}&backgroundColor=e8f0fe,dceaff,f3f4f6`,
    source: "demo",
  };
}

/**
 * The price naano recommends at step 4, from audience size alone.
 *
 * Their copy says it comes "from the public audience and performance
 * information currently available", and at 1,903 followers it recommended
 * €310. That is roughly €100 plus €110 per thousand followers, tapering above
 * 10k where reach stops converting proportionally; this reproduces that curve
 * and rounds to the nearest €10, as theirs does.
 */
export function recommendedPostPrice(followers: number): number {
  const thousands = followers / 1000;
  const base = 100 + thousands * 110;
  const tapered = followers > 10_000 ? 100 + 10 * 110 + (thousands - 10) * 45 : base;
  return Math.max(80, Math.round(tapered / 10) * 10);
}

/** Impressions a post is expected to reach. Unknown until posts are imported. */
export function estimatedImpressions(): null {
  return null;
}

export const INDUSTRIES = [
  "Software", "SaaS", "AI", "Sales", "RevOps", "Marketing", "DevTools",
  "Fintech", "HR-Tech", "Product", "Data", "Security", "E-commerce", "Design",
] as const;

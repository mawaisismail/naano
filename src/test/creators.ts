import type { Creator } from "@/lib/creators";

/**
 * Creator fixtures for tests.
 *
 * These live in the test tree on purpose. The application used to ship a file
 * of invented people and every screen read from it; now creators are rows, and
 * the only place invented ones belong is here, where nothing can render them.
 */
export const creator = (over: Partial<Creator> = {}): Creator => ({
  id: "cr_test",
  slug: "test-creator",
  name: "Test Creator",
  headline: "Writes about revenue operations",
  avatar: "https://example.invalid/avatar.svg",
  country: "France",
  countryCode: "FR",
  flag: "🇫🇷",
  verticals: ["RevOps", "Analytics"],
  bio: "Rebuilds revenue reporting for scaleups. Posts numbers, not adjectives.",
  followers: 8000,
  medianViews: 5000,
  postCost: 160,
  matchScore: 0,
  engagementRate: 2.9,
  reactionsPerPost: 145,
  commentsPerPost: 26,
  icp: ["RevOps leads", "CROs"],
  ...over,
});

/** A small marketplace with distinguishable audiences. */
export const CREATORS: Creator[] = [
  creator({ id: "c1", slug: "revops-rita", name: "Rita Revops" }),
  creator({
    id: "c2",
    slug: "sales-sam",
    name: "Sam Sales",
    headline: "Enterprise AE writing about deals that close",
    bio: "Fifteen years carrying a number.",
    verticals: ["Sales", "GTM"],
    icp: ["AEs", "Sales leaders"],
    followers: 3000,
    countryCode: "DE",
    country: "Germany",
    flag: "🇩🇪",
  }),
  creator({
    id: "c4",
    slug: "devtools-dev",
    name: "Dev Toolman",
    headline: "Ships developer tooling and writes about it",
    bio: "DX and build systems. Opinions from production.",
    verticals: ["DevTools", "Open Source"],
    icp: ["Engineers", "Platform leads"],
    followers: 12000,
    countryCode: "NL",
    country: "Netherlands",
    flag: "🇳🇱",
  }),
  creator({
    id: "c5",
    slug: "hr-hana",
    name: "Hana People",
    headline: "Talent ops for technical orgs",
    bio: "Hiring engineers without wasting anybody's time.",
    verticals: ["HR-Tech", "People Ops"],
    icp: ["Talent partners", "People leads"],
    followers: 20000,
    countryCode: "ES",
    country: "Spain",
    flag: "🇪🇸",
  }),
  creator({
    id: "c3",
    slug: "dentist-dana",
    name: "Dana Dental",
    headline: "Running a dental clinic",
    bio: "Clinic operations and patient scheduling.",
    verticals: ["Healthcare"],
    icp: ["Dentists", "Clinic owners"],
    followers: 1200,
    countryCode: "IE",
    country: "Ireland",
    flag: "🇮🇪",
  }),
];

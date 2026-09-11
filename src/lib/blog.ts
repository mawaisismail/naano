/**
 * The Naano Journal index.
 *
 * Titles, categories and slugs are naano's own, so the listing and every
 * footer link resolve to a real route. The article bodies are theirs and are
 * not reproduced here — the article page says so rather than inventing copy
 * and attributing it to them.
 */
export type Post = {
  slug: string;
  title: string;
  category: string;
  readMins: number;
  date: string;
  excerpt: string;
};

export const CATEGORIES = [
  "CPL economics",
  "LinkedIn micro-creators",
  "Naano vs alternatives",
  "Creator-led growth",
  "LinkedIn algorithm",
  "Founder-led distribution",
] as const;

/**
 * Card art. naano draws no photography on the journal — each card is a two-stop
 * 135deg gradient chosen by category, under a white dotted overlay at 16%.
 * These are their six pairs, read off their cards.
 */
const ART: Record<string, string> = {
  "CPL economics": "linear-gradient(135deg, #22C55E 0%, #0A66C2 100%)",
  "LinkedIn micro-creators": "linear-gradient(135deg, #0A66C2 0%, #22D3EE 100%)",
  "Naano vs alternatives": "linear-gradient(135deg, #111827 0%, #1652F0 100%)",
  "Creator-led growth": "linear-gradient(135deg, #1652F0 0%, #0A66C2 100%)",
  "LinkedIn algorithm": "linear-gradient(135deg, #7C3AED 0%, #0A66C2 100%)",
  "Founder-led distribution": "linear-gradient(135deg, #F59E0B 0%, #1652F0 100%)",
};

export function artFor(category: string) {
  return ART[category] ?? ART["Creator-led growth"];
}

/**
 * naano credits a named author on every card. Ours are this project's own
 * bylines, assigned from the slug so a post keeps the same author on the index,
 * the article page and any related-post rail.
 */
const AUTHORS = ["Alexis Jarre", "Justine Namour", "Thomas Marcelle", "Lea Fontaine"];

export function authorFor(slug: string) {
  let h = 0;
  for (const ch of slug) h = (h * 31 + ch.charCodeAt(0)) % 100000;
  return AUTHORS[h % AUTHORS.length];
}

export const FEATURED: Post = {
  slug: "b2b-creator-campaign-tracking-template",
  title: "B2B Creator Campaign Tracking Template (2026)",
  category: "CPL economics",
  readMins: 8,
  date: "1 Sept 2026",
  excerpt:
    "A practical B2B creator campaign tracking template: UTM naming, per-post records, funnel stages, QA checks and a weekly decision rhythm.",
};

export const POSTS: Post[] = [
  { slug: "linkedin-sponsored-post-usage-rights", title: "LinkedIn Sponsored Post Usage Rights (2026)", category: "LinkedIn micro-creators", readMins: 7, date: "28 Aug 2026", excerpt: "Who owns a sponsored post once it is live, how long a brand may boost it, and what to put in writing before you publish." },
  { slug: "how-to-find-brand-deals-on-linkedin", title: "How to Find Brand Deals on LinkedIn (2026)", category: "LinkedIn micro-creators", readMins: 9, date: "26 Aug 2026", excerpt: "Where B2B brand deals actually come from at 1K to 50K followers, and how to be findable by the teams with budget." },
  { slug: "modash-alternative-b2b-linkedin", title: "Modash Alternative for B2B LinkedIn (2026)", category: "Naano vs alternatives", readMins: 6, date: "22 Aug 2026", excerpt: "Comparing creator discovery tools built for Instagram and TikTok against a marketplace built for B2B LinkedIn." },
  { slug: "ai-search-cites-people-not-brands", title: "AI Search Cites People, Not Your Brand Page (2026)", category: "Creator-led growth", readMins: 8, date: "19 Aug 2026", excerpt: "Why answer engines quote practitioners rather than product pages, and what that means for B2B distribution." },
  { slug: "how-long-b2b-creator-campaign-takes", title: "How Long a B2B Creator Campaign Takes (2026 Data)", category: "CPL economics", readMins: 6, date: "15 Aug 2026", excerpt: "From brief to published post, measured across real bookings: where the days go and which steps you can compress." },
  { slug: "sponsored-post-brief-to-published-playbook", title: "The 7 Days After You Accept a Sponsored Post (2026)", category: "LinkedIn micro-creators", readMins: 7, date: "12 Aug 2026", excerpt: "A day-by-day playbook for creators between accepting a deal and publishing something you are happy to sign." },
  { slug: "naano-vs-passionfroot", title: "Naano vs Passionfroot: LinkedIn creator marketplace or multi-channel creator OS?", category: "Naano vs alternatives", readMins: 9, date: "8 Aug 2026", excerpt: "Two different bets on how creator deals get run, and which one fits a B2B team buying LinkedIn posts." },
  { slug: "b2b-creator-campaigns-europe-answers", title: "B2B creator campaigns in Europe: 15 answers (2026)", category: "Naano vs alternatives", readMins: 11, date: "5 Aug 2026", excerpt: "VAT, contracts, languages and payment rails: the questions European B2B teams ask before their first campaign." },
  { slug: "linkedin-creator-discount-trap", title: "The discount trap for LinkedIn creators (2026)", category: "LinkedIn micro-creators", readMins: 5, date: "1 Aug 2026", excerpt: "Why cutting your rate to win a first deal costs more than the deal is worth, with the numbers." },
  { slug: "linkedin-sponsored-post-price-index-2026", title: "LinkedIn sponsored post price index 2026", category: "CPL economics", readMins: 10, date: "28 Jul 2026", excerpt: "What brands actually paid per sponsored post by follower band, from real transacted bookings." },
  { slug: "how-much-charge-sponsored-linkedin-post", title: "How much to charge for a sponsored LinkedIn post (2026)", category: "LinkedIn micro-creators", readMins: 8, date: "24 Jul 2026", excerpt: "A rate-setting method that survives a negotiation: audience fit, engagement quality and delivery effort." },
  { slug: "how-to-choose-b2b-influencer-marketing-platform", title: "How to choose a B2B influencer marketing platform (2026)", category: "Naano vs alternatives", readMins: 9, date: "21 Jul 2026", excerpt: "The five questions that separate a creator database from something that can actually run a campaign." },
  { slug: "linkedin-engagement-rate-benchmarks", title: "LinkedIn Engagement Rate Benchmarks 2026 (By Follower Count)", category: "LinkedIn micro-creators", readMins: 6, date: "17 Jul 2026", excerpt: "What a healthy engagement rate looks like at every audience size, and why the small accounts win on ratio." },
  { slug: "b2b-influencer-marketing-cost", title: "How much does B2B influencer marketing cost in 2026?", category: "CPL economics", readMins: 8, date: "14 Jul 2026", excerpt: "Budget ranges for a first campaign, and the cost per published post once no-shows are priced in." },
  { slug: "launch-a-linkedin-creator-campaign", title: "How to launch your first LinkedIn creator campaign in 30 days", category: "Creator-led growth", readMins: 10, date: "10 Jul 2026", excerpt: "A four-week plan from shortlist to attributed pipeline, with what to cut if you only have two." },
  { slug: "what-is-a-b2b-creator-marketplace", title: "What is a B2B creator marketplace?", category: "Creator-led growth", readMins: 5, date: "7 Jul 2026", excerpt: "The difference between a directory, an agency and a marketplace, and why it changes what you pay for." },
  { slug: "how-to-find-b2b-creators-on-linkedin", title: "How to find B2B creators on LinkedIn", category: "Creator-led growth", readMins: 7, date: "3 Jul 2026", excerpt: "Search patterns and signals that surface practitioners your buyers already read." },
  { slug: "best-b2b-creator-marketplaces", title: "Best B2B creator marketplaces in 2026 (ranked)", category: "Naano vs alternatives", readMins: 12, date: "30 Jun 2026", excerpt: "A ranked comparison on coverage, pricing transparency, attribution and payout handling." },
  { slug: "best-b2b-influencer-platforms", title: "Best B2B influencer platforms 2026", category: "Naano vs alternatives", readMins: 11, date: "26 Jun 2026", excerpt: "Which platforms are built for B2B buying committees rather than consumer reach." },
  { slug: "linkedin-creator-marketplace", title: "LinkedIn creator marketplace", category: "Creator-led growth", readMins: 6, date: "23 Jun 2026", excerpt: "How a marketplace for LinkedIn creators works, from shortlist to payout." },
  { slug: "linkedin-creator-marketplace-europe", title: "LinkedIn Creator Marketplace in Europe", category: "Creator-led growth", readMins: 7, date: "19 Jun 2026", excerpt: "Country coverage, languages and the practicalities of paying creators across the EU." },
  { slug: "how-to-pay-b2b-creators", title: "How to pay B2B creators", category: "CPL economics", readMins: 6, date: "16 Jun 2026", excerpt: "Invoices, VAT and payout timing, and why paying fast is the cheapest reputation you can buy." },
  { slug: "creator-marketplace-explained", title: "Creator Marketplace explained", category: "Creator-led growth", readMins: 5, date: "12 Jun 2026", excerpt: "The mechanics, in plain terms: listing, booking, briefing, publishing, tracking, paying." },
  { slug: "creator-led-growth-for-b2b", title: "Creator-led growth for B2B", category: "Creator-led growth", readMins: 9, date: "9 Jun 2026", excerpt: "Why borrowed trust outperforms bought impressions, and how to build it into a quarterly plan." },
  { slug: "linkedin-ads-vs-creator-led-cpl", title: "LinkedIn Ads vs creator-led CPL", category: "CPL economics", readMins: 8, date: "5 Jun 2026", excerpt: "A like-for-like cost per lead comparison, and where each channel genuinely wins." },
  { slug: "nano-vs-macro-creators-in-b2b", title: "Nano vs macro creators in B2B", category: "LinkedIn micro-creators", readMins: 7, date: "2 Jun 2026", excerpt: "Reach is not the same as relevance: what the click-through data says about audience size." },
  { slug: "b2b-influence-on-linkedin", title: "B2B influence on LinkedIn", category: "Creator-led growth", readMins: 6, date: "29 May 2026", excerpt: "What influence looks like when the audience is a buying committee rather than a consumer." },
  { slug: "founder-led-distribution-for-saas", title: "Founder-led distribution for SaaS", category: "Creator-led growth", readMins: 8, date: "26 May 2026", excerpt: "When the founder is the channel, and how to hand it over without losing the voice." },
  { slug: "naano-vs-alternatives", title: "Naano vs alternatives", category: "Naano vs alternatives", readMins: 9, date: "22 May 2026", excerpt: "An honest look at where Naano fits against agencies, databases and doing it by hand." },
];

export const ALL_POSTS: Post[] = [FEATURED, ...POSTS];

export function findPost(slug: string): Post | undefined {
  return ALL_POSTS.find((p) => p.slug === slug);
}

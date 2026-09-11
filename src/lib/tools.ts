/**
 * The five free tools naano lists on /free-tools, with the copy and ordering
 * taken from their page. Each one is implemented in this project under
 * /free-tools/<slug>; naano's own first card points at their logged-in
 * selection flow, ours points at the request form we build instead.
 */

export type Tool = {
  slug: string;
  icon: "user-search" | "calculator" | "trending-up" | "target" | "chart-pie";
  title: string;
  lead: string;
  body: string;
  chip: string;
  meta: string;
};

export const TOOLS: Tool[] = [
  {
    slug: "linkedin-creator-search",
    icon: "user-search",
    title: "Free LinkedIn creator search",
    lead: "Get a hand-picked creator shortlist in 48 hours",
    body: "Describe the campaign you want to launch and a real person at Naano finds every LinkedIn creator genuinely worth contacting — inside the Naano marketplace and across the wider LinkedIn ecosystem. You get names, pricing, and audience fit within 48 hours. Free, no account required, no commitment.",
    chip: "Hand-picked by a real human, not an algorithm",
    meta: "Free · 48h turnaround · No account needed",
  },
  {
    slug: "linkedin-creator-worth-calculator",
    icon: "calculator",
    title: "LinkedIn Creator Worth Calculator",
    lead: "Find out what a sponsored post from any creator should cost",
    body: "Enter a LinkedIn creator's follower count, average reactions and comments, and their niche, and get an instant flat-fee estimate of what one sponsored post is worth — plus their engagement rating against B2B benchmarks. Built for creators setting their rate and for companies budgeting a campaign. Free, no account required.",
    chip: "Benchmarked against B2B engagement tiers",
    meta: "Free · Instant result · No account needed",
  },
  {
    slug: "linkedin-engagement-rate-calculator",
    icon: "trending-up",
    title: "LinkedIn Engagement Rate Calculator",
    lead: "Calculate your engagement rate and compare it to 2026 benchmarks",
    body: "Enter your follower count and your average reactions, comments and reposts per post, and get your LinkedIn engagement rate two ways — by followers and by impressions — rated against 2026 B2B benchmarks for your audience size, with concrete tips to improve it. Free, no account required.",
    chip: "Rated against 2026 B2B benchmarks",
    meta: "Free · Instant result · No account needed",
  },
  {
    slug: "sponsored-post-delivery-odds-estimator",
    icon: "target",
    title: "Sponsored Post Delivery Odds Estimator",
    lead: "See how often offers at your price actually get published",
    body: "Enter what you plan to offer a LinkedIn creator per post and see how often real bookings at that price ended in a published post, how often creators simply never answered, and what brands actually paid at that audience size. Built on 239 real sponsored-post bookings from the Naano marketplace, not rules of thumb. Free, no account required.",
    chip: "Built on 239 real bookings",
    meta: "Free · Built on 239 real bookings · No account needed",
  },
  {
    slug: "creator-campaign-budget-planner",
    icon: "chart-pie",
    title: "Creator Campaign Budget Planner",
    lead: "Turn a budget into published posts, not just booked ones",
    body: "Enter your campaign budget and see how many sponsored LinkedIn posts it books at real transacted medians — then how many of those historically ended in a published post, and what that makes the true cost per published post. Built on 239 real sponsored-post bookings from the Naano marketplace. Free, no account required.",
    chip: "Plans on published posts, not booked ones",
    meta: "Free · Built on 239 real bookings · No account needed",
  },
];

export function findTool(slug: string): Tool | undefined {
  return TOOLS.find((t) => t.slug === slug);
}

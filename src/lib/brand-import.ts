/**
 * The website read behind step 1 of brand onboarding.
 *
 * naano fetches the brand's site and derives a value proposition and three
 * ICPs from it. We have no crawler and no model to summarise with, so this
 * generates them from the domain instead. Every screen that shows the result
 * says so, and the shape is what a real read would return, so replacing the
 * body of readBrandSite() is the whole of the swap.
 */

export type BrandRead = {
  company: string;
  domain: string;
  valueProp: string;
  icps: { title: string; description: string }[];
  source: "demo" | "crawler";
};

/** Accepts what people actually type: bare domains, no scheme, trailing paths. */
export function normaliseSiteUrl(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  const withScheme = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  try {
    const url = new URL(withScheme);
    // A hostname with no dot is a typo, not a site.
    if (!url.hostname.includes(".")) return null;
    return url.origin;
  } catch {
    return null;
  }
}

const titleCase = (s: string) =>
  s.replace(/(^|[-_ ])([a-z])/g, (_, sep, ch) => sep.replace(/[-_]/g, "") + ch.toUpperCase());

/** The company name a site would most likely present, from its domain. */
export function companyFromUrl(origin: string): string {
  const host = new URL(origin).hostname.replace(/^www\./, "");
  return titleCase(host.split(".")[0]);
}

const ICP_SETS: { title: string; description: string }[][] = [
  [
    { title: "Full-Stack Developer at Early-Stage SaaS", description: "A developer at a lean startup (10–50 people) who wears multiple hats and picks the tools the team ends up standardising on." },
    { title: "Engineering Team Lead at Growth-Stage SaaS", description: "A technical leader managing 5–15 engineers at a scaling SaaS, responsible for the workflows the team lives in every day." },
    { title: "DevOps Engineer at Mid-Market Tech Company", description: "A DevOps or platform engineer responsible for infrastructure, deployment and the reliability of everything shipped around it." },
  ],
  [
    { title: "RevOps Lead at Series B SaaS", description: "Owns the reporting stack and is the first person asked why two dashboards disagree." },
    { title: "Head of Demand Generation", description: "Buys pipeline, defends the spend quarterly, and needs attribution that survives a CFO review." },
    { title: "VP Sales at Mid-Market SaaS", description: "Carries the number, and cares about tooling exactly as far as it shortens the cycle." },
  ],
  [
    { title: "Head of People at Scaling Startup", description: "Hiring across functions with no dedicated ops support, and buys anything that removes a spreadsheet." },
    { title: "Talent Partner at Tech Scale-up", description: "Runs the pipeline end to end and is measured on time-to-hire." },
    { title: "Finance Lead at Remote-First Company", description: "Pays people across borders and owns the compliance risk when that goes wrong." },
  ],
];

function seedFrom(s: string): number {
  let h = 0;
  for (const ch of s) h = (h * 31 + ch.charCodeAt(0)) % 1_000_003;
  return h;
}

export function readBrandSite(url: string): BrandRead | null {
  const origin = normaliseSiteUrl(url);
  if (!origin) return null;

  const company = companyFromUrl(origin);
  const icps = ICP_SETS[seedFrom(company) % ICP_SETS.length];

  return {
    company,
    domain: new URL(origin).hostname.replace(/^www\./, ""),
    valueProp:
      `${company} is a browser-based productivity suite that provides developers and technical ` +
      `teams with instant access to essential utilities and tools without leaving their workflow. ` +
      `The platform offers a curated collection of converters, formatters, validators, and code ` +
      `generators designed to accelerate common development tasks. Teams adopt it because it ` +
      `removes the tab-switching and the half-trusted online tools that usually fill those gaps.`,
    icps,
    source: "demo",
  };
}

/** The four lines naano ticks through while it reads a site. */
export const READ_STEPS = [
  "Reading your website…",
  "Extracting product signals…",
  "Identifying your ICP…",
  "Preparing your brand profile…",
] as const;

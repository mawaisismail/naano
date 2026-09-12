/**
 * The website read behind step 1 of brand onboarding.
 *
 * This is a real read: Exa extracts the site (and an about or pricing subpage,
 * because a homepage rarely states who the product is FOR), and a model turns
 * that into a value proposition and three ideal customer profiles. The result
 * is labelled `source: "crawler"`, and the UI's demo note disappears on its
 * own — it renders from that field, not from a hardcoded string.
 *
 * When either service is unconfigured, slow or down, the generated version
 * from the domain is returned instead, labelled `source: "demo"`. A brand
 * mid-signup must not be blocked by a third party being unreachable, and
 * pretending the generated text was read from the site would be worse than
 * saying it was not.
 */

import { readSiteContents } from "@/lib/ai/exa";
import { generateJson } from "@/lib/ai/cloudflare";

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

export function generatedBrandRead(url: string): BrandRead | null {
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

/* --------------------------------------------------------------- real --- */

/** What the model is asked to return. Enforced by the provider, not by hope. */
const BRAND_SCHEMA = {
  type: "object",
  properties: {
    company: { type: "string" },
    valueProp: { type: "string" },
    icps: {
      type: "array",
      items: {
        type: "object",
        properties: {
          title: { type: "string" },
          description: { type: "string" },
        },
        required: ["title", "description"],
      },
    },
  },
  required: ["company", "valueProp", "icps"],
} as const;

const SYSTEM = [
  "You characterise B2B companies for a LinkedIn creator marketplace.",
  "You are given text extracted from a company's own website.",
  "Write only what the text supports. Never invent funding, customers, headcount or claims.",
  "The value proposition is 4 to 6 sentences: what the company does, for whom, and why teams adopt it.",
  "Each ICP is a job title or role that would buy this, with one or two sentences on their situation.",
  "Return exactly three ICPs, ordered by how central they are to the business.",
].join(" ");

/**
 * Read the site for real, or fall back to the generated version.
 *
 * Never throws and never returns nothing for a valid URL: the wizard step
 * after this one has to have something to show.
 */
export async function readBrandSite(url: string): Promise<BrandRead | null> {
  const fallback = generatedBrandRead(url);
  const origin = normaliseSiteUrl(url);
  if (!origin || !fallback) return null;

  // Both providers catch their own failures, but a throw from either — a bug,
  // an unsupported API in some runtime — would take down a sign-up. The point
  // of the fallback is that nothing here can do that.
  const pages = await readSiteContents(origin).catch(() => null);
  if (!pages) return fallback;

  // Label each excerpt with the page it came from: the model does better when
  // it can tell a pricing page from a landing page.
  const corpus = pages
    .map((p) => `--- ${p.title ?? p.url} (${p.url}) ---\n${p.text}`)
    .join("\n\n")
    .slice(0, 12_000);

  const drafted = await generateJson<{
    company?: string;
    valueProp?: string;
    icps?: { title?: string; description?: string }[];
  }>({
    system: SYSTEM,
    prompt: `Website content for ${origin}:\n\n${corpus}`,
    schema: BRAND_SCHEMA,
  }).catch(() => null);

  const icps = (drafted?.icps ?? [])
    .filter((i) => i?.title?.trim() && i?.description?.trim())
    .slice(0, 3)
    .map((i) => ({ title: i.title!.trim(), description: i.description!.trim() }));

  // A model that answered but said nothing usable is a failed read, not a
  // result worth showing. Anything short of the full shape falls back.
  if (!drafted?.valueProp?.trim() || icps.length < 3) return fallback;

  return {
    company: drafted.company?.trim() || fallback.company,
    domain: fallback.domain,
    valueProp: drafted.valueProp.trim(),
    icps,
    source: "crawler",
  };
}

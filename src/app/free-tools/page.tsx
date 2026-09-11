import type { Metadata } from "next";
import Link from "next/link";
import { DocsNav } from "@/components/site/DocsNav";
import { DocsFooter } from "@/components/site/DocsFooter";
import { TOOLS } from "@/lib/tools";

/**
 * /free-tools — rebuilt from naano's page rather than approximated.
 *
 * Their page is not inside the 1672 design frame the landing page uses: the
 * document is 4503 tall at both 1440 and 1672, so everything here is plain
 * responsive CSS at zoom 1. Measured at 1440:
 *
 *   hero     section padding 144 0 64 (h 523), inner max-w-900 px-24
 *            pill  h 40, px 16, radius full, 1px #E4E1DC on white, 13/500
 *            h1    60 / 63 / 600 / -2.4px, #17181C, blue full stop
 *            lead  19 / 30.875, #55575E, max-w-640, centred
 *   tools    section pb 80 (h 1312), inner max-w-1200 px-24,
 *            grid 3 x 368 gap 20, card p 28, radius 18, 1px #ECEAE6
 *            icon  44 square, radius 12, #E8F0FE on #1652F0
 *            badge 11/16.5/600 uppercase .1em, 1px #E4E1DC
 *            h2    20 / 27.5 / 600 / -0.02em          (mt 20)
 *            lead  15 / 22.5 / 500 / #1652F0          (mt 6)
 *            body  15 / 24.375 / #55575E              (mt 12)
 *            chip  12 / 18 / 500 on #FAFAF9, 1px #ECEAE6, px 12 py 6 (mt 20)
 *            meta  13 / 19.5 / #6B6D74                (mt 12)
 *            cta   15 / 22.5 / 600, 1px top #F1EFEA, pt 20 (mt 20)
 *   faq      border-t #ECEAE6, py 80, inner max-w-820 px-24
 *            h2 38 / 45.6 / 600; row border-t, py 28;
 *            h3 18 / 27 / 500; p 16 / 26.4, max-w-680, mt 12
 *   reads    same frame, h2 30 / 36 / 600, rows divide-y, py 14, 16/24/500
 *
 * The five tools themselves are built in this project under /free-tools/<slug>.
 */

export const metadata: Metadata = {
  title: "Free Tools for B2B Creator Marketing — Naano",
  description:
    "Practical tools for teams running LinkedIn creator campaigns. No account, no payment method, no commitment.",
};

const TOOL_FAQS: [string, string][] = [
  [
    "Are Naano's free tools really free?",
    "Yes. The free LinkedIn creator search costs nothing, requires no account and no payment method, and carries no obligation to book anything afterwards. You keep the shortlist whether or not you run a campaign with Naano.",
  ],
  [
    "What is the free LinkedIn creator search?",
    "You describe your campaign — your product, your audience, and your budget — and a member of the Naano team manually builds a shortlist of LinkedIn creators whose audience genuinely overlaps your buyer. Each profile comes with pricing, audience fit, and the reason it belongs in your campaign. It is delivered within 48 hours.",
  ],
  [
    "Do I have to run my campaign on Naano to use the tools?",
    "No. The shortlist is yours to use however you want, including contacting the creators directly yourself. Naano's bet is that booking, briefing, paying, and tracking those creators in one place is easier than doing it by hand — but that is your decision to make after you see the list.",
  ],
];

const READS: [string, string][] = [
  ["How to find B2B creators on LinkedIn", "/blog/how-to-find-b2b-creators-on-linkedin"],
  ["Best B2B creator marketplaces in 2026 (ranked)", "/blog/best-b2b-creator-marketplaces"],
  ["What is a B2B creator marketplace?", "/blog/what-is-a-b2b-creator-marketplace"],
  ["How to launch your first LinkedIn creator campaign in 30 days", "/blog/launch-a-linkedin-creator-campaign"],
  ["How much does B2B influencer marketing cost in 2026?", "/blog/b2b-influencer-marketing-cost"],
];

export default function FreeToolsPage() {
  return (
    <div className="nn-doc bg-white">
      <DocsNav />

      {/* ------------------------------------------------------------ hero */}
      <section className="relative overflow-hidden pb-12 pt-28 sm:pb-16 sm:pt-36">
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(640px 320px at 50% -120px, rgba(22,82,240,0.08), rgba(0,0,0,0) 70%)",
          }}
        />
        <div className="relative mx-auto max-w-[900px] px-6 text-center">
          <span className="inline-flex min-h-10 items-center gap-2 rounded-full border border-[#E4E1DC] bg-white px-4 py-2 text-[13px] font-medium text-[#55575E] shadow-[0_1px_2px_rgba(23,24,28,0.04)]">
            <SparklesIcon className="size-[14px] text-[#1652F0]" />
            Free tools by Naano
          </span>
          <h1 className="mt-8 text-4xl font-semibold leading-[1.05] tracking-[-0.04em] text-[#17181C] sm:text-5xl lg:text-[60px]">
            Free tools for B2B creator marketing
            <span className="text-[#1652F0]">.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-[640px] text-[19px] leading-[1.625] text-[#55575E]">
            Practical tools for teams running LinkedIn creator campaigns. No
            account, no payment method, no commitment — start with the one below.
          </p>
        </div>
      </section>

      {/* ----------------------------------------------------------- tools */}
      <section className="pb-16 sm:pb-20">
        <div className="mx-auto max-w-[1200px] px-6">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {TOOLS.map((tool) => (
              <Link
                key={tool.slug}
                href={`/free-tools/${tool.slug}`}
                className="group flex flex-col rounded-[18px] border border-[#ECEAE6] bg-white p-7 transition-colors duration-150 hover:border-[#D8D5CF]"
              >
                <div className="flex items-start justify-between gap-4">
                  <span className="flex size-11 shrink-0 items-center justify-center rounded-[14px] bg-[#E8F0FE] text-[#1652F0]">
                    <ToolIcon name={tool.icon} />
                  </span>
                  <span className="inline-flex items-center rounded-full border border-[#E4E1DC] bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.1em] text-[#55575E]">
                    Free
                  </span>
                </div>
                <h2 className="mt-5 text-[20px] font-semibold leading-[27.5px] tracking-[-0.02em] text-[#17181C]">
                  {tool.title}
                </h2>
                <p className="mt-1.5 text-[15px] font-medium text-[#1652F0]">{tool.lead}</p>
                <p className="mt-3 flex-1 text-[15px] leading-relaxed text-[#55575E]">
                  {tool.body}
                </p>
                <span className="mt-5 inline-flex self-start rounded-full border border-[#ECEAE6] bg-[#FAFAF9] px-3 py-1.5 text-[12px] font-medium text-[#55575E]">
                  {tool.chip}
                </span>
                <span className="mt-3 text-[13px] text-[#6B6D74]">{tool.meta}</span>
                <span className="mt-5 inline-flex items-center gap-2 border-t border-[#F1EFEA] pt-5 text-[15px] font-semibold text-[#17181C] transition-colors group-hover:text-[#1652F0]">
                  Open the tool
                  <ArrowIcon className="size-[15px] transition-transform duration-200 group-hover:translate-x-0.5" />
                </span>
              </Link>
            ))}

            <div className="flex flex-col justify-center rounded-[18px] border border-dashed border-[#E4E1DC] bg-[#FAFAF9] p-7">
              <span className="flex size-11 items-center justify-center rounded-[14px] border border-[#ECEAE6] bg-white text-[#6B6D74]">
                <SparklesIcon className="size-5" />
              </span>
              <h2 className="mt-5 text-[20px] font-semibold leading-[27.5px] tracking-[-0.02em] text-[#17181C]">
                More tools coming
              </h2>
              <p className="mt-3 text-[15px] leading-relaxed text-[#55575E]">
                We ship a new free tool whenever we build something internally that
                B2B teams keep asking us for. In the meantime, the{" "}
                <Link href="/blog" className="font-semibold text-[#1652F0] underline underline-offset-2">
                  blog
                </Link>{" "}
                covers the playbooks.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------- faq */}
      <section className="border-t border-[#ECEAE6] py-16 sm:py-20">
        <div className="mx-auto max-w-[820px] px-6">
          <h2 className="text-3xl font-semibold tracking-[-0.03em] text-[#17181C] sm:text-[38px]">
            Frequently asked questions
            <span className="text-[#1652F0]">.</span>
          </h2>
          <div className="mt-8">
            {TOOL_FAQS.map(([q, a]) => (
              <div key={q} className="border-t border-[#ECEAE6] py-7 first:pt-2">
                <h3 className="text-[18px] font-medium tracking-[-0.015em] text-[#17181C]">{q}</h3>
                <p className="mt-3 max-w-[680px] text-[16px] leading-[1.65] text-[#55575E]">{a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ----------------------------------------------------------- reads */}
      <section className="border-t border-[#ECEAE6] py-16 sm:py-20">
        <div className="mx-auto max-w-[820px] px-6">
          <h2 className="text-2xl font-semibold tracking-[-0.03em] text-[#17181C] sm:text-3xl">
            Keep reading
            <span className="text-[#1652F0]">.</span>
          </h2>
          <ul className="mt-6 divide-y divide-[#ECEAE6]">
            {READS.map(([label, href]) => (
              <li key={href}>
                <Link
                  href={href}
                  className="group flex min-h-11 items-center justify-between gap-4 py-3.5 text-[16px] font-medium text-[#17181C] transition-colors hover:text-[#1652F0]"
                >
                  {label}
                  <ArrowIcon className="size-4 shrink-0 text-[#1652F0] transition-transform duration-200 group-hover:translate-x-0.5" />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <DocsFooter />
    </div>
  );
}

/* --------------------------------------------------------------- icons --
   naano draws these with lucide; the five paths they use are inlined here so
   the page carries no icon dependency. */

function SparklesIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z" />
      <path d="M20 2v4" />
      <path d="M22 4h-4" />
      <circle cx="4" cy="20" r="2" />
    </svg>
  );
}

export function ArrowIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  );
}

function ToolIcon({ name }: { name: string }) {
  const common = {
    viewBox: "0 0 24 24",
    width: 22,
    height: 22,
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };
  if (name === "user-search")
    return (
      <svg {...common}>
        <circle cx="10" cy="7" r="4" />
        <path d="M10.3 15H7a4 4 0 0 0-4 4v2" />
        <circle cx="17" cy="17" r="3" />
        <path d="m21 21-1.9-1.9" />
      </svg>
    );
  if (name === "calculator")
    return (
      <svg {...common}>
        <rect width="16" height="20" x="4" y="2" rx="2" />
        <line x1="8" x2="16" y1="6" y2="6" />
        <line x1="16" x2="16" y1="14" y2="18" />
        <path d="M16 10h.01M12 10h.01M8 10h.01M12 14h.01M8 14h.01M12 18h.01M8 18h.01" />
      </svg>
    );
  if (name === "trending-up")
    return (
      <svg {...common}>
        <path d="M16 7h6v6" />
        <path d="m22 7-8.5 8.5-5-5L2 17" />
      </svg>
    );
  if (name === "target")
    return (
      <svg {...common}>
        <circle cx="12" cy="12" r="10" />
        <circle cx="12" cy="12" r="6" />
        <circle cx="12" cy="12" r="2" />
      </svg>
    );
  return (
    <svg {...common}>
      <path d="M21 12c.552 0 1.005-.449.95-.998a10 10 0 0 0-8.953-8.951c-.55-.055-.998.398-.998.95v8a1 1 0 0 0 1 1z" />
      <path d="M21.21 15.89A10 10 0 1 1 8 2.83" />
    </svg>
  );
}

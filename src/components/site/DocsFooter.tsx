import Link from "next/link";

/**
 * The footer naano uses on their content pages (/free-tools, /blog) — a dark
 * block, not the light cloud footer the landing page carries.
 *
 * Measured on naano.com/free-tools at 1440 (total height 1388):
 *   CTA band   linear-gradient(135deg,#0A2A6B 0%,#1652F0 55%,#2563EB 100%),
 *              padding clamp(48,8vw,80) 24 clamp(56,8vw,96), centred, max 672
 *              kicker 12/16/600 uppercase .14em white 75%
 *              h2 clamp(28,3.4vw,46) / 1.08 / 700 / -.03em white
 *              lead 16/26 white 75%, max 448
 *              buttons h 50, radius 10 — white/ink 15/700, ghost 15/500
 *   link band  #1c1b19, max 1280, padding 64 32 32, 5 columns gap 40
 *              column heading 11/600 uppercase .1em white 35%
 *              link 13px #787774
 *              "NAANO" watermark clamp(80,14vw,180) / 900 / -.05em white 3%
 *   bottom     1px top rule white 6%, padding-top 24, 12px #787774
 */

const SOFT = "#787774";
const HEADING =
  "mb-1 text-[11px] font-semibold uppercase tracking-[0.1em] text-white/35";
const LINK =
  "text-[13px] text-[#787774] transition-colors duration-150 hover:text-white";

const PRODUCT = [
  ["Features", "/#how-it-works"],
  ["Pricing", "/#pricing"],
  ["FAQs", "/#faq"],
  ["Blog", "/blog"],
  ["Free Tools", "/free-tools"],
  ["Benchmarks", "/reports"],
  ["About", "/about"],
] as const;

const COMPANY = [
  ["Help Center", "/help"],
  ["Privacy", "/privacy"],
  ["Terms of Sale & Use", "/terms"],
] as const;

const PRESS = [
  ["Interview Thomas Marcelle — Xymag.tv", "https://www.xymag.tv/"],
  ["Naano on FounderTrace", "https://foundertrace.fr/"],
  ["Naano on TechnicalBeep", "https://technicalbeep.com/"],
] as const;

const RESOURCES = [
  ["Best B2B influencer platforms 2026", "/blog/best-b2b-influencer-platforms"],
  ["Creator-led growth for B2B", "/blog/creator-led-growth-for-b2b"],
  ["B2B influencer marketing cost", "/blog/b2b-influencer-marketing-cost"],
  ["What is a B2B creator marketplace?", "/blog/what-is-a-b2b-creator-marketplace"],
  ["Launch a LinkedIn creator campaign", "/blog/launch-a-linkedin-creator-campaign"],
  ["LinkedIn Creator Marketplace in Europe", "/blog/linkedin-creator-marketplace-europe"],
  ["How to pay B2B creators", "/blog/how-to-pay-b2b-creators"],
  ["Creator Marketplace explained", "/blog/creator-marketplace-explained"],
  ["LinkedIn Ads vs creator-led CPL", "/blog/linkedin-ads-vs-creator-led-cpl"],
  ["Nano vs macro creators in B2B", "/blog/nano-vs-macro-creators-in-b2b"],
  ["B2B influence on LinkedIn", "/blog/b2b-influence-on-linkedin"],
  ["Founder-led distribution for SaaS", "/blog/founder-led-distribution-for-saas"],
  ["Naano vs alternatives", "/blog/naano-vs-passionfroot"],
] as const;

const AGENTS = [
  ["llms.txt", "/llms.txt"],
  ["pricing.md", "/#pricing"],
  ["Reports & data", "/reports"],
] as const;

export function DocsFooter() {
  return (
    <footer className="bg-[#1c1b19]">
      {/* ------------------------------------------------------- CTA band */}
      <div
        className="relative overflow-hidden px-6 py-[clamp(48px,8vw,80px)] pb-[clamp(56px,8vw,96px)]"
        style={{
          background:
            "linear-gradient(135deg, #0A2A6B 0%, #1652F0 55%, #2563EB 100%)",
        }}
      >
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(900px 380px at 50% -140px, rgba(255,255,255,0.16), rgba(0,0,0,0) 70%)",
          }}
        />
        <div className="relative z-10 mx-auto max-w-[672px] text-center">
          <p className="mb-5 text-[12px] font-semibold uppercase leading-4 tracking-[0.14em] text-white/75">
            Get started
          </p>
          <h2 className="mb-5 font-bold leading-[1.08] tracking-[-0.03em] text-white text-[clamp(28px,3.4vw,46px)]">
            Ready to scale with <span>naano</span>?
          </h2>
          <p className="mx-auto mb-10 max-w-[448px] text-[16px] leading-[26px] text-white/75">
            Launch your first campaign in minutes. Top up your wallet and pay per
            post, with tracked clicks on every one.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/register"
              className="inline-flex h-[50px] items-center rounded-[10px] bg-white px-7 text-[15px] font-bold tracking-[-0.01em] text-[#37352f] shadow-[0_8px_30px_rgba(4,18,60,0.28)]"
            >
              Get started
            </Link>
            <Link
              href="/#how-it-works"
              className="inline-flex h-[50px] items-center gap-1.5 rounded-[10px] border border-white/15 px-[22px] text-[15px] font-medium tracking-[-0.01em] text-white"
            >
              See how it works
              <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M5 12h14" />
                <path d="m12 5 7 7-7 7" />
              </svg>
            </Link>
          </div>
          <p className="mt-5 text-[12px] leading-[18px] text-white/60">
            Free to start. No credit card required.
          </p>
        </div>
      </div>

      {/* ------------------------------------------------------ link band */}
      <div className="relative overflow-hidden bg-[#1c1b19]">
        <div
          aria-hidden
          className="pointer-events-none absolute bottom-0 left-1/2 -translate-x-1/2 select-none leading-none"
        >
          <span className="font-black tracking-[-0.05em] text-white opacity-[0.03] text-[clamp(80px,14vw,180px)]">
            NAANO
          </span>
        </div>

        <div className="relative z-10 mx-auto max-w-[1280px] px-6 pb-8 pt-16 sm:px-8">
          <div className="mb-14 grid grid-cols-2 gap-10 md:grid-cols-5">
            <div className="col-span-2 flex flex-col gap-4 md:col-span-1">
              <div className="flex items-center gap-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/lp/naano-logo-nav.png"
                  alt="naano"
                  loading="lazy"
                  className="size-5 object-contain invert"
                />
                <span className="text-base font-bold text-white">naano</span>
              </div>
              <p className="max-w-[220px] text-[13px] leading-relaxed" style={{ color: SOFT }}>
                Turn LinkedIn creators into your best acquisition channel.
              </p>
              <a
                href="https://www.linkedin.com/company/naanooo/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                className="mt-1 inline-flex size-9 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.04] text-white/50 transition-colors hover:text-white"
              >
                <svg viewBox="0 0 24 24" className="size-4" fill="currentColor" aria-hidden>
                  <path d="M4.98 3.5A2.5 2.5 0 1 1 0 3.5a2.5 2.5 0 0 1 4.98 0ZM.24 8.25h4.5V24h-4.5V8.25Zm7.5 0h4.31v2.15h.06c.6-1.14 2.07-2.34 4.26-2.34 4.56 0 5.4 3 5.4 6.9V24h-4.5v-7.9c0-1.88-.03-4.3-2.62-4.3-2.62 0-3.02 2.05-3.02 4.16V24h-4.5V8.25Z" />
                </svg>
              </a>
            </div>

            <FooterColumn title="Product" links={PRODUCT} />
            <FooterColumn title="Company" links={COMPANY} />
            <FooterColumn title="Press" links={PRESS} external />
            <div className="flex flex-col gap-3">
              <p className={HEADING}>Resources</p>
              {RESOURCES.map(([label, href]) => (
                <Link key={label} href={href} className={LINK}>
                  {label}
                </Link>
              ))}
              <p className={`${HEADING} mt-4`}>For AI agents</p>
              {AGENTS.map(([label, href]) => (
                <Link key={label} href={href} className={LINK}>
                  {label}
                </Link>
              ))}
            </div>
          </div>

          <div className="flex flex-col items-center justify-between gap-3 border-t border-white/[0.06] pt-6 sm:flex-row">
            <p className="text-[12px] leading-[18px]" style={{ color: SOFT }}>
              © {new Date().getFullYear()} naano. All rights reserved.
            </p>
            <span className="flex items-center gap-1.5 text-[12px] leading-[18px]" style={{ color: SOFT }}>
              <span aria-hidden className="text-[#00b67a]">★</span>
              Rated on Trustpilot
            </span>
          </div>
        </div>
      </div>

      {/* naano leaves an 80px dark band below the columns */}
      <div className="h-20" />
    </footer>
  );
}

function FooterColumn({
  title,
  links,
  external,
}: {
  title: string;
  links: readonly (readonly [string, string])[];
  external?: boolean;
}) {
  return (
    <div className="flex flex-col gap-3">
      <p className={HEADING}>{title}</p>
      {links.map(([label, href]) =>
        external ? (
          <a key={label} href={href} target="_blank" rel="noopener noreferrer" className={LINK}>
            {label}
          </a>
        ) : (
          <Link key={label} href={href} className={LINK}>
            {label}
          </Link>
        )
      )}
    </div>
  );
}

import Link from "next/link";

/**
 * naano's footer.
 *
 * Authored at 1672 from their computed styles:
 *   footer   1672 x 801.8, padding 290px 83.6px 0, margin-top -10
 *            linear-gradient(#e9f7fc 0%, #edf9fd 48%, #fff 100%) under a
 *            ::before that covers the whole block with the cloud transition
 *            at background-size cover / 50% 100%, inset -1px 0 0 0
 *   columns  1280 wide (margin 0 112.4), padding 34px 0 46px, grid
 *            220.8 / 124.5 / 144.5 / 164.6 / 441.6, gap 46, align start
 *   heading  12px / 700 / 1.92px / #6e7076
 *   link     14.5px / 18.85px / #526875
 *   tagline  15px / 23.25px / #5f737e, 210 wide
 *   social   40x40, radius 11, white 58%, 1px white 84%, glyph #526875
 *   bottom   1280 x 69, padding 22px 0 30px, 1px top rule #5d8ba0/20
 *            © 13.5px #8a8c92, Trustpilot 13.5px #526875, gap 8
 *
 * The 300px "naano" watermark in their markup is display:none, so it is not
 * reproduced here.
 */

const HEADING =
  "text-[12px] font-bold leading-[15px] tracking-[1.92px] text-[#6e7076]";
const LINK =
  "text-[14.5px] leading-[18.85px] text-[#526875] transition hover:text-ink";

const PRODUCT = [
  ["Features", "/#how-it-works"],
  ["Pricing", "/#pricing"],
  ["FAQs", "/#faq"],
  ["Blog", "/blog"],
  ["Reports & benchmarks", "/reports"],
  ["About", "/about"],
] as const;

const COMPANY = [
  ["Help Center", "/help"],
  ["Privacy", "/privacy"],
  ["Terms of Sale & Use", "/terms"],
] as const;

const AGENTS = [
  ["llms.txt", "/llms.txt"],
  ["pricing.md", "/#pricing"],
  ["Reports & data", "/reports"],
] as const;

const PRESS = [
  ["Interview Thomas Marcelle, Xymag.tv", "https://www.xymag.tv/"],
  ["Naano on FounderTrace", "https://foundertrace.fr/"],
  ["Naano on TechnicalBeep", "https://technicalbeep.com/"],
] as const;

const RESOURCES = [
  ["LinkedIn creator marketplace", "/blog/linkedin-creator-marketplace"],
  ["Best B2B influencer platforms 2026", "/blog/best-b2b-influencer-platforms"],
  ["B2B influencer marketing cost", "/blog/b2b-influencer-marketing-cost"],
  ["Launch a LinkedIn creator campaign", "/blog/launch-a-linkedin-creator-campaign"],
  ["LinkedIn Creator Marketplace in Europe", "/blog/linkedin-creator-marketplace-europe"],
  ["How to pay B2B creators", "/blog/how-to-pay-b2b-creators"],
  ["Creator Marketplace explained", "/blog/creator-marketplace-explained"],
  ["What is a B2B creator marketplace?", "/blog/what-is-a-b2b-creator-marketplace"],
  ["Creator-led growth for B2B", "/blog/creator-led-growth-for-b2b"],
  ["LinkedIn Ads vs creator-led CPL", "/blog/linkedin-ads-vs-creator-led-cpl"],
  ["Nano vs macro creators in B2B", "/blog/nano-vs-macro-creators-in-b2b"],
  ["B2B influence on LinkedIn", "/blog/b2b-influence-on-linkedin"],
  ["Founder-led distribution for SaaS", "/blog/founder-led-distribution-for-saas"],
  ["Naano vs alternatives", "/blog/naano-vs-alternatives"],
] as const;

export function Footer({
  tagline = "Turn LinkedIn creators into your best acquisition channel.",
}: { tagline?: string } = {}) {
  return (
    <footer
      className="relative -mt-[10px] overflow-hidden px-5 pt-[120px] lg:px-[83.6px] lg:pt-[290px]"
      style={{
        // naano's own two layers: the gradient sits under the cloud plate, and
        // the outward glow is what dissolves the booking block into the footer
        // rather than leaving a seam between the two.
        backgroundImage:
          "linear-gradient(#e9f7fc 0%, #edf9fd 48%, #ffffff 100%)",
        boxShadow: "0 -54px 96px 44px rgba(233, 247, 252, 0.96)",
      }}
    >
      <span
        aria-hidden
        className="absolute inset-x-0 bottom-0 top-[-1px] -z-10 bg-[url('/lp/footer-cloud-transition.jpg')] bg-cover bg-[50%_100%]"
        style={{
          backgroundColor: "#edf9fd",
        }}
      />

      <div className="mx-auto grid w-full max-w-[1280px] grid-cols-1 items-start gap-10 pb-[46px] pt-[34px] lg:grid-cols-[220.8px_124.5px_144.5px_164.6px_441.6px] lg:gap-[46px]">
        {/* ------------------------------------------------------------ brand */}
        <div className="flex flex-col items-start">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/lp/naano-logo-nav.png"
            alt="naano"
            className="h-[28px] w-[133.72px] object-contain"
          />
          <p className="mt-[22px] w-[210px] text-[15px] leading-[23.25px] text-[#5f737e]">
            {tagline}
          </p>
          <a
            href="https://www.linkedin.com/company/naano"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Naano on LinkedIn"
            className="mt-[26px] flex size-10 items-center justify-center rounded-[11px] border border-white/85 bg-white/[0.58] text-[#526875] transition hover:bg-white/80"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 110-4.125 2.062 2.062 0 010 4.125zM7.119 20.452H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.225 0z" />
            </svg>
          </a>
        </div>

        {/* ---------------------------------------------------------- product */}
        <nav className="flex flex-col gap-[14px]">
          <div className={HEADING}>PRODUCT</div>
          {PRODUCT.map(([label, href]) => (
            <Link key={label} href={href} className={LINK}>
              {label}
            </Link>
          ))}
        </nav>

        {/* ---------------------------------------------------------- company */}
        <nav className="flex flex-col gap-[14px]">
          <div className={HEADING}>COMPANY</div>
          {COMPANY.map(([label, href]) => (
            <Link key={label} href={href} className={LINK}>
              {label}
            </Link>
          ))}
          <div className={`${HEADING} mt-[14px]`}>For AI agents</div>
          {AGENTS.map(([label, href]) => (
            <Link key={label} href={href} className={LINK}>
              {label}
            </Link>
          ))}
        </nav>

        {/* ------------------------------------------------------------ press */}
        <nav className="flex flex-col gap-[14px]">
          <div className={HEADING}>PRESS</div>
          {PRESS.map(([label, href]) => (
            <a key={label} href={href} target="_blank" rel="noopener noreferrer" className={LINK}>
              {label}
            </a>
          ))}
        </nav>

        {/* -------------------------------------------------------- resources */}
        <nav className="grid gap-x-[22px] gap-y-3 lg:grid-cols-[209.8px_209.8px]">
          <div className={`${HEADING} lg:col-span-2`}>RESOURCES</div>
          {RESOURCES.map(([label, href]) => (
            <Link key={label} href={href} className={LINK}>
              {label}
            </Link>
          ))}
        </nav>
      </div>

      {/* ------------------------------------------------------------- bottom */}
      <div className="mx-auto flex w-full max-w-[1280px] flex-wrap items-center justify-between gap-3 border-t border-[rgba(93,139,160,0.2)] pb-[30px] pt-[22px]">
        <span className="text-[13.5px] leading-4 text-[#8a8c92]">
          © 2026 naano. All rights reserved.
          <span className="text-[#a4a6ac]">
            {" · "}Rebuild for a take-home exercise, not affiliated with Naano.
          </span>
        </span>
        <a
          href="https://fr.trustpilot.com/review/www.naano.xyz"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-[13.5px] leading-4 text-[#526875] transition hover:text-ink"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="#00B67A" aria-hidden>
            <path d="M12 2l2.9 6.9 7.1.6-5.4 4.7 1.6 7-6.2-3.7-6.2 3.7 1.6-7L2 9.5l7.1-.6z" />
          </svg>
          Trustpilot reviews
        </a>
      </div>

    </footer>
  );
}

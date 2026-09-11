import Link from "next/link";

/**
 * "Pricing." — naano's two-plan section.
 *
 * Authored at 1672 from their computed styles:
 *   section  1672 x 1166.3, padding 72px 84px 160px, #fcfcfb
 *   head     720 wide (margin 0 622 0 162), h2 56/57.68/600/-2.52
 *            lead 21px/600/-0.315 #17181c mt 26, sub 16/24.8 #8b8d94 mt 12
 *   shell    1180 wide (margin 54px 162px 0), 2 x 569, gap 42, stretch
 *   card     padding 46px 48px 42px, radius 28, white 96%,
 *            1px #b2ccd9/52, 0 30px 72px -50px #2d576e/42
 *   eyebrow  12/700/1.68px
 *   h3       34/39.1/800/-0.85, min-height 78
 *   blurb    15.5/24.025 #55575e, min-height 48
 *   price    46/46/800/-1.38 with a 15px #9b9da3 suffix, baseline, gap 7
 *   rows     padding 16px 0, 1px top rule #eceae6, 15.5/21.7 #26272c
 *   note     34px below, 14px #9b9da3, shield-check glyph
 */

const ARROW = (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <line x1="4" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
);

type Plan = {
  eyebrow: string;
  eyebrowClass: string;
  title: string;
  blurb: string;
  price: string;
  suffix?: string;
  features: string[];
  cta: string;
  href: string;
  solid: boolean;
};

const PLANS: Plan[] = [
  {
    eyebrow: "SELF-SERVE",
    eyebrowClass: "text-[#9b9da3]",
    title: "Run it yourself.",
    blurb:
      "For teams that want the infrastructure to run creator campaigns in-house.",
    price: "€0",
    suffix: "/ month",
    features: [
      "Creator marketplace access",
      "AI-powered brief creation",
      "Track clicks, companies and pipeline",
      "Automatic creator payouts",
    ],
    cta: "Start for free",
    href: "/register",
    solid: false,
  },
  {
    eyebrow: "MANAGED CAMPAIGNS",
    eyebrowClass: "text-[#315b7c]",
    title: "Get your time back.",
    blurb:
      "For teams that want Naano to operate their creator channel end to end.",
    price: "Custom quote",
    features: [
      "Campaign strategy and positioning",
      "Creator sourcing and coordination",
      "Brief creation and campaign launch",
      "Reporting and optimisation",
    ],
    cta: "Book a campaign call",
    href: "/book",
    solid: true,
  },
];

export function PricingSection() {
  return (
    <section
      id="pricing"
      className="relative scroll-mt-20 overflow-x-clip bg-[#fcfcfb] px-5 pb-[100px] pt-[62px] lg:px-[84px] lg:pb-[160px] lg:pt-[72px]"
    >
      <div className="relative z-[2] mx-auto w-full max-w-[1180px]">
        <div className="max-w-[720px]">
          <h2 className="text-[34px] font-semibold leading-[1.08] tracking-[-0.035em] text-[#111318] nn-h2">
            Pricing.
          </h2>
          <p className="mt-[26px] text-[19px] font-semibold leading-[1.25] tracking-[-0.015em] text-[#17181c] lg:text-[21px]">
            Start free. Upgrade when you want your time back.
          </p>
          <p className="mt-3 text-[16px] leading-[24.8px] text-[#8b8d94]">
            Choose whether you want to run creator campaigns in-house or have
            Naano operate them.
          </p>
        </div>

        <div className="relative mx-auto mt-[54px] grid w-full grid-cols-1 items-stretch gap-6 lg:grid-cols-2 lg:gap-[42px]">
          {/* Their card grid carries the cloud bank on ::before / ::after —
              two halves that overlap in the middle, hung 136px below the cards
              and 118px past each side. naano's section is overflow:visible so
              they bleed into the block underneath; clipping them square was
              what made the corners look boxy. Clipped on x only, so the bleed
              survives without giving the page a horizontal scrollbar. */}
          <span
            aria-hidden
            className="pointer-events-none absolute bottom-[-136px] left-[-118px] z-0 hidden h-[390px] w-[731.6px] bg-[url('/lp/cloud-layer-left-v1.png')] bg-contain bg-[50%_100%] bg-no-repeat opacity-[0.86] lg:block"
          />
          <span
            aria-hidden
            className="pointer-events-none absolute bottom-[-136px] right-[-118px] z-0 hidden h-[390px] w-[731.6px] bg-[url('/lp/cloud-layer-right-v1.png')] bg-contain bg-[50%_100%] bg-no-repeat opacity-[0.92] lg:block"
          />
          {PLANS.map((plan) => (
            <div
              key={plan.title}
              className="relative z-[2] flex flex-col rounded-[28px] border border-[rgba(178,204,217,0.52)] bg-white/[0.96] p-7 shadow-[0_30px_72px_-50px_rgba(45,87,110,0.42)] lg:px-12 lg:pb-[42px] lg:pt-[46px]"
            >
              <div className={`text-[12px] font-bold leading-[15px] tracking-[1.68px] ${plan.eyebrowClass}`}>
                {plan.eyebrow}
              </div>
              <h3 className="mt-5 text-[28px] font-extrabold leading-[1.15] tracking-[-0.025em] text-[#17181c] lg:min-h-[78px] lg:text-[34px] lg:leading-[39.1px] lg:tracking-[-0.85px]">
                {plan.title}
              </h3>
              <p className="mt-[14px] text-[15.5px] leading-[24.025px] text-[#55575e] lg:min-h-[48px]">
                {plan.blurb}
              </p>

              <div className="mt-7 flex items-baseline gap-[7px]">
                <span className="text-[38px] font-extrabold leading-none tracking-[-0.03em] text-[#17181c] lg:text-[46px] lg:leading-[46px] lg:tracking-[-1.38px]">
                  {plan.price}
                </span>
                {plan.suffix ? (
                  <span className="text-[15px] leading-[19px] text-[#9b9da3]">{plan.suffix}</span>
                ) : null}
              </div>

              <div className="mt-[34px]">
                {plan.features.map((f) => (
                  <div
                    key={f}
                    className="border-t border-[#eceae6] py-4 text-[15.5px] leading-[21.7px] text-[#26272c]"
                  >
                    {f}
                  </div>
                ))}
              </div>

              {plan.solid ? (
                <Link
                  href={plan.href}
                  className="mt-10 flex w-fit items-center gap-2.5 rounded-[12px] bg-[#17181c] px-7 py-4 text-[16px] font-semibold leading-5 tracking-[-0.16px] text-white transition hover:opacity-90"
                >
                  {plan.cta}
                  {ARROW}
                </Link>
              ) : (
                <Link
                  href={plan.href}
                  className="mt-10 flex w-fit items-center gap-[9px] border-b border-[#17181c] pb-[3px] text-[16px] font-bold leading-6 tracking-[-0.16px] text-[#17181c] transition hover:opacity-70"
                >
                  {plan.cta}
                  {ARROW}
                </Link>
              )}
            </div>
          ))}
        </div>

        <div className="relative z-[2] mt-[34px] flex items-center justify-center gap-[9px] text-[14px] leading-[17px] text-[#9b9da3]">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#9B9DA3" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M12 3 l7 3 v5 c0 4.4 -3 7.5 -7 9 c-4 -1.5 -7 -4.6 -7 -9 V6 Z" />
            <polyline points="9 12 11.2 14.2 15.5 9.6" />
          </svg>
          Campaign spend is separate. No lock-in. Cancel anytime.
        </div>
      </div>
    </section>
  );
}

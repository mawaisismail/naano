"use client";

import Link from "next/link";
import { useState } from "react";

/**
 * "Frequently asked questions." — naano's accordion section.
 *
 * Authored at 1672 from their computed styles:
 *   section  1672 x 1123.1, padding 130px 84px 144px, #fff, overflow hidden
 *   layout   1180 (margin 0 162), grid 360px / 730px, gap 90, space-between
 *   intro    sticky; h2 56/57.68/600/-2.52; lead mt 16, 19/28.5 #55575e;
 *            ask row mt 28, 15px #70747b with a 650-weight link to /book
 *   item     1px top rule — #dfe7eb on the first, #eceae6 after
 *   button   padding 30px 0, radius 14, space-between, gap 24
 *   question 20px / 24px / 500 / -0.3px
 *   answer   padding 0 60px 32px 0, 16.5 / 27.225 / #6b6d74, max-width 680
 *
 * One panel at a time, the first open on load, matching their behaviour.
 * The chevron does not rotate on naano — it swaps to an upward chevron in
 * ink, so that is what happens here too.
 */

export const LANDING_FAQS: [string, string][] = [
  [
    "What is Naano?",
    "Naano is a B2B LinkedIn creator marketplace: companies discover and book vetted creators for sponsored LinkedIn campaigns, each at a fixed price per post set by the creator. The marketplace spans creators from niche voices with around 1,000 followers to established B2B creators with audiences of several hundred thousand.",
  ],
  [
    "How does Naano find the right creators?",
    "Our matching engine scores every creator on audience fit, category relevance and engagement quality across LinkedIn, X and YouTube, so you rank creators by who actually reaches your buyers, not by follower count.",
  ],
  [
    "Which networks do you support?",
    "LinkedIn, X and YouTube today, with more on the way. You can compare creators and track performance across every network in one place.",
  ],
  [
    "How does per-post pricing work?",
    "Campaigns start from €20 per published post, you only pay for posts that go live, with no retainer. Prefer a hands-off setup? Done for you adds our team executing everything end to end.",
  ],
  [
    "How does attribution work?",
    "Naano places a tracking pixel at every stage of the funnel, so each click, lead, pipeline and revenue is tied back to the exact creator and post that drove it.",
  ],
  [
    "Do you handle creator payouts?",
    "Yes. Approve content and pay every creator in one click, securely via Stripe Connect, invoices and approvals are handled for you.",
  ],
  [
    "What's the difference between Free and Done for you?",
    "Free gives your team the platform to source creators and run simple campaigns yourselves. Done for you adds hands-on execution by the Naano team, sourcing, briefs, reporting and optimisation.",
  ],
  [
    "Can I upgrade or cancel anytime?",
    "Absolutely. Plans are month-to-month, you can upgrade, downgrade or cancel whenever you like.",
  ],
];

type Props = {
  items?: [string, string][];
  heading?: string;
  lead?: string;
  id?: string;
  /** naano pads this block differently on the landing page and /creators. */
  padding?: string;
  /**
   * naano uses two arrangements: the landing page splits a sticky 360 intro
   * beside a 730 accordion; /creators stacks a centred heading over an 820
   * accordion with no "still have questions" row.
   */
  layout?: "split" | "stacked";
};

export function FaqSection({
  items = LANDING_FAQS,
  heading = "Frequently asked questions.",
  lead = "Everything you need to know before getting started.",
  id = "faq",
  padding = "px-5 pb-[80px] pt-[72px] lg:px-[84px] lg:pb-[144px] lg:pt-[130px]",
  layout = "split",
}: Props) {
  const stacked = layout === "stacked";
  const [open, setOpen] = useState(0);

  return (
    <section
      id={id}
      className={`relative scroll-mt-20 overflow-hidden bg-white ${padding}`}
    >
      <div
        className={
          stacked
            ? "relative z-[2] w-full"
            : "relative z-[2] mx-auto grid w-full max-w-[1180px] grid-cols-1 justify-between gap-10 lg:grid-cols-[360px_730px] lg:gap-[90px]"
        }
      >
        <div className={stacked ? "text-center" : "lg:sticky lg:top-28 lg:h-fit lg:w-[360px]"}>
          <h2 className="nn-h2 text-[34px] font-semibold leading-[1.08] tracking-[-0.035em] text-[#111318]">
            {heading}
          </h2>
          <p className={`mt-4 text-[17px] text-[#55575e] lg:text-[19px] ${stacked ? "leading-[23px]" : "leading-[26px] lg:leading-[28.5px]"}`}>
            {lead}
          </p>
          {stacked ? null : (
          <div className="mt-7 flex flex-wrap items-center gap-2.5 text-[15px] leading-[19px] text-[#70747b]">
            <span>Still have questions?</span>
            <Link
              href="/book"
              className="flex items-center gap-[7px] font-[650] text-ink transition hover:opacity-70"
            >
              Talk to our team
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <line x1="4" y1="12" x2="20" y2="12" />
                <polyline points="13 5 20 12 13 19" />
              </svg>
            </Link>
          </div>
          )}
        </div>

        <div className={stacked ? "mx-auto mt-[60px] w-full max-w-[820px]" : "lg:w-[730px]"}>
          {items.map(([q, a], i) => {
            const isOpen = open === i;
            return (
              <div
                key={q}
                className={`border-t ${i === 0 ? "border-[#dfe7eb]" : "border-[#eceae6]"}`}
              >
                <button
                  type="button"
                  aria-expanded={isOpen}
                  onClick={() => setOpen(isOpen ? -1 : i)}
                  className="flex w-full items-center justify-between gap-6 rounded-[14px] py-[30px] text-left"
                >
                  <span className="text-[17px] font-medium leading-6 tracking-[-0.3px] text-[#17181c] lg:text-[20px]">
                    {q}
                  </span>
                  <span className="inline-flex size-6 shrink-0 items-center justify-center">
                    {isOpen ? (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#111318" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                        <polyline points="6 15 12 9 18 15" />
                      </svg>
                    ) : (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9B9DA3" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                        <polyline points="6 9 12 15 18 9" />
                      </svg>
                    )}
                  </span>
                </button>
                {isOpen ? (
                  <p className="max-w-[680px] pb-8 pr-0 text-[16.5px] leading-[27.225px] text-[#6b6d74] lg:pr-[60px]">
                    {a}
                  </p>
                ) : null}
              </div>
            );
          })}
          {/* Their shell ends with an empty row so the list closes on a rule. */}
          <div className="border-t border-[#eceae6]" />
        </div>
      </div>
    </section>
  );
}

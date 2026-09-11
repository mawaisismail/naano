import type { Metadata } from "next";
import { ToolPage, ToolSection, ToolFaq, ToolTable, Formula } from "@/components/tools/ToolPage";
import { findTool } from "@/lib/tools";
import { BANDS, DATASET_SIZE, euros } from "@/lib/tool-data";
import { WorthCalculator } from "./Calculator";

const tool = findTool("linkedin-creator-worth-calculator")!;

export const metadata: Metadata = {
  title: "LinkedIn Creator Worth Calculator (Free) — Naano",
  description:
    "Estimate what one sponsored LinkedIn post from any creator should cost, from follower count, engagement and niche.",
};

const FAQS: [string, string][] = [
  [
    "How is the estimate calculated?",
    "It starts from the median flat fee actually listed by creators in this build's marketplace for the follower band you entered, then moves within a 0.6x–1.6x collar depending on how the creator's engagement rate compares to the healthy range for that band, and applies a demand multiplier for the niche.",
  ],
  [
    "Why does engagement move the price more than follower count?",
    "Because follower count is the easiest number to grow and the least predictive of a click. Two creators at 10,000 followers with a 3x gap in engagement deliver very different results from the same post, and buyers who track clicks price that gap.",
  ],
  [
    "Should a creator charge the top of the range?",
    "Charge the top when the audience is narrow and the buyer is exactly your reader. Charge the bottom when the fit is loose. A flat fee published upfront closes faster than a fee that has to be negotiated every time.",
  ],
  [
    "Is this what brands actually pay?",
    "It is what this project's dataset shows. Real prices vary with usage rights, turnaround, exclusivity and whether the brief includes a video. Treat the range as the opening position, not the invoice.",
  ],
];

export default function Page() {
  return (
    <ToolPage
      tool={tool}
      lead="Enter a creator's follower count, per-post averages and niche, and get an instant flat-fee estimate for one sponsored post — plus the engagement rating the estimate is built on."
      sections={
        <>
          <ToolSection
            title="What a sponsored post costs by audience size"
            lead={`Median flat fee per post by follower band, taken from the ${DATASET_SIZE} creators listed in this build's marketplace.`}
          >
            <ToolTable
              head={["Follower tier", "Median fee per post", "What sets the price inside the band"]}
              rows={BANDS.map((b) => [
                b.label,
                b.n > 0 ? euros(b.medianCost) : "—",
                b.n > 0
                  ? `${b.n} creators, median engagement ${b.medianEngagement}%. Engagement above ${b.good[1]}% pulls the fee up; below ${b.good[0]}% pulls it down.`
                  : "No creators in this band in the dataset.",
              ] as [string, string, string])}
            />
            <p className="mt-4 text-[14px] leading-[1.5] text-[#6B6D74]">
              These are this project&apos;s own figures, derived from the
              marketplace data shipped in this repository — not naano.com
              transaction data.
            </p>
          </ToolSection>

          <ToolSection title="How the estimate is built">
            <div className="mt-8 space-y-8">
              <Formula
                title="Engagement quality"
                code="engagement rate / midpoint of the healthy range for the band"
                body="Clamped between 0.6x and 1.6x so one exceptional month cannot triple a rate card. A creator sitting exactly on the benchmark scores 1.0 and gets the band median."
              />
              <Formula
                title="Fee per post"
                code="band median x engagement quality x niche multiplier"
                body="The niche multiplier reflects what B2B buyers in this dataset pay for access to that audience: DevTools and Fintech readers cost more to reach than a general B2B audience of the same size."
              />
            </div>
          </ToolSection>

          <ToolFaq items={FAQS} />
        </>
      }
      cta={{
        darkTitle: "Know what you are worth? List it.",
        darkBody:
          "Publish a flat fee per post, get booked by vetted B2B sponsors, and get paid on publication. No negotiation threads, no chasing invoices.",
        darkCta: ["Start earning", "/register?role=influencer"],
        lightTitle: "Budgeting a campaign?",
        lightBody:
          "Every creator in the marketplace lists their fee per post upfront, with followers, median views and engagement next to it. Compare before you book.",
        lightCta: ["Browse the marketplace", "/marketplace"],
      }}
    >
      <WorthCalculator />
    </ToolPage>
  );
}

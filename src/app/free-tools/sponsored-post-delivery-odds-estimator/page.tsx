import type { Metadata } from "next";
import { ToolPage, ToolSection, ToolFaq, ToolTable, Formula } from "@/components/tools/ToolPage";
import { findTool } from "@/lib/tools";
import { BANDS, DATASET_SIZE, deliveryOdds, euros } from "@/lib/tool-data";
import { OddsCalculator } from "./Calculator";

const tool = findTool("sponsored-post-delivery-odds-estimator")!;

export const metadata: Metadata = {
  title: "Sponsored Post Delivery Odds Estimator (Free) — Naano",
  description:
    "See how often sponsored-post offers at your price actually end in a published LinkedIn post, and what creators at that audience size really charge.",
};

const FAQS: [string, string][] = [
  [
    "Why do so many offers end in silence rather than a no?",
    "Because a low offer is not a negotiation to a creator, it is a signal that the brief will be more work than it is worth. Declining costs them a reply; ignoring costs them nothing. The share that never answers is the clearest thing this estimator shows.",
  ],
  [
    "What is a booked post versus a published post?",
    "Booked means the creator accepted the brief. Published means the post went live. Every budget that plans on booked posts overstates what it will get, which is why the budget planner works from the published number.",
  ],
  [
    "How do I raise the published share without raising the fee?",
    "Narrow the brief. Creators publish faster when the topic is one they were going to write about anyway, the deadline is a week rather than two days, and the usage rights are organic-only.",
  ],
  [
    "Where do these percentages come from?",
    "From this project's own seeded marketplace, not from naano.com. The curve is anchored on the median flat fee each follower band lists here, so the numbers move if the dataset does.",
  ],
];

export default function Page() {
  return (
    <ToolPage
      tool={tool}
      lead="Enter what you plan to offer per post and see how often offers at that price end in a published post, how often creators simply never answer, and what brands actually pay at that audience size."
      sections={
        <>
          <ToolSection
            title="What offers at each price actually deliver"
            lead={`Modelled against the median flat fee in each follower band across the ${DATASET_SIZE} creators listed in this build's marketplace.`}
          >
            <ToolTable
              head={["Offer, relative to the band median", "Published", "What happens to the rest"]}
              rows={([0.5, 0.75, 1, 1.25] as const).map((r) => {
                const band = BANDS[2];
                const odds = deliveryOdds(band.medianCost * r, band);
                return [
                  `${Math.round(r * 100)}% of median (${euros(band.medianCost * r)} in ${band.label.toLowerCase()})`,
                  `${Math.round(odds.published * 100)}%`,
                  `${Math.round(odds.ignored * 100)}% never answer, ${Math.round(odds.declined * 100)}% decline.`,
                ] as [string, string, string];
              })}
            />
            <p className="mt-4 text-[14px] leading-[1.5] text-[#6B6D74]">
              Shown for {BANDS[2].label.toLowerCase()}; the estimator above runs
              the same curve against whichever band you pick.
            </p>
          </ToolSection>

          <ToolSection title="How the odds are modelled">
            <div className="mt-8 space-y-8">
              <Formula
                title="Offer strength"
                code="your offer / median flat fee listed in that follower band"
                body="Everything keys off this one ratio. An offer at the median is a normal booking; at half the median it is a message most creators will not reply to."
              />
              <Formula
                title="Published share"
                code="34% + 42% x min(offer strength, 1.6)"
                body="The curve flattens above the median because past a fair price the blockers stop being money — they are calendar, topic fit and usage rights."
              />
            </div>
          </ToolSection>

          <ToolFaq items={FAQS} />
        </>
      }
      cta={{
        darkTitle: "Stop guessing at the price.",
        darkBody:
          "Every creator in the marketplace publishes a flat fee per post upfront. You see the number before you send the brief, and you pay on publication.",
        darkCta: ["Browse the marketplace", "/marketplace"],
        lightTitle: "Plan the whole budget",
        lightBody:
          "The budget planner turns a total budget into published posts at these same delivery rates, and gives you the true cost per published post.",
        lightCta: ["Open the budget planner", "/free-tools/creator-campaign-budget-planner"],
      }}
    >
      <OddsCalculator />
    </ToolPage>
  );
}

import type { Metadata } from "next";
import { ToolPage, ToolSection, ToolFaq, ToolTable, Formula } from "@/components/tools/ToolPage";
import { findTool } from "@/lib/tools";
import { BANDS, DATASET_SIZE, deliveryOdds, euros } from "@/lib/tool-data";
import { BudgetPlanner } from "./Calculator";

const tool = findTool("creator-campaign-budget-planner")!;

export const metadata: Metadata = {
  title: "Creator Campaign Budget Planner (Free) — Naano",
  description:
    "Turn a campaign budget into published LinkedIn posts at real transacted medians, and see the true cost per published post.",
};

const FAQS: [string, string][] = [
  [
    "Why plan on published posts instead of booked ones?",
    "Because a booking that never goes live buys nothing. Planning on booked posts overstates reach by exactly the share of bookings that stall, which is the difference between a campaign that hits its number and one that quietly misses.",
  ],
  [
    "How many published posts do I need before the data means anything?",
    "Around five. Below that, the gap between your best and worst creator is indistinguishable from the gap between a Tuesday and a Thursday. Five published posts is usually enough to see which audience actually clicks.",
  ],
  [
    "Is it better to book one large creator or several small ones?",
    "Several small ones, if you are buying clicks rather than impressions. Engagement rates are two to four times higher under 5,000 followers, and spreading the budget gives you more than one reading of what works.",
  ],
  [
    "Where do the medians come from?",
    "From the flat fees listed by the creators in this build's marketplace — this project's own data, not naano.com's.",
  ],
];

export default function Page() {
  return (
    <ToolPage
      tool={tool}
      lead="Enter your campaign budget and see how many sponsored posts it books at real medians, how many of those end up published, and what that makes the true cost per published post."
      sections={
        <>
          <ToolSection
            title="What a budget buys at each audience size"
            lead={`Median flat fee and delivery rate per follower band, from the ${DATASET_SIZE} creators listed in this build's marketplace.`}
          >
            <ToolTable
              head={["Follower tier", "Median fee per post", "What €3,000 buys"]}
              rows={BANDS.map((band) => {
                if (band.n === 0) return [band.label, "—", "No creators in this band in the dataset."] as [string, string, string];
                const booked = Math.floor(3000 / band.medianCost);
                const odds = deliveryOdds(band.medianCost, band);
                const published = Math.round(booked * odds.published);
                return [
                  band.label,
                  euros(band.medianCost),
                  `${booked} posts booked, about ${published} published — ${euros(published > 0 ? 3000 / published : 0)} per published post.`,
                ] as [string, string, string];
              })}
            />
          </ToolSection>

          <ToolSection title="How the plan is calculated">
            <div className="mt-8 space-y-8">
              <Formula
                title="Posts booked"
                code="budget / median flat fee in the band"
                body="Rounded down: a budget that covers 4.6 posts books four, because nobody publishes six tenths of a post."
              />
              <Formula
                title="Posts published"
                code="posts booked x published share at the median fee"
                body="The published share comes from the delivery odds curve at an offer equal to the band median — the price at which most bookings go through."
              />
              <Formula
                title="True cost per published post"
                code="budget / posts published"
                body="The only number worth comparing against a LinkedIn Ads CPM, because it counts the money that bought nothing."
              />
            </div>
          </ToolSection>

          <ToolFaq items={FAQS} />
        </>
      }
      cta={{
        darkTitle: "Run the campaign in one place.",
        darkBody:
          "Book, brief, pay and track every creator from one wallet, with click tracking on every post so the cost per published post is measured rather than estimated.",
        darkCta: ["Get started", "/register"],
        lightTitle: "Check the price before you plan",
        lightBody:
          "The delivery odds estimator shows how often offers at your price end in a published post, so the plan above starts from a fee creators will actually accept.",
        lightCta: ["Open the odds estimator", "/free-tools/sponsored-post-delivery-odds-estimator"],
      }}
    >
      <BudgetPlanner />
    </ToolPage>
  );
}

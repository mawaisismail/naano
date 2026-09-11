import type { Metadata } from "next";
import { ToolPage, ToolSection, ToolFaq, ToolTable, Formula } from "@/components/tools/ToolPage";
import { findTool } from "@/lib/tools";
import { BANDS, DATASET_SIZE } from "@/lib/tool-data";
import { EngagementCalculator } from "./Calculator";

const tool = findTool("linkedin-engagement-rate-calculator")!;

export const metadata: Metadata = {
  title: "LinkedIn Engagement Rate Calculator (Free) — Naano",
  description:
    "Calculate your LinkedIn engagement rate by followers and by impressions, and compare it to 2026 B2B benchmarks for your audience size.",
};

const FAQS: [string, string][] = [
  [
    "What is a good engagement rate on LinkedIn in 2026?",
    "It depends on audience size. As a rule of thumb for B2B accounts: under 2,000 followers, 5–8%; 2,000–5,000, 4–6%; 5,000–20,000, 2.5–4%; 20,000–50,000, 1.5–2.5%; above that, 0.8–1.5%. Rates fall as audiences grow because follower counts accumulate dormant accounts faster than they accumulate readers.",
  ],
  [
    "Should I measure engagement rate by followers or by impressions?",
    "Use both. By followers is the comparable number — a sponsor can estimate it from any public profile, so it is what gets quoted. By impressions is the fairer one, because it measures the people who actually saw the post rather than everyone who once clicked follow.",
  ],
  [
    "Why do micro-creators have higher engagement rates than large accounts?",
    "Smaller audiences are denser. A 3,000-follower creator is mostly followed by people who work in their field, so a high share of the audience has a reason to react. At 50,000 the audience is broader, and the same post reaches many people it was never written for.",
  ],
  [
    "How do sponsors use engagement rate to set flat-fee post rates?",
    "On a marketplace each creator sets a flat fee per sponsored post. Engagement rate is how a sponsor sanity-checks it: two creators with the same follower count and a 3x difference in engagement are not worth the same money, and the rate is expected to reflect that.",
  ],
];

export default function Page() {
  return (
    <ToolPage
      tool={tool}
      lead="Type your follower count and per-post averages, get your engagement rate instantly — by followers and by impressions — rated against 2026 B2B benchmarks for your audience size."
      sections={
        <>
          <ToolSection
            title="LinkedIn engagement rate benchmarks for B2B (2026)"
            lead="“Good” is relative to audience size: rates fall as follower counts grow. These ranges are the ones this calculator rates you against."
          >
            <ToolTable
              head={["Follower tier", "Good rate (by followers)", "What it means"]}
              rows={[
                ["Under 2,000 followers", "5% – 8%", "Small, warm audiences engage the most. Anything above 8% is exceptional."],
                ["2,000 – 5,000 followers", "4% – 6%", "The sweet spot for B2B micro-creators: reach, with the audience still intact."],
                ["5,000 – 20,000 followers", "2.5% – 4%", "Rates dilute as the audience broadens beyond the core network."],
                ["20,000 – 50,000 followers", "1.5% – 2.5%", "Large accounts trade engagement depth for raw distribution."],
                ["50,000+ followers", "0.8% – 1.5%", "Reach is the product here; expect depth to come from the comments, not the ratio."],
              ]}
            />
            <p className="mt-4 text-[14px] leading-[1.5] text-[#6B6D74]">
              Above the range for your tier: excellent. Inside it: healthy. Below
              it: below benchmark. Cross-checked against the {DATASET_SIZE}{" "}
              creators listed in this build&apos;s marketplace, whose median
              engagement rate per tier is{" "}
              {BANDS.filter((b) => b.n > 0)
                .map((b) => `${b.medianEngagement}%`)
                .join(" / ")}
              .
            </p>
          </ToolSection>

          <ToolSection title="How the two rates are calculated">
            <div className="mt-8 space-y-8">
              <Formula
                title="Engagement rate by followers"
                code="(reactions + comments + reposts) / followers x 100"
                body="The standard, comparable metric. Averages are taken over your last ~10 posts so a single viral outlier does not distort the result. It is the number sponsors quote because it can be estimated from any public profile."
              />
              <Formula
                title="Engagement rate by impressions"
                code="(reactions + comments + reposts) / impressions x 100"
                body="The fairer metric. Follower counts include dormant accounts and people the algorithm never shows you to, so dividing by the audience that actually saw the post is the more honest reading of how the writing performed."
              />
              <p className="text-[14px] leading-[1.5] text-[#6B6D74]">
                Benchmark ranges are this project&apos;s own, derived from the
                marketplace dataset shipped in this repository — not from
                naano.com transaction data.
              </p>
            </div>
          </ToolSection>

          <ToolFaq items={FAQS} />
        </>
      }
      cta={{
        darkTitle: "Strong engagement rate? Get paid for it.",
        darkBody:
          "Creators here get paid per post by vetted B2B sponsors — you set your own flat rate, from €100 per post. Your engagement rate is exactly what companies are looking for.",
        darkCta: ["Get paid per post", "/register?role=influencer"],
        lightTitle: "Buying attention, not follower counts?",
        lightBody:
          "Browse vetted LinkedIn creators with the engagement rates to prove it. Every creator lists a flat fee per post upfront — no negotiation, no surprises.",
        lightCta: ["Browse vetted creators", "/marketplace"],
      }}
    >
      <EngagementCalculator />
    </ToolPage>
  );
}

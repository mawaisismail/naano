import type { Metadata } from "next";
import { ToolPage, ToolSection, ToolFaq } from "@/components/tools/ToolPage";
import { findTool } from "@/lib/tools";
import { DATASET_SIZE } from "@/lib/tool-data";
import { CreatorSearchForm } from "./RequestForm";

const tool = findTool("linkedin-creator-search")!;

export const metadata: Metadata = {
  title: "Free LinkedIn Creator Search — Naano",
  description:
    "Describe your campaign and get a hand-picked shortlist of LinkedIn creators worth contacting, with pricing and audience fit.",
};

const FAQS: [string, string][] = [
  [
    "What do I actually get?",
    "A shortlist of LinkedIn creators whose audience overlaps your buyer, each with their flat fee per post, their engagement rate and the reason they belong in your campaign. It is yours to use however you like, including contacting the creators yourself.",
  ],
  [
    "What does it cost?",
    "Nothing. No account, no payment method, and no obligation to book anything afterwards.",
  ],
  [
    "How long does it take?",
    "The instant shortlist is immediate. The wider search — creators outside the marketplace — takes up to 48 hours because a person does it.",
  ],
  [
    "Does the shortlist only contain creators from this marketplace?",
    `The instant one does: it matches your brief against the ${DATASET_SIZE} creators listed here. The wider search looks across LinkedIn, including creators who have never listed anywhere.`,
  ],
];

export default function Page() {
  return (
    <ToolPage
      tool={tool}
      h1="Free LinkedIn creator search"
      lead="Describe the campaign you want to launch and get every LinkedIn creator genuinely worth contacting — names, pricing and audience fit. Free, no account, no commitment."
      sections={
        <>
          <ToolSection
            title="How the search works"
            lead="Three steps, none of which need an account."
          >
            <div className="mt-8 space-y-8">
              {[
                ["1. You describe the campaign", "Your product, the job title you are trying to reach, and the budget you have per post. Twenty words is enough; the more specific the buyer, the tighter the shortlist."],
                ["2. You get an instant match", "The brief is matched against every creator listed in this marketplace, filtered by your budget and ranked by audience fit. That list appears the moment you submit."],
                ["3. A person widens it", "Within 48 hours the search extends beyond the marketplace to creators who have never listed anywhere, with pricing for each. Most of the value is in that second pass."],
              ].map(([h, p]) => (
                <div key={h}>
                  <h3 className="text-[18px] font-semibold tracking-[-0.015em] text-[#17181C]">{h}</h3>
                  <p className="mt-3 text-[16px] leading-[1.65] text-[#6B6D74]">{p}</p>
                </div>
              ))}
              <p className="text-[14px] leading-[1.5] text-[#6B6D74]">
                This is a portfolio build: the form runs entirely in your browser,
                sends nothing, and stores nothing.
              </p>
            </div>
          </ToolSection>

          <ToolFaq items={FAQS} />
        </>
      }
      cta={{
        darkTitle: "Skip the shortlist, browse it yourself.",
        darkBody:
          "Every creator in the marketplace publishes followers, median views, engagement and a flat fee per post. Filter by vertical and book directly.",
        darkCta: ["Browse the marketplace", "/marketplace"],
        lightTitle: "Price the campaign first",
        lightBody:
          "The budget planner turns a total budget into published posts at the medians creators here actually list, with the true cost per published post.",
        lightCta: ["Open the budget planner", "/free-tools/creator-campaign-budget-planner"],
      }}
    >
      <CreatorSearchForm />
    </ToolPage>
  );
}

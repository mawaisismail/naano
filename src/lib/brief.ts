import type { Creator } from "@/lib/creators";

export const OBJECTIVES = [
  { id: "trials", label: "Start trials", verb: "start a trial" },
  { id: "demos", label: "Book demos", verb: "book a demo" },
  { id: "awareness", label: "Build awareness", verb: "follow the launch" },
  { id: "hiring", label: "Attract candidates", verb: "look at the open roles" },
] as const;

export type ObjectiveId = (typeof OBJECTIVES)[number]["id"];

export type BriefInput = {
  company: string;
  product: string;
  objective: ObjectiveId;
  creators: Creator[];
};

/**
 * Drafts a campaign brief from the campaign inputs and the creators actually
 * selected — their verticals and inferred ICP shape the messaging and the
 * guidelines, so booking a devtools creator and a HR-tech creator produces
 * different briefs.
 *
 * This is rule-based, not a model call. The real product drafts this with an
 * LLM; the seam is here, and swapping in a completion means replacing this one
 * function. Rule-based keeps the demo offline, instant, free, and — the point
 * for a public repo — needing no API key.
 */
export function draftBrief(input: BriefInput) {
  const { company, product, objective, creators } = input;
  const obj = OBJECTIVES.find((o) => o.id === objective) ?? OBJECTIVES[0];

  const verticals = Array.from(new Set(creators.flatMap((c) => c.verticals[0])));
  const icp = Array.from(new Set(creators.flatMap((c) => c.icp))).slice(0, 4);
  const reach = creators.reduce((s, c) => s + c.medianViews, 0);
  const audience = icp.length ? icp.join(", ") : "B2B operators";

  const objectives = [
    `Get ${audience} to ${obj.verb} of ${product}.`,
    `Reach roughly ${Math.round(reach / 1000)}K in-feed impressions across ${creators.length} ${
      creators.length === 1 ? "creator" : "creators"
    } in ${verticals.join(", ")}.`,
    `Attribute every click, and therefore every signup, to the individual creator who drove it.`,
  ];

  const keyMessages = [
    `${product} is built for ${audience.split(", ")[0].toLowerCase()} who have outgrown spreadsheets and workarounds.`,
    `Lead with the problem, not the product — the post should be worth reading even if nobody clicks.`,
    `One concrete number or before/after beats three adjectives.`,
    verticals.includes("DevTools")
      ? `Show the actual implementation, not the marketing site.`
      : `Name the workflow it replaces, specifically.`,
  ];

  const guidelines = [
    `Write in your own voice. Do not paste the brief — rewrite it as something you would post anyway.`,
    `Open with a problem you have genuinely hit. No "excited to announce".`,
    `Place your tracked link in the first comment, not the post body — LinkedIn suppresses outbound links in the body.`,
    `Disclose the partnership. "Paid partnership with ${company}" in the first line or the post label.`,
    `One post, published inside the campaign window. Tell us before you edit it after publishing.`,
    `Do not compare ${product} to a named competitor.`,
  ];

  return {
    objectives: objectives.join("\n"),
    keyMessages: keyMessages.join("\n"),
    guidelines: guidelines.join("\n"),
  };
}

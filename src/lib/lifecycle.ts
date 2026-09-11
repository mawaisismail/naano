/**
 * The deal lifecycle, in order. A deal moves left to right; "declined" is the
 * one exit that is not part of the line.
 */
export const STAGES = [
  "invited",
  "accepted",
  "draft",
  "scheduled",
  "live",
  "paid",
] as const;

export type Stage = (typeof STAGES)[number];

export const STAGE_LABEL: Record<string, string> = {
  invited: "Invited",
  accepted: "Accepted",
  draft: "Draft ready",
  scheduled: "Scheduled",
  live: "Live",
  paid: "Paid",
  declined: "Declined",
};

/** What the brand's own action does at each stage — the button label. */
export const NEXT_ACTION: Record<string, string> = {
  invited: "Mark accepted",
  accepted: "Draft ready",
  draft: "Schedule",
  scheduled: "Publish",
  live: "Pay out",
};

export const stageIndex = (s: string) => STAGES.indexOf(s as Stage);
export const isTerminal = (s: string) => s === "paid" || s === "declined";

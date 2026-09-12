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

/**
 * Whether a deal's price is money the brand has committed.
 *
 * A brand's "spend" is not only what has been paid out: once a creator has
 * accepted, the fee is owed whether or not the payout has run. Counting only
 * "paid" made the Results screen report €0 spent against 166 attributed
 * clicks and a €0.00 cost per click, which is worse than no figure at all.
 * An invitation nobody accepted, and a decline, are not committed.
 */
export const isCommitted = (status: string) =>
  status !== "invited" && status !== "declined";

/**
 * Who is allowed to move a booking out of each stage.
 *
 * This is the rule that makes the two sides a marketplace rather than one
 * party filling in a form about the other. The brand used to press "Mark
 * accepted" on the creator's behalf, and "Publish" on a post it cannot
 * publish, which meant a booking could reach "live" without the creator ever
 * touching it.
 *
 * "invited" is the exception: it belongs to whichever side did NOT open the
 * conversation, which is why a deal records who initiated it.
 */
export type Side = "brand" | "creator";

export function ownerOf(status: string, initiatedBy: string): Side | null {
  switch (status) {
    case "invited":
      return initiatedBy === "brand" ? "creator" : "brand";
    case "accepted":
    case "draft":
    case "scheduled":
      // Writing, scheduling and publishing the post are the creator's.
      return "creator";
    case "live":
      // Only the brand can release the money.
      return "brand";
    default:
      // paid and declined are terminal.
      return null;
  }
}

export const canAdvance = (status: string, initiatedBy: string, side: Side) =>
  ownerOf(status, initiatedBy) === side;

import { describe, it, expect } from "vitest";
import {
  STAGES,
  STAGE_LABEL,
  NEXT_ACTION,
  stageIndex,
  isTerminal,
  isCommitted,
} from "./lifecycle";

/** Mirrors advanceDeal()'s transition rule. */
const next = (s: string) => STAGES[Math.min(stageIndex(s) + 1, STAGES.length - 1)];

describe("deal lifecycle", () => {
  it("runs invited -> paid in the documented order", () => {
    expect([...STAGES]).toEqual([
      "invited",
      "accepted",
      "draft",
      "scheduled",
      "live",
      "paid",
    ]);
  });

  it("walks every stage and terminates instead of looping", () => {
    const seen: string[] = ["invited"];
    let s = "invited";
    for (let guard = 0; guard < 20 && !isTerminal(s); guard++) {
      const n = next(s);
      if (n === s) break;
      s = n;
      seen.push(s);
    }
    expect(s).toBe("paid");
    expect(seen).toHaveLength(STAGES.length);
  });

  it("cannot advance past the terminal stage", () => {
    expect(next("paid")).toBe("paid");
    expect(isTerminal("paid")).toBe(true);
  });

  it("treats declined as terminal and off the line", () => {
    expect(isTerminal("declined")).toBe(true);
    expect(STAGES).not.toContain("declined");
  });

  it("gives every non-terminal stage a button label", () => {
    for (const s of STAGES) {
      if (!isTerminal(s)) expect(NEXT_ACTION[s], `no label for ${s}`).toBeTruthy();
    }
  });

  it("labels every stage, declined included", () => {
    for (const s of [...STAGES, "declined"]) {
      expect(STAGE_LABEL[s], `no display label for ${s}`).toBeTruthy();
    }
  });

  it("returns -1 for an unknown stage rather than matching by accident", () => {
    expect(stageIndex("nonsense")).toBe(-1);
  });
});

describe("isCommitted", () => {
  it("counts every stage a creator has accepted", () => {
    for (const s of ["accepted", "draft", "scheduled", "live", "paid"]) {
      expect(isCommitted(s)).toBe(true);
    }
  });

  it("does not count an unanswered invitation or a decline", () => {
    expect(isCommitted("invited")).toBe(false);
    expect(isCommitted("declined")).toBe(false);
  });
});

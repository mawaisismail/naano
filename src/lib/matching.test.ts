import { describe, expect, it } from "vitest";
import { CREATORS } from "@/lib/creators";
import { rankCreators, scoreCreator } from "@/lib/matching";

const revops = CREATORS.find((c) => c.verticals.includes("RevOps"))!;

describe("scoreCreator", () => {
  it("scores a creator higher when their audience matches an ICP", () => {
    const on = scoreCreator(revops, { icps: ["RevOps leaders — own the CRM"], valueProp: null });
    const off = scoreCreator(revops, { icps: ["Dentists — run a clinic"], valueProp: null });
    expect(on.score).toBeGreaterThan(off.score);
  });

  it("names the ICP it matched, so a card can explain itself", () => {
    const { reasons } = scoreCreator(revops, {
      icps: ["RevOps leaders — own the CRM"],
      valueProp: null,
    });
    expect(reasons).toContain("RevOps leaders");
  });

  it("never returns a bare number with no reason", () => {
    const { reasons } = scoreCreator(revops, { icps: [], valueProp: null });
    expect(reasons.length).toBeGreaterThan(0);
  });

  it("keeps the score inside 0-99 so no card claims a perfect match", () => {
    for (const c of CREATORS) {
      const { score } = scoreCreator(c, {
        icps: ["RevOps leaders — own the CRM", "Sales leaders — carry a number"],
        valueProp: "revops attribution crm sales pipeline reporting",
      });
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(99);
    }
  });
});

describe("rankCreators", () => {
  it("returns the marketplace best-match first", () => {
    const ranked = rankCreators({ icps: ["RevOps leaders — own the CRM"], valueProp: null });
    const scores = ranked.map((r) => r.score);
    expect(scores).toEqual([...scores].sort((a, b) => b - a));
  });

  it("honours the limit", () => {
    expect(rankCreators({ icps: [], valueProp: null }, 4)).toHaveLength(4);
  });
});

describe("match counts", () => {
  it("reports how many ICPs matched out of how many exist", () => {
    const m = scoreCreator(revops, {
      icps: ["RevOps leaders — own the CRM", "Dentists — run a clinic"],
      valueProp: null,
    });
    expect(m.total).toBe(2);
    expect(m.matched).toBe(1);
  });
});

import { describe, it, expect } from "vitest";
import { matchScore, daysUntil } from "./opportunities";

const creator = { industries: ["SaaS", "AI"], country: "France", followers: 8000 };

describe("matching a campaign to a creator", () => {
  it("scores a full industry overlap above a partial one", () => {
    const full = matchScore({ industries: ["SaaS"], countries: [] }, creator);
    const partial = matchScore({ industries: ["SaaS", "Fintech"], countries: [] }, creator);
    expect(full).toBeGreaterThan(partial);
  });

  it("scores an unrelated campaign lowest", () => {
    const unrelated = matchScore({ industries: ["HR-Tech"], countries: [] }, creator);
    expect(unrelated).toBeLessThan(matchScore({ industries: ["SaaS"], countries: [] }, creator));
  });

  it("is case-insensitive about industry names", () => {
    expect(matchScore({ industries: ["saas"], countries: [] }, creator)).toBe(
      matchScore({ industries: ["SaaS"], countries: [] }, creator)
    );
  });

  it("treats an empty country list as open to everyone", () => {
    const open = matchScore({ industries: ["SaaS"], countries: [] }, creator);
    const targeted = matchScore({ industries: ["SaaS"], countries: ["France"] }, creator);
    expect(open).toBe(targeted);
  });

  it("penalises a creator outside the targeted countries", () => {
    const outside = matchScore({ industries: ["SaaS"], countries: ["Germany"] }, creator);
    expect(outside).toBeLessThan(matchScore({ industries: ["SaaS"], countries: ["France"] }, creator));
  });

  it("stays within 0 and 100", () => {
    const zero = matchScore({ industries: ["Nothing"], countries: ["Nowhere"] }, {
      industries: [], country: null, followers: 0,
    });
    expect(zero).toBeGreaterThanOrEqual(0);
    expect(matchScore({ industries: [], countries: [] }, creator)).toBeLessThanOrEqual(100);
  });
});

describe("rows missing the newer columns", () => {
  it("scores rather than throwing when the lists are absent", () => {
    // A client generated before the targeting columns existed returns
    // undefined here, and that must not take down the whole board.
    const partial = { industries: undefined, countries: undefined } as unknown as {
      industries: string[];
      countries: string[];
    };
    expect(() => matchScore(partial, creator)).not.toThrow();
    expect(matchScore(partial, { industries: [], country: null, followers: null })).toBeGreaterThanOrEqual(0);
  });
});

describe("the post deadline", () => {
  it("is null when the brand set none", () => {
    expect(daysUntil(null)).toBeNull();
  });

  it("never goes negative once the date has passed", () => {
    expect(daysUntil(new Date(Date.now() - 5 * 86_400_000))).toBe(0);
  });

  it("rounds up, so a deadline later today still reads as a day", () => {
    expect(daysUntil(new Date(Date.now() + 6.2 * 86_400_000))).toBe(7);
  });
});

import { describe, it, expect } from "vitest";
import { CREATORS, COUNTRIES, TIERS, followerTier, getCreator } from "./creators";

describe("seeded marketplace creators", () => {
  it("has enough creators for the filters to mean anything", () => {
    expect(CREATORS.length).toBeGreaterThanOrEqual(30);
  });

  it("has unique ids and unique slugs", () => {
    expect(new Set(CREATORS.map((c) => c.id)).size).toBe(CREATORS.length);
    expect(new Set(CREATORS.map((c) => c.slug)).size).toBe(CREATORS.length);
  });

  it("keeps every price inside naano's published range", () => {
    for (const c of CREATORS) {
      expect(c.postCost, `${c.name} is out of range`).toBeGreaterThanOrEqual(20);
      expect(c.postCost, `${c.name} is out of range`).toBeLessThanOrEqual(1500);
    }
  });

  it("keeps followers inside the stated 1K-500K band", () => {
    for (const c of CREATORS) {
      expect(c.followers).toBeGreaterThanOrEqual(1000);
      expect(c.followers).toBeLessThanOrEqual(500_000);
    }
  });

  it("prices larger audiences higher on average", () => {
    const small = CREATORS.filter((c) => c.followers < 10_000);
    const large = CREATORS.filter((c) => c.followers >= 25_000);
    const mean = (xs: typeof CREATORS) =>
      xs.reduce((s, c) => s + c.postCost, 0) / xs.length;
    expect(mean(large)).toBeGreaterThan(mean(small));
  });

  it("scores every creator on a 0-100 match scale", () => {
    for (const c of CREATORS) {
      expect(c.matchScore).toBeGreaterThanOrEqual(0);
      expect(c.matchScore).toBeLessThanOrEqual(100);
    }
  });

  it("buckets followers into exactly the tiers the filter offers", () => {
    for (const c of CREATORS) {
      expect(TIERS).toContain(followerTier(c.followers));
    }
  });

  it("puts tier boundaries on the documented side", () => {
    expect(followerTier(4999)).toBe("1K-5K");
    expect(followerTier(5000)).toBe("5K-10K");
    expect(followerTier(9999)).toBe("5K-10K");
    expect(followerTier(10_000)).toBe("10K-25K");
    expect(followerTier(24_999)).toBe("10K-25K");
    expect(followerTier(25_000)).toBe("25K-75K");
    expect(followerTier(75_000)).toBe("75K+");
  });

  it("derives the country filter from creators that actually exist", () => {
    const used = new Set(CREATORS.map((c) => c.countryCode));
    for (const c of COUNTRIES) expect(used.has(c.code)).toBe(true);
    expect(COUNTRIES.length).toBe(used.size);
  });

  it("gives every creator the fields the card renders", () => {
    for (const c of CREATORS) {
      expect(c.name).toBeTruthy();
      expect(c.headline).toBeTruthy();
      expect(c.bio).toBeTruthy();
      expect(c.avatar).toMatch(/^https:\/\//);
      expect(c.verticals.length).toBeGreaterThanOrEqual(1);
      expect(c.icp.length).toBeGreaterThanOrEqual(1);
      expect(c.flag).toBeTruthy();
    }
  });

  it("looks a creator up by slug, and returns nothing for an unknown one", () => {
    expect(getCreator(CREATORS[0].slug)?.id).toBe(CREATORS[0].id);
    expect(getCreator("no-such-creator")).toBeUndefined();
  });
});

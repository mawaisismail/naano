import { describe, it, expect } from "vitest";
import { TIERS, countriesOf, followerTier } from "./creators";
import { CREATORS, creator } from "@/test/creators";

/**
 * What is left in creators.ts once the invented people are gone: the buckets
 * the marketplace filters by. These used to also assert things about a seed
 * file — that it had thirty entries, that its prices were plausible — which
 * tested a fixture rather than the product.
 */
describe("follower tiers", () => {
  it("buckets followers into exactly the tiers the filter offers", () => {
    for (const c of CREATORS) expect(TIERS).toContain(followerTier(c.followers));
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
});

describe("country filter", () => {
  it("offers only countries that creators are actually in", () => {
    const used = new Set(CREATORS.map((c) => c.countryCode));
    const offered = countriesOf(CREATORS);
    for (const c of offered) expect(used.has(c.code)).toBe(true);
    expect(offered.length).toBe(used.size);
  });

  it("is empty for an empty marketplace, rather than a fixed list", () => {
    // Day one has no creators. A filter offering eight countries that match
    // nobody is worse than no filter.
    expect(countriesOf([])).toEqual([]);
  });

  it("ignores creators who never set a country", () => {
    expect(countriesOf([creator({ countryCode: "", country: "" })])).toEqual([]);
  });

  it("sorts by country name so the list is stable", () => {
    const names = countriesOf(CREATORS).map((c) => c.name);
    expect(names).toEqual([...names].sort((a, b) => a.localeCompare(b)));
  });
});

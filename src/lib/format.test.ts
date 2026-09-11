import { describe, it, expect } from "vitest";
import { compact, euro, cx } from "./format";

describe("compact numbers", () => {
  it("leaves small numbers alone", () => {
    expect(compact(0)).toBe("0");
    expect(compact(999)).toBe("999");
  });

  it("abbreviates thousands and millions", () => {
    expect(compact(1000)).toBe("1K");
    expect(compact(1200)).toBe("1.2K");
    expect(compact(14100)).toBe("14.1K");
    expect(compact(1_000_000)).toBe("1M");
    expect(compact(5_400_000)).toBe("5.4M");
  });

  it("drops a trailing .0 rather than printing 1.0K", () => {
    expect(compact(2000)).toBe("2K");
    expect(compact(3_000_000)).toBe("3M");
  });
});

describe("euro", () => {
  it("formats whole euros with separators", () => {
    expect(euro(84)).toBe("€84");
    expect(euro(1500)).toBe("€1,500");
  });

  it("does not print cents", () => {
    expect(euro(99.6)).not.toContain(".");
  });
});

describe("cx", () => {
  it("joins truthy classes and drops the rest", () => {
    expect(cx("a", false, null, undefined, "b")).toBe("a b");
    expect(cx()).toBe("");
  });
});

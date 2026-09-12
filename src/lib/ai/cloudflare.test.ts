import { describe, expect, it } from "vitest";
import { cosine } from "./cloudflare";

describe("cosine", () => {
  it("is 1 for a vector against itself", () => {
    expect(cosine([1, 2, 3], [1, 2, 3])).toBeCloseTo(1, 10);
  });

  it("ignores magnitude, only direction", () => {
    expect(cosine([1, 2, 3], [10, 20, 30])).toBeCloseTo(1, 10);
  });

  it("is 0 for orthogonal vectors", () => {
    expect(cosine([1, 0], [0, 1])).toBeCloseTo(0, 10);
  });

  it("does not divide by zero on a zero vector", () => {
    // An embedding model returning zeros is a failure, but it must not become
    // NaN that then sorts unpredictably through the whole ranking.
    expect(cosine([0, 0], [1, 1])).toBe(0);
  });
});

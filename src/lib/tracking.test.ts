import { describe, it, expect } from "vitest";
import { makeTrackingCode, isNonHumanRequest } from "./tracking";

describe("tracking codes", () => {
  it("has the requested length", () => {
    expect(makeTrackingCode()).toHaveLength(7);
    expect(makeTrackingCode(12)).toHaveLength(12);
  });

  it("omits look-alike characters, so a code can be read aloud", () => {
    const sample = Array.from({ length: 300 }, () => makeTrackingCode()).join("");
    for (const ch of ["l", "o", "0", "1"]) {
      expect(sample, `found look-alike "${ch}"`).not.toContain(ch);
    }
  });

  it("is URL-safe", () => {
    for (let i = 0; i < 200; i++) {
      expect(makeTrackingCode()).toMatch(/^[a-z2-9]+$/);
    }
  });

  it("does not collide across a realistic number of deals", () => {
    // trackingCode is @unique in the schema; a collision is a failed booking.
    const codes = new Set(Array.from({ length: 5000 }, () => makeTrackingCode()));
    expect(codes.size).toBe(5000);
  });
});

describe("who counts as a click", () => {
  const human = {
    purpose: null,
    xPurpose: null,
    secPurpose: null,
    userAgent:
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/140 Safari/537.36",
  };

  it("counts a real browser", () => {
    expect(isNonHumanRequest(human)).toBe(false);
  });

  it("ignores prefetches, which would inflate the billed number", () => {
    expect(isNonHumanRequest({ ...human, purpose: "prefetch" })).toBe(true);
    expect(isNonHumanRequest({ ...human, xPurpose: "prefetch" })).toBe(true);
    expect(isNonHumanRequest({ ...human, secPurpose: "prefetch;prerender" })).toBe(true);
    expect(isNonHumanRequest({ ...human, purpose: "PREFETCH" })).toBe(true);
  });

  it("ignores link unfurlers and crawlers", () => {
    for (const ua of [
      "LinkedInBot/1.0 (compatible; Mozilla/5.0)",
      "facebookexternalhit/1.1",
      "Googlebot/2.1",
      "Slackbot-LinkExpanding 1.0",
      "HeadlessChrome/140.0.0.0",
    ]) {
      expect(isNonHumanRequest({ ...human, userAgent: ua }), ua).toBe(true);
    }
  });

  it("does not throw on missing headers", () => {
    expect(() => isNonHumanRequest({})).not.toThrow();
    expect(isNonHumanRequest({})).toBe(false);
  });
});

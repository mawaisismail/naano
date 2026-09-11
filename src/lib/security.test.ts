import { describe, it, expect } from "vitest";
import { safeNextPath } from "./auth";
import { rateLimit } from "./rate-limit";
import { clientIpHash } from "./tracking";

describe("post-login redirect target", () => {
  it("allows our own paths", () => {
    expect(safeNextPath("/app")).toBe("/app");
    expect(safeNextPath("/app/campaigns/abc")).toBe("/app/campaigns/abc");
  });

  it("REFUSES anything that leaves our origin", () => {
    // The link starts on our domain, so an open redirect here is a credible
    // phishing primitive.
    for (const bad of [
      "//evil.com",
      "https://evil.com",
      "http://evil.com",
      "/\\evil.com",
      "javascript:alert(1)",
      "evil.com",
    ]) {
      expect(safeNextPath(bad), bad).toBeNull();
    }
  });

  it("refuses header-splitting attempts and empty input", () => {
    expect(safeNextPath("/app\r\nSet-Cookie: x=1")).toBeNull();
    expect(safeNextPath("")).toBeNull();
    expect(safeNextPath(undefined)).toBeNull();
  });
});

describe("rate limiting", () => {
  it("allows up to the limit, then blocks", () => {
    const key = `test-${Math.random()}`;
    for (let i = 0; i < 5; i++) expect(rateLimit(key, 5, 60_000).ok).toBe(true);
    const blocked = rateLimit(key, 5, 60_000);
    expect(blocked.ok).toBe(false);
    expect(blocked.retryAfterSec).toBeGreaterThan(0);
  });

  it("keeps separate callers independent", () => {
    const a = `a-${Math.random()}`;
    const b = `b-${Math.random()}`;
    for (let i = 0; i < 5; i++) rateLimit(a, 5, 60_000);
    expect(rateLimit(a, 5, 60_000).ok).toBe(false);
    expect(rateLimit(b, 5, 60_000).ok).toBe(true);
  });

  it("lets the window expire", async () => {
    const key = `w-${Math.random()}`;
    expect(rateLimit(key, 1, 40).ok).toBe(true);
    expect(rateLimit(key, 1, 40).ok).toBe(false);
    await new Promise((r) => setTimeout(r, 60));
    expect(rateLimit(key, 1, 40).ok).toBe(true);
  });
});

describe("client ip hashing", () => {
  const h = (o: Record<string, string>) => new Headers(o);

  it("never returns the raw address", () => {
    const out = clientIpHash(h({ "x-forwarded-for": "203.0.113.7" }));
    expect(out).not.toContain("203.0.113.7");
    expect(out).toMatch(/^[0-9a-f]{32}$/);
  });

  it("is stable for one address and different across addresses", () => {
    const a = clientIpHash(h({ "x-forwarded-for": "203.0.113.7" }));
    const b = clientIpHash(h({ "x-forwarded-for": "203.0.113.7" }));
    const c = clientIpHash(h({ "x-forwarded-for": "198.51.100.2" }));
    expect(a).toBe(b);
    expect(a).not.toBe(c);
  });

  it("takes the first hop of a forwarded chain", () => {
    const chained = clientIpHash(h({ "x-forwarded-for": "203.0.113.7, 70.41.3.18" }));
    const direct = clientIpHash(h({ "x-forwarded-for": "203.0.113.7" }));
    expect(chained).toBe(direct);
  });

  it("returns null when no address is present", () => {
    expect(clientIpHash(h({}))).toBeNull();
  });
});

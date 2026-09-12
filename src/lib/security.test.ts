import { describe, it, expect } from "vitest";
import { safeNextPath } from "./auth";
import { rateLimit, rateLimitLocal } from "./rate-limit";
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

/**
 * The fallback is tested directly rather than through rateLimit(): with Redis
 * configured, rateLimit() counts in a shared store that other runs and other
 * machines also write to, so a test asserting "the 6th call blocks" would be
 * testing the state of a server, not the code.
 */
describe("rate limiting — per-process fallback", () => {
  it("allows up to the limit, then blocks", () => {
    const key = `test-${Math.random()}`;
    for (let i = 0; i < 5; i++) expect(rateLimitLocal(key, 5, 60_000).ok).toBe(true);
    const blocked = rateLimitLocal(key, 5, 60_000);
    expect(blocked.ok).toBe(false);
    expect(blocked.retryAfterSec).toBeGreaterThan(0);
  });

  it("keeps separate callers independent", () => {
    const a = `a-${Math.random()}`;
    const b = `b-${Math.random()}`;
    for (let i = 0; i < 5; i++) rateLimitLocal(a, 5, 60_000);
    expect(rateLimitLocal(a, 5, 60_000).ok).toBe(false);
    expect(rateLimitLocal(b, 5, 60_000).ok).toBe(true);
  });

  it("lets the window expire", async () => {
    const key = `w-${Math.random()}`;
    expect(rateLimitLocal(key, 1, 40).ok).toBe(true);
    expect(rateLimitLocal(key, 1, 40).ok).toBe(false);
    await new Promise((r) => setTimeout(r, 60));
    expect(rateLimitLocal(key, 1, 40).ok).toBe(true);
  });
});

describe("rate limiting — shared window", () => {
  it("blocks past the limit, whichever store is behind it", async () => {
    const key = `shared-${Math.random()}`;
    for (let i = 0; i < 3; i++) expect((await rateLimit(key, 3, 60_000)).ok).toBe(true);
    const blocked = await rateLimit(key, 3, 60_000);
    expect(blocked.ok).toBe(false);
    expect(blocked.retryAfterSec).toBeGreaterThan(0);
  });

  it("honours a zero budget on the very first call", async () => {
    // Whichever store answers, "no requests allowed" must mean none. The
    // fallback used to let one through per window, so a limiter that had
    // silently dropped to local counting was also silently weaker.
    const key = `zero-${Math.random()}`;
    expect((await rateLimit(key, 0, 60_000)).ok).toBe(false);
    expect(rateLimitLocal(`local-${key}`, 0, 60_000).ok).toBe(false);
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

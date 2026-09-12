import { beforeEach, describe, expect, it, vi } from "vitest";

/**
 * The brand read, with both providers stubbed.
 *
 * The interesting behaviour is not the happy path — it is what happens when a
 * third party is slow, down, or answers with something unusable, because that
 * decides whether someone signing up gets a usable screen or a dead end.
 */

const { readSiteContents, generateJson } = vi.hoisted(() => ({
  readSiteContents: vi.fn(),
  generateJson: vi.fn(),
}));
vi.mock("@/lib/ai/exa", () => ({ readSiteContents, exaConfigured: () => true }));
vi.mock("@/lib/ai/cloudflare", () => ({ generateJson }));

import { readBrandSite, normaliseSiteUrl, companyFromUrl } from "./brand-import";

const PAGES = [{ url: "https://acme.com", title: "Acme", text: "Acme sells widgets to factories." }];

const GOOD = {
  company: "Acme",
  valueProp:
    "Acme sells industrial widgets to mid-sized factories. Teams buy it because the line stops less often. It replaces three spreadsheets. It pays for itself in a quarter.",
  icps: [
    { title: "Plant managers", description: "Run the floor and answer for downtime." },
    { title: "Maintenance leads", description: "Own the repair schedule." },
    { title: "Operations directors", description: "Carry the efficiency number." },
  ],
};

beforeEach(() => {
  readSiteContents.mockReset();
  generateJson.mockReset();
});

describe("readBrandSite", () => {
  it("labels a real read as crawled", async () => {
    readSiteContents.mockResolvedValue(PAGES);
    generateJson.mockResolvedValue(GOOD);

    const read = await readBrandSite("acme.com");
    expect(read?.source).toBe("crawler");
    expect(read?.valueProp).toBe(GOOD.valueProp);
    expect(read?.icps).toHaveLength(3);
  });

  it("falls back, labelled demo, when the site cannot be read", async () => {
    readSiteContents.mockResolvedValue(null);

    const read = await readBrandSite("acme.com");
    expect(read?.source).toBe("demo");
    expect(read?.icps).toHaveLength(3);
    // The model is not worth calling with nothing to summarise.
    expect(generateJson).not.toHaveBeenCalled();
  });

  it("falls back when the model is unavailable", async () => {
    readSiteContents.mockResolvedValue(PAGES);
    generateJson.mockResolvedValue(null);

    expect((await readBrandSite("acme.com"))?.source).toBe("demo");
  });

  it("falls back when the model answers with less than the screen needs", async () => {
    readSiteContents.mockResolvedValue(PAGES);
    // Two ICPs where the screen renders three: showing a half-filled step is
    // worse than showing the generated one and saying so.
    generateJson.mockResolvedValue({ ...GOOD, icps: GOOD.icps.slice(0, 2) });

    expect((await readBrandSite("acme.com"))?.source).toBe("demo");
  });

  it("rejects something that is not a website at all", async () => {
    expect(await readBrandSite("not a url")).toBeNull();
    expect(readSiteContents).not.toHaveBeenCalled();
  });

  it("never lets a provider throw reach the caller", async () => {
    // Both clients catch their own failures, so this is the belt to that
    // braces: a bug or an unsupported API in either one must not be able to
    // take down a sign-up.
    readSiteContents.mockRejectedValue(new Error("socket hang up"));
    expect((await readBrandSite("acme.com"))?.source).toBe("demo");

    readSiteContents.mockResolvedValue(PAGES);
    generateJson.mockRejectedValue(new Error("boom"));
    expect((await readBrandSite("acme.com"))?.source).toBe("demo");
  });
});

describe("url handling", () => {
  it("accepts what people actually type", () => {
    expect(normaliseSiteUrl("acme.com")).toBe("https://acme.com");
    expect(normaliseSiteUrl("https://www.acme.com/pricing")).toBe("https://www.acme.com");
    expect(normaliseSiteUrl("localhost")).toBeNull();
  });

  it("derives a presentable company name", () => {
    expect(companyFromUrl("https://fast-tools.com")).toBe("FastTools");
  });
});

import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import type { PrismaClient } from "@prisma/client";
import { testClient } from "@/test/db";
import { makeTrackingCode } from "./tracking";

/**
 * Attribution is the product. These run against a real database built from the
 * real schema, because the claim being tested — "a click resolves to the
 * individual creator" — is a claim about the data model, not about a function.
 */
let db: PrismaClient;
let brandId: string;

beforeAll(async () => {
  db = testClient();
  const brand = await db.user.create({
    data: {
      email: "brand@test.local",
      passwordHash: "x",
      name: "Test Brand",
      role: "brand",
      companyName: "Testco",
    },
  });
  brandId = brand.id;
});

afterAll(async () => {
  await db.$disconnect();
});

beforeEach(async () => {
  await db.click.deleteMany();
  await db.deal.deleteMany();
  await db.campaign.deleteMany();
});

async function campaignWith(prices: number[]) {
  return db.campaign.create({
    data: {
      brandId,
      name: "Test campaign",
      objective: "o",
      keyMessages: "k",
      guidelines: "g",
      landingUrl: "https://example.com/trial",
      status: "live",
      deals: {
        create: prices.map((price, i) => ({
          creatorId: `cr_${i}`,
          creatorSlug: `creator-${i}`,
          creatorName: `Creator ${i}`,
          price,
          status: "live",
          trackingCode: makeTrackingCode(),
        })),
      },
    },
    include: { deals: true },
  });
}

/** Mirrors the write the /r/[code] route performs. */
async function recordClick(code: string) {
  const deal = await db.deal.findUnique({ where: { trackingCode: code } });
  if (!deal) return null;
  return db.click.create({
    data: { dealId: deal.id, trackingCode: code, referer: "https://www.linkedin.com/" },
  });
}

describe("click attribution", () => {
  it("attributes a click to the one creator whose link was used", async () => {
    const c = await campaignWith([100, 200, 300]);
    const [a, b, cc] = c.deals;

    await recordClick(b.trackingCode);
    await recordClick(b.trackingCode);
    await recordClick(cc.trackingCode);

    const counts = await db.deal.findMany({
      where: { campaignId: c.id },
      select: { id: true, _count: { select: { clicks: true } } },
    });
    const by = Object.fromEntries(counts.map((d) => [d.id, d._count.clicks]));

    expect(by[a.id]).toBe(0); // untouched creator must not absorb clicks
    expect(by[b.id]).toBe(2);
    expect(by[cc.id]).toBe(1);
  });

  it("keeps tracking codes unique across deals", async () => {
    const c = await campaignWith([50, 50, 50, 50, 50]);
    const codes = c.deals.map((d) => d.trackingCode);
    expect(new Set(codes).size).toBe(codes.length);
  });

  it("refuses a duplicate tracking code at the database level", async () => {
    const c = await campaignWith([100]);
    await expect(
      db.deal.create({
        data: {
          campaignId: c.id,
          creatorId: "cr_dup",
          creatorSlug: "dup",
          creatorName: "Dup",
          price: 10,
          status: "invited",
          trackingCode: c.deals[0].trackingCode,
        },
      })
    ).rejects.toThrow();
  });

  it("records nothing for an unknown code", async () => {
    await campaignWith([100]);
    expect(await recordClick("zzzzzzz")).toBeNull();
    expect(await db.click.count()).toBe(0);
  });

  it("computes campaign totals and cost per click from the same rows", async () => {
    const c = await campaignWith([100, 300]); // €400 spend
    await recordClick(c.deals[0].trackingCode);
    await recordClick(c.deals[0].trackingCode);
    await recordClick(c.deals[1].trackingCode);
    await recordClick(c.deals[1].trackingCode);

    const deals = await db.deal.findMany({
      where: { campaignId: c.id },
      select: { price: true, _count: { select: { clicks: true } } },
    });
    const clicks = deals.reduce((s, d) => s + d._count.clicks, 0);
    const spend = deals.reduce((s, d) => s + d.price, 0);

    expect(clicks).toBe(4);
    expect(spend).toBe(400);
    expect(spend / clicks).toBe(100);
  });

  it("removes a campaign's clicks when the campaign goes, leaving no orphans", async () => {
    const c = await campaignWith([100, 200]);
    await recordClick(c.deals[0].trackingCode);
    await recordClick(c.deals[1].trackingCode);
    expect(await db.click.count()).toBe(2);

    await db.campaign.delete({ where: { id: c.id } });

    expect(await db.deal.count()).toBe(0);
    expect(await db.click.count()).toBe(0);
  });

  it("attributes correctly when one creator appears in two campaigns", async () => {
    const one = await campaignWith([100]);
    const two = await campaignWith([100]);
    await recordClick(one.deals[0].trackingCode);
    await recordClick(two.deals[0].trackingCode);
    await recordClick(two.deals[0].trackingCode);

    const a = await db.deal.findUnique({
      where: { id: one.deals[0].id },
      select: { _count: { select: { clicks: true } } },
    });
    const b = await db.deal.findUnique({
      where: { id: two.deals[0].id },
      select: { _count: { select: { clicks: true } } },
    });

    // Per-deal, not per-creator: the same person in two campaigns keeps
    // separate counts, which is what a brand pays against.
    expect(a!._count.clicks).toBe(1);
    expect(b!._count.clicks).toBe(2);
  });
});

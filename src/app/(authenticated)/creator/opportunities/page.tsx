import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { daysUntil, matchScore } from "@/lib/opportunities";
import { OpportunityBoard, type Opportunity } from "./OpportunityBoard";

export const metadata = { title: "Opportunities — Naano" };

export default async function OpportunitiesPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const [campaigns, myDeals] = await Promise.all([
    prisma.campaign.findMany({
      where: { status: "live" },
      include: { brand: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.deal.findMany({
      where: { creatorSlug: user.creatorSlug ?? "__none__" },
      select: { campaignId: true },
    }),
  ]);

  const appliedTo = new Set(myDeals.map((d) => d.campaignId));
  const creator = {
    industries: user.industries,
    country: user.country,
    followers: user.followers,
  };

  const items: Opportunity[] = campaigns.map((c) => ({
    id: c.id,
    brand: c.brand.companyName ?? c.brand.name,
    name: c.name,
    objective: c.objective,
    channel: c.channel,
    industries: c.industries,
    countries: c.countries,
    days: daysUntil(c.postDeadline),
    match: matchScore({ industries: c.industries, countries: c.countries }, creator),
    applied: appliedTo.has(c.id),
  }));

  return <OpportunityBoard items={items} />;
}

import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { EarningsScreen, type Month, type Activity } from "./EarningsScreen";

export const metadata = { title: "Earnings — Naano" };

export default async function EarningsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const deals = await prisma.deal.findMany({
    where: { creatorId: user.id },
    include: { campaign: { include: { brand: true } } },
    orderBy: { createdAt: "desc" },
  });

  const paid = deals.filter((d) => d.status === "paid");
  const totalEarned = paid.reduce((sum, d) => sum + d.price, 0);
  // "Live" means the post is published and the brand has not paid out yet.
  const inTransit = deals.filter((d) => d.status === "live").reduce((s, d) => s + d.price, 0);

  // Six months back, oldest first, so the chart reads left to right.
  const now = new Date();
  const months: Month[] = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    const next = new Date(d.getFullYear(), d.getMonth() + 1, 1);
    const total = paid
      .filter((p) => p.publishedAt && p.publishedAt >= d && p.publishedAt < next)
      .reduce((s, p) => s + p.price, 0);
    return {
      label: d.toLocaleDateString("en-GB", { month: "short" }),
      full: d.toLocaleDateString("en-GB", { month: "long", year: "numeric" }),
      total,
      current: i === 5,
    };
  });

  const activity: Activity[] = paid.map((d) => ({
    id: d.id,
    date: (d.publishedAt ?? d.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }),
    type: "Collaboration",
    detail: `${d.campaign.brand.companyName ?? d.campaign.brand.name} — ${d.campaign.name}`,
    amount: d.price,
    status: "Paid",
  }));

  return (
    <EarningsScreen
      totalEarned={totalEarned}
      paidCount={paid.length}
      inTransit={inTransit}
      available={0}
      months={months}
      activity={activity}
      payoutMethod={user.payoutMethod}
      bankAccountHolder={user.bankAccountHolder}
      bankIban={user.bankIban}
      stripeAccountId={user.stripeAccountId}
    />
  );
}

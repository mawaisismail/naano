import Link from "next/link";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { euro, compact } from "@/lib/format";
import { StatusPill } from "@/components/app/StatusPill";
import { LiveStatsProvider, LiveCount, LivePulse } from "@/components/app/LiveStats";

export const dynamic = "force-dynamic";

export default async function Dashboard() {
  const user = await getCurrentUser();
  const campaigns = user
    ? await prisma.campaign.findMany({
        where: { brandId: user.id },
        orderBy: { createdAt: "desc" },
        include: { deals: { include: { _count: { select: { clicks: true } } } } },
      })
    : [];

  const deals = campaigns.flatMap((c) => c.deals);
  const clicks = deals.reduce((s, d) => s + d._count.clicks, 0);
  const spend = deals.reduce((s, d) => s + d.price, 0);
  const live = deals.filter((d) => d.status === "live");
  const byDeal = Object.fromEntries(deals.map((d) => [d.id, d._count.clicks]));

  return (
    <LiveStatsProvider initial={{ total: clicks, byDeal }}>
    <div className="mx-auto max-w-5xl px-6 py-10">
      <h1 className="font-display text-3xl font-extrabold text-ink">
        {user?.companyName ?? "Dashboard"}
      </h1>
      <p className="mt-1.5 text-muted">
        {campaigns.length} campaign{campaigns.length === 1 ? "" : "s"} ·{" "}
        {live.length} post{live.length === 1 ? "" : "s"} live
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-4">
        <div className="nn-card p-5">
          <div className="flex items-center justify-between">
            <div className="nn-eyebrow">Clicks attributed</div>
            <LivePulse />
          </div>
          <div className="mt-1.5 font-display text-3xl font-extrabold text-brand">
            <LiveCount initial={clicks} />
          </div>
        </div>
        <Stat label="Creators booked" value={String(deals.length)} />
        <Stat label="Spend" value={euro(spend)} />
        <Stat
          label="Cost per click"
          value={clicks ? `€${(spend / clicks).toFixed(2)}` : "—"}
        />
      </div>

      <h2 className="mt-12 font-display text-lg font-bold text-ink">Live posts</h2>
      {live.length === 0 ? (
        <p className="mt-3 text-sm text-muted">Nothing live yet.</p>
      ) : (
        <div className="mt-4 space-y-3">
          {live.map((d) => (
            <div key={d.id} className="nn-card flex items-center justify-between p-5">
              <div>
                <div className="flex items-center gap-3">
                  <span className="font-display font-bold text-ink">{d.creatorName}</span>
                  <StatusPill status={d.status} />
                </div>
                <div className="mt-1 font-mono text-xs text-muted">/r/{d.trackingCode}</div>
              </div>
              <div className="text-right">
                <div className="font-display text-2xl font-extrabold text-brand">
                  <LiveCount dealId={d.id} initial={d._count.clicks} />
                </div>
                <div className="text-[10px] font-semibold uppercase tracking-wider text-grey">
                  clicks
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Link
        href="/marketplace"
        className="mt-10 inline-block rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-strong"
      >
        Book more creators
      </Link>
    </div>
    </LiveStatsProvider>
  );
}

function Stat({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="nn-card p-5">
      <div className="nn-eyebrow">{label}</div>
      <div className={`mt-1.5 font-display text-3xl font-extrabold ${highlight ? "text-brand" : "text-ink"}`}>
        {value}
      </div>
    </div>
  );
}

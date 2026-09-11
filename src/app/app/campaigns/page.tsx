import Link from "next/link";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { euro, compact } from "@/lib/format";
import { StatusPill } from "@/components/app/StatusPill";

export const dynamic = "force-dynamic";

export default async function CampaignsPage() {
  const user = await getCurrentUser();
  const campaigns = user
    ? await prisma.campaign.findMany({
        where: { brandId: user.id },
        orderBy: { createdAt: "desc" },
        include: { deals: { include: { _count: { select: { clicks: true } } } } },
      })
    : [];

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-extrabold text-ink">Campaigns</h1>
          <p className="mt-1.5 text-sm text-muted">
            {campaigns.length} campaign{campaigns.length === 1 ? "" : "s"}
          </p>
        </div>
        <Link
          href="/marketplace"
          className="rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-strong"
        >
          New campaign
        </Link>
      </div>

      {campaigns.length === 0 ? (
        <div className="nn-card mt-8 grid place-items-center p-16 text-center">
          <p className="font-display font-bold text-ink">No campaigns yet</p>
          <p className="mt-1.5 text-sm text-muted">
            Pick creators in the marketplace to build your first brief.
          </p>
        </div>
      ) : (
        <div className="mt-8 space-y-4">
          {campaigns.map((c) => {
            const clicks = c.deals.reduce((s, d) => s + d._count.clicks, 0);
            const spend = c.deals.reduce((s, d) => s + d.price, 0);
            const live = c.deals.filter((d) => d.status === "live").length;
            return (
              <Link
                key={c.id}
                href={`/app/campaigns/${c.id}`}
                className="nn-card block p-6 transition hover:border-brand/40"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-3">
                      <h2 className="font-display text-lg font-bold text-ink">{c.name}</h2>
                      <StatusPill status={c.status} />
                    </div>
                    <p className="mt-1.5 max-w-xl text-sm text-muted line-clamp-1">
                      {c.objective}
                    </p>
                  </div>
                  <div className="flex gap-8 text-right">
                    <Metric label="Creators" value={String(c.deals.length)} />
                    <Metric label="Live" value={String(live)} />
                    <Metric label="Clicks" value={compact(clicks)} highlight />
                    <Metric label="Spend" value={euro(spend)} />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Metric({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div>
      <div className={`font-display text-xl font-extrabold ${highlight ? "text-brand" : "text-ink"}`}>
        {value}
      </div>
      <div className="mt-0.5 text-[10px] font-semibold uppercase tracking-wider text-grey">
        {label}
      </div>
    </div>
  );
}

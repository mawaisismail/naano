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
    <div className="px-8 pb-16 pt-2">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-[40px] font-bold tracking-[-0.02em] text-[#111827]">Campaigns</h1>
          <p className="mt-2 text-[15px] text-[#6B7280]">
            {campaigns.length} campaign{campaigns.length === 1 ? "" : "s"} · the brief creators
            see when you invite them.
          </p>
        </div>
        <Link
          href="/app/creators"
          className="rounded-[10px] bg-[#2563eb] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#1D4ED8]"
        >
          New campaign
        </Link>
      </div>

      {campaigns.length === 0 ? (
        <div className="mt-8 grid place-items-center rounded-[18px] border border-dashed border-[#D7DCE5] bg-white p-16 text-center">
          <p className="text-sm font-semibold text-[#111827]">No campaigns yet</p>
          <p className="mt-2 max-w-[460px] text-sm leading-6 text-[#6B7280]">
            Pick creators in AI Matching and the brief is drafted from your value
            proposition.
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
                className="block rounded-[18px] border border-[#E5E7EB] bg-white p-6 transition-colors hover:border-[#CFE0FF]"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-3">
                      <h2 className="text-lg font-bold text-[#111827]">{c.name}</h2>
                      <StatusPill status={c.status} />
                    </div>
                    <p className="mt-1.5 max-w-xl text-sm text-[#6B7280] line-clamp-1">
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
      <div className={`text-xl font-bold ${highlight ? "text-[#2563eb]" : "text-[#111827]"}`}>
        {value}
      </div>
      <div className="mt-0.5 text-[10px] font-semibold uppercase tracking-wider text-[#9CA3AF]">
        {label}
      </div>
    </div>
  );
}

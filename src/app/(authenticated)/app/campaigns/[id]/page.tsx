import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { euro } from "@/lib/format";
import { StatusPill } from "@/components/app/StatusPill";
import { advanceDeal } from "@/app/(authenticated)/app/collaborations/actions";
import { CopyLink } from "@/components/app/CopyLink";
import { SubmitButton } from "@/components/app/SubmitButton";
import { LiveStatsProvider, LiveCount, LiveSum, LivePulse } from "@/components/app/LiveStats";

export const dynamic = "force-dynamic";

export default async function CampaignDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getCurrentUser();

  const campaign = await prisma.campaign.findUnique({
    where: { id },
    include: {
      deals: {
        orderBy: { createdAt: "asc" },
        include: { _count: { select: { clicks: true } } },
      },
    },
  });

  // Defence in depth: the layout already requires a brand, but this page must
  // not become readable if that guard is ever moved or removed.
  if (!user || !campaign || campaign.brandId !== user.id) notFound();

  const clicks = campaign.deals.reduce((s, d) => s + d._count.clicks, 0);
  const spend = campaign.deals.reduce((s, d) => s + d.price, 0);
  const live = campaign.deals.filter((d) => d.status === "live");
  const cpc = clicks > 0 ? spend / clicks : 0;
  const dealIds = campaign.deals.map((d) => d.id);
  const byDeal = Object.fromEntries(
    campaign.deals.map((d) => [d.id, d._count.clicks])
  );

  return (
    <LiveStatsProvider initial={{ total: clicks, byDeal }}>
    <div className="px-8 pb-16 pt-2">
      <Link href="/app/campaigns" className="text-sm font-medium text-[#6B7280] hover:text-[#111827]">
        ← Campaigns
      </Link>

      <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-[36px] font-bold tracking-[-0.02em] text-[#111827]">{campaign.name}</h1>
            <StatusPill status={campaign.status} />
          </div>
          <p className="mt-2 max-w-2xl text-[15px] text-[#6B7280]">{campaign.objective}</p>
        </div>
      </div>

      {/* ----------------------------------------------------------- headline */}
      <div className="mt-8 grid gap-4 sm:grid-cols-4">
        <div className="rounded-[18px] border border-[#E5E7EB] bg-white p-5">
          <div className="flex items-center justify-between">
            <div className="text-[11px] font-bold uppercase tracking-[0.1em] text-[#6B7280]">Clicks attributed</div>
            <LivePulse />
          </div>
          <div className="mt-2 text-[30px] font-bold tracking-[-0.02em] text-[#2563eb]">
            <LiveSum dealIds={dealIds} initial={clicks} />
          </div>
        </div>
        <Stat label="Creators live" value={`${live.length}/${campaign.deals.length}`} />
        <Stat label="Spend" value={euro(spend)} />
        <Stat label="Cost per click" value={clicks ? `€${cpc.toFixed(2)}` : "—"} />
      </div>

      {/* -------------------------------------------------------------- deals */}
      <section className="mt-10">
        <h2 className="text-lg font-bold text-[#111827]">Creators</h2>
        <p className="mt-1 text-sm text-[#6B7280]">
          Each creator has their own tracked link, so clicks attribute to the person
          who drove them.
        </p>

        <div className="mt-5 space-y-3">
          {campaign.deals.map((d) => (
            <div key={d.id} className="rounded-[18px] border border-[#E5E7EB] bg-white p-5">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="min-w-48 flex-1">
                  <div className="flex items-center gap-3">
                    <Link
                      href={`/creators/${d.creatorSlug}`}
                      className="text-[15px] font-bold text-[#111827] hover:text-[#2563eb]"
                    >
                      {d.creatorName}
                    </Link>
                    <StatusPill status={d.status} />
                  </div>
                  <div className="mt-1 text-[13px] text-[#6B7280]">{euro(d.price)} per post</div>
                </div>

                <CopyLink code={d.trackingCode} />

                <div className="text-right">
                  <div className="text-2xl font-bold text-[#2563eb]">
                    <LiveCount dealId={d.id} initial={d._count.clicks} />
                  </div>
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-[#9CA3AF]">
                    clicks
                  </div>
                </div>

                {d.status !== "paid" && d.status !== "declined" && (
                  <form action={advanceDeal.bind(null, d.id)}>
                    <SubmitButton variant="ghost" pendingLabel="Updating…">
                      Advance →
                    </SubmitButton>
                  </form>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* -------------------------------------------------------------- brief */}
      <section className="mt-10 grid gap-4 md:grid-cols-3">
        <BriefBlock title="Objectives" body={campaign.objective} />
        <BriefBlock title="Key messages" body={campaign.keyMessages} />
        <BriefBlock title="Creator guidelines" body={campaign.guidelines} />
      </section>
    </div>
    </LiveStatsProvider>
  );
}

function Stat({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="rounded-[18px] border border-[#E5E7EB] bg-white p-5">
      <div className="text-[11px] font-bold uppercase tracking-[0.1em] text-[#6B7280]">{label}</div>
      <div className={`mt-2 text-[30px] font-bold tracking-[-0.02em] ${highlight ? "text-[#2563eb]" : "text-[#111827]"}`}>
        {value}
      </div>
    </div>
  );
}

function BriefBlock({ title, body }: { title: string; body: string }) {
  const lines = body.split("\n").filter(Boolean);
  return (
    <div className="rounded-[18px] border border-[#E5E7EB] bg-white p-6">
      <div className="text-[11px] font-bold uppercase tracking-[0.1em] text-[#6B7280]">{title}</div>
      <ul className="mt-3 space-y-2">
        {lines.map((l, i) => (
          <li key={i} className="flex gap-2 text-sm leading-relaxed text-[#111827]">
            <span className="mt-1.5 size-1 shrink-0 rounded-full bg-[#2563eb]" />
            {l}
          </li>
        ))}
      </ul>
    </div>
  );
}

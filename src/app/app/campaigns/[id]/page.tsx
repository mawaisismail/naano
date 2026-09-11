import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { euro, compact } from "@/lib/format";
import { StatusPill } from "@/components/app/StatusPill";
import { advanceDeal } from "@/app/app/deals/actions";
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
    <div className="mx-auto max-w-5xl px-6 py-10">
      <Link href="/app/campaigns" className="text-sm font-medium text-muted hover:text-ink">
        ← Campaigns
      </Link>

      <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-display text-3xl font-extrabold text-ink">{campaign.name}</h1>
            <StatusPill status={campaign.status} />
          </div>
          <p className="mt-2 max-w-2xl text-muted">{campaign.objective}</p>
        </div>
      </div>

      {/* ----------------------------------------------------------- headline */}
      <div className="mt-8 grid gap-4 sm:grid-cols-4">
        <div className="nn-card p-5">
          <div className="flex items-center justify-between">
            <div className="nn-eyebrow">Clicks attributed</div>
            <LivePulse />
          </div>
          <div className="mt-1.5 font-display text-3xl font-extrabold text-brand">
            <LiveSum dealIds={dealIds} initial={clicks} />
          </div>
        </div>
        <Stat label="Creators live" value={`${live.length}/${campaign.deals.length}`} />
        <Stat label="Spend" value={euro(spend)} />
        <Stat label="Cost per click" value={clicks ? `€${cpc.toFixed(2)}` : "—"} />
      </div>

      {/* -------------------------------------------------------------- deals */}
      <section className="mt-10">
        <h2 className="font-display text-lg font-bold text-ink">Creators</h2>
        <p className="mt-1 text-sm text-muted">
          Each creator has their own tracked link, so clicks attribute to the person
          who drove them.
        </p>

        <div className="mt-5 space-y-3">
          {campaign.deals.map((d) => (
            <div key={d.id} className="nn-card p-5">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="min-w-48 flex-1">
                  <div className="flex items-center gap-3">
                    <Link
                      href={`/creators/${d.creatorSlug}`}
                      className="font-display font-bold text-ink hover:text-brand"
                    >
                      {d.creatorName}
                    </Link>
                    <StatusPill status={d.status} />
                  </div>
                  <div className="mt-1 text-xs text-muted">{euro(d.price)} per post</div>
                </div>

                <CopyLink code={d.trackingCode} />

                <div className="text-right">
                  <div className="font-display text-2xl font-extrabold text-brand">
                    <LiveCount dealId={d.id} initial={d._count.clicks} />
                  </div>
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-grey">
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
    <div className="nn-card p-5">
      <div className="nn-eyebrow">{label}</div>
      <div className={`mt-1.5 font-display text-3xl font-extrabold ${highlight ? "text-brand" : "text-ink"}`}>
        {value}
      </div>
    </div>
  );
}

function BriefBlock({ title, body }: { title: string; body: string }) {
  const lines = body.split("\n").filter(Boolean);
  return (
    <div className="nn-card p-6">
      <div className="nn-eyebrow">{title}</div>
      <ul className="mt-3 space-y-2">
        {lines.map((l, i) => (
          <li key={i} className="flex gap-2 text-sm leading-relaxed text-ink">
            <span className="mt-1.5 size-1 shrink-0 rounded-full bg-brand" />
            {l}
          </li>
        ))}
      </ul>
    </div>
  );
}

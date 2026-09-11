import Link from "next/link";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { euro, cx } from "@/lib/format";
import { STAGES, STAGE_LABEL, NEXT_ACTION, isTerminal } from "@/lib/lifecycle";
import { StatusPill } from "@/components/app/StatusPill";
import { DealPipeline } from "@/components/app/DealPipeline";
import { CopyLink } from "@/components/app/CopyLink";
import { SubmitButton } from "@/components/app/SubmitButton";
import { advanceDeal, declineDeal, reopenDeal } from "./actions";

export const dynamic = "force-dynamic";

export default async function DealsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status: filter } = await searchParams;
  const user = await getCurrentUser();

  const deals = user
    ? await prisma.deal.findMany({
        where: {
          campaign: { brandId: user.id },
          ...(filter ? { status: filter } : {}),
        },
        orderBy: { createdAt: "asc" },
        include: {
          campaign: { select: { id: true, name: true } },
          _count: { select: { clicks: true } },
        },
      })
    : [];

  const counts = user
    ? await prisma.deal.groupBy({
        by: ["status"],
        where: { campaign: { brandId: user.id } },
        _count: { status: true },
      })
    : [];
  const countOf = (s: string) =>
    counts.find((c) => c.status === s)?._count.status ?? 0;
  const total = counts.reduce((s, c) => s + c._count.status, 0);

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <h1 className="font-display text-3xl font-extrabold text-ink">Deals</h1>
      <p className="mt-1.5 text-sm text-muted">
        Every booking, and where it sits in the lifecycle.
      </p>

      {/* ------------------------------------------------------------ filters */}
      <div className="mt-6 flex flex-wrap gap-2">
        <Chip href="/app/deals" on={!filter} label="All" count={total} />
        {STAGES.map((s) => (
          <Chip
            key={s}
            href={`/app/deals?status=${s}`}
            on={filter === s}
            label={STAGE_LABEL[s]}
            count={countOf(s)}
          />
        ))}
        {countOf("declined") > 0 && (
          <Chip
            href="/app/deals?status=declined"
            on={filter === "declined"}
            label="Declined"
            count={countOf("declined")}
          />
        )}
      </div>

      {deals.length === 0 ? (
        <div className="nn-card mt-8 grid place-items-center p-16 text-center">
          <p className="font-display font-bold text-ink">Nothing here</p>
          <p className="mt-1.5 text-sm text-muted">
            {filter ? "No deals at this stage." : "Book creators to create deals."}
          </p>
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          {deals.map((d) => (
            <div key={d.id} className="nn-card p-5">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="min-w-52 flex-1">
                  <div className="flex flex-wrap items-center gap-3">
                    <Link
                      href={`/creators/${d.creatorSlug}`}
                      className="font-display font-bold text-ink hover:text-brand"
                    >
                      {d.creatorName}
                    </Link>
                    <StatusPill status={d.status} />
                  </div>
                  <div className="mt-1 text-xs text-muted">
                    {euro(d.price)} ·{" "}
                    <Link
                      href={`/app/campaigns/${d.campaign.id}`}
                      className="hover:text-ink"
                    >
                      {d.campaign.name}
                    </Link>
                  </div>
                  <div className="mt-3">
                    <DealPipeline status={d.status} />
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <CopyLink code={d.trackingCode} />
                  <div className="text-right">
                    <div className="font-display text-xl font-extrabold text-brand">
                      {d._count.clicks}
                    </div>
                    <div className="text-[10px] font-semibold uppercase tracking-wider text-grey">
                      clicks
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {!isTerminal(d.status) && (
                      <form action={advanceDeal.bind(null, d.id)}>
                        <SubmitButton pendingLabel="Updating…">
                          {NEXT_ACTION[d.status] ?? "Advance"}
                        </SubmitButton>
                      </form>
                    )}
                    {d.status === "invited" && (
                      <form action={declineDeal.bind(null, d.id)}>
                        <SubmitButton variant="danger" pendingLabel="Declining…">
                          Decline
                        </SubmitButton>
                      </form>
                    )}
                    {d.status === "declined" && (
                      <form action={reopenDeal.bind(null, d.id)}>
                        <SubmitButton variant="ghost" pendingLabel="Re-inviting…">
                          Re-invite
                        </SubmitButton>
                      </form>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Chip({
  href,
  on,
  label,
  count,
}: {
  href: string;
  on: boolean;
  label: string;
  count: number;
}) {
  return (
    <Link
      href={href}
      className={cx(
        "rounded-full border px-3.5 py-1.5 text-xs font-semibold transition",
        on
          ? "border-brand bg-brand text-white"
          : "border-line bg-white text-muted hover:border-grey hover:text-ink"
      )}
    >
      {label}
      <span className={cx("ml-1.5", on ? "text-white/60" : "text-grey")}>{count}</span>
    </Link>
  );
}

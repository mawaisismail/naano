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
    <div className="px-8 pb-16 pt-8">
      <h1 className="text-[40px] font-bold tracking-[-0.02em] text-[#111827]">Collaborations</h1>
      <p className="mt-2 text-[15px] text-[#6B7280]">
        Every booking, and where it sits in the lifecycle.
      </p>

      {/* ------------------------------------------------------------ filters */}
      <div className="mt-6 flex flex-wrap gap-2">
        <Chip href="/app/collaborations" on={!filter} label="All" count={total} />
        {STAGES.map((s) => (
          <Chip
            key={s}
            href={`/app/collaborations?status=${s}`}
            on={filter === s}
            label={STAGE_LABEL[s]}
            count={countOf(s)}
          />
        ))}
        {countOf("declined") > 0 && (
          <Chip
            href="/app/collaborations?status=declined"
            on={filter === "declined"}
            label="Declined"
            count={countOf("declined")}
          />
        )}
      </div>

      {deals.length === 0 ? (
        <div className="mt-8 grid place-items-center rounded-[18px] border border-dashed border-[#D7DCE5] bg-white p-16 text-center">
          <p className="text-sm font-semibold text-[#111827]">Nothing here</p>
          <p className="mt-2 max-w-[460px] text-sm leading-6 text-[#6B7280]">
            {filter
              ? "No collaborations at this stage."
              : "Book a creator from AI Matching and the booking appears here."}
          </p>
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          {deals.map((d) => (
            <div key={d.id} className="rounded-[18px] border border-[#E5E7EB] bg-white p-5">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="min-w-52 flex-1">
                  <div className="flex flex-wrap items-center gap-3">
                    <Link
                      href={`/creators/${d.creatorSlug}`}
                      className="text-[15px] font-bold text-[#111827] hover:text-[#2563eb]"
                    >
                      {d.creatorName}
                    </Link>
                    <StatusPill status={d.status} />
                  </div>
                  <div className="mt-1 text-[13px] text-[#6B7280]">
                    {euro(d.price)} ·{" "}
                    <Link
                      href={`/app/campaigns/${d.campaign.id}`}
                      className="hover:text-[#111827]"
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
                    <div className="text-xl font-bold text-[#2563eb]">
                      {d._count.clicks}
                    </div>
                    <div className="text-[10px] font-semibold uppercase tracking-wider text-[#9CA3AF]">
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
        "rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors",
        on
          ? "border-[#2563eb] bg-[#2563eb] text-white"
          : "border-[#E5E7EB] bg-white text-[#4B5563] hover:border-[#9CA3AF] hover:text-[#111827]"
      )}
    >
      {label}
      <span className={cx("ml-1.5", on ? "text-white/60" : "text-[#9CA3AF]")}>{count}</span>
    </Link>
  );
}

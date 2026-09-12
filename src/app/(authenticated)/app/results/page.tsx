import Link from "next/link";
import { redirect } from "next/navigation";
import { ExternalLink } from "lucide-react";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { compact, euro } from "@/lib/format";
import { isCommitted } from "@/lib/lifecycle";

export const dynamic = "force-dynamic";
export const metadata = { title: "Results — Naano" };

const TABS = ["Analytics", "Leads", "Posts"] as const;
const DAYS = 30;

/**
 * Midnight, DAYS ago.
 *
 * Reading the clock is impure, so it does not belong in a component body —
 * it lives here and is awaited alongside the queries it bounds.
 */
async function windowStart() {
  const d = new Date(Date.now() - DAYS * 24 * 60 * 60 * 1000);
  d.setHours(0, 0, 0, 0);
  return d;
}

/**
 * /app/results — what the money bought.
 *
 * Every figure is counted from the Click table, which is written by the /r/
 * redirect, so the chart and the per-creator attribution are the same numbers
 * the tracking links actually produced. Nothing here is illustrative: an empty
 * campaign shows an empty chart, because a brand deciding whether to book
 * again has to be able to trust the shape of this page.
 */
export default async function ResultsPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const { tab: raw } = await searchParams;
  const tab = TABS.find((t) => t.toLowerCase() === raw?.toLowerCase()) ?? "Analytics";

  const since = await windowStart();

  const [deals, clicks] = await Promise.all([
    prisma.deal.findMany({
      where: { campaign: { brandId: user.id } },
      orderBy: { createdAt: "desc" },
      include: {
        campaign: { select: { id: true, name: true } },
        _count: { select: { clicks: true } },
      },
    }),
    prisma.click.findMany({
      where: { deal: { campaign: { brandId: user.id } }, createdAt: { gte: since } },
      select: { createdAt: true, referer: true },
    }),
  ]);

  const totalClicks = deals.reduce((s, d) => s + d._count.clicks, 0);
  const spend = deals.filter((d) => isCommitted(d.status)).reduce((s, d) => s + d.price, 0);
  const livePosts = deals.filter((d) => d.postUrl);

  // One bucket per day so the axis is time, not "days that happened to have a
  // click" — a gap in the line is information.
  const buckets = Array.from({ length: DAYS }, (_, i) => {
    const d = new Date(since);
    d.setDate(d.getDate() + i);
    return { date: d, count: 0 };
  });
  for (const c of clicks) {
    const i = Math.floor((c.createdAt.getTime() - since.getTime()) / 86_400_000);
    if (i >= 0 && i < DAYS) buckets[i].count += 1;
  }
  const peak = Math.max(1, ...buckets.map((b) => b.count));

  const ranked = [...deals].sort((a, b) => b._count.clicks - a._count.clicks);

  return (
    <div className="px-8 pb-16 pt-2">
      <h1 className="text-[40px] font-bold tracking-[-0.02em] text-[#111827]">Results</h1>
      <p className="mt-2 text-[15px] text-[#6B7280]">
        Attribution for every post, counted from your tracking links.
      </p>

      <div className="mt-6 flex gap-7 border-b border-[#ECEEF2]">
        {TABS.map((t) => (
          <Link
            key={t}
            href={`/app/results?tab=${t.toLowerCase()}`}
            aria-current={tab === t ? "page" : undefined}
            className={`-mb-px border-b-2 pb-3 text-sm transition-colors ${
              tab === t
                ? "border-[#2563eb] font-semibold text-[#2563eb]"
                : "border-transparent font-medium text-[#4B5563] hover:text-[#111827]"
            }`}
          >
            {t}
          </Link>
        ))}
      </div>

      {tab === "Analytics" ? (
        <>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <Stat label="Clicks attributed" value={compact(totalClicks)} note={`last ${DAYS} days tracked`} />
            <Stat label="Posts live" value={String(livePosts.length)} note={`${deals.length} bookings`} />
            <Stat label="Spend committed" value={euro(spend)} note="accepted bookings" />
            <Stat
              label="Cost per click"
              value={totalClicks ? `€${(spend / totalClicks).toFixed(2)}` : "—"}
              note={totalClicks ? "blended" : "no clicks yet"}
            />
          </div>

          {/* --------------------------------------------------------- chart */}
          <section className="mt-5 rounded-[18px] border border-[#E5E7EB] bg-white p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-lg font-bold text-[#111827]">Clicks over time</h2>
              <span className="text-[13px] text-[#6B7280]">Last {DAYS} days · peak {peak}/day</span>
            </div>

            <div className="relative mt-6 flex h-[180px] items-end gap-[3px]">
              {totalClicks === 0 ? (
                <p className="absolute inset-0 grid place-items-center text-sm text-[#9CA3AF]">
                  No clicks yet — the first tracked link fills this in.
                </p>
              ) : null}
              {buckets.map((b) => (
                <span
                  key={b.date.toISOString()}
                  title={`${b.date.toLocaleDateString("en-GB", { day: "numeric", month: "short" })}: ${b.count} click${b.count === 1 ? "" : "s"}`}
                  className="flex-1 rounded-t-[3px] bg-[#2563eb]"
                  style={{
                    // A zero day still draws a 2px foot, so the axis reads as a
                    // timeline rather than as missing bars.
                    height: b.count ? `${Math.max((b.count / peak) * 100, 4)}%` : "2px",
                    opacity: b.count ? 1 : 0.18,
                  }}
                />
              ))}
            </div>
            <div className="mt-2 flex justify-between text-[11px] text-[#9CA3AF]">
              <span>{buckets[0].date.toLocaleDateString("en-GB", { day: "numeric", month: "short" })}</span>
              <span>Today</span>
            </div>
          </section>

          {/* ------------------------------------------ attribution by creator */}
          <section className="mt-5 rounded-[18px] border border-[#E5E7EB] bg-white p-6">
            <h2 className="text-lg font-bold text-[#111827]">Attribution by creator</h2>
            {ranked.length === 0 ? (
              <p className="mt-4 text-sm text-[#6B7280]">
                No bookings yet — attribution starts the moment a post goes live.
              </p>
            ) : (
              <ul className="mt-5 space-y-4">
                {ranked.map((d) => {
                  const share = totalClicks ? (d._count.clicks / totalClicks) * 100 : 0;
                  return (
                    <li key={d.id}>
                      <div className="flex items-center justify-between gap-4 text-sm">
                        <Link href={`/creators/${d.creatorSlug}`} className="font-semibold text-[#111827] hover:text-[#2563eb]">
                          {d.creatorName}
                        </Link>
                        <span className="text-[#4B5563]">
                          {d._count.clicks} click{d._count.clicks === 1 ? "" : "s"} ·{" "}
                          <span className="text-[#9CA3AF]">
                            {d._count.clicks ? `€${(d.price / d._count.clicks).toFixed(2)} CPC` : euro(d.price)}
                          </span>
                        </span>
                      </div>
                      <span className="mt-2 block h-2 overflow-hidden rounded-full bg-[#F1F3F7]">
                        <span
                          className="block h-full rounded-full bg-[#2563eb]"
                          style={{ width: `${share}%` }}
                        />
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        </>
      ) : null}

      {tab === "Leads" ? (
        <section className="mt-6 rounded-[18px] border border-[#E5E7EB] bg-white p-6">
          <h2 className="text-lg font-bold text-[#111827]">Leads</h2>
          <p className="mt-1.5 text-[13px] text-[#6B7280]">
            Visitors your tracking links sent to {" "}
            <span className="font-medium text-[#4B5563]">your landing pages</span>, grouped by where
            the click came from.
          </p>

          {clicks.length === 0 ? (
            <p className="mt-6 text-sm text-[#6B7280]">
              No clicks in the last {DAYS} days. Once a post is live, every visit lands here.
            </p>
          ) : (
            <ul className="mt-5 divide-y divide-[#F2F4F7]">
              {Object.entries(
                clicks.reduce<Record<string, number>>((acc, c) => {
                  const host = (() => {
                    try {
                      return c.referer ? new URL(c.referer).hostname : "Direct / unknown";
                    } catch {
                      return "Direct / unknown";
                    }
                  })();
                  acc[host] = (acc[host] ?? 0) + 1;
                  return acc;
                }, {})
              )
                .sort((a, b) => b[1] - a[1])
                .map(([host, n]) => (
                  <li key={host} className="flex items-center justify-between py-3.5 text-sm">
                    <span className="text-[#111827]">{host}</span>
                    <span className="font-semibold text-[#4B5563]">{n}</span>
                  </li>
                ))}
            </ul>
          )}

          <p className="mt-6 rounded-[12px] border border-[#F2E2C0] bg-[#FDFAF2] p-4 text-[13px] leading-5 text-[#7A5A1E]">
            Named leads need your CRM connected. Until then this is click-level
            attribution only — it is not guessing at identities.
          </p>
        </section>
      ) : null}

      {tab === "Posts" ? (
        <section className="mt-6 rounded-[18px] border border-[#E5E7EB] bg-white p-6">
          <h2 className="text-lg font-bold text-[#111827]">Posts</h2>
          {deals.length === 0 ? (
            <p className="mt-4 text-sm text-[#6B7280]">Nothing published yet.</p>
          ) : (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[720px] text-left">
                <thead>
                  <tr className="border-b border-[#EEF0F4] text-[13px] text-[#6B7280]">
                    {["Creator", "Campaign", "Status", "Clicks", "Post"].map((h) => (
                      <th key={h} scope="col" className="py-4 font-medium">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {deals.map((d) => (
                    <tr key={d.id} className="border-b border-[#F5F6F8] text-sm last:border-b-0">
                      <td className="py-4 font-semibold text-[#111827]">{d.creatorName}</td>
                      <td className="py-4 text-[#4B5563]">
                        <Link href={`/app/campaigns/${d.campaign.id}`} className="hover:text-[#111827]">
                          {d.campaign.name}
                        </Link>
                      </td>
                      <td className="py-4 capitalize text-[#4B5563]">{d.status}</td>
                      <td className="py-4 font-semibold text-[#111827]">{d._count.clicks}</td>
                      <td className="py-4">
                        {d.postUrl ? (
                          <a
                            href={d.postUrl}
                            target="_blank"
                            rel="noreferrer noopener"
                            className="inline-flex items-center gap-1.5 font-medium text-[#2563eb]"
                          >
                            Open
                            <ExternalLink size={13} strokeWidth={1.8} aria-hidden />
                          </a>
                        ) : (
                          <span className="text-[#9CA3AF]">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      ) : null}
    </div>
  );
}

function Stat({ label, value, note }: { label: string; value: string; note: string }) {
  return (
    <div className="rounded-[18px] border border-[#E5E7EB] bg-white p-5">
      <p className="text-[13px] font-medium text-[#6B7280]">{label}</p>
      <p className="mt-2 text-[30px] font-bold leading-none tracking-[-0.02em] text-[#111827]">{value}</p>
      <p className="mt-2 text-[12px] text-[#9CA3AF]">{note}</p>
    </div>
  );
}

import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ArrowRight,
  CalendarCheck,
  CheckCircle2,
  MessageCircle,
  Sparkles,
  TrendingUp,
  Users,
  Wallet,
} from "lucide-react";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { compact, euro } from "@/lib/format";
import { isCommitted } from "@/lib/lifecycle";
import { rankCreatorsSemantic } from "@/lib/matching";
import { allCreators } from "@/lib/creator-profile";
import { conversationsFor } from "@/lib/messages";
import { LiveStatsProvider, LiveCount, LivePulse } from "@/components/app/LiveStats";

export const dynamic = "force-dynamic";

/**
 * The overview ranks creators too, so it can make the same model call.
 */
export const maxDuration = 60;
export const metadata = { title: "Overview — Naano" };

/**
 * The brand Overview, authored from naano's /app screen.
 *
 * It is deliberately not the creator Overview with different words. A creator
 * opens their workspace to see what they earned; a brand opens it to see what
 * is blocking the next post going live — so the to-do list sits above the
 * numbers, and every row on it is derived from the data rather than stored,
 * which is why it cannot tell a brand to add budget it already has.
 */
export default async function BrandOverview({
  searchParams,
}: {
  searchParams: Promise<{ welcome?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const { welcome } = await searchParams;

  const [campaigns, conversations] = await Promise.all([
    prisma.campaign.findMany({
      where: { brandId: user.id },
      orderBy: { createdAt: "desc" },
      include: { deals: { include: { _count: { select: { clicks: true } } } } },
    }),
    conversationsFor(user),
  ]);

  const deals = campaigns.flatMap((c) => c.deals);
  const clicks = deals.reduce((s, d) => s + d._count.clicks, 0);
  const spend = deals.filter((d) => isCommitted(d.status)).reduce((s, d) => s + d.price, 0);
  const live = deals.filter((d) => d.status === "live");
  const byDeal = Object.fromEntries(deals.map((d) => [d.id, d._count.clicks]));

  const { matches } = await rankCreatorsSemantic(
    await allCreators(),
    { icps: user.icps, valueProp: user.valueProp },
    4
  );
  const reach = matches.reduce((s, m) => s + m.creator.followers, 0);

  // Every row is a real blocker with a real destination. "Blocked" means the
  // next step cannot happen until it is done; "Suggested" means it can.
  const todo = [
    {
      label: "Add budget to book your first creator",
      detail: "Bookings are charged to your Naano balance.",
      href: "/app/billing",
      blocked: true,
      done: user.walletBalance > 0,
    },
    {
      label: "Create your first campaign",
      detail: "The brief creators see when you invite them.",
      href: "/app/campaigns/new",
      blocked: true,
      done: campaigns.length > 0,
    },
    {
      label: "Invite creators from AI Matching",
      detail: `${matches.length ? `${matches[0].score}% top match` : "Ranked against your ICPs"}.`,
      href: "/app/creators",
      blocked: false,
      done: deals.length > 0,
    },
    {
      label: "Review your value proposition",
      detail: "It is what every match is scored against.",
      href: "/register?role=saas&step=1",
      blocked: false,
      done: Boolean(user.valueProp),
    },
  ].filter((t) => !t.done);

  return (
    <LiveStatsProvider initial={{ total: clicks, byDeal }}>
      <div className="px-8 pb-16 pt-2">
        {welcome === "matching" ? (
          <p className="mb-6 flex items-center gap-2.5 rounded-[12px] border border-[#CFE0FF] bg-[#F5F8FF] px-4 py-3 text-sm text-[#1D4ED8]">
            <Sparkles size={16} strokeWidth={1.8} aria-hidden />
            Your profile is ready. Creators below are ranked against your ICPs.
          </p>
        ) : null}

        <h1 className="text-[40px] font-bold leading-[1.1] tracking-[-0.02em] text-[#111827]">
          Hello {user.name.split(" ")[0]} 👋
        </h1>
        <p className="mt-2 text-[15px] text-[#6B7280]">
          Here is what is happening for {user.companyName ?? "your company"} on Naano.
        </p>

        {/* ------------------------------------------------------------ stats */}
        <div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Stat
            icon={TrendingUp}
            label="Clicks attributed"
            value={<LiveCount initial={clicks} />}
            note={<LivePulse />}
          />
          <Stat icon={Users} label="Creators booked" value={String(deals.length)} sub={`${live.length} live`} />
          <Stat icon={Wallet} label="Balance" value={euro(user.walletBalance)} sub={`${euro(spend)} committed`} />
          <Stat
            icon={Sparkles}
            label="Cost per click"
            value={clicks ? `€${(spend / clicks).toFixed(2)}` : "—"}
            sub={clicks ? "across live posts" : "no clicks yet"}
          />
        </div>

        <div className="mt-5 grid items-start gap-5 xl:grid-cols-3">
          {/* ----------------------------------------------------- to do list */}
          <section className="rounded-[18px] border border-[#E5E7EB] bg-white p-6 xl:col-span-2">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-lg font-bold text-[#111827]">To do list</h2>
              <span className="text-[13px] text-[#6B7280]">{todo.length} left</span>
            </div>

            {todo.length === 0 ? (
              <p className="mt-6 flex items-center gap-2.5 text-sm text-[#15803D]">
                <CheckCircle2 size={16} strokeWidth={1.8} aria-hidden />
                Everything is set up. Your posts are running.
              </p>
            ) : (
              <ul className="mt-4 space-y-2.5">
                {todo.map((t) => (
                  <li key={t.label}>
                    <Link
                      href={t.href}
                      className="flex items-center gap-4 rounded-[12px] border border-[#EEF0F4] px-4 py-3.5 transition-colors hover:border-[#CFE0FF] hover:bg-[#FAFBFF]"
                    >
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-semibold text-[#111827]">{t.label}</span>
                        <span className="block text-[13px] text-[#6B7280]">{t.detail}</span>
                      </span>
                      <span
                        className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                          t.blocked ? "bg-[#FDF2F2] text-[#B42318]" : "bg-[#F3F4F6] text-[#4B5563]"
                        }`}
                      >
                        {t.blocked ? "Blocked" : "Suggested"}
                      </span>
                      <ArrowRight size={16} strokeWidth={1.8} aria-hidden className="shrink-0 text-[#9CA3AF]" />
                    </Link>
                  </li>
                ))}
              </ul>
            )}

            {/* ------------------------------------ ICP accounts in your target */}
            <h3 className="mt-8 text-[13px] font-bold uppercase tracking-[0.08em] text-[#6B7280]">
              ICP accounts in your target
            </h3>
            {user.icps.length === 0 ? (
              <p className="mt-3 text-sm text-[#6B7280]">
                No ICPs yet —{" "}
                <Link href="/register?role=saas&step=1" className="font-semibold text-[#2563eb]">
                  add your website
                </Link>{" "}
                and we will draft three.
              </p>
            ) : (
              <div className="mt-3 grid gap-2.5 sm:grid-cols-3">
                {user.icps.map((icp) => {
                  const [title, rest = ""] = icp.split("—");
                  return (
                    <div key={icp} className="rounded-[12px] bg-[#F7F8FA] p-4">
                      <p className="text-sm font-semibold text-[#111827]">{title.trim()}</p>
                      <p className="mt-1 text-[13px] leading-5 text-[#6B7280]">{rest.trim()}</p>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* ----------------------------------------------------- messages */}
          <section className="rounded-[18px] border border-[#E5E7EB] bg-white p-6">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-lg font-bold text-[#111827]">Messages</h2>
              <Link href="/app/messages" className="text-[13px] font-semibold text-[#2563eb]">
                See all
              </Link>
            </div>

            {conversations.length === 0 ? (
              <p className="mt-5 flex items-start gap-2.5 text-sm leading-6 text-[#6B7280]">
                <MessageCircle size={16} strokeWidth={1.8} aria-hidden className="mt-1 shrink-0" />
                No conversations yet. Book a creator and a thread opens here.
              </p>
            ) : (
              <ul className="mt-4 space-y-1">
                {conversations.slice(0, 4).map((c) => (
                  <li key={c.dealId}>
                    <Link
                      href={`/app/messages?thread=${c.dealId}`}
                      className="flex items-center gap-3 rounded-[12px] px-2 py-2.5 transition-colors hover:bg-[#F7F8FA]"
                    >
                      <span className="grid size-9 shrink-0 place-items-center rounded-full bg-[#E8F0FE] text-[13px] font-semibold text-[#2563eb]">
                        {c.counterpart.slice(0, 1)}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-semibold text-[#111827]">
                          {c.counterpart}
                        </span>
                        <span className="block truncate text-[13px] text-[#6B7280]">
                          {c.last ?? c.campaign}
                        </span>
                      </span>
                      {c.unread > 0 ? (
                        <span className="grid size-5 shrink-0 place-items-center rounded-full bg-[#2563eb] text-[11px] font-bold text-white">
                          {c.unread}
                        </span>
                      ) : null}
                    </Link>
                  </li>
                ))}
              </ul>
            )}

            {/* ----------------------------------------- book a free call */}
            <div className="mt-6 rounded-[14px] bg-[#111827] p-5 text-white">
              <CalendarCheck size={18} strokeWidth={1.8} aria-hidden className="text-[#93B4FF]" />
              <p className="mt-3 text-[15px] font-bold">Book a free call</p>
              <p className="mt-1.5 text-[13px] leading-5 text-white/70">
                Twenty minutes with the team to build your first campaign brief.
              </p>
              <Link
                href="/contact"
                className="mt-4 inline-flex rounded-[10px] bg-white px-4 py-2 text-[13px] font-semibold text-[#111827]"
              >
                Pick a slot
              </Link>
            </div>
          </section>
        </div>

        {/* ------------------------------------------------------ new creators */}
        <section className="mt-5 rounded-[18px] border border-[#E5E7EB] bg-white p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-[#111827]">New creators for you</h2>
              <p className="mt-1 text-[13px] text-[#6B7280]">
                {compact(reach)} combined reach · ranked against your ICPs
              </p>
            </div>
            <Link
              href="/app/creators"
              className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-[#2563eb]"
            >
              See all matches
              <ArrowRight size={14} strokeWidth={2} aria-hidden />
            </Link>
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {matches.map(({ creator, score, matched, total }) => (
              <article key={creator.id} className="rounded-[14px] border border-[#EEF0F4] p-4">
                <div className="flex items-start justify-between gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={creator.avatar} alt="" className="size-11 rounded-full bg-[#F3F4F6]" />
                  <span className="rounded-full bg-[#EFF4FF] px-2.5 py-1 text-[11px] font-bold text-[#2563eb]">
                    {score}% ICP
                  </span>
                </div>
                <p className="mt-3 truncate text-sm font-bold text-[#111827]">{creator.name}</p>
                <p className="mt-1 line-clamp-2 text-[13px] leading-5 text-[#6B7280]">
                  {creator.headline}
                </p>
                <p className="mt-2.5 text-[12px] text-[#9CA3AF]">
                  {compact(creator.followers)} followers ·{" "}
                  {total > 0 ? `${matched}/${total} ICPs` : creator.verticals[0]}
                </p>
                <Link
                  href={`/creators/${creator.slug}`}
                  className="mt-3.5 block rounded-[10px] border border-[#E5E7EB] py-2 text-center text-[13px] font-semibold text-[#111827] transition-colors hover:border-[#2563eb] hover:text-[#2563eb]"
                >
                  Add to campaign
                </Link>
              </article>
            ))}
          </div>
        </section>
      </div>
    </LiveStatsProvider>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
  sub,
  note,
}: {
  icon: typeof TrendingUp;
  label: string;
  value: React.ReactNode;
  sub?: string;
  note?: React.ReactNode;
}) {
  return (
    <div className="rounded-[18px] border border-[#E5E7EB] bg-white p-5">
      <div className="flex items-center justify-between">
        <span className="grid size-9 place-items-center rounded-[10px] bg-[#F5F8FF] text-[#2563eb]">
          <Icon size={17} strokeWidth={1.8} aria-hidden />
        </span>
        {note}
      </div>
      <p className="mt-3.5 text-[28px] font-bold leading-none tracking-[-0.02em] text-[#111827]">
        {value}
      </p>
      <p className="mt-2 text-[13px] font-medium text-[#4B5563]">{label}</p>
      {sub ? <p className="mt-0.5 text-[12px] text-[#9CA3AF]">{sub}</p> : null}
    </div>
  );
}

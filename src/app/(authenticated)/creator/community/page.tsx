import { redirect } from "next/navigation";
import Link from "next/link";
import { Check, ExternalLink, Share2 } from "lucide-react";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { MarketplaceCard } from "@/app/(public)/register/MarketplaceCard";
import { CREATORS } from "@/lib/creators";

export const metadata = { title: "Community — Naano" };

/**
 * /creator/community — naano's screen, on their cloud wash.
 *
 * Two panels over a leaderboard: the Slack room on the left, LinkedIn
 * visibility with the live card on the right, and a ranking of estimated
 * impressions underneath.
 *
 * The leaderboard is built from this build's own marketplace creators and
 * their median views, not from invented names — the figures are estimates and
 * the column says so.
 */
export default async function CommunityPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  // Onboarded signups first, then the seeded marketplace creators, ranked by
  // the reach a sponsored post is estimated to get.
  const signups = await prisma.user.findMany({
    where: { role: "creator", onboardedAt: { not: null } },
    select: { name: true, avatarUrl: true, medianViews: true, followers: true, creatorSlug: true },
  });

  const leaders = [
    ...signups.map((s) => ({
      name: s.name,
      avatar: s.avatarUrl,
      slug: s.creatorSlug,
      reach: (s.medianViews ?? Math.round((s.followers ?? 0) * 0.6)) * 6,
    })),
    ...CREATORS.map((c) => ({ name: c.name, avatar: c.avatar, slug: c.slug, reach: c.medianViews * 6 })),
  ]
    .filter((l, i, all) => all.findIndex((x) => x.slug === l.slug) === i)
    .sort((a, b) => b.reach - a.reach)
    .slice(0, 5);

  const compact = (n: number) =>
    n >= 1000 ? `${Math.round(n / 1000)}K` : String(n);
  const peak = Math.max(1, ...leaders.map((l) => l.reach));

  return (
    <div
      className="-mx-8 -mt-2 min-h-[calc(100vh-72px)] px-8 pb-16 pt-2"
      style={{
        backgroundImage:
          "radial-gradient(120% 90% at 50% 0%, rgba(219,234,255,0.75), rgba(255,255,255,0) 60%), linear-gradient(180deg,#F4F8FF,#FBFCFF)",
      }}
    >
      <div className="mx-auto max-w-[1340px]">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-[620px]">
            <h1 className="text-[40px] font-bold tracking-[-0.02em] text-[#111827]">Community</h1>
            <p className="mt-2 text-[15px] leading-[26px] text-[#6B7280]">
              Learn with other B2B creators, share what works and make your
              Naano identity visible.
            </p>
          </div>
          <span className="inline-flex items-center gap-2 rounded-full border border-[#E5E7EB] bg-white px-3.5 py-1.5 text-[13px] font-medium text-[#4B5563]">
            <span className="size-1.5 rounded-full bg-[#22C55E]" />
            Creator network
          </span>
        </div>

        <div className="mt-8 grid gap-5 lg:grid-cols-2">
          {/* ------------------------------------------------------ slack */}
          <section className="rounded-[18px] border border-[#E5E7EB] bg-white p-6">
            <div className="flex flex-wrap items-start gap-6">
              <div className="grid h-[128px] flex-1 min-w-[200px] place-items-center rounded-[14px] border border-[#EEF0F4] bg-[#FBFCFE]">
                <SlackMark />
                <div className="mt-3 flex -space-x-2">
                  {CREATORS.slice(0, 7).map((c) => (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img key={c.slug} src={c.avatar} alt="" className="size-7 rounded-full border-2 border-white bg-white object-cover" />
                  ))}
                </div>
              </div>
              <div className="min-w-[240px] flex-1">
                <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-[#6B7280]">
                  Naano creators on Slack
                </p>
                <h2 className="mt-2 text-[22px] font-bold leading-[1.2] tracking-[-0.02em] text-[#111827]">
                  The room where B2B creators get better together.
                </h2>
                <p className="mt-2 text-sm leading-6 text-[#6B7280]">
                  Ask for feedback on a sponsored post, compare campaign lessons,
                  meet creators in your language and help shape what Naano builds
                  next.
                </p>
              </div>
            </div>

            <ul className="mt-6 space-y-2.5 border-t border-[#EEF0F4] pt-6">
              {["Get feedback before you publish", "Share campaign tips that work", "Talk directly with the Naano team"].map((t) => (
                <li key={t} className="flex items-center gap-2.5 text-sm text-[#374151]">
                  <span className="grid size-5 shrink-0 place-items-center rounded-full bg-[#16A34A] text-white">
                    <Check size={12} strokeWidth={3} aria-hidden />
                  </span>
                  {t}
                </li>
              ))}
            </ul>

            <a
              href="https://slack.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 flex items-center justify-between gap-3 rounded-[12px] border border-[#E5E7EB] px-4 py-3.5 text-sm font-semibold text-[#111827] transition-colors hover:border-[#9CA3AF]"
            >
              <span className="inline-flex items-center gap-2.5">
                <SlackMark size={18} />
                Join the Slack community
              </span>
              <ExternalLink size={16} strokeWidth={1.8} aria-hidden className="text-[#6B7280]" />
            </a>
          </section>

          {/* --------------------------------------------------- linkedin */}
          <section className="rounded-[18px] border border-[#E5E7EB] bg-white p-6">
            <div className="flex items-start gap-4">
              <span className="grid size-12 shrink-0 place-items-center rounded-[12px] bg-[#0A66C2] text-white">
                <svg viewBox="0 0 24 24" className="size-6" fill="currentColor" aria-hidden>
                  <path d="M4.98 3.5A2.5 2.5 0 1 1 0 3.5a2.5 2.5 0 0 1 4.98 0ZM.24 8.25h4.5V24h-4.5V8.25Zm7.5 0h4.31v2.15h.06c.6-1.14 2.07-2.34 4.26-2.34 4.56 0 5.4 3 5.4 6.9V24h-4.5v-7.9c0-1.88-.03-4.3-2.62-4.3-2.62 0-3.02 2.05-3.02 4.16V24h-4.5V8.25Z" />
                </svg>
              </span>
              <div className="min-w-0">
                <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-[#6B7280]">
                  LinkedIn visibility
                </p>
                <h2 className="mt-1.5 text-[22px] font-bold leading-[1.2] tracking-[-0.02em] text-[#111827]">
                  Turn your LinkedIn profile into an always-on Deal Link
                </h2>
              </div>
            </div>

            <p className="mt-4 text-sm leading-6 text-[#6B7280]">
              Add your creator card to LinkedIn so brands can discover your work
              and join Naano through your attributed link.
            </p>

            <div className="mt-4 flex flex-wrap gap-5 rounded-[14px] border border-[#E0E7FF] bg-[#F5F8FF] p-5">
              <div className="shrink-0">
                <p className="text-[26px] font-bold tracking-[-0.02em] text-[#111827]">25%</p>
                <p className="mt-1 max-w-[150px] text-[13px] leading-5 text-[#6B7280]">
                  of Naano&apos;s commission for 3 months
                </p>
              </div>
              <p className="min-w-[220px] flex-1 text-[13px] leading-5 text-[#4B5563]">
                Leave your card on your LinkedIn profile. If a brand joins Naano
                through it, your reward is tracked automatically.
              </p>
            </div>

            <div className="mt-4 flex items-center gap-3 rounded-[14px] border border-[#EEF0F4] p-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo.svg" alt="" className="size-9 rounded-[8px] border border-[#EEF0F4] p-1.5" />
              <div>
                <p className="text-sm font-semibold text-[#111827]">Naano Creator</p>
                <p className="text-[13px] text-[#6B7280]">Naano · Independent</p>
                <p className="text-[13px] text-[#9CA3AF]">Present</p>
              </div>
            </div>

            <div className="mt-5 flex justify-center">
              <MarketplaceCard
                name={user.name}
                headline={user.headline}
                avatarUrl={user.avatarUrl}
                followers={user.followers}
                postCost={user.postCost}
                industries={user.industries}
                flag={user.flag}
                costLabel="Chosen cost"
                postDataPill
              />
            </div>

            <Link
              href="/creator/card"
              className="mt-5 flex items-center justify-between gap-3 rounded-[12px] bg-[#2563eb] px-5 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-[#1D4ED8]"
            >
              <span className="inline-flex items-center gap-2.5">
                <Share2 size={16} strokeWidth={1.8} aria-hidden />
                Publish my card
              </span>
              <span aria-hidden>→</span>
            </Link>
          </section>
        </div>

        {/* ---------------------------------------------------- leaderboard */}
        <section className="mt-5 rounded-[18px] border border-[#E5E7EB] bg-white p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-[#111827]">Naano campaign leaderboard</h2>
              <p className="mt-1 text-sm text-[#6B7280]">
                Estimated impressions generated by sponsored posts published for
                Naano brand collaborations.
              </p>
            </div>
            <span className="inline-flex rounded-[10px] border border-[#E5E7EB] bg-white p-1 text-sm">
              <span className="rounded-[7px] bg-[#EFF4FF] px-3 py-1.5 font-semibold text-[#2563eb]">
                Estimated impressions
              </span>
              <span className="px-3 py-1.5 font-medium text-[#6B7280]">Posts</span>
            </span>
          </div>

          <ol className="mt-6 divide-y divide-[#F1F2F5]">
            {leaders.map((l, i) => (
              <li key={l.slug ?? l.name} className="flex items-center gap-4 py-4">
                <span className={`grid size-7 shrink-0 place-items-center rounded-full text-xs font-bold ${
                  i === 0 ? "bg-[#FEF3C7] text-[#92400E]" : i === 1 ? "bg-[#F1F5F9] text-[#475569]" : i === 2 ? "bg-[#FDEBD8] text-[#9A5B1E]" : "text-[#9CA3AF]"
                }`}>
                  {i + 1}
                </span>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={l.avatar ?? "/logo.svg"} alt="" className="size-10 shrink-0 rounded-full bg-[#F3F4F6] object-cover" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold text-[#111827]">{l.name}</span>
                  <span className="block text-[13px] text-[#6B7280]">Public creator card</span>
                </span>
                <span className="hidden h-1.5 w-[38%] overflow-hidden rounded-full bg-[#EEF1F6] sm:block">
                  <span className="block h-full rounded-full bg-[#2563eb]" style={{ width: `${(l.reach / peak) * 100}%` }} />
                </span>
                <span className="shrink-0 text-right">
                  <span className="block text-sm font-bold text-[#111827]">{compact(l.reach)}</span>
                  <span className="block text-[11px] text-[#9CA3AF]">estimated Naano impressions</span>
                </span>
              </li>
            ))}
          </ol>
        </section>
      </div>
    </div>
  );
}

/** Slack's mark, inlined — lucide v1 carries no brand icons. */
function SlackMark({ size = 40 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 122 122" aria-hidden>
      <path fill="#36C5F0" d="M25.8 77a12.9 12.9 0 1 1-12.9-12.9h12.9V77Zm6.5 0a12.9 12.9 0 0 1 25.8 0v32.3a12.9 12.9 0 0 1-25.8 0V77Z" />
      <path fill="#2EB67D" d="M45.2 25.2a12.9 12.9 0 1 1 12.9-12.9v12.9H45.2Zm0 6.6a12.9 12.9 0 0 1 0 25.8H12.9a12.9 12.9 0 0 1 0-25.8h32.3Z" />
      <path fill="#ECB22E" d="M96.8 44.6a12.9 12.9 0 1 1 12.9 12.9H96.8V44.6Zm-6.5 0a12.9 12.9 0 0 1-25.8 0V12.3a12.9 12.9 0 0 1 25.8 0v32.3Z" />
      <path fill="#E01E5A" d="M77.4 96.4a12.9 12.9 0 1 1-12.9 12.9V96.4h12.9Zm0-6.5a12.9 12.9 0 0 1 0-25.8h32.3a12.9 12.9 0 0 1 0 25.8H77.4Z" />
    </svg>
  );
}

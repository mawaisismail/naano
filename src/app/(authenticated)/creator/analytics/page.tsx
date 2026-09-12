import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { DemoDataBanner } from "../DemoDataBanner";

/**
 * /creator/analytics — naano's Analytics screen, authored from their page.
 *
 *   h1       36 / 700 -0.02em #111827 with a 14/20 #6B7280 lead
 *   snapshot full-width card on a cloud wash, kicker 11/700 uppercase .12em
 *            with a green dot, h2 24 / 700, right rail 30 / 700 figure
 *   stats    four cards, label 13 / #6B7280, figure 30 / 700, note 12 #9CA3AF,
 *            icon 32 square radius 8 on #EFF4FF
 *   panels   7/5 split: recent posts (empty state) and profile summary rows
 *
 * Every figure that came from the import is zero or "Pending" here, exactly as
 * theirs is before the public-data job runs — the follower count is the one
 * number an import actually returns.
 */
export default async function AnalyticsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const followers = user.followers ?? 0;

  return (
    <div className="mx-auto max-w-[1340px]">
      <div className="flex flex-wrap items-start justify-between gap-4 pb-8 pt-2">
        <div>
          <h1 className="text-[36px] font-bold tracking-[-0.02em] text-[#111827]">Analytics</h1>
          <p className="mt-1 text-sm text-[#6B7280]">
            Public LinkedIn performance imported for this profile.
          </p>
        </div>
        <select
          aria-label="Period"
          defaultValue="All time"
          className="rounded-[10px] border border-[#E5E7EB] bg-white px-4 py-2.5 text-sm text-[#111827]"
        >
          <option>All time</option>
          <option>Last 30 days</option>
          <option>Last 90 days</option>
        </select>
      </div>

      <DemoDataBanner source={user.profileDataSource} />

      {/* ------------------------------------------------------- snapshot */}
      <section
        className="relative overflow-hidden rounded-[18px] border border-[#E8EDF6] p-8"
        style={{
          backgroundImage:
            "radial-gradient(120% 140% at 82% 20%, rgba(214,232,255,0.55), rgba(255,255,255,0) 62%), linear-gradient(180deg,#FFFFFF 0%,#F7FAFF 100%)",
        }}
      >
        <div className="flex flex-wrap items-center justify-between gap-8">
          <div className="min-w-0 max-w-[640px]">
            <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.12em] text-[#4B5563]">
              <span className="size-2 rounded-full bg-[#22C55E]" />
              Public LinkedIn snapshot
            </div>
            <h2 className="mt-3 text-2xl font-bold tracking-[-0.02em] text-[#111827]">
              Public LinkedIn posts are being imported
            </h2>
            <p className="mt-2 text-sm leading-6 text-[#6B7280]">
              The profile is ready. Post history and reach will appear after the
              public-data job completes.
            </p>
          </div>

          <div className="shrink-0 border-l border-[#E5E7EB] pl-8">
            <div className="text-[30px] font-bold tracking-[-0.02em] text-[#111827]">0%</div>
            <p className="mt-1 text-sm text-[#6B7280]">of imported posts include reach data</p>
            <span className="mt-3 inline-flex items-center gap-2 rounded-full border border-[#E5E7EB] bg-white px-3 py-1.5 text-[13px] text-[#4B5563]">
              <span className="size-1.5 rounded-full bg-[#22C55E]" />
              No public post found yet
            </span>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------- stats */}
      <div className="mt-5 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Public posts" value="0" note="Original LinkedIn posts found" icon="doc" />
        <Stat label="Public post reach" value="Pending" note="Waiting for public post data" icon="eye" />
        <Stat label="Public engagements" value="0" note="Reactions, comments and reposts" icon="pulse" />
        <Stat
          label="LinkedIn followers"
          value={followers.toLocaleString("en-GB")}
          note="Imported from the public profile"
          icon="users"
        />
      </div>

      {/* --------------------------------------------------------- panels */}
      <div className="mt-5 grid gap-5 lg:grid-cols-12">
        <section className="rounded-[18px] border border-[#E5E7EB] bg-white p-6 lg:col-span-7">
          <h3 className="text-lg font-bold text-[#111827]">Recent LinkedIn posts</h3>
          <p className="mt-1 text-sm text-[#6B7280]">Open the original post on LinkedIn.</p>
          <div className="grid min-h-[180px] place-items-center px-6 text-center">
            <div>
              <p className="text-sm font-semibold text-[#2563eb]">Public post import in progress</p>
              <p className="mt-2 text-sm text-[#6B7280]">
                The first public LinkedIn posts will appear here automatically.
              </p>
            </div>
          </div>
        </section>

        <section className="rounded-[18px] border border-[#E5E7EB] bg-white p-6 lg:col-span-5">
          <h3 className="text-lg font-bold text-[#111827]">Public profile summary</h3>
          <p className="mt-1 text-sm text-[#6B7280]">
            Automatically collected from public LinkedIn data.
          </p>
          <dl className="mt-6 space-y-5">
            <Row label="LinkedIn followers" value={followers.toLocaleString("en-GB")} fill={followers > 0 ? 100 : 0} />
            <Row label="Public posts" value="0" fill={0} />
            <Row label="Posts with reach data" value="0" fill={0} />
            <Row label="Public engagements" value="0" fill={0} />
          </dl>
        </section>
      </div>

      <section className="mt-5 flex items-start gap-4 rounded-[18px] border border-[#E5E7EB] bg-white p-6">
        <span className="grid size-9 shrink-0 place-items-center rounded-[10px] bg-[#EFF4FF] text-[#2563eb]">
          <svg viewBox="0 0 24 24" className="size-[18px]" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
            <path d="M12 3l7 3v6c0 4.4-3 7.6-7 9-4-1.4-7-4.6-7-9V6l7-3Z" />
          </svg>
        </span>
        <div>
          <p className="text-sm font-semibold text-[#111827]">
            Public LinkedIn data is being prepared
          </p>
          <p className="mt-1 text-sm text-[#6B7280]">
            Naano is collecting the creator&apos;s recent public posts. No personal
            LinkedIn connection is required.
          </p>
        </div>
      </section>
    </div>
  );
}

function Stat({ label, value, note, icon }: { label: string; value: string; note: string; icon: string }) {
  return (
    <div className="rounded-[18px] border border-[#E5E7EB] bg-white p-6">
      <div className="flex items-start justify-between gap-3">
        <span className="text-sm text-[#6B7280]">{label}</span>
        <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-[#EFF4FF] text-[#2563eb]">
          <Icon name={icon} />
        </span>
      </div>
      <div className="mt-4 text-[30px] font-bold tracking-[-0.02em] text-[#111827]">{value}</div>
      <p className="mt-1 text-xs text-[#9CA3AF]">{note}</p>
    </div>
  );
}

function Row({ label, value, fill }: { label: string; value: string; fill: number }) {
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <dt className="text-sm text-[#4B5563]">{label}</dt>
        <dd className="text-sm font-bold text-[#111827]">{value}</dd>
      </div>
      <div className="mt-2 h-1 overflow-hidden rounded-full bg-[#EEF1F6]">
        <div className="h-full rounded-full bg-[#2563eb]" style={{ width: `${fill}%` }} />
      </div>
    </div>
  );
}

function Icon({ name }: { name: string }) {
  const p = { viewBox: "0 0 24 24", className: "size-4", fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true };
  if (name === "doc") return <svg {...p}><rect x="4" y="3" width="16" height="18" rx="2" /><path d="M8 8h8M8 12h8M8 16h5" /></svg>;
  if (name === "eye") return <svg {...p}><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="3" /></svg>;
  if (name === "pulse") return <svg {...p}><path d="M3 12h4l2.5-7 5 14L17 12h4" /></svg>;
  return <svg {...p}><circle cx="9" cy="8" r="3.2" /><path d="M2.5 20a6.5 6.5 0 0 1 13 0" /><path d="M17 11a3 3 0 1 0-1.5-5.6M18 20a5.6 5.6 0 0 0-2-4.3" /></svg>;
}

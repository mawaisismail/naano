import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { DemoDataBanner } from "./DemoDataBanner";
import { CardActions } from "./CardActions";
import { MarketplaceCard } from "@/app/(public)/register/MarketplaceCard";

/**
 * /creator — the workspace overview, authored from naano's screen.
 *
 *   header   kicker 13 #6B7280 "Creator workspace", h1 36 / 700 -0.02em,
 *            lead 15 #6B7280
 *   stats    four cards; icon plus an 11/700 uppercase .06em label on one row,
 *            then a 30 / 700 figure and a 13 #9CA3AF note
 *   cards    "Your creator card" with the three controls stacked to its right
 *            and the live card beneath; "Your launch guide" beside it
 *   lower    "Recommended opportunities" and "Active collaborations"
 *
 * The opportunity and collaboration panels read the real tables rather than
 * rendering a picture of data: a creator with nothing live sees the empty
 * states, which is what a new account actually is.
 */
export default async function CreatorOverview() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const firstName = user.name.split(" ")[0];
  const followers = user.followers ?? 0;
  const compact = (n: number) =>
    n >= 1000 ? `${(n / 1000).toFixed(n >= 10_000 ? 0 : 1).replace(/\.0$/, "")}K` : String(n);

  // Campaigns this creator is not already booked on, newest first.
  const myDeals = await prisma.deal.findMany({
    where: { creatorId: user.id },
    include: { campaign: { include: { brand: true } } },
    orderBy: { createdAt: "desc" },
  });
  const bookedCampaignIds = new Set(myDeals.map((d) => d.campaignId));
  const opportunities = (
    await prisma.campaign.findMany({
      where: { status: "live" },
      include: { brand: true },
      orderBy: { createdAt: "desc" },
      take: 6,
    })
  )
    .filter((c) => !bookedCampaignIds.has(c.id))
    .slice(0, 3);

  const active = myDeals.filter((d) =>
    ["accepted", "draft", "scheduled", "live"].includes(d.status)
  );

  const steps = [
    {
      title: "Card and price ready",
      body: "Your positioning and offer are ready to review.",
      done: Boolean(user.onboardedAt),
    },
    {
      title: "Professional information",
      body: "Required before invoicing or withdrawing your earnings.",
      done: Boolean(user.invoiceMandateAcceptedAt),
      href: "/register?role=professional",
    },
  ];
  const complete = steps.filter((s) => s.done).length;

  return (
    <div className="mx-auto max-w-[1340px]">
      <div className="pb-8 pt-2">
        <p className="text-[13px] text-[#6B7280]">Creator workspace</p>
        <h1 className="mt-1 text-[36px] font-bold tracking-[-0.02em] text-[#111827]">
          Good to see you, {firstName}
        </h1>
        <p className="mt-1 text-[15px] text-[#6B7280]">Your creator activity, at a glance.</p>
      </div>

      <DemoDataBanner source={user.profileDataSource} />

      {/* ---------------------------------------------------------- stats */}
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <Stat icon="eye" label="Public post reach" value="—" note="Waiting for public post data" />
        <Stat icon="doc" label="Public posts" value="0" note="Original LinkedIn posts found" />
        <Stat icon="pulse" label="Public engagements" value="0" note="Reactions, comments and reposts" />
        <Stat icon="users" label="LinkedIn followers" value={compact(followers)} note="Imported from the public profile" />
      </div>

      {/* --------------------------------------------------- card + guide */}
      <div className="mt-5 grid gap-5 lg:grid-cols-12">
        <section className="rounded-[18px] border border-[#E5E7EB] bg-white p-6 lg:col-span-5">
          <div className="flex items-start justify-between gap-6">
            <div className="min-w-0">
              <h2 className="text-lg font-bold text-[#111827]">Your creator card</h2>
              <p className="mt-1 text-sm leading-6 text-[#6B7280]">
                This is how brands discover your positioning and collaboration offer.
              </p>
            </div>
            <CardActions slug={user.creatorSlug} />
          </div>

          <div className="mt-6 flex justify-center">
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
        </section>

        <section className="rounded-[18px] border border-[#E5E7EB] bg-white p-6 lg:col-span-7">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-[#111827]">Your launch guide</h2>
              <p className="mt-1 text-sm text-[#6B7280]">
                {complete} of {steps.length} steps complete
              </p>
            </div>
            <Link href={user.creatorSlug ? `/creators/${user.creatorSlug}` : "/creator/card"} className="text-sm font-semibold text-[#2563eb]">
              Open card
            </Link>
          </div>

          <ul className="mt-6 space-y-4">
            {steps.map((s) => (
              <li key={s.title} className="flex items-center gap-4">
                <span
                  className={`grid size-8 shrink-0 place-items-center rounded-full ${
                    s.done ? "bg-[#16A34A] text-white" : "border border-[#D1D5DB] text-[#9CA3AF]"
                  }`}
                >
                  <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                    {s.done ? <path d="m5 13 4 4L19 7" /> : <circle cx="12" cy="12" r="7" />}
                  </svg>
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-[#111827]">{s.title}</p>
                  <p className="mt-0.5 text-sm text-[#6B7280]">{s.body}</p>
                </div>
                {s.done ? (
                  <span className="rounded-[8px] bg-[#ECFDF3] px-3 py-1.5 text-xs font-semibold text-[#15803D]">
                    Complete
                  </span>
                ) : (
                  <Link href={s.href ?? "#"} className="rounded-[8px] border border-[#E5E7EB] px-3 py-1.5 text-xs font-semibold text-[#111827]">
                    Continue
                  </Link>
                )}
                <Link
                  href={s.href ?? (user.creatorSlug ? `/creators/${user.creatorSlug}` : "/creator/card")}
                  aria-label={s.title}
                  className="grid size-9 shrink-0 place-items-center rounded-[10px] border border-[#E5E7EB] text-[#6B7280] transition-colors hover:text-[#111827]"
                >
                  <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                    <path d="m9 6 6 6-6 6" />
                  </svg>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>

      {/* ------------------------------------ opportunities + collabs */}
      <div className="mt-5 grid gap-5 lg:grid-cols-12">
        <section className="rounded-[18px] border border-[#E5E7EB] bg-white p-6 lg:col-span-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-[#111827]">Recommended opportunities</h2>
              <p className="mt-1 text-sm text-[#6B7280]">
                {opportunities.length
                  ? `The ${opportunities.length} campaign${opportunities.length === 1 ? "" : "s"} that best match your audience.`
                  : "Campaigns matched to your audience will appear here."}
              </p>
            </div>
            <Link href="/creator/opportunities" className="shrink-0 text-sm font-semibold text-[#2563eb]">
              Explore
            </Link>
          </div>

          {opportunities.length ? (
            <ul className="mt-5 divide-y divide-[#F1F2F5]">
              {opportunities.map((c) => (
                <li key={c.id}>
                  <Link href="/creator/opportunities" className="flex items-center gap-3 py-3.5">
                    <span className="grid size-9 shrink-0 place-items-center rounded-[8px] bg-[#111827] text-xs font-bold uppercase text-white">
                      {(c.brand.companyName ?? c.brand.name).slice(0, 2)}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold text-[#111827]">
                        {c.brand.companyName ?? c.brand.name}
                      </span>
                      <span className="block truncate text-[13px] text-[#6B7280]">
                        {c.name} · open to your audience
                      </span>
                    </span>
                    <svg viewBox="0 0 24 24" className="size-4 shrink-0 text-[#2563eb]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                      <path d="M5 12h14m-7-7 7 7-7 7" />
                    </svg>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="py-10 text-center text-sm text-[#6B7280]">
              No open campaigns match your audience yet.
            </p>
          )}
        </section>

        <section className="rounded-[18px] border border-[#E5E7EB] bg-white p-6 lg:col-span-7">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-[#111827]">Active collaborations</h2>
              <p className="mt-1 text-sm text-[#6B7280]">
                Everything currently moving from brief to publication.
              </p>
            </div>
            <Link href="/creator/collaborations" className="shrink-0 text-sm font-semibold text-[#2563eb]">
              See all
            </Link>
          </div>

          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[520px] text-left">
              <thead>
                <tr className="border-b border-[#F1F2F5] text-[13px] text-[#6B7280]">
                  <th scope="col" className="pb-3 font-medium">Brand</th>
                  <th scope="col" className="pb-3 font-medium">Status</th>
                  <th scope="col" className="pb-3 font-medium">Next action</th>
                  <th scope="col" className="pb-3 font-medium">Due</th>
                  <th scope="col" className="pb-3 font-medium">Net</th>
                </tr>
              </thead>
              <tbody>
                {active.length ? (
                  active.map((d) => (
                    <tr key={d.id} className="border-b border-[#F7F8FA] text-sm last:border-b-0">
                      <td className="py-3.5 font-semibold text-[#111827]">
                        {d.campaign.brand.companyName ?? d.campaign.brand.name}
                      </td>
                      <td className="py-3.5 capitalize text-[#4B5563]">{d.status}</td>
                      <td className="py-3.5 text-[#4B5563]">
                        {d.status === "accepted" ? "Draft your post" : d.status === "draft" ? "Await approval" : "Publish"}
                      </td>
                      <td className="py-3.5 text-[#6B7280]">—</td>
                      <td className="py-3.5 font-semibold text-[#111827]">€{d.price}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-sm text-[#6B7280]">
                      No active collaborations.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}

function Stat({ icon, label, value, note }: { icon: string; label: string; value: string; note: string }) {
  return (
    <div className="rounded-[18px] border border-[#E5E7EB] bg-white p-6">
      <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.06em] text-[#6B7280]">
        <Icon name={icon} />
        {label}
      </div>
      <div className="mt-4 text-[30px] font-bold tracking-[-0.02em] text-[#111827]">{value}</div>
      <p className="mt-1 text-[13px] text-[#9CA3AF]">{note}</p>
    </div>
  );
}

function Icon({ name }: { name: string }) {
  const p = { viewBox: "0 0 24 24", className: "size-4 text-[#9CA3AF]", fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true };
  if (name === "doc") return <svg {...p}><rect x="4" y="3" width="16" height="18" rx="2" /><path d="M8 8h8M8 12h8M8 16h5" /></svg>;
  if (name === "eye") return <svg {...p}><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="3" /></svg>;
  if (name === "pulse") return <svg {...p}><path d="M3 12h4l2.5-7 5 14L17 12h4" /></svg>;
  return <svg {...p}><circle cx="9" cy="8" r="3.2" /><path d="M2.5 20a6.5 6.5 0 0 1 13 0" /><path d="M17 11a3 3 0 1 0-1.5-5.6M18 20a5.6 5.6 0 0 0-2-4.3" /></svg>;
}

import Link from "next/link";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { getCreator } from "@/lib/creators";
import { isOnboarded, toCreator } from "@/lib/creator-profile";
import { redirect } from "next/navigation";
import { euro, compact } from "@/lib/format";
import { STAGE_LABEL } from "@/lib/lifecycle";
import { StatusPill } from "@/components/app/StatusPill";
import { SubmitButton } from "@/components/app/SubmitButton";
import { acceptOffer, declineOffer, markPublished } from "./actions";

export const dynamic = "force-dynamic";

export default async function StudioPage() {
  const user = await getCurrentUser();
  if (user && user.role === "creator" && !isOnboarded(user)) {
    redirect("/studio/onboarding");
  }

  const slug = user?.creatorSlug ?? "";
  // Seeded demo accounts point at a creator in the seed file; real signups
  // carry their own profile on the user row.
  const me = getCreator(slug) ?? (user ? toCreator(user) : null);

  const deals = await prisma.deal.findMany({
    where: { creatorSlug: slug },
    orderBy: { createdAt: "desc" },
    include: {
      campaign: { select: { name: true, objective: true, keyMessages: true, guidelines: true, landingUrl: true } },
      _count: { select: { clicks: true } },
    },
  });

  const offers = deals.filter((d) => d.status === "invited");
  const active = deals.filter((d) => !["invited", "declined", "paid"].includes(d.status));
  const done = deals.filter((d) => d.status === "paid");

  const earned = done.reduce((s, d) => s + d.price, 0);
  const pending = active.reduce((s, d) => s + d.price, 0);
  const clicks = deals.reduce((s, d) => s + d._count.clicks, 0);

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <h1 className="font-display text-3xl font-extrabold text-ink">
        {user?.name}
      </h1>
      <p className="mt-1.5 text-sm text-muted">
        {me ? `${compact(me.followers)} followers · ${euro(me.postCost)} per post` : "Creator"}
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <Stat label="Paid out" value={euro(earned)} />
        <Stat label="In flight" value={euro(pending)} highlight />
        <Stat label="Clicks driven" value={compact(clicks)} />
      </div>

      {/* ------------------------------------------------------------ offers */}
      <section className="mt-12">
        <h2 className="font-display text-lg font-bold text-ink">
          Offers {offers.length > 0 && <Badge n={offers.length} />}
        </h2>
        {offers.length === 0 ? (
          <p className="mt-3 text-sm text-muted">No new offers.</p>
        ) : (
          <div className="mt-4 space-y-4">
            {offers.map((d) => (
              <div key={d.id} className="nn-card p-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <h3 className="font-display font-bold text-ink">{d.campaign.name}</h3>
                    <p className="mt-1 max-w-xl text-sm text-muted">{d.campaign.objective}</p>
                  </div>
                  <div className="text-right">
                    <div className="font-display text-2xl font-extrabold text-brand">
                      {euro(d.price)}
                    </div>
                    <div className="text-[10px] font-semibold uppercase tracking-wider text-grey">
                      per post
                    </div>
                  </div>
                </div>

                <details className="mt-4 rounded-xl border border-line bg-surface/40 p-4">
                  <summary className="cursor-pointer text-sm font-semibold text-ink">
                    Read the brief
                  </summary>
                  <Brief title="Key messages" body={d.campaign.keyMessages} />
                  <Brief title="Guidelines" body={d.campaign.guidelines} />
                </details>

                <div className="mt-5 flex gap-2">
                  <form action={acceptOffer.bind(null, d.id)}>
                    <SubmitButton pendingLabel="Accepting…" className="px-5 py-2.5 text-sm">
                      Accept {euro(d.price)}
                    </SubmitButton>
                  </form>
                  <form action={declineOffer.bind(null, d.id)}>
                    <SubmitButton variant="danger" pendingLabel="Declining…" className="px-5 py-2.5 text-sm">
                      Decline
                    </SubmitButton>
                  </form>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ------------------------------------------------------------ active */}
      <section className="mt-12">
        <h2 className="font-display text-lg font-bold text-ink">In flight</h2>
        {active.length === 0 ? (
          <p className="mt-3 text-sm text-muted">Nothing in flight.</p>
        ) : (
          <div className="mt-4 space-y-3">
            {active.map((d) => (
              <div key={d.id} className="nn-card p-5">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-3">
                      <span className="font-display font-bold text-ink">{d.campaign.name}</span>
                      <StatusPill status={d.status} />
                    </div>
                    <div className="mt-1 text-xs text-muted">
                      {euro(d.price)} · your link{" "}
                      <span className="font-mono text-ink">/r/{d.trackingCode}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="font-display text-xl font-extrabold text-brand">
                        {d._count.clicks}
                      </div>
                      <div className="text-[10px] font-semibold uppercase tracking-wider text-grey">
                        clicks
                      </div>
                    </div>

                    {d.status !== "live" && (
                      <form action={markPublished.bind(null, d.id)} className="flex gap-2">
                        <input
                          name="postUrl"
                          placeholder="Paste your post URL"
                          className="w-44 rounded-lg border border-line px-3 py-2 text-xs outline-none focus:border-brand"
                        />
                        <SubmitButton pendingLabel="Publishing…">
                          Mark published
                        </SubmitButton>
                      </form>
                    )}
                    {d.status === "live" && (
                      <span className="text-xs font-semibold text-success">
                        Published · earning
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ------------------------------------------------------------ payouts */}
      <section className="mt-12">
        <h2 className="font-display text-lg font-bold text-ink">Payouts</h2>
        {done.length === 0 ? (
          <p className="mt-3 text-sm text-muted">
            Nothing paid out yet. Payouts appear here once a brand settles a live post.
          </p>
        ) : (
          <div className="mt-4 space-y-2">
            {done.map((d) => (
              <div
                key={d.id}
                className="nn-card flex items-center justify-between p-4 text-sm"
              >
                <span className="font-medium text-ink">{d.campaign.name}</span>
                <span className="font-display font-bold text-success">
                  {euro(d.price)} paid
                </span>
              </div>
            ))}
          </div>
        )}
        <p className="mt-4 text-xs text-grey">
          Settlement is deliberately not built — Stripe Connect and KYC are days of
          work and look identical to a database row in a demo.
        </p>
      </section>

      <Link
        href="/marketplace"
        className="mt-12 inline-block text-sm font-semibold text-brand hover:underline"
      >
        See how you appear in the marketplace →
      </Link>
    </div>
  );
}

function Stat({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="nn-card p-5">
      <div className="nn-eyebrow">{label}</div>
      <div className={`mt-1.5 font-display text-2xl font-extrabold ${highlight ? "text-brand" : "text-ink"}`}>
        {value}
      </div>
    </div>
  );
}

function Badge({ n }: { n: number }) {
  return (
    <span className="ml-2 rounded-full bg-brand px-2 py-0.5 align-middle text-[11px] font-bold text-white">
      {n}
    </span>
  );
}

function Brief({ title, body }: { title: string; body: string }) {
  return (
    <div className="mt-3">
      <div className="nn-eyebrow">{title}</div>
      <ul className="mt-1.5 space-y-1">
        {body.split("\n").filter(Boolean).map((l, i) => (
          <li key={i} className="flex gap-2 text-[13px] leading-relaxed text-ink">
            <span className="mt-1.5 size-1 shrink-0 rounded-full bg-brand" />
            {l}
          </li>
        ))}
      </ul>
    </div>
  );
}

import Link from "next/link";
import { notFound } from "next/navigation";
import { Nav } from "@/components/site/Nav";
import { Footer } from "@/components/site/Footer";
import { CREATORS, getCreator, followerTier } from "@/lib/creators";
import { allCreators } from "@/lib/creator-profile";
import { compact, euro } from "@/lib/format";

// Signed-up creators are not known at build time, so this page renders on
// demand. generateStaticParams would only ever cover the seeded ones.
export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const slug = (await params).slug;
  const c = getCreator(slug) ?? (await allCreators()).find((x) => x.slug === slug);
  return c
    ? { title: `${c.name} — Naano`, description: c.headline }
    : { title: "Creator not found — Naano" };
}

export default async function CreatorPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const slug = (await params).slug;
  const all = await allCreators();
  const c = all.find((x) => x.slug === slug);
  if (!c) notFound();

  const similar = all.filter(
    (x) => x.id !== c.id && x.verticals[0] === c.verticals[0]
  ).slice(0, 3);

  return (
    <>
      <Nav />
      <main className="min-h-screen bg-[#fbfcff] pt-[73px]">
        <div className="nn-sky border-b border-line">
          <div className="mx-auto max-w-5xl px-5 pb-12 pt-10">
            <Link href="/marketplace" className="text-sm font-medium text-muted hover:text-ink">
              ← Back to marketplace
            </Link>

            <div className="mt-7 flex flex-wrap items-start gap-6">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={c.avatar}
                alt=""
                width={104}
                height={104}
                className="size-26 rounded-full border-4 border-white bg-brand-soft shadow-sm"
              />
              <div className="min-w-64 flex-1">
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="font-display text-3xl font-extrabold text-ink">{c.name}</h1>
                  <span className="grid size-5 place-items-center rounded-[3px] bg-[#0a66c2] text-[10px] font-bold text-white">
                    in
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full border border-line bg-white px-2.5 py-0.5 text-xs font-medium text-muted">
                    <span aria-hidden>{c.flag}</span> {c.country}
                  </span>
                </div>
                <p className="mt-2 max-w-xl text-muted">{c.headline}</p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {c.verticals.map((v) => (
                    <span
                      key={v}
                      className="rounded-full bg-brand-soft px-3 py-1 text-xs font-semibold text-brand"
                    >
                      {v}
                    </span>
                  ))}
                </div>
              </div>

              <div className="nn-card w-full p-6 sm:w-64">
                <div className="nn-eyebrow">Cost per post</div>
                <div className="mt-1 font-display text-4xl font-extrabold text-ink">
                  {euro(c.postCost)}
                </div>
                <div className="mt-1 text-xs text-muted">Flat fee, set by the creator</div>
                <Link
                  href={`/app/campaigns/new?creators=${c.id}`}
                  className="mt-5 block rounded-full bg-brand px-5 py-2.5 text-center text-sm font-semibold text-white transition hover:bg-brand-strong"
                >
                  Book this creator
                </Link>
                <div className="mt-4 flex items-baseline justify-between border-t border-line pt-3">
                  <span className="nn-eyebrow">Matching</span>
                  <span className="font-display text-sm font-bold text-brand">
                    {c.matchScore}
                    <span className="text-grey">/100</span>
                  </span>
                </div>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-brand-soft">
                  <div className="h-full rounded-full bg-brand" style={{ width: `${c.matchScore}%` }} />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-5xl px-5 py-12">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ["Followers", compact(c.followers), followerTier(c.followers)],
              ["Median views", compact(c.medianViews), "per post"],
              ["Engagement rate", `${c.engagementRate}%`, "reactions ÷ views"],
              ["Reactions", compact(c.reactionsPerPost), `${c.commentsPerPost} comments`],
            ].map(([l, v, s]) => (
              <div key={l} className="nn-card p-6">
                <div className="nn-eyebrow">{l}</div>
                <div className="mt-1.5 font-display text-2xl font-extrabold text-ink">{v}</div>
                <div className="mt-0.5 text-xs text-muted">{s}</div>
              </div>
            ))}
          </div>

          <div className="mt-8 grid gap-6 md:grid-cols-[1fr_280px]">
            <div className="nn-card p-8">
              <div className="nn-eyebrow">About</div>
              <p className="mt-3 leading-relaxed text-ink">{c.bio}</p>
            </div>
            <div className="nn-card p-8">
              <div className="nn-eyebrow">Who they target (est.)</div>
              <ul className="mt-3 space-y-2">
                {c.icp.map((i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-ink">
                    <span className="size-1.5 rounded-full bg-brand" />
                    {i}
                  </li>
                ))}
              </ul>
              <p className="mt-4 text-xs text-grey">
                Estimated from public posts and profile.
              </p>
            </div>
          </div>

          {similar.length > 0 && (
            <div className="mt-14">
              <h2 className="font-display text-xl font-bold text-ink">
                Similar creators in {c.verticals[0]}
              </h2>
              <div className="mt-5 grid gap-4 sm:grid-cols-3">
                {similar.map((s) => (
                  <Link
                    key={s.id}
                    href={`/creators/${s.slug}`}
                    className="nn-card flex items-center gap-3 p-4 transition hover:border-brand/40"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={s.avatar} alt="" width={40} height={40} className="size-10 rounded-full bg-brand-soft" />
                    <div className="min-w-0">
                      <div className="truncate font-display text-sm font-bold text-ink">{s.name}</div>
                      <div className="text-xs text-muted">
                        {compact(s.followers)} followers · {euro(s.postCost)}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}

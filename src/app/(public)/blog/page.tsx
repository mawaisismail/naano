import type { Metadata } from "next";
import Link from "next/link";
import { DocsNav } from "@/components/site/DocsNav";
import { DocsFooter } from "@/components/site/DocsFooter";
import { ALL_POSTS, CATEGORIES, FEATURED, POSTS, authorFor, artFor } from "@/lib/blog";

/**
 * /blog — the Naano Journal index, rebuilt from their page.
 *
 * Like /free-tools this page sits outside the 1672 design frame: the document
 * is 11649 tall at both 1440 and 1672. Everything is plain responsive CSS, set
 * in Plus Jakarta Sans, on Tailwind's default grey ramp rather than the
 * marketing palette. Measured at 1440:
 *
 *   hero      padding 144 24 80, inner max-w-1200
 *             kicker   11 / 16.5 / 600 / 1.98px / #6B7280, count in 400
 *             h1       clamp(36px,5.4vw,68px) / 1.02 / 300 / -0.025em #111827
 *             lead     18 / 29.25 / #4B5563, max-w-2xl
 *             topics   mt-40; label 10/15/600/1.6px #9CA3AF, then pills
 *                      12 / 18 / #4B5563, 1px #E5E7EB, px 12 py 4, full radius
 *   featured  padding 64 24 48; label "Latest" 10/15/600/1.8px #6B7280
 *             card is a bare 12-col grid (no border, no panel), gap 32/48
 *             art   col-span-7, 16/10 → 16/9, radius 16, category gradient
 *                   over a 28px dotted overlay at 16% and a black/25 corner
 *             h2    clamp(26px,3.6vw,42px) / 1.08 / 300 / -0.02em, mb 20
 *             lead  16 / 26 / #4B5563, mb 28
 *             meta  12 / 16 / #6B7280, 24 avatar chip, 4px dot separators
 *             cta   14 / 20 / 500 #111827
 *   grid      padding 32 24 96; header row "More articles" + count
 *             ul grid gap-x-32 gap-y-48, 3-up at lg (cells 379 wide)
 *             art 16/10 radius 12, mb 20; category 10/15/600/1.6px #6B7280
 *             h3 20 → 22 / 1.25 / 500 / -0.01em #111827; excerpt 14/22.75
 */

export const metadata: Metadata = {
  title: "Blog | Naano",
  description:
    "Field notes from the team building Naano: on LinkedIn distribution, CPL economics, and how B2B brands grow through creators.",
};

const DOT = <span aria-hidden className="size-1 rounded-full bg-[#D1D5DB]" />;

export default function BlogPage() {
  return (
    <div className="nn-doc bg-white">
      <DocsNav />

      {/* ------------------------------------------------------------ hero */}
      <section className="px-4 pb-14 pt-32 sm:px-6 sm:pb-20 sm:pt-36">
        <div className="mx-auto max-w-[1200px]">
          <div className="mb-6 flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#6B7280]">
            <span>Naano Journal</span>
            {DOT}
            <span className="font-normal">{ALL_POSTS.length} articles</span>
          </div>
          <h1 className="mb-6 max-w-[885px] font-light leading-[1.02] tracking-[-0.025em] text-[#111827] text-[clamp(36px,5.4vw,68px)]">
            Notes on creator-led growth.
          </h1>
          <p className="max-w-2xl text-base leading-relaxed text-[#4B5563] sm:text-lg">
            Field notes from the team building Naano: on LinkedIn distribution,
            CPL economics, and how B2B brands grow through creators.
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#9CA3AF]">
              Topics
            </span>
            {CATEGORIES.map((c) => (
              <span
                key={c}
                className="rounded-full border border-[#E5E7EB] px-3 py-1 text-[12px] text-[#4B5563]"
              >
                {c}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* -------------------------------------------------------- featured */}
      <section className="px-4 pb-12 pt-12 sm:px-6 sm:pt-16">
        <div className="mx-auto max-w-[1200px]">
          <p className="mb-6 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#6B7280]">
            Latest
          </p>
          <Link
            href={`/blog/${FEATURED.slug}`}
            className="group grid items-center gap-8 rounded-[18px] lg:grid-cols-12 lg:gap-12"
          >
            <div
              className="relative aspect-[16/10] overflow-hidden rounded-[18px] transition-transform duration-300 group-hover:scale-[1.01] sm:aspect-[16/9] lg:col-span-7"
              style={{ background: artFor(FEATURED.category) }}
            >
              <span
                aria-hidden
                className="absolute inset-0 opacity-[0.16]"
                style={{
                  backgroundImage:
                    "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
                  backgroundSize: "28px 28px",
                }}
              />
              <span
                aria-hidden
                className="absolute inset-0 bg-gradient-to-tr from-black/25 via-transparent to-transparent"
              />
              <span className="absolute left-6 top-6 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/90 sm:left-8 sm:top-8">
                {FEATURED.category}
              </span>
            </div>

            <div className="lg:col-span-5">
              <h2 className="mb-5 font-light leading-[1.08] tracking-[-0.02em] text-[#111827] decoration-[#111827]/20 underline-offset-4 group-hover:underline text-[clamp(26px,3.6vw,42px)]">
                {FEATURED.title}
              </h2>
              <p className="mb-7 max-w-prose text-base leading-relaxed text-[#4B5563]">
                {FEATURED.excerpt}
              </p>
              <div className="mb-7 flex items-center gap-4 text-xs text-[#6B7280]">
                <span className="flex items-center gap-2">
                  <span className="flex size-6 items-center justify-center rounded-full bg-[#F3F4F6] text-[10px] font-medium text-[#4B5563]">
                    {initials(authorFor(FEATURED.slug))}
                  </span>
                  {authorFor(FEATURED.slug)}
                </span>
                {DOT}
                <span className="inline-flex items-center gap-1.5">
                  <ClockIcon />
                  {FEATURED.readMins} min read
                </span>
                {DOT}
                <span className="inline-flex items-center gap-1.5">
                  <CalendarIcon />
                  {FEATURED.date}
                </span>
              </div>
              <span className="inline-flex items-center gap-1.5 text-sm font-medium text-[#111827] transition-all duration-200 group-hover:gap-2.5">
                Read article
                <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d="M5 12h14" />
                  <path d="m12 5 7 7-7 7" />
                </svg>
              </span>
            </div>
          </Link>
        </div>
      </section>

      {/* ------------------------------------------------------------ grid */}
      <section className="px-4 pb-24 pt-8 sm:px-6">
        <div className="mx-auto max-w-[1200px]">
          <div className="mb-8 flex items-baseline justify-between border-b border-[#F3F4F6] pb-5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#6B7280]">
              More articles
            </p>
            <span className="text-xs text-[#9CA3AF]">{POSTS.length}</span>
          </div>

          <ul className="grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {POSTS.map((post) => (
              <li key={post.slug}>
                <Link href={`/blog/${post.slug}`} className="group block rounded-[14px]">
                  <div
                    className="relative mb-5 aspect-[16/10] overflow-hidden rounded-[14px] transition-transform duration-300 group-hover:scale-[1.015]"
                    style={{ background: artFor(post.category) }}
                  >
                    <span
                      aria-hidden
                      className="absolute inset-0 opacity-[0.16]"
                      style={{
                        backgroundImage:
                          "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
                        backgroundSize: "22px 22px",
                      }}
                    />
                  </div>
                  <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#6B7280]">
                    {post.category}
                  </p>
                  <h3 className="mb-3 text-[20px] font-medium leading-[1.25] tracking-[-0.01em] text-[#111827] decoration-[#111827]/20 underline-offset-4 group-hover:underline sm:text-[22px]">
                    {post.title}
                  </h3>
                  <p className="mb-5 line-clamp-2 text-sm leading-relaxed text-[#4B5563]">
                    {post.excerpt}
                  </p>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-[#6B7280]">
                    <span>{authorFor(post.slug)}</span>
                    {DOT}
                    <span className="inline-flex items-center gap-1.5">
                      <ClockIcon />
                      {post.readMins} min read
                    </span>
                    {DOT}
                    <span className="inline-flex items-center gap-1.5">
                      <CalendarIcon />
                      {post.date}
                    </span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <DocsFooter />
    </div>
  );
}

function initials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2);
}

function ClockIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="12" cy="12" r="10" />
      <path d="M12 6v6l4 2" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect width="18" height="18" x="3" y="4" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18" />
    </svg>
  );
}

import Link from "next/link";
import type { Creator } from "@/lib/creators";
import { compact, euro, cx } from "@/lib/format";

/**
 * Marketplace creator card, matched to naano's own.
 *
 * Everything below the strip is centre-aligned, the rank number sits on the
 * left of the strip in readable grey (it was white-on-white and invisible),
 * the checkbox and LinkedIn badge pair up top-left, and Book is a white pill
 * rather than a solid blue one.
 */
export function CreatorCard({
  creator,
  rank,
  selected,
  onSelect,
  onBook,
  favourite,
  onFavourite,
  preview = false,
}: {
  creator: Creator;
  rank?: number;
  selected?: boolean;
  onSelect?: (id: string) => void;
  onBook?: (id: string) => void;
  favourite?: boolean;
  onFavourite?: (id: string) => void;
  /** Static chrome for the landing-page mockup: shows the controls naano's
   *  cards carry, without wiring them to anything. */
  preview?: boolean;
}) {
  const c = creator;

  return (
    <div className="nn-card group flex flex-col overflow-hidden transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_2px_4px_rgba(15,23,42,0.05),0_18px_44px_-20px_rgba(22,82,240,0.35)]">
      {/* ---------------------------------------------------------- strip */}
      <div
        className="relative h-[96px] bg-[#cfe7fa]"
        style={{
          backgroundImage: "url('/lp/hero-clouds.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center 62%",
        }}
      >
        {rank !== undefined && (
          // Ghosted rank, as on naano's card. Previously pure white on a
          // near-white strip, which made it invisible; now a translucent slate
          // so it reads as a watermark without competing with the controls.
          <span
            aria-hidden
            className="pointer-events-none absolute bottom-1 left-3 select-none font-sans text-[52px] font-semibold leading-none text-white/70"
          >
            {rank}
          </span>
        )}

        <div className="absolute left-3 top-3 z-10 flex items-center gap-1.5">
          {/* Preview renders inert markup on purpose: this component is rendered
              from a server component for the landing mockup, and attaching an
              onChange there throws "Event handlers cannot be passed to Client
              Component props". */}
          {preview ? (
            <span aria-hidden className="grid size-[22px] place-items-center rounded-[7px] bg-white/90 shadow-sm">
              <span className="size-3 rounded-[3px] border border-line bg-white" />
            </span>
          ) : (
            onSelect && (
              <span className="grid size-[22px] place-items-center rounded-[7px] bg-white/90 shadow-sm">
                <input
                  type="checkbox"
                  checked={!!selected}
                  onChange={() => onSelect(c.id)}
                  aria-label={`Select ${c.name}`}
                  className="size-3 cursor-pointer rounded-[3px] border-line accent-[#1652f0]"
                />
              </span>
            )
          )}
          <span className="grid size-[22px] place-items-center rounded-[7px] bg-[#0a66c2] text-[11px] font-bold leading-none text-white shadow-sm">
            in
          </span>
        </div>

        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/lp/naano-logo-nav.png"
          alt=""
          className="absolute left-1/2 top-[14px] h-[22px] w-auto -translate-x-1/2 object-contain"
        />

        <div className="absolute right-3 top-3 z-10 flex items-center gap-1.5">
          {preview ? (
            <>
              <span aria-hidden className="rounded-full border border-line bg-white px-3.5 py-1.5 text-[12px] font-semibold text-ink shadow-sm">
                Book
              </span>
              <span aria-hidden className="grid size-[26px] place-items-center rounded-full border border-line bg-white text-xs leading-none text-grey shadow-sm">
                ☆
              </span>
            </>
          ) : (
            <>
              {onBook && (
                <button
                  onClick={() => onBook(c.id)}
                  className="rounded-full border border-line bg-white px-3.5 py-1.5 text-[12px] font-semibold text-ink shadow-sm transition hover:border-brand hover:text-brand"
                >
                  Book
                </button>
              )}
              {onFavourite && (
                <button
                  onClick={() => onFavourite(c.id)}
                  aria-label={favourite ? "Remove from shortlist" : "Add to shortlist"}
                  aria-pressed={!!favourite}
                  className={cx(
                    "grid size-[26px] place-items-center rounded-full border border-line bg-white text-xs leading-none shadow-sm transition",
                    favourite ? "text-brand" : "text-grey hover:text-ink"
                  )}
                >
                  {favourite ? "★" : "☆"}
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* ------------------------------------------------------- identity */}
      {/* relative z-10: the strip above is positioned, so it paints in the
          positioned layer and was covering the lower half of the avatar that
          overlaps it. This block has to join that layer to sit on top. */}
      <div className="relative z-10 -mt-[42px] flex flex-col items-center px-5 text-center">
        {/* ring-1: a plain white border vanishes against the cloud strip */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={c.avatar}
          alt=""
          width={76}
          height={76}
          className="size-[76px] rounded-full border-[4px] border-white bg-white object-cover shadow-[0_2px_10px_rgba(15,23,42,0.18)] ring-1 ring-black/[0.06]"
        />

        <Link
          href={`/creators/${c.slug}`}
          className="mt-2.5 font-display text-[15px] font-bold text-ink hover:text-brand"
        >
          {c.name}
        </Link>

        <div className="mt-1 text-[12px] font-medium text-muted">
          {c.verticals.join(" · ")}
        </div>

        <span className="mt-2 inline-flex items-center gap-1.5 rounded-md border border-line bg-white px-2 py-0.5 text-[11px] font-medium text-muted">
          <span aria-hidden>{c.flag}</span>
          {c.country || c.countryCode}
        </span>

        <p className="mt-2.5 line-clamp-2 text-[12px] leading-relaxed text-muted">
          {c.bio}
        </p>
      </div>

      {/* ------------------------------------------------------- matching */}
      <div className="mt-4 px-5">
        <div className="flex items-baseline justify-between">
          <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-brand">
            ● Matching
          </span>
          <span className="text-[12px] font-bold text-ink">{c.matchScore}/100</span>
        </div>
        <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-brand-soft">
          <div className="h-full rounded-full bg-brand" style={{ width: `${c.matchScore}%` }} />
        </div>
      </div>

      {/* ---------------------------------------------------------- stats */}
      <div className="mx-3 mb-3 mt-4 grid grid-cols-3 divide-x divide-line rounded-xl border border-line/70 bg-[#fbfcfe]">
        <Stat label="Followers" value={compact(c.followers)} />
        <Stat label="Median views" value={compact(c.medianViews)} />
        <Stat label="Post cost" value={euro(c.postCost)} />
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="px-1 py-3 text-center">
      <div className="font-display text-[13px] font-bold text-ink">{value}</div>
      {/* nowrap: "Median views" was wrapping to two lines and knocking the
          three cells out of alignment */}
      <div className="mt-0.5 whitespace-nowrap text-[9px] font-semibold uppercase tracking-[0.06em] text-grey">
        {label}
      </div>
    </div>
  );
}

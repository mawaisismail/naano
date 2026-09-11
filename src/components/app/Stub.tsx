import Link from "next/link";

/**
 * A deliberately-cut feature, shown rather than hidden.
 *
 * The brief scores product judgement on what got left out, so the cut is made
 * visible and reasoned instead of the nav link quietly 404ing.
 */
export function Stub({
  title,
  why,
  instead,
}: {
  title: string;
  why: string;
  instead: string;
}) {
  return (
    <div className="mx-auto max-w-2xl px-6 py-20">
      <div className="nn-card p-10">
        <span className="rounded-full bg-surface px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-grey">
          Deliberately not built
        </span>
        <h1 className="mt-4 font-display text-2xl font-extrabold text-ink">{title}</h1>
        <p className="mt-4 leading-relaxed text-muted">{why}</p>
        <p className="mt-4 leading-relaxed text-ink">
          <span className="font-semibold">Built instead: </span>
          {instead}
        </p>
        <Link
          href="/app"
          className="mt-8 inline-block rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-strong"
        >
          Back to dashboard
        </Link>
      </div>
    </div>
  );
}

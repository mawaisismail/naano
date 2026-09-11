import Link from "next/link";

export default function NotFound() {
  return (
    <main className="nn-sky grid min-h-screen place-items-center px-6">
      <div className="text-center">
        <div className="nn-eyebrow">404</div>
        <h1 className="mt-3 font-display text-4xl font-extrabold text-ink">
          That page doesn&apos;t exist
        </h1>
        <p className="mt-3 text-muted">
          The link may be old, or the creator may have left the marketplace.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            href="/marketplace"
            className="rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-strong"
          >
            Browse creators
          </Link>
          <Link
            href="/"
            className="rounded-full border border-line bg-white px-5 py-2.5 text-sm font-semibold text-ink transition hover:border-grey"
          >
            Home
          </Link>
        </div>
      </div>
    </main>
  );
}

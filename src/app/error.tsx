"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // In a real deployment this goes to Sentry. Logging it is the minimum;
    // silently swallowing a render error is how bugs survive a demo.
    console.error(error);
  }, [error]);

  return (
    <main className="nn-sky grid min-h-screen place-items-center px-6">
      <div className="max-w-md text-center">
        <div className="nn-eyebrow">Something broke</div>
        <h1 className="mt-3 font-display text-3xl font-extrabold text-ink">
          That didn&apos;t work
        </h1>
        <p className="mt-3 text-muted">
          The error has been logged. Try again, or head back to the marketplace.
        </p>
        {error.digest && (
          <p className="mt-2 font-mono text-[11px] text-grey">ref {error.digest}</p>
        )}
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <button
            onClick={reset}
            className="rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-strong"
          >
            Try again
          </button>
          <Link
            href="/marketplace"
            className="rounded-full border border-line bg-white px-5 py-2.5 text-sm font-semibold text-ink transition hover:border-grey"
          >
            Marketplace
          </Link>
        </div>
      </div>
    </main>
  );
}

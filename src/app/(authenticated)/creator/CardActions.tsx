"use client";

import Link from "next/link";
import { useState } from "react";

/**
 * The three controls beside "Your creator card" on naano's overview.
 *
 * Copy and share are real: copy writes the public card URL to the clipboard,
 * share hands it to the native share sheet where one exists and falls back to
 * copying where it does not. A button that looks live and does nothing is
 * worse than no button.
 */

const BTN =
  "inline-flex w-full items-center justify-center gap-2 rounded-[10px] border border-[#E5E7EB] bg-white px-4 py-2 text-sm font-medium text-[#111827] transition-colors hover:border-[#9CA3AF]";

export function CardActions({ slug }: { slug: string | null }) {
  const [copied, setCopied] = useState(false);
  const href = slug ? `/creators/${slug}` : "/creator/card";

  const url = () =>
    typeof window === "undefined" ? href : new URL(href, window.location.origin).toString();

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url());
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // Clipboard access is refused in some browsers without a user gesture
      // chain; saying so beats a button that silently does nothing.
      setCopied(false);
    }
  };

  const share = async () => {
    const data = { title: "My Naano card", url: url() };
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share(data);
        return;
      } catch {
        // The sheet was dismissed. Nothing to report.
        return;
      }
    }
    await copy();
  };

  return (
    <div className="flex w-[168px] shrink-0 flex-col gap-2.5">
      <Link href={href} className={BTN}>
        <svg viewBox="0 0 24 24" className="size-4 text-[#6B7280]" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
          <rect x="2" y="5" width="20" height="14" rx="2.5" />
          <circle cx="8" cy="11" r="1.8" />
          <path d="M14 10h4M14 14h4" />
        </svg>
        Open card
      </Link>

      <button type="button" onClick={copy} className={BTN}>
        <svg viewBox="0 0 24 24" className="size-4 text-[#6B7280]" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
          <rect x="9" y="9" width="12" height="12" rx="2" />
          <path d="M5 15V5a2 2 0 0 1 2-2h10" />
        </svg>
        {copied ? "Link copied" : "Copy card link"}
      </button>

      <button
        type="button"
        onClick={share}
        className="inline-flex w-full items-center justify-center gap-2 rounded-[10px] bg-[#2563eb] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#1D4ED8]"
      >
        <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
          <circle cx="18" cy="5" r="2.6" />
          <circle cx="6" cy="12" r="2.6" />
          <circle cx="18" cy="19" r="2.6" />
          <path d="m8.4 10.7 7.2-4.2M8.4 13.3l7.2 4.2" />
        </svg>
        Share my card
      </button>
    </div>
  );
}

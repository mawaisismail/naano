"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

/**
 * naano's mobile menu, measured on their page at 390:
 *
 *   trigger  a round button in the bar that swaps to an ✕ when open
 *   panel    .lp-nav-menu — 362 x 340 at y=73, i.e. inset 14px each side and
 *            8px under the 65px bar; absolute, z 60, radius 18,
 *            rgba(255,255,255,.9) with backdrop saturate(1.2) blur(18px)
 *   items    16px / 500 / #17181c, padding 13px 6px, no dividers
 *
 * Sign in and Sign up are NOT in the panel on naano — they stay in the bar at
 * every width, so they live in Nav rather than here.
 *
 * The panel is translucent on their site too: the hero reads through it. That
 * is their design, reproduced rather than corrected.
 */
export function MobileMenu({
  links,
  signedIn,
  home,
  homeLabel,
}: {
  links: readonly (readonly [string, string])[];
  signedIn: boolean;
  home: string;
  homeLabel: string;
}) {
  const [open, setOpen] = useState(false);

  // A menu that survives navigation or an orientation change is a stuck menu.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <div className="lg:hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label={open ? "Close menu" : "Open menu"}
        className="grid size-9 place-items-center rounded-full bg-white text-ink shadow-[0_1px_3px_rgba(15,23,42,0.08)]"
      >
        <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          {open ? <path d="M6 6l12 12M18 6L6 18" /> : <><path d="M3 7h18" /><path d="M3 12h18" /><path d="M3 17h18" /></>}
        </svg>
      </button>

      {open ? (
        <>
          {/* a click anywhere else closes it; naano has the same catcher */}
          <button
            aria-label="Close menu"
            tabIndex={-1}
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-[50] cursor-default"
          />
          <div className="absolute inset-x-[14px] top-[73px] z-[60] rounded-[18px] bg-white/90 px-3 py-3 shadow-[0_18px_48px_-24px_rgba(25,58,76,0.35)] backdrop-blur-[18px] backdrop-saturate-[1.2]">
            <nav className="flex flex-col">
              {links.map(([label, href]) => (
                <Link
                  key={label}
                  href={href}
                  onClick={() => setOpen(false)}
                  className="px-1.5 py-[13px] text-[16px] font-medium leading-[19px] text-[#17181c]"
                >
                  {label}
                </Link>
              ))}
              {signedIn ? (
                <Link
                  href={home}
                  onClick={() => setOpen(false)}
                  className="px-1.5 py-[13px] text-[16px] font-medium leading-[19px] text-[#17181c]"
                >
                  {homeLabel}
                </Link>
              ) : null}
            </nav>
          </div>
        </>
      ) : null}
    </div>
  );
}

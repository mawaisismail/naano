"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { RESOURCES } from "@/lib/nav-links";

/**
 * The nav naano uses on their content pages (/free-tools, /blog) — a different
 * component from the marketing nav on the landing page.
 *
 * Measured on naano.com/free-tools at 1440:
 *   nav        fixed top 0, padding 12px 24px 0, height 66
 *   bar        max-width 1152, white, 1px #e9e9e7, fully rounded,
 *              padding 8px 24px, shadow 0 1px 3px rgba(0,0,0,.1)
 *   links      14px / 21px / 500 / #787774, gap 24 (32 at lg)
 *   "I'm a creator"  14px / 600 / #787774
 *   "Sign in"        h 36, px 16, radius 8, 13px / 600, white on brand
 *   locale           h 32, px 10, 13px / 600 uppercase
 *   "Get started"    h 32, px 16, pill, 13px / 500, white on #37352f
 *
 * "How it works" sits in naano's version of this bar; it is left out here on
 * the same instruction that removed it from the marketing nav.
 */

const INK = "#37352f";

const LINKS = [
  ["Pricing", "/#pricing"],
  ["FAQs", "/#faq"],
] as const;

export function DocsNav() {
  const [openRes, setOpenRes] = useState(false);
  const [openMenu, setOpenMenu] = useState(false);
  const wrap = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!openRes) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpenRes(false);
    const onDown = (e: MouseEvent) => {
      if (!wrap.current?.contains(e.target as Node)) setOpenRes(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onDown);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onDown);
    };
  }, [openRes]);

  return (
    <nav className="fixed inset-x-0 top-0 z-[1000] px-4 pt-2 sm:px-6 sm:pt-3">
      <div className="relative mx-auto flex max-w-[1152px] items-center justify-between rounded-full border border-[#e9e9e7] bg-white px-4 py-1.5 shadow-[0_1px_3px_rgba(0,0,0,0.1),0_1px_2px_-1px_rgba(0,0,0,0.1)] sm:px-6 sm:py-2">
        <div className="flex items-center gap-6 lg:gap-8">
          <Link href="/" className="flex items-center gap-2 transition-transform duration-150 hover:scale-[1.03] active:scale-[0.98]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/lp/naano-logo-nav.png" alt="naano" className="size-5 object-contain sm:size-6" />
            <span className="text-base font-bold text-[#37352f] sm:text-lg">naano</span>
          </Link>

          <div className="hidden items-center gap-6 md:flex lg:gap-8">
            {LINKS.map(([label, href]) => (
              <Link
                key={label}
                href={href}
                className="whitespace-nowrap text-[14px] font-medium text-[#787774] transition-colors duration-150 hover:text-[#37352f]"
              >
                {label}
              </Link>
            ))}

            <div
              ref={wrap}
              className="relative"
              onMouseEnter={() => setOpenRes(true)}
              onMouseLeave={() => setOpenRes(false)}
            >
              <button
                type="button"
                aria-expanded={openRes}
                aria-haspopup="menu"
                onClick={() => setOpenRes((v) => !v)}
                className="flex items-center gap-1 whitespace-nowrap text-[14px] font-medium text-[#787774] transition-colors duration-150 hover:text-[#37352f]"
              >
                Resources
                <svg viewBox="0 0 24 24" className="size-[14px]" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </button>

              {openRes ? (
                <div role="menu" className="absolute left-1/2 top-full z-50 w-[248px] -translate-x-1/2 pt-3">
                  <div className="rounded-[16px] border border-[#e9e9e7] bg-white p-2 shadow-[0_24px_60px_-30px_rgba(23,24,28,0.3)]">
                    {RESOURCES.map(([label, href]) => (
                      <Link
                        key={label}
                        href={href}
                        role="menuitem"
                        onClick={() => setOpenRes(false)}
                        className="block rounded-[10px] px-3 py-2.5 text-[14px] font-medium text-[#37352f] transition hover:bg-[#f7f7f5]"
                      >
                        {label}
                      </Link>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>

            <Link
              href="/about"
              className="whitespace-nowrap text-[14px] font-medium text-[#787774] transition-colors duration-150 hover:text-[#37352f]"
            >
              About us
            </Link>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/creators"
            className="hidden items-center gap-1 whitespace-nowrap text-[14px] font-semibold text-[#787774] transition-colors hover:text-[#37352f] md:inline-flex"
          >
            I&apos;m a creator
          </Link>
          <Link
            href="/login"
            className="hidden h-9 items-center whitespace-nowrap rounded-lg bg-[#1652f0] px-4 text-[13px] font-semibold text-white transition-opacity hover:opacity-90 md:inline-flex"
          >
            Sign in
          </Link>
          <button
            type="button"
            aria-label="Switch language"
            className="flex h-8 items-center gap-1.5 rounded-lg px-2.5 transition-colors hover:bg-[#f7f7f5]"
          >
            <svg viewBox="0 0 24 24" className="size-[15px] text-[#787774]" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
              <circle cx="12" cy="12" r="10" />
              <path d="M2 12h20M12 2a15.3 15.3 0 0 1 0 20a15.3 15.3 0 0 1 0-20" />
            </svg>
            <span className="text-[13px] font-semibold uppercase leading-[18px] tracking-[0.02em] text-[#17181c]">
              EN
            </span>
          </button>
          <Link
            href="/register"
            className="hidden h-8 shrink-0 items-center justify-center whitespace-nowrap rounded-full bg-[#37352f] px-4 text-[13px] font-medium text-white transition-colors duration-150 hover:bg-[#1c1b19] md:inline-flex"
          >
            Get started
          </Link>

          <button
            type="button"
            aria-label={openMenu ? "Close menu" : "Open menu"}
            aria-expanded={openMenu}
            onClick={() => setOpenMenu((v) => !v)}
            className="flex size-9 items-center justify-center rounded-lg transition-colors hover:bg-[#f7f7f5] md:hidden"
          >
            <svg viewBox="0 0 24 24" className="size-[18px]" fill="none" stroke={INK} strokeWidth="2" strokeLinecap="round" aria-hidden>
              {openMenu ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M3 6h18M3 12h18M3 18h18" />}
            </svg>
          </button>
        </div>
      </div>

      {openMenu ? (
        <div className="mx-auto mt-2 max-w-[1152px] rounded-[18px] border border-[#e9e9e7] bg-white p-2 shadow-[0_24px_60px_-30px_rgba(23,24,28,0.3)] md:hidden">
          {[...LINKS, ...RESOURCES, ["About us", "/about"], ["I'm a creator", "/creators"]].map(
            ([label, href]) => (
              <Link
                key={label}
                href={href}
                onClick={() => setOpenMenu(false)}
                className="block rounded-[10px] px-3 py-[13px] text-[16px] font-medium text-[#37352f] transition hover:bg-[#f7f7f5]"
              >
                {label}
              </Link>
            )
          )}
          <div className="mt-1 flex gap-2 px-1 pb-1">
            <Link
              href="/login"
              onClick={() => setOpenMenu(false)}
              className="flex h-10 flex-1 items-center justify-center rounded-lg bg-[#1652f0] text-[14px] font-semibold text-white"
            >
              Sign in
            </Link>
            <Link
              href="/register"
              onClick={() => setOpenMenu(false)}
              className="flex h-10 flex-1 items-center justify-center rounded-full bg-[#37352f] text-[14px] font-medium text-white"
            >
              Get started
            </Link>
          </div>
        </div>
      ) : null}
    </nav>
  );
}

"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { RESOURCES } from "@/lib/nav-links";

/** naano's Resources dropdown — opens on hover, and on click for keyboards. */

export function ResourcesMenu() {
  const [open, setOpen] = useState(false);
  const wrap = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    const onDown = (e: MouseEvent) => {
      if (!wrap.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onDown);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onDown);
    };
  }, [open]);

  return (
    <div
      ref={wrap}
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-1 whitespace-nowrap text-[15px] font-medium leading-none text-[#17181c] transition hover:opacity-70"
      >
        Resources
        <svg viewBox="0 0 24 24" className="mt-px size-[13px]" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden>
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {open ? (
        <div
          role="menu"
          className="absolute left-1/2 top-full z-50 w-[248px] -translate-x-1/2 pt-3"
        >
          <div className="rounded-[16px] border border-[#e8e6e2] bg-white p-2 shadow-[0_24px_60px_-30px_rgba(23,24,28,0.3)]">
            {RESOURCES.map(([label, href]) => (
              <Link
                key={label}
                href={href}
                role="menuitem"
                onClick={() => setOpen(false)}
                className="block rounded-[10px] px-3 py-2.5 text-[15px] font-medium text-[#17181c] transition hover:bg-[#f4f8fb]"
              >
                {label}
              </Link>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

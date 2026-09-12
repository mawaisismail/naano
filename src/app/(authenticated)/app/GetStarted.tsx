"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Check } from "lucide-react";

/**
 * The GET STARTED checklist in the brand header.
 *
 * Every step is derived from the database rather than ticked off by a flag, so
 * it cannot claim a brand has funded its balance when the balance is zero. It
 * disappears once all five are done — a permanent checklist reading 5/5 is
 * just clutter in the header.
 */

export type Step = { label: string; href: string; done: boolean };

export function GetStarted({ steps }: { steps: Step[] }) {
  const [open, setOpen] = useState(false);
  const wrap = useRef<HTMLDivElement>(null);

  const done = steps.filter((s) => s.done).length;

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!wrap.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (done === steps.length) return null;

  return (
    <div ref={wrap} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="inline-flex items-center gap-2.5 rounded-[10px] border border-[#E5E7EB] bg-white py-1.5 pl-3 pr-3.5 transition-colors hover:border-[#9CA3AF]"
      >
        <span className="text-[11px] font-bold uppercase tracking-[0.08em] text-[#6B7280]">
          Get started
        </span>
        <span className="h-1.5 w-16 overflow-hidden rounded-full bg-[#ECEEF2]">
          <span
            className="block h-full rounded-full bg-[#2563eb]"
            style={{ width: `${(done / steps.length) * 100}%` }}
          />
        </span>
        <span className="text-xs font-semibold text-[#111827]">
          {done}/{steps.length}
        </span>
      </button>

      {open ? (
        <div className="absolute right-0 top-full z-50 mt-2 w-[300px] rounded-[14px] border border-[#E5E7EB] bg-white p-2 shadow-[0_24px_60px_-28px_rgba(23,24,28,0.35)]">
          <p className="px-3 pb-2 pt-2 text-[13px] text-[#6B7280]">
            {steps.length - done} step{steps.length - done === 1 ? "" : "s"} left to your first post.
          </p>
          {steps.map((s) => (
            <Link
              key={s.label}
              href={s.href}
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 rounded-[10px] px-3 py-2.5 text-sm transition-colors hover:bg-[#F5F6F8]"
            >
              <span
                className={`grid size-5 shrink-0 place-items-center rounded-full border ${
                  s.done ? "border-[#2563eb] bg-[#2563eb] text-white" : "border-[#D1D5DB] text-transparent"
                }`}
              >
                <Check size={12} strokeWidth={3} aria-hidden />
              </span>
              <span className={s.done ? "text-[#9CA3AF] line-through" : "font-medium text-[#374151]"}>
                {s.label}
              </span>
            </Link>
          ))}
        </div>
      ) : null}
    </div>
  );
}

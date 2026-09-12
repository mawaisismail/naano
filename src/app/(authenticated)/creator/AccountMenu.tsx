"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ExternalLink, IdCard, LogOut, Settings, Wallet } from "lucide-react";
import { logout } from "@/lib/actions/auth";

/**
 * The account menu behind the avatar in the workspace header.
 *
 * The avatar used to BE the sign-out button — a bare <form action={logout}>.
 * Clicking it signed you out and dropped you on the marketing home page, which
 * is the most destructive thing that control could possibly do and the least
 * expected. It opens a menu now, and signing out is one deliberate item in it.
 */
export function AccountMenu({
  name,
  email,
  avatarUrl,
  creatorSlug,
  needsProfessionalInfo,
}: {
  name: string;
  email: string;
  avatarUrl: string | null;
  creatorSlug: string | null;
  needsProfessionalInfo: boolean;
}) {
  const [open, setOpen] = useState(false);
  const wrap = useRef<HTMLDivElement>(null);
  const firstItem = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    const onDown = (e: MouseEvent) => {
      if (!wrap.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onDown);
    // Move focus into the menu so it can be driven from the keyboard.
    firstItem.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onDown);
    };
  }, [open]);

  const item =
    "flex items-center gap-3 rounded-[10px] px-3 py-2.5 text-sm font-medium text-[#374151] transition-colors hover:bg-[#F5F6F8] focus:bg-[#F5F6F8] focus:outline-none";

  return (
    <div ref={wrap} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Account menu"
        className="relative block rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2563eb] focus-visible:ring-offset-2"
      >
        {avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={avatarUrl} alt="" className="size-9 rounded-full object-cover" />
        ) : (
          <span className="grid size-9 place-items-center rounded-full bg-[#E8F0FE] text-sm font-semibold text-[#2563eb]">
            {name.slice(0, 1).toUpperCase()}
          </span>
        )}
        <span className="absolute -bottom-0.5 -right-0.5 size-3 rounded-full border-2 border-white bg-[#22C55E]" />
      </button>

      {open ? (
        <div
          role="menu"
          className="absolute right-0 top-full z-50 mt-2 w-[268px] rounded-[14px] border border-[#E5E7EB] bg-white p-2 shadow-[0_24px_60px_-28px_rgba(23,24,28,0.35)]"
        >
          <div className="border-b border-[#F1F2F5] px-3 pb-3 pt-2">
            <p className="truncate text-sm font-semibold text-[#111827]">{name}</p>
            <p className="truncate text-[13px] text-[#6B7280]">{email}</p>
          </div>

          <div className="pt-2">
            <Link ref={firstItem} href="/creator/card" role="menuitem" onClick={() => setOpen(false)} className={item}>
              <IdCard size={16} strokeWidth={1.8} aria-hidden className="text-[#6B7280]" />
              My card
            </Link>

            {creatorSlug ? (
              <Link
                href={`/creators/${creatorSlug}`}
                role="menuitem"
                onClick={() => setOpen(false)}
                className={`${item} justify-between`}
              >
                <span className="flex items-center gap-3">
                  <ExternalLink size={16} strokeWidth={1.8} aria-hidden className="text-[#6B7280]" />
                  View public profile
                </span>
              </Link>
            ) : null}

            <Link href="/creator/earnings" role="menuitem" onClick={() => setOpen(false)} className={item}>
              <Wallet size={16} strokeWidth={1.8} aria-hidden className="text-[#6B7280]" />
              Earnings and payouts
            </Link>

            <Link href="/register?role=professional" role="menuitem" onClick={() => setOpen(false)} className={`${item} justify-between`}>
              <span className="flex items-center gap-3">
                <Settings size={16} strokeWidth={1.8} aria-hidden className="text-[#6B7280]" />
                Professional information
              </span>
              {needsProfessionalInfo ? (
                <span className="rounded-full bg-[#FDF6F1] px-2 py-0.5 text-[11px] font-semibold text-[#8A4B22]">
                  To do
                </span>
              ) : null}
            </Link>
          </div>

          {/* Sign out sits below a rule and is the only destructive item, so it
              cannot be hit by aiming at the avatar. */}
          <form action={logout} className="mt-2 border-t border-[#F1F2F5] pt-2">
            <button type="submit" role="menuitem" className={`${item} w-full text-[#B42318] hover:bg-[#FDF2F2]`}>
              <LogOut size={16} strokeWidth={1.8} aria-hidden />
              Sign out
            </button>
          </form>
        </div>
      ) : null}
    </div>
  );
}

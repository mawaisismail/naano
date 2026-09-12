"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/**
 * naano's creator sidebar, in their order. Every entry exists as a route so
 * none of them dead-ends; the ones this build has not filled in yet say so on
 * the page rather than linking nowhere.
 */
const ITEMS = [
  ["Overview", "/creator", "grid"],
  ["My card", "/creator/card", "card"],
  ["Opportunities", "/creator/opportunities", "store"],
  ["Collaborations", "/creator/collaborations", "layers"],
  ["Analytics", "/creator/analytics", "chart"],
  ["Community", "/creator/community", "users"],
  ["Earnings", "/creator/earnings", "wallet"],
  ["Affiliate program", "/creator/affiliate", "percent"],
  ["Messages", "/creator/messages", "chat"],
] as const;

export function CreatorSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-[278px] shrink-0 border-r border-[#ECECEA] bg-white lg:block">
      <Link href="/" className="flex items-center gap-2.5 px-6 py-6">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo.svg" alt="naano" className="size-6 object-contain" />
        <span className="text-xl font-bold tracking-tight text-[#111827]">naano</span>
      </Link>

      <nav className="space-y-1 px-3">
        {ITEMS.map(([label, href, icon]) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 rounded-[10px] px-3 py-2 text-sm transition-colors ${
                active ? "font-semibold text-[#2563eb]" : "font-medium text-[#4B5563] hover:bg-[#F7F8FA]"
              }`}
            >
              {/* naano tints the icon's own square, not the whole row, and the
                  glyph sits small inside it. */}
              <span
                className={`grid size-9 shrink-0 place-items-center rounded-[10px] ${
                  active ? "bg-[#EFF4FF] text-[#2563eb]" : "text-[#6B7280]"
                }`}
              >
                <Glyph name={icon} />
              </span>
              {label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

function Glyph({ name }: { name: string }) {
  const p = { viewBox: "0 0 24 24", className: "size-[17px] shrink-0", fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true };
  switch (name) {
    case "grid": return <svg {...p}><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /></svg>;
    case "card": return <svg {...p}><rect x="2" y="5" width="20" height="14" rx="2.5" /><circle cx="8" cy="11" r="2" /><path d="M14 10h4M14 14h4M4.5 16c.8-1.6 2-2.4 3.5-2.4s2.7.8 3.5 2.4" /></svg>;
    case "store": return <svg {...p}><path d="M3 9h18l-1.2-4.2A1.5 1.5 0 0 0 18.3 4H5.7a1.5 1.5 0 0 0-1.5 1.1L3 9Z" /><path d="M4 9v10a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1V9" /></svg>;
    case "layers": return <svg {...p}><path d="m12 3 9 5-9 5-9-5 9-5Z" /><path d="m3 13 9 5 9-5" /></svg>;
    case "chart": return <svg {...p}><path d="M3 17l5-6 4 4 6-8" /><path d="M18 7h3v3" /></svg>;
    case "users": return <svg {...p}><circle cx="9" cy="8" r="3.2" /><path d="M2.5 20a6.5 6.5 0 0 1 13 0" /><path d="M17 11a3 3 0 1 0-1.5-5.6M18 20a5.6 5.6 0 0 0-2-4.3" /></svg>;
    case "wallet": return <svg {...p}><rect x="3" y="6" width="18" height="13" rx="2.5" /><path d="M3 10h18" /><circle cx="17" cy="14.5" r="1.2" /></svg>;
    case "percent": return <svg {...p}><path d="M19 5 5 19" /><circle cx="7.5" cy="7.5" r="2.5" /><circle cx="16.5" cy="16.5" r="2.5" /></svg>;
    default: return <svg {...p}><path d="M21 12a8 8 0 0 1-11.4 7.2L3 21l1.8-6.6A8 8 0 1 1 21 12Z" /></svg>;
  }
}

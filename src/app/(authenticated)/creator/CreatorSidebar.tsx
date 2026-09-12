"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSyncExternalStore } from "react";
import {
  IdCard,
  Layers,
  LayoutGrid,
  MessageCircle,
  PanelLeftClose,
  PanelLeftOpen,
  Percent,
  Store,
  TrendingUp,
  Users,
  Wallet,
  type LucideIcon,
} from "lucide-react";

/**
 * naano's creator sidebar.
 *
 * The icons are lucide's own, which is the set naano ships — their markup
 * carries `class="lucide lucide-sparkles"` and friends on the public pages, so
 * the sidebar glyphs were redrawn by hand here for no reason. Importing the
 * real ones removes the guesswork and the near-misses with it.
 *
 * It collapses to an icon rail, as theirs does: 278 wide expanded, 78
 * collapsed with the labels dropped and a tooltip on hover. The choice is
 * remembered per browser, because a sidebar that re-opens on every navigation
 * is worse than one that never collapsed.
 */

const ITEMS: [label: string, href: string, icon: LucideIcon][] = [
  ["Overview", "/creator", LayoutGrid],
  ["My card", "/creator/card", IdCard],
  ["Opportunities", "/creator/opportunities", Store],
  ["Collaborations", "/creator/collaborations", Layers],
  ["Analytics", "/creator/analytics", TrendingUp],
  ["Community", "/creator/community", Users],
  ["Earnings", "/creator/earnings", Wallet],
  ["Affiliate program", "/creator/affiliate", Percent],
  ["Messages", "/creator/messages", MessageCircle],
];

const STORAGE_KEY = "naano:creator-sidebar-collapsed";

/**
 * The collapsed flag lives in localStorage, which is browser state React does
 * not own — so it is read through useSyncExternalStore rather than copied into
 * component state inside an effect. That keeps the server render (always
 * expanded) and the client render consistent without a hydration mismatch, and
 * without the cascading re-render a setState-in-effect causes.
 */
const listeners = new Set<() => void>();

function subscribe(fn: () => void) {
  listeners.add(fn);
  // Another tab toggling the sidebar should move this one too.
  window.addEventListener("storage", fn);
  return () => {
    listeners.delete(fn);
    window.removeEventListener("storage", fn);
  };
}

function getSnapshot() {
  try {
    return window.localStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    // Private windows and blocked site data both throw; start expanded.
    return false;
  }
}

/** The server has no localStorage, so it always renders the expanded rail. */
const getServerSnapshot = () => false;

function setCollapsedState(next: boolean) {
  try {
    window.localStorage.setItem(STORAGE_KEY, next ? "1" : "0");
  } catch {
    // Not remembering the choice is survivable; failing to toggle is not, so
    // the listeners still fire below.
  }
  for (const fn of listeners) fn();
}

export function CreatorSidebar() {
  const pathname = usePathname();
  const collapsed = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const toggle = () => setCollapsedState(!collapsed);

  return (
    <aside
      data-collapsed={collapsed}
      className={`hidden shrink-0 border-r border-[#ECECEA] bg-white transition-[width] duration-200 lg:block ${
        collapsed ? "w-[78px]" : "w-[278px]"
      }`}
    >
      <div className={`flex items-center gap-2.5 py-6 ${collapsed ? "justify-center px-0" : "px-6"}`}>
        <Link href="/" className="flex items-center gap-2.5" aria-label="naano">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.svg" alt="" className="size-6 shrink-0 object-contain" />
          {collapsed ? null : (
            <span className="text-xl font-bold tracking-tight text-[#111827]">naano</span>
          )}
        </Link>
      </div>

      <nav className={`space-y-1 ${collapsed ? "px-3" : "px-3"}`}>
        {ITEMS.map(([label, href, Icon]) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              title={collapsed ? label : undefined}
              aria-label={collapsed ? label : undefined}
              className={`group/item flex items-center gap-3 rounded-[10px] py-2 text-sm transition-colors ${
                collapsed ? "justify-center px-0" : "px-3"
              } ${active ? "font-semibold text-[#2563eb]" : "font-medium text-[#4B5563] hover:bg-[#F7F8FA]"}`}
            >
              {/* naano tints the icon's own square, not the whole row. */}
              <span
                className={`grid size-9 shrink-0 place-items-center rounded-[10px] ${
                  active ? "bg-[#EFF4FF] text-[#2563eb]" : "text-[#6B7280]"
                }`}
              >
                <Icon size={18} strokeWidth={1.8} aria-hidden />
              </span>
              {collapsed ? null : label}
            </Link>
          );
        })}
      </nav>

      <div className={`mt-4 ${collapsed ? "px-3" : "px-3"}`}>
        <button
          type="button"
          onClick={toggle}
          aria-expanded={!collapsed}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className={`flex w-full items-center gap-3 rounded-[10px] py-2 text-sm font-medium text-[#6B7280] transition-colors hover:bg-[#F7F8FA] hover:text-[#111827] ${
            collapsed ? "justify-center px-0" : "px-3"
          }`}
        >
          <span className="grid size-9 shrink-0 place-items-center rounded-[10px]">
            {collapsed ? (
              <PanelLeftOpen size={18} strokeWidth={1.8} aria-hidden />
            ) : (
              <PanelLeftClose size={18} strokeWidth={1.8} aria-hidden />
            )}
          </span>
          {collapsed ? null : "Collapse"}
        </button>
      </div>
    </aside>
  );
}

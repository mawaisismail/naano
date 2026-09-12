"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSyncExternalStore } from "react";
import { PanelLeftClose, PanelLeftOpen, type LucideIcon } from "lucide-react";

/**
 * The workspace rail, shared by both sides of the marketplace.
 *
 * naano runs the same sidebar for creators and for brands — same width, same
 * active treatment, same collapse — and differs only in the items and in the
 * company switcher brands get under the logo. So this holds the behaviour and
 * each side passes its own list, rather than two files drifting apart.
 *
 * It collapses to an icon rail: 278 wide expanded, 78 collapsed with labels
 * dropped and a tooltip on hover. The choice is remembered per browser under a
 * per-workspace key, because a sidebar that re-opens on every navigation is
 * worse than one that never collapsed.
 */

export type NavItem = [label: string, href: string, icon: LucideIcon];

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

function read(key: string) {
  try {
    return window.localStorage.getItem(key) === "1";
  } catch {
    // Private windows and blocked site data both throw; start expanded.
    return false;
  }
}

function write(key: string, next: boolean) {
  try {
    window.localStorage.setItem(key, next ? "1" : "0");
  } catch {
    // Not remembering the choice is survivable; failing to toggle is not, so
    // the listeners still fire below.
  }
  for (const fn of listeners) fn();
}

export function WorkspaceSidebar({
  items,
  storageKey,
  header,
  footer,
}: {
  items: NavItem[];
  storageKey: string;
  /** Rendered under the logo when expanded — the brand company switcher. */
  header?: React.ReactNode;
  footer?: React.ReactNode;
}) {
  const pathname = usePathname();
  const collapsed = useSyncExternalStore(
    subscribe,
    () => read(storageKey),
    // The server has no localStorage, so it always renders the expanded rail.
    () => false
  );

  return (
    <aside
      data-collapsed={collapsed}
      className={`hidden shrink-0 border-r border-[#ECECEA] bg-white transition-[width] duration-200 lg:block ${
        collapsed ? "w-[78px]" : "w-[278px]"
      }`}
    >
      <div className={`flex items-center pt-6 ${collapsed ? "flex-col gap-3 px-0" : "justify-between gap-2 px-6"}`}>
        <Link href="/" className="flex items-center gap-2.5" aria-label="naano">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.svg" alt="" className="size-6 shrink-0 object-contain" />
          {collapsed ? null : (
            <span className="text-xl font-bold tracking-tight text-[#111827]">naano</span>
          )}
        </Link>

        {/* The toggle sits with the logo rather than at the foot of the list:
            it is the first place anyone looks for it, and it stays reachable
            in the collapsed rail without scrolling past nine items. */}
        <button
          type="button"
          onClick={() => write(storageKey, !collapsed)}
          aria-expanded={!collapsed}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="grid size-9 shrink-0 place-items-center rounded-[10px] text-[#6B7280] transition-colors hover:bg-[#F3F4F6] hover:text-[#111827]"
        >
          {collapsed ? (
            <PanelLeftOpen size={18} strokeWidth={1.8} aria-hidden />
          ) : (
            <PanelLeftClose size={18} strokeWidth={1.8} aria-hidden />
          )}
        </button>
      </div>

      {header && !collapsed ? <div className="px-4 pt-5">{header}</div> : null}

      <nav className="space-y-1 px-3 pt-6">
        {items.map(([label, href, Icon]) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              title={collapsed ? label : undefined}
              aria-label={collapsed ? label : undefined}
              aria-current={active ? "page" : undefined}
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

      {footer && !collapsed ? <div className="px-4 pt-6">{footer}</div> : null}
    </aside>
  );
}

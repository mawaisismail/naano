"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cx } from "@/lib/format";

type Item = { href: string; label: string; icon: string; stub?: boolean };

const ITEMS: Item[] = [
  { href: "/app", label: "Dashboard", icon: "grid" },
  { href: "/marketplace", label: "Marketplace", icon: "store" },
  { href: "/app/deals", label: "Deals", icon: "hands" },
  { href: "/app/campaigns", label: "Campaigns", icon: "layers" },
  { href: "/app/messages", label: "Messages", icon: "chat", stub: true },
  { href: "/app/billing", label: "Billing", icon: "card", stub: true },
];

export function Sidebar({
  user,
  logout,
}: {
  user: { name: string; company: string };
  logout: () => Promise<void>;
}) {
  const path = usePathname();

  return (
    <aside className="sticky top-0 flex h-screen w-16 flex-col items-center gap-1 border-r border-line bg-white py-4 lg:w-56 lg:items-stretch lg:px-3">
      <Link
        href="/"
        className="mb-4 px-2 text-center font-display text-xl font-extrabold tracking-tight text-ink lg:text-left"
      >
        n<span className="hidden lg:inline">aano</span>
        <span className="text-brand">.</span>
      </Link>

      {ITEMS.map((it) => {
        const active =
          it.href === "/app" ? path === "/app" : path.startsWith(it.href);
        return (
          <Link
            key={it.href}
            href={it.href}
            title={it.label}
            className={cx(
              "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition",
              active
                ? "bg-brand-soft text-brand"
                : "text-muted hover:bg-surface hover:text-ink"
            )}
          >
            <Icon name={it.icon} />
            <span className="hidden lg:inline">{it.label}</span>
            {it.stub && (
              <span className="ml-auto hidden rounded-full bg-surface px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-grey lg:inline">
                stub
              </span>
            )}
          </Link>
        );
      })}

      <div className="mt-auto border-t border-line pt-3">
        <div className="hidden px-3 lg:block">
          <div className="truncate text-sm font-semibold text-ink">{user.name}</div>
          <div className="truncate text-[11px] text-muted">{user.company}</div>
        </div>
        <form action={logout}>
          <button
            type="submit"
            className="mt-2 w-full rounded-xl px-3 py-2 text-left text-sm font-medium text-muted transition hover:bg-surface hover:text-ink"
          >
            <span className="hidden lg:inline">Sign out</span>
            <span className="lg:hidden">→</span>
          </button>
        </form>
      </div>
    </aside>
  );
}

function Icon({ name }: { name: string }) {
  const p: Record<string, string> = {
    grid: "M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z",
    store: "M3 9l1.5-5h15L21 9M3 9h18M3 9v11h18V9M9 20v-6h6v6",
    hands: "M4 12l4-4 4 4-4 4zM12 12l4-4 4 4-4 4",
    layers: "M12 3l9 5-9 5-9-5zM3 13l9 5 9-5",
    chat: "M21 12a8 8 0 01-8 8H7l-4 3V12a8 8 0 018-8h2a8 8 0 018 8z",
    card: "M2 7h20v11H2zM2 11h20",
  };
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="size-5 shrink-0"
      aria-hidden
    >
      <path d={p[name]} />
    </svg>
  );
}

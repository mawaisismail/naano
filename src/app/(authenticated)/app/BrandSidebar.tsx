"use client";

import { ChevronsUpDown } from "lucide-react";
import {
  BarChart3,
  CreditCard,
  Layers,
  LayoutGrid,
  MessageCircle,
  Megaphone,
  Sparkles,
} from "lucide-react";
import { WorkspaceSidebar, type NavItem } from "@/components/app/WorkspaceSidebar";

/**
 * naano's brand sidebar.
 *
 * Same rail as the creator side, different job: a brand starts at Creators and
 * spends its time there, so AI Matching sits second, right under Overview, and
 * Billing closes the list. The company switcher under the logo is the one
 * structural difference between the two workspaces — a creator is one person
 * and has nothing to switch.
 */
const ITEMS: NavItem[] = [
  ["Overview", "/app", LayoutGrid],
  ["Creators", "/app/creators", Sparkles],
  ["Campaigns", "/app/campaigns", Megaphone],
  ["Collaborations", "/app/collaborations", Layers],
  ["Results", "/app/results", BarChart3],
  ["Messages", "/app/messages", MessageCircle],
  ["Billing", "/app/billing", CreditCard],
];

export function BrandSidebar({ company }: { company: string }) {
  return (
    <WorkspaceSidebar
      items={ITEMS}
      storageKey="naano:brand-sidebar-collapsed"
      header={
        // One workspace exists in this build, so the switcher shows the
        // company and is inert rather than opening an empty list.
        <div className="flex items-center gap-3 rounded-[12px] border border-[#E5E7EB] bg-white px-3 py-2.5">
          <span className="grid size-8 shrink-0 place-items-center rounded-[9px] bg-[#111827] text-[13px] font-bold text-white">
            {company.slice(0, 1).toUpperCase()}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-[13px] font-semibold text-[#111827]">{company}</span>
            <span className="block text-[11px] text-[#9CA3AF]">Workspace</span>
          </span>
          <ChevronsUpDown size={15} strokeWidth={1.8} aria-hidden className="shrink-0 text-[#9CA3AF]" />
        </div>
      }
    />
  );
}

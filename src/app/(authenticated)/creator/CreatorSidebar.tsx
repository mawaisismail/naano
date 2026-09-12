"use client";

import {
  IdCard,
  Layers,
  LayoutGrid,
  MessageCircle,
  Percent,
  Store,
  TrendingUp,
  Users,
  Wallet,
} from "lucide-react";
import { WorkspaceSidebar, type NavItem } from "@/components/app/WorkspaceSidebar";

/**
 * naano's creator sidebar — the items only; the rail itself is shared with the
 * brand workspace in WorkspaceSidebar.
 *
 * The icons are lucide's own, which is the set naano ships: their markup
 * carries `class="lucide lucide-sparkles"` and friends on the public pages, so
 * importing the real ones removes the guesswork and the near-misses with it.
 */
const ITEMS: NavItem[] = [
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

export function CreatorSidebar() {
  return <WorkspaceSidebar items={ITEMS} storageKey="naano:creator-sidebar-collapsed" />;
}

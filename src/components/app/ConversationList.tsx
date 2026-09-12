import Link from "next/link";
import type { Conversation } from "@/lib/messages";

/** The thread picker, shared by both sides. */
export function ConversationList({
  items,
  active,
  base,
}: {
  items: Conversation[];
  active?: string;
  base: string;
}) {
  return (
    <ul className="overflow-hidden rounded-[18px] border border-[#E5E7EB] bg-white">
      {items.map((c) => {
        const on = c.dealId === active;
        return (
          <li key={c.dealId} className="border-b border-[#F1F2F5] last:border-b-0">
            <Link
              href={`${base}?thread=${c.dealId}`}
              className={`block px-5 py-4 transition-colors ${on ? "bg-[#F5F8FF]" : "hover:bg-[#FAFBFC]"}`}
            >
              <div className="flex items-baseline justify-between gap-3">
                <span className={`truncate text-sm ${on ? "font-bold text-[#2563eb]" : "font-semibold text-[#111827]"}`}>
                  {c.counterpart}
                </span>
                <span className="shrink-0 text-[11px] text-[#9CA3AF]">{c.lastAt ?? ""}</span>
              </div>
              <p className="mt-1 truncate text-[13px] text-[#6B7280]">
                {c.last ?? `${c.campaign} · no messages yet`}
              </p>
              {c.unread > 0 ? (
                <span className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-[#2563eb] px-2 py-0.5 text-[11px] font-semibold text-white">
                  {c.unread} new
                </span>
              ) : null}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

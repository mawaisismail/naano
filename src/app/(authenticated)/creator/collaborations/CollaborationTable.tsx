"use client";

import { useMemo, useState } from "react";

/**
 * /creator/collaborations — naano's board, authored from their screen.
 *
 *   h1     40 / 700 -0.02em, lead 15 / 26 #6B7280
 *   tabs   All / Active / Needs action / Applications sent / Declined /
 *          Completed, each with a count pill; the active one blue with a blue
 *          underline
 *   table  Brand · Campaign · Status · Performance · Next action · Due date ·
 *          Your net, 13px #6B7280 headers over a hairline
 *   footer "<n> collaborations" on the left, pagination on the right
 *
 * The tab counts come from the rows, not from a second query — a count that
 * can disagree with the list underneath it is worse than no count.
 */

export type Collab = {
  id: string;
  brand: string;
  campaign: string;
  status: string;
  clicks: number;
  nextAction: string;
  due: string | null;
  net: number;
};

const TABS = [
  ["All", () => true],
  ["Active", (c: Collab) => ["accepted", "draft", "scheduled", "live"].includes(c.status)],
  ["Needs action", (c: Collab) => ["accepted", "draft"].includes(c.status)],
  ["Applications sent", (c: Collab) => c.status === "invited"],
  ["Declined", (c: Collab) => c.status === "declined"],
  ["Completed", (c: Collab) => c.status === "paid"],
] as const;

const STATUS_TONE: Record<string, string> = {
  invited: "bg-[#F3F4F6] text-[#4B5563]",
  accepted: "bg-[#EFF4FF] text-[#2563eb]",
  draft: "bg-[#FDF6F1] text-[#8A4B22]",
  scheduled: "bg-[#EFF4FF] text-[#2563eb]",
  live: "bg-[#ECFDF3] text-[#15803D]",
  paid: "bg-[#ECFDF3] text-[#15803D]",
  declined: "bg-[#FDF2F2] text-[#B42318]",
};

export function CollaborationTable({ rows }: { rows: Collab[] }) {
  const [tab, setTab] = useState<string>("All");

  const counts = useMemo(
    () => Object.fromEntries(TABS.map(([label, match]) => [label, rows.filter(match).length])),
    [rows]
  );
  const shown = useMemo(() => {
    const match = TABS.find(([label]) => label === tab)?.[1] ?? (() => true);
    return rows.filter(match);
  }, [rows, tab]);

  return (
    <div className="mx-auto max-w-[1340px] pt-2">
      <h1 className="text-[40px] font-bold tracking-[-0.02em] text-[#111827]">Collaborations</h1>
      <p className="mt-2 text-[15px] leading-[26px] text-[#6B7280]">
        Every step tells you where you stand, what to do, and what happens if
        you do nothing.
      </p>

      <div className="mt-6 flex flex-wrap gap-7 border-b border-[#ECEEF2]">
        {TABS.map(([label]) => {
          const on = tab === label;
          return (
            <button
              key={label}
              type="button"
              onClick={() => setTab(label)}
              aria-pressed={on}
              className={`-mb-px flex items-center gap-2 border-b-2 pb-3 text-[15px] transition-colors ${
                on ? "border-[#2563eb] font-semibold text-[#2563eb]" : "border-transparent font-medium text-[#4B5563] hover:text-[#111827]"
              }`}
            >
              {label}
              <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${on ? "bg-[#2563eb] text-white" : "bg-[#F3F4F6] text-[#6B7280]"}`}>
                {counts[label]}
              </span>
            </button>
          );
        })}
      </div>

      <div className="mt-6 overflow-hidden rounded-[18px] border border-[#E5E7EB] bg-white">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] text-left">
            <thead>
              <tr className="border-b border-[#EEF0F4] text-[13px] text-[#6B7280]">
                {["Brand", "Campaign", "Status", "Performance", "Next action", "Due date", "Your net"].map((h) => (
                  <th key={h} scope="col" className="px-6 py-4 font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {shown.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-14 text-center text-sm text-[#6B7280]">
                    No collaborations yet. Brand invitations and your accepted
                    applications land here.
                  </td>
                </tr>
              ) : (
                shown.map((c) => (
                  <tr key={c.id} className="border-b border-[#F5F6F8] text-sm last:border-b-0">
                    <td className="px-6 py-4 font-semibold text-[#111827]">{c.brand}</td>
                    <td className="px-6 py-4 text-[#4B5563]">{c.campaign}</td>
                    <td className="px-6 py-4">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${STATUS_TONE[c.status] ?? "bg-[#F3F4F6] text-[#4B5563]"}`}>
                        {c.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-[#4B5563]">
                      {c.clicks > 0 ? `${c.clicks.toLocaleString("en-GB")} clicks` : "—"}
                    </td>
                    <td className="px-6 py-4 text-[#4B5563]">{c.nextAction}</td>
                    <td className="px-6 py-4 text-[#6B7280]">{c.due ?? "—"}</td>
                    <td className="px-6 py-4 font-semibold text-[#111827]">€{c.net}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between border-t border-[#EEF0F4] px-6 py-4">
          <p className="text-sm text-[#6B7280]">
            {shown.length} collaboration{shown.length === 1 ? "" : "s"}
          </p>
          <span className="grid size-8 place-items-center rounded-[8px] bg-[#EFF4FF] text-sm font-semibold text-[#2563eb]">
            1
          </span>
        </div>
      </div>
    </div>
  );
}

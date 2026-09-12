"use client";

import { useState } from "react";
import { Building2, CreditCard, LogOut, TrendingUp, Wallet } from "lucide-react";

/**
 * /creator/earnings — naano's screen, authored from theirs.
 *
 *   header   h1 40 / 700, lead 15 / 26, a "Paid collaborations" chip right
 *   summary  three cards; the first on a cloud wash — total earned, in
 *            transit, available now
 *   chart    six monthly bars, each labelled with its own total, the current
 *            month tinted; a "€n over 6 months" figure top right
 *   withdraw payout method radios (bank / Stripe), an amount field with
 *            "Withdraw all", and a confirm button
 *   activity tabs over a Date / Type / Detail / Amount / Status / Invoice table
 *
 * Nothing here moves money. No payment processor is connected in this build,
 * so the withdraw controls report that state and stay disabled rather than
 * pretending to pay out — a button that looks live and silently does nothing
 * is the worst version of this screen.
 */

export type Month = { label: string; full: string; total: number; current: boolean };
export type Activity = { id: string; date: string; type: string; detail: string; amount: number; status: string };

const euro = (n: number) => `€${n.toLocaleString("en-GB")}`;

export function EarningsScreen({
  totalEarned,
  paidCount,
  inTransit,
  available,
  months,
  activity,
  payoutMethod,
  bankAccountHolder,
  bankIban,
  stripeAccountId,
}: {
  totalEarned: number;
  paidCount: number;
  inTransit: number;
  available: number;
  months: Month[];
  activity: Activity[];
  payoutMethod: string;
  bankAccountHolder: string | null;
  bankIban: string | null;
  stripeAccountId: string | null;
}) {
  const [method, setMethod] = useState(payoutMethod === "bank" ? "bank" : "stripe");
  const [amount, setAmount] = useState("");
  const [tab, setTab] = useState("Earnings and withdrawals");

  const sixMonths = months.reduce((s, m) => s + m.total, 0);
  const peak = Math.max(1, ...months.map((m) => m.total));
  const average = paidCount > 0 ? Math.round(totalEarned / paidCount) : 0;
  const stripeConnected = Boolean(stripeAccountId);

  return (
    <div className="mx-auto max-w-[1340px] pt-2">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-[40px] font-bold tracking-[-0.02em] text-[#111827]">Earnings</h1>
          <p className="mt-2 text-[15px] leading-[26px] text-[#6B7280]">
            Track revenue from your paid collaborations and withdraw available funds.
          </p>
        </div>
        <span className="inline-flex items-center gap-2 rounded-full border border-[#E5E7EB] bg-white px-3.5 py-1.5 text-[13px] font-medium text-[#4B5563]">
          <span className="size-1.5 rounded-full bg-[#2563eb]" />
          Paid collaborations
        </span>
      </div>

      {/* -------------------------------------------------------- summary */}
      <div className="mt-6 grid gap-5 lg:grid-cols-3">
        <div
          className="rounded-[18px] border border-[#E5E7EB] p-6"
          style={{
            backgroundImage:
              "radial-gradient(120% 150% at 88% 12%, rgba(214,232,255,0.55), rgba(255,255,255,0) 62%), linear-gradient(180deg,#FFFFFF,#F8FBFF)",
          }}
        >
          <p className="flex items-center gap-2 text-sm text-[#4B5563]">
            <TrendingUp size={16} strokeWidth={1.8} aria-hidden />
            Total earned
          </p>
          <p className="mt-3 text-[38px] font-bold tracking-[-0.02em] text-[#111827]">{euro(totalEarned)}</p>
          <p className="mt-6 text-[13px] text-[#6B7280]">
            {paidCount} paid collaboration{paidCount === 1 ? "" : "s"} · {euro(average)} average
          </p>
        </div>

        <Summary
          icon={<LogOut size={16} strokeWidth={1.8} aria-hidden />}
          value={euro(inTransit)}
          title="In transit"
          note="International transfers usually arrive within 1–7 days, depending on the destination and banking network."
        />
        <Summary
          icon={<Wallet size={16} strokeWidth={1.8} aria-hidden />}
          value={euro(available)}
          title="Available now"
          note="Ready to withdraw to your selected payout method."
        />
      </div>

      {/* ------------------------------------------------ chart + withdraw */}
      <div className="mt-5 grid gap-5 lg:grid-cols-12">
        <section className="rounded-[18px] border border-[#E5E7EB] bg-white p-6 lg:col-span-7">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-[#111827]">Earnings over time</h2>
              <p className="mt-1 text-sm text-[#6B7280]">
                Net collaboration earnings from the last six months.
              </p>
            </div>
            <p className="text-sm text-[#6B7280]">{euro(sixMonths)} over 6 months</p>
          </div>

          <div className="mt-8 flex h-[230px] items-end gap-4">
            {months.map((m) => (
              <div key={m.full} className="flex min-w-0 flex-1 flex-col items-center gap-2">
                <span className="text-xs text-[#6B7280]">{euro(m.total)}</span>
                <div
                  title={`${m.full} · ${euro(m.total)}`}
                  className={`w-full rounded-t-[10px] border-b-[3px] border-[#2563eb] ${
                    m.current ? "bg-[#EFF4FF]" : "bg-[#F1F2F5]"
                  }`}
                  // A zero month still shows its full column: the bar is the
                  // month, the number above it is the value.
                  style={{ height: `${28 + (m.total / peak) * 150}px` }}
                />
                <span className={`text-xs ${m.current ? "font-semibold text-[#2563eb]" : "text-[#6B7280]"}`}>
                  {m.label}
                </span>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-[18px] border border-[#E5E7EB] bg-white p-6 lg:col-span-5">
          <h2 className="text-lg font-bold text-[#111827]">Withdraw earnings</h2>
          <p className="mt-1 text-sm text-[#6B7280]">
            Choose where your available balance should be sent.
          </p>

          <p className="mt-5 text-[11px] font-bold uppercase tracking-[0.08em] text-[#6B7280]">
            Payout method
          </p>

          <div className="mt-2 space-y-3">
            <Method
              id="bank"
              selected={method === "bank"}
              onSelect={() => setMethod("bank")}
              icon={<Building2 size={16} strokeWidth={1.8} aria-hidden />}
              title="Bank transfer"
              lines={[
                bankAccountHolder ? `Account holder: ${bankAccountHolder}` : "No account holder on file",
                bankIban ? `IBAN ending ${bankIban.slice(-4)}` : "No bank details on file",
              ]}
              action="Edit"
            />
            <Method
              id="stripe"
              selected={method === "stripe"}
              onSelect={() => setMethod("stripe")}
              icon={<CreditCard size={16} strokeWidth={1.8} aria-hidden />}
              title="Stripe"
              lines={[
                `Status: ${stripeConnected ? "Connected" : "Not connected"}`,
                "Instant transfer to your connected Stripe account.",
              ]}
              action={stripeConnected ? "Manage" : "Connect Stripe"}
            />
          </div>

          <div className="mt-4 flex gap-2.5">
            <div className="relative flex-1">
              <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#6B7280]">€</span>
              <input
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                inputMode="decimal"
                placeholder="Amount"
                aria-label="Amount to withdraw"
                className="w-full rounded-[12px] border border-[#E5E7EB] py-3 pl-9 pr-4 text-sm text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#2563eb]"
              />
            </div>
            <button
              type="button"
              onClick={() => setAmount(String(available))}
              className="rounded-[12px] border border-[#E5E7EB] px-4 text-sm font-semibold text-[#111827] transition-colors hover:border-[#9CA3AF]"
            >
              Withdraw all
            </button>
          </div>

          <button
            type="button"
            disabled={available <= 0}
            title={available <= 0 ? "Nothing available to withdraw" : undefined}
            className="mt-3 w-full rounded-[12px] bg-[#2563eb] py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            Confirm withdrawal
          </button>

          <p className="mt-4 rounded-[12px] border border-[#EEF0F4] bg-[#FAFBFC] px-4 py-3 text-[13px] text-[#6B7280]">
            {inTransit > 0
              ? `${euro(inTransit)} is published and awaiting release by the brand.`
              : "No earnings are currently waiting for release."}
          </p>
        </section>
      </div>

      {/* -------------------------------------------------------- activity */}
      <section className="mt-5 rounded-[18px] border border-[#E5E7EB] bg-white p-6">
        <h2 className="text-lg font-bold text-[#111827]">Recent activity</h2>
        <p className="mt-1 text-sm text-[#6B7280]">
          Collaboration earnings, withdrawals and invoices in one place.
        </p>

        <div className="mt-5 flex flex-wrap gap-7 border-b border-[#ECEEF2]">
          {[
            ["Earnings and withdrawals", activity.length],
            ["Awaiting release", 0],
            ["Invoices", 0],
          ].map(([label, count]) => {
            const on = tab === label;
            return (
              <button
                key={String(label)}
                type="button"
                onClick={() => setTab(String(label))}
                aria-pressed={on}
                className={`-mb-px flex items-center gap-2 border-b-2 pb-3 text-sm transition-colors ${
                  on ? "border-[#2563eb] font-semibold text-[#2563eb]" : "border-transparent font-medium text-[#4B5563]"
                }`}
              >
                {label}
                {label === "Earnings and withdrawals" ? null : (
                  <span className="rounded-full bg-[#F3F4F6] px-2 py-0.5 text-xs font-semibold text-[#6B7280]">
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left">
            <thead>
              <tr className="border-b border-[#EEF0F4] text-[13px] text-[#6B7280]">
                {["Date", "Type", "Detail", "Amount", "Status", "Invoice"].map((h) => (
                  <th key={h} scope="col" className="py-4 font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tab !== "Earnings and withdrawals" || activity.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-sm text-[#6B7280]">
                    {tab === "Invoices"
                      ? "No invoices yet."
                      : tab === "Awaiting release"
                        ? "Nothing is awaiting release."
                        : "No earnings or withdrawals yet."}
                  </td>
                </tr>
              ) : (
                activity.map((a) => (
                  <tr key={a.id} className="border-b border-[#F5F6F8] text-sm last:border-b-0">
                    <td className="py-4 text-[#4B5563]">{a.date}</td>
                    <td className="py-4 text-[#4B5563]">{a.type}</td>
                    <td className="py-4 text-[#111827]">{a.detail}</td>
                    <td className="py-4 font-semibold text-[#111827]">{euro(a.amount)}</td>
                    <td className="py-4">
                      <span className="rounded-full bg-[#ECFDF3] px-2.5 py-1 text-xs font-semibold text-[#15803D]">
                        {a.status}
                      </span>
                    </td>
                    <td className="py-4 text-[#6B7280]">—</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function Summary({ icon, value, title, note }: { icon: React.ReactNode; value: string; title: string; note: string }) {
  return (
    <div className="rounded-[18px] border border-[#E5E7EB] bg-white p-6">
      <span className="text-[#6B7280]">{icon}</span>
      <p className="mt-3 text-[30px] font-bold tracking-[-0.02em] text-[#111827]">{value}</p>
      <p className="mt-1 text-sm font-semibold text-[#111827]">{title}</p>
      <p className="mt-1 text-[13px] leading-5 text-[#6B7280]">{note}</p>
    </div>
  );
}

function Method({
  id, selected, onSelect, icon, title, lines, action,
}: {
  id: string;
  selected: boolean;
  onSelect: () => void;
  icon: React.ReactNode;
  title: string;
  lines: string[];
  action: string;
}) {
  return (
    <label
      className={`block cursor-pointer rounded-[14px] border p-4 transition-colors ${
        selected ? "border-[#2563eb] bg-[#F5F8FF]" : "border-[#E5E7EB] bg-white"
      }`}
    >
      <span className="flex items-center gap-2.5">
        <input
          type="radio"
          name="payoutMethod"
          value={id}
          checked={selected}
          onChange={onSelect}
          className="accent-[#2563eb]"
        />
        <span className="text-[#6B7280]">{icon}</span>
        <span className="text-sm font-semibold text-[#111827]">{title}</span>
      </span>
      {lines.map((l) => (
        <span key={l} className="mt-1 block pl-[30px] text-[13px] text-[#6B7280]">{l}</span>
      ))}
      <button
        type="button"
        disabled
        title="Not available in this build — no payment processor is connected"
        className="ml-[30px] mt-3 rounded-[8px] border border-[#E5E7EB] bg-white px-3 py-1.5 text-xs font-semibold text-[#111827] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {action}
      </button>
    </label>
  );
}

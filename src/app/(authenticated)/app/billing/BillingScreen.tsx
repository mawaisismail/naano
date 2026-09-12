"use client";

import { useActionState, useEffect, useState } from "react";
import { CreditCard, Clock, Lock, ShieldCheck, X } from "lucide-react";
import { addBudget, type BrandState } from "@/lib/actions/brand-onboarding";

/**
 * /app/billing — naano's screen, with one deliberate difference.
 *
 * Their "Add budget" opens a Stripe-hosted checkout. No payment processor is
 * connected here, so the same dialog credits the balance directly and says so
 * in the dialog, on the button, and on every row it writes. The alternative —
 * a checkout that silently does nothing — is the version of this screen that
 * actually misleads someone.
 */

const PRESETS = [2500, 5000, 10000, 25000];
const MINIMUM = 500;

const euro = (n: number) => `€${n.toLocaleString("en-GB")}`;

export function BillingScreen({
  balance,
  entries,
}: {
  balance: number;
  entries: { id: string; reference: string; date: string; kind: string; amount: number }[];
}) {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState(5000);
  const [custom, setCustom] = useState("");
  const [tab, setTab] = useState("All");
  const [state, action, pending] = useActionState<BrandState, FormData>(addBudget, null);

  const chosen = custom ? Math.round(Number(custom) || 0) : amount;

  // Close once the credit has gone through, not on submit: a refused top-up
  // has to stay on screen with its reason.
  useEffect(() => {
    if (!pending && !state?.error && open) {
      const id = setTimeout(() => setOpen(false), 150);
      return () => clearTimeout(id);
    }
  }, [pending, state, open]);

  const shown = entries.filter((e) =>
    tab === "All" ? true : tab === "Top-ups" ? e.amount > 0 : e.amount < 0
  );

  return (
    <div className="px-8 pb-16 pt-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-[40px] font-bold tracking-[-0.02em] text-[#111827]">Billing</h1>
          <p className="mt-2 text-[15px] text-[#6B7280]">Manage your budget, plan and invoices.</p>
        </div>
        <span className="inline-flex items-center gap-2 rounded-full border border-[#E5E7EB] bg-white px-4 py-2 text-sm font-medium text-[#4B5563]">
          Need help?
        </span>
      </div>

      {/* --------------------------------------------------------- balance */}
      <section className="mt-6 flex flex-wrap items-start justify-between gap-6 rounded-[18px] border border-[#E5E7EB] bg-white p-8">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-[#6B7280]">
            Available balance
          </p>
          <p className="mt-2 text-[44px] font-bold leading-none tracking-[-0.02em] text-[#111827]">
            {`€${balance.toLocaleString("en-GB", { minimumFractionDigits: 2 })}`}
          </p>
          <p className="mt-2 text-sm text-[#6B7280]">Ready to spend across your campaigns.</p>

          <div className="mt-5 flex flex-wrap gap-2.5">
            <button
              type="button"
              onClick={() => { setCustom(""); setAmount(5000); setOpen(true); }}
              className="rounded-[10px] bg-[#2563eb] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#1D4ED8]"
            >
              Add budget
            </button>
            {[2500, 10000].map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => { setCustom(""); setAmount(v); setOpen(true); }}
                className="rounded-[10px] border border-[#E5E7EB] px-4 py-2.5 text-sm font-medium text-[#111827] transition-colors hover:border-[#9CA3AF]"
              >
                + {euro(v)}
              </button>
            ))}
          </div>
        </div>

        <span className="grid size-11 place-items-center rounded-full bg-[#EFF4FF] text-[#2563eb]">€</span>
      </section>

      {/* -------------------------------------------------------- invoices */}
      <section className="mt-5 rounded-[18px] border border-[#E5E7EB] bg-white p-6">
        <h2 className="text-lg font-bold text-[#111827]">Invoices</h2>
        <div className="mt-4 flex gap-7 border-b border-[#ECEEF2]">
          {["All", "Top-ups", "Bookings"].map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={`-mb-px border-b-2 pb-3 text-sm transition-colors ${
                tab === t ? "border-[#2563eb] font-semibold text-[#2563eb]" : "border-transparent font-medium text-[#4B5563]"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left">
            <thead>
              <tr className="border-b border-[#EEF0F4] text-[13px] text-[#6B7280]">
                {["Reference", "Date", "Type", "Amount", "Status", "Actions"].map((h) => (
                  <th key={h} scope="col" className="py-4 font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {shown.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-sm text-[#6B7280]">
                    No invoices or entries yet.
                  </td>
                </tr>
              ) : (
                shown.map((e) => (
                  <tr key={e.id} className="border-b border-[#F5F6F8] text-sm last:border-b-0">
                    <td className="py-4 font-mono text-[13px] text-[#111827]">{e.reference}</td>
                    <td className="py-4 text-[#4B5563]">{e.date}</td>
                    <td className="py-4 text-[#4B5563]">
                      {e.amount > 0 ? "Top-up" : "Booking"}
                    </td>
                    <td className="py-4 font-semibold text-[#111827]">{euro(e.amount)}</td>
                    <td className="py-4">
                      {/* The row says it, not just a banner: a screenshot of one
                          line still carries the disclosure. */}
                      <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                        e.kind === "demo_topup" ? "bg-[#FDFAF2] text-[#7A5A1E]" : "bg-[#ECFDF3] text-[#15803D]"
                      }`}>
                        {e.kind === "demo_topup" ? "Demo credit" : "Paid"}
                      </span>
                    </td>
                    <td className="py-4 text-[#9CA3AF]">—</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* ----------------------------------------------------------- modal */}
      {open ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-[#0f172a]/40 p-4" role="dialog" aria-modal="true" aria-label="Add budget">
          <form action={action} className="w-full max-w-[468px] rounded-[18px] bg-white p-7 shadow-[0_40px_90px_-30px_rgba(15,23,42,0.5)]">
            <div className="flex items-start justify-between gap-4">
              <span className="inline-flex items-center gap-2 rounded-full bg-[#EFF4FF] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.08em] text-[#2563eb]">
                <Lock size={12} strokeWidth={2.2} aria-hidden />
                Demo payment
              </span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="grid size-8 place-items-center rounded-full bg-[#F3F4F6] text-[#6B7280] transition-colors hover:text-[#111827]"
              >
                <X size={16} strokeWidth={2} aria-hidden />
              </button>
            </div>

            <h2 className="mt-4 text-[22px] font-bold text-[#111827]">Add budget</h2>
            <p className="mt-1.5 text-sm leading-6 text-[#6B7280]">
              One-time deposit to your Naano balance. Use it across all
              campaigns — no subscription.
            </p>

            {state?.error ? (
              <p role="alert" className="mt-4 rounded-[10px] border border-[#F2D6C8] bg-[#FDF6F1] px-3.5 py-2.5 text-sm text-[#8A4B22]">
                {state.error}
              </p>
            ) : null}

            <p className="mt-5 text-[11px] font-bold uppercase tracking-[0.08em] text-[#6B7280]">
              Choose an amount
            </p>
            <div className="mt-2 grid grid-cols-4 gap-2.5">
              {PRESETS.map((v) => {
                const on = !custom && amount === v;
                return (
                  <button
                    key={v}
                    type="button"
                    onClick={() => { setAmount(v); setCustom(""); }}
                    aria-pressed={on}
                    className={`rounded-[10px] border py-2.5 text-sm font-semibold transition-colors ${
                      on ? "border-[#2563eb] bg-white text-[#2563eb]" : "border-[#E5E7EB] bg-white text-[#111827]"
                    }`}
                  >
                    {euro(v)}
                  </button>
                );
              })}
            </div>

            <div className="relative mt-2.5">
              <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#9CA3AF]">€</span>
              <input
                value={custom}
                onChange={(e) => setCustom(e.target.value.replace(/[^0-9]/g, ""))}
                inputMode="numeric"
                placeholder="Custom amount"
                aria-label="Custom amount"
                className="w-full rounded-[10px] border border-[#E5E7EB] py-3 pl-9 pr-4 text-sm text-[#111827] placeholder:text-[#9CA3AF] focus:border-[#2563eb] focus:outline-none focus:ring-2 focus:ring-[#2563eb]/15"
              />
            </div>
            <p className="mt-1.5 text-[13px] text-[#9CA3AF]">
              Minimum {euro(MINIMUM)} · credited immediately
            </p>

            <div className="mt-4 flex items-center justify-between rounded-[12px] bg-[#F7F8FA] px-4 py-3.5">
              <span>
                <span className="block text-[13px] text-[#6B7280]">You will credit</span>
                <span className="block text-[17px] font-bold text-[#111827]">{euro(chosen)}</span>
              </span>
              <span className="text-right">
                <span className="block text-[13px] text-[#6B7280]">Current balance</span>
                <span className="block text-[17px] font-bold text-[#111827]">{euro(balance)}</span>
              </span>
            </div>

            <ul className="mt-4 space-y-2.5 rounded-[12px] border border-[#F2E2C0] bg-[#FDFAF2] p-4 text-[13px] leading-5 text-[#7A5A1E]">
              <li className="flex gap-2.5">
                <CreditCard size={15} strokeWidth={1.8} aria-hidden className="mt-0.5 shrink-0" />
                <span>
                  <strong className="font-semibold">No card is charged.</strong> This
                  build has no payment processor connected, so the amount is
                  credited straight to your balance for the MVP.
                </span>
              </li>
              <li className="flex gap-2.5">
                <ShieldCheck size={15} strokeWidth={1.8} aria-hidden className="mt-0.5 shrink-0" />
                <span>
                  <strong className="font-semibold">No subscription</strong> — funds stay
                  in your Naano balance until used.
                </span>
              </li>
              <li className="flex gap-2.5">
                <Clock size={15} strokeWidth={1.8} aria-hidden className="mt-0.5 shrink-0" />
                <span>
                  <strong className="font-semibold">Pay on delivery</strong> — creators are
                  charged only after the post is delivered.
                </span>
              </li>
            </ul>

            <input type="hidden" name="amount" value={chosen} />
            <button
              disabled={pending || chosen < MINIMUM}
              className="mt-5 w-full rounded-[12px] bg-[#2563eb] py-3.5 text-[15px] font-semibold text-white transition-colors hover:bg-[#1D4ED8] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {pending ? "Crediting…" : `Add ${euro(chosen)} (demo)`}
            </button>
            <p className="mt-3 text-center text-[12px] text-[#9CA3AF]">
              Demo credit · no Stripe checkout in this build
            </p>
          </form>
        </div>
      ) : null}
    </div>
  );
}

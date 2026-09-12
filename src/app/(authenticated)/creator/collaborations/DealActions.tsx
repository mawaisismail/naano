"use client";

import { useActionState } from "react";
import { FileText, CalendarClock, Link2 } from "lucide-react";
import { markDraftReady, markScheduled, markPublished, type PublishState } from "@/lib/actions/deals";
import { euro } from "@/lib/format";

/**
 * The creator's work on an accepted booking: draft it, schedule it, publish it.
 *
 * These transitions used to sit on the brand's screen, which meant the brand
 * marked the creator's draft ready and pressed publish on a post only the
 * creator can publish. Each step is now taken by the person who actually does
 * the thing it describes.
 */

export type ActiveDeal = {
  dealId: string;
  brand: string;
  campaign: string;
  status: string;
  price: number;
};

export function DealActions({ deals }: { deals: ActiveDeal[] }) {
  if (deals.length === 0) return null;

  return (
    <section className="mb-6 rounded-[18px] border border-[#E5E7EB] bg-white p-6">
      <h2 className="text-lg font-bold text-[#111827]">In progress</h2>
      <p className="mt-1 text-[13px] text-[#6B7280]">
        Bookings you have accepted. Move each one along as you do the work.
      </p>

      <ul className="mt-5 space-y-3">
        {deals.map((d) => (
          <Row key={d.dealId} deal={d} />
        ))}
      </ul>
    </section>
  );
}

function Row({ deal }: { deal: ActiveDeal }) {
  const [, draft, drafting] = useActionState(async () => {
    await markDraftReady(deal.dealId);
    return null;
  }, null);
  const [, schedule, scheduling] = useActionState(async () => {
    await markScheduled(deal.dealId);
    return null;
  }, null);
  const [publishState, publish, publishing] = useActionState<PublishState, FormData>(
    markPublished,
    null
  );

  const button =
    "inline-flex items-center gap-1.5 rounded-[10px] bg-[#2563eb] px-4 py-2 text-[13px] font-semibold text-white transition-colors hover:bg-[#1D4ED8] disabled:opacity-60";

  return (
    <li className="rounded-[14px] border border-[#EEF0F4] p-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="min-w-[220px] flex-1">
          <p className="text-[15px] font-bold text-[#111827]">{deal.brand}</p>
          <p className="mt-0.5 text-[13px] text-[#6B7280]">
            {deal.campaign} · {euro(deal.price)}
          </p>
        </div>

        {deal.status === "accepted" ? (
          <form action={draft}>
            <button disabled={drafting} className={button}>
              <FileText size={14} strokeWidth={2} aria-hidden />
              {drafting ? "Saving…" : "My draft is ready"}
            </button>
          </form>
        ) : null}

        {deal.status === "draft" ? (
          <form action={schedule}>
            <button disabled={scheduling} className={button}>
              <CalendarClock size={14} strokeWidth={2} aria-hidden />
              {scheduling ? "Saving…" : "Scheduled to post"}
            </button>
          </form>
        ) : null}
      </div>

      {deal.status === "scheduled" || deal.status === "draft" ? (
        <form action={publish} className="mt-3 border-t border-[#F2F4F7] pt-3">
          <input type="hidden" name="dealId" value={deal.dealId} />
          <label htmlFor={`url-${deal.dealId}`} className="text-[11px] font-bold uppercase tracking-[0.08em] text-[#6B7280]">
            Published post
          </label>
          {publishState?.error ? (
            <p role="alert" className="mt-1.5 text-[13px] text-[#8A4B22]">
              {publishState.error}
            </p>
          ) : null}
          <div className="mt-1.5 flex flex-wrap items-center gap-2">
            <input
              id={`url-${deal.dealId}`}
              name="postUrl"
              required
              placeholder="https://www.linkedin.com/posts/…"
              className="min-w-[240px] flex-1 rounded-[10px] border border-[#E5E7EB] px-3.5 py-2.5 text-sm text-[#111827] placeholder:text-[#9CA3AF] focus:border-[#2563eb] focus:outline-none"
            />
            <button disabled={publishing} className={button}>
              <Link2 size={14} strokeWidth={2} aria-hidden />
              {publishing ? "Saving…" : "It is live"}
            </button>
          </div>
          <p className="mt-1.5 text-[12px] text-[#9CA3AF]">
            The link is what attribution is checked against, so it is required.
          </p>
        </form>
      ) : null}
    </li>
  );
}

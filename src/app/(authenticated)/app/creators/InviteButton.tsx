"use client";

import { useActionState, useState } from "react";
import { Check, Send, X } from "lucide-react";
import { inviteCreator, type InviteState } from "@/lib/actions/invite";

/**
 * Invite one creator onto one campaign.
 *
 * The campaign has to be chosen, not assumed: a brand running three campaigns
 * would otherwise discover afterwards which one it booked against. With no
 * campaigns yet it says so and links to the place that creates one, rather
 * than offering a control that cannot work.
 */
export function InviteButton({
  creatorId,
  creatorName,
  price,
  campaigns,
  alreadyInvited,
}: {
  creatorId: string;
  creatorName: string;
  price: number;
  campaigns: { id: string; name: string }[];
  alreadyInvited: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [state, action, pending] = useActionState<InviteState, FormData>(inviteCreator, null);

  // No effect closing the dialog on success: the success state IS the closed
  // state, because the button is replaced by "Invited". Writing setOpen(false)
  // from an effect would be a second render saying what this render already
  // knows.
  if (alreadyInvited || state?.ok) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-[10px] bg-[#ECFDF3] px-4 py-2 text-[13px] font-semibold text-[#15803D]">
        <Check size={14} strokeWidth={2.4} aria-hidden />
        Invited
      </span>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-[10px] bg-[#2563eb] px-4 py-2 text-[13px] font-semibold text-white transition-colors hover:bg-[#1D4ED8]"
      >
        Invite
      </button>

      {open ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-[#0f172a]/40 p-4" role="dialog" aria-modal="true" aria-label={`Invite ${creatorName}`}>
          <form action={action} className="w-full max-w-[420px] rounded-[18px] bg-white p-6 shadow-[0_40px_90px_-30px_rgba(15,23,42,0.5)]">
            <div className="flex items-start justify-between gap-4">
              <h2 className="text-[19px] font-bold text-[#111827]">Invite {creatorName}</h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="grid size-8 place-items-center rounded-full bg-[#F3F4F6] text-[#6B7280]"
              >
                <X size={16} strokeWidth={2} aria-hidden />
              </button>
            </div>

            <p className="mt-2 text-[13px] leading-5 text-[#6B7280]">
              They receive the campaign brief and decide whether to take it. The
              fee is their published rate, €{price.toLocaleString("en-GB")} per post.
            </p>

            {state?.error ? (
              <p role="alert" className="mt-4 rounded-[10px] border border-[#F2D6C8] bg-[#FDF6F1] px-3.5 py-2.5 text-sm text-[#8A4B22]">
                {state.error}
              </p>
            ) : null}

            {campaigns.length === 0 ? (
              <p className="mt-5 rounded-[12px] border border-[#F2E2C0] bg-[#FDFAF2] p-4 text-[13px] leading-5 text-[#7A5A1E]">
                You have no live campaign yet. A creator is invited onto a
                campaign, so there has to be one first.
              </p>
            ) : (
              <>
                <label htmlFor={`campaign-${creatorId}`} className="mt-5 block text-[11px] font-bold uppercase tracking-[0.08em] text-[#6B7280]">
                  Campaign
                </label>
                <select
                  id={`campaign-${creatorId}`}
                  name="campaignId"
                  required
                  className="mt-1.5 w-full rounded-[10px] border border-[#E5E7EB] bg-white px-3.5 py-3 text-sm text-[#111827] focus:border-[#2563eb] focus:outline-none"
                >
                  {campaigns.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </>
            )}

            <input type="hidden" name="creatorId" value={creatorId} />
            <button
              disabled={pending || campaigns.length === 0}
              className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-[12px] bg-[#2563eb] py-3 text-[15px] font-semibold text-white transition-colors hover:bg-[#1D4ED8] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Send size={15} strokeWidth={2} aria-hidden />
              {pending ? "Sending…" : "Send invitation"}
            </button>
          </form>
        </div>
      ) : null}
    </>
  );
}

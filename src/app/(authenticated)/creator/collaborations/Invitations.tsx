"use client";

import { useActionState } from "react";
import { Check, X } from "lucide-react";
import { acceptOffer, declineOffer } from "@/lib/actions/deals";
import { euro } from "@/lib/format";

/**
 * Invitations a brand has sent, waiting on this creator.
 *
 * Until now the brand pressed "Mark accepted" itself, which meant a creator
 * could find themselves booked onto a campaign they had never seen. Accepting
 * is the creator's, and it happens here.
 */

export type Invitation = {
  dealId: string;
  brand: string;
  campaign: string;
  objective: string;
  price: number;
  due: string | null;
};

export function Invitations({ invitations }: { invitations: Invitation[] }) {
  if (invitations.length === 0) return null;

  return (
    <section className="mb-6 rounded-[18px] border border-[#CFE0FF] bg-[#F5F8FF] p-6">
      <h2 className="text-lg font-bold text-[#111827]">
        {invitations.length} invitation{invitations.length === 1 ? "" : "s"} waiting on you
      </h2>
      <p className="mt-1 text-[13px] text-[#4B5563]">
        A brand has asked you to post. Nothing is booked until you accept.
      </p>

      <ul className="mt-5 space-y-3">
        {invitations.map((i) => (
          <InvitationRow key={i.dealId} invitation={i} />
        ))}
      </ul>
    </section>
  );
}

function InvitationRow({ invitation: i }: { invitation: Invitation }) {
  const [, accept, accepting] = useActionState(async () => {
    await acceptOffer(i.dealId);
    return null;
  }, null);
  const [, decline, declining] = useActionState(async () => {
    await declineOffer(i.dealId);
    return null;
  }, null);

  return (
    <li className="flex flex-wrap items-center justify-between gap-4 rounded-[14px] border border-[#E5E7EB] bg-white p-4">
      <div className="min-w-[220px] flex-1">
        <p className="text-[15px] font-bold text-[#111827]">{i.brand}</p>
        <p className="mt-0.5 text-[13px] text-[#6B7280]">
          {i.campaign} · {i.objective}
        </p>
        <p className="mt-1.5 text-[12px] text-[#9CA3AF]">
          {euro(i.price)} per post{i.due ? ` · live by ${i.due}` : ""}
        </p>
      </div>

      <div className="flex items-center gap-2">
        <form action={decline}>
          <button
            disabled={declining || accepting}
            className="inline-flex items-center gap-1.5 rounded-[10px] border border-[#E5E7EB] px-4 py-2 text-[13px] font-semibold text-[#4B5563] transition-colors hover:border-[#9CA3AF] disabled:opacity-60"
          >
            <X size={14} strokeWidth={2.2} aria-hidden />
            {declining ? "Declining…" : "Decline"}
          </button>
        </form>
        <form action={accept}>
          <button
            disabled={accepting || declining}
            className="inline-flex items-center gap-1.5 rounded-[10px] bg-[#2563eb] px-4 py-2 text-[13px] font-semibold text-white transition-colors hover:bg-[#1D4ED8] disabled:opacity-60"
          >
            <Check size={14} strokeWidth={2.4} aria-hidden />
            {accepting ? "Accepting…" : "Accept"}
          </button>
        </form>
      </div>
    </li>
  );
}

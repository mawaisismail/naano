"use client";

import { useActionState } from "react";
import { applyToCampaign, type ApplyState } from "@/lib/actions/apply";

/** Apply, or say so when this creator already has. */
export function ApplyButton({ campaignId, applied }: { campaignId: string; applied: boolean }) {
  const [state, action, pending] = useActionState<ApplyState, FormData>(applyToCampaign, null);
  const done = applied || state?.ok;

  return (
    <form action={action} className="flex-1">
      <input type="hidden" name="campaignId" value={campaignId} />
      <button
        disabled={pending || done}
        className={`w-full rounded-[12px] px-3 py-3 text-sm font-semibold transition-colors ${
          done
            ? "cursor-default border border-[#BBE7CE] bg-[#F1FBF5] text-[#146C3A]"
            : "bg-[#2563eb] text-white hover:bg-[#1D4ED8] disabled:opacity-60"
        }`}
      >
        {done ? "Applied" : pending ? "Applying…" : "Apply"}
      </button>
      {state?.error ? (
        <p role="alert" className="mt-2 text-left text-xs text-[#8A4B22]">
          {state.error}
        </p>
      ) : null}
    </form>
  );
}

import Link from "next/link";
import { allCreators } from "@/lib/creator-profile";
import { getCurrentUser } from "@/lib/session";
import { NewCampaignForm } from "@/components/app/NewCampaignForm";

export default async function NewCampaignPage({
  searchParams,
}: {
  searchParams: Promise<{ creators?: string }>;
}) {
  const { creators: raw } = await searchParams;
  const ids = (raw ?? "").split(",").filter(Boolean);
  const picked = (await allCreators()).filter((c) => ids.includes(c.id));
  const user = await getCurrentUser();

  if (picked.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-8 py-20 text-center">
        <h1 className="text-[28px] font-bold tracking-[-0.02em] text-[#111827]">
          No creators selected
        </h1>
        <p className="mt-2 text-[15px] text-[#6B7280]">
          Pick creators in AI Matching, then build the brief.
        </p>
        <Link
          href="/app/creators"
          className="mt-6 inline-block rounded-[10px] bg-[#2563eb] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#1D4ED8]"
        >
          Go to AI Matching
        </Link>
      </div>
    );
  }

  return (
    <div className="px-8 pb-16 pt-2">
      <div className="mb-8">
        <div className="text-[11px] font-bold uppercase tracking-[0.1em] text-[#6B7280]">
          Step 02 — Brief
        </div>
        <h1 className="mt-2 text-[40px] font-bold tracking-[-0.02em] text-[#111827]">
          New campaign
        </h1>
        <p className="mt-2 text-[15px] text-[#6B7280]">
          {picked.length} creator{picked.length === 1 ? "" : "s"} selected. Draft the
          brief, then send the invites.
        </p>
      </div>
      <NewCampaignForm creators={picked} company={user?.companyName ?? "your product"} />
    </div>
  );
}

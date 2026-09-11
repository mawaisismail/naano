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
      <div className="mx-auto max-w-3xl px-6 py-20 text-center">
        <h1 className="font-display text-2xl font-extrabold text-ink">
          No creators selected
        </h1>
        <p className="mt-2 text-muted">
          Pick creators in the marketplace, then build the brief.
        </p>
        <Link
          href="/marketplace"
          className="mt-6 inline-block rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-strong"
        >
          Go to marketplace
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <div className="mb-8">
        <div className="nn-eyebrow">Step 02 — Brief</div>
        <h1 className="mt-2 font-display text-3xl font-extrabold text-ink">
          New campaign
        </h1>
        <p className="mt-1.5 text-muted">
          {picked.length} creator{picked.length === 1 ? "" : "s"} selected. Draft the
          brief, then send the invites.
        </p>
      </div>
      <NewCampaignForm creators={picked} company={user?.companyName ?? "your product"} />
    </div>
  );
}

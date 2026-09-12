import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { NEXT_ACTION } from "@/lib/lifecycle";
import { CollaborationTable, type Collab } from "./CollaborationTable";

export const metadata = { title: "Collaborations — Naano" };

/** What the creator owes at each stage — the mirror of the brand's NEXT_ACTION. */
const CREATOR_ACTION: Record<string, string> = {
  invited: "Waiting on the brand",
  accepted: "Draft your post",
  draft: "Await approval",
  scheduled: "Publish on the agreed date",
  live: "Awaiting payout",
  paid: "Nothing — complete",
  declined: "Nothing",
};

export default async function CollaborationsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const deals = await prisma.deal.findMany({
    where: { creatorSlug: user.creatorSlug ?? "__none__" },
    include: { campaign: { include: { brand: true } }, _count: { select: { clicks: true } } },
    orderBy: { createdAt: "desc" },
  });

  const rows: Collab[] = deals.map((d) => ({
    id: d.id,
    brand: d.campaign.brand.companyName ?? d.campaign.brand.name,
    campaign: d.campaign.name,
    status: d.status,
    clicks: d._count.clicks,
    nextAction: CREATOR_ACTION[d.status] ?? NEXT_ACTION[d.status] ?? "—",
    due: d.campaign.postDeadline
      ? d.campaign.postDeadline.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
      : null,
    net: d.price,
  }));

  return <CollaborationTable rows={rows} />;
}

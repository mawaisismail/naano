import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { NEXT_ACTION } from "@/lib/lifecycle";
import { CollaborationTable, type Collab } from "./CollaborationTable";
import { Invitations, type Invitation } from "./Invitations";
import { DealActions } from "./DealActions";

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
    where: { creatorId: user.id },
    include: { campaign: { include: { brand: true } }, _count: { select: { clicks: true } } },
    orderBy: { createdAt: "desc" },
  });

  const fmt = (d: Date) =>
    d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

  // Two lists from one query: what is waiting on this creator to answer, and
  // everything else. An invitation buried in a table of past work is an
  // invitation that expires unread.
  const invitations: Invitation[] = deals
    .filter((d) => d.status === "invited" && d.initiatedBy === "brand")
    .map((d) => ({
      dealId: d.id,
      brand: d.campaign.brand.companyName ?? d.campaign.brand.name,
      campaign: d.campaign.name,
      objective: d.campaign.objective,
      price: d.price,
      due: d.campaign.postDeadline ? fmt(d.campaign.postDeadline) : null,
    }));

  const active = deals.filter(
    (d) => d.status === "accepted" || d.status === "draft" || d.status === "scheduled"
  );

  const rows: Collab[] = deals.map((d) => ({
    id: d.id,
    brand: d.campaign.brand.companyName ?? d.campaign.brand.name,
    campaign: d.campaign.name,
    status: d.status,
    clicks: d._count.clicks,
    nextAction:
      d.status === "invited" && d.initiatedBy === "brand"
        ? "Accept or decline above"
        : CREATOR_ACTION[d.status] ?? NEXT_ACTION[d.status] ?? "—",
    due: d.campaign.postDeadline ? fmt(d.campaign.postDeadline) : null,
    net: d.price,
  }));

  return (
    <>
      <Invitations invitations={invitations} />
      <DealActions
        deals={active.map((d) => ({
          dealId: d.id,
          brand: d.campaign.brand.companyName ?? d.campaign.brand.name,
          campaign: d.campaign.name,
          status: d.status,
          price: d.price,
        }))}
      />
      <CollaborationTable rows={rows} />
    </>
  );
}

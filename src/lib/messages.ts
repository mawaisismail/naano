import { prisma } from "@/lib/db";

/**
 * The conversation list and one thread, for whichever side is asking.
 *
 * Both surfaces need the same two queries with the counterpart swapped, so
 * they live here rather than being written twice and drifting apart.
 */

export type Conversation = {
  dealId: string;
  counterpart: string;
  campaign: string;
  status: string;
  last: string | null;
  lastAt: string | null;
  unread: number;
};

const when = (d: Date) => {
  const today = new Date();
  const sameDay = d.toDateString() === today.toDateString();
  return sameDay
    ? d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })
    : d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
};

export const messageTime = when;

/**
 * Conversations that have been spoken in come first, newest reply at the top;
 * silent bookings follow, newest booking first.
 *
 * Comparing a last-message time against a booking date in one sort does not do
 * this: a booking created today outranks a reply from yesterday, so the screen
 * opens on an empty room while the live conversation sits below it. Whether a
 * thread has been spoken in is the primary key, and time only breaks ties
 * inside each group.
 *
 * Exported and pure so the rule can be tested without a database.
 */
export function orderConversations<
  T extends { createdAt: Date; messages: { createdAt: Date }[] },
>(deals: T[]): T[] {
  const at = (d: T) => (d.messages[0]?.createdAt ?? d.createdAt).getTime();
  return [...deals].sort((a, b) => {
    const spoken = Number(b.messages.length > 0) - Number(a.messages.length > 0);
    return spoken !== 0 ? spoken : at(b) - at(a);
  });
}

export async function conversationsFor(user: {
  id: string;
  role: string;
  creatorSlug: string | null;
}): Promise<Conversation[]> {
  const deals = await prisma.deal.findMany({
    where:
      user.role === "brand"
        ? { campaign: { brandId: user.id } }
        : { creatorSlug: user.creatorSlug ?? "__none__" },
    include: {
      campaign: { include: { brand: { select: { name: true, companyName: true } } } },
      messages: { orderBy: { createdAt: "desc" }, take: 1 },
      _count: { select: { messages: { where: { senderRole: { not: user.role }, readAt: null } } } },
    },
    orderBy: { createdAt: "desc" },
  });

  return orderConversations(deals)
    .map((d) => ({
    dealId: d.id,
    counterpart:
      user.role === "brand"
        ? d.creatorName
        : d.campaign.brand.companyName ?? d.campaign.brand.name,
    campaign: d.campaign.name,
    status: d.status,
    last: d.messages[0]?.body ?? null,
    lastAt: d.messages[0] ? when(d.messages[0].createdAt) : null,
    unread: d._count.messages,
  }));
}

export async function threadFor(dealId: string) {
  const messages = await prisma.message.findMany({
    where: { dealId },
    orderBy: { createdAt: "asc" },
  });
  return messages.map((m) => ({
    id: m.id,
    senderRole: m.senderRole,
    senderName: m.senderName,
    body: m.body,
    at: when(m.createdAt),
  }));
}

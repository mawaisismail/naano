import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";

export const dynamic = "force-dynamic";

/**
 * Click totals for the signed-in brand, polled by the live counters.
 * Deliberately small: a total plus a per-deal map, nothing else.
 */
export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ total: 0, byDeal: {} });

  const deals = await prisma.deal.findMany({
    where: { campaign: { brandId: user.id } },
    select: { id: true, _count: { select: { clicks: true } } },
  });

  const byDeal: Record<string, number> = {};
  let total = 0;
  for (const d of deals) {
    byDeal[d.id] = d._count.clicks;
    total += d._count.clicks;
  }

  return NextResponse.json(
    { total, byDeal, at: Date.now() },
    { headers: { "Cache-Control": "no-store" } }
  );
}

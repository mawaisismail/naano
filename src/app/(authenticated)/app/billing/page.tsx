import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { BillingScreen } from "./BillingScreen";

export const metadata = { title: "Billing — Naano" };

export default async function BillingPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const entries = await prisma.walletEntry.findMany({
    where: { brandId: user.id },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return (
    <BillingScreen
      balance={user.walletBalance}
      entries={entries.map((e) => ({
        id: e.id,
        reference: e.reference,
        date: e.createdAt.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }),
        kind: e.kind,
        amount: e.amount,
      }))}
    />
  );
}

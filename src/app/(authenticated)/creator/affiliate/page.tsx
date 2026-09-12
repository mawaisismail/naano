import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { AffiliateScreen } from "./AffiliateScreen";
import { ensureReferralCode } from "@/lib/actions/referral";

export const metadata = { title: "Affiliate program — Naano" };

export default async function AffiliatePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const code = user.referralCode ?? (await ensureReferralCode(user.id));

  // The origin comes from the request rather than from window, so the server
  // and the first client render agree on the link text. Deriving it in the
  // browser produced a hydration mismatch: the server has no window and fell
  // back to naano.com while the client rendered localhost.
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "naano.com";
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  const origin = `${proto}://${host}`;

  const referred = await prisma.user.findMany({
    where: { referredById: user.id },
    select: { id: true, companyName: true, name: true, referredAt: true },
    orderBy: { referredAt: "desc" },
  });

  // A referral is "earning now" while it sits inside the three-month window
  // that opens on its first completed paid campaign. Nothing has completed in
  // this build, so the window has not opened for anyone.
  const earningNow = 0;

  return (
    <AffiliateScreen
      code={code}
      origin={origin}
      cardPath={user.creatorSlug ? `/creators/${user.creatorSlug}` : "/creator/card"}
      rewardsEarned={0}
      brandsIntroduced={referred.length}
      earningNow={earningNow}
      referred={referred.map((r) => ({
        id: r.id,
        name: r.companyName ?? r.name,
        joined: r.referredAt
          ? r.referredAt.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
          : "—",
      }))}
    />
  );
}

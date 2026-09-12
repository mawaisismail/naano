import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { rankCreatorsSemantic } from "@/lib/matching";
import { MatchingScreen } from "./MatchingScreen";

export const dynamic = "force-dynamic";
export const metadata = { title: "Creators — Naano" };

/**
 * AI Matching, naano's first screen for a brand.
 *
 * The prompt box is real: what is typed is embedded and scored exactly like an
 * ICP, so "creators who post about outbound" finds people whose bios never use
 * that word. It is a ranking, not a chat — the screen says which of the two
 * methods produced the list, because a fallback that looks identical to the
 * real thing is how a silently degraded product ships.
 */
export default async function CreatorsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; view?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const { q, view } = await searchParams;

  // The typed prompt is treated as a fourth ICP, so the ranking that answers it
  // is the same ranking that produced the default list.
  const icps = q?.trim() ? [...user.icps, q.trim()] : user.icps;
  const { matches, method } = await rankCreatorsSemantic(
    { icps, valueProp: user.valueProp },
    24
  );

  return (
    <MatchingScreen
      company={user.companyName ?? user.name}
      query={q ?? ""}
      view={view === "marketplace" ? "marketplace" : "matching"}
      method={method}
      icps={user.icps}
      matches={matches.map(({ creator, score, reasons, matched, total }) => ({
        id: creator.id,
        slug: creator.slug,
        name: creator.name,
        headline: creator.headline,
        avatar: creator.avatar,
        flag: creator.flag,
        country: creator.country,
        verticals: creator.verticals,
        followers: creator.followers,
        medianViews: creator.medianViews,
        postCost: creator.postCost,
        engagementRate: creator.engagementRate,
        score,
        reasons,
        matched,
        total,
      }))}
    />
  );
}

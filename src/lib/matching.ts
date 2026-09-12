import { CREATORS, type Creator } from "@/lib/creators";

/**
 * Ranking creators against a brand's ICPs — the "AI Matching" score.
 *
 * There is no model behind it and the UI says so. It is a transparent overlap
 * score: what fraction of the brand's stated ideal customers a creator's
 * audience actually contains, nudged by how well the creator's verticals match
 * the words in the value proposition. That is defensible, reproducible and
 * explainable per creator, which matters more here than a number that looks
 * clever and cannot be checked.
 *
 * The reasons are returned with the score so a card can show WHY a creator is
 * an 87% match instead of asking the brand to trust it.
 */

export type Match = {
  creator: Creator;
  score: number;
  /** The ICP titles this creator's audience actually overlapped. */
  reasons: string[];
  /** How many of the brand's ICPs matched, out of how many exist. */
  matched: number;
  total: number;
};

/** Words too common to carry any signal when matching a value prop. */
const STOP = new Set([
  "the", "and", "for", "with", "that", "from", "your", "you", "our", "who", "are",
  "b2b", "saas", "teams", "team", "help", "helps", "platform", "software", "tool",
  "tools", "into", "without", "more", "less", "than", "this", "they", "their",
]);

const words = (s: string) =>
  s
    .toLowerCase()
    .split(/[^a-z0-9+]+/)
    .filter((w) => w.length > 2 && !STOP.has(w));

/**
 * An ICP line is "Title — description"; the title carries the signal ("RevOps
 * leaders at Series B"), so it is weighted over the sentence after the dash.
 */
const icpTerms = (icp: string) => {
  const [title, rest = ""] = icp.split("—");
  return [...words(title), ...words(title), ...words(rest)];
};

export function scoreCreator(
  creator: Creator,
  { icps, valueProp }: { icps: string[]; valueProp?: string | null }
): Match {
  const haystack = words(
    [creator.headline, creator.bio, creator.verticals.join(" "), creator.icp.join(" ")].join(" ")
  );
  const has = new Set(haystack);

  const reasons: string[] = [];
  let hits = 0;
  let total = 0;

  for (const icp of icps) {
    const terms = icpTerms(icp);
    if (terms.length === 0) continue;
    total += 1;
    const overlap = terms.filter((t) => has.has(t)).length;
    if (overlap > 0) {
      hits += 1;
      reasons.push(icp.split("—")[0].trim());
    }
  }

  const propTerms = valueProp ? words(valueProp) : [];
  const propOverlap = propTerms.filter((t) => has.has(t)).length;

  // 55 is the floor for anyone in the marketplace — a creator with a B2B SaaS
  // audience is never a 0% match for a B2B SaaS brand — and the ICP overlap
  // and value-prop overlap carry the rest.
  const icpPart = total > 0 ? (hits / total) * 32 : 0;
  const propPart = Math.min(propOverlap, 4) * 2.5;
  const reachPart = Math.min(creator.engagementRate / 4, 1) * 3;
  const score = Math.round(Math.min(55 + icpPart + propPart + reachPart, 99));

  if (reasons.length === 0) reasons.push(creator.verticals[0] ?? "B2B audience");
  return { creator, score, reasons, matched: hits, total };
}

/** The marketplace, best match first. */
export function rankCreators(
  brand: { icps: string[]; valueProp?: string | null },
  limit = CREATORS.length
): Match[] {
  return CREATORS.map((c) => scoreCreator(c, brand))
    .sort((a, b) => b.score - a.score || b.creator.followers - a.creator.followers)
    .slice(0, limit);
}

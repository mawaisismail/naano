import type { Creator } from "@/lib/creators";

/**
 * Ranking creators against a brand's ICPs — the "AI Matching" score.
 *
 * Two implementations, same output shape.
 *
 * `rankCreatorsSemantic` is the real one: the brand's ICPs and each creator's
 * profile are embedded, and the score is cosine similarity in that space. It
 * matches "revenue leaders who own the CRM" to a RevOps creator without the
 * two sharing a single word, which is the entire reason to use a model here.
 *
 * `rankCreators` is the lexical fallback underneath it — word overlap between
 * the ICP titles and the creator's own text. It needs no network, so it is
 * what runs when the model is unconfigured or unreachable, and what the tests
 * pin. A matching screen that cannot render because a provider is down would
 * be a worse product than one that ranks slightly less well.
 *
 * Both return the reasons alongside the score, so a card can show WHY a
 * creator is an 87% match instead of asking the brand to trust it.
 */

export type MatchMethod = "embeddings" | "lexical";

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

/**
 * Rank a list of creators, best match first.
 *
 * The list is passed in rather than imported: creators are database rows now,
 * so who is in the marketplace is a question for the caller, and this file
 * stays a pure function of its inputs — which is why it can be tested without
 * a database.
 */
export function rankCreators(
  creators: Creator[],
  brand: { icps: string[]; valueProp?: string | null },
  limit = creators.length
): Match[] {
  return creators
    .map((c) => scoreCreator(c, brand))
    .sort((a, b) => b.score - a.score || b.creator.followers - a.creator.followers)
    .slice(0, limit);
}

/* ---------------------------------------------------------- semantic --- */

import { cosine } from "@/lib/ai/cloudflare";
import { embedCached } from "@/lib/ai/embeddings-cache";

/**
 * What a creator is embedded as.
 *
 * Headline and bio first: they are what the person actually says about
 * themselves, and they carry the most signal. The audience list is appended
 * because an ICP is a description of an audience, so the two are being
 * compared like for like.
 */
const creatorText = (c: Creator) =>
  [c.headline, c.bio, `Audience: ${c.icp.join(", ")}`, `Topics: ${c.verticals.join(", ")}`].join(
    ". "
  );

/**
 * Turning cosine into a percentage a person can read.
 *
 * bge-base packs everything English into a narrow band — two unrelated B2B
 * sentences still score around 0.5 — so showing the raw cosine would rate
 * every creator "55%" and rank them invisibly. These two constants are the
 * observed floor and ceiling for this corpus, and the score is the position
 * between them. It is a display transform on a real measurement, not a curve
 * invented to make the numbers look good: the ORDER is exactly the cosine
 * order.
 */
const COSINE_FLOOR = 0.45;
const COSINE_CEILING = 0.82;
/** Above this, a creator's audience genuinely contains that ICP. */
const MATCH_THRESHOLD = 0.6;

const toScore = (cos: number) => {
  const t = (cos - COSINE_FLOOR) / (COSINE_CEILING - COSINE_FLOOR);
  return Math.round(Math.min(Math.max(t, 0), 1) * 44 + 55);
};

/**
 * Rank by meaning. Falls back to the lexical ranking when the model is not
 * available, so the caller always gets a list.
 */
export async function rankCreatorsSemantic(
  creators: Creator[],
  brand: { icps: string[]; valueProp?: string | null },
  limit = creators.length
): Promise<{ matches: Match[]; method: MatchMethod }> {
  const icps = brand.icps.filter((i) => i.trim());
  if (icps.length === 0 || creators.length === 0) {
    return { matches: rankCreators(creators, brand, limit), method: "lexical" };
  }

  // One request for both sides: the creator half is almost always a cache hit,
  // so what actually goes to the model is the handful of new ICP lines.
  const creatorTexts = creators.map(creatorText);
  const vectors = await embedCached([...icps, ...creatorTexts]);
  if (!vectors) return { matches: rankCreators(creators, brand, limit), method: "lexical" };

  const icpVectors = vectors.slice(0, icps.length);
  const creatorVectors = vectors.slice(icps.length);

  const matches = creators.map((creator, i) => {
    const sims = icpVectors.map((v) => cosine(v, creatorVectors[i]));
    const best = Math.max(...sims);

    // Named reasons are the ICPs this creator's audience actually contains,
    // strongest first — the same list the count is derived from, so the two
    // can never disagree.
    const hits = sims
      .map((sim, n) => ({ sim, icp: icps[n] }))
      .filter((x) => x.sim >= MATCH_THRESHOLD)
      .sort((a, b) => b.sim - a.sim);

    const reasons = hits.map((h) => h.icp.split("—")[0].trim());
    if (reasons.length === 0) reasons.push(creator.verticals[0] ?? "B2B audience");

    return {
      creator,
      score: toScore(best),
      reasons,
      matched: hits.length,
      total: icps.length,
    };
  });

  matches.sort((a, b) => b.score - a.score || b.creator.followers - a.creator.followers);
  return { matches: matches.slice(0, limit), method: "embeddings" };
}

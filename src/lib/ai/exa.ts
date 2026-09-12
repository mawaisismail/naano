/**
 * Exa — the web read behind brand onboarding.
 *
 * The URL is known, so this is the contents endpoint rather than search: no
 * query, just clean extraction of a page we were handed. Per Exa's guidance
 * the request stays minimal — the only fields here are ones this task actually
 * needs, and each is explained below.
 */

const ENDPOINT = "https://api.exa.ai/contents";

/**
 * Enough text for a model to characterise a company, and not so much that the
 * prompt stops fitting in the model's window. This is the explicit budget Exa
 * asks for before `text` takes options.
 */
const MAX_CHARACTERS = 6000;

/** A homepage rarely states who the product is FOR; an about or pricing page does. */
const SUBPAGES = 2;
const SUBPAGE_TARGET = ["about", "pricing"];

/** Live crawling is bounded: this runs while someone waits on a wizard step. */
const LIVECRAWL_TIMEOUT_MS = 8000;

export type ExaPage = { url: string; title: string | null; text: string };

const placeholder = (v?: string) => !v || !v.trim() || /^(dummy|changeme|your[-_])/i.test(v.trim());

export const exaConfigured = () => !placeholder(process.env.EXA_API_KEY);

/**
 * Read a site, following a couple of subpages, or null.
 *
 * Null covers every failure — not configured, unreachable, refused, or the URL
 * simply could not be crawled. The caller falls back to generated data and
 * labels it, which is the behaviour that was already there.
 */
export async function readSiteContents(url: string, timeoutMs = 15_000): Promise<ExaPage[] | null> {
  if (!exaConfigured()) return null;

  try {
    const res = await fetch(ENDPOINT, {
      method: "POST",
      headers: {
        "x-api-key": process.env.EXA_API_KEY as string,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        urls: [url],
        text: { maxCharacters: MAX_CHARACTERS },
        subpages: SUBPAGES,
        subpageTarget: SUBPAGE_TARGET,
        livecrawlTimeout: LIVECRAWL_TIMEOUT_MS,
      }),
      signal: AbortSignal.timeout(timeoutMs),
      cache: "no-store",
    });

    if (!res.ok) {
      console.error(`[exa] contents returned ${res.status}`);
      return null;
    }

    const json = (await res.json()) as {
      results?: { url?: string; title?: string; text?: string; subpages?: { url?: string; title?: string; text?: string }[] }[];
      statuses?: { id?: string; status?: string; error?: { tag?: string } }[];
    };

    // A 200 does not mean the URL succeeded — Exa reports per-URL outcomes in
    // `statuses`, and treating that as normal control flow rather than as an
    // exception path is the documented way to use this endpoint.
    const failed = json.statuses?.find((s) => s.status && s.status !== "success");
    if (failed) {
      console.error(`[exa] ${failed.id}: ${failed.status}${failed.error?.tag ? ` (${failed.error.tag})` : ""}`);
    }

    const pages: ExaPage[] = [];
    for (const r of json.results ?? []) {
      if (r.text?.trim()) pages.push({ url: r.url ?? url, title: r.title ?? null, text: r.text });
      for (const sub of r.subpages ?? []) {
        if (sub.text?.trim()) {
          pages.push({ url: sub.url ?? url, title: sub.title ?? null, text: sub.text });
        }
      }
    }

    return pages.length > 0 ? pages : null;
  } catch (err) {
    console.error(`[exa] unreachable: ${err instanceof Error ? err.name : "error"}`);
    return null;
  }
}

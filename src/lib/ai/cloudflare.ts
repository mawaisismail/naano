/**
 * Cloudflare Workers AI — the model behind the brand read and creator matching.
 *
 * One place that knows the account, the token and the two models, so the rest
 * of the app asks for "a JSON object shaped like this" or "vectors for these
 * strings" and never assembles a provider URL.
 *
 * Every call is bounded and every failure is a returned null rather than a
 * throw. These sit in a request path behind a user pressing a button: a model
 * that is slow or down must degrade to the generated fallback, not turn a
 * sign-up into a 500.
 */

const TEXT_MODEL = "@cf/meta/llama-3.3-70b-instruct-fp8-fast";
const EMBED_MODEL = "@cf/baai/bge-base-en-v1.5";

/** bge-base returns 768 dimensions and truncates past 512 input tokens. */
export const EMBED_DIMENSIONS = 768;

const placeholder = (v?: string) => !v || !v.trim() || /^(dummy|changeme|your[-_])/i.test(v.trim());

export function cloudflareConfigured(): boolean {
  return (
    !placeholder(process.env.CLOUDFLARE_ACCOUNT_ID) &&
    !placeholder(process.env.CLOUDFLARE_API_TOKEN)
  );
}

const endpoint = (model: string) =>
  `https://api.cloudflare.com/client/v4/accounts/${process.env.CLOUDFLARE_ACCOUNT_ID}/ai/run/${model}`;

async function call(model: string, body: unknown, timeoutMs: number): Promise<unknown | null> {
  if (!cloudflareConfigured()) return null;

  // AbortSignal.timeout rather than a manual race: the socket is actually
  // closed, so a hung provider does not keep the connection open behind us.
  try {
    const res = await fetch(endpoint(model), {
      method: "POST",
      headers: {
        authorization: `Bearer ${process.env.CLOUDFLARE_API_TOKEN}`,
        "content-type": "application/json",
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(timeoutMs),
      cache: "no-store",
    });
    if (!res.ok) {
      // The body can echo the token back in an error envelope, so only the
      // status is logged.
      console.error(`[workers-ai] ${model} returned ${res.status}`);
      return null;
    }
    const json = (await res.json()) as { success?: boolean; result?: unknown };
    if (json.success === false) {
      console.error(`[workers-ai] ${model} reported failure`);
      return null;
    }
    return json.result ?? null;
  } catch (err) {
    console.error(
      `[workers-ai] ${model} unreachable: ${err instanceof Error ? err.name : "error"}`
    );
    return null;
  }
}

/**
 * Ask the model for JSON matching `schema`, or null.
 *
 * The schema is enforced by the provider rather than by asking politely in the
 * prompt, so the parse either succeeds or the call failed — there is no
 * half-parsed middle state to defend against downstream.
 */
export async function generateJson<T>({
  system,
  prompt,
  schema,
  maxTokens = 900,
  timeoutMs = 20_000,
}: {
  system: string;
  prompt: string;
  schema: Record<string, unknown>;
  maxTokens?: number;
  timeoutMs?: number;
}): Promise<T | null> {
  const result = (await call(
    TEXT_MODEL,
    {
      messages: [
        { role: "system", content: system },
        { role: "user", content: prompt },
      ],
      response_format: { type: "json_schema", json_schema: schema },
      max_tokens: maxTokens,
      temperature: 0.2,
    },
    timeoutMs
  )) as { response?: unknown; choices?: { message?: { content?: string } }[] } | null;

  if (!result) return null;

  // Workers AI answers in two shapes depending on the model: a `response`
  // field, or an OpenAI-style choices array. Both appear in the wild.
  const raw =
    typeof result.response === "string"
      ? result.response
      : typeof result.response === "object" && result.response !== null
        ? JSON.stringify(result.response)
        : result.choices?.[0]?.message?.content;

  if (typeof raw !== "string") return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    console.error("[workers-ai] response was not valid JSON despite the schema");
    return null;
  }
}

/**
 * Embed a batch of strings, or null.
 *
 * One request for the whole batch: the model accepts an array, and thirty
 * separate round trips to rank thirty creators would cost more in latency than
 * the ranking is worth.
 */
export async function embed(texts: string[], timeoutMs = 20_000): Promise<number[][] | null> {
  if (texts.length === 0) return [];

  const result = (await call(EMBED_MODEL, { text: texts }, timeoutMs)) as {
    data?: number[][];
  } | null;

  const vectors = result?.data;
  if (!Array.isArray(vectors) || vectors.length !== texts.length) return null;
  return vectors;
}

/** Cosine similarity. Both vectors come from the same model, so same length. */
export function cosine(a: number[], b: number[]): number {
  let dot = 0;
  let na = 0;
  let nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  const denom = Math.sqrt(na) * Math.sqrt(nb);
  return denom === 0 ? 0 : dot / denom;
}

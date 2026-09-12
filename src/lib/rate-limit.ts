import { redis } from "@/lib/redis";

/**
 * Fixed-window rate limiting, shared across every process when Redis is
 * configured and per-process when it is not.
 *
 * Why it is shared: the in-memory version counts per instance, so N servers
 * meant N times the limit, and on serverless it meant "a fresh budget per cold
 * start" — which is not a limit at all. Redis makes the window one global
 * budget, which is what "10 login attempts a minute" is supposed to mean.
 *
 * Why the memory version is still here: if Redis is unreachable, the check
 * falls back to it rather than failing open. An attacker who can take Redis
 * down should not thereby switch the limiter off, and a Redis outage should
 * not lock every user out either. Local counting is the middle answer.
 */

export type Gate = { ok: boolean; retryAfterSec: number };

type Bucket = { count: number; resetAt: number };
const buckets = new Map<string, Bucket>();

// Unbounded growth would be its own denial of service, so sweep on write.
function sweep(now: number) {
  if (buckets.size < 5000) return;
  for (const [k, b] of buckets) if (b.resetAt <= now) buckets.delete(k);
}

/** The per-process fallback. Exported for the tests that pin its behaviour. */
export function rateLimitLocal(key: string, limit: number, windowMs: number): Gate {
  const now = Date.now();
  sweep(now);

  const found = buckets.get(key);
  if (!found || found.resetAt <= now) {
    const resetAt = now + windowMs;
    buckets.set(key, { count: 1, resetAt });
    // The first call still has to be inside the budget. Returning ok blindly
    // here made a limit of 0 — "nothing allowed" — let exactly one request
    // through per window, which is the opposite of what it asks for.
    return 1 > limit
      ? { ok: false, retryAfterSec: Math.ceil(windowMs / 1000) }
      : { ok: true, retryAfterSec: 0 };
  }

  found.count += 1;
  if (found.count > limit) {
    return { ok: false, retryAfterSec: Math.ceil((found.resetAt - now) / 1000) };
  }
  return { ok: true, retryAfterSec: 0 };
}

export async function rateLimit(key: string, limit: number, windowMs: number): Promise<Gate> {
  const client = redis();
  if (!client) return rateLimitLocal(key, limit, windowMs);

  // The window is in the key, so expiry is what resets the counter — there is
  // no read-modify-write to race. INCR returning 1 means this call opened the
  // window, and only that call sets the TTL.
  const window = Math.floor(Date.now() / windowMs);
  const k = `rl:${key}:${window}`;

  try {
    const results = await client.multi().incr(k).pexpire(k, windowMs).exec();
    const count = Number(results?.[0]?.[1] ?? 0);
    if (!count) return rateLimitLocal(key, limit, windowMs);

    if (count > limit) {
      const msLeft = windowMs - (Date.now() % windowMs);
      return { ok: false, retryAfterSec: Math.ceil(msLeft / 1000) };
    }
    return { ok: true, retryAfterSec: 0 };
  } catch {
    // Unreachable or timing out: count locally rather than waving everyone
    // through. The error itself is logged once by the client.
    return rateLimitLocal(key, limit, windowMs);
  }
}

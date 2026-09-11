/**
 * A small fixed-window rate limiter.
 *
 * Honest limitation: this is in-process memory. On a single server it works; on
 * serverless it is per-instance, so a determined attacker gets N attempts per
 * warm instance rather than N globally. Redis is the real answer. It is still
 * worth having — it stops the trivial case, which is a script hammering one
 * endpoint from one place, and it costs nothing.
 */
type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

// Unbounded growth would be its own denial of service, so sweep on write.
function sweep(now: number) {
  if (buckets.size < 5000) return;
  for (const [k, b] of buckets) if (b.resetAt <= now) buckets.delete(k);
}

export function rateLimit(
  key: string,
  limit: number,
  windowMs: number
): { ok: boolean; retryAfterSec: number } {
  const now = Date.now();
  sweep(now);

  const found = buckets.get(key);
  if (!found || found.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, retryAfterSec: 0 };
  }

  found.count += 1;
  if (found.count > limit) {
    return { ok: false, retryAfterSec: Math.ceil((found.resetAt - now) / 1000) };
  }
  return { ok: true, retryAfterSec: 0 };
}

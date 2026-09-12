import { redis } from "@/lib/redis";
import { embed } from "@/lib/ai/cloudflare";

/**
 * Embeddings with two layers of cache in front of them.
 *
 * Embedding the same thirty creator bios on every page load would put a
 * network round trip in front of a screen that renders fine without one. They
 * never change, so they are computed once per process and shared between
 * processes through Valkey — which turns a cold start from "call the model"
 * into "read a key".
 *
 * The key carries a version. Change the model and every cached vector becomes
 * unreachable rather than silently mixed with vectors from a different space,
 * where cosine distance means nothing.
 */

const VERSION = "bge-base-en-v1.5.v1";
const TTL_SECONDS = 60 * 60 * 24 * 7;

const memo = new Map<string, number[]>();

const keyFor = (text: string) => `emb:${VERSION}:${hash(text)}`;

/** FNV-1a. Not a security hash — just a short, stable cache key. */
function hash(s: string): string {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0).toString(36);
}

/**
 * Embed `texts`, returning vectors in the same order, or null if the model is
 * unavailable. Only the texts that miss both caches are sent.
 */
export async function embedCached(texts: string[]): Promise<number[][] | null> {
  const out = new Array<number[] | null>(texts.length).fill(null);
  const missing: number[] = [];

  texts.forEach((t, i) => {
    const hit = memo.get(keyFor(t));
    if (hit) out[i] = hit;
    else missing.push(i);
  });

  const client = redis();
  if (client && missing.length > 0) {
    try {
      const cached = await client.mget(missing.map((i) => keyFor(texts[i])));
      cached.forEach((raw, n) => {
        if (!raw) return;
        try {
          const vec = JSON.parse(raw) as number[];
          const i = missing[n];
          out[i] = vec;
          memo.set(keyFor(texts[i]), vec);
        } catch {
          // A corrupt entry is a miss, not a failure.
        }
      });
    } catch {
      // Cache unavailable: fall through and embed. A cache that is down must
      // slow the request, never break it.
    }
  }

  const stillMissing = texts.map((_, i) => i).filter((i) => out[i] === null);
  if (stillMissing.length > 0) {
    const fresh = await embed(stillMissing.map((i) => texts[i]));
    if (!fresh) return null;

    stillMissing.forEach((i, n) => {
      out[i] = fresh[n];
      memo.set(keyFor(texts[i]), fresh[n]);
    });

    if (client) {
      try {
        const pipeline = client.multi();
        stillMissing.forEach((i, n) => {
          pipeline.set(keyFor(texts[i]), JSON.stringify(fresh[n]), "EX", TTL_SECONDS);
        });
        await pipeline.exec();
      } catch {
        // Writing the cache is best effort.
      }
    }
  }

  return out as number[][];
}

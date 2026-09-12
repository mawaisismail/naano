import "dotenv/config";
import { redis, redisConfigured } from "../src/lib/redis";
import { rateLimit } from "../src/lib/rate-limit";

const client = redis();
if (!client) {
  console.log("REDIS_URL not set — the limiter counts per process.");
  process.exit(0);
}

const info = await client.info("server");
const line = (k: string) => info.split("\n").find((l) => l.startsWith(k))?.trim();
console.log(`configured: ${redisConfigured()}`);
console.log(`server:     ${line("valkey_version") ?? line("redis_version")}`);
console.log(`tls:        ${process.env.REDIS_URL?.startsWith("rediss://") ? "on" : "OFF"}`);

// Prove the counter is the shared one, not the in-process fallback.
const key = `ping-${Date.now()}`;
for (let i = 0; i < 3; i++) await rateLimit(key, 3, 10_000);
const blocked = await rateLimit(key, 3, 10_000);
const stored = await client.keys(`rl:${key}:*`);
console.log(`counter:    ${stored.length ? `in Valkey (${stored[0]})` : "NOT in Valkey — fell back to memory"}`);
console.log(`4th call:   ${blocked.ok ? "allowed (WRONG)" : `blocked, retry in ${blocked.retryAfterSec}s`}`);

for (const k of stored) await client.del(k);
await client.quit();

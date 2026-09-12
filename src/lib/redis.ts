import Redis from "ioredis";

/**
 * The shared Redis/Valkey connection, or null when none is configured.
 *
 * One client per process, created lazily. Two things it deliberately does not
 * do: it does not connect at import time, because a module that opens a socket
 * when it is required makes every build and every test depend on a reachable
 * server; and it does not throw on connection failure, because a rate limiter
 * losing its backing store must degrade, not take the site down with it.
 *
 * `rediss://` gives TLS, which Aiven requires.
 */

declare global {
  // Next reloads modules on every edit in development; without a global the
  // process leaks a connection per reload until the server refuses more.
  var __naanoRedis: Redis | null | undefined;
}

let warned = false;

export function redis(): Redis | null {
  if (globalThis.__naanoRedis !== undefined) return globalThis.__naanoRedis;

  const url = process.env.REDIS_URL?.trim();
  if (!url || /^(dummy|changeme)/i.test(url)) {
    globalThis.__naanoRedis = null;
    return null;
  }

  let client: Redis;
  try {
    client = new Redis(url, {
      // A rate-limit check sits in the request path, so every wait is
      // bounded: one retry, a short connect timeout, and a command timeout
      // that turns a hung socket into a fallback instead of a stalled request.
      maxRetriesPerRequest: 1,
      connectTimeout: 3000,
      // 3s, not 1.5s: the timeout starts when a command is queued, so the
      // very first check after boot also has to cover the TLS handshake —
      // measured at ~1.3s to the managed instance. A tighter bound made every
      // cold start fall back to memory.
      commandTimeout: 3000,
      retryStrategy: (times) => Math.min(times * 200, 2000),
      // The offline queue stays ON. Turning it off makes commands issued
      // during the initial handshake fail instantly, so the first check after
      // every cold start silently counted in memory instead — weakest at
      // exactly the moment a burst arrives. maxRetriesPerRequest and
      // commandTimeout bound the wait; the queue only covers connect.
      enableOfflineQueue: true,
    });
  } catch (err) {
    // A malformed URL throws from the constructor. Everything that uses this
    // treats null as "no cache", which is survivable; throwing here would
    // take down whichever page happened to ask first.
    console.error(`[redis] could not be created: ${err instanceof Error ? err.message : "error"}`);
    globalThis.__naanoRedis = null;
    return null;
  }

  // Unhandled 'error' on an ioredis client is a process-level crash. Log once:
  // a flapping connection must not fill the log with the same line.
  client.on("error", (err) => {
    if (warned) return;
    warned = true;
    console.error(`[redis] ${err.message} — falling back to in-process limits`);
  });
  client.on("ready", () => {
    warned = false;
  });

  globalThis.__naanoRedis = client;
  return client;
}

export const redisConfigured = () => redis() !== null;

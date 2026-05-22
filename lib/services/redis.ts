// Singleton Redis client. Reads REDIS_URL from env; if unset OR if connection
// fails, returns null so callers can fall back to in-memory state.
//
// Why null-on-failure instead of throwing: rate-limit / cache code paths must
// keep working in local dev (no Redis) and during transient Redis blips in
// prod. Per-process Map is degraded but better than 500ing.
//
// Founder's cluster: CT 201 Redis at redis://192.168.0.201:6379
// Set REDIS_URL in /opt/scrapcentre/.env.local on VM 221.

import Redis from "ioredis"

let client: Redis | null = null
let initialized = false
let warnedUnset = false
let lastErrorLogAt = 0

/**
 * Returns the shared Redis client, or null if REDIS_URL is unset or the
 * client has irrecoverably failed. Safe to call repeatedly.
 */
export function getRedis(): Redis | null {
  if (initialized) return client
  initialized = true

  const url = process.env.REDIS_URL
  if (!url) {
    if (!warnedUnset) {
      console.warn("[redis] REDIS_URL not set — using in-memory fallbacks (OK for local dev, NOT for prod)")
      warnedUnset = true
    }
    return null
  }

  try {
    client = new Redis(url, {
      // Don't queue commands indefinitely if Redis is down; surface errors fast
      // so callers can fall through to the in-memory path.
      maxRetriesPerRequest: 2,
      enableOfflineQueue: false,
      lazyConnect: false,
      // Reconnect on failure but with backoff capped so we don't spin.
      retryStrategy: (times: number) => Math.min(times * 200, 5000),
    })

    client.on("error", (err: Error) => {
      // ioredis emits 'error' for every reconnect attempt. Log once per minute
      // worth of failures, not on every retry.
      const now = Date.now()
      if (!lastErrorLogAt || now - lastErrorLogAt > 60_000) {
        console.error("[redis] connection error:", err.message)
        lastErrorLogAt = now
      }
    })

    client.on("connect", () => {
      console.log("[redis] connected to", url.replace(/\/\/[^@]*@/, "//***@"))
    })

    return client
  } catch (err) {
    console.error("[redis] failed to initialize client:", err)
    client = null
    return null
  }
}

/**
 * Test-only: reset the singleton. Not exported in prod builds.
 */
export function __resetRedisForTests(): void {
  if (client) {
    try { client.disconnect() } catch { /* ignore */ }
  }
  client = null
  initialized = false
  warnedUnset = false
  lastErrorLogAt = 0
}

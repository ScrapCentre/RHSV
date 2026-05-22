// Redis-backed sliding-window rate limiter using INCR + EXPIRE.
// Falls back to a per-process in-memory Map when Redis is unavailable so
// local dev (and tests) keep working — but logs a warning so prod misconfig
// is loud, not silent.
//
// Why INCR+EXPIRE instead of sorted-sets: cheap, atomic enough for our scale
// (OTP-issuance, login attempts), and survives across Node workers / restarts.
// The window is a fixed bucket per (key, windowSec) — slight burst at the
// boundary is acceptable for our use cases.

import { getRedis } from "@/lib/services/redis"

export interface RateLimitResult {
  ok: boolean
  /** Seconds until the caller can try again. Only meaningful when ok=false. */
  retryAfter?: number
}

// In-memory fallback. Per-process, lost on restart — same caveats as the old
// otp-store, but we only land here when Redis isn't configured / is down.
interface InMemoryEntry {
  count: number
  expiresAt: number
}
const inMemoryStore = new Map<string, InMemoryEntry>()
let warnedFallback = false

/**
 * Increment the counter at `key` and return whether the caller is within
 * `limit` requests per `windowSec` seconds.
 *
 * Key namespacing convention: callers should prefix with the feature, e.g.
 * `otp:issue:9876543210` so different rate-limited surfaces don't collide.
 */
export async function checkRateLimit(
  key: string,
  limit: number,
  windowSec: number,
): Promise<RateLimitResult> {
  const redis = getRedis()

  if (redis) {
    try {
      // Pipeline: INCR then EXPIRE (only when the counter was just created,
      // i.e. value === 1). NX on EXPIRE avoids resetting the window on every
      // hit, which would let an attacker keep the window alive indefinitely.
      const pipeline = redis.pipeline()
      pipeline.incr(key)
      pipeline.expire(key, windowSec, "NX")
      const results = await pipeline.exec()

      if (!results) throw new Error("redis pipeline returned null")

      const [incrErr, countRaw] = results[0]
      if (incrErr) throw incrErr
      const count = typeof countRaw === "number" ? countRaw : Number(countRaw)

      if (count > limit) {
        // Fetch TTL so we can give the client a sensible Retry-After.
        const ttl = await redis.ttl(key)
        return { ok: false, retryAfter: ttl > 0 ? ttl : windowSec }
      }
      return { ok: true }
    } catch (err) {
      console.error("[rate-limit] Redis error, falling through to in-memory:", (err as Error).message)
      // fall through to in-memory below
    }
  } else if (!warnedFallback) {
    console.warn("[rate-limit] using in-memory fallback (per-process, lost on restart) — set REDIS_URL for prod")
    warnedFallback = true
  }

  return checkInMemory(key, limit, windowSec)
}

function checkInMemory(key: string, limit: number, windowSec: number): RateLimitResult {
  const now = Date.now()
  const windowMs = windowSec * 1000
  const entry = inMemoryStore.get(key)

  if (!entry || entry.expiresAt <= now) {
    inMemoryStore.set(key, { count: 1, expiresAt: now + windowMs })
    return { ok: true }
  }

  entry.count += 1
  if (entry.count > limit) {
    return { ok: false, retryAfter: Math.max(1, Math.ceil((entry.expiresAt - now) / 1000)) }
  }
  return { ok: true }
}

/**
 * Test-only: clear the in-memory fallback state. Does not touch Redis.
 */
export function __resetRateLimitForTests(): void {
  inMemoryStore.clear()
  warnedFallback = false
}

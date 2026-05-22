// engineering-design.md §11 — In-memory OTP Map store
// Sufficient for dummy (process-persistent on next start).
// Replace with Redis CT 201 for production.
//
// Rate-limit was moved to lib/services/rate-limit.ts (Redis-backed with
// in-memory fallback) per Claude review P3-2 / v2-fix-rate-limit-2026-05-22.
// The OTP value store remains in-memory — it's a separate replacement
// already-noted at the top of this file.

import { checkRateLimit, type RateLimitResult } from "@/lib/services/rate-limit"

interface OtpEntry {
  otp: string
  expiresAt: number
}

const store = new Map<string, OtpEntry>()

const OTP_TTL_MS = 10 * 60 * 1000  // 10 minutes

export function storeOtp(phone: string, otp: string): void {
  store.set(phone, { otp, expiresAt: Date.now() + OTP_TTL_MS })
}

/**
 * Verifies a provided OTP against the stored entry.
 * Single-use: deletes the entry on successful match.
 * Returns false if expired or not found or wrong OTP.
 */
export function verifyOtp(phone: string, provided: string): boolean {
  const entry = store.get(phone)
  if (!entry) return false
  if (Date.now() > entry.expiresAt) {
    store.delete(phone)
    return false
  }
  const valid = entry.otp === provided
  if (valid) store.delete(phone)  // single-use
  return valid
}

/** 3 OTP requests per phone per 10 minutes. */
const OTP_RATE_LIMIT = 3
const OTP_RATE_WINDOW_SEC = 10 * 60

/**
 * Delegates to the shared Redis-backed rate limiter. Async now (was sync) —
 * call sites must `await`. Returns the full RateLimitResult so the API route
 * can set a Retry-After header on 429.
 */
export async function checkOtpRateLimit(phone: string): Promise<RateLimitResult> {
  return checkRateLimit(`otp:issue:${phone}`, OTP_RATE_LIMIT, OTP_RATE_WINDOW_SEC)
}

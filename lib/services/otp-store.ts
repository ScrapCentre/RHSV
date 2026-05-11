// engineering-design.md §11 — In-memory OTP Map store
// Sufficient for dummy (process-persistent on next start).
// Replace with Redis CT 201 for production.

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

/** Rate-limit tracking: counts requests per phone in a rolling window */
const rateLimitStore = new Map<string, number[]>()
const RATE_WINDOW_MS = 10 * 60 * 1000  // 10 minutes
const MAX_REQUESTS = 3

export function checkOtpRateLimit(phone: string): boolean {
  const now = Date.now()
  const timestamps = (rateLimitStore.get(phone) ?? []).filter(t => now - t < RATE_WINDOW_MS)
  if (timestamps.length >= MAX_REQUESTS) return false
  timestamps.push(now)
  rateLimitStore.set(phone, timestamps)
  return true
}

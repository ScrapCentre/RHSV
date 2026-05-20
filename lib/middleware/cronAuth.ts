/**
 * cronAuth — shared guard for /api/cron/* endpoints.
 *
 * HOTFIX (Backend code-review §5): the original per-cron snippet
 * `if (!CRON_SECRET) return true` was a fail-open. In a deployment with
 * the env var unset, ANY HTTP POST to /api/cron/* would fire the cron
 * handler. The cron jobs do mutating writes (state transitions, Razorpay
 * refunds, notifications) — fail-open is a P0.
 *
 * Now: if CRON_SECRET is unset AND NODE_ENV is "production", reject
 * with 503. In dev/staging, allow with a warning so local dev still works.
 */
import { NextResponse } from "next/server"

export function checkCronSecret(req: Request): { ok: boolean; response?: NextResponse } {
  const expected = process.env.CRON_SECRET
  const provided = req.headers.get("x-cron-secret")

  if (expected) {
    if (provided === expected) return { ok: true }
    return {
      ok: false,
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    }
  }

  // No CRON_SECRET set
  if (process.env.NODE_ENV === "production") {
    console.error("[cronAuth] CRON_SECRET unset in production — refusing")
    return {
      ok: false,
      response: NextResponse.json(
        { error: "Cron not configured (CRON_SECRET unset in production)" },
        { status: 503 }
      ),
    }
  }
  // Dev / staging: warn loudly + allow
  console.warn("[cronAuth] CRON_SECRET unset — allowing (dev/staging mode)")
  return { ok: true }
}

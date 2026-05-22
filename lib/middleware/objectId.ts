/**
 * objectId — shared guard for dynamic `[id]` API routes.
 *
 * HOTFIX (E2E walker §1.4 / v2-e2e-walk-2): four dynamic [id] routes were
 * letting Mongoose throw `CastError: Cast to ObjectId failed for value "..."`
 * on bad input. Mongo's CastError bubbles up as a 500 with the offending
 * value embedded in the body — both a noisy ops signal and a minor info
 * leak. Any stale link, crawler, or fuzzer hitting these routes returned
 * 500 instead of a clean 400.
 *
 * Pattern (matches what `app/api/otp/verify/route.ts` already does
 * correctly): precheck `mongoose.Types.ObjectId.isValid(id)` and return a
 * clean 400 BEFORE touching the DB.
 *
 * Usage:
 *   const bad = validateObjectId(id)
 *   if (bad) return bad
 *   // ...safe to call Model.findById(id)
 */
import { NextResponse } from "next/server"
import mongoose from "mongoose"

/**
 * Returns a 400 NextResponse if `id` is not a syntactically valid Mongo
 * ObjectId, or `null` if the id is safe to pass to mongoose.
 *
 * NOTE: `ObjectId.isValid` is lenient — it accepts any 12-byte string and
 * any 24-char hex. To avoid false positives where a short non-hex string
 * (e.g. "fooBarBazQux") would pass, we additionally require the input to
 * be exactly 24 hex chars (the canonical wire format we always emit).
 */
export function validateObjectId(id: string | undefined | null, fieldName = "id"): NextResponse | null {
  if (!id) {
    return NextResponse.json({ error: `${fieldName} required` }, { status: 400 })
  }
  // Tighten beyond mongoose.isValid: require canonical 24-char hex form.
  if (!/^[a-fA-F0-9]{24}$/.test(id) || !mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ error: `Invalid ${fieldName}` }, { status: 400 })
  }
  return null
}

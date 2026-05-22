// engineering-design.md §4.1 — OTP issuance via MSG91 stub adapter
// Rate-limited: 3 per phone per 10 min
import { NextResponse } from "next/server"
import { issueOtp, MockOtpError } from "@/lib/services/auth/firebase.mock"
import { checkOtpRateLimit } from "@/lib/services/otp-store"

export async function POST(req: Request) {
  try {
    const { phone } = await req.json()

    if (!phone || !/^\d{10}$/.test(phone)) {
      return NextResponse.json(
        { error: "Valid 10-digit phone number required" },
        { status: 400 }
      )
    }

    // Rate limit check — 3 per phone per 10 min (Redis-backed, in-memory fallback)
    const rl = await checkOtpRateLimit(phone)
    if (!rl.ok) {
      return NextResponse.json(
        { error: "Too many OTP requests. Please wait 10 minutes before trying again." },
        {
          status: 429,
          headers: rl.retryAfter ? { "Retry-After": String(rl.retryAfter) } : undefined,
        }
      )
    }

    const result = await issueOtp(phone)

    return NextResponse.json({
      success: result.success,
      expiresIn: result.expiresIn,
      // Demo hint shown in staging per §14 step 6 — only in mock/staging
      ...(process.env.NEXT_PUBLIC_IS_STAGING === "true" && {
        _demoHint: "Demo mode — OTP is 000000"
      })
    })
  } catch (err: any) {
    // firebase.mock throws MockOtpError (not MockServiceError — that's vahan's
    // class). Cherry-pick from v1 had the wrong error type after import rewire.
    if (err instanceof MockOtpError && err.code === "OTP_SEND_FAILED") {
      return NextResponse.json(
        { error: "OTP service temporarily unavailable. Please try again." },
        { status: 503 }
      )
    }
    console.error("[otp/issue] error:", err?.message)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

// engineering-design.md §4.1 — OTP verification; issues signed 1-hour calcSession JWT
// On success: patches LeadState to tier2, returns full calc
// Uses jose (bundled with next-auth v4) for HS256 JWT
import { NextResponse } from "next/server"
import { SignJWT } from "jose"
import connectToDatabase from "@/lib/db"
import LeadState from "@/models/LeadState"
import { verifyOtp } from "@/lib/services/auth/firebase.mock"
import { transition } from "@/lib/state-machine/lead"

function getCalcSecret(): Uint8Array {
  const secret = process.env.NEXTAUTH_SECRET
  if (!secret) throw new Error("NEXTAUTH_SECRET not configured")
  return new TextEncoder().encode(secret + ":calc")
}

function computeCdRange(scrapMin: number, scrapMax: number) {
  // CD value = scrap value × 1.4 (vehicle Certificate of Deposit benefit)
  return {
    cdMin: Math.round(scrapMin * 1.4),
    cdMax: Math.round(scrapMax * 1.4),
  }
}

export async function POST(req: Request) {
  try {
    const { phone, otp, leadStateId } = await req.json()

    if (!phone || !otp || !leadStateId) {
      return NextResponse.json(
        { error: "phone, otp, and leadStateId are required" },
        { status: 400 }
      )
    }

    // Verify OTP via adapter (mock: accepts "000000"; real MSG91 adapter wired later)
    const valid = await verifyOtp(phone, otp)
    if (!valid) {
      return NextResponse.json(
        { error: "Invalid or expired OTP" },
        { status: 400 }
      )
    }

    await connectToDatabase()

    const leadState = await LeadState.findById(leadStateId)
    if (!leadState) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 })
    }

    const now = new Date()
    const { cdMin, cdMax } = computeCdRange(leadState.scrapValueMin ?? 0, leadState.scrapValueMax ?? 0)

    // Transition to tier2 via state machine
    await transition(leadStateId, "tier2", {
      phone,
      phoneVerifiedAt: now,
      cdValueMin: cdMin,
      cdValueMax: cdMax,
    } as any)

    // Issue calcSession JWT — HS256, 1 hour, separate from NextAuth
    const calcSessionToken = await new SignJWT({ phone, leadStateId })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("1h")
      .sign(getCalcSecret())

    return NextResponse.json({
      calcSessionToken,
      tier2Data: {
        cdMin,
        cdMax,
        dealerDiscount:      null,  // coming soon
        financeComingSoon:   true,
        insuranceComingSoon: true,
        totalBenefitMin:     cdMin,
        totalBenefitMax:     cdMax,
      }
    })
  } catch (err: any) {
    console.error("[otp/verify] error:", err?.message)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

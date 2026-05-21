// engineering-design.md §4.1 — OTP verification; issues signed 1-hour calcSession JWT
// On success: patches LeadState to tier2 (idempotent for tier2+), returns full calc
// Uses jose (bundled with next-auth v4) for HS256 JWT
import { NextResponse } from "next/server"
import mongoose from "mongoose"
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

// CD value can be approximated via a flat industry estimate when scrap range
// is unknown (legacy or partially-filled leads). Matches /calculator UI fallback.
const FALLBACK_CD_VALUE = 52000

export async function POST(req: Request) {
  try {
    const { phone, otp, leadStateId } = await req.json()

    if (!phone || !otp || !leadStateId) {
      return NextResponse.json(
        { error: "phone, otp, and leadStateId are required" },
        { status: 400 }
      )
    }

    // Validate leadStateId shape BEFORE hitting the DB — otherwise mongoose
    // CastError surfaces as a confusing 500 to the customer.
    if (!mongoose.Types.ObjectId.isValid(leadStateId)) {
      return NextResponse.json({ error: "Invalid leadStateId" }, { status: 400 })
    }

    // Verify OTP via adapter (mock: accepts any 6-digit code incl. "000000";
    // real Firebase verification happens via the firebase-otp NextAuth provider)
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

    // Idempotent for re-verify: if the lead has already advanced past tier1
    // (e.g. user refreshed the verify page or hit "Resend" twice and re-submitted),
    // skip the state-machine transition and just re-issue the JWT. Without this,
    // the strict tier1→tier2 guard throws and the customer sees a confusing 500.
    if (leadState.tier === "tier1") {
      await transition(leadStateId, "tier2", {
        phone,
        phoneVerifiedAt: now,
        cdValueMin: cdMin,
        cdValueMax: cdMax,
      } as any)
    }

    // Issue calcSession JWT — HS256, 1 hour, separate from NextAuth
    const calcSessionToken = await new SignJWT({ phone, leadStateId })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("1h")
      .sign(getCalcSecret())

    // tier2Data shape matches what /calculator/verify (Tier 2 UI) reads.
    // The page expects scrapValue/cdValue/roadTaxSaving/totalBenefit — without
    // these keys it silently falls back to hardcoded numbers (24500/52000/8400/84900).
    const scrapValue   = Math.round(((leadState.scrapValueMin ?? 0) + (leadState.scrapValueMax ?? 0)) / 2)
    const cdValue      = scrapValue > 0 ? Math.round(scrapValue * 1.4) : FALLBACK_CD_VALUE
    const roadTaxSaving = Math.round(cdValue * 0.16)   // ~16% of CD value, mid-band heuristic
    const totalBenefit = scrapValue + cdValue + roadTaxSaving

    return NextResponse.json({
      calcSessionToken,
      tier2Data: {
        // Names the /calculator/verify page actually reads:
        scrapValue,
        cdValue,
        roadTaxSaving,
        dealerDiscount:      null,  // coming soon
        totalBenefit,
        // Range fields kept for API consumers + tier3/upload flows:
        cdMin,
        cdMax,
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

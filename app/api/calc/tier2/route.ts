// engineering-design.md §4.1 — Post-OTP full calc; requires calcSession JWT
import { NextResponse } from "next/server"
import { jwtVerify } from "jose"
import connectToDatabase from "@/lib/db"
import LeadState from "@/models/LeadState"

function getCalcSecret(): Uint8Array {
  const secret = process.env.NEXTAUTH_SECRET
  if (!secret) throw new Error("NEXTAUTH_SECRET not configured")
  return new TextEncoder().encode(secret + ":calc")
}

async function verifyCalcSession(authHeader: string | null): Promise<{ phone: string; leadStateId: string } | null> {
  if (!authHeader?.startsWith("Bearer ")) return null
  const token = authHeader.slice(7)
  try {
    const { payload } = await jwtVerify(token, getCalcSecret())
    return { phone: payload.phone as string, leadStateId: payload.leadStateId as string }
  } catch {
    return null
  }
}

export async function PATCH(req: Request) {
  const payload = await verifyCalcSession(req.headers.get("authorization"))
  if (!payload) {
    return NextResponse.json({ error: "Unauthorized — valid calcSession required" }, { status: 401 })
  }

  try {
    const body = await req.json()
    const { leadStateId } = body

    if (leadStateId && leadStateId !== payload.leadStateId) {
      return NextResponse.json({ error: "leadStateId mismatch" }, { status: 400 })
    }

    await connectToDatabase()
    const leadState = await LeadState.findById(payload.leadStateId)
    if (!leadState) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 })
    }

    return NextResponse.json({
      cdMin:               leadState.cdValueMin,
      cdMax:               leadState.cdValueMax,
      dealerDiscount:      null,  // coming soon
      financeComingSoon:   true,
      insuranceComingSoon: true,
      totalBenefitMin:     leadState.cdValueMin,
      totalBenefitMax:     leadState.cdValueMax,
    })
  } catch (err: any) {
    console.error("[calc/tier2] error:", err?.message)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

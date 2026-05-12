// engineering-design.md §4.1 / §7 — Runs AI verification pipeline (mock); sets LeadState tier3; queues triage
import { NextResponse } from "next/server"
import { jwtVerify } from "jose"
import connectToDatabase from "@/lib/db"
import LeadState from "@/models/LeadState"
import { runVerificationPipeline } from "@/lib/services/mock/vision.adapter"
import { transition } from "@/lib/state-machine/lead"

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

export async function POST(req: Request) {
  const payload = await verifyCalcSession(req.headers.get("authorization"))
  if (!payload) {
    return NextResponse.json({ error: "Unauthorized — valid calcSession required" }, { status: 401 })
  }

  try {
    const body = await req.json()
    const { leadStateId, photoUrls, rcUrl, aadhaarConsent } = body

    if (!leadStateId || leadStateId !== payload.leadStateId) {
      return NextResponse.json({ error: "leadStateId required and must match session" }, { status: 400 })
    }

    if (!photoUrls || !Array.isArray(photoUrls) || photoUrls.length === 0) {
      return NextResponse.json({ error: "At least one photo URL is required" }, { status: 400 })
    }

    await connectToDatabase()

    const leadState = await LeadState.findById(leadStateId)
    if (!leadState) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 })
    }

    if (leadState.tier !== "tier2") {
      return NextResponse.json({ error: "Lead must be at tier2 to submit verification" }, { status: 400 })
    }

    // Run vision mock adapter (2-second delay built in)
    const verificationResult = await runVerificationPipeline({
      photoUrls,
      rcUrl: rcUrl ?? null,
      aadhaarConsent: !!aadhaarConsent,
    })

    // Transition to tier3, then immediately to triage
    await transition(leadStateId, "tier3", {
      photoUrls,
      rcUrl: rcUrl ?? null,
      aadhaarConsent: !!aadhaarConsent,
      verificationStatus:    verificationResult.status,
      verificationConfidence: verificationResult.confidence,
      verificationFlags:     verificationResult.flags,
      qualityScore:          verificationResult.qualityScore,
    } as any)

    await transition(leadStateId, "triage", {} as any)

    return NextResponse.json({
      verificationStatus:  verificationResult.status,
      confidence:          verificationResult.confidence,
      flags:               verificationResult.flags,
      qualityScore:        verificationResult.qualityScore,
      message:             "Your lead is under review by our team.",
    })
  } catch (err: any) {
    console.error("[verify/submit] error:", err?.message)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

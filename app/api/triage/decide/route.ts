// engineering-design.md §4.1 / §10 — Admin triage decision; routes lead
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import connectToDatabase from "@/lib/db"
import LeadState from "@/models/LeadState"
import TriageDecision from "@/models/TriageDecision"
import MarketplaceLead from "@/models/MarketplaceLead"
import SellVehicle from "@/models/SellVehicle"
import { transition } from "@/lib/state-machine/lead"

const LEAD_EXPIRY_DAYS = 14

function computeLeadPrice(vehicleType: "2W" | "4W" | "truck", weightKg: number): number {
  const rate = vehicleType === "2W" ? 0.75 : 1.0
  return Math.round(weightKg * rate)
}

// Blur transformation for Cloudinary URLs — engineering-design.md §8
function applyBlur(url: string): string {
  if (!url) return url
  return url.replace("/upload/", "/upload/f_auto,q_auto,e_blur:800,w_400/")
}

function maskPincode(pincode: string | null): string {
  if (!pincode || pincode.length < 3) return "***"
  return pincode.slice(0, 3) + "***"
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session || (session.user as any).role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  try {
    const { leadStateId, decision, notes } = await req.json()

    if (!leadStateId || !decision) {
      return NextResponse.json({ error: "leadStateId and decision are required" }, { status: 400 })
    }

    const validDecisions = ["auraiya", "marketplace", "rejected"]
    if (!validDecisions.includes(decision)) {
      return NextResponse.json({ error: "Invalid decision value" }, { status: 400 })
    }

    await connectToDatabase()

    const leadState = await LeadState.findById(leadStateId)
    if (!leadState) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 })
    }

    if (leadState.tier !== "triage") {
      return NextResponse.json({ error: "Lead is not in triage tier" }, { status: 400 })
    }

    // Transition in state machine
    const targetTier = decision === "rejected" ? "rejected" : "routed"
    await transition(leadStateId, targetTier, { routing: decision } as any)

    // Create immutable audit record
    const triageDecision = await TriageDecision.create({
      leadStateId,
      decidedBy:           (session.user as any).email,
      decision,
      notes:               notes ?? null,
      decidedAt:           new Date(),
      aiVerificationFlags: leadState.verificationFlags ?? [],
    })

    let downstreamLeadId: string | null = null
    let downstreamLeadType: string | null = null

    if (decision === "auraiya") {
      // Create SellVehicle doc per existing Auraiya flow
      const sv = await SellVehicle.create({
        userId:            leadState.phone ? `${leadState.phone}@otp.com` : null,
        registrationNumber: leadState.registrationNumber ?? "UNKNOWN",
        brand:             leadState.brand ?? "",
        model:             leadState.model ?? "",
        registrationYear:  leadState.year ?? "",
        fuelType:          "unknown",
        pendingLoan:       "no",
        status:            "approved",
        leadStateId:       leadStateId,
        qualityScore:      leadState.qualityScore,
        triageDecisionId:  triageDecision._id.toString(),
      })
      downstreamLeadId   = sv._id.toString()
      downstreamLeadType = "sell"
    }

    if (decision === "marketplace") {
      // Create MarketplaceLead with masking
      const expiresAt = new Date(Date.now() + LEAD_EXPIRY_DAYS * 24 * 60 * 60 * 1000)
      const weightKg  = leadState.estimatedWeightKg ?? 900
      const vType     = (leadState.vehicleType ?? "4W") as "2W" | "4W" | "truck"

      // Create a minimal downstream SellVehicle for the back-ref
      const sv = await SellVehicle.create({
        userId:            leadState.phone ? `${leadState.phone}@otp.com` : null,
        registrationNumber: leadState.registrationNumber ?? "UNKNOWN",
        brand:             leadState.brand ?? "",
        model:             leadState.model ?? "",
        registrationYear:  leadState.year ?? "",
        fuelType:          "unknown",
        pendingLoan:       "no",
        status:            "triage_pending",
        leadStateId,
        qualityScore:      leadState.qualityScore,
        triageDecisionId:  triageDecision._id.toString(),
      })

      const ml = await MarketplaceLead.create({
        leadStateId,
        downstreamLeadId:  sv._id.toString(),
        downstreamLeadType: "sell",
        vehicleType:       vType,
        brand:             leadState.brand ?? "",
        model:             leadState.model ?? "",
        year:              leadState.year ?? "",
        cityMasked:        leadState.state ? `${leadState.state}` : "India",
        pincodeMasked:     maskPincode(null),
        estimatedWeightKg: weightKg,
        qualityScore:      leadState.qualityScore ?? "bronze",
        photoUrlsBlurred:  (leadState.photoUrls ?? []).map(applyBlur),
        aadhaarVerified:   leadState.aadhaarConsent,
        isRelisted:        false,
        relist_count:      0,
        leadPriceInr:      computeLeadPrice(vType, weightKg),
        status:            "active",
        expiresAt,
        watchedBy:         [],
      })

      downstreamLeadId   = ml._id.toString()
      downstreamLeadType = "marketplace"
    }

    // Update LeadState with downstream refs
    await LeadState.findByIdAndUpdate(leadStateId, {
      triageDecisionId: triageDecision._id.toString(),
      downstreamLeadId,
      downstreamLeadType,
    })

    return NextResponse.json({
      success:  true,
      routing:  decision,
      downstreamLeadId,
      downstreamLeadType,
    })
  } catch (err: any) {
    console.error("[triage/decide] error:", err?.message)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

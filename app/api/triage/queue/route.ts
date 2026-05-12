// engineering-design.md §4.1 / §10 — Admin triage feed (pending items)
import { NextResponse } from "next/server"
import { requireRole } from "@/lib/middleware/requireRole"
import connectToDatabase from "@/lib/db"
import LeadState from "@/models/LeadState"

export async function GET() {
  const authError = await requireRole("admin")
  if (authError) return authError

  try {
    await connectToDatabase()

    const pendingLeads = await LeadState.find({ tier: "triage" })
      .sort({ createdAt: 1 })
      .limit(50)
      .lean()

    const queue = pendingLeads.map(lead => ({
      leadStateId:         lead._id.toString(),
      vehicleInfo: {
        type:   lead.vehicleType,
        brand:  lead.brand,
        model:  lead.model,
        year:   lead.year,
        weightKg: lead.estimatedWeightKg,
      },
      qualityScore:        lead.qualityScore,
      verificationStatus:  lead.verificationStatus,
      confidence:          lead.verificationConfidence,
      flags:               lead.verificationFlags,
      photoUrls:           lead.photoUrls,
      rcUrl:               lead.rcUrl,
      aadhaarConsent:      lead.aadhaarConsent,
      createdAt:           lead.createdAt,
    }))

    return NextResponse.json(queue)
  } catch (err: any) {
    console.error("[triage/queue] error:", err?.message)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

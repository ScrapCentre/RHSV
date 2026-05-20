// engineering-design.md §4.1 / §8 — List and create anti-hoarding alerts
import { NextResponse } from "next/server"
import { requireRole } from "@/lib/middleware/requireRole"
import connectToDatabase from "@/lib/db"
import AntiHoardingAlert from "@/models/AntiHoardingAlert"

export async function GET() {
  const authError = await requireRole("admin")
  if (authError) return authError

  try {
    await connectToDatabase()
    // List unresolved alerts (resolvedAt === null)
    const alerts = await AntiHoardingAlert.find({ resolvedAt: null })
      .sort({ alertedAt: -1 })
      .lean()

    return NextResponse.json(alerts)
  } catch (err: any) {
    console.error("[admin/triage/alerts GET] error:", err?.message)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  const authError = await requireRole("admin")
  if (authError) return authError

  try {
    const body = await req.json()
    const { marketplaceLeadId, partnerId, partnerName, partnerCity, alertType } = body

    if (!marketplaceLeadId || !partnerId || !partnerName || !partnerCity) {
      return NextResponse.json({ error: "marketplaceLeadId, partnerId, partnerName, partnerCity required" }, { status: 400 })
    }

    await connectToDatabase()

    const alert = await AntiHoardingAlert.create({
      marketplaceLeadId,
      partnerId,
      partnerName,
      partnerCity,
      alertType: alertType ?? "nearby_lead_ignored",
      alertedAt: new Date(),
    })

    return NextResponse.json(alert, { status: 201 })
  } catch (err: any) {
    console.error("[admin/triage/alerts POST] error:", err?.message)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

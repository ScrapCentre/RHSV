// engineering-design.md §4.1 / §8 — Partner: get single lead detail
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import connectToDatabase from "@/lib/db"
import MarketplaceLead from "@/models/MarketplaceLead"
import { getDistanceAndCost } from "@/lib/services/mock/maps.adapter"

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)
  if (!session || (session.user as any).role !== "partner") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  try {
    const { id } = await params
    await connectToDatabase()

    const lead = await MarketplaceLead.findById(id).lean()
    if (!lead) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 })
    }

    // Get mock distance (maps adapter)
    const { distanceKm } = await getDistanceAndCost("000000", lead.pincodeMasked)

    return NextResponse.json({ ...lead, distanceKm })
  } catch (err: any) {
    console.error("[marketplace/leads/id] error:", err?.message)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

// engineering-design.md §4.1 / §8 — Partner: list active marketplace leads (masked)
import { NextResponse } from "next/server"
import { requireRole } from "@/lib/middleware/requireRole"
import connectToDatabase from "@/lib/db"
import MarketplaceLead from "@/models/MarketplaceLead"

export async function GET(req: Request) {
  const authError = await requireRole("partner")
  if (authError) return authError

  try {
    await connectToDatabase()

    const { searchParams } = new URL(req.url)
    const page        = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10))
    const limit       = Math.min(50, parseInt(searchParams.get("limit") ?? "20", 10))
    const vehicleType = searchParams.get("vehicleType")
    const skip        = (page - 1) * limit

    const query: Record<string, any> = {
      status:    "active",
      expiresAt: { $gt: new Date() },
    }
    if (vehicleType && ["2W","4W","truck"].includes(vehicleType)) {
      query.vehicleType = vehicleType
    }

    const leads = await MarketplaceLead.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean()

    const total = await MarketplaceLead.countDocuments(query)

    return NextResponse.json({
      leads,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) }
    })
  } catch (err: any) {
    console.error("[marketplace/leads] error:", err?.message)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

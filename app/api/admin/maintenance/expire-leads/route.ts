// engineering-design.md §4.1 / §8 — Sweep expired marketplace leads; safe to call repeatedly
import { NextResponse } from "next/server"
import { requireRole } from "@/lib/middleware/requireRole"
import connectToDatabase from "@/lib/db"
import MarketplaceLead from "@/models/MarketplaceLead"

export async function GET() {
  const authError = await requireRole("admin")
  if (authError) return authError

  try {
    await connectToDatabase()

    const result = await MarketplaceLead.updateMany(
      { status: "active", expiresAt: { $lte: new Date() } },
      { $set: { status: "expired" } }
    )

    return NextResponse.json({
      success:  true,
      expired:  result.modifiedCount,
      message:  `${result.modifiedCount} lead(s) marked expired.`,
    })
  } catch (err: any) {
    console.error("[admin/maintenance/expire-leads] error:", err?.message)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

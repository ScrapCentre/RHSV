// engineering-design.md §4.1 / §8 — Partner: watch/unwatch a lead
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import connectToDatabase from "@/lib/db"
import MarketplaceLead from "@/models/MarketplaceLead"

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)
  if (!session || (session.user as any).role !== "partner") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const partnerId = (session.user as any).id as string

  try {
    const { id } = await params
    await connectToDatabase()

    const lead = await MarketplaceLead.findById(id)
    if (!lead) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 })
    }

    // Toggle: add if not watching, remove if already watching
    const isWatching = lead.watchedBy.includes(partnerId)
    if (isWatching) {
      await MarketplaceLead.findByIdAndUpdate(id, { $pull: { watchedBy: partnerId } })
    } else {
      await MarketplaceLead.findByIdAndUpdate(id, { $addToSet: { watchedBy: partnerId } })
    }

    return NextResponse.json({ success: true, watching: !isWatching })
  } catch (err: any) {
    console.error("[marketplace/watch] error:", err?.message)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

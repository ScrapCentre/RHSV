// engineering-design.md §4.1 / §8 — Partner: purchase lead (atomic findOneAndUpdate)
// Atomic lock: only one partner can buy; returns 409 if already sold
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import connectToDatabase from "@/lib/db"
import MarketplaceLead from "@/models/MarketplaceLead"
import ChatThread from "@/models/ChatThread"
import LeadState from "@/models/LeadState"

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

    // Atomic lock — engineering-design.md §8
    const locked = await MarketplaceLead.findOneAndUpdate(
      { _id: id, status: "active" },
      { $set: { status: "sold", soldToPartnerId: partnerId, soldAt: new Date() } },
      { new: true }
    )

    if (!locked) {
      return NextResponse.json(
        { error: "Lead already sold or not available" },
        { status: 409 }
      )
    }

    // Fetch LeadState to get customer contact info
    const leadState = await LeadState.findById(locked.leadStateId)

    // Create ChatThread with unlocked customer contact
    const thread = await ChatThread.create({
      marketplaceLeadId: locked._id.toString(),
      leadStateId:       locked.leadStateId,
      partnerId,
      customerPhone:     leadState?.phone ?? null,
      customerName:      null,  // TODO[backend-dev]: populate from contact if available
      status:            "active",
    })

    return NextResponse.json({
      success:         true,
      threadId:        thread._id.toString(),
      unlockedContact: {
        phone: leadState?.phone ?? null,
        name:  null,
      }
    })
  } catch (err: any) {
    console.error("[marketplace/buy] error:", err?.message)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

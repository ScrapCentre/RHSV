// engineering-design.md §4.1 / §8 — Admin: return lead to marketplace (relist)
// Also handles partner-initiated return (partner reports non-maturity)
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import connectToDatabase from "@/lib/db"
import MarketplaceLead from "@/models/MarketplaceLead"

const LEAD_EXPIRY_DAYS = 14
const MAX_RELISTS = 2

export async function PATCH(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const role = (session.user as any).role as string
  if (role !== "admin" && role !== "partner") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  try {
    const { id } = await params
    await connectToDatabase()

    const lead = await MarketplaceLead.findById(id)
    if (!lead) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 })
    }

    if (lead.status !== "sold" && lead.status !== "expired") {
      return NextResponse.json(
        { error: "Only sold or expired leads can be returned" },
        { status: 400 }
      )
    }

    const newRelistCount = (lead.relist_count ?? 0) + 1

    if (newRelistCount > MAX_RELISTS) {
      // Exhaust relists — move to in_revival
      await MarketplaceLead.findByIdAndUpdate(id, {
        status: "in_revival",
        isRelisted: true,
        relist_count: newRelistCount,
      })
      return NextResponse.json({ success: true, status: "in_revival", message: "Maximum relists reached — lead moved to revival." })
    }

    const newExpiresAt = new Date(Date.now() + LEAD_EXPIRY_DAYS * 24 * 60 * 60 * 1000)

    await MarketplaceLead.findByIdAndUpdate(id, {
      status:          "active",
      isRelisted:      true,
      relist_count:    newRelistCount,
      soldToPartnerId: null,
      soldAt:          null,
      expiresAt:       newExpiresAt,
    })

    return NextResponse.json({
      success:      true,
      status:       "active",
      relist_count: newRelistCount,
      expiresAt:    newExpiresAt,
    })
  } catch (err: any) {
    console.error("[marketplace/return] error:", err?.message)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

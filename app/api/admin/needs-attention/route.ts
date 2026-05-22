// M16 — GET /api/admin/needs-attention
// Returns leads flagged for admin attention: rejectionCount >= threshold
// OR stale-lead beyond the window.
import { NextResponse } from "next/server"
import { withAuth } from "@/lib/middleware/requireRole"
import connectToDatabase from "@/lib/db"
import Lead from "@/models/Lead"

export const GET = withAuth(["admin", "executive"], async (_req, _ctx) => {
  await connectToDatabase()
  const leads = await Lead
    .find({ adminAttentionFlag: true })
    .sort({ rejectionCount: -1, marketplaceVisibleAt: 1 })
    .limit(100)
    .lean()
  return NextResponse.json({
    leads: leads.map((l: any) => ({
      _id: l._id.toString(),
      vehicleReg: l.vehicle?.registrationNumber,
      makeModelYear: `${l.vehicle?.year ?? ""} ${l.vehicle?.make ?? ""} ${l.vehicle?.model ?? ""}`.trim(),
      rejectionCount: l.rejectionCount,
      customerPhone: l.customerPhone,
      customerName: l.customerName,
      state: l.state,
      pickupCity: l.pickupAddress?.city,
      pickupState: l.pickupAddress?.state,
      marketplaceVisibleAt: l.marketplaceVisibleAt,
    })),
  })
})

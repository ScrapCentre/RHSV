// v2 admin DSC-pending queue — DigiELV concierge "needs operator signature" worklist.
// Returns DocumentRecord rows where:
//   kind == "cod"
//   dscSigned == false
//   dscPendingSince > 24h ago
// Joins minimal Lead + RVSF context. Empty list is the happy-path.
//
// Uses the (kind, dscSigned, dscPendingSince) compound index from DocumentRecord.ts.
import { NextResponse } from "next/server"
import { withAuth } from "@/lib/middleware/requireRole"
import connectToDatabase from "@/lib/db"
import DocumentRecord from "@/models/DocumentRecord"
import Lead from "@/models/Lead"
import RVSF from "@/models/RVSF"

export const dynamic = "force-dynamic"

export const GET = withAuth(["admin"], async (_req, _ctx) => {
  await connectToDatabase()
  const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000)

  const docs = await DocumentRecord
    .find({ kind: "cod", dscSigned: false, dscPendingSince: { $lt: cutoff } })
    .sort({ dscPendingSince: 1 })
    .limit(200)
    .lean()

  // Hydrate each row with the lead's reg number + RVSF display name.
  const rows = []
  for (const d of docs as any[]) {
    const lead = d.leadId ? await Lead.findById(d.leadId).lean() as any : null
    const rvsf = d.rvsfId ? await RVSF.findById(d.rvsfId).lean() as any : null
    const hoursPending = d.dscPendingSince
      ? Math.floor((Date.now() - new Date(d.dscPendingSince).getTime()) / (60 * 60 * 1000))
      : 0
    rows.push({
      _id: d._id.toString(),
      cdNumber: d.cdNumber ?? "—",
      leadId: d.leadId?.toString() ?? null,
      vehicleReg: lead?.vehicle?.registrationNumber ?? "—",
      rvsfName: rvsf?.displayName ?? "—",
      uploadedAt: d.createdAt,
      dscPendingSince: d.dscPendingSince,
      hoursPending,
      cloudinaryUrl: d.cloudinaryUrl,
    })
  }

  return NextResponse.json({ rows })
})

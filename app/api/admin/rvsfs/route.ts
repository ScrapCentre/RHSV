// v2 admin RVSF listing — minimum viable.
// GET /api/admin/rvsfs?status=active        → { rvsfs: [...] }
// No paging yet (cap 200 per query); admin UI does client-side filter on status.
import { NextResponse } from "next/server"
import { withAuth } from "@/lib/middleware/requireRole"
import connectToDatabase from "@/lib/db"
import RVSF from "@/models/RVSF"

export const dynamic = "force-dynamic"

const VALID_STATUSES = ["applied", "kyc_pending", "kyc_review", "active", "suspended", "rejected"]

export const GET = withAuth(["admin"], async (req, _ctx) => {
  await connectToDatabase()
  const url = new URL(req.url)
  const statusFilter = url.searchParams.get("status")
  const q: any = {}
  if (statusFilter && VALID_STATUSES.includes(statusFilter)) {
    q.status = statusFilter
  }

  const docs = await RVSF.find(q).sort({ createdAt: -1 }).limit(200).lean()

  return NextResponse.json({
    rvsfs: docs.map((d: any) => ({
      _id: d._id.toString(),
      legalName: d.legalName,
      displayName: d.displayName,
      slug: d.slug,
      gstNumber: d.gstNumber,
      status: d.status,
      city: d.address?.city,
      state: d.address?.state,
      createdAt: d.createdAt,
    })),
  })
})

// M09 — admin RVSF detail endpoint.
// GET /api/admin/rvsfs/[id] → full RVSF document for the admin review screen.
import { NextResponse } from "next/server"
import mongoose from "mongoose"
import { withAuth } from "@/lib/middleware/requireRole"
import connectToDatabase from "@/lib/db"
import RVSF from "@/models/RVSF"

export const dynamic = "force-dynamic"

export const GET = withAuth(["admin"], async (req, _ctx) => {
  await connectToDatabase()

  // Path-param parsing from request URL (Next.js withAuth doesn't pass ctx.params).
  const url = new URL(req.url)
  const parts = url.pathname.split("/").filter(Boolean)
  // Expected: ["api", "admin", "rvsfs", "<id>"]
  const id = parts[3]

  if (!id || !mongoose.isValidObjectId(id)) {
    return NextResponse.json({ error: "Invalid RVSF id" }, { status: 400 })
  }

  const doc = await RVSF.findById(id).lean()
  if (!doc) {
    return NextResponse.json({ error: "RVSF not found" }, { status: 404 })
  }

  const d = doc as any
  return NextResponse.json({
    rvsf: {
      _id: d._id.toString(),
      legalName: d.legalName,
      displayName: d.displayName,
      slug: d.slug,
      gstNumber: d.gstNumber,
      panNumber: d.panNumber,
      cpcbAuthNumber: d.cpcbAuthNumber,
      contactEmail: d.contactEmail,
      contactPhone: d.contactPhone,
      address: d.address,
      primaryYardCoordinates: d.primaryYardCoordinates,
      bankAccount: d.bankAccount,
      kycDocs: d.kycDocs,
      status: d.status,
      submittedAt: d.submittedAt,
      reviewedAt: d.reviewedAt,
      rejectionNotes: d.rejectionNotes,
      moreInfoQuestion: d.moreInfoQuestion,
      createdAt: d.createdAt,
      updatedAt: d.updatedAt,
    },
  })
})

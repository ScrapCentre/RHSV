// M14 — GET /api/digielv/checklist/[leadId]
// Returns the per-lead DigiELV concierge data (customer + RVSF steps).
// Pure data; no network. Backed by lib/services/digielv/checklist.ts.
import { NextResponse } from "next/server"
import { withAuth } from "@/lib/middleware/requireRole"
import connectToDatabase from "@/lib/db"
import Lead from "@/models/Lead"
import RVSF from "@/models/RVSF"
import DocumentRecord from "@/models/DocumentRecord"
import { buildChecklist } from "@/lib/services/digielv/checklist"

export const GET = withAuth(["client", "rvsf_admin", "rvsf_executive", "admin", "cc_operator"], async (req, { user }) => {
  await connectToDatabase()
  const url = new URL(req.url)
  const leadId = url.pathname.split("/").pop()
  if (!leadId) return NextResponse.json({ error: "leadId required" }, { status: 400 })

  const lead = await Lead.findById(leadId).lean() as any
  if (!lead) return NextResponse.json({ error: "Lead not found" }, { status: 404 })

  // Party check
  const isParty =
    user.role === "admin" ||
    (user.role === "client" && lead.customerUserId?.toString() === user.id) ||
    ((user.role === "rvsf_admin" || user.role === "rvsf_executive") && lead.unlock?.unlockedByRvsfId?.toString() === user.linkedRvsfId) ||
    (user.role === "cc_operator" && lead.assignedCcId?.toString() === user.linkedCcId)
  if (!isParty) return NextResponse.json({ error: "Not a party to this lead" }, { status: 403 })

  const rvsf = lead.unlock?.unlockedByRvsfId
    ? await RVSF.findById(lead.unlock.unlockedByRvsfId).lean() as any
    : null

  const codDoc = await DocumentRecord.findOne({ leadId: lead._id, kind: "cod" }).lean() as any
  const cvsDoc = await DocumentRecord.findOne({ leadId: lead._id, kind: "cvs" }).lean() as any

  const data = buildChecklist({
    vehicleReg: lead.vehicle?.registrationNumber ?? "",
    rvsfName: rvsf?.displayName ?? "the assigned RVSF",
    customerName: lead.customerName ?? "Customer",
    digiElvAppId: lead.digiElvAppId,
    digiElvCdNumber: lead.digiElvCdNumber,
    codUploaded: !!codDoc?.dscSigned,
    cvsUploaded: !!cvsDoc?.dscSigned,
    agreedAmountInr: lead.agreedPrice?.amountPaise ? Math.round(lead.agreedPrice.amountPaise / 100) : null,
  })

  return NextResponse.json({
    customer: data.customer,
    rvsf: data.rvsf,
    lead: {
      _id: lead._id.toString(),
      state: lead.state,
      vehicleReg: lead.vehicle?.registrationNumber,
      digiElvAppId: lead.digiElvAppId,
      digiElvCdNumber: lead.digiElvCdNumber,
    },
  })
})

// POST /api/digielv/checklist/[leadId] — customer pastes back App ID or CD number
export const POST = withAuth(["client", "admin"], async (req, { user }) => {
  await connectToDatabase()
  const url = new URL(req.url)
  const leadId = url.pathname.split("/").pop()
  const body = await req.json().catch(() => ({}))
  const { digiElvAppId, digiElvCdNumber } = body
  if (!digiElvAppId && !digiElvCdNumber) {
    return NextResponse.json({ error: "Provide digiElvAppId OR digiElvCdNumber" }, { status: 400 })
  }
  const lead = await Lead.findById(leadId)
  if (!lead) return NextResponse.json({ error: "Lead not found" }, { status: 404 })
  if (user.role !== "admin" && lead.customerUserId?.toString() !== user.id) {
    return NextResponse.json({ error: "Not your lead" }, { status: 403 })
  }
  if (digiElvAppId) lead.digiElvAppId = digiElvAppId
  if (digiElvCdNumber) lead.digiElvCdNumber = digiElvCdNumber
  await lead.save()
  return NextResponse.json({ ok: true })
})

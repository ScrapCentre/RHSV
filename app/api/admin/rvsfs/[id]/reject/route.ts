// M09 — admin RVSF reject endpoint.
//
// POST /api/admin/rvsfs/[id]/reject
// Body: { notes: string }   — required, applicant-visible.
//
// Side effects:
//   1. RVSF.status = "rejected_with_notes", rejectionNotes = notes
//   2. AuditLog written
//   3. Applicant emailed with the notes so they know what to fix
import { NextResponse } from "next/server"
import mongoose from "mongoose"
import { withAuth } from "@/lib/middleware/requireRole"
import connectToDatabase from "@/lib/db"
import RVSF from "@/models/RVSF"
import AuditLog from "@/models/AuditLog"
import { enqueueNotification } from "@/lib/services/notifications/dispatcher"

export const dynamic = "force-dynamic"

export const POST = withAuth(["admin"], async (req, ctx) => {
  await connectToDatabase()

  const url = new URL(req.url)
  const parts = url.pathname.split("/").filter(Boolean)
  const id = parts[3]
  if (!id || !mongoose.isValidObjectId(id)) {
    return NextResponse.json({ error: "Invalid RVSF id" }, { status: 400 })
  }

  let body: any
  try { body = await req.json() } catch { body = {} }
  const notes = String(body?.notes ?? "").trim()
  if (!notes) {
    return NextResponse.json({ error: "Rejection notes are required" }, { status: 400 })
  }
  if (notes.length > 2000) {
    return NextResponse.json({ error: "Notes too long (max 2000 chars)" }, { status: 400 })
  }

  const rvsf = await RVSF.findById(id)
  if (!rvsf) {
    return NextResponse.json({ error: "RVSF not found" }, { status: 404 })
  }
  if (rvsf.status === "active") {
    return NextResponse.json({ error: "Cannot reject an already-active RVSF; suspend it instead" }, { status: 409 })
  }

  const beforeStatus = rvsf.status
  const adminId = (ctx.user as any)?.id || (ctx.user as any)?._id

  rvsf.status = "rejected_with_notes"
  rvsf.rejectionNotes = notes
  rvsf.moreInfoQuestion = undefined
  rvsf.reviewedAt = new Date()
  if (adminId && mongoose.isValidObjectId(String(adminId))) {
    rvsf.reviewedByUserId = adminId
  }
  await rvsf.save()

  if (adminId && mongoose.isValidObjectId(String(adminId))) {
    try {
      await AuditLog.create({
        actorUserId: adminId,
        action: "rvsf.kyc.rejected",
        targetCollection: "RVSF",
        targetId: rvsf._id,
        before: { status: beforeStatus },
        after: { status: "rejected_with_notes" },
        reason: notes,
      })
    } catch (auditErr: any) {
      console.error(`[rvsf/reject] AuditLog write failed: ${auditErr?.message}`)
    }
  }

  try {
    // Reuse the kyc_approved kind for now (M15 dispatcher's enum); the
    // bodyMarkdown carries the rejection wording so applicants know.
    // A dedicated kind ("rvsf_kyc_rejected") can land in a follow-up
    // when M15's enum is extended.
    await enqueueNotification({
      kind: "rvsf_kyc_approved",
      recipientRvsfId: rvsf._id.toString(),
      subject: `${rvsf.displayName}: your ScrapCentre application needs changes`,
      bodyMarkdown:
        `Hello,\n\n` +
        `Your RVSF application for **${rvsf.displayName}** could not be approved as submitted. ` +
        `Our review team's notes:\n\n> ${notes}\n\n` +
        `You can re-apply at https://scrapcentre.online/rvsf/apply with the same contact email. ` +
        `If you have questions, reply to this email or contact ops@scrapcentre.online.`,
      deeplinkUrl: `/rvsf/apply/status?email=${encodeURIComponent(rvsf.contactEmail || "")}`,
    })
  } catch (notifyErr: any) {
    console.error(`[rvsf/reject] notification enqueue failed: ${notifyErr?.message}`)
  }

  return NextResponse.json({
    ok: true,
    rvsf: { _id: rvsf._id.toString(), status: rvsf.status, rejectionNotes: notes },
    message: "RVSF rejected with notes; applicant notified.",
  })
})

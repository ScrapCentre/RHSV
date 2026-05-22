// M09 — admin "request more info" endpoint.
//
// POST /api/admin/rvsfs/[id]/request-info
// Body: { question: string }
//
// Soft action — keeps the RVSF in the queue but flips status to
// "pending_more_info" so the admin's queue UI can filter to just-actionable
// rows. The applicant sees the question on /rvsf/apply/status?email=...
// and can re-submit the wizard to update their answer (the apply POST
// is idempotent on contactEmail in resumable statuses).
import { NextResponse } from "next/server"
import mongoose from "mongoose"
import { withAuth } from "@/lib/middleware/requireRole"
import { toUserObjectId, toActorLabel } from "@/lib/middleware/userIdCast"
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
  const question = String(body?.question ?? "").trim()
  if (!question) {
    return NextResponse.json({ error: "Question text is required" }, { status: 400 })
  }
  if (question.length > 1000) {
    return NextResponse.json({ error: "Question too long (max 1000 chars)" }, { status: 400 })
  }

  const rvsf = await RVSF.findById(id)
  if (!rvsf) {
    return NextResponse.json({ error: "RVSF not found" }, { status: 404 })
  }
  if (rvsf.status === "active" || rvsf.status === "suspended") {
    return NextResponse.json({ error: `Cannot request info from RVSF in status=${rvsf.status}` }, { status: 409 })
  }

  const beforeStatus = rvsf.status
  const adminId = (ctx.user as any)?.id || (ctx.user as any)?._id

  rvsf.status = "pending_more_info"
  rvsf.moreInfoQuestion = question
  await rvsf.save()

  // Audit row — env-admin (non-ObjectId id) now lands a row with
  // actorUserId=null + actorLabel=<email> instead of being silently skipped.
  try {
    await AuditLog.create({
      actorUserId: toUserObjectId(adminId),
      actorLabel:  toActorLabel(ctx.user),
      action: "rvsf.kyc.more_info_requested",
      targetCollection: "RVSF",
      targetId: rvsf._id,
      before: { status: beforeStatus },
      after: { status: "pending_more_info" },
      reason: question,
    })
  } catch (auditErr: any) {
    console.error(`[rvsf/request-info] AuditLog write failed: ${auditErr?.message}`)
  }

  try {
    await enqueueNotification({
      kind: "rvsf_kyc_approved",  // reuse enum; bodyMarkdown signals intent
      recipientRvsfId: rvsf._id.toString(),
      subject: `${rvsf.displayName}: a question about your ScrapCentre application`,
      bodyMarkdown:
        `Hello,\n\n` +
        `Our review team has a question about your RVSF application for **${rvsf.displayName}**:\n\n` +
        `> ${question}\n\n` +
        `Please re-submit your application at https://scrapcentre.online/rvsf/apply with the same contact email and the updated information.\n\n` +
        `Track status at https://scrapcentre.online/rvsf/apply/status?email=${encodeURIComponent(rvsf.contactEmail || "")}`,
      deeplinkUrl: `/rvsf/apply`,
    })
  } catch (notifyErr: any) {
    console.error(`[rvsf/request-info] notification enqueue failed: ${notifyErr?.message}`)
  }

  return NextResponse.json({
    ok: true,
    rvsf: { _id: rvsf._id.toString(), status: rvsf.status, moreInfoQuestion: question },
    message: "More info requested; applicant notified.",
  })
})

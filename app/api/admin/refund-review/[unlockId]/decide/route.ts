// M16 — POST /api/admin/refund-review/[unlockId]/decide
// Admin approves full / approves partial / denies a pending refund request.
// Triggers Razorpay refund on approval. Writes AuditLog row.
import { NextResponse } from "next/server"
import { withAuth } from "@/lib/middleware/requireRole"
import connectToDatabase from "@/lib/db"
import RejectionEvent from "@/models/RejectionEvent"
import LeadUnlock from "@/models/LeadUnlock"
import Payment from "@/models/Payment"
import AuditLog from "@/models/AuditLog"
import { refund as razorpayRefund } from "@/lib/services/payments"
import { enqueueNotification } from "@/lib/services/notifications/dispatcher"

export const POST = withAuth(["admin"], async (req, { user }) => {
  await connectToDatabase()
  const url = new URL(req.url)
  const segments = url.pathname.split("/")
  const unlockId = segments[segments.length - 2]

  const body = await req.json().catch(() => ({}))
  const { decision, refundAmountPaise, adminReviewNotes } = body
  if (!["approve_full", "approve_partial", "deny"].includes(decision)) {
    return NextResponse.json({ error: "decision must be approve_full | approve_partial | deny" }, { status: 400 })
  }
  if (!adminReviewNotes || adminReviewNotes.length < 5) {
    return NextResponse.json({ error: "adminReviewNotes required" }, { status: 400 })
  }
  if (decision === "approve_partial" && (!refundAmountPaise || refundAmountPaise < 100)) {
    return NextResponse.json({ error: "refundAmountPaise required for partial approval" }, { status: 400 })
  }

  // Atomic flip: only one of N concurrent admin clicks wins
  const ev = await RejectionEvent.findOneAndUpdate(
    { unlockId, refundDecision: { $in: ["admin_pending", "auto_full_but_refund_failed"] } },
    {
      $set: {
        refundDecision: decision === "deny" ? "admin_denied"
          : decision === "approve_full" ? "admin_approved_full"
          : "admin_approved_partial",
        adminReviewedByUserId: user.id,
        adminReviewedAt: new Date(),
        adminReviewNotes,
      },
    },
    { new: true }
  ) as any
  if (!ev) return NextResponse.json({ error: "Request already decided or not found" }, { status: 409 })

  const unlock = await LeadUnlock.findById(ev.unlockId).lean() as any
  if (!unlock) return NextResponse.json({ error: "LeadUnlock not found" }, { status: 500 })

  let actualRefundPaise = 0
  if (decision === "approve_full")    actualRefundPaise = unlock.baseAmountPaise
  if (decision === "approve_partial") actualRefundPaise = Math.min(refundAmountPaise, unlock.baseAmountPaise)

  if (actualRefundPaise > 0) {
    try {
      const refundResult = await razorpayRefund(unlock.razorpayPaymentId, actualRefundPaise)
      const payment = await Payment.create({
        purpose: decision === "approve_full" ? "reject_refund_admin_full" : "reject_refund_admin_partial",
        leadUnlockId: unlock._id,
        rvsfId: unlock.rvsfId,
        amountPaise: -actualRefundPaise,
        razorpayPaymentId: unlock.razorpayPaymentId,
        razorpayRefundId: refundResult.refundId,
        status: refundResult.status === "processed" ? "success" : "initiated",
      })
      await RejectionEvent.updateOne(
        { _id: ev._id },
        { $set: { refundAmountPaise: actualRefundPaise, refundPaymentId: payment._id, razorpayRefundId: refundResult.refundId } }
      )
    } catch (err: any) {
      console.error(`[refund-decide] Razorpay refund failed: ${err?.message}`)
      await RejectionEvent.updateOne(
        { _id: ev._id },
        { $set: { refundFailureReason: err?.message } }
      )
    }
  }

  await AuditLog.create({
    actorUserId: user.id,
    action: "refund.admin.decision",
    targetCollection: "rejectionevents",
    targetId: ev._id,
    before: { refundDecision: "admin_pending" },
    after: { refundDecision: ev.refundDecision, refundAmountPaise: actualRefundPaise, decision },
    reason: adminReviewNotes,
  })

  await enqueueNotification({
    kind: decision === "deny" ? "refund_admin_decision_denied" : "refund_admin_decision_approved",
    recipientUserId: ev.rejectedByUserId.toString(),
    subject: decision === "deny" ? "Refund request closed" : `Refund ${decision === "approve_full" ? "approved" : "partial-approved"} — ₹${(actualRefundPaise / 100).toFixed(2)}`,
    bodyMarkdown: `Admin decision: ${decision}. Notes: ${adminReviewNotes}`,
    channels: ["email", "inapp"],
  })

  return NextResponse.json({ ok: true, decision: ev.refundDecision, refundAmountPaise: actualRefundPaise })
})

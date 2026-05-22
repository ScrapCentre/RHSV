// M16 — POST /api/leads/[id]/reject
//
// RVSF admin rejects a previously-unlocked lead. Lead returns to the
// marketplace; chat thread archives; refund evaluation runs per the
// THREE-CONDITION model (locked 2026-05-20):
//
//   1. Lead.customerNumberRevealed != null  → admin_pending (never auto)
//   2. ELSE within grace window AND zero non-system messages → auto_full
//   3. ELSE → admin_pending (engaged window)
//
// Architecture per Backend §4 + §25.4: DB-state mutations happen in a
// Mongoose transaction; Razorpay refund HTTP call happens AFTER commit
// (so a refund-fail doesn't roll back state). On Razorpay failure the
// RejectionEvent.refundDecision flips to auto_full_but_refund_failed
// and admin gets a notification.
import { NextResponse } from "next/server"
import { withAuth } from "@/lib/middleware/requireRole"
import connectToDatabase from "@/lib/db"
import Lead from "@/models/Lead"
import LeadUnlock from "@/models/LeadUnlock"
import ChatThread from "@/models/ChatThread"
import ChatMessage from "@/models/ChatMessage"
import RejectionEvent from "@/models/RejectionEvent"
import AuditLog from "@/models/AuditLog"
import ConfigSetting from "@/models/ConfigSetting"
import Payment from "@/models/Payment"
import RVSF from "@/models/RVSF"
import { computeGracePhase } from "@/lib/services/refund/computeGracePhase"
import { scanForLeakage, DEFAULT_PATTERNS } from "@/lib/services/chat/leakage-scanner"
import { refund as razorpayRefund } from "@/lib/services/payments"
import { enqueueNotification } from "@/lib/services/notifications/dispatcher"
import { withLeadTxn } from "@/lib/transactions/withLeadTxn"

const REJECTABLE_STATES = ["unlocked", "assigned_to_cc", "negotiating", "cd_issued"]

export const POST = withAuth(["rvsf_admin"], async (req, { user }) => {
  await connectToDatabase()
  const url = new URL(req.url)
  const segments = url.pathname.split("/")
  const leadId = segments[segments.length - 2]

  const body = await req.json().catch(() => ({}))
  const { reason, reasonNote } = body
  if (!reason || !["out_of_catchment","vehicle_mismatch","customer_unreachable","pricing_disagreement","other"].includes(reason)) {
    return NextResponse.json({ error: "Valid reason required" }, { status: 400 })
  }
  if (!reasonNote || reasonNote.length < (reason === "other" ? 30 : 10)) {
    return NextResponse.json({ error: `reasonNote required (min ${reason === "other" ? 30 : 10} chars)` }, { status: 400 })
  }

  const lead = await Lead.findById(leadId).lean() as any
  if (!lead) return NextResponse.json({ error: "Lead not found" }, { status: 404 })
  if (!REJECTABLE_STATES.includes(lead.state)) {
    return NextResponse.json({ error: `Lead is not in a rejectable state (state=${lead.state})` }, { status: 409 })
  }
  if (lead.unlock?.unlockedByRvsfId?.toString() !== user.linkedRvsfId) {
    return NextResponse.json({ error: "Lead is not unlocked by your RVSF" }, { status: 403 })
  }

  const unlock = await LeadUnlock.findById(lead.unlock?.leadUnlockId).lean() as any
  if (!unlock) return NextResponse.json({ error: "LeadUnlock row not found" }, { status: 500 })

  // Dedupe: don't double-reject
  const existing = await RejectionEvent.findOne({ unlockId: unlock._id }).lean()
  if (existing) return NextResponse.json({ error: "This unlock has already been rejected" }, { status: 409 })

  const thread = await ChatThread.findOne({ leadId, status: "active" }).lean() as any
  const messages = thread
    ? await ChatMessage.find({ threadId: thread._id, senderRole: { $ne: "system" } }).lean()
    : []
  const nonSystemMessageCount = messages.length

  // Three-condition refund model
  const graceMinSetting = await ConfigSetting.findOne({ key: "refund.gracePeriodMinutes" }).lean() as any
  const gracePeriodMinutes = graceMinSetting?.value ?? 60
  const phase = computeGracePhase({
    customerNumberRevealed: lead.customerNumberRevealed ?? null,
    unlockedAt: new Date(lead.unlock.unlockedAt),
    nonSystemMessageCount,
    gracePeriodMinutes,
    now: new Date(),
  })

  // Chat-content auto-scan (per §25.6; computed at reject time, persisted)
  const flagged = scanForLeakage(
    messages.map((m: any) => ({ id: m._id.toString(), text: m.text ?? m.attachment?.originalName ?? "" })),
    DEFAULT_PATTERNS
  )

  // Determine refund decision per the three conditions.
  // 2026-05-22 hotfix (P0-2): condition 3 (engaged window) must enter the admin-review
  // queue — VISION.md §4 line 115. Previously this wrote `auto_denied_engaged_phase`
  // which was (a) not in /api/admin/refund-review's $in filter and (b) contradicted by
  // both this file's docstring (line 9) and lib/services/refund/computeGracePhase.ts
  // line 7. Money was silently leaking. The enum value has been removed in
  // models/RejectionEvent.ts so this branch can never be reintroduced by accident.
  // `refundEntryReason` records WHY the row entered the queue for audit purposes.
  let refundDecision: string
  if (phase.reason === "number_revealed") refundDecision = "auto_denied_number_revealed"
  else if (phase.eligible)                refundDecision = "auto_full"
  else                                    refundDecision = "admin_pending"
  const refundEntryReason = phase.reason  // "grace_phase" | "engaged_phase" | "number_revealed"

  // ── DB state changes wrapped in a Mongoose transaction (Backend P0-1) ──
  // All-or-nothing: a mid-write failure must NOT leave Lead.state="marketplace_visible"
  // while LeadUnlock.status is still "paid", or vice-versa. The Razorpay refund HTTP
  // call deliberately stays OUTSIDE this block — see comment in withLeadTxn.ts.
  const newCount = (lead.rejectionCount ?? 0) + 1
  const pingPongSetting = await ConfigSetting.findOne({ key: "pingPong.rejectionThreshold" }).lean() as any
  const pingPongThreshold = pingPongSetting?.value ?? 3
  const flagPingPong = newCount >= pingPongThreshold && !lead.adminAttentionFlag

  const rvsf = await RVSF.findById(unlock.rvsfId).lean() as any

  const { rejectionEvent } = await withLeadTxn(async (session) => {
    await Lead.updateOne(
      { _id: leadId, state: { $in: REJECTABLE_STATES } },
      {
        $set: {
          state: "marketplace_visible",
          marketplaceVisibleAt: new Date(),
          assignedCcId: null,
          unlock: null,
          ...(flagPingPong ? { adminAttentionFlag: true } : {}),
        },
        $inc: { rejectionCount: 1 },
      },
      { session }
    )
    await LeadUnlock.updateOne(
      { _id: unlock._id },
      { $set: { status: "paid_rejected" } },
      { session }
    )
    if (thread) {
      await ChatThread.updateOne(
        { _id: thread._id },
        { $set: { status: "archived", closedAt: new Date(), closedReason: "rvsf_rejected" } },
        { session }
      )
    }

    // Mongoose `Model.create` requires array form when passing { session }.
    const [createdRejectionEvent] = await RejectionEvent.create(
      [{
        leadId,
        unlockId: unlock._id,
        rejectedByRvsfId: user.linkedRvsfId,
        rejectedByUserId: user.id,
        reason,
        reasonNote,
        chatMessageCountAtReject: nonSystemMessageCount,
        minutesElapsedSinceUnlock: Math.floor((Date.now() - new Date(lead.unlock.unlockedAt).getTime()) / 60_000),
        gracePhaseEligible: phase.eligible,
        customerNumberRevealed: !!lead.customerNumberRevealed,
        rejectionCountAtReject: newCount,
        archivedThreadId: thread?._id,
        relistedLeadStateBefore: lead.state,
        notifiedRvsfIds: [],
        chatFlaggedPatterns: flagged,
        refundDecision,
        refundEntryReason,
      }],
      { session }
    )

    await AuditLog.create(
      [{
        actorUserId: user.id,
        action: "lead.rejected.by_rvsf",
        targetCollection: "leads",
        targetId: lead._id,
        before: { state: lead.state, rejectionCount: lead.rejectionCount ?? 0 },
        after: { state: "marketplace_visible", rejectionCount: newCount, refundDecision },
        reason,
      }],
      { session }
    )

    return { rejectionEvent: createdRejectionEvent }
  })

  // ── Razorpay refund (OUTSIDE the "transaction") ──
  if (refundDecision === "auto_full") {
    try {
      const refundResult = await razorpayRefund(unlock.razorpayPaymentId, unlock.baseAmountPaise)
      const refundPayment = await Payment.create({
        purpose: "reject_refund_auto",
        leadUnlockId: unlock._id,
        rvsfId: user.linkedRvsfId,
        amountPaise: -unlock.baseAmountPaise,
        razorpayPaymentId: unlock.razorpayPaymentId,
        razorpayRefundId: refundResult.refundId,
        status: refundResult.status === "processed" ? "success" : "initiated",
      })
      await RejectionEvent.updateOne(
        { _id: rejectionEvent._id },
        {
          $set: {
            refundAmountPaise: unlock.baseAmountPaise,
            refundPaymentId: refundPayment._id,
            razorpayRefundId: refundResult.refundId,
          },
        }
      )
      await enqueueNotification({
        kind: "refund_auto_approved",
        recipientUserId: user.id,
        subject: `Refund processed — ₹${(unlock.baseAmountPaise / 100).toFixed(2)}`,
        bodyMarkdown: `Your unlock fee of ₹${(unlock.baseAmountPaise / 100).toFixed(2)} for **${lead.vehicle?.registrationNumber}** has been refunded under our 60-min grace window.`,
        channels: ["email", "inapp", "whatsapp"],
        whatsappTemplateName: "refund_auto_approved_rvsf",
      })
    } catch (err: any) {
      console.error(`[lead/reject] Razorpay refund failed: ${err?.message}`)
      await RejectionEvent.updateOne(
        { _id: rejectionEvent._id },
        {
          $set: {
            refundDecision: "auto_full_but_refund_failed",
            refundFailureReason: err?.message ?? "Unknown refund error",
          },
        }
      )
      await enqueueNotification({
        kind: "auto_refund_failed_admin_alert",
        subject: `Auto-refund failed for unlock ${unlock._id}`,
        bodyMarkdown: `RVSF ${rvsf?.displayName ?? "—"} reject + grace-eligible, but Razorpay refund call failed: ${err?.message}. Manual reconciliation required.`,
        channels: ["inapp"],
      })
    }
  }

  // 2026-05-22 P0-2 hotfix: engaged-phase rejection → admin queue. Per VISION.md §4
  // ("the single most important defence of the per-lead revenue model") admin must
  // be alerted, not have to poll the queue. Only the engaged-phase entry fires this;
  // number-revealed entries already get their own audit-trail notification at the
  // reveal-number action time.
  if (refundDecision === "admin_pending" && refundEntryReason === "engaged_phase") {
    const flaggedCount = flagged.length
    await enqueueNotification({
      kind: "engaged_phase_refund_review_admin_alert",
      subject: `Refund review needed — ${lead.vehicle?.registrationNumber ?? "lead"} (engaged-phase reject)`,
      bodyMarkdown: `RVSF **${rvsf?.displayName ?? "—"}** rejected lead ${leadId} after engaging the customer (${nonSystemMessageCount} message${nonSystemMessageCount === 1 ? "" : "s"} exchanged${flaggedCount ? `, ${flaggedCount} flagged pattern${flaggedCount === 1 ? "" : "s"}` : ""}). Reason: ${reason} — ${reasonNote}. Decide refund in /admin/refund-review.`,
      channels: ["inapp", "email"],
      leadId,
    })
  }

  // Customer notification: "lead returned to marketplace" (tone per §25.19)
  if (lead.customerUserId) {
    await enqueueNotification({
      kind: "lead_returned_to_marketplace_customer",
      recipientUserId: lead.customerUserId.toString(),
      subject: "Update on your scrap job — finding you another RVSF",
      bodyMarkdown: `**${rvsf?.displayName ?? "The RVSF"}** has returned your job for the ${lead.vehicle?.year ?? ""} ${lead.vehicle?.make ?? ""} ${lead.vehicle?.model ?? ""} to our marketplace. No action needed — we'll notify you the moment someone else picks it up (usually within 24 hours).`,
      channels: ["email", "inapp", "whatsapp"],
      whatsappTemplateName: "lead_returned_to_marketplace_customer",
      leadId: lead._id.toString(),
    })
  }

  if (flagPingPong) {
    await enqueueNotification({
      kind: "ping_pong_flag_admin",
      subject: `Lead flagged — ${lead.vehicle?.registrationNumber ?? ""} rejected ${newCount} times`,
      bodyMarkdown: `Lead ${leadId} has now been rejected ${newCount} times. Latest reason: ${reason} — ${reasonNote}. Open the needs-attention queue to intervene.`,
      channels: ["inapp"],
      leadId,
    })
  }

  return NextResponse.json({
    ok: true,
    refundDecision,
    rejectionCount: newCount,
    adminAttentionFlag: flagPingPong || lead.adminAttentionFlag,
  })
})

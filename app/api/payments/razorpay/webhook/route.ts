// M13 — Razorpay webhook handler (POST, public, signature-verified).
//
// On `payment.captured`:
//   1. Verify HMAC-SHA256 signature against RAZORPAY_WEBHOOK_SECRET
//   2. Find the matching LeadUnlock by razorpay_order_id; flip status → "paid"
//   3. Write a Payment row {purpose:"lead_unlock", status:"success"}
//   4. Atomically transition Lead.state → "unlocked"; Lead.unlock subdoc populated
//   5. Create the ChatThread + auto-system message ("RVSF X has unlocked your lead…")
//   6. Fire notifications (customer + RVSF + in-catchment dispatcher)
//
// Webhook URL: https://scrapcentre.com/api/payments/razorpay/webhook
// Razorpay dashboard webhook config: events=payment.captured + refund.processed,
// secret=RAZORPAY_WEBHOOK_SECRET.
//
// Per locked decisions L26 (FCFS atomic unlock), L31 (per-unlock Razorpay).
import { NextResponse } from "next/server"
import crypto from "crypto"
import connectToDatabase from "@/lib/db"
import LeadUnlock from "@/models/LeadUnlock"
import Lead from "@/models/Lead"
import Payment from "@/models/Payment"
import ChatThread from "@/models/ChatThread"
import ChatMessage from "@/models/ChatMessage"
import RVSF from "@/models/RVSF"
import { enqueueNotification } from "@/lib/services/notifications/dispatcher"

export async function POST(req: Request) {
  const raw = await req.text()
  const signature = req.headers.get("x-razorpay-signature") ?? ""
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET

  // In mock mode (no secret set), skip signature verification but log loudly
  let signatureValid = false
  if (secret) {
    const expected = crypto.createHmac("sha256", secret).update(raw).digest("hex")
    signatureValid = crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature))
    if (!signatureValid) {
      console.error("[razorpay/webhook] signature mismatch")
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 })
    }
  } else {
    console.warn("[razorpay/webhook] RAZORPAY_WEBHOOK_SECRET unset — accepting unverified payload (mock mode)")
  }

  let payload: any
  try { payload = JSON.parse(raw) } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  const event = payload.event
  const webhookEventId = payload?.id ?? `evt_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`

  await connectToDatabase()

  // Idempotency: dedupe by webhookEventId via Payment row
  const dup = await Payment.findOne({ webhookEventId }).lean()
  if (dup) return NextResponse.json({ ok: true, deduped: true })

  if (event === "payment.captured") {
    const pmt = payload.payload?.payment?.entity ?? {}
    const orderId   = pmt.order_id
    const paymentId = pmt.id
    const amountPaise = pmt.amount

    if (!orderId) return NextResponse.json({ error: "missing order_id" }, { status: 400 })

    // Find the LeadUnlock we created at order-create time
    const unlock = await LeadUnlock.findOne({ razorpayOrderId: orderId }) as any
    if (!unlock) {
      console.error(`[razorpay/webhook] no LeadUnlock for order ${orderId}`)
      return NextResponse.json({ error: "Unknown order" }, { status: 404 })
    }
    if (unlock.status === "paid") {
      // already processed
      return NextResponse.json({ ok: true, alreadyPaid: true })
    }

    // Atomic single-unlock guarantee: the partial-unique index on
    // leadunlocks.{leadId,status:"paid"} ensures only one of N parallel
    // webhook events can flip to "paid" for the same leadId.
    let flipped = false
    try {
      await LeadUnlock.updateOne(
        { _id: unlock._id, status: { $ne: "paid" } },
        { $set: {
          status: "paid",
          razorpayPaymentId: paymentId,
          razorpaySignature: signature,
        } }
      )
      flipped = true
    } catch (err: any) {
      // duplicate key → another webhook delivery beat us; that's fine
      console.warn(`[razorpay/webhook] unlock flip skipped (race): ${err?.message}`)
    }
    if (!flipped) return NextResponse.json({ ok: true, race: true })

    // Write Payment row (audit trail)
    await Payment.create({
      purpose: "lead_unlock",
      leadUnlockId: unlock._id,
      rvsfId: unlock.rvsfId,
      amountPaise,
      razorpayOrderId: orderId,
      razorpayPaymentId: paymentId,
      status: "success",
      webhookEventId,
    })

    // Flip Lead state + populate unlock subdoc
    const lead = await Lead.findOneAndUpdate(
      { _id: unlock.leadId, state: { $in: ["approved_marketplace", "marketplace_visible", "stale_alerted", "revived", "rvsf_rejected"] } },
      {
        $set: {
          state: "unlocked",
          unlock: {
            unlockedByRvsfId:    unlock.rvsfId,
            unlockedByUserId:    unlock.triggeredByUserId,
            unlockedAt:          new Date(),
            weightKgCharged:     unlock.weightKgAtUnlock,
            pricePerKgCharged:   unlock.pricePerKgAtUnlock,
            amountChargedPaise:  unlock.baseAmountPaise,
            leadUnlockId:        unlock._id,
          },
        },
      },
      { new: true }
    ) as any

    if (!lead) {
      console.warn(`[razorpay/webhook] lead ${unlock.leadId} not in unlockable state; payment captured but state not flipped`)
      return NextResponse.json({ ok: true, warning: "lead state not flipped" })
    }

    // Create the ChatThread + auto-system message (per L43)
    const rvsf = await RVSF.findById(unlock.rvsfId).lean() as any
    const thread = await ChatThread.create({
      leadId: lead._id,
      customerUserId: lead.customerUserId,
      rvsfId: unlock.rvsfId,
      participantUserIds: lead.customerUserId ? [lead.customerUserId, unlock.triggeredByUserId] : [unlock.triggeredByUserId],
      lastMessageAt: new Date(),
      status: "active",
    })
    await ChatMessage.create({
      threadId: thread._id,
      senderUserId: null,
      senderRole: "system",
      type: "system_event",
      text: `RVSF ${rvsf?.displayName ?? "—"} has unlocked your lead and will reach out shortly.`,
    })

    // Fire notifications (per L27 Option D)
    if (lead.customerUserId) {
      await enqueueNotification({
        kind: "lead_unlocked_customer",
        recipientUserId: lead.customerUserId.toString(),
        subject: "An RVSF has reviewed your scrap request",
        bodyMarkdown: `**${rvsf?.displayName ?? "An RVSF"}** has unlocked your lead for the ${lead.vehicle?.year ?? ""} ${lead.vehicle?.make ?? ""} ${lead.vehicle?.model ?? ""}. They'll message you shortly in the platform chat.`,
        channels: ["email", "inapp", "whatsapp"],
        whatsappTemplateName: "lead_unlocked_customer_notice",
        leadId: lead._id.toString(),
      })
    }
    await enqueueNotification({
      kind: "lead_unlocked_rvsf",
      recipientUserId: unlock.triggeredByUserId.toString(),
      subject: `Lead unlocked — ${lead.vehicle?.registrationNumber}`,
      bodyMarkdown: `You unlocked the lead for **${lead.vehicle?.registrationNumber}** (₹${(unlock.baseAmountPaise / 100).toFixed(2)}). Open the chat to start the conversation.`,
      channels: ["email", "inapp"],
      leadId: lead._id.toString(),
    })

    return NextResponse.json({
      ok: true,
      leadUnlockId: unlock._id.toString(),
      chatThreadId: thread._id.toString(),
    })
  }

  if (event === "refund.processed") {
    // Wired up in M16 along with the reject-refund flow
    return NextResponse.json({ ok: true, queuedForM16: true })
  }

  return NextResponse.json({ ok: true, ignored: event })
}

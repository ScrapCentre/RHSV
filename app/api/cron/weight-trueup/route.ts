// M17 — POST /api/cron/weight-trueup (every 6h)
// Finds leads where actualScrappedWeightKg was just filled by CC operator
// and the ±15% delta hasn't been settled yet. Fires Razorpay debit or
// refund per lib/services/pricing/trueup.ts.
//
// HOTFIX 2026-05-22 (P1 money-moving, ref v2-codereview-2026-05-22.md §P1-3/P1-4):
//   1. The Lead.updateOne({state:"weight_settled"}) is now INSIDE the try, so
//      a Razorpay failure leaves the lead in its prior state (cd_issued /
//      cvs_issued) and the next cron tick can retry. Previously the flip ran
//      unconditionally → lead stranded in weight_settled with no Payment row,
//      no refund issued, no audit trail.
//   2. Each failed attempt increments unlock.trueUp.attempts. After
//      MAX_ATTEMPTS (5) the lead is flipped to Lead.adminAttentionFlag = true
//      so the founder / admin can reconcile manually instead of the cron
//      re-firing forever (which would also produce a fresh refundId each time
//      against the real Razorpay adapter — duplicate refunds = real money out).
//   3. The Razorpay return-shape assumption (`r.status === "processed"`) is
//      now type-safe: lib/services/payments/razorpay.ts declares
//      `RazorpayRefundResult = { refundId, status }` so the M13 real adapter
//      cannot ship without surfacing status.
import { NextResponse } from "next/server"
import { checkCronSecret } from "@/lib/middleware/cronAuth"
import connectToDatabase from "@/lib/db"
import Lead from "@/models/Lead"
import LeadUnlock from "@/models/LeadUnlock"
import Payment from "@/models/Payment"
import ConfigSetting from "@/models/ConfigSetting"
import { computeTrueUp } from "@/lib/services/pricing/trueup"
import { refund as razorpayRefund, createOrder } from "@/lib/services/payments"

const MAX_TRUEUP_ATTEMPTS = 5

export async function POST(req: Request) {
  const auth = checkCronSecret(req); if (!auth.ok) return auth.response!
  await connectToDatabase()
  const setting = await ConfigSetting.findOne({ key: "weight.trueUpTolerancePct" }).lean() as any
  const tolerancePct = setting?.value ?? 15

  // Criterion: post-scrap leads with an actual weight recorded by the CC
  // operator but the true-up settlement hasn't happened yet. We accept any
  // state past "negotiating" so the closure happy path (assign_to_cc →
  // negotiating → cd_issued → cvs_issued → weight_settled → closed) doesn't
  // depend on the exact transition wording for the cron to pick up the lead.
  const candidates = await Lead.find({
    state: { $in: ["cd_issued", "cvs_issued", "weight_settled"] },
    "vehicle.actualScrappedWeightKg": { $exists: true, $ne: null },
  }).limit(50).lean()

  let processed = 0
  let failed = 0
  let escalated = 0
  for (const lead of candidates as any[]) {
    const unlock = await LeadUnlock.findOne({ leadId: lead._id, status: "paid" }) as any
    if (!unlock || unlock.trueUp?.settledAt) continue

    // Escalation gate: if we've already burned MAX_TRUEUP_ATTEMPTS without
    // settlement, stop the cron from re-firing and flag for human review.
    // Idempotent: once adminAttentionFlag is set we skip on subsequent ticks.
    const priorAttempts = unlock.trueUp?.attempts ?? 0
    if (priorAttempts >= MAX_TRUEUP_ATTEMPTS) {
      if (!lead.adminAttentionFlag) {
        await Lead.updateOne(
          { _id: lead._id },
          { $set: { adminAttentionFlag: true } }
        )
        escalated++
        console.error(`[cron/weight-trueup] unlock ${unlock._id} exhausted ${MAX_TRUEUP_ATTEMPTS} attempts; flagged for admin review (lastError: ${unlock.trueUp?.lastError ?? "n/a"})`)
      }
      continue
    }

    const decision = computeTrueUp({
      chargedWeightKg: unlock.weightKgAtUnlock,
      actualWeightKg: lead.vehicle.actualScrappedWeightKg,
      pricePerKg: unlock.pricePerKgAtUnlock,
      tolerancePct,
    })

    if (decision.action === "no_change") {
      // No money moves; settle the trueUp ledger and flip state. Wrap in
      // try so a transient Mongo blip doesn't poison the loop.
      try {
        unlock.trueUp = {
          actualWeightKg: lead.vehicle.actualScrappedWeightKg,
          deltaPercent: decision.deltaPercent,
          deltaAmountPaise: 0,
          settledAt: new Date(),
          attempts: priorAttempts,
        }
        await unlock.save()
        await Lead.updateOne({ _id: lead._id }, { $set: { state: "weight_settled" } })
        processed++
      } catch (err: any) {
        console.error(`[cron/weight-trueup] no_change settle failed for unlock ${unlock._id}: ${err?.message}`)
        failed++
      }
    } else if (decision.action === "credit_rvsf") {
      try {
        const r = await razorpayRefund(unlock.razorpayPaymentId, decision.refundAmountPaise)
        await Payment.create({
          purpose: "trueup_refund",
          leadUnlockId: unlock._id,
          rvsfId: unlock.rvsfId,
          amountPaise: -decision.refundAmountPaise,
          razorpayPaymentId: unlock.razorpayPaymentId,
          razorpayRefundId: r.refundId,
          status: r.status === "processed" ? "success" : "initiated",
        })
        unlock.status = "refunded_partial"
        unlock.trueUp = {
          actualWeightKg: lead.vehicle.actualScrappedWeightKg,
          deltaPercent: decision.deltaPercent,
          deltaAmountPaise: decision.refundAmountPaise,
          refundId: r.refundId,
          settledAt: new Date(),
          attempts: priorAttempts + 1,
          lastAttemptAt: new Date(),
        }
        await unlock.save()
        // Only flip state AFTER refund, Payment row, AND unlock.save all succeed.
        await Lead.updateOne({ _id: lead._id }, { $set: { state: "weight_settled" } })
        processed++
      } catch (err: any) {
        const msg = err?.message ?? String(err)
        console.error(`[cron/weight-trueup] refund failed for unlock ${unlock._id} (attempt ${priorAttempts + 1}/${MAX_TRUEUP_ATTEMPTS}): ${msg}`)
        // Persist the failure WITHOUT settledAt so the cron picks the lead
        // up again next tick. Lead.state is intentionally untouched.
        try {
          await LeadUnlock.updateOne(
            { _id: unlock._id },
            {
              $inc: { "trueUp.attempts": 1 },
              $set: {
                "trueUp.lastAttemptAt": new Date(),
                "trueUp.lastError": msg.slice(0, 500),
              },
            }
          )
        } catch (innerErr: any) {
          console.error(`[cron/weight-trueup] failed to persist attempt-counter for unlock ${unlock._id}: ${innerErr?.message}`)
        }
        failed++
      }
    } else if (decision.action === "debit_rvsf") {
      try {
        const order = await createOrder({
          amountPaise: decision.topupAmountPaise,
          leadId: lead._id.toString(),
          rvsfId: unlock.rvsfId.toString(),
          notes: { trueUpFor: unlock._id.toString() },
        })
        await Payment.create({
          purpose: "trueup_topup",
          leadUnlockId: unlock._id,
          rvsfId: unlock.rvsfId,
          amountPaise: decision.topupAmountPaise,
          razorpayOrderId: order.orderId,
          status: "initiated",
        })
        unlock.status = "topped_up"  // status flips to "paid" on webhook capture
        unlock.trueUp = {
          actualWeightKg: lead.vehicle.actualScrappedWeightKg,
          deltaPercent: decision.deltaPercent,
          deltaAmountPaise: decision.topupAmountPaise,
          topUpOrderId: order.orderId,
          settledAt: new Date(),
          attempts: priorAttempts + 1,
          lastAttemptAt: new Date(),
        }
        await unlock.save()
        // Only flip state AFTER order create + Payment row + unlock save succeed.
        await Lead.updateOne({ _id: lead._id }, { $set: { state: "weight_settled" } })
        processed++
      } catch (err: any) {
        const msg = err?.message ?? String(err)
        console.error(`[cron/weight-trueup] topup order failed for unlock ${unlock._id} (attempt ${priorAttempts + 1}/${MAX_TRUEUP_ATTEMPTS}): ${msg}`)
        try {
          await LeadUnlock.updateOne(
            { _id: unlock._id },
            {
              $inc: { "trueUp.attempts": 1 },
              $set: {
                "trueUp.lastAttemptAt": new Date(),
                "trueUp.lastError": msg.slice(0, 500),
              },
            }
          )
        } catch (innerErr: any) {
          console.error(`[cron/weight-trueup] failed to persist attempt-counter for unlock ${unlock._id}: ${innerErr?.message}`)
        }
        failed++
      }
    }
  }
  return NextResponse.json({ ok: true, processed, failed, escalated })
}

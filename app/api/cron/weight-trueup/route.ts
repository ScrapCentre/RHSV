// M17 — POST /api/cron/weight-trueup (every 6h)
// Finds leads where actualScrappedWeightKg was just filled by CC operator
// and the ±15% delta hasn't been settled yet. Fires Razorpay debit or
// refund per lib/services/pricing/trueup.ts.
import { NextResponse } from "next/server"
import { checkCronSecret } from "@/lib/middleware/cronAuth"
import connectToDatabase from "@/lib/db"
import Lead from "@/models/Lead"
import LeadUnlock from "@/models/LeadUnlock"
import Payment from "@/models/Payment"
import ConfigSetting from "@/models/ConfigSetting"
import { computeTrueUp } from "@/lib/services/pricing/trueup"
import { refund as razorpayRefund, createOrder } from "@/lib/services/payments"

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
  for (const lead of candidates as any[]) {
    const unlock = await LeadUnlock.findOne({ leadId: lead._id, status: "paid" }) as any
    if (!unlock || unlock.trueUp?.settledAt) continue

    const decision = computeTrueUp({
      chargedWeightKg: unlock.weightKgAtUnlock,
      actualWeightKg: lead.vehicle.actualScrappedWeightKg,
      pricePerKg: unlock.pricePerKgAtUnlock,
      tolerancePct,
    })

    if (decision.action === "no_change") {
      unlock.trueUp = { actualWeightKg: lead.vehicle.actualScrappedWeightKg, deltaPercent: decision.deltaPercent, deltaAmountPaise: 0, settledAt: new Date() }
      await unlock.save()
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
        unlock.trueUp = { actualWeightKg: lead.vehicle.actualScrappedWeightKg, deltaPercent: decision.deltaPercent, deltaAmountPaise: decision.refundAmountPaise, refundId: r.refundId, settledAt: new Date() }
        await unlock.save()
      } catch (err: any) {
        console.error(`[cron/weight-trueup] refund failed for unlock ${unlock._id}: ${err?.message}`)
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
        unlock.trueUp = { actualWeightKg: lead.vehicle.actualScrappedWeightKg, deltaPercent: decision.deltaPercent, deltaAmountPaise: decision.topupAmountPaise, topUpOrderId: order.orderId, settledAt: new Date() }
        await unlock.save()
      } catch (err: any) {
        console.error(`[cron/weight-trueup] topup order failed for unlock ${unlock._id}: ${err?.message}`)
      }
    }
    await Lead.updateOne({ _id: lead._id }, { $set: { state: "weight_settled" } })
    processed++
  }
  return NextResponse.json({ ok: true, processed })
}

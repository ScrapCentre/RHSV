// M17 — POST /api/cron/payment-reconcile (daily 03:00 IST)
// Reconciles Payment rows stuck in "initiated" for > 1h (Razorpay webhook
// may have dropped). In real impl: query Razorpay GET /orders for actual
// state and flip Payment.status accordingly. For now: just count + log.
import { NextResponse } from "next/server"
import { checkCronSecret } from "@/lib/middleware/cronAuth"
import connectToDatabase from "@/lib/db"
import Payment from "@/models/Payment"

export async function POST(req: Request) {
  const auth = checkCronSecret(req); if (!auth.ok) return auth.response!
  await connectToDatabase()
  const cutoff = new Date(Date.now() - 60 * 60 * 1000)
  const stuck = await Payment.countDocuments({
    status: "initiated",
    createdAt: { $lt: cutoff },
  })
  if (stuck > 0) {
    console.log(`[cron/payment-reconcile] ${stuck} Payment rows stuck in "initiated" >1h — Razorpay API check would happen here`)
  }
  return NextResponse.json({ ok: true, stuck })
}

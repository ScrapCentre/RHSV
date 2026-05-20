// M17 — POST /api/cron/payment-reconcile (daily 03:00 IST)
// Reconciles Payment rows stuck in "initiated" for > 1h (Razorpay webhook
// may have dropped). In real impl: query Razorpay GET /orders for actual
// state and flip Payment.status accordingly. For now: just count + log.
import { NextResponse } from "next/server"
import connectToDatabase from "@/lib/db"
import Payment from "@/models/Payment"

function cronAuth(req: Request): boolean {
  const e = process.env.CRON_SECRET
  if (!e) return true
  return req.headers.get("x-cron-secret") === e
}

export async function POST(req: Request) {
  if (!cronAuth(req)) return NextResponse.json({ error: "unauthorized" }, { status: 401 })
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

// M17 — POST /api/cron/offer-expiry
// Every 15 min: find open offers past their expiresAt; flip to "expired";
// post system_event in the chat.
import { NextResponse } from "next/server"
import connectToDatabase from "@/lib/db"
import ChatMessage from "@/models/ChatMessage"

function cronAuth(req: Request): boolean {
  const provided = req.headers.get("x-cron-secret")
  const expected = process.env.CRON_SECRET
  if (!expected) return true  // dev / staging
  return provided === expected
}

export async function POST(req: Request) {
  if (!cronAuth(req)) return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  await connectToDatabase()
  const now = new Date()
  const expired = await ChatMessage.find({
    type: "offer",
    "offer.status": "open",
    "offer.expiresAt": { $lt: now },
  }).limit(200)
  let flipped = 0
  for (const m of expired) {
    (m as any).offer.status = "expired"
    await m.save()
    await ChatMessage.create({
      threadId: (m as any).threadId,
      senderUserId: null,
      senderRole: "system",
      type: "system_event",
      text: `Offer of ₹${((m as any).offer.amountPaise / 100).toLocaleString("en-IN")} expired (no response within 48 hours). Either party can post a fresh offer.`,
    })
    flipped++
  }
  return NextResponse.json({ ok: true, expired: flipped })
}

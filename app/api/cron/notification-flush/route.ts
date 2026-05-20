// M17 — POST /api/cron/notification-flush (every 10 min)
// Retries Notification rows whose channels are still "pending".
// In M15 staging (dispatcher logs only), this is mostly a no-op; once
// real adapters are wired (Postmark + AiSensy), this is the failure
// retry loop.
import { NextResponse } from "next/server"
import connectToDatabase from "@/lib/db"
import Notification from "@/models/Notification"

function cronAuth(req: Request): boolean {
  const e = process.env.CRON_SECRET
  if (!e) return true
  return req.headers.get("x-cron-secret") === e
}

export async function POST(req: Request) {
  if (!cronAuth(req)) return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  await connectToDatabase()
  // Just count for now; actual fan-out lives in the dispatcher (M15+M18)
  const pending = await Notification.countDocuments({
    $or: [
      { "channelStatus.email": "pending" },
      { "channelStatus.inapp": "pending" },
      { "channelStatus.whatsapp": "pending" },
    ],
  })
  return NextResponse.json({ ok: true, pending })
}

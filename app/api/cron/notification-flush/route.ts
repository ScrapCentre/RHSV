// M17 — POST /api/cron/notification-flush (every 10 min)
// Retries Notification rows whose channels are still "pending".
// In M15 staging (dispatcher logs only), this is mostly a no-op; once
// real adapters are wired (Postmark + AiSensy), this is the failure
// retry loop.
import { NextResponse } from "next/server"
import { checkCronSecret } from "@/lib/middleware/cronAuth"
import connectToDatabase from "@/lib/db"
import Notification from "@/models/Notification"

export async function POST(req: Request) {
  const auth = checkCronSecret(req); if (!auth.ok) return auth.response!
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

// M17 — POST /api/cron/revive-queue (hourly)
// Finds Lead{state: marketplace_visible | stale_alerted, expiresAt < now};
// transitions to "expired"; fires WhatsApp customer-revive template.
import { NextResponse } from "next/server"
import { checkCronSecret } from "@/lib/middleware/cronAuth"
import connectToDatabase from "@/lib/db"
import Lead from "@/models/Lead"
import { enqueueNotification } from "@/lib/services/notifications/dispatcher"

export async function POST(req: Request) {
  const auth = checkCronSecret(req); if (!auth.ok) return auth.response!
  await connectToDatabase()
  const expired = await Lead.find({
    state: { $in: ["marketplace_visible", "stale_alerted"] },
    closedAt: null,
    marketplaceVisibleAt: { $lt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000) },
  }).limit(100)
  let revived = 0
  for (const lead of expired) {
    (lead as any).state = "expired"
    await lead.save()
    if ((lead as any).customerUserId) {
      await enqueueNotification({
        kind: "stale_lead_alert",
        recipientUserId: (lead as any).customerUserId.toString(),
        subject: "Are you still interested in scrapping your vehicle?",
        bodyMarkdown: "Your scrap request has been open for 2 weeks. Reply YES to keep it active; otherwise we'll close it out.",
        channels: ["email", "inapp", "whatsapp"],
        whatsappTemplateName: "revive_request",
        leadId: (lead as any)._id.toString(),
      })
    }
    revived++
  }
  return NextResponse.json({ ok: true, revived })
}

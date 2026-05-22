// v2 dispatched-notifications viewer feed — the founder-demo page for the
// notification system wired in M15.
//
// Routing note: the legacy /api/admin/notifications route (which powers the
// admin bell `NotificationBox` component) returns a feed of NEW form
// submissions (Valuation/SellVehicle/Contact/etc) — a different concept
// entirely. We deliberately nested THIS endpoint under /queue so the two
// feeds coexist:
//   - GET /api/admin/notifications        → legacy "new lead" feed
//   - GET /api/admin/notifications/queue  → v2 dispatched-notification queue
import { NextResponse } from "next/server"
import { withAuth } from "@/lib/middleware/requireRole"
import connectToDatabase from "@/lib/db"
import Notification from "@/models/Notification"

export const dynamic = "force-dynamic"

export const GET = withAuth(["admin"], async (_req, _ctx) => {
  await connectToDatabase()
  const rows = await Notification.find({})
    .sort({ createdAt: -1 })
    .limit(100)
    .lean()

  return NextResponse.json({
    entries: (rows as any[]).map((r) => ({
      _id: r._id.toString(),
      kind: r.kind,
      subject: r.subject,
      bodyPreview: typeof r.bodyMarkdown === "string"
        ? (r.bodyMarkdown.length > 200 ? `${r.bodyMarkdown.slice(0, 200)}…` : r.bodyMarkdown)
        : "",
      channels: r.channels ?? [],
      channelStatus: {
        email:    r.channelStatus?.email    ?? "pending",
        inapp:    r.channelStatus?.inapp    ?? "pending",
        whatsapp: r.channelStatus?.whatsapp ?? "pending",
      },
      whatsappTemplateName: r.whatsappTemplateName ?? null,
      channelDeliveryLog: (r.channelDeliveryLog ?? []).map((entry: any) => ({
        channel: entry.channel,
        at: entry.at,
        to: entry.to ?? "—",
        adapter: entry.adapter ?? "mock",
        preview: entry.preview ?? "",
        providerMessageId: entry.providerMessageId ?? null,
        error: entry.error ?? null,
      })),
      recipientUserId: r.recipientUserId?.toString() ?? null,
      recipientRvsfId: r.recipientRvsfId?.toString() ?? null,
      recipientCcId:   r.recipientCcId?.toString()   ?? null,
      leadId:          r.leadId?.toString()          ?? null,
      correlationId:   r.correlationId ?? null,
      dispatchedAt:    r.dispatchedAt ?? null,
      createdAt:       r.createdAt,
    })),
  })
})

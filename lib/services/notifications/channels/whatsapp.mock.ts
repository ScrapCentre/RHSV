// Mock WhatsApp channel adapter for the v2 notification dispatcher.
//
// What it does:
//   - Logs the would-be WhatsApp send to console (visible in `journalctl -u rhsv`).
//   - Returns a structured delivery-log entry that the dispatcher appends to
//     Notification.channelDeliveryLog[] so the founder can demonstrate
//     "see, the mock WhatsApp landed at 14:32, here's the body" from
//     /admin/notifications.
//
// Why a separate file from lib/services/whatsapp/aisensy.mock.ts:
//   - aisensy.mock returns a generic { messageId } and uses the global
//     mock-config service-mode toggle. That adapter is the M18 production
//     plumbing.
//   - This adapter is the notification-dispatcher-facing shim that gives us
//     the admin-viewer evidence trail (M15 founder-demo concern). When the
//     M18 plumbing lights up, this file becomes a thin wrapper around it.
import type { ChannelDeliveryLogEntry } from "@/models/Notification"

export interface SendWhatsappArgs {
  to: string                    // E.164 phone, or "—" if unknown at dispatch time
  template?: string             // AiSensy template name (optional for free-form)
  params?: string[]             // template variable substitutions
  bodyPreview?: string          // human-readable preview for the admin viewer
}

export async function sendWhatsapp(args: SendWhatsappArgs): Promise<ChannelDeliveryLogEntry> {
  const preview = args.bodyPreview ?? `template=${args.template ?? "(none)"} params=${JSON.stringify(args.params ?? [])}`
  // eslint-disable-next-line no-console
  console.log(`[notify-mock][whatsapp] to=${args.to} template=${args.template ?? "—"} params=${JSON.stringify(args.params ?? [])}`)
  return {
    channel: "whatsapp",
    at: new Date(),
    to: args.to,
    adapter: "mock",
    preview,
    providerMessageId: `mock_wa_${Math.random().toString(36).slice(2, 14)}`,
  }
}

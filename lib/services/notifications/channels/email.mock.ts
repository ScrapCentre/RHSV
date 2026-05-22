// Mock email channel adapter for the v2 notification dispatcher.
// See whatsapp.mock.ts for the design rationale (admin-viewer evidence trail
// that survives the M15 → M18 transition).
import type { ChannelDeliveryLogEntry } from "@/models/Notification"

export interface SendEmailArgs {
  to: string                    // recipient email, or "—" if unknown
  subject: string
  body: string                  // markdown or plaintext; the real adapter will HTML-render it
}

export async function sendEmail(args: SendEmailArgs): Promise<ChannelDeliveryLogEntry> {
  const preview = args.body.length > 160 ? `${args.body.slice(0, 160)}…` : args.body
  // eslint-disable-next-line no-console
  console.log(`[notify-mock][email] to=${args.to} subject="${args.subject}"`)
  return {
    channel: "email",
    at: new Date(),
    to: args.to,
    adapter: "mock",
    preview,
    providerMessageId: `mock_em_${Math.random().toString(36).slice(2, 14)}`,
  }
}

// Real email channel adapter (Postmark) — stub.
// See whatsapp.ts for the design rationale.
import type { ChannelDeliveryLogEntry } from "@/models/Notification"
import type { SendEmailArgs } from "./email.mock"

export async function sendEmail(_args: SendEmailArgs): Promise<ChannelDeliveryLogEntry> {
  throw new Error(
    "Email real adapter not yet implemented — set POSTMARK_API_TOKEN env var to enable, " +
    "or leave it unset to use the mock adapter (lib/services/notifications/channels/email.mock.ts)."
  )
}

export type { SendEmailArgs } from "./email.mock"

// Real SMS channel adapter (Firebase Phone Auth REST API) — stub.
// See whatsapp.ts for the design rationale.
import type { ChannelDeliveryLogEntry } from "@/models/Notification"
import type { SendSmsArgs } from "./sms.mock"

export async function sendSms(_args: SendSmsArgs): Promise<ChannelDeliveryLogEntry> {
  throw new Error(
    "SMS real adapter not yet implemented — set FIREBASE_SMS_API_KEY env var to enable, " +
    "or leave it unset to use the mock adapter (lib/services/notifications/channels/sms.mock.ts)."
  )
}

export type { SendSmsArgs } from "./sms.mock"

// Mock SMS channel adapter for the v2 notification dispatcher.
//
// SMS is NOT one of the three locked notification channels (email + in-app +
// WhatsApp per VISION §9 L27 Option D), but is exposed here so that:
//   1. If a future trigger calls sendSms({to, body}) the system fails soft, not
//      with "channel not found".
//   2. Firebase phone-auth OTP flows (lib/auth.ts firebase-otp provider) have a
//      drop-in stub if they need to fan out via the dispatcher later.
//
// The dispatcher itself does NOT iterate over "sms" today — it iterates the
// three locked channels. This file exists so the slot is filled.
import type { ChannelDeliveryLogEntry } from "@/models/Notification"

export interface SendSmsArgs {
  to: string
  body: string
}

export async function sendSms(args: SendSmsArgs): Promise<ChannelDeliveryLogEntry> {
  const preview = args.body.length > 160 ? `${args.body.slice(0, 160)}…` : args.body
  // eslint-disable-next-line no-console
  console.log(`[notify-mock][sms] to=${args.to} body="${preview}"`)
  return {
    channel: "sms",
    at: new Date(),
    to: args.to,
    adapter: "mock",
    preview,
    providerMessageId: `mock_sm_${Math.random().toString(36).slice(2, 14)}`,
  }
}

// Real WhatsApp channel adapter (AiSensy) — stub.
// When AISENSY_API_KEY is set in env, this adapter will fan out via AiSensy.
// Until then, lib/services/notifications/channels/index.ts short-circuits to
// whatsapp.mock so the dispatcher always has SOMETHING to call. Matches the
// pattern from lib/services/payments/razorpay.ts (throw an unmistakable
// "not yet implemented — set X env var to enable" error so production deploys
// don't accidentally swallow notifications and look successful).
import type { ChannelDeliveryLogEntry } from "@/models/Notification"
import type { SendWhatsappArgs } from "./whatsapp.mock"

export async function sendWhatsapp(_args: SendWhatsappArgs): Promise<ChannelDeliveryLogEntry> {
  throw new Error(
    "WhatsApp real adapter not yet implemented — set AISENSY_API_KEY env var to enable, " +
    "or leave it unset to use the mock adapter (lib/services/notifications/channels/whatsapp.mock.ts)."
  )
}

export type { SendWhatsappArgs } from "./whatsapp.mock"

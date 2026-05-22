// Channel adapter barrel. Picks real-vs-mock per env var, mirroring the
// pattern in lib/services/payments/index.ts + lib/services/whatsapp/index.ts.
//
// Today every env var is unset on VM 221, so every channel routes to its
// mock adapter (which logs + returns an evidence entry). When the production
// keys land we flip the env var and the real adapter takes over without any
// dispatcher-side change.
import * as whatsappReal from "./whatsapp"
import * as whatsappMock from "./whatsapp.mock"
import * as emailReal from "./email"
import * as emailMock from "./email.mock"
import * as smsReal from "./sms"
import * as smsMock from "./sms.mock"

const useRealWhatsapp = !!process.env.AISENSY_API_KEY
const useRealEmail = !!process.env.POSTMARK_API_TOKEN
const useRealSms = !!process.env.FIREBASE_SMS_API_KEY

export const sendWhatsapp = useRealWhatsapp ? whatsappReal.sendWhatsapp : whatsappMock.sendWhatsapp
export const sendEmail = useRealEmail ? emailReal.sendEmail : emailMock.sendEmail
export const sendSms = useRealSms ? smsReal.sendSms : smsMock.sendSms

export type { SendWhatsappArgs } from "./whatsapp.mock"
export type { SendEmailArgs } from "./email.mock"
export type { SendSmsArgs } from "./sms.mock"

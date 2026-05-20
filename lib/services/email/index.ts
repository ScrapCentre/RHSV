// Email adapter barrel
import * as real from "./postmark"
import * as mock from "./postmark.mock"

const useReal = !!process.env.POSTMARK_API_TOKEN
export const sendEmail = useReal ? real.sendEmail : mock.sendEmail
export type { SendEmailArgs } from "./postmark"

// Postmark email real adapter — stub. Live impl when POSTMARK_API_TOKEN is set.
export interface SendEmailArgs {
  to: string
  subject: string
  bodyHtml: string
  bodyText?: string
  replyTo?: string
}
export async function sendEmail(_args: SendEmailArgs): Promise<{ messageId: string }> {
  throw new Error("Postmark real adapter not yet implemented (M15).")
}

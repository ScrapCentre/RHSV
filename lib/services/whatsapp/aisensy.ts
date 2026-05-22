// AiSensy WhatsApp real adapter — stub. Live impl lands in M15/M18.
// Requires AISENSY_API_KEY and pre-approved templates.

export interface SendTemplateArgs {
  toPhone: string                  // E.164
  templateName: string
  vars?: string[]
}

export async function sendTemplate(_args: SendTemplateArgs): Promise<{ messageId: string }> {
  throw new Error("AiSensy real adapter not yet implemented (M18). Toggle mock via /admin/mock-config.")
}

export async function sendDocument(_toPhone: string, _url: string, _caption?: string): Promise<{ messageId: string }> {
  throw new Error("AiSensy real adapter not yet implemented (M18).")
}

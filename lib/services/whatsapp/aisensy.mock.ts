// AiSensy WhatsApp mock adapter
import { getMockConfig, simulateDelay } from "../mock-config"
import type { SendTemplateArgs } from "./aisensy"

export async function sendTemplate(args: SendTemplateArgs): Promise<{ messageId: string }> {
  const cfg = await getMockConfig()
  const mode = (cfg.services as any).whatsapp ?? cfg.mode
  await simulateDelay(mode)
  if (mode === "failure") {
    throw new Error(`Mock AiSensy: send-failure for template=${args.templateName} to=${args.toPhone}`)
  }
  // eslint-disable-next-line no-console
  console.log(`[mock-aisensy] template=${args.templateName} to=${args.toPhone} vars=${JSON.stringify(args.vars ?? [])}`)
  return { messageId: `mock_msg_${Math.random().toString(36).slice(2, 14)}` }
}

export async function sendDocument(toPhone: string, url: string, caption?: string): Promise<{ messageId: string }> {
  const cfg = await getMockConfig()
  await simulateDelay(cfg.mode)
  // eslint-disable-next-line no-console
  console.log(`[mock-aisensy] document to=${toPhone} url=${url} caption=${caption ?? "-"}`)
  return { messageId: `mock_msg_${Math.random().toString(36).slice(2, 14)}` }
}

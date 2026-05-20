// Postmark email mock adapter
import { getMockConfig, simulateDelay } from "../mock-config"
import type { SendEmailArgs } from "./postmark"

export async function sendEmail(args: SendEmailArgs): Promise<{ messageId: string }> {
  const cfg = await getMockConfig()
  const mode = (cfg.services as any).email ?? cfg.mode
  await simulateDelay(mode)
  if (mode === "failure") throw new Error("Mock Postmark: send-failure")
  // eslint-disable-next-line no-console
  console.log(`[mock-email] to=${args.to} subject="${args.subject}"`)
  return { messageId: `mock_msg_${Math.random().toString(36).slice(2, 14)}` }
}

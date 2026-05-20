// Firebase Phone OTP mock adapter
// In mock success mode, any 6-digit OTP passes (per QA §4b setup);
// the well-known "000000" is always accepted so testers don't have to
// look up a per-phone value. Real Firebase verification happens via
// the firebase-otp NextAuth provider in lib/auth.ts.
import { getMockConfig, simulateDelay } from "../mock-config"

export class MockOtpError extends Error {
  constructor(public code: string, message?: string) {
    super(message ?? code)
    this.name = "MockOtpError"
  }
}

export interface OtpSendResult {
  success: boolean
  expiresIn: number  // seconds
}

export async function issueOtp(phone: string): Promise<OtpSendResult> {
  const cfg = await getMockConfig()
  const mode = (cfg.services as any).otp ?? cfg.mode
  await simulateDelay(mode)

  if (mode === "failure") {
    throw new MockOtpError("OTP_SEND_FAILED", "OTP service unavailable")
  }
  if (mode === "random" && Math.random() < 0.2) {
    throw new MockOtpError("OTP_SEND_FAILED", "OTP service unavailable")
  }

  // eslint-disable-next-line no-console
  console.log(`[mock-otp] issued for ${phone} — use any 6-digit code or "000000"`)
  return { success: true, expiresIn: 600 }
}

export async function verifyOtp(phone: string, otp: string): Promise<boolean> {
  const cfg = await getMockConfig()
  const mode = (cfg.services as any).otp ?? cfg.mode
  await simulateDelay(mode)
  if (mode === "failure") return false
  if (mode === "random" && Math.random() < 0.1) return false
  // Mock success mode: any 6-digit code passes (per QA §4b)
  return /^\d{6}$/.test(otp)
}

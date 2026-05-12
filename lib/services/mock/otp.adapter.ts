// engineering-design.md §4.2 / §5 / §11 — MSG91 OTP mock adapter
// In mock success mode, issues OTP "000000" (NOT "1234" — the old bypass is dead)
import { getMockConfig, simulateDelay } from "./config"
import { storeOtp } from "@/lib/services/otp-store"
import { MockServiceError } from "./vahan.adapter"

export interface OtpSendResult {
  success: boolean
  expiresIn: number  // seconds
}

const MOCK_OTP = "000000"

export async function issueOtp(phone: string): Promise<OtpSendResult> {
  const config = await getMockConfig()
  const mode = config.services.otp ?? config.mode

  await simulateDelay(mode)

  if (mode === "failure") {
    throw new MockServiceError("OTP_SEND_FAILED", "OTP service unavailable")
  }
  if (mode === "random" && Math.random() < 0.2) {
    throw new MockServiceError("OTP_SEND_FAILED", "OTP service unavailable")
  }

  // In mock mode, always store the well-known demo OTP
  // In random mode, also store MOCK_OTP so testers can use 000000
  // (a future real adapter would generate a random 6-digit and send via MSG91)
  storeOtp(phone, MOCK_OTP)

  return { success: true, expiresIn: 600 }  // 10-min window
}

export async function verifyOtp(phone: string, otp: string): Promise<boolean> {
  const config = await getMockConfig()
  const mode = config.services.otp ?? config.mode

  await simulateDelay(mode)

  if (mode === "failure") {
    return false
  }

  // Delegate to OTP store (handles expiry + single-use deletion)
  const { verifyOtp: storeVerify } = await import("@/lib/services/otp-store")
  return storeVerify(phone, otp)
}

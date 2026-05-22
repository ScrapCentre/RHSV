// Razorpay mock adapter
// Modes (configurable per call OR via ConfigSetting.mockConfig.services.razorpay):
//   - "success"                  — order created + payment captured synchronously
//   - "failure"                  — order creation throws MockServiceError
//   - "refund-success"           — refund returns processed
//   - "refund-fail"              — refund throws (REJECT-002c test scenario)
//   - "refund-pending-then-success" — refund returns pending; webhook fires later
import { getMockConfig, simulateDelay } from "../mock-config"
import type { CreateOrderArgs, RazorpayOrder, RazorpayRefundResult } from "./razorpay"

export type RazorpayMode =
  | "success"
  | "failure"
  | "refund-success"
  | "refund-fail"
  | "refund-pending-then-success"

export class MockRazorpayError extends Error {
  constructor(public code: string, message?: string) {
    super(message ?? code)
    this.name = "MockRazorpayError"
  }
}

function genId(prefix: string): string {
  return `${prefix}_TEST_${Math.random().toString(36).slice(2, 14)}`
}

export async function createOrder(args: CreateOrderArgs): Promise<RazorpayOrder> {
  const cfg = await getMockConfig()
  const mode = (cfg.services as any).razorpay ?? cfg.mode
  await simulateDelay(mode === "failure" ? "failure" : "success")
  if (mode === "failure") {
    throw new MockRazorpayError("ORDER_CREATE_FAILED", "Mock: order creation failed")
  }
  return {
    orderId: genId("order"),
    amountPaise: args.amountPaise,
    currency: "INR",
    status: "created",
  }
}

export function verifyWebhookSignature(_payload: string, _signature: string, _secret: string): boolean {
  // Mock always returns true. Real adapter does HMAC-SHA256 verification.
  return true
}

export async function refund(paymentId: string, amountPaise?: number): Promise<RazorpayRefundResult> {
  const cfg = await getMockConfig()
  const mode = (cfg.services as any).razorpay ?? cfg.mode
  await simulateDelay("success")
  // Hotfix 2026-05-22 (P1 cron-trueup): also honor global `failure` mode so
  // /admin/mock-config (which exposes only success/failure/random globally)
  // can deterministically trigger refund failure for the cron verify step.
  if (mode === "refund-fail" || mode === "failure") {
    throw new MockRazorpayError("REFUND_FAILED", "Mock: insufficient merchant balance")
  }
  if (mode === "refund-pending-then-success") {
    return { refundId: genId("rfnd"), status: "pending" }
  }
  // default to refund-success
  return { refundId: genId("rfnd"), status: "processed" }
}

// Razorpay real adapter — stub. Live impl lands in M13.
// When RAZORPAY_KEY_ID + RAZORPAY_KEY_SECRET are set in env, this
// adapter will use the real Razorpay SDK. Until then, mock-mode is
// enforced via /admin/mock-config and lib/services/payments/index.ts
// will short-circuit to razorpay.mock for all operations.

export interface CreateOrderArgs {
  amountPaise: number
  leadId: string
  rvsfId: string
  notes?: Record<string, string>
}

export interface RazorpayOrder {
  orderId: string
  amountPaise: number
  currency: "INR"
  status: "created" | "attempted" | "paid"
}

// Hotfix 2026-05-22 (P1 cron-trueup): the refund return shape MUST match the
// shape that callers (app/api/cron/weight-trueup, leads/[id]/reject, admin
// refund-review/decide) read — they branch on `result.status === "processed"`.
// The Razorpay Node SDK's `payments.refund(...)` returns the raw refund object
// which includes `status` ("processed" | "pending" | "failed"). The M13 real
// implementation MUST surface that field; declaring it here keeps the typing
// honest so future drift (real adapter forgetting `status`) is a compile error.
export interface RazorpayRefundResult {
  refundId: string
  status: "processed" | "pending"
}

export async function createOrder(_args: CreateOrderArgs): Promise<RazorpayOrder> {
  throw new Error("Razorpay real adapter not yet implemented (M13). Toggle mock mode via /admin/mock-config.")
}

export function verifyWebhookSignature(_payload: string, _signature: string, _secret: string): boolean {
  throw new Error("Razorpay webhook verification not yet implemented (M13).")
}

export async function refund(_paymentId: string, _amountPaise?: number): Promise<RazorpayRefundResult> {
  throw new Error("Razorpay refund not yet implemented (M13).")
}

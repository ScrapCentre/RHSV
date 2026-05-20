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

export async function createOrder(_args: CreateOrderArgs): Promise<RazorpayOrder> {
  throw new Error("Razorpay real adapter not yet implemented (M13). Toggle mock mode via /admin/mock-config.")
}

export function verifyWebhookSignature(_payload: string, _signature: string, _secret: string): boolean {
  throw new Error("Razorpay webhook verification not yet implemented (M13).")
}

export async function refund(_paymentId: string, _amountPaise?: number): Promise<{ refundId: string }> {
  throw new Error("Razorpay refund not yet implemented (M13).")
}

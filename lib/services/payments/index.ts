// Payments adapter barrel. Picks mock vs real based on env.
// Real Razorpay implementation lands in M13.
import * as real from "./razorpay"
import * as mock from "./razorpay.mock"

const useReal = !!(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET)
const adapter = useReal ? real : mock

export const createOrder = adapter.createOrder
export const refund = adapter.refund
export const verifyWebhookSignature = adapter.verifyWebhookSignature
export type { CreateOrderArgs, RazorpayOrder, RazorpayRefundResult } from "./razorpay"

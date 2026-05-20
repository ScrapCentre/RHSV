/**
 * Weight true-up calculation — PURE FUNCTION.
 * Locked 2026-05-20 (L30): ±15% tolerance window. Outside that, auto debit/credit
 * the RVSF via Razorpay. Within the window, no action.
 */

export type TrueUpDecision =
  | { action: "no_change"; deltaPercent: number }
  | { action: "debit_rvsf"; deltaPercent: number; topupAmountPaise: number }
  | { action: "credit_rvsf"; deltaPercent: number; refundAmountPaise: number }

export function computeTrueUp(args: {
  chargedWeightKg: number
  actualWeightKg: number
  pricePerKg: number
  tolerancePct: number   // default 15 per ConfigSetting.weightTrueUpTolerancePct
}): TrueUpDecision {
  const { chargedWeightKg, actualWeightKg, pricePerKg, tolerancePct } = args
  if (chargedWeightKg <= 0) return { action: "no_change", deltaPercent: 0 }

  const deltaKg = actualWeightKg - chargedWeightKg
  const deltaPercent = (deltaKg / chargedWeightKg) * 100
  const absPct = Math.abs(deltaPercent)

  if (absPct <= tolerancePct) {
    return { action: "no_change", deltaPercent }
  }

  const adjustmentPaise = Math.round(Math.abs(deltaKg) * pricePerKg * 100)
  if (deltaKg > 0) {
    // RVSF underpaid (actual > charged) → top-up
    return { action: "debit_rvsf", deltaPercent, topupAmountPaise: adjustmentPaise }
  }
  // RVSF overpaid (actual < charged) → refund
  return { action: "credit_rvsf", deltaPercent, refundAmountPaise: adjustmentPaise }
}

/**
 * Lead-unlock pricing — PURE FUNCTIONS.
 * Locked decision 2026-05-20 (L16, L30):
 *   - ₹0.75/kg universal (no 2W/4W split); admin-tunable via ConfigSetting.leadPricePerKg
 *   - Charge basis weight = max(vahanWeightKg, secondaryApiWeightKg) at unlock time
 *   - ±15% weight true-up at scrap completion (lib/services/pricing/trueup.ts)
 */

export function chargeBasisWeightKg(args: {
  vahanWeightKg: number | null | undefined
  secondaryApiWeightKg: number | null | undefined
}): number {
  const a = args.vahanWeightKg ?? 0
  const b = args.secondaryApiWeightKg ?? 0
  return Math.max(a, b)
}

export function unlockAmountPaise(args: {
  chargeBasisWeightKg: number
  pricePerKg: number     // typically from ConfigSetting.leadPricePerKg (default 0.75)
}): number {
  const rupees = args.chargeBasisWeightKg * args.pricePerKg
  return Math.round(rupees * 100)
}

export function formatRupees(paise: number): string {
  return `₹${(paise / 100).toFixed(2)}`
}

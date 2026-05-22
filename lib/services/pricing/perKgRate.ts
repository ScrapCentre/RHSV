/**
 * Per-vehicle-type unlock-rate resolver.
 *
 * Founder decision 2026-05-22 (supersedes the "universal ₹0.75/kg" line in
 * VISION §9 / L16): the per-kg unlock fee splits by vehicle class —
 *   2W    → ₹0.75/kg
 *   4W    → ₹1.00/kg
 *   truck → ₹1.00/kg
 *
 * All three rates are admin-tunable via ConfigSetting rows
 * (`pricing.perKgRate.2W`, `pricing.perKgRate.4W`, `pricing.perKgRate.truck`).
 * This module reads the rows at request time, caches them for 60 s to avoid
 * hammering Mongo, and falls back to the hardcoded defaults above if a row
 * is missing.
 *
 * The 60 s cache is invalidated via `invalidatePerKgRateCache()` whenever
 * the admin saves a setting (hooked into `app/api/admin/settings/route.ts`),
 * so changes propagate immediately rather than after the TTL.
 */
import connectToDatabase from "@/lib/db"
import ConfigSetting from "@/models/ConfigSetting"

export type VehicleType = "2W" | "4W" | "truck"

/** Hardcoded fallbacks — used if the ConfigSetting row is missing or DB is unreachable. */
const DEFAULT_RATES: Record<VehicleType, number> = {
  "2W":    0.75,
  "4W":    1.0,
  "truck": 1.0,
}

const SETTING_KEY: Record<VehicleType, string> = {
  "2W":    "pricing.perKgRate.2W",
  "4W":    "pricing.perKgRate.4W",
  "truck": "pricing.perKgRate.truck",
}

const CACHE_TTL_MS = 60_000

// Module-level TTL cache — process-persistent. Safe for `next start`; in a
// serverless environment each worker pays the lookup cost once per minute.
let cache: { rates: Record<VehicleType, number>; ts: number } | null = null

async function loadRates(): Promise<Record<VehicleType, number>> {
  try {
    await connectToDatabase()
    const docs = await ConfigSetting.find({
      key: { $in: Object.values(SETTING_KEY) },
    }).lean()

    const rates: Record<VehicleType, number> = { ...DEFAULT_RATES }
    for (const d of docs as any[]) {
      for (const vt of Object.keys(SETTING_KEY) as VehicleType[]) {
        if (d.key === SETTING_KEY[vt] && typeof d.value === "number" && d.value > 0) {
          rates[vt] = d.value
        }
      }
    }
    return rates
  } catch {
    // Fail open: hardcoded defaults so unlock pricing never breaks because Mongo blipped.
    return { ...DEFAULT_RATES }
  }
}

/**
 * Get the ₹/kg rate for a given vehicle type. Reads from ConfigSetting (60 s
 * cache); falls back to hardcoded defaults if the row is missing.
 */
export async function getPerKgRate(vehicleType: VehicleType): Promise<number> {
  if (cache && Date.now() - cache.ts < CACHE_TTL_MS) {
    return cache.rates[vehicleType] ?? DEFAULT_RATES[vehicleType]
  }
  const rates = await loadRates()
  cache = { rates, ts: Date.now() }
  return rates[vehicleType] ?? DEFAULT_RATES[vehicleType]
}

/**
 * Compute the unlock price (rounded INR) for a marketplace lead.
 * Mirrors the old `computeLeadPrice` in `app/api/triage/decide/route.ts`
 * but pulls the rate from ConfigSetting instead of hardcoding it.
 */
export async function computeLeadPrice(vehicleType: VehicleType, weightKg: number): Promise<number> {
  const rate = await getPerKgRate(vehicleType)
  return Math.round(weightKg * rate)
}

/**
 * Invalidate the in-process cache. Called from the admin settings PATCH
 * handler so an edit to `pricing.perKgRate.*` is visible on the very next
 * request rather than after up to 60 s.
 */
export function invalidatePerKgRateCache(): void {
  cache = null
}

/** Test-only: peek the currently cached rates (or null if cold). */
export function _peekPerKgRateCache(): { rates: Record<VehicleType, number>; ts: number } | null {
  return cache
}

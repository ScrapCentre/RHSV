// engineering-design.md §4.2 / §5 — Google Maps Distance Matrix mock adapter
import { getMockConfig, simulateDelay } from "../mock-config"

export interface MapsResult {
  distanceKm: number
  pickupCostInr: number
}

/** Deterministic distance based on simple pincode math */
function computeDistance(fromPincode: string, toPincode: string): number {
  const from = parseInt(fromPincode.replace(/\*/g, "0").slice(0, 6), 10) || 0
  const to   = parseInt(toPincode.replace(/\*/g, "0").slice(0, 6), 10)   || 0
  // Simple mock: difference scaled to km (0-250 range)
  return Math.min(250, Math.abs(from - to) % 251)
}

/** ₹8 per km for pickup cost */
function computePickupCost(distanceKm: number): number {
  return Math.round(distanceKm * 8)
}

export async function getDistanceAndCost(fromPincode: string, toPincode: string): Promise<MapsResult> {
  const config = await getMockConfig()
  const mode = config.services.maps ?? config.mode

  await simulateDelay(mode)

  if (mode === "failure") {
    // Fail open: return free pickup so calculator still works
    return { distanceKm: 0, pickupCostInr: 0 }
  }

  const distanceKm = computeDistance(fromPincode, toPincode)
  return {
    distanceKm,
    pickupCostInr: computePickupCost(distanceKm),
  }
}

// engineering-design.md §4.2 / §5 — VAHAN vehicle data lookup mock adapter
import { getMockConfig, simulateDelay } from "./config"

export interface VahanResult {
  brand: string
  model: string
  year: string
  vehicleType: "2W" | "4W" | "truck"
  state: string
  registrationNumber: string
  estimatedWeightKg: number
}

export class MockServiceError extends Error {
  constructor(public code: string, message?: string) {
    super(message ?? code)
    this.name = "MockServiceError"
  }
}

// Deterministic fixture generator based on registration prefix heuristics
function generateVahanFixture(regNumber: string): VahanResult {
  const upper = regNumber.toUpperCase().replace(/\s/g, "")

  // Extract state code from prefix (e.g. UP32AB1234 → UP)
  const stateCode = upper.slice(0, 2)
  const stateMap: Record<string, string> = {
    UP: "Uttar Pradesh", DL: "Delhi", MH: "Maharashtra", KA: "Karnataka",
    TN: "Tamil Nadu", GJ: "Gujarat", RJ: "Rajasthan", WB: "West Bengal",
    PB: "Punjab", HR: "Haryana", MP: "Madhya Pradesh", AP: "Andhra Pradesh",
    TS: "Telangana", KL: "Kerala", UK: "Uttarakhand",
  }
  const state = stateMap[stateCode] ?? "Uttar Pradesh"

  // Deterministic but varied fixture based on character sum
  const charSum = upper.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0)
  const brands = ["Maruti Suzuki", "Hyundai", "Honda", "Hero", "Bajaj", "Tata", "Mahindra"]
  const models4W = ["Swift", "i20", "City", "Innova", "Scorpio", "Nexon", "Creta"]
  const models2W = ["Splendor", "Pulsar", "Activa", "CBR", "Royal Enfield Classic"]
  const is2W = charSum % 5 === 0

  return {
    brand:              brands[charSum % brands.length],
    model:              is2W ? models2W[charSum % models2W.length] : models4W[charSum % models4W.length],
    year:               String(2010 + (charSum % 13)),
    vehicleType:        is2W ? "2W" : "4W",
    state,
    registrationNumber: upper,
    estimatedWeightKg:  is2W ? 90 + (charSum % 70) : 800 + (charSum % 400),
  }
}

export async function lookupVehicle(regNumber: string): Promise<VahanResult> {
  const config = await getMockConfig()
  const mode = config.services.vahan ?? config.mode

  await simulateDelay(mode)

  if (mode === "failure") {
    throw new MockServiceError("VAHAN_UNAVAILABLE", "VAHAN lookup service unavailable")
  }
  if (mode === "random" && Math.random() < 0.2) {
    throw new MockServiceError("VAHAN_UNAVAILABLE", "VAHAN lookup service unavailable")
  }

  return generateVahanFixture(regNumber)
}

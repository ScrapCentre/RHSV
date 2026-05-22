// engineering-design.md §4.1 — anonymous Tier 1 calculator entry point
// Creates LeadState, calls VAHAN mock, computes scrap range
import { NextResponse } from "next/server"
import { randomUUID } from "crypto"
import connectToDatabase from "@/lib/db"
import LeadState from "@/models/LeadState"
import { lookupVehicle, MockServiceError } from "@/lib/services/vahan"

// Scrap price constants (₹/kg); ±20% band
const SCRAP_PRICE_PER_KG = 14  // mid-point
const BAND_PCT = 0.20

function computeScrapRange(weightKg: number) {
  const mid = weightKg * SCRAP_PRICE_PER_KG
  return {
    scrapMin: Math.round(mid * (1 - BAND_PCT)),
    scrapMax: Math.round(mid * (1 + BAND_PCT)),
  }
}

function computePickupCost(weightKg: number): number {
  // Flat base + weight surcharge for dummy
  return Math.round(500 + weightKg * 2)
}

export async function POST(req: Request) {
  try {
    await connectToDatabase()
    const body = await req.json()

    const { regNumber, brand, model, year, state, vehicleType } = body

    let vahanData: {
      brand: string; model: string; year: string;
      vehicleType: "2W" | "4W" | "truck"; state: string;
      registrationNumber: string; estimatedWeightKg: number
    } | null = null

    let registrationNumber: string | null = regNumber ?? null

    if (regNumber) {
      // Try VAHAN lookup; fall through to manual entry on failure
      try {
        vahanData = await lookupVehicle(regNumber)
      } catch (err) {
        if (!(err instanceof MockServiceError)) throw err
        // VAHAN unavailable — client will use manual entry form
        vahanData = null
      }
    }

    // Validate manual entry when VAHAN unavailable or no regNumber
    const resolvedBrand  = vahanData?.brand  ?? brand
    const resolvedModel  = vahanData?.model  ?? model
    const resolvedYear   = vahanData?.year   ?? year
    const resolvedState  = vahanData?.state  ?? state
    const resolvedType   = (vahanData?.vehicleType ?? vehicleType) as "2W" | "4W" | "truck" | null
    const resolvedWeight = vahanData?.estimatedWeightKg ?? (resolvedType === "2W" ? 110 : 900)

    if (!resolvedBrand || !resolvedModel || !resolvedYear) {
      return NextResponse.json(
        { error: "Vehicle details required (brand, model, year) or a valid registration number" },
        { status: 400 }
      )
    }

    const { scrapMin, scrapMax } = computeScrapRange(resolvedWeight)
    const pickupCost = computePickupCost(resolvedWeight)
    const anonymousToken = randomUUID()

    const leadState = await LeadState.create({
      anonymousToken,
      tier: "tier1",
      vehicleType: resolvedType,
      registrationNumber: vahanData?.registrationNumber ?? registrationNumber,
      brand: resolvedBrand,
      model: resolvedModel,
      year: resolvedYear,
      state: resolvedState ?? null,
      estimatedWeightKg: resolvedWeight,
      scrapValueMin: scrapMin,
      scrapValueMax: scrapMax,
      pickupCost,
    })

    // Set anonymousToken as httpOnly cookie (7-day TTL)
    const res = NextResponse.json({
      leadStateId:    leadState._id.toString(),
      anonymousToken,
      scrapMin,
      scrapMax,
      pickupCost,
      vehicleData:    vahanData ? { brand: resolvedBrand, model: resolvedModel, year: resolvedYear, vehicleType: resolvedType } : null,
      vahanAvailable: !!vahanData,
      // Blurred tiles: partner data requiring phone verification
      blurredTiles:   ["cdValue", "dealerDiscount", "greenFinance", "greenInsurance"],
    }, { status: 201 })

    res.cookies.set("anonymousToken", anonymousToken, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60,  // 7 days
    })

    return res
  } catch (err: any) {
    console.error("[calc/tier1] error:", err?.message)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

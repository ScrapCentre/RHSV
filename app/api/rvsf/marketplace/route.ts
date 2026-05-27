import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import connectToDatabase from "@/lib/db"
import Valuation from "@/models/Valuation"
import ExchangeVehicle from "@/models/ExchangeVehicle"
import BuyVehicle from "@/models/BuyVehicle"
import WizardLead from "@/models/WizardLead"
import CollectionCenter from "@/models/CollectionCenter"
import RVSFUser from "@/models/RVSFUser"

// ─── Types ──────────────────────────────────────────────────────
interface LeadItem {
    _id: string
    type: string
    customerName: string
    vehicleInfo: string
    location: string
    city: string
    state: string
    pincode: string
    createdAt: string
    estimatedValue?: number
    carPhoto?: string
    photoFront?: string
}

interface CCInfo {
    _id: string
    name: string
    city: string
    state: string
    pincode: string
    catchmentRadius: number
}

// ─── Haversine formula (km) ──────────────────────────────────────
function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLon = (lon2 - lon1) * Math.PI / 180
    const a = Math.sin(dLat / 2) ** 2 +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) ** 2
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

// ─── Geocode a location string to lat/lng ────────────────────────
const geocodeCache: Record<string, { lat: number; lng: number } | null> = {}

async function geocodeLocation(address: string): Promise<{ lat: number; lng: number } | null> {
    if (geocodeCache[address] !== undefined) return geocodeCache[address]

    const apiKey = process.env.GOOGLE_MAPS_API_KEY
    if (!apiKey) return null

    try {
        const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`
        const res = await fetch(url)
        const data = await res.json()
        if (data.status === "OK" && data.results?.[0]?.geometry?.location) {
            const loc = data.results[0].geometry.location
            geocodeCache[address] = { lat: loc.lat, lng: loc.lng }
            return geocodeCache[address]
        }
        console.warn("[Geocode] No result for:", address, "Status:", data.status)
        geocodeCache[address] = null
        return null
    } catch (err) {
        console.error("[Geocode] Error for:", address, err)
        geocodeCache[address] = null
        return null
    }
}

// ─── Google Distance Matrix helper ──────────────────────────────
async function getDistancesFromGoogle(
    origins: string[],
    destinations: string[],
): Promise<number[][]> {
    const apiKey = process.env.GOOGLE_MAPS_API_KEY
    if (!apiKey) {
        console.error("[Distance Matrix] GOOGLE_MAPS_API_KEY not set")
        return origins.map(() => destinations.map(() => -1))
    }

    try {
        const originsStr = origins.map(o => encodeURIComponent(o)).join("|")
        const destsStr = destinations.map(d => encodeURIComponent(d)).join("|")
        const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${originsStr}&destinations=${destsStr}&units=metric&key=${apiKey}`

        const res = await fetch(url)
        const data = await res.json()

        console.log("[Distance Matrix] Status:", data.status, "| Origins:", origins.length, "| Dests:", destinations.length)

        if (data.status !== "OK") {
            console.error("[Distance Matrix] API Error:", data.status, data.error_message)
            return origins.map(() => destinations.map(() => -1))
        }

        const distances: number[][] = []
        for (const row of data.rows) {
            const rowDistances: number[] = []
            for (const element of row.elements) {
                if (element.status === "OK") {
                    rowDistances.push(Math.round(element.distance.value / 1000))
                } else {
                    console.warn("[Distance Matrix] Element status:", element.status)
                    rowDistances.push(-1)
                }
            }
            distances.push(rowDistances)
        }
        return distances
    } catch (err) {
        console.error("[Distance Matrix] Fetch error:", err)
        return origins.map(() => destinations.map(() => -1))
    }
}

// ─── Calculate distance with fallback chain ─────────────────────
// 1. Try Google Distance Matrix
// 2. Fallback: Geocode both + Haversine
async function calculateDistances(
    originAddresses: string[],
    destinationAddresses: string[]
): Promise<number[][]> {
    // Try Distance Matrix first
    const matrixResult = await getDistancesFromGoogle(originAddresses, destinationAddresses)

    // Check if we got any valid results
    const hasValidResult = matrixResult.some(row => row.some(d => d >= 0))

    if (hasValidResult) {
        console.log("[Marketplace] Distance Matrix returned valid results")

        // For any -1 entries, try geocode fallback
        for (let oi = 0; oi < matrixResult.length; oi++) {
            for (let di = 0; di < matrixResult[oi].length; di++) {
                if (matrixResult[oi][di] < 0) {
                    // Try geocode fallback for this specific pair
                    const originGeo = await geocodeLocation(originAddresses[oi])
                    const destGeo = await geocodeLocation(destinationAddresses[di])
                    if (originGeo && destGeo) {
                        matrixResult[oi][di] = Math.round(haversineKm(originGeo.lat, originGeo.lng, destGeo.lat, destGeo.lng))
                    }
                }
            }
        }
        return matrixResult
    }

    // Distance Matrix completely failed — fallback to full geocode + haversine
    console.warn("[Marketplace] Distance Matrix failed entirely, falling back to Geocode + Haversine")

    const originCoords = await Promise.all(originAddresses.map(a => geocodeLocation(a)))
    const destCoords = await Promise.all(destinationAddresses.map(a => geocodeLocation(a)))

    const fallbackDistances: number[][] = []
    for (let oi = 0; oi < originAddresses.length; oi++) {
        const row: number[] = []
        for (let di = 0; di < destinationAddresses.length; di++) {
            const o = originCoords[oi]
            const d = destCoords[di]
            if (o && d) {
                row.push(Math.round(haversineKm(o.lat, o.lng, d.lat, d.lng)))
            } else {
                row.push(-1)
            }
        }
        fallbackDistances.push(row)
    }

    const hasFallbackResult = fallbackDistances.some(row => row.some(d => d >= 0))
    if (hasFallbackResult) {
        console.log("[Marketplace] Geocode fallback results: success")
        return fallbackDistances
    }

    console.warn("[Marketplace] Google Maps APIs denied/failed. Falling back to simple string matching.")
    
    // Final fallback: string matching (if APIs disabled)
    // We try to extract City and State from the location string
    const stringMatchDistances: number[][] = []
    
    const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '')
    
    for (let oi = 0; oi < originAddresses.length; oi++) {
        const row: number[] = []
        for (let di = 0; di < destinationAddresses.length; di++) {
            const oStr = normalize(originAddresses[oi])
            const dStr = normalize(destinationAddresses[di])
            
            // If they are literally the same location string
            if (oStr === dStr) {
                row.push(0)
                continue
            }
            
            // Very simple heuristic: if they share the first word (often the city name like 'Unnao' or 'Kanpur')
            const oWords = originAddresses[oi].toLowerCase().split(/[,\s]+/)
            const dWords = destinationAddresses[di].toLowerCase().split(/[,\s]+/)
            
            if (oWords[0] && dWords.includes(oWords[0])) {
                row.push(10) // 10km arbitrarily for same city match
            } else {
                row.push(-1)
            }
        }
        stringMatchDistances.push(row)
    }

    return stringMatchDistances
}

// ─── Build location string from lead ────────────────────────────
function getLeadLocationString(lead: any): string {
    if (lead.address?.city || lead.address?.state) {
        return `${lead.address?.city || ""}, ${lead.address?.state || ""} ${lead.address?.pincode || ""}`.trim()
    }
    return `${lead.city || ""}, ${lead.state || ""} ${lead.pincode || ""}`.trim()
}

// ─── GET ────────────────────────────────────────────────────────
export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        if (!session || (session.user as any)?.role !== "rvsf") {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
        }

        const rvsfId = (session.user as any)?.rvsfId
        if (!rvsfId) {
            return NextResponse.json({ message: "RVSF ID not found in session" }, { status: 403 })
        }

        await connectToDatabase()

        const { searchParams } = new URL(request.url)
        const mode = searchParams.get("mode") || "coverage" // "coverage" or "explore"
        const radiusParam = searchParams.get("radius") // for explore mode

        // ── 1. Fetch RVSF user data ─────────────────────────────
        const rvsfUser = await RVSFUser.findOne({ rvsfId }).lean() as any
        if (!rvsfUser) {
            return NextResponse.json({ message: "RVSF user not found" }, { status: 404 })
        }

        // ── 2. Fetch CCs for this RVSF ─────────────────────────
        const ccs: CCInfo[] = (await CollectionCenter.find({ rvsfId }).lean() as any[]).map((cc: any) => ({
            _id: cc._id.toString(),
            name: cc.name,
            city: cc.city,
            state: cc.state,
            pincode: cc.pincode,
            catchmentRadius: cc.catchmentRadius,
        }))

        // ── 3. Fetch all approved_to_rvsf leads ────────────────
        // Same filter as /admin/subcontracting
        const filter = { status: "approved_to_rvsf" }

        const [valuations, exchanges, buys, wizards] = await Promise.all([
            Valuation.find(filter).sort({ createdAt: -1 }).lean(),
            ExchangeVehicle.find(filter).sort({ createdAt: -1 }).lean(),
            BuyVehicle.find(filter).sort({ createdAt: -1 }).lean(),
            WizardLead.find(filter).sort({ createdAt: -1 }).lean(),
        ])

        // ── 4. Normalize all leads ─────────────────────────────
        const allLeads: any[] = [
            ...valuations.map((item: any) => ({
                _id: item._id.toString(),
                type: "quote",
                source: "Valuation",
                customerName: item.contact?.name || "N/A",
                vehicleInfo: `${item.year || ""} ${item.brand || ""} ${item.model || ""} (${item.vehicleType || ""})`.trim(),
                location: `${item.address?.city || "N/A"}, ${item.address?.state || "N/A"}`,
                city: item.address?.city || "",
                state: item.address?.state || "",
                pincode: item.address?.pincode || "",
                createdAt: item.createdAt,
                estimatedValue: item.estimatedValue,
                carPhoto: item.carPhoto,
                vehicleWeight: item.vehicleWeight,
                year: item.year,
                brand: item.brand,
                model: item.model,
            })),
            ...exchanges.map((item: any) => ({
                _id: item._id.toString(),
                type: "exchange",
                source: "ExchangeVehicle",
                customerName: item.customerName || "N/A",
                vehicleInfo: `Old: ${item.oldVehicleBrand} ${item.oldVehicleModel} → New: ${item.newVehicleBrand}`,
                location: `${item.city || "N/A"}, ${item.state || "N/A"}`,
                city: item.city || "",
                state: item.state || "",
                pincode: item.pincode || "",
                createdAt: item.createdAt,
                carPhoto: item.carPhoto,
                year: item.oldVehicleYear,
                brand: item.oldVehicleBrand,
                model: item.oldVehicleModel,
            })),
            ...buys.map((item: any) => ({
                _id: item._id.toString(),
                type: "buy",
                source: "BuyVehicle",
                customerName: item.customerName || "N/A",
                vehicleInfo: `Looking for: ${item.customBrand || item.vehicleBrand} ${item.customModel || item.vehicleModel}`,
                location: `${item.city || "N/A"}, ${item.state || "N/A"}`,
                city: item.city || "",
                state: item.state || "",
                pincode: item.pincode || "",
                createdAt: item.createdAt,
            })),
            ...wizards.map((item: any) => {
                const serviceType = item.serviceType || "scrap"
                let vehicleInfoStr = ""
                if (serviceType === "buy") {
                    vehicleInfoStr = `Looking for: ${item.desiredCompany || ""} ${item.desiredModel || ""}`
                } else if (serviceType === "scrap" && item.category === "scrap_and_buy") {
                    vehicleInfoStr = `Scrap: ${item.brand || ""} ${item.model || ""} | Buy: ${item.desiredCompany || ""} ${item.desiredModel || ""}`
                } else {
                    vehicleInfoStr = `${item.year || ""} ${item.brand || ""} ${item.model || ""}`
                }
                return {
                    _id: item._id.toString(),
                    type: serviceType === "buy" ? "buy" : "quote",
                    source: "WizardLead",
                    customerName: item.name || "N/A",
                    vehicleInfo: vehicleInfoStr.trim(),
                    location: `${item.city || "N/A"}, ${item.state || "N/A"}`,
                    city: item.city || "",
                    state: item.state || "",
                    pincode: item.pincode || "",
                    createdAt: item.createdAt,
                    carPhoto: item.photoFront,
                    year: item.year,
                    brand: item.brand,
                    model: item.model,
                    weight: item.weight,
                }
            }),
        ]

        console.log(`[Marketplace] Total leads found: ${allLeads.length} (V:${valuations.length} E:${exchanges.length} B:${buys.length} W:${wizards.length})`)
        console.log(`[Marketplace] CCs found: ${ccs.length}`, ccs.map(c => `${c.name} (${c.city}, ${c.state} — ${c.catchmentRadius}km)`))
        console.log(`[Marketplace] RVSF location: ${rvsfUser.city}, ${rvsfUser.state} ${rvsfUser.pincode}`)

        if (allLeads.length === 0) {
            return NextResponse.json({ leads: [], ccs, rvsfLocation: { city: rvsfUser.city, state: rvsfUser.state, pincode: rvsfUser.pincode } })
        }

        // ── 5. Calculate distances ──────────────────────────────
        const leadLocations = allLeads.map(l => {
            if (l.pincode) return `${l.city}, ${l.state} ${l.pincode}, India`
            return `${l.city}, ${l.state}, India`
        })
        console.log(`[Marketplace] Lead locations sample:`, leadLocations.slice(0, 3))

        if (mode === "coverage") {
            // MODE 1: Distance from each CC to each lead
            if (ccs.length === 0) {
                return NextResponse.json({
                    leads: [],
                    ccs,
                    rvsfLocation: { city: rvsfUser.city, state: rvsfUser.state, pincode: rvsfUser.pincode },
                    message: "No Collection Centers found. Please add CCs first."
                })
            }

            const ccLocations = ccs.map(cc => {
                if (cc.pincode) return `${cc.city}, ${cc.state} ${cc.pincode}, India`
                return `${cc.city}, ${cc.state}, India`
            })

            console.log(`[Marketplace] CC locations:`, ccLocations)

            // Calculate distances: CCs → Leads (with fallback)
            const allDistances = await calculateDistances(ccLocations, leadLocations)
            console.log(`[Marketplace] Distance matrix:`, allDistances.map((row, i) => `CC[${i}]: ${row.join(', ')}`))


            // For each lead, find closest CC within its catchment
            const filteredLeads: any[] = []
            for (let li = 0; li < allLeads.length; li++) {
                let minDistance = Infinity
                let closestCC: CCInfo | null = null

                for (let ci = 0; ci < ccs.length; ci++) {
                    const dist = allDistances[ci]?.[li] ?? -1
                    if (dist >= 0 && dist <= ccs[ci].catchmentRadius && dist < minDistance) {
                        minDistance = dist
                        closestCC = ccs[ci]
                    }
                }

                if (closestCC) {
                    filteredLeads.push({
                        ...allLeads[li],
                        distanceKm: minDistance,
                        nearestCC: closestCC.name,
                        nearestCCId: closestCC._id,
                    })
                }
            }

            // Sort by distance
            filteredLeads.sort((a, b) => a.distanceKm - b.distanceKm)

            return NextResponse.json({
                leads: filteredLeads,
                ccs,
                rvsfLocation: { city: rvsfUser.city, state: rvsfUser.state, pincode: rvsfUser.pincode },
            })

        } else {
            // MODE 2: Explore by distance from RVSF's registered address
            const maxRadius = parseInt(radiusParam || "200", 10)
            const rvsfLocationStr = `${rvsfUser.city || ""}, ${rvsfUser.state || ""} ${rvsfUser.pincode || ""}, India`

            // Calculate distance from RVSF HQ to all leads
            const filteredLeads: any[] = []

            console.log(`[Marketplace] RVSF HQ location string:`, rvsfLocationStr)

            // Calculate distances: RVSF HQ → Leads (with fallback)
            const distMatrix = await calculateDistances([rvsfLocationStr], leadLocations)
            const allDists = distMatrix[0] || []
            console.log(`[Marketplace] Explore distances:`, allDists.slice(0, 5), `... (${allDists.length} total)`)

            for (let li = 0; li < allLeads.length; li++) {
                const dist = allDists[li] ?? -1
                if (dist >= 0 && dist <= maxRadius) {
                    filteredLeads.push({
                        ...allLeads[li],
                        distanceKm: dist,
                    })
                }
            }

            filteredLeads.sort((a, b) => a.distanceKm - b.distanceKm)

            return NextResponse.json({
                leads: filteredLeads,
                ccs,
                rvsfLocation: { city: rvsfUser.city, state: rvsfUser.state, pincode: rvsfUser.pincode },
            })
        }

    } catch (error: any) {
        console.error("[Marketplace API] Error:", error)
        return NextResponse.json({ message: error.message || "Internal server error" }, { status: 500 })
    }
}

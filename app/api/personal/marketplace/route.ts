import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import connectToDatabase from "@/lib/db"
import ExchangeVehicle from "@/models/ExchangeVehicle"
import BuyVehicle from "@/models/BuyVehicle"
import WizardLead from "@/models/WizardLead"
import PersonalCollectionCenter from "@/models/PersonalCollectionCenter"
import PersonalUnlockedLead from "@/models/PersonalUnlockedLead"
import B2BPartner from "@/models/B2BPartner"

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

function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLon = (lon2 - lon1) * Math.PI / 180
    const a = Math.sin(dLat / 2) ** 2 +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) ** 2
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

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
        geocodeCache[address] = null
        return null
    } catch (err) {
        console.error("[Geocode] Error for:", address, err)
        geocodeCache[address] = null
        return null
    }
}

async function getDistancesFromGoogle(origins: string[], destinations: string[]): Promise<number[][]> {
    const apiKey = process.env.GOOGLE_MAPS_API_KEY
    if (!apiKey) {
        return origins.map(() => destinations.map(() => -1))
    }

    try {
        const originsStr = origins.map(o => encodeURIComponent(o)).join("|")
        const destsStr = destinations.map(d => encodeURIComponent(d)).join("|")
        const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${originsStr}&destinations=${destsStr}&units=metric&key=${apiKey}`

        const res = await fetch(url)
        const data = await res.json()

        if (data.status !== "OK") {
            return origins.map(() => destinations.map(() => -1))
        }

        const distances: number[][] = []
        for (const row of data.rows) {
            const rowDistances: number[] = []
            for (const element of row.elements) {
                if (element.status === "OK") {
                    rowDistances.push(Math.round(element.distance.value / 1000))
                } else {
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

async function calculateDistances(originAddresses: string[], destinationAddresses: string[]): Promise<number[][]> {
    const matrixResult = await getDistancesFromGoogle(originAddresses, destinationAddresses)
    const hasValidResult = matrixResult.some(row => row.some(d => d >= 0))

    if (hasValidResult) {
        for (let oi = 0; oi < matrixResult.length; oi++) {
            for (let di = 0; di < matrixResult[oi].length; di++) {
                if (matrixResult[oi][di] < 0) {
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
        return fallbackDistances
    }

    const stringMatchDistances: number[][] = []
    const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '')
    
    for (let oi = 0; oi < originAddresses.length; oi++) {
        const row: number[] = []
        for (let di = 0; di < destinationAddresses.length; di++) {
            const oStr = normalize(originAddresses[oi])
            const dStr = normalize(destinationAddresses[di])
            
            if (oStr === dStr) {
                row.push(0)
                continue
            }
            
            const oWords = originAddresses[oi].toLowerCase().split(/[,\s]+/)
            const dWords = destinationAddresses[di].toLowerCase().split(/[,\s]+/)
            
            if (oWords[0] && dWords.includes(oWords[0])) {
                row.push(10)
            } else {
                row.push(-1)
            }
        }
        stringMatchDistances.push(row)
    }

    return stringMatchDistances
}

export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        if (!session || (session.user as any)?.role !== "partner") {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
        }

        const partnerId = (session.user as any)?.partnerId
        if (!partnerId) {
            return NextResponse.json({ message: "Partner ID not found in session" }, { status: 403 })
        }

        await connectToDatabase()

        const { searchParams } = new URL(request.url)
        const mode = searchParams.get("mode") || "coverage"
        const radiusParam = searchParams.get("radius")

        const partnerUser = await B2BPartner.findOne({ userId: partnerId }).lean() as any
        if (!partnerUser) {
            return NextResponse.json({ message: "Partner user not found" }, { status: 404 })
        }

        const ccs: CCInfo[] = (await PersonalCollectionCenter.find({ partnerId }).lean() as any[]).map((cc: any) => ({
            _id: cc._id.toString(),
            name: cc.name,
            city: cc.city,
            state: cc.state,
            pincode: cc.pincode,
            catchmentRadius: cc.catchmentRadius,
        }))

        // ── Fetch PERSONAL leads: status in approved, pickup_scheduled, reached_collection_centre, car_scrapped ──────────────────────────
        // The admin approves leads for the Personal partner marketplace. We fetch all approved personal leads.
        const filter = { status: { $in: ["approved", "pickup_scheduled", "reached_collection_centre", "car_scrapped"] } }

        // ── Exclude leads already claimed by this partner ──────────────────────
        const claimedLeads = await PersonalUnlockedLead.find({ partnerId }).select("leadId").lean()
        const claimedLeadIds = new Set(claimedLeads.map((l: any) => l.leadId.toString()))

        const [exchanges, buys, wizards] = await Promise.all([
            ExchangeVehicle.find(filter).sort({ createdAt: -1 }).lean(),
            BuyVehicle.find(filter).sort({ createdAt: -1 }).lean(),
            WizardLead.find(filter).sort({ createdAt: -1 }).lean(),
        ])

        const allLeads: any[] = [
            ...exchanges.map((item: any) => ({
                _id: item._id.toString(),
                type: "exchange",
                source: "ExchangeVehicle",
                customerName: item.customerName || "N/A",
                vehicleInfo: `Old: ${item.oldVehicleBrand || ""} ${item.oldVehicleModel || ""} → New: ${item.newVehicleBrand || ""}`,
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
                vehicleInfo: `Looking for: ${item.customBrand || item.vehicleBrand || ""} ${item.customModel || item.vehicleModel || ""}`,
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
        ].filter(lead => !claimedLeadIds.has(lead._id)) // Remove already-claimed leads

        console.log(`[Personal Marketplace] Leads with status "approved": ${allLeads.length} (partner: ${partnerId}, already claimed: ${claimedLeadIds.size})`)

        if (allLeads.length === 0) {
            return NextResponse.json({ leads: [], ccs, rvsfLocation: { city: partnerUser.city, state: partnerUser.state, pincode: partnerUser.pincode } })
        }

        const leadLocations = allLeads.map(l => {
            if (l.pincode) return `${l.city}, ${l.state} ${l.pincode}, India`
            return `${l.city}, ${l.state}, India`
        })

        if (mode === "coverage") {
            if (ccs.length === 0) {
                return NextResponse.json({
                    leads: [],
                    ccs,
                    rvsfLocation: { city: partnerUser.city, state: partnerUser.state, pincode: partnerUser.pincode },
                    message: "No Collection Centers found. Please add CCs first."
                })
            }

            const ccLocations = ccs.map(cc => {
                if (cc.pincode) return `${cc.city}, ${cc.state} ${cc.pincode}, India`
                return `${cc.city}, ${cc.state}, India`
            })

            const allDistances = await calculateDistances(ccLocations, leadLocations)
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

            filteredLeads.sort((a, b) => a.distanceKm - b.distanceKm)

            return NextResponse.json({
                leads: filteredLeads,
                ccs,
                rvsfLocation: { city: partnerUser.city, state: partnerUser.state, pincode: partnerUser.pincode },
            })

        } else {
            const maxRadius = parseInt(radiusParam || "200", 10)
            const rvsfLocationStr = `${partnerUser.city || ""}, ${partnerUser.state || ""} ${partnerUser.pincode || ""}, India`

            const filteredLeads: any[] = []
            const distMatrix = await calculateDistances([rvsfLocationStr], leadLocations)
            const allDists = distMatrix[0] || []

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
                rvsfLocation: { city: partnerUser.city, state: partnerUser.state, pincode: partnerUser.pincode },
            })
        }

    } catch (error: any) {
        console.error("[Personal Marketplace API] Error:", error)
        return NextResponse.json({ message: error.message || "Internal server error" }, { status: 500 })
    }
}

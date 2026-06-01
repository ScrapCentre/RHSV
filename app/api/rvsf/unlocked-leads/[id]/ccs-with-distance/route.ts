import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import connectToDatabase from "@/lib/db"
import UnlockedLead from "@/models/UnlockedLead"
import CollectionCenter from "@/models/CollectionCenter"
import ExchangeVehicle from "@/models/ExchangeVehicle"
import BuyVehicle from "@/models/BuyVehicle"
import WizardLead from "@/models/WizardLead"

// Haversine formula (km)
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
        geocodeCache[address] = null
        return null
    }
}

async function calculateDistance(origin: string, destination: string): Promise<number> {
    const apiKey = process.env.GOOGLE_MAPS_API_KEY
    if (apiKey) {
        try {
            const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${encodeURIComponent(origin)}&destinations=${encodeURIComponent(destination)}&units=metric&key=${apiKey}`
            const res = await fetch(url)
            const data = await res.json()
            if (data.status === "OK" && data.rows?.[0]?.elements?.[0]?.status === "OK") {
                return Math.round(data.rows[0].elements[0].distance.value / 1000)
            }
        } catch (err) {
            console.error("Distance matrix error:", err)
        }
    }
    const originGeo = await geocodeLocation(origin)
    const destGeo = await geocodeLocation(destination)
    if (originGeo && destGeo) {
        return Math.round(haversineKm(originGeo.lat, originGeo.lng, destGeo.lat, destGeo.lng))
    }
    const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '')
    if (normalize(origin) === normalize(destination)) return 0
    const oWords = origin.toLowerCase().split(/[,\s]+/)
    const dWords = destination.toLowerCase().split(/[,\s]+/)
    if (oWords[0] && dWords.includes(oWords[0])) return 10
    return -1
}

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions)
        if (!session || (session.user as any)?.role !== "rvsf") {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
        }

        const rvsfId = (session.user as any)?.rvsfId
        if (!rvsfId) {
            return NextResponse.json({ message: "RVSF ID not found in session" }, { status: 403 })
        }

        const resolvedParams = await params
        const unlockedLeadId = resolvedParams.id

        await connectToDatabase()

        // 1. Fetch the unlocked lead
        const lead = await UnlockedLead.findOne({ _id: unlockedLeadId, rvsfId }).lean() as any
        if (!lead) {
            return NextResponse.json({ message: "Unlocked lead not found" }, { status: 404 })
        }

        // 2. Fetch the original lead details to get address info
        let leadAddressStr = ""
        const leadId = lead.leadId
        const leadSource = lead.leadSource

        if (leadSource === "ExchangeVehicle") {
            const original = await ExchangeVehicle.findById(leadId).lean() as any
            if (original) {
                leadAddressStr = `${original.city || ""}, ${original.state || ""} ${original.pincode || ""}`.trim()
            }
        } else if (leadSource === "BuyVehicle") {
            const original = await BuyVehicle.findById(leadId).lean() as any
            if (original) {
                leadAddressStr = `${original.city || ""}, ${original.state || ""} ${original.pincode || ""}`.trim()
            }
        } else if (leadSource === "WizardLead" || leadSource === "Valuation") {
            const original = await WizardLead.findById(leadId).lean() as any
            if (original) {
                leadAddressStr = `${original.city || ""}, ${original.state || ""} ${original.pincode || ""}`.trim()
            }
        }

        // Fallback if lead location string is completely empty
        if (!leadAddressStr) {
            leadAddressStr = "India"
        }

        // 3. Fetch all Collection Centers for this RVSF
        const ccs = await CollectionCenter.find({ rvsfId }).lean() as any[]

        // 4. Calculate distances
        const ccsWithDistance = await Promise.all(
            ccs.map(async (cc) => {
                const ccAddressStr = `${cc.city || ""}, ${cc.state || ""} ${cc.pincode || ""}`.trim()
                const distanceKm = await calculateDistance(ccAddressStr, leadAddressStr)
                return {
                    _id: cc._id.toString(),
                    name: cc.name,
                    city: cc.city,
                    state: cc.state,
                    pincode: cc.pincode,
                    catchmentRadius: cc.catchmentRadius,
                    distanceKm: distanceKm >= 0 ? distanceKm : null
                }
            })
        )

        // Sort by distance (putting null at the end)
        ccsWithDistance.sort((a, b) => {
            if (a.distanceKm === null) return 1
            if (b.distanceKm === null) return -1
            return a.distanceKm - b.distanceKm
        })

        return NextResponse.json({ ccs: ccsWithDistance })
    } catch (error: any) {
        console.error("Error in ccs-with-distance GET:", error)
        return NextResponse.json({ message: error.message || "Internal server error" }, { status: 500 })
    }
}

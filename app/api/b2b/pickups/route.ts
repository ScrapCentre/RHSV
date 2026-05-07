import { NextResponse } from "next/server"
import connectToDatabase from "@/lib/db"
import B2BPickup from "@/models/B2BPickup"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import Valuation from "@/models/Valuation"
import SellVehicle from "@/models/SellVehicle"
import ExchangeVehicle from "@/models/ExchangeVehicle"
import BuyVehicle from "@/models/BuyVehicle"

// POST: Accept a lead from market feed → create a pickup
export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions)

        if (!session || (session.user as any)?.role !== "partner") {
            return NextResponse.json({ message: "Unauthorized: Partner access required" }, { status: 403 })
        }

        const body = await req.json()
        const { leadId, leadType, leadSnapshot } = body

        if (!leadId || !leadType) {
            return NextResponse.json({ message: "leadId and leadType are required" }, { status: 400 })
        }

        await connectToDatabase()

        // Prevent duplicate acceptances by same partner
        const existing = await B2BPickup.findOne({
            partnerId: (session.user as any).id || session.user?.email,
            leadId
        })

        if (existing) {
            return NextResponse.json({ message: "You have already accepted this lead." }, { status: 409 })
        }

        const snapshot = leadSnapshot || {}

        const pickup = await B2BPickup.create({
            partnerId: (session.user as any).id || session.user?.email,
            partnerName: session.user?.name || session.user?.email,
            leadId,
            leadType,
            customerName: snapshot.contact?.name || snapshot.name || snapshot.customerName || "N/A",
            customerPhone: snapshot.contact?.phone || snapshot.phone || snapshot.customerPhone || "N/A",
            vehicleInfo: snapshot.brand
                ? `${snapshot.registrationYear || snapshot.year || ''} ${snapshot.brand} ${snapshot.model || ''}`.trim()
                : snapshot.vehicleInfo || "N/A",
            city: snapshot.address?.city || snapshot.city || "N/A",
            state: snapshot.address?.state || snapshot.state || "N/A",
            pincode: snapshot.address?.pincode || snapshot.pincode || "N/A",
            status: "accepted",
            leadSnapshot: snapshot,
        })

        // Update the original lead
        let model
        switch (leadType) {
            case "quote":
            case "valuation":
                model = Valuation
                break
            case "sell":
                model = SellVehicle
                break
            case "exchange":
                model = ExchangeVehicle
                break
            case "buy":
                model = BuyVehicle
                break
        }

        if (model) {
            await model.findByIdAndUpdate(leadId, {
                status: "pickup_scheduled",
                b2bPickupId: pickup._id,
                b2bPartnerId: (session.user as any).id || session.user?.email
            })
        }

        return NextResponse.json({ success: true, pickup }, { status: 201 })
    } catch (error: any) {
        console.error("B2B Accept API Error:", error)
        return NextResponse.json({ message: "Internal server error", error: error.message }, { status: 500 })
    }
}

// GET: Fetch all pickups for the logged-in partner
export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions)

        if (!session || (session.user as any)?.role !== "partner") {
            return NextResponse.json({ message: "Unauthorized: Partner access required" }, { status: 403 })
        }

        await connectToDatabase()

        const pickups = await B2BPickup.find({
            partnerId: (session.user as any).id || session.user?.email
        }).sort({ createdAt: -1 }).lean()

        return NextResponse.json({ success: true, data: pickups }, { status: 200 })
    } catch (error: any) {
        console.error("B2B Pickups GET Error:", error)
        return NextResponse.json({ message: "Internal server error", error: error.message }, { status: 500 })
    }
}

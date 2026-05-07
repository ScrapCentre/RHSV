import { NextResponse } from "next/server"
import connectToDatabase from "@/lib/db"
import B2BPickup from "@/models/B2BPickup"
import Valuation from "@/models/Valuation"
import SellVehicle from "@/models/SellVehicle"
import ExchangeVehicle from "@/models/ExchangeVehicle"
import BuyVehicle from "@/models/BuyVehicle"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function POST(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions)

        if (!session || (session.user as any)?.role !== "partner") {
            return NextResponse.json({ message: "Unauthorized: Partner access required" }, { status: 403 })
        }

        const pickupId = params.id
        const body = await req.json()
        const { status } = body

        if (!pickupId || !status) {
            return NextResponse.json({ message: "pickupId and status are required" }, { status: 400 })
        }

        await connectToDatabase()

        // 1. Update the B2BPickup document
        const pickup = await B2BPickup.findOneAndUpdate(
            { _id: pickupId, partnerId: (session.user as any).id || session.user?.email },
            { status: status },
            { new: true }
        )

        if (!pickup) {
            return NextResponse.json({ message: "Pickup not found or unauthorized" }, { status: 404 })
        }

        // 2. If the status is 'picked_up', update the original lead to 'reached_collection_centre'
        if (status === 'picked_up') {
            let model
            switch (pickup.leadType) {
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
                await model.findByIdAndUpdate(pickup.leadId, {
                    status: "reached_collection_centre"
                })
            }
        }

        return NextResponse.json({ success: true, pickup }, { status: 200 })
    } catch (error: any) {
        console.error("B2B Pickup Status Update Error:", error)
        return NextResponse.json({ message: "Internal server error", error: error.message }, { status: 500 })
    }
}

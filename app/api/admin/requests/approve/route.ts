import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import connectToDatabase from "@/lib/db"
import Valuation from "@/models/Valuation"
import SellVehicle from "@/models/SellVehicle"
import ExchangeVehicle from "@/models/ExchangeVehicle"
import BuyVehicle from "@/models/BuyVehicle"

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions)

        if (!session || (session.user as any).role !== "admin") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const { id, type, status = "approved" } = await req.json()

        if (!id || !type) {
            return NextResponse.json({ error: "Missing id or type" }, { status: 400 })
        }

        await connectToDatabase()

        let model
        switch (type) {
            case "quote":
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
            default:
                return NextResponse.json({ error: "Invalid type" }, { status: 400 })
        }

        const updated = await model.findByIdAndUpdate(
            id,
            { status },
            { new: true }
        )

        if (!updated) {
            return NextResponse.json({ error: "Request not found" }, { status: 404 })
        }

        return NextResponse.json({ success: true, data: updated })
    } catch (error) {
        console.error("Error approving request:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}


import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import connectToDatabase from "@/lib/db"
import Valuation from "@/models/Valuation"
import SellVehicle from "@/models/SellVehicle"
import ExchangeVehicle from "@/models/ExchangeVehicle"
import BuyVehicle from "@/models/BuyVehicle"

export async function DELETE(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions)

        if (!session || (session.user as any).role !== "admin") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const { searchParams } = new URL(req.url)
        const id = searchParams.get("id")
        const type = searchParams.get("type")

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

        const deleted = await model.findByIdAndDelete(id)

        if (!deleted) {
            return NextResponse.json({ error: "Request not found" }, { status: 404 })
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("Error deleting request:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}


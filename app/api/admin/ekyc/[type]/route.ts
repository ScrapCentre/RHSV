// engineering-design.md §11 / 07-tech-debt HIGH — admin session check added
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import connectToDatabase from "@/lib/db"
import SellVehicle from "@/models/SellVehicle"
import Valuation from "@/models/Valuation"
import ExchangeVehicle from "@/models/ExchangeVehicle"

export async function GET(
    request: Request,
    { params }: { params: Promise<{ type: string }> }
) {
    // Admin-only — mirrors the auth check in view/[type]/[id]/route.ts
    const session = await getServerSession(authOptions)
    if (!session || (session.user as any).role !== "admin") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    try {
        await connectToDatabase()

        const { type } = await params
        const validTypes = ["sell", "valuation", "exchange"]

        if (!validTypes.includes(type)) {
            return NextResponse.json({ error: "Invalid document type" }, { status: 400 })
        }

        let Model: typeof SellVehicle | typeof Valuation | typeof ExchangeVehicle
        switch (type) {
            case "sell":      Model = SellVehicle;     break
            case "valuation": Model = Valuation;       break
            case "exchange":  Model = ExchangeVehicle; break
            default:          Model = Valuation
        }

        const documents = await Model.find({
            aadharFile: { $exists: true, $ne: null }
        }).sort({ updatedAt: -1 })

        return NextResponse.json(documents)
    } catch (error) {
        console.error("Error fetching eKYC documents:", (error as any)?.message)
        return NextResponse.json(
            { error: "Failed to fetch eKYC documents" },
            { status: 500 }
        )
    }
}

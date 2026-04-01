import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import connectToDatabase from "@/lib/db"
import Valuation from "@/models/Valuation"
import SellVehicle from "@/models/SellVehicle"
import ExchangeVehicle from "@/models/ExchangeVehicle"

export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions)

        if (!session || (session.user as any).role !== "admin") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const { searchParams } = new URL(req.url)
        const filename = searchParams.get("file")

        if (!filename) {
            return NextResponse.json({ error: "Missing filename" }, { status: 400 })
        }

        await connectToDatabase()

        // Search across all vehicle models
        const models = [Valuation, SellVehicle, ExchangeVehicle]
        const fields = ["aadharFile", "rcFile", "carPhoto"]

        for (const Model of models) {
            for (const field of fields) {
                const doc = await Model.findOne({ [field]: { $regex: filename, $options: "i" } })
                if (doc && doc[field]) {
                    return NextResponse.json({ fileUrl: doc[field] })
                }
            }
        }

        return NextResponse.json({ error: "File not found" }, { status: 404 })
    } catch (error) {
        console.error("Error searching for file:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}

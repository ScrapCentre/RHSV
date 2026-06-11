import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import connectToDatabase from "@/lib/db"
import ExchangeVehicle from "@/models/ExchangeVehicle"
import BuyVehicle from "@/models/BuyVehicle"
import WizardLead from "@/models/WizardLead"

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions)

        const allowedRoles = ["admin", "executive"]
        if (!session || !allowedRoles.includes((session.user as any).role)) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const { id, type, carPhoto } = await req.json()

        if (!id || !type || !carPhoto) {
            return NextResponse.json({ error: "Missing id, type, or carPhoto" }, { status: 400 })
        }

        await connectToDatabase()

        let updated = null

        if (type === "scrap-buy") {
            updated = await WizardLead.findByIdAndUpdate(id, { carPhoto }, { new: true })
        } else if (type === "exchange") {
            updated = await ExchangeVehicle.findByIdAndUpdate(id, { carPhoto }, { new: true })
        } else if (type === "quote") {
            updated = await WizardLead.findByIdAndUpdate(id, { carPhoto }, { new: true })
        } else if (type === "buy") {
            updated = await BuyVehicle.findByIdAndUpdate(id, { carPhoto }, { new: true })
            if (!updated) {
                updated = await WizardLead.findByIdAndUpdate(id, { carPhoto }, { new: true })
            }
        }

        if (!updated) {
            return NextResponse.json({ error: "Request not found in any matching collection" }, { status: 404 })
        }

        return NextResponse.json({ success: true, data: updated })
    } catch (error) {
        console.error("Error updating vehicle photo:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}

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

        const { id, type, status = "approved" } = await req.json()

        if (!id || !type) {
            return NextResponse.json({ error: "Missing id or type" }, { status: 400 })
        }

        await connectToDatabase()

        let updated = null;

        // Smart model selection
        if (type === "scrap-buy") {
            updated = await WizardLead.findByIdAndUpdate(id, { status }, { new: true });
        } else if (type === "exchange") {
            updated = await ExchangeVehicle.findByIdAndUpdate(id, { status }, { new: true });
        } else if (type === "quote") {
            // Check WizardLead (scrap_only)
            updated = await WizardLead.findByIdAndUpdate(id, { status }, { new: true });

        } else if (type === "buy") {
            // Check legacy BuyVehicle first, then WizardLead (buy)
            updated = await BuyVehicle.findByIdAndUpdate(id, { status }, { new: true });
            if (!updated) {
                updated = await WizardLead.findByIdAndUpdate(id, { status }, { new: true });
            }
        }

        if (!updated) {
            return NextResponse.json({ error: "Request not found in any matching collection" }, { status: 404 })
        }

        return NextResponse.json({ success: true, data: updated })
    } catch (error) {
        console.error("Error approving request:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}


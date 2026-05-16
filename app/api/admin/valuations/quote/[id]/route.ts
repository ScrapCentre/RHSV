import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import connectToDatabase from "@/lib/db"
import Valuation from "@/models/Valuation"
import WizardLead from "@/models/WizardLead"

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions)

        const allowedRoles = ["admin", "executive"]
        if (!session || !allowedRoles.includes((session.user as any).role)) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        await connectToDatabase()
        const resolvedParams = await params
        let valuation = await Valuation.findById(resolvedParams.id).lean()

        if (!valuation) {
            const wizardLead = await WizardLead.findById(resolvedParams.id).lean()
            if (wizardLead) {
                valuation = {
                    _id: wizardLead._id,
                    status: wizardLead.status || "pending",
                    vehicleType: "Car", // Default assumption for wizard leads right now
                    brand: wizardLead.brand,
                    model: wizardLead.model,
                    year: wizardLead.year,
                    vehicleNumber: wizardLead.regNo || "N/A",
                    vehicleWeight: wizardLead.weight,
                    contact: {
                        name: wizardLead.name,
                        phone: wizardLead.phone
                    },
                    address: {
                        pincode: wizardLead.pincode
                    },
                    createdAt: wizardLead.createdAt,
                    updatedAt: wizardLead.updatedAt
                } as any
            }
        }

        if (!valuation) {
            return NextResponse.json({ error: "Request not found" }, { status: 404 })
        }

        return NextResponse.json(valuation)
    } catch (error) {
        console.error("Error fetching valuation:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}

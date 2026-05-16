import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import connectToDatabase from "@/lib/db"
import SellVehicle from "@/models/SellVehicle"
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
        let request = await SellVehicle.findById(resolvedParams.id).lean()

        if (!request) {
            const wizardLead = await WizardLead.findById(resolvedParams.id).lean()
            if (wizardLead) {
                request = {
                    _id: wizardLead._id,
                    status: wizardLead.status || "pending",
                    registrationNumber: wizardLead.regNo || "N/A",
                    brand: wizardLead.brand,
                    model: wizardLead.model,
                    registrationYear: wizardLead.year,
                    fuelType: wizardLead.fuel && wizardLead.fuel.length > 0 ? wizardLead.fuel.join(', ') : "N/A",
                    name: wizardLead.name,
                    phone: wizardLead.phone,
                    pincode: wizardLead.pincode,
                    pendingLoan: "no", // Default assumption for wizard leads right now
                    createdAt: wizardLead.createdAt,
                    updatedAt: wizardLead.updatedAt
                } as any
            }
        }

        if (!request) {
            return NextResponse.json({ error: "Request not found" }, { status: 404 })
        }

        return NextResponse.json(request)
    } catch (error) {
        console.error("Error fetching sell request:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}

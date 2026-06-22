import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import connectToDatabase from "@/lib/db"
import ExchangeVehicle from "@/models/ExchangeVehicle"
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
        const cleanId = String(resolvedParams.id).trim()

        let request = await ExchangeVehicle.findById(cleanId).lean()

        if (request) {
            if (request.status === "pending") {
                await ExchangeVehicle.findByIdAndUpdate(cleanId, { status: "reviewing" })
                request.status = "reviewing"
            }
        } else {
            const wizardLead = await WizardLead.findById(cleanId).lean()
            if (wizardLead) {
                if (wizardLead.status === "pending") {
                    await WizardLead.findByIdAndUpdate(cleanId, { status: "reviewing" })
                    wizardLead.status = "reviewing"
                }
                request = {
                    _id: wizardLead._id,
                    status: wizardLead.status || "reviewing",
                    oldVehicleRegistration: wizardLead.regNo || "N/A",
                    oldVehicleBrand: wizardLead.brand || "N/A",
                    oldVehicleModel: wizardLead.model || "N/A",
                    oldVehicleYear: wizardLead.year || "N/A",
                    oldVehicleFuelType: wizardLead.fuel?.join(", ") || "N/A",
                    newVehicleBrand: wizardLead.desiredCompany || "N/A",
                    newVehicleModel: wizardLead.desiredModel || "N/A",
                    customerName: wizardLead.name,
                    customerPhone: wizardLead.phone,
                    state: wizardLead.state || "N/A",
                    city: wizardLead.city || "N/A",
                    pincode: wizardLead.pincode || "N/A",
                    aadharFile: wizardLead.aadharFile,
                    rcFile: wizardLead.rcFile,
                    carPhoto: wizardLead.carPhoto,
                    additionalPhotos: wizardLead.additionalPhotos,
                    photoFront: wizardLead.photoFront,
                    photoBack: wizardLead.photoBack,
                    photoLeft: wizardLead.photoLeft,
                    photoRight: wizardLead.photoRight,
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
        console.error("Error fetching exchange request:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}

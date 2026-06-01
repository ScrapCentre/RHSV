import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import connectToDatabase from "@/lib/db"
import BuyVehicle from "@/models/BuyVehicle"
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
        const idParam = resolvedParams?.id || (params as any)?.id
        const cleanId = idParam ? String(idParam).trim() : ""

        if (!cleanId || !/^[0-9a-fA-F]{24}$/.test(cleanId)) {
            console.warn("[API/BUY] Invalid ID format:", cleanId)
            return NextResponse.json({ 
                error: "Request not found",
                debug: { requestedId: cleanId, reason: "Invalid ObjectId format" }
            }, { status: 404 })
        }

        console.log("[API/BUY] ID requested:", cleanId)
        let request = await BuyVehicle.findById(cleanId).lean()

        if (request) {
            if (request.status === "pending") {
                await BuyVehicle.findByIdAndUpdate(cleanId, { status: "reviewing" })
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
                    vehicleBrand: wizardLead.desiredCompany || "N/A",
                    vehicleModel: wizardLead.desiredModel || "N/A",
                    fuelType: "N/A",
                    budgetRange: "N/A",
                    customerName: wizardLead.name,
                    customerPhone: wizardLead.phone,
                    customerEmail: "N/A",
                    pincode: wizardLead.pincode,
                    city: wizardLead.city,
                    state: wizardLead.state,
                    createdAt: wizardLead.createdAt,
                    updatedAt: wizardLead.updatedAt
                } as any
            }
        }

        if (!request) {
            return NextResponse.json({ 
                error: "Request not found",
                debug: {
                    requestedId: resolvedParams?.id || (params as any)?.id,
                    paramsType: typeof params,
                    hasIdInParams: !!(params as any)?.id,
                    resolvedParams: resolvedParams
                }
            }, { status: 404 })
        }

        return NextResponse.json(request)
    } catch (error) {
        console.error("Error fetching buy request:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}

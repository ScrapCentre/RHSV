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
        const idParam = resolvedParams?.id || (params as any)?.id
        const cleanId = idParam ? String(idParam).trim() : ""

        if (!cleanId || !/^[0-9a-fA-F]{24}$/.test(cleanId)) {
            console.warn("[API/SELL] Invalid ID format:", cleanId)
            return NextResponse.json({ 
                error: "Request not found",
                debug: { requestedId: cleanId, reason: "Invalid ObjectId format" }
            }, { status: 404 })
        }

        console.log("[API/SELL] ID requested:", cleanId)
        let request = await SellVehicle.findById(cleanId).lean()

        if (request) {
            if (request.status === "pending") {
                await SellVehicle.findByIdAndUpdate(cleanId, { status: "reviewing" })
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
        console.error("Error fetching sell request:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}

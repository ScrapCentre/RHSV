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

export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions)

        if (!session || (session.user as any).role !== "admin") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        await connectToDatabase()
        const resolvedParams = await params
        const cleanId = String(resolvedParams.id).trim()

        if (!cleanId || !/^[0-9a-fA-F]{24}$/.test(cleanId)) {
            return NextResponse.json({ error: "Invalid ID format" }, { status: 400 })
        }

        const body = await req.json()

        let buy = await BuyVehicle.findById(cleanId)
        if (buy) {
            const updateFields: any = {}
            if (body.vehicleBrand !== undefined) updateFields.vehicleBrand = body.vehicleBrand
            if (body.customBrand !== undefined) updateFields.customBrand = body.customBrand
            if (body.vehicleModel !== undefined) updateFields.vehicleModel = body.vehicleModel
            if (body.customModel !== undefined) updateFields.customModel = body.customModel
            if (body.fuelType !== undefined) updateFields.fuelType = body.fuelType
            if (body.budgetRange !== undefined) updateFields.budgetRange = body.budgetRange
            if (body.customerName !== undefined) updateFields.customerName = body.customerName
            if (body.customerPhone !== undefined) updateFields.customerPhone = body.customerPhone
            if (body.customerEmail !== undefined) updateFields.customerEmail = body.customerEmail
            if (body.pincode !== undefined) updateFields.pincode = body.pincode
            if (body.city !== undefined) updateFields.city = body.city
            if (body.customCity !== undefined) updateFields.customCity = body.customCity
            if (body.state !== undefined) updateFields.state = body.state

            const updatedBuy = await BuyVehicle.findByIdAndUpdate(
                cleanId,
                { $set: updateFields },
                { new: true }
            )
            return NextResponse.json({ success: true, request: updatedBuy })
        } else {
            // Fallback: update in WizardLead
            const updateFields: any = {}
            if (body.vehicleBrand !== undefined) updateFields.desiredCompany = body.vehicleBrand
            if (body.vehicleModel !== undefined) updateFields.desiredModel = body.vehicleModel
            if (body.customerName !== undefined) updateFields.name = body.customerName
            if (body.customerPhone !== undefined) updateFields.phone = body.customerPhone
            if (body.pincode !== undefined) updateFields.pincode = body.pincode
            if (body.city !== undefined) updateFields.city = body.city
            if (body.state !== undefined) updateFields.state = body.state

            const updatedWizard = await WizardLead.findByIdAndUpdate(
                cleanId,
                { $set: updateFields },
                { new: true }
            )
            if (!updatedWizard) {
                return NextResponse.json({ error: "Request not found" }, { status: 404 })
            }
            return NextResponse.json({ success: true, request: updatedWizard })
        }
    } catch (error) {
        console.error("Error updating buy request:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}

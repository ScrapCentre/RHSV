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

        let exchange = await ExchangeVehicle.findById(cleanId)
        if (exchange) {
            const updateFields: any = {}
            if (body.oldVehicleRegistration !== undefined) updateFields.oldVehicleRegistration = body.oldVehicleRegistration
            if (body.oldVehicleBrand !== undefined) updateFields.oldVehicleBrand = body.oldVehicleBrand
            if (body.oldVehicleModel !== undefined) updateFields.oldVehicleModel = body.oldVehicleModel
            if (body.oldVehicleYear !== undefined) updateFields.oldVehicleYear = body.oldVehicleYear
            if (body.oldVehicleFuelType !== undefined) updateFields.oldVehicleFuelType = body.oldVehicleFuelType
            if (body.newVehicleBrand !== undefined) updateFields.newVehicleBrand = body.newVehicleBrand
            if (body.newVehicleModel !== undefined) updateFields.newVehicleModel = body.newVehicleModel
            if (body.customerName !== undefined) updateFields.customerName = body.customerName
            if (body.customerPhone !== undefined) updateFields.customerPhone = body.customerPhone
            if (body.state !== undefined) updateFields.state = body.state
            if (body.city !== undefined) updateFields.city = body.city
            if (body.customCity !== undefined) updateFields.customCity = body.customCity
            if (body.pincode !== undefined) updateFields.pincode = body.pincode

            const updatedExchange = await ExchangeVehicle.findByIdAndUpdate(
                cleanId,
                { $set: updateFields },
                { new: true }
            )
            return NextResponse.json({ success: true, request: updatedExchange })
        } else {
            // Fallback: update in WizardLead
            const updateFields: any = {}
            if (body.oldVehicleRegistration !== undefined) updateFields.regNo = body.oldVehicleRegistration
            if (body.oldVehicleBrand !== undefined) updateFields.brand = body.oldVehicleBrand
            if (body.oldVehicleModel !== undefined) updateFields.model = body.oldVehicleModel
            if (body.oldVehicleYear !== undefined) updateFields.year = body.oldVehicleYear
            if (body.oldVehicleFuelType !== undefined) {
                updateFields.fuel = body.oldVehicleFuelType.split(",").map((s: string) => s.trim())
            }
            if (body.newVehicleBrand !== undefined) updateFields.desiredCompany = body.newVehicleBrand
            if (body.newVehicleModel !== undefined) updateFields.desiredModel = body.newVehicleModel
            if (body.customerName !== undefined) updateFields.name = body.customerName
            if (body.customerPhone !== undefined) updateFields.phone = body.customerPhone
            if (body.state !== undefined) updateFields.state = body.state
            if (body.city !== undefined) updateFields.city = body.city
            if (body.pincode !== undefined) updateFields.pincode = body.pincode

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
        console.error("Error updating exchange request:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}

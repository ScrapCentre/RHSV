import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import connectToDatabase from "@/lib/db"
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
            console.warn("[API/QUOTE] Invalid ID format:", cleanId)
            return NextResponse.json({ 
                error: "Request not found",
                debug: { requestedId: cleanId, reason: "Invalid ObjectId format" }
            }, { status: 404 })
        }

        console.log("[API/QUOTE] ID requested:", cleanId)
        let valuation = null
        const wizardLead = await WizardLead.findById(cleanId).lean()
        if (wizardLead) {
            if (wizardLead.status === "pending") {
                await WizardLead.findByIdAndUpdate(cleanId, { status: "reviewing" })
                wizardLead.status = "reviewing"
            }
            valuation = {
                _id: wizardLead._id,
                status: wizardLead.status || "reviewing",
                vehicleType: "Car", // Default assumption for wizard leads right now
                brand: wizardLead.brand,
                model: wizardLead.model,
                year: wizardLead.year,
                vehicleNumber: wizardLead.regNo || "N/A",
                vehicleWeight: wizardLead.weight,
                ownerName: wizardLead.ownerName,
                fuelType: Array.isArray(wizardLead.fuel) ? wizardLead.fuel.join(", ") : (wizardLead.fuel || "N/A"),
                contact: {
                    name: wizardLead.name,
                    phone: wizardLead.phone
                },
                address: {
                    pincode: wizardLead.pincode,
                    city: wizardLead.city,
                    state: wizardLead.state,
                    street: wizardLead.address
                },
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

        if (!valuation) {
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

        return NextResponse.json(valuation)
    } catch (error) {
        console.error("Error fetching valuation:", error)
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
        const idParam = resolvedParams?.id || (params as any)?.id
        const cleanId = idParam ? String(idParam).trim() : ""

        if (!cleanId || !/^[0-9a-fA-F]{24}$/.test(cleanId)) {
            return NextResponse.json({ error: "Invalid lead ID format" }, { status: 400 })
        }

        const body = await req.json()
        
        const updateFields: any = {}
        if (body.brand !== undefined) updateFields.brand = body.brand
        if (body.model !== undefined) updateFields.model = body.model
        if (body.year !== undefined) updateFields.year = body.year
        if (body.vehicleNumber !== undefined) updateFields.regNo = body.vehicleNumber
        if (body.vehicleWeight !== undefined) updateFields.weight = body.vehicleWeight
        
        if (body.contact) {
            if (body.contact.name !== undefined) updateFields.name = body.contact.name
            if (body.contact.phone !== undefined) updateFields.phone = body.contact.phone
        }
        if (body.address) {
            if (body.address.pincode !== undefined) updateFields.pincode = body.address.pincode
            if (body.address.city !== undefined) updateFields.city = body.address.city
            if (body.address.state !== undefined) updateFields.state = body.address.state
        }

        const updatedLead = await WizardLead.findByIdAndUpdate(
            cleanId,
            { $set: updateFields },
            { new: true }
        )

        if (!updatedLead) {
            return NextResponse.json({ error: "Lead not found" }, { status: 404 })
        }

        return NextResponse.json({ success: true, lead: updatedLead })
    } catch (error) {
        console.error("Error updating quote lead:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}

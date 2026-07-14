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
            console.warn("[API/SCRAP-BUY] Invalid ID format:", cleanId)
            return NextResponse.json({ 
                error: "Request not found",
                debug: { requestedId: cleanId, reason: "Invalid ObjectId format" }
            }, { status: 404 })
        }

        console.log("[API/SCRAP-BUY] ID requested:", cleanId)
        let wizardLead = await WizardLead.findById(cleanId).lean() as any

        if (!wizardLead) {
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

        if (wizardLead.status === "pending") {
            await WizardLead.findByIdAndUpdate(cleanId, { status: "reviewing" })
            wizardLead.status = "reviewing"
        }

        // Return the raw WizardLead data with compatibility keys so the detail page can render both scrap + buy sections
        const responseData = {
            ...wizardLead,
            registrationNo: wizardLead.regNo || "N/A",
            fuelType: Array.isArray(wizardLead.fuel) ? wizardLead.fuel.join(", ") : (wizardLead.fuel || "N/A"),
            streetAddress: wizardLead.address || ""
        };
        return NextResponse.json(responseData)
    } catch (error) {
        console.error("Error fetching scrap-buy lead:", error)
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

        const updateFields: any = {}
        if (body.regNo !== undefined) updateFields.regNo = body.regNo
        if (body.brand !== undefined) updateFields.brand = body.brand
        if (body.model !== undefined) updateFields.model = body.model
        if (body.year !== undefined) updateFields.year = body.year
        if (body.weight !== undefined) updateFields.weight = body.weight
        if (body.fuel !== undefined) {
            let fuel = body.fuel
            if (typeof fuel === "string") {
                fuel = fuel.split(",").map((f: string) => f.trim())
            }
            updateFields.fuel = fuel
        }
        if (body.desiredCompany !== undefined) updateFields.desiredCompany = body.desiredCompany
        if (body.desiredModel !== undefined) updateFields.desiredModel = body.desiredModel
        if (body.name !== undefined) updateFields.name = body.name
        if (body.phone !== undefined) updateFields.phone = body.phone
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

        return NextResponse.json({ success: true, lead: updatedWizard })
    } catch (error) {
        console.error("Error updating scrap-buy request:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}

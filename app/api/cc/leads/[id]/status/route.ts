import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import connectToDatabase from "@/lib/db"
import UnlockedLead from "@/models/UnlockedLead"

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions)
        if (!session || (session.user as any)?.role !== "cc_operator") {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
        }

        const ccId = (session.user as any)?.ccId
        if (!ccId) {
            return NextResponse.json({ message: "Collection Center ID not found in session" }, { status: 403 })
        }

        const resolvedParams = await params
        const leadId = resolvedParams.id

        const body = await request.json()
        const { pickupStatus } = body

        const validStatuses = ["Awaiting Pickup", "Vehicle Picked Up", "Vehicle at CC Yard", "Weighing Done"]
        if (!pickupStatus || !validStatuses.includes(pickupStatus)) {
            return NextResponse.json({ message: "Invalid pickup status" }, { status: 400 })
        }

        await connectToDatabase()

        // Find the lead assigned to this CC operator
        const lead = await UnlockedLead.findOne({ _id: leadId, assignedCcId: ccId })
        if (!lead) {
            return NextResponse.json({ message: "Lead not found or not assigned to your Collection Center" }, { status: 404 })
        }

        // Update the pickup status
        lead.pickupStatus = pickupStatus
        await lead.save()

        return NextResponse.json({
            message: "Pickup status updated successfully",
            pickupStatus: lead.pickupStatus
        })

    } catch (error: any) {
        console.error("Error in CC status update:", error)
        return NextResponse.json({ message: error.message || "Internal server error" }, { status: 500 })
    }
}

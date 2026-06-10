import { NextRequest, NextResponse } from "next/server"
import connectToDatabase from "@/lib/db"
import PersonalUnlockedLead from "@/models/PersonalUnlockedLead"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions)

        if (!session || (session.user as any)?.role !== "scrapcentre") {
            return NextResponse.json({ message: "Unauthorized: ScrapCentre access required" }, { status: 403 })
        }

        const { id } = await params
        if (!id) {
            return NextResponse.json({ message: "Lead ID is required" }, { status: 400 })
        }

        await connectToDatabase()

        // Find personal lead by ID
        const lead = await PersonalUnlockedLead.findById(id)
        if (!lead) {
            return NextResponse.json({ message: "Personal lead not found" }, { status: 404 })
        }

        if (lead.status !== "vehicle_picked_up") {
            return NextResponse.json({ message: "Lead must be in 'vehicle_picked_up' status to be marked as scraped" }, { status: 400 })
        }

        lead.status = "scraped_successfully"
        await lead.save()

        return NextResponse.json({
            success: true,
            message: "Personal lead marked as scraped successfully",
            status: lead.status
        })
    } catch (error: any) {
        console.error("ScrapCentre personal lead status update error:", error)
        return NextResponse.json({ message: "Internal server error", error: error.message }, { status: 500 })
    }
}

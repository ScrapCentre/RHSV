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
        const wizardLead = await WizardLead.findById(resolvedParams.id).lean() as any

        if (!wizardLead) {
            return NextResponse.json({ error: "Request not found" }, { status: 404 })
        }

        // Return the raw WizardLead data so the detail page can render both scrap + buy sections
        return NextResponse.json(wizardLead)
    } catch (error) {
        console.error("Error fetching scrap-buy lead:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}

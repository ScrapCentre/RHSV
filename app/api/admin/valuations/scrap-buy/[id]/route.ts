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

        // Return the raw WizardLead data so the detail page can render both scrap + buy sections
        return NextResponse.json(wizardLead)
    } catch (error) {
        console.error("Error fetching scrap-buy lead:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}

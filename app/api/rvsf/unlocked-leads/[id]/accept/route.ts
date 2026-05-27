import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import connectToDatabase from "@/lib/db"
import UnlockedLead from "@/models/UnlockedLead"

// ─── POST /api/rvsf/unlocked-leads/[id]/accept ─────────────────
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions)
        if (!session || (session.user as any)?.role !== "rvsf") {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
        }

        const rvsfId = (session.user as any)?.rvsfId
        if (!rvsfId) {
            return NextResponse.json({ message: "RVSF ID not found" }, { status: 403 })
        }

        const { id } = await params
        await connectToDatabase()

        const unlockedLead = await UnlockedLead.findOneAndUpdate(
            { _id: id, rvsfId, status: "pending_decision" },
            { $set: { status: "accepted" } },
            { new: true }
        )

        if (!unlockedLead) {
            return NextResponse.json(
                { message: "Lead not found or already processed" },
                { status: 404 }
            )
        }

        console.log(`[Accept] Lead ${unlockedLead.leadId} accepted by ${rvsfId}`)

        return NextResponse.json({
            success: true,
            message: "Lead accepted successfully!",
        })

    } catch (error: any) {
        console.error("[Accept API] Error:", error)
        return NextResponse.json({ message: error.message || "Internal server error" }, { status: 500 })
    }
}

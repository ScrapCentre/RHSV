import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import connectToDatabase from "@/lib/db"
import PersonalUnlockedLead from "@/models/PersonalUnlockedLead"
import ExchangeVehicle from "@/models/ExchangeVehicle"
import BuyVehicle from "@/models/BuyVehicle"
import WizardLead from "@/models/WizardLead"

const MODEL_MAP: Record<string, any> = {
    ExchangeVehicle,
    BuyVehicle,
    WizardLead,
}

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions)
        if (!session || (session.user as any)?.role !== "partner") {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
        }

        const partnerId = (session.user as any)?.partnerId
        if (!partnerId) {
            return NextResponse.json({ message: "Partner ID not found" }, { status: 403 })
        }

        const body = await request.json()
        const { rejectionReason } = body

        if (!rejectionReason || rejectionReason.trim().length === 0) {
            return NextResponse.json(
                { message: "Rejection reason is required" },
                { status: 400 }
            )
        }

        const { id } = await params
        await connectToDatabase()

        // 1. Update unlocked lead status to "rejected"
        const unlockedLead = await PersonalUnlockedLead.findOneAndUpdate(
            { _id: id, partnerId, status: "pending_decision" },
            {
                $set: {
                    status: "rejected",
                    rejectionReason: rejectionReason.trim(),
                },
            },
            { new: true }
        )

        if (!unlockedLead) {
            return NextResponse.json(
                { message: "Lead not found or already processed" },
                { status: 404 }
            )
        }

        // 2. Reset lead status back to "approved" in original collection
        const Model = MODEL_MAP[unlockedLead.leadSource]
        if (Model) {
            await Model.findByIdAndUpdate(unlockedLead.leadId, {
                $set: { status: "approved" },
                $unset: {
                    unlockedByPartnerId: "",
                    unlockedAt: "",
                },
            })
        }

        return NextResponse.json({
            success: true,
            message: "Lead rejected and returned to the marketplace successfully.",
        })

    } catch (error: any) {
        console.error("[Personal Reject API] Error:", error)
        return NextResponse.json({ message: error.message || "Internal server error" }, { status: 500 })
    }
}

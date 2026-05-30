import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import connectToDatabase from "@/lib/db"
import UnlockedLead from "@/models/UnlockedLead"
import RefundRequest from "@/models/RefundRequest"
import ExchangeVehicle from "@/models/ExchangeVehicle"
import BuyVehicle from "@/models/BuyVehicle"
import WizardLead from "@/models/WizardLead"

// ─── Model map ──────────────────────────────────────────────────
const MODEL_MAP: Record<string, any> = {
    ExchangeVehicle,
    BuyVehicle,
    WizardLead,
}

// ─── POST /api/rvsf/unlocked-leads/[id]/reject ─────────────────
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
        const unlockedLead = await UnlockedLead.findOneAndUpdate(
            { _id: id, rvsfId, status: "pending_decision" },
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

        // 2. Reset lead status back to "approved_to_rvsf" in original collection
        const Model = MODEL_MAP[unlockedLead.leadSource]
        if (Model) {
            await Model.findByIdAndUpdate(unlockedLead.leadId, {
                $set: { status: "approved_to_rvsf" },
                $unset: {
                    unlockedByRvsfId: "",
                    unlockedAt: "",
                    unlockPaymentId: "",
                },
            })
            console.log(`[Reject] Lead ${unlockedLead.leadId} returned to marketplace`)
        }

        // 3. Create refund request for admin review
        await RefundRequest.create({
            leadId: unlockedLead.leadId,
            rvsfId,
            amount: unlockedLead.amount,
            rejectionReason: rejectionReason.trim(),
            unlockPaymentId: unlockedLead.unlockPaymentId,
            razorpayOrderId: unlockedLead.razorpayOrderId,
            status: "pending_admin_review",
        })

        console.log(`[Reject] Lead ${unlockedLead.leadId} rejected by ${rvsfId}. Refund request created.`)

        return NextResponse.json({
            success: true,
            message: "Lead rejected. A refund request has been submitted for admin review.",
        })

    } catch (error: any) {
        console.error("[Reject API] Error:", error)
        return NextResponse.json({ message: error.message || "Internal server error" }, { status: 500 })
    }
}

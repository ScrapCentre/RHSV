import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import connectToDatabase from "@/lib/db"
import UnlockedLead from "@/models/UnlockedLead"
import ChatThread from "@/models/ChatThread"
import ExchangeVehicle from "@/models/ExchangeVehicle"
import BuyVehicle from "@/models/BuyVehicle"
import WizardLead from "@/models/WizardLead"

const MODEL_MAP: Record<string, any> = {
    ExchangeVehicle,
    BuyVehicle,
    WizardLead,
    Valuation: WizardLead
}

// ─── GET /api/rvsf/unlocked-leads ───────────────────────────────
// Fetch unlocked leads for the logged-in RVSF
export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        if (!session || (session.user as any)?.role !== "rvsf") {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
        }

        const rvsfId = (session.user as any)?.rvsfId
        if (!rvsfId) {
            return NextResponse.json({ message: "RVSF ID not found" }, { status: 403 })
        }

        await connectToDatabase()

        const { searchParams } = new URL(request.url)
        const statusFilter = searchParams.get("status") // "pending_decision", "accepted", or "all"

        const filter: any = { rvsfId }
        if (statusFilter && statusFilter !== "all") {
            filter.status = statusFilter
        }

        const leads = await UnlockedLead.find(filter)
            .sort({ unlockedAt: -1 })
            .lean()

        // Fetch matching chat thread IDs in bulk to avoid N+1 queries
        const leadIds = leads.map(l => l.leadId)
        const chatThreads = await ChatThread.find({
            rvsfId,
            leadId: { $in: leadIds }
        }).select("_id leadId").lean()

        const chatThreadMap: Record<string, string> = {}
        chatThreads.forEach((t: any) => {
            chatThreadMap[t.leadId] = t._id.toString()
        })

        // Enrich each lead with original vehicle details from the source model
        const leadsWithDetails = await Promise.all(leads.map(async (l: any) => {
            let originalDetails: any = null
            const Model = MODEL_MAP[l.leadSource]
            if (Model && l.leadId) {
                try {
                    originalDetails = await Model.findById(l.leadId).lean()
                } catch (err) {
                    console.error(`Error fetching original lead ${l.leadId}:`, err)
                }
            }
            return {
                ...l,
                chatThreadId: chatThreadMap[l.leadId] || null,
                regNo: originalDetails?.regNo || null,
                brand: originalDetails?.brand || null,
                model: originalDetails?.model || null,
                year: originalDetails?.year || null,
                fuel: originalDetails?.fuel || null,
                kms: originalDetails?.kms || null,
                weight: originalDetails?.weight || null,
                desiredCompany: originalDetails?.desiredCompany || null,
                desiredModel: originalDetails?.desiredModel || null,
            }
        }))

        return NextResponse.json({ leads: leadsWithDetails })

    } catch (error: any) {
        console.error("[Unlocked Leads GET] Error:", error)
        return NextResponse.json({ message: error.message || "Internal server error" }, { status: 500 })
    }
}

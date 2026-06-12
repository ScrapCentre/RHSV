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

        // Bulk fetch vehicle details from all three collections
        const exchangeIds = leads.filter(l => l.leadSource === "ExchangeVehicle" && l.leadId).map(l => l.leadId)
        const buyIds = leads.filter(l => l.leadSource === "BuyVehicle" && l.leadId).map(l => l.leadId)
        const wizardIds = leads.filter(l => (l.leadSource === "WizardLead" || l.leadSource === "Valuation") && l.leadId).map(l => l.leadId)

        const [exchanges, buys, wizards] = await Promise.all([
            exchangeIds.length ? ExchangeVehicle.find({ _id: { $in: exchangeIds } }).select("regNo brand model year fuel kms weight desiredCompany desiredModel carPhoto").lean() : [],
            buyIds.length ? BuyVehicle.find({ _id: { $in: buyIds } }).select("regNo brand model year fuel kms weight desiredCompany desiredModel carPhoto").lean() : [],
            wizardIds.length ? WizardLead.find({ _id: { $in: wizardIds } }).select("regNo brand model year fuel kms weight desiredCompany desiredModel carPhoto").lean() : []
        ])

        const detailsMap: Record<string, any> = {}
        const allDetails = [...exchanges, ...buys, ...wizards]
        allDetails.forEach((d: any) => {
            if (d && d._id) {
                detailsMap[d._id.toString()] = d
            }
        })

        // Enrich each lead with original vehicle details from the detailsMap
        const leadsWithDetails = leads.map((l: any) => {
            const originalDetails = l.leadId ? detailsMap[l.leadId.toString()] : null
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
                carPhoto: originalDetails?.carPhoto || null,
            }
        })

        return NextResponse.json({ leads: leadsWithDetails })

    } catch (error: any) {
        console.error("[Unlocked Leads GET] Error:", error)
        return NextResponse.json({ message: error.message || "Internal server error" }, { status: 500 })
    }
}

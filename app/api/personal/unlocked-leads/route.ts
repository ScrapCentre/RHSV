import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import connectToDatabase from "@/lib/db"
import PersonalUnlockedLead from "@/models/PersonalUnlockedLead"
import PersonalChatThread from "@/models/PersonalChatThread"
import ExchangeVehicle from "@/models/ExchangeVehicle"
import BuyVehicle from "@/models/BuyVehicle"
import WizardLead from "@/models/WizardLead"

const MODEL_MAP: Record<string, any> = {
    ExchangeVehicle,
    BuyVehicle,
    WizardLead,
    Valuation: WizardLead
}

export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        if (!session || (session.user as any)?.role !== "partner") {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
        }

        const partnerId = (session.user as any)?.partnerId
        if (!partnerId) {
            return NextResponse.json({ message: "Partner ID not found" }, { status: 403 })
        }

        await connectToDatabase()

        const { searchParams } = new URL(request.url)
        const statusFilter = searchParams.get("status") // "pending_decision", "accepted", or "all"

        const filter: any = { partnerId }
        if (statusFilter && statusFilter !== "all") {
            filter.status = statusFilter
        }

        const leads = await PersonalUnlockedLead.find(filter)
            .sort({ unlockedAt: -1 })
            .lean()

        // Fetch matching chat thread IDs in bulk to avoid N+1 queries
        const leadIds = leads.map(l => l.leadId)
        const chatThreads = await PersonalChatThread.find({
            partnerId,
            leadId: { $in: leadIds }
        }).select("_id leadId").lean()

        const chatThreadMap: Record<string, string> = {}
        chatThreads.forEach((t: any) => {
            chatThreadMap[t.leadId] = t._id.toString()
        })

        const leadsWithChatAndDetails = await Promise.all(leads.map(async (l: any) => {
            const chatThreadId = chatThreadMap[l.leadId] || null
            let originalDetails: any = null
            
            const Model = MODEL_MAP[l.leadSource]
            if (Model && l.leadId) {
                try {
                    originalDetails = await Model.findById(l.leadId).lean()
                } catch (err) {
                    console.error(`Error fetching original lead ${l.leadId} from ${l.leadSource}:`, err)
                }
            }

            return {
                ...l,
                chatThreadId,
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

        return NextResponse.json({ leads: leadsWithChatAndDetails })

    } catch (error: any) {
        console.error("[Personal Unlocked Leads GET] Error:", error)
        return NextResponse.json({ message: error.message || "Internal server error" }, { status: 500 })
    }
}

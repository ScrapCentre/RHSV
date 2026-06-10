import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import connectToDatabase from "@/lib/db"
import UnlockedLead from "@/models/UnlockedLead"
import CollectionCenter from "@/models/CollectionCenter"
import ExchangeVehicle from "@/models/ExchangeVehicle"
import BuyVehicle from "@/models/BuyVehicle"
import WizardLead from "@/models/WizardLead"

const MODEL_MAP: Record<string, any> = {
    ExchangeVehicle,
    BuyVehicle,
    WizardLead,
    Valuation: WizardLead
}

async function getCCOperatorModel() {
    return (await import("@/models/CCOperator")).default
}

export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        if (!session || (session.user as any)?.role !== "cc_operator") {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
        }

        const ccId = (session.user as any)?.ccId
        const partnerId = (session.user as any)?.partnerId
        if (!ccId) {
            return NextResponse.json({ message: "Collection Center ID not found in session" }, { status: 403 })
        }

        await connectToDatabase()

        let ccName = "Collection Center"
        let ccCity = ""
        let leads = []

        if (partnerId) {
            const PersonalCCOperator = (await import("@/models/PersonalCCOperator")).default
            const PersonalCollectionCenter = (await import("@/models/PersonalCollectionCenter")).default
            const PersonalUnlockedLead = (await import("@/models/PersonalUnlockedLead")).default
            const PersonalChatThread = (await import("@/models/PersonalChatThread")).default

            const operator = await PersonalCCOperator.findOne({ ccId }).lean() as any
            if (operator) {
                const cc = await PersonalCollectionCenter.findOne({ email: operator.email }).lean() as any
                if (cc) {
                    ccName = cc.name
                    ccCity = cc.city
                }
            }
            const rawLeads = await PersonalUnlockedLead.find({ assignedCcId: ccId }).sort({ assignedAt: -1 }).lean() as any[]
            const leadIds = rawLeads.map(l => l.leadId)
            const chatThreads = await PersonalChatThread.find({
                leadId: { $in: leadIds },
                partnerId: partnerId
            }).lean() as any[]
            const threadMap = new Map(chatThreads.map(t => [t.leadId, t._id.toString()]))
            
            leads = await Promise.all(rawLeads.map(async (l) => {
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
                    chatThreadId: threadMap.get(l.leadId) || null,
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
        } else {
            const CCOperator = await getCCOperatorModel()
            const operator = await CCOperator.findOne({ ccId }).lean() as any
            if (operator) {
                const cc = await CollectionCenter.findOne({ email: operator.email }).lean() as any
                if (cc) {
                    ccName = cc.name
                    ccCity = cc.city
                }
            }
            const rawNormalLeads = await UnlockedLead.find({ assignedCcId: ccId }).sort({ assignedAt: -1 }).lean() as any[]
            leads = await Promise.all(rawNormalLeads.map(async (l) => {
                let originalDetails: any = null
                const Model = MODEL_MAP[l.leadSource]
                if (Model && l.leadId) {
                    try {
                        originalDetails = await Model.findById(l.leadId).lean()
                    } catch (err) {
                        console.error(`Error fetching original normal lead ${l.leadId}:`, err)
                    }
                }
                return {
                    ...l,
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
        }

        return NextResponse.json({
            leads,
            ccName,
            ccCity
        })

    } catch (error: any) {
        console.error("Error in cc leads GET:", error)
        return NextResponse.json({ message: error.message || "Internal server error" }, { status: 500 })
    }
}

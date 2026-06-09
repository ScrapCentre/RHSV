import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import connectToDatabase from "@/lib/db"

// Models
import ExchangeVehicle from "@/models/ExchangeVehicle"
import BuyVehicle from "@/models/BuyVehicle"
import WizardLead from "@/models/WizardLead"
import B2BPartner from "@/models/B2BPartner"
import PersonalUnlockedLead from "@/models/PersonalUnlockedLead"
import PersonalChatThread from "@/models/PersonalChatThread"

const MODEL_MAP: Record<string, any> = {
    ExchangeVehicle,
    BuyVehicle,
    WizardLead,
}

function extractCustomerInfo(lead: any, source: string) {
    let name = "Customer"
    let email = ""
    let phone = ""
    let customerId = ""
    let vehicleInfo = ""

    if (source === "ExchangeVehicle") {
        name = lead.customerName || "Customer"
        phone = lead.customerPhone || ""
        customerId = lead.userId || ""
        vehicleInfo = `${lead.oldVehicleBrand || ""} ${lead.oldVehicleModel || ""}`.trim()
    } else if (source === "BuyVehicle") {
        name = lead.customerName || "Customer"
        email = lead.customerEmail || ""
        phone = lead.customerPhone || ""
        customerId = lead.userId || ""
        vehicleInfo = `${lead.vehicleBrand || ""} ${lead.vehicleModel || ""}`.trim()
    } else if (source === "WizardLead") {
        name = lead.name || "Customer"
        phone = lead.phone || ""
        customerId = lead.userId || ""
        vehicleInfo = `${lead.year || ""} ${lead.brand || ""} ${lead.model || ""}`.trim()
    }

    return { name, email, phone, customerId, vehicleInfo }
}

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        if (!session || (session.user as any)?.role !== "partner") {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
        }

        const partnerId = (session.user as any)?.partnerId
        if (!partnerId) {
            return NextResponse.json({ message: "Partner ID not found in session" }, { status: 403 })
        }

        const body = await request.json()
        const { leadId, source } = body

        if (!leadId || !source) {
            return NextResponse.json({ message: "Missing required fields" }, { status: 400 })
        }

        await connectToDatabase()

        if (!MODEL_MAP[source]) {
            return NextResponse.json({ message: `Invalid source: ${source}` }, { status: 400 })
        }

        const Model = MODEL_MAP[source]

        // 1. Atomically lock and update lead status
        const lead = await Model.findOneAndUpdate(
            { _id: leadId, status: { $in: ["approved", "pickup_scheduled", "reached_collection_centre", "car_scrapped"] } },
            {
                $set: {
                    status: "unlocked",
                    unlockedByPartnerId: partnerId,
                    unlockedAt: new Date(),
                },
            },
            { new: true }
        ).lean() as any

        if (!lead) {
            return NextResponse.json({ message: "Sorry, this lead has already been claimed by another facility." }, { status: 409 })
        }

        // 2. Extract customer details
        const customer = extractCustomerInfo(lead, source)

        // 3. Find partner details
        const partner = await B2BPartner.findOne({ userId: partnerId }).lean() as any
        const partnerName = partner?.businessName || "Personal Partner"

        // 4. Create PersonalUnlockedLead
        const unlockedLead = await PersonalUnlockedLead.create({
            leadId,
            leadSource: source,
            partnerId,
            customerId: customer.customerId,
            customerName: customer.name,
            customerEmail: customer.email,
            customerPhone: customer.phone,
            vehicleInfo: customer.vehicleInfo,
            unlockedAt: new Date(),
            status: "pending_decision",
        })

        // 5. Create Chat Thread and post system message
        await PersonalChatThread.create({
            leadId,
            partnerId,
            customerId: customer.customerId,
            messages: [
                {
                    sender: "system",
                    message: `${partnerName} has claimed your lead and will reach out shortly.`,
                    isSystemMessage: true,
                    createdAt: new Date(),
                    senderRole: "system",
                    type: "system",
                },
            ],
        })

        return NextResponse.json({
            success: true,
            message: "Lead claimed successfully!",
            unlockedLead: {
                leadId,
                source,
                vehicleInfo: customer.vehicleInfo,
                customerName: customer.name,
            },
        })

    } catch (error: any) {
        console.error("[Claim API] Error:", error)
        return NextResponse.json({ message: error.message || "Internal server error" }, { status: 500 })
    }
}

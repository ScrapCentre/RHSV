import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import connectToDatabase from "@/lib/db"
import UnlockedLead from "@/models/UnlockedLead"
import CollectionCenter from "@/models/CollectionCenter"

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

            const operator = await PersonalCCOperator.findOne({ ccId }).lean() as any
            if (operator) {
                const cc = await PersonalCollectionCenter.findOne({ email: operator.email }).lean() as any
                if (cc) {
                    ccName = cc.name
                    ccCity = cc.city
                }
            }
            leads = await PersonalUnlockedLead.find({ assignedCcId: ccId }).sort({ assignedAt: -1 }).lean()
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
            leads = await UnlockedLead.find({ assignedCcId: ccId }).sort({ assignedAt: -1 }).lean()
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

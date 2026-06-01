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
        if (!ccId) {
            return NextResponse.json({ message: "Collection Center ID not found in session" }, { status: 403 })
        }

        await connectToDatabase()

        // 1. Get CC details
        const CCOperator = await getCCOperatorModel()
        const operator = await CCOperator.findOne({ ccId }).lean() as any
        let ccName = "Collection Center"
        let ccCity = ""

        if (operator) {
            const cc = await CollectionCenter.findOne({ email: operator.email }).lean() as any
            if (cc) {
                ccName = cc.name
                ccCity = cc.city
            }
        }

        // 2. Fetch leads assigned to this CC
        const leads = await UnlockedLead.find({ assignedCcId: ccId }).sort({ assignedAt: -1 }).lean()

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

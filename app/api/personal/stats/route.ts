import { NextRequest, NextResponse } from "next/server"
import connectToDatabase from "@/lib/db"
import PersonalCollectionCenter from "@/models/PersonalCollectionCenter"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"

export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        if (!session || (session.user as any).role !== "partner") {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
        }
        const partnerId = (session.user as any).partnerId
        if (!partnerId) return NextResponse.json({ message: "No Partner ID" }, { status: 400 })

        await connectToDatabase()
        const totalCCs = await PersonalCollectionCenter.countDocuments({ partnerId })
        // Return rvsfId key mapping to partnerId to allow the mirrored dashboard to work with zero code changes.
        return NextResponse.json({ totalCCs, rvsfId: partnerId, name: (session.user as any).name })
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 })
    }
}

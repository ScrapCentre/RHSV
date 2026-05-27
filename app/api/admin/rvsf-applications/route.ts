import { NextRequest, NextResponse } from "next/server"
import connectToDatabase from "@/lib/db"
import RVSFDetail from "@/models/RVSFDetail"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"

export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        if (!session || (session.user as any).role !== "admin") {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
        }

        await connectToDatabase()
        const applications = await RVSFDetail.find({}).sort({ createdAt: -1 }).lean()
        return NextResponse.json({ data: applications }, { status: 200 })
    } catch (error: any) {
        return NextResponse.json({ message: error.message || "Internal server error" }, { status: 500 })
    }
}

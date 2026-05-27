import { NextRequest, NextResponse } from "next/server"
import connectToDatabase from "@/lib/db"
import CollectionCenter from "@/models/CollectionCenter"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"

export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        if (!session || (session.user as any).role !== "rvsf") {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
        }
        const rvsfId = (session.user as any).rvsfId
        if (!rvsfId) return NextResponse.json({ message: "No RVSF ID" }, { status: 400 })

        await connectToDatabase()
        const totalCCs = await CollectionCenter.countDocuments({ rvsfId })
        return NextResponse.json({ totalCCs, rvsfId, name: (session.user as any).name })
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 })
    }
}

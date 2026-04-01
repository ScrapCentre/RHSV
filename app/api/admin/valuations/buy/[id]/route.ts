import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import connectToDatabase from "@/lib/db"
import BuyVehicle from "@/models/BuyVehicle"

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions)

        if (!session || (session.user as any).role !== "admin") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        await connectToDatabase()
        const resolvedParams = await params
        const request = await BuyVehicle.findById(resolvedParams.id)

        if (!request) {
            return NextResponse.json({ error: "Request not found" }, { status: 404 })
        }

        return NextResponse.json(request)
    } catch (error) {
        console.error("Error fetching buy request:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}

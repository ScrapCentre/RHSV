import { NextRequest, NextResponse } from "next/server"
import connectToDatabase from "@/lib/db"
import CollectionCenter from "@/models/CollectionCenter"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions)
        if (!session || (session.user as any).role !== "rvsf") {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
        }
        const rvsfId = (session.user as any).rvsfId
        if (!rvsfId) return NextResponse.json({ message: "No RVSF ID in session" }, { status: 400 })

        const { id } = await params
        await connectToDatabase()

        // Only allow delete if the CC belongs to this RVSF
        const cc = await CollectionCenter.findOneAndDelete({ _id: id, rvsfId })
        if (!cc) {
            return NextResponse.json({ message: "Not found or not authorized" }, { status: 404 })
        }
        return NextResponse.json({ message: "Collection Center deleted" })
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 })
    }
}

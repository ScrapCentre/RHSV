import { NextRequest, NextResponse } from "next/server"
import connectToDatabase from "@/lib/db"
import PersonalCollectionCenter from "@/models/PersonalCollectionCenter"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions)
        if (!session || (session.user as any).role !== "partner") {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
        }
        const partnerId = (session.user as any).partnerId
        if (!partnerId) return NextResponse.json({ message: "No Partner ID in session" }, { status: 400 })

        const { id } = await params
        await connectToDatabase()

        // Only allow delete if the CC belongs to this partner
        const cc = await PersonalCollectionCenter.findOneAndDelete({ _id: id, partnerId })
        if (!cc) {
            return NextResponse.json({ message: "Not found or not authorized" }, { status: 404 })
        }

        // Also delete the operator account
        const PersonalCCOperator = (await import("@/models/PersonalCCOperator")).default
        await PersonalCCOperator.findOneAndDelete({ email: cc.contactPersonEmail.toLowerCase() })

        return NextResponse.json({ message: "Collection Center deleted" })
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 })
    }
}

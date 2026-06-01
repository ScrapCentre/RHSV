import { NextResponse } from "next/server"
import connectToDatabase from "@/lib/db"
import Executive from "@/models/Executive"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function DELETE(
    req: Request,
    { params }: any
) {
    try {
        const session = await getServerSession(authOptions)
        const role = (session?.user as any)?.role
        if (!session || (role !== "admin" && role !== "executive")) {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
        }

        const { id } = params
        if (!id) {
            return NextResponse.json({ success: false, message: "Missing Executive ID" }, { status: 400 })
        }

        await connectToDatabase()
        const deletedExec = await Executive.findByIdAndDelete(id)

        if (!deletedExec) {
            return NextResponse.json({ success: false, message: "Executive not found" }, { status: 404 })
        }

        return NextResponse.json({ success: true, message: "Executive deleted successfully" })
    } catch (error: any) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 })
    }
}

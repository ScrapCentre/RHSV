import { NextResponse, type NextRequest } from "next/server"
import connectToDatabase from "@/lib/db"
import Executive from "@/models/Executive"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { requireCsrf } from "@/lib/middleware/csrf"

export async function DELETE(
    req: NextRequest,
    { params }: any
) {
    const csrfFail = requireCsrf(req)
    if (csrfFail) return csrfFail
    try {
        const session = await getServerSession(authOptions)
        if (!session || (session.user as any).role !== "admin") {
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

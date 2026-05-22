import { NextResponse, type NextRequest } from "next/server"
import connectToDatabase from "@/lib/db"
import ScrapCentreUser from "@/models/ScrapCentreUser"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { requireCsrf } from "@/lib/middleware/csrf"

export async function DELETE(req: NextRequest, { params }: any) {
    const csrfFail = requireCsrf(req)
    if (csrfFail) return csrfFail
    try {
        const session = await getServerSession(authOptions)
        if (!session || (session.user as any).role !== "admin") {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
        }

        await connectToDatabase()
        const deletedUser = await ScrapCentreUser.findByIdAndDelete(params.id)

        if (!deletedUser) {
            return NextResponse.json({ message: "User not found" }, { status: 404 })
        }

        return NextResponse.json({ message: "User deleted successfully" })
    } catch (error) {
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 })
    }
}

import { NextResponse, type NextRequest } from "next/server"
import connectToDatabase from "@/lib/db"
import RVSFUser from "@/models/RVSFUser"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { requireCsrf } from "@/lib/middleware/csrf"

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const csrfFail = requireCsrf(req)
    if (csrfFail) return csrfFail
    try {
        const session = await getServerSession(authOptions)
        const isDev = process.env.NODE_ENV === "development"
        if (!isDev && (!session || (session.user as any).role !== "admin")) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
        }

        const { id } = await params
        if (!id) {
            return NextResponse.json({ message: "ID is required" }, { status: 400 })
        }

        await connectToDatabase()
        
        const deletedUser = await RVSFUser.findByIdAndDelete(id)
        if (!deletedUser) {
            return NextResponse.json({ message: "User not found" }, { status: 404 })
        }

        return NextResponse.json({ message: "User deleted successfully" }, { status: 200 })
    } catch (error: any) {
        return NextResponse.json(
            { message: "Failed to delete RVSF user" },
            { status: 500 }
        )
    }
}

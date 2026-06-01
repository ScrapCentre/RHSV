import { NextResponse } from "next/server"
import connectToDatabase from "@/lib/db"
import ScrapCentreUser from "@/models/ScrapCentreUser"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function DELETE(req: Request, { params }: any) {
    try {
        const session = await getServerSession(authOptions)
        const role = (session?.user as any)?.role
        if (!session || (role !== "admin" && role !== "executive")) {
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

import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { requireCsrf } from "@/lib/middleware/csrf"
import connectToDatabase from "@/lib/db"
import Contact from "@/models/Contact"

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    // CSRF guard — this route calls getServerSession directly (no `withAuth`
    // wrapper), so per lib/middleware/csrf.ts it must add requireCsrf itself.
    const csrfFail = requireCsrf(request)
    if (csrfFail) return csrfFail
    try {
        const session = await getServerSession(authOptions)
        if (!session || (session.user as any).role !== "admin") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const { id } = await params
        const body = await request.json()
        const { status } = body

        if (!status || !["new", "reviewed", "resolved"].includes(status)) {
            return NextResponse.json({ error: "Invalid status" }, { status: 400 })
        }

        await connectToDatabase()

        const updatedContact = await Contact.findByIdAndUpdate(
            id,
            { status },
            { new: true }
        )

        if (!updatedContact) {
            return NextResponse.json({ error: "Contact not found" }, { status: 404 })
        }

        return NextResponse.json(updatedContact)
    } catch (error) {
        console.error("Error updating contact status:", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    // CSRF guard — see note on PATCH above.
    const csrfFail = requireCsrf(request)
    if (csrfFail) return csrfFail
    try {
        const session = await getServerSession(authOptions)
        if (!session || (session.user as any).role !== "admin") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const { id } = await params
        await connectToDatabase()

        const deletedContact = await Contact.findByIdAndDelete(id)

        if (!deletedContact) {
            return NextResponse.json({ error: "Contact not found" }, { status: 404 })
        }

        return NextResponse.json({ message: "Contact deleted successfully" })
    } catch (error) {
        console.error("Error deleting contact:", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}

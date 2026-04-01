import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import connectToDatabase from "@/lib/db"
import Contact from "@/models/Contact"

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
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
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
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

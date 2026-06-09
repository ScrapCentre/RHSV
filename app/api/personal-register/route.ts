import { NextResponse } from "next/server"
import connectToDatabase from "@/lib/db"
import B2BRegistration from "@/models/B2BRegistration"

export async function POST(req: Request) {
    try {
        await connectToDatabase()
        const body = await req.json()

        const { name, address, pincode, city, state, contactNumber, email, userId } = body

        // Basic validation
        if (!name || !address || !pincode || !city || !state || !contactNumber || !email) {
            return NextResponse.json(
                { message: "All fields are required" },
                { status: 400 }
            )
        }

        // Check for existing pending registration
        if (userId) {
            const existingPending = await B2BRegistration.findOne({ userId, status: 'pending' })
            if (existingPending) {
                return NextResponse.json(
                    { message: "You already have a pending registration request." },
                    { status: 400 }
                )
            }
        }

        // Create new registration
        const newRegistration = await B2BRegistration.create({
            name,
            address,
            pincode,
            city,
            state,
            contactNumber,
            email,
            userId,
        })

        return NextResponse.json(
            { message: "Registration successful", data: newRegistration },
            { status: 201 }
        )
    } catch (error: any) {
        console.error("B2B Registration Error:", error)
        return NextResponse.json(
            { message: error.message || "Internal Server Error" },
            { status: 500 }
        )
    }
}

export async function GET(req: Request) {
    try {
        await connectToDatabase()
        const { searchParams } = new URL(req.url)
        const userId = searchParams.get("userId")
        const email = searchParams.get("email")

        if (userId) {
            // First check if they are already a partner (Approved)
            // Check by originalUserId OR email (for backward compatibility)
            const B2BPartner = (await import("@/models/B2BPartner")).default
            const partner = await B2BPartner.findOne({
                $or: [
                    { originalUserId: userId },
                    { email: email }
                ]
            })

            if (partner) {
                return NextResponse.json(
                    {
                        message: "Partner fetched successfully",
                        data: {
                            ...partner.toObject(),
                            status: "approved", // Explicitly set status for UI
                            name: partner.businessName
                        }
                    },
                    { status: 200 }
                )
            }

            // If not partner, check for pending registration
            const registration = await B2BRegistration.findOne({ userId }).sort({ createdAt: -1 })
            return NextResponse.json(
                { message: "Registration fetched successfully", data: registration },
                { status: 200 }
            )
        }

        const registrations = await B2BRegistration.find().sort({ createdAt: -1 })

        // Cache-control headers to prevent caching issues in admin panel
        return NextResponse.json(
            { message: "Registrations fetched successfully", data: registrations },
            {
                status: 200,
                headers: {
                    "Cache-Control": "no-store, max-age=0"
                }
            }
        )
    } catch (error: any) {
        console.error("B2B Fetch Error:", error)
        return NextResponse.json(
            { message: error.message || "Internal Server Error" },
            { status: 500 }
        )
    }
}

export async function DELETE(req: Request) {
    try {
        await connectToDatabase()
        const { searchParams } = new URL(req.url)
        const id = searchParams.get("id")

        if (!id) {
            return NextResponse.json(
                { message: "Registration ID is required" },
                { status: 400 }
            )
        }

        const deletedRegistration = await B2BRegistration.findByIdAndDelete(id)

        if (!deletedRegistration) {
            return NextResponse.json(
                { message: "Registration not found" },
                { status: 404 }
            )
        }

        return NextResponse.json(
            { message: "Registration deleted successfully" },
            { status: 200 }
        )
    } catch (error: any) {
        console.error("B2B Deletion Error:", error)
        return NextResponse.json(
            { message: error.message || "Internal Server Error" },
            { status: 500 }
        )
    }
}

export async function PATCH(req: Request) {
    try {
        await connectToDatabase()
        const { searchParams } = new URL(req.url)
        const id = searchParams.get("id")
        const { status } = await req.json()

        if (!id || !status) {
            return NextResponse.json(
                { message: "Registration ID and Status are required" },
                { status: 400 }
            )
        }

        const updatedRegistration = await B2BRegistration.findByIdAndUpdate(
            id,
            { status },
            { new: true }
        )

        if (!updatedRegistration) {
            return NextResponse.json(
                { message: "Registration not found" },
                { status: 404 }
            )
        }

        return NextResponse.json(
            { message: `Registration ${status} successfully`, data: updatedRegistration },
            { status: 200 }
        )
    } catch (error: any) {
        console.error("B2B Status Update Error:", error)
        return NextResponse.json(
            { message: error.message || "Internal Server Error" },
            { status: 500 }
        )
    }
}

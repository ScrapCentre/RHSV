// engineering-design.md §11 / 07-tech-debt HIGH — admin gate on GET/PATCH/DELETE; POST remains public
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import connectToDatabase from "@/lib/db"
import B2BRegistration from "@/models/B2BRegistration"

export async function POST(req: Request) {
    // POST is intentionally public — this is the RVSF signup form
    try {
        await connectToDatabase()
        const body = await req.json()

        const { name, address, pincode, city, state, contactNumber, email, userId } = body

        if (!name || !address || !pincode || !city || !state || !contactNumber || !email) {
            return NextResponse.json(
                { message: "All fields are required" },
                { status: 400 }
            )
        }

        if (userId) {
            const existingPending = await B2BRegistration.findOne({ userId, status: 'pending' })
            if (existingPending) {
                return NextResponse.json(
                    { message: "You already have a pending registration request." },
                    { status: 400 }
                )
            }
        }

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
        console.error("B2B Registration Error:", error?.message)
        return NextResponse.json(
            { message: "Internal Server Error" },
            { status: 500 }
        )
    }
}

export async function GET(req: Request) {
    // Admin-only: engineering-design.md §11 / 07-tech-debt HIGH
    const session = await getServerSession(authOptions)
    if (!session || (session.user as any).role !== "admin") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    try {
        await connectToDatabase()
        const { searchParams } = new URL(req.url)
        const userId = searchParams.get("userId")
        const email = searchParams.get("email")

        if (userId) {
            const B2BPartner = (await import("@/models/B2BPartner")).default
            // Exclude password from partner lookup
            const partner = await B2BPartner.findOne({
                $or: [{ originalUserId: userId }, { email: email }]
            }).select("-password")

            if (partner) {
                return NextResponse.json(
                    {
                        message: "Partner fetched successfully",
                        data: { ...partner.toObject(), status: "approved", name: partner.businessName }
                    },
                    { status: 200 }
                )
            }

            const registration = await B2BRegistration.findOne({ userId }).sort({ createdAt: -1 })
            return NextResponse.json(
                { message: "Registration fetched successfully", data: registration },
                { status: 200 }
            )
        }

        const registrations = await B2BRegistration.find().sort({ createdAt: -1 })

        return NextResponse.json(
            { message: "Registrations fetched successfully", data: registrations },
            {
                status: 200,
                headers: { "Cache-Control": "no-store, max-age=0" }
            }
        )
    } catch (error: any) {
        console.error("B2B Fetch Error:", error?.message)
        return NextResponse.json(
            { message: "Internal Server Error" },
            { status: 500 }
        )
    }
}

export async function DELETE(req: Request) {
    // Admin-only: engineering-design.md §11
    const session = await getServerSession(authOptions)
    if (!session || (session.user as any).role !== "admin") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

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
        console.error("B2B Deletion Error:", error?.message)
        return NextResponse.json(
            { message: "Internal Server Error" },
            { status: 500 }
        )
    }
}

export async function PATCH(req: Request) {
    // Admin-only: engineering-design.md §11
    const session = await getServerSession(authOptions)
    if (!session || (session.user as any).role !== "admin") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

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
        console.error("B2B Status Update Error:", error?.message)
        return NextResponse.json(
            { message: "Internal Server Error" },
            { status: 500 }
        )
    }
}

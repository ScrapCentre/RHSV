import { NextResponse } from "next/server"
import connectToDatabase from "@/lib/db"
import B2BPartner from "@/models/B2BPartner"
import B2BRegistration from "@/models/B2BRegistration"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions)
        const role = (session?.user as any)?.role
        if (!session || (role !== "admin" && role !== "executive")) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
        }

        await connectToDatabase()
        const body = await req.json()

        const { userId, password, businessName, contactNumber, email, address, city, state, pincode, registrationId, originalUserId } = body

        // Basic validation
        if (!userId || !password || !businessName) {
            return NextResponse.json(
                { message: "User ID, Password and Business Name are required" },
                { status: 400 }
            )
        }

        // Check if userId already exists
        const existingUser = await B2BPartner.findOne({ userId })
        if (existingUser) {
            return NextResponse.json(
                { message: "User ID already exists" },
                { status: 400 }
            )
        }

        // Create new partner
        const newPartner = await B2BPartner.create({
            userId,
            password, // NOTE: In a real app, hash this password with bcrypt!
            businessName,
            contactNumber,
            email,
            address,
            city,
            state,
            pincode,
            registrationId,
            originalUserId
        })

        // If created successfully, and we have a registrationId, delete the original request
        if (registrationId) {
            await B2BRegistration.findByIdAndDelete(registrationId)
        }

        return NextResponse.json(
            { message: "Partner created successfully", data: newPartner },
            { status: 201 }
        )
    } catch (error: any) {
        console.error("B2B Partner Creation Error:", error)
        return NextResponse.json(
            { message: error.message || "Internal Server Error" },
            { status: 500 }
        )
    }
}

export async function GET() {
    try {
        const session = await getServerSession(authOptions)
        const role = (session?.user as any)?.role
        if (!session || (role !== "admin" && role !== "executive")) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
        }

        await connectToDatabase()
        const partners = await B2BPartner.find().sort({ createdAt: -1 })

        // Cache-control to prevent stale data
        return NextResponse.json(
            { message: "Partners fetched successfully", data: partners },
            {
                status: 200,
                headers: {
                    "Cache-Control": "no-store, max-age=0"
                }
            }
        )
    } catch (error: any) {
        console.error("B2B Partner Fetch Error:", error)
        return NextResponse.json(
            { message: error.message || "Internal Server Error" },
            { status: 500 }
        )
    }
}

export async function DELETE(req: Request) {
    try {
        const session = await getServerSession(authOptions)
        const role = (session?.user as any)?.role
        if (!session || (role !== "admin" && role !== "executive")) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
        }

        const { searchParams } = new URL(req.url)
        const id = searchParams.get("id")

        if (!id) {
            return NextResponse.json({ message: "ID parameter is required" }, { status: 400 })
        }

        await connectToDatabase()
        const deletedPartner = await B2BPartner.findByIdAndDelete(id)

        if (!deletedPartner) {
            return NextResponse.json({ message: "B2B Partner not found" }, { status: 404 })
        }

        return NextResponse.json({ message: "B2B Partner access revoked successfully" }, { status: 200 })
    } catch (error: any) {
        console.error("B2B Partner Deletion Error:", error)
        return NextResponse.json(
            { message: error.message || "Internal Server Error" },
            { status: 500 }
        )
    }
}


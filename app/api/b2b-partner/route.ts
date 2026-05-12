// engineering-design.md §11 / 07-tech-debt CRITICAL — admin gate added; password hashed
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import bcrypt from "bcryptjs"
import connectToDatabase from "@/lib/db"
import B2BPartner from "@/models/B2BPartner"
import B2BRegistration from "@/models/B2BRegistration"

export async function POST(req: Request) {
    const session = await getServerSession(authOptions)
    if (!session || (session.user as any).role !== "admin") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    try {
        await connectToDatabase()
        const body = await req.json()

        const { userId, password, businessName, contactNumber, email, address, city, state, pincode, registrationId, originalUserId } = body

        if (!userId || !password || !businessName) {
            return NextResponse.json(
                { message: "User ID, Password and Business Name are required" },
                { status: 400 }
            )
        }

        const existingUser = await B2BPartner.findOne({ userId })
        if (existingUser) {
            return NextResponse.json(
                { message: "User ID already exists" },
                { status: 400 }
            )
        }

        // Hash password before storing — engineering-design.md §11
        const hashedPassword = await bcrypt.hash(password, 12)

        const newPartner = await B2BPartner.create({
            userId,
            password: hashedPassword,
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

        if (registrationId) {
            await B2BRegistration.findByIdAndDelete(registrationId)
        }

        // Never return password field
        const { password: _pw, ...partnerData } = (newPartner as any).toObject()
        return NextResponse.json(
            { message: "Partner created successfully", data: partnerData },
            { status: 201 }
        )
    } catch (error: any) {
        console.error("B2B Partner Creation Error:", error?.message)
        return NextResponse.json(
            { message: "Internal Server Error" },
            { status: 500 }
        )
    }
}

export async function GET() {
    const session = await getServerSession(authOptions)
    if (!session || (session.user as any).role !== "admin") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    try {
        await connectToDatabase()
        // Explicitly exclude password field from response
        const partners = await B2BPartner.find().select("-password").sort({ createdAt: -1 })

        return NextResponse.json(
            { message: "Partners fetched successfully", data: partners },
            {
                status: 200,
                headers: { "Cache-Control": "no-store, max-age=0" }
            }
        )
    } catch (error: any) {
        console.error("B2B Partner Fetch Error:", error?.message)
        return NextResponse.json(
            { message: "Internal Server Error" },
            { status: 500 }
        )
    }
}

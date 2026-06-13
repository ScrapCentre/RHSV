import { NextResponse } from "next/server"
import { NextRequest } from "next/server"
import connectToDatabase from "@/lib/db"
import mongoose from "mongoose"
import bcrypt from "bcryptjs"
import { registerSchema, formatZodError } from "@/lib/validation"
import { rateLimiters } from "@/lib/rate-limit"

export async function POST(req: NextRequest) {
    try {
        // Rate limit: 5 registrations per IP per hour
        const limited = await rateLimiters.register(req)
        if (limited) return limited

        const body = await req.json()

        // Validate input
        const parsed = registerSchema.safeParse(body)
        if (!parsed.success) {
            return NextResponse.json(
                { message: formatZodError(parsed.error) },
                { status: 400 }
            )
        }

        const { name, email, password } = parsed.data

        console.log(`[Registration] Attempting to register email: ${email}`)

        await connectToDatabase()
        console.log("[Registration] Database connected successfully")

        const UserModel = mongoose.models.User || (await import("@/models/User")).default
        const ScrapCentreUserModel = mongoose.models.ScrapCentreUser || (await import("@/models/ScrapCentreUser")).default
        const B2BPartnerModel = mongoose.models.B2BPartner || (await import("@/models/B2BPartner")).default
        const ExecutiveModel = mongoose.models.Executive || (await import("@/models/Executive")).default

        const [existingStandard, existingScrap, existingB2B, existingExec] = await Promise.all([
            UserModel.findOne({ email }),
            ScrapCentreUserModel.findOne({ email }),
            B2BPartnerModel.findOne({ email }),
            ExecutiveModel.findOne({ email })
        ])

        if (existingStandard || existingScrap || existingB2B || existingExec) {
            console.warn(`[Registration] Email collision detected: ${email}`)
            return NextResponse.json({
                message: "An account with this email already exists in our system. Please try logging in or use a different email."
            }, { status: 400 })
        }

        const hashedPassword = await bcrypt.hash(password, 10)

        const newUser = await UserModel.create({
            name,
            email,
            password: hashedPassword,
            role: "client"
        })

        console.log(`[Registration] Success: User ${newUser._id} created for ${email}`)
        return NextResponse.json({
            message: "Registration successful!",
            userId: newUser._id
        }, { status: 201 })

    } catch (error: any) {
        console.error("[Registration] Critical Error:", error)

        if (error.code === 'EREFUSED' || error.name === 'MongooseServerSelectionError') {
            return NextResponse.json({
                message: "Database connection failed. This is likely an IP Whitelist issue in MongoDB Atlas. Please ensure your current IP is allowed.",
                error: "DB_CONNECTION_FAILED"
            }, { status: 503 })
        }

        return NextResponse.json({
            message: error.message || "An unexpected error occurred during registration.",
            details: error.errors ? Object.values(error.errors).map((e: any) => e.message) : [],
            error: "REGISTRATION_FAILED"
        }, { status: 500 })
    }
}

import { NextRequest, NextResponse } from "next/server"
import connectToDatabase from "@/lib/db"
import RateLimit from "@/models/RateLimit"
import crypto from "crypto"

export async function POST(req: NextRequest) {
    try {
        const { email, selectedOption, requestId } = await req.json()
        if (!email || !selectedOption || !requestId) {
            return NextResponse.json({ message: "Email, selected option, and request ID are required" }, { status: 400 })
        }

        const identifier = email.toLowerCase()

        await connectToDatabase()

        // 1. Fetch challenge from RateLimit matching the email and requestId
        const escapedIdentifier = identifier.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')
        const escapedRequestId = requestId.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')
        const regex = new RegExp(`^admin-challenge:${escapedIdentifier}:${escapedRequestId}:`)
        const challengeRecord = await RateLimit.findOne({ key: { $regex: regex } })

        if (!challengeRecord || challengeRecord.resetAt <= new Date()) {
            return NextResponse.json({ message: "Verification session expired or not found. Please try again." }, { status: 400 })
        }

        // 2. Parse correct option from key
        // Key format: admin-challenge:${email}:${requestId}:${correctOption}:${num1}-${num2}-${num3}
        const parts = challengeRecord.key.split(":")
        const correctOption = parts[3]

        // 3. Verify
        if (selectedOption !== correctOption) {
            return NextResponse.json({ success: false, message: "Incorrect number selected. Please check the security code on the admin login page." }, { status: 400 })
        }

        // 4. Generate one-time bypass token
        const randomHex = crypto.randomBytes(16).toString("hex")
        const bypassToken = `BYPASS_TOKEN_${randomHex}`

        const tokenKey = `admin-bypass-token:${identifier}:${requestId}:${bypassToken}`

        // Save token to database (valid for 5 minutes to give admin enough time to complete redirection/polling)
        await RateLimit.create({
            key: tokenKey,
            count: 1,
            resetAt: new Date(Date.now() + 5 * 60_000)
        })

        // 5. Clean up lockout and challenge
        const lockoutKey = `admin-lockout:${identifier}`
        await Promise.all([
            RateLimit.deleteMany({ key: { $regex: regex } }),
            RateLimit.deleteOne({ key: lockoutKey }),
            RateLimit.deleteOne({ key: `admin-attempts:${identifier}` })
        ])

        return NextResponse.json({
            success: true,
            token: bypassToken
        })

    } catch (error: any) {
        console.error("[Bypass Verify API Error]:", error)
        return NextResponse.json({ message: error.message || "Internal Server Error" }, { status: 500 })
    }
}

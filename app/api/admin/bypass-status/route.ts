import { NextRequest, NextResponse } from "next/server"
import connectToDatabase from "@/lib/db"
import RateLimit from "@/models/RateLimit"

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url)
        const email = searchParams.get("email")
        const requestId = searchParams.get("requestId")

        if (!email || !requestId) {
            return NextResponse.json({ message: "Email and request ID are required" }, { status: 400 })
        }

        const identifier = email.toLowerCase()
        await connectToDatabase()

        // Search for any active token corresponding to this email and requestId
        const escapedIdentifier = identifier.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')
        const escapedRequestId = requestId.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')
        
        // Pattern: admin-bypass-token:${identifier}:${requestId}:${bypassToken}
        const regex = new RegExp(`^admin-bypass-token:${escapedIdentifier}:${escapedRequestId}:(BYPASS_TOKEN_.+)$`)
        const tokenRecord = await RateLimit.findOne({ key: { $regex: regex } })

        if (tokenRecord && tokenRecord.resetAt > new Date()) {
            // Extract the token value from the key
            const matches = tokenRecord.key.match(regex)
            const token = matches ? matches[1] : null
            
            if (token) {
                return NextResponse.json({
                    verified: true,
                    token: token
                })
            }
        }

        return NextResponse.json({
            verified: false
        })

    } catch (error: any) {
        console.error("[Bypass Status API Error]:", error)
        return NextResponse.json({ message: error.message || "Internal Server Error" }, { status: 500 })
    }
}

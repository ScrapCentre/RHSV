import { NextRequest, NextResponse } from "next/server"
import connectToDatabase from "@/lib/db"
import RateLimit from "@/models/RateLimit"
import crypto from "crypto"

export async function GET(req: NextRequest) {
    const errorHtml = (msg: string) => `
        <!DOCTYPE html>
        <html>
        <head>
            <script>
                alert(${JSON.stringify(msg)});
                window.close();
            </script>
        </head>
        <body>
        </body>
        </html>
    `

    const successHtml = `
        <!DOCTYPE html>
        <html>
        <head>
            <script>
                window.close();
            </script>
        </head>
        <body>
        </body>
        </html>
    `

    try {
        const { searchParams } = new URL(req.url)
        const email = searchParams.get("email")
        const selectedOption = searchParams.get("option")
        const requestId = searchParams.get("requestId")

        if (!email || !selectedOption || !requestId) {
            return new NextResponse(errorHtml("Invalid or missing parameters in verification link."), {
                headers: { "Content-Type": "text/html" },
                status: 400
            })
        }

        const identifier = email.toLowerCase()
        await connectToDatabase()

        // 1. Fetch challenge from RateLimit matching the email and requestId
        const escapedIdentifier = identifier.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')
        const escapedRequestId = requestId.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')
        const regex = new RegExp(`^admin-challenge:${escapedIdentifier}:${escapedRequestId}:`)
        const challengeRecord = await RateLimit.findOne({ key: { $regex: regex } })

        if (!challengeRecord || challengeRecord.resetAt <= new Date()) {
            return new NextResponse(errorHtml("This verification link has expired or has already been used. Please return to the login page and request a new code."), {
                headers: { "Content-Type": "text/html" },
                status: 400
            })
        }

        // 2. Parse correct option from key
        const parts = challengeRecord.key.split(":")
        const correctOption = parts[3]

        // 3. Verify
        if (selectedOption !== correctOption) {
            return new NextResponse(errorHtml("Incorrect number selected. Please check the code displayed on your admin login screen and select the matching option."), {
                headers: { "Content-Type": "text/html" },
                status: 400
            })
        }

        // 4. Generate one-time bypass token
        const randomHex = crypto.randomBytes(16).toString("hex")
        const bypassToken = `BYPASS_TOKEN_${randomHex}`
        const tokenKey = `admin-bypass-token:${identifier}:${requestId}:${bypassToken}`

        // Save token to database (valid for 5 minutes)
        await RateLimit.create({
            key: tokenKey,
            count: 1,
            resetAt: new Date(Date.now() + 5 * 60_000)
        })

        // 5. Clean up lockout and challenge records
        const lockoutKey = `admin-lockout:${identifier}`
        await Promise.all([
            RateLimit.deleteMany({ key: { $regex: regex } }),
            RateLimit.deleteOne({ key: lockoutKey }),
            RateLimit.deleteOne({ key: `admin-attempts:${identifier}` })
        ])

        return new NextResponse(successHtml, {
            headers: { "Content-Type": "text/html" },
            status: 200
        })

    } catch (error: any) {
        console.error("[Bypass Confirm Direct API Error]:", error)
        return new NextResponse(errorHtml("An internal security server error occurred. Please try again later."), {
            headers: { "Content-Type": "text/html" },
            status: 500
        })
    }
}

import { NextRequest, NextResponse } from "next/server"
import connectToDatabase from "@/lib/db"
import User from "@/models/User"
import RateLimit from "@/models/RateLimit"

export async function POST(req: NextRequest) {
    try {
        const { email } = await req.json()
        if (!email) {
            return NextResponse.json({ message: "Email is required" }, { status: 400 })
        }

        const identifier = email.toLowerCase()

        // 1. Verify if the email belongs to an administrator
        const envAdminEmail = process.env.ADMIN_EMAIL
        const isEnvAdmin = envAdminEmail && identifier === envAdminEmail.toLowerCase()
        let isAdmin = isEnvAdmin

        await connectToDatabase()

        if (!isAdmin) {
            const dbUser = await User.findOne({ email: identifier }).select("role").lean()
            if (dbUser && dbUser.role === "admin") {
                isAdmin = true
            }
        }

        if (!isAdmin) {
            return NextResponse.json({ message: "Access denied. Only administrators can request a bypass." }, { status: 403 })
        }

        // 2. Verify if the administrator is currently locked out
        const lockoutKey = `admin-lockout:${identifier}`
        const lockoutRecord = await RateLimit.findOne({ key: lockoutKey })
        if (!lockoutRecord || lockoutRecord.resetAt <= new Date()) {
            return NextResponse.json({ message: "Bypass requested but the account is not currently locked out." }, { status: 400 })
        }

        // 3. Generate 3 random two-digit numbers
        const numbers: string[] = []
        while (numbers.length < 3) {
            const num = Math.floor(Math.random() * 90 + 10).toString() // 10 to 99
            if (!numbers.includes(num)) {
                numbers.push(num)
            }
        }

        // Select a random number to be the correct one
        const correctOption = numbers[Math.floor(Math.random() * 3)]

        // 4. Save the challenge in RateLimit (valid for 5 minutes)
        // Format: admin-challenge:${email}:${correctOption}:${num1}-${num2}-${num3}
        const challengeKey = `admin-challenge:${identifier}:${correctOption}:${numbers.join("-")}`
        
        // Clear any existing challenge first
        const regex = new RegExp(`^admin-challenge:${identifier.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}:`)
        await RateLimit.deleteMany({ key: { $regex: regex } })

        // Create new challenge
        await RateLimit.create({
            key: challengeKey,
            count: 1,
            resetAt: new Date(Date.now() + 5 * 60_000) // 5 minutes TTL
        })

        // 5. Send verification email via Resend to scrapcentre69@gmail.com
        const RESEND_API_KEY = process.env.RESEND_API_KEY
        if (RESEND_API_KEY) {
            const siteUrl = process.env.NEXTAUTH_URL || "http://localhost:3000"
            const subject = "🔑 Admin Login Bypass Verification"
            const emailHtml = `
                <!DOCTYPE html>
                <html>
                <body style="margin:0;padding:0;background:#f4f4f5;font-family:Arial,sans-serif;">
                    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:40px 0;">
                        <tr><td align="center">
                            <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);border-top:4px solid #E31E24;">
                                <tr>
                                    <td style="background:#0E192D;padding:24px 40px;">
                                        <p style="margin:0;font-size:22px;font-weight:800;color:#ffffff;">
                                            Scrap<span style="color:#E31E24;">Centre</span> Security
                                        </p>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding:40px;">
                                        <h2 style="color:#0E192D;margin:0 0 16px;">Bypass Lockout Verification</h2>
                                        <p style="color:#333;font-size:15px;line-height:1.6;margin-bottom:20px;">
                                            Hello Admin,
                                        </p>
                                        <p style="color:#555;font-size:14px;line-height:1.6;margin-bottom:24px;">
                                            A login bypass request has been initiated for the admin account: <strong>${email}</strong>.
                                        </p>
                                        
                                        <p style="color:#555;font-size:14px;line-height:1.6;margin-bottom:16px;">
                                            Please enter the following verification code on the login screen to complete authorization:
                                        </p>
                                        <div style="background:#f9fafb;border:1px dashed #E31E24;padding:20px;margin-bottom:24px;border-radius:8px;text-align:center;">
                                            <span style="font-size:32px;font-weight:900;color:#E31E24;letter-spacing:2px;">${correctOption}</span>
                                        </div>
                                        <p style="color:#D32F2F;font-size:13px;line-height:1.6;margin-bottom:20px;font-weight:bold;">
                                            Warning: If you did not request this, someone else is attempting to gain administrative access. Please investigate immediately.
                                        </p>
                                        <p style="color:#999;font-size:12px;margin-top:30px;border-top:1px solid #eee;padding-top:20px;">
                                            This verification code will expire in 5 minutes.
                                        </p>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="background:#f9fafb;padding:20px 40px;text-align:center;">
                                        <p style="margin:0;color:#aaa;font-size:12px;">© ${new Date().getFullYear()} ScrapCentre Security. All rights reserved.</p>
                                    </td>
                                </tr>
                            </table>
                        </td></tr>
                    </table>
                </body>
                </html>
            `

            await fetch("https://api.resend.com/emails", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${RESEND_API_KEY}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    from: "ScrapCentre Security <noreply@scrapcentre.com>",
                    to: ["scrapcentre69@gmail.com"],
                    subject,
                    html: emailHtml,
                }),
            })
        } else {
            console.warn("[Bypass API] RESEND_API_KEY is not configured. Email not sent.")
        }

        return NextResponse.json({
            success: true,
            options: numbers
        })

    } catch (error: any) {
        console.error("[Bypass Request API Error]:", error)
        return NextResponse.json({ message: error.message || "Internal Server Error" }, { status: 500 })
    }
}

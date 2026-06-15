import { NextResponse } from "next/server"
import connectToDatabase from "@/lib/db"
import Executive from "@/models/Executive"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import bcrypt from "bcryptjs"

// GET all executives
export async function GET() {
    try {
        const session = await getServerSession(authOptions)
        const role = (session?.user as any)?.role
        if (!session || (role !== "admin" && role !== "executive")) {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
        }

        await connectToDatabase()
        const executives = await Executive.find({}).sort({ createdAt: -1 })
        
        return NextResponse.json({ success: true, data: executives })
    } catch (error: any) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 })
    }
}

// POST create a new executive
export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions)
        const role = (session?.user as any)?.role
        if (!session || (role !== "admin" && role !== "executive")) {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
        }

        const body = await req.json()
        const { name, email, password } = body

        if (!name || !email || !password) {
            return NextResponse.json({ success: false, message: "Missing required fields" }, { status: 400 })
        }

        await connectToDatabase()

        // Check if executive already exists
        const existingExec = await Executive.findOne({ email: email.toLowerCase() })
        if (existingExec) {
            return NextResponse.json({ success: false, message: "Executive already exists with this email" }, { status: 400 })
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10)

        const executive = await Executive.create({
            name,
            email: email.toLowerCase(),
            password: hashedPassword,
            role: "executive",
            mustChangePassword: true
        })

        // Send Email with credentials
        const RESEND_API_KEY = process.env.RESEND_API_KEY
        if (RESEND_API_KEY) {
            try {
                const siteUrl = process.env.NEXTAUTH_URL || "http://localhost:3000"
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
                                <h2 style="color:#0E192D;margin:0 0 16px;">Executive Account Created</h2>
                                <p style="color:#333;font-size:15px;line-height:1.6;margin-bottom:20px;">
                                  Hello ${name},
                                </p>
                                <p style="color:#555;font-size:14px;line-height:1.6;margin-bottom:24px;">
                                  An Executive account has been successfully provisioned for you on the ScrapCentre portal.
                                </p>
                                <div style="background:#f9fafb;border:1px solid #e5e7eb;padding:20px;margin-bottom:24px;border-radius:8px;">
                                    <p style="margin:0 0 8px;font-size:13px;color:#555;"><strong>Login ID (Email):</strong> ${email}</p>
                                    <p style="margin:0 0 8px;font-size:13px;color:#555;"><strong>Password:</strong> <code style="font-family:monospace;font-size:14px;font-weight:bold;background:#fff;padding:2px 6px;border:1px solid #ddd;border-radius:4px;">${password}</code></p>
                                    <p style="margin:0;font-size:13px;color:#555;"><strong>Login URL:</strong> <a href="${siteUrl}/executive" style="color:#E31E24;text-decoration:none;font-weight:bold;">${siteUrl}/executive</a></p>
                                </div>
                                <p style="color:#D32F2F;font-size:13px;line-height:1.6;margin-bottom:20px;font-weight:bold;">
                                  Please log in and update your password immediately to secure your access.
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
                        to: [email.toLowerCase()],
                        subject: "🔑 ScrapCentre Executive Account Credentials",
                        html: emailHtml,
                    }),
                })
            } catch (err) {
                console.error("Failed to send credentials email:", err)
            }
        }

        return NextResponse.json({ success: true, data: executive })
    } catch (error: any) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 })
    }
}

// DELETE executive
export async function DELETE(req: Request) {
    try {
        const session = await getServerSession(authOptions)
        const role = (session?.user as any)?.role
        if (!session || (role !== "admin" && role !== "executive")) {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
        }

        const { searchParams } = new URL(req.url)
        const id = searchParams.get("id")

        if (!id) {
            return NextResponse.json({ success: false, message: "ID parameter is required" }, { status: 400 })
        }

        await connectToDatabase()
        const deletedExec = await Executive.findByIdAndDelete(id)

        if (!deletedExec) {
            return NextResponse.json({ success: false, message: "Executive not found" }, { status: 404 })
        }

        return NextResponse.json({ success: true, message: "Executive access revoked successfully" }, { status: 200 })
    } catch (error: any) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 })
    }
}

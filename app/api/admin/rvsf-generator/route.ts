import { NextResponse } from "next/server"
import connectToDatabase from "@/lib/db"
import RVSFUser from "@/models/RVSFUser"
import bcrypt from "bcryptjs"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"

export const dynamic = "force-dynamic"

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions)
        const role = (session?.user as any)?.role
        const isDev = process.env.NODE_ENV === "development"
        if (!isDev && (!session || (role !== "admin" && role !== "executive"))) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
        }

        const body = await req.json()
        const { rvsfId, password, name, email } = body

        if (!rvsfId || !password || !name || !email) {
            return NextResponse.json(
                { message: "Missing required fields" },
                { status: 400 }
            )
        }

        await connectToDatabase()

        // Check if RVSF user already exists
        const existingRVSF = await RVSFUser.findOne({ $or: [{ rvsfId }, { email: email.toLowerCase() }] })
        if (existingRVSF) {
            return NextResponse.json(
                { message: "An RVSF User with this ID or Email already exists." },
                { status: 400 }
            )
        }

        // Hash password
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)

        // Create new RVSF User
        const newRvsfUser = await RVSFUser.create({
            rvsfId,
            password: hashedPassword,
            name,
            email: email.toLowerCase(),
            role: "rvsf",
            mustChangePassword: true
        })

        // Send Email with credentials
        const RESEND_API_KEY = process.env.RESEND_API_KEY
        if (RESEND_API_KEY && email) {
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
                                <h2 style="color:#0E192D;margin:0 0 16px;">RVSF Partner Account Created</h2>
                                <p style="color:#333;font-size:15px;line-height:1.6;margin-bottom:20px;">
                                  Hello ${name},
                                </p>
                                <p style="color:#555;font-size:14px;line-height:1.6;margin-bottom:24px;">
                                  An RVSF Partner account has been successfully provisioned for you.
                                </p>
                                <div style="background:#f9fafb;border:1px solid #e5e7eb;padding:20px;margin-bottom:24px;border-radius:8px;">
                                    <p style="margin:0 0 8px;font-size:13px;color:#555;"><strong>RVSF ID:</strong> ${rvsfId}</p>
                                    <p style="margin:0 0 8px;font-size:13px;color:#555;"><strong>Email:</strong> ${email}</p>
                                    <p style="margin:0 0 8px;font-size:13px;color:#555;"><strong>Password:</strong> <code style="font-family:monospace;font-size:14px;font-weight:bold;background:#fff;padding:2px 6px;border:1px solid #ddd;border-radius:4px;">${password}</code></p>
                                    <p style="margin:0;font-size:13px;color:#555;"><strong>Login URL:</strong> <a href="${siteUrl}/rvsf/login" style="color:#E31E24;text-decoration:none;font-weight:bold;">${siteUrl}/rvsf/login</a></p>
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
                        subject: "🔑 ScrapCentre RVSF Account Credentials",
                        html: emailHtml,
                    }),
                })
            } catch (err) {
                console.error("Failed to send credentials email:", err)
            }
        }

        return NextResponse.json(
            { message: "RVSF User created successfully", user: { rvsfId: newRvsfUser.rvsfId, name: newRvsfUser.name } },
            { status: 201 }
        )
    } catch (error: any) {
        console.error("RVSF Generation Error:", error)
        return NextResponse.json(
            { message: "Failed to generate RVSF user.", error: error.message },
            { status: 500 }
        )
    }
}

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions)
        const role = (session?.user as any)?.role
        const isDev = process.env.NODE_ENV === "development"
        if (!isDev && (!session || (role !== "admin" && role !== "executive"))) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
        }

        const { searchParams } = new URL(req.url)
        const rvsfId = searchParams.get("rvsfId")

        await connectToDatabase()

        if (rvsfId) {
            const user = await RVSFUser.findOne({ rvsfId }).select("-password").lean()
            if (!user) {
                return NextResponse.json({ message: "RVSF User not found" }, { status: 404 })
            }
            const CollectionCenter = (await import("@/models/CollectionCenter")).default
            const centers = await CollectionCenter.find({ rvsfId }).sort({ createdAt: -1 }).lean()
            return NextResponse.json({ user, ccs: centers }, { status: 200 })
        }

        const users = await RVSFUser.find({}).sort({ createdAt: -1 }).select("-password")
        return NextResponse.json(users, { status: 200 })
    } catch (error: any) {
        return NextResponse.json(
            { message: "Failed to fetch RVSF users" },
            { status: 500 }
        )
    }
}

// DELETE RVSF partner
export async function DELETE(req: Request) {
    try {
        const session = await getServerSession(authOptions)
        const role = (session?.user as any)?.role
        const isDev = process.env.NODE_ENV === "development"
        if (!isDev && (!session || (role !== "admin" && role !== "executive"))) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
        }

        const { searchParams } = new URL(req.url)
        const id = searchParams.get("id")

        if (!id) {
            return NextResponse.json({ message: "ID parameter is required" }, { status: 400 })
        }

        await connectToDatabase()
        const deletedRvsf = await RVSFUser.findByIdAndDelete(id)

        if (!deletedRvsf) {
            return NextResponse.json({ message: "RVSF partner not found" }, { status: 404 })
        }

        return NextResponse.json({ message: "RVSF partner access revoked successfully" }, { status: 200 })
    } catch (error: any) {
        return NextResponse.json({ message: "Failed to revoke RVSF access", error: error.message }, { status: 500 })
    }
}

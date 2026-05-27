import { NextRequest, NextResponse } from "next/server"
import connectToDatabase from "@/lib/db"
import RVSFDetail from "@/models/RVSFDetail"
import RVSFUser from "@/models/RVSFUser"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import bcrypt from "bcryptjs"

// We will use fetch to hit Resend API directly to avoid depending on the resend npm package
const RESEND_API_KEY = process.env.RESEND_API_KEY

async function sendEmail(to: string, subject: string, html: string) {
    if (!RESEND_API_KEY) {
        console.error("RESEND_API_KEY is not set")
        return
    }
    try {
        const res = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${RESEND_API_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                from: "ScrapCentre <noreply@scrapcentre.com>",
                to,
                subject,
                html
            })
        })
        if (!res.ok) {
            const data = await res.json()
            console.error("Failed to send email via Resend:", data)
        }
    } catch (error) {
        console.error("Error sending email:", error)
    }
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await getServerSession(authOptions)
        if (!session || (session.user as any).role !== "admin") {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
        }

        const { id } = await params
        await connectToDatabase()
        const application = await RVSFDetail.findById(id).lean()
        if (!application) {
            return NextResponse.json({ message: "Not found" }, { status: 404 })
        }
        return NextResponse.json({ data: application }, { status: 200 })
    } catch (error: any) {
        return NextResponse.json({ message: error.message || "Internal server error" }, { status: 500 })
    }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await getServerSession(authOptions)
        if (!session || (session.user as any).role !== "admin") {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
        }

        const { id } = await params
        const body = await request.json()
        const { action, meetLink, date, reason } = body

        await connectToDatabase()
        const application = await RVSFDetail.findById(id)
        if (!application) {
            return NextResponse.json({ message: "Not found" }, { status: 404 })
        }

        const businessEmail = application.businessEmail || "unknown@example.com"
        const entityName = application.legalEntityName

        if (action === "schedule_kyc") {
            application.status = "under_review"
            await application.save()

            const emailHtml = `
                <h2>KYC Call Scheduled</h2>
                <p>Hello ${entityName},</p>
                <p>Your RVSF registration is under review. Please join the KYC call at the scheduled time:</p>
                <p><strong>Date & Time:</strong> ${date}</p>
                <p><strong>Meet Link:</strong> <a href="${meetLink}">${meetLink}</a></p>
                <p>Thank you,<br/>ScrapCentre Team</p>
            `
            await sendEmail(businessEmail, "ScrapCentre - KYC Call Scheduled", emailHtml)

            return NextResponse.json({ message: "Scheduled KYC call" })

        } else if (action === "activate") {
            // Generate temp password
            const tempPassword = Math.random().toString(36).slice(-8)
            const hashedPassword = await bcrypt.hash(tempPassword, 10)
            
            // Generate a simple ID
            const rvsfId = "RVSF" + Math.floor(10000 + Math.random() * 90000)

            // Check if email already exists
            const existingUser = await RVSFUser.findOne({ email: businessEmail })
            if (existingUser) {
                 return NextResponse.json({ message: "A user with this email already exists." }, { status: 400 })
            }

            // Create RVSF user
            await RVSFUser.create({
                rvsfId,
                name: entityName,
                email: businessEmail,
                password: hashedPassword,
                role: "rvsf",
                registeredAddress: application.registeredAddress,
                city: application.city,
                state: application.state,
                pincode: application.pincode,
            })

            application.status = "activated"
            await application.save()

            const emailHtml = `
                <!DOCTYPE html>
                <html>
                <body style="margin:0;padding:0;background:#f4f4f5;font-family:Arial,sans-serif;">
                  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:40px 0;">
                    <tr><td align="center">
                      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
                        <!-- Header -->
                        <tr>
                          <td style="background:#0E192D;padding:32px 40px;">
                            <p style="margin:0;font-size:22px;font-weight:800;color:#ffffff;letter-spacing:-0.5px;">
                              Scrap<span style="color:#E31E24;">Centre</span><sup style="font-size:12px;color:#aaa;">®</sup>
                            </p>
                          </td>
                        </tr>
                        <!-- Body -->
                        <tr>
                          <td style="padding:40px;">
                            <p style="margin:0 0 16px;font-size:16px;color:#111827;">Dear <strong>${entityName}</strong>,</p>
                            <p style="margin:0 0 16px;font-size:15px;color:#374151;line-height:1.6;">
                              Congratulations! Your application to join ScrapCentre as a Registered Vehicle Scrapping Facility has been reviewed and approved. Your account is now active.
                            </p>
                            <!-- Credentials Box -->
                            <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;margin:24px 0;">
                              <tr><td style="padding:20px 24px;">
                                <p style="margin:0 0 4px;font-size:11px;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:0.8px;">Your Login Credentials</p>
                                <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:14px;">
                                  <tr>
                                    <td style="padding:6px 0;font-size:14px;color:#6b7280;width:150px;">Login Portal</td>
                                    <td style="padding:6px 0;font-size:14px;color:#111827;font-weight:600;">
                                      <a href="https://scrapcentre.com/rvsf/login" style="color:#E31E24;text-decoration:none;">scrapcentre.com/rvsf/login</a>
                                    </td>
                                  </tr>
                                  <tr>
                                    <td style="padding:6px 0;font-size:14px;color:#6b7280;">Email</td>
                                    <td style="padding:6px 0;font-size:14px;color:#111827;font-weight:600;">${businessEmail}</td>
                                  </tr>
                                  <tr>
                                    <td style="padding:6px 0;font-size:14px;color:#6b7280;">Temporary Password</td>
                                    <td style="padding:6px 0;">
                                      <span style="font-family:monospace;font-size:16px;font-weight:700;background:#fff3f3;color:#E31E24;padding:4px 10px;border-radius:4px;border:1px solid #fecaca;">${tempPassword}</span>
                                    </td>
                                  </tr>
                                </table>
                              </td></tr>
                            </table>
                            <p style="margin:0 0 16px;font-size:15px;color:#374151;line-height:1.6;">
                              For the security of your account, please log in immediately and change your password upon first login.
                            </p>
                            <p style="margin:0 0 24px;font-size:15px;color:#374151;line-height:1.6;">
                              If you have any questions or need assistance, feel free to reach out to us at 
                              <a href="mailto:support@scrapcentre.com" style="color:#E31E24;text-decoration:none;">support@scrapcentre.com</a>.
                            </p>
                            <p style="margin:0;font-size:15px;color:#374151;">Welcome aboard,<br/><strong>Team ScrapCentre</strong></p>
                          </td>
                        </tr>
                        <!-- Footer -->
                        <tr>
                          <td style="background:#f9fafb;border-top:1px solid #e5e7eb;padding:20px 40px;text-align:center;">
                            <p style="margin:0;font-size:12px;color:#9ca3af;">© ${new Date().getFullYear()} ScrapCentre. All rights reserved.</p>
                          </td>
                        </tr>
                      </table>
                    </td></tr>
                  </table>
                </body>
                </html>
            `
            await sendEmail(businessEmail, "Your RVSF Account has been Activated — ScrapCentre", emailHtml)

            return NextResponse.json({ message: "Activated RVSF and created account" })

        } else if (action === "reject") {
            application.status = "rejected"
            await application.save()

            const emailHtml = `
                <h2>Application Update</h2>
                <p>Hello ${entityName},</p>
                <p>We regret to inform you that your RVSF application has been rejected for the following reason:</p>
                <p><strong>Reason:</strong> ${reason}</p>
                <p>If you have any questions, please contact our support team.</p>
                <p>Thank you,<br/>ScrapCentre Team</p>
            `
            await sendEmail(businessEmail, "ScrapCentre - Application Rejected", emailHtml)

            return NextResponse.json({ message: "Rejected application" })
        }

        return NextResponse.json({ message: "Invalid action" }, { status: 400 })
    } catch (error: any) {
        console.error("RVSF Action Error:", error)
        return NextResponse.json({ message: error.message || "Internal server error" }, { status: 500 })
    }
}

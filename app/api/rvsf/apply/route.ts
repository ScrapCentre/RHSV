import { NextRequest, NextResponse } from "next/server"
import connectToDatabase from "@/lib/db"
import RVSFDetail from "@/models/RVSFDetail"
import { uploadToCloudinary } from "@/lib/cloudinary"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"

export async function POST(request: NextRequest) {
    try {
        await connectToDatabase()

        const formData = await request.formData()

        // ── Step 1 fields ──────────────────────────────────────
        const legalEntityName = formData.get("legalEntityName") as string
        const gstNumber = formData.get("gstNumber") as string
        const panNumber = formData.get("panNumber") as string
        const cpcbAuthNumber = formData.get("cpcbAuthNumber") as string
        const morthAuthNumber = formData.get("morthAuthNumber") as string
        const businessEmail = formData.get("businessEmail") as string
        const phoneNumber = formData.get("phoneNumber") as string
        const registeredAddress = formData.get("registeredAddress") as string
        const city = formData.get("city") as string
        const state = formData.get("state") as string
        const pincode = Number(formData.get("pincode"))

        // ── Step 2 files ────────────────────────────────────────
        const gstCertFile = formData.get("gstCertificate") as File | null
        const cpcbLetterFile = formData.get("cpcbLetter") as File | null
        const morthCertFile = formData.get("morthCertificate") as File | null
        const panCardFile = formData.get("panCard") as File | null

        // ── Step 3 fields ──────────────────────────────────────
        const accountHolderName = formData.get("accountHolderName") as string
        const bankName = formData.get("bankName") as string
        const accountNumber = formData.get("accountNumber") as string
        const ifscCode = formData.get("ifscCode") as string
        const accountType = formData.get("accountType") as string

        // ── Validate required fields ────────────────────────────
        if (!legalEntityName || !gstNumber || !panNumber || !cpcbAuthNumber || !morthAuthNumber || !businessEmail || !phoneNumber || !registeredAddress || !city || !state || !pincode) {
            return NextResponse.json({ message: "All identity fields are required." }, { status: 400 })
        }

        if (!gstCertFile || !cpcbLetterFile || !morthCertFile || !panCardFile) {
            return NextResponse.json({ message: "All 4 KYC documents are required." }, { status: 400 })
        }

        if (!accountHolderName || !bankName || !accountNumber || !ifscCode || !accountType) {
            return NextResponse.json({ message: "All bank account fields are required." }, { status: 400 })
        }

        // ── Upload files to Cloudinary ──────────────────────────
        const uploadFile = async (file: File, name: string): Promise<string> => {
            const bytes = await file.arrayBuffer()
            const buffer = Buffer.from(bytes)
            const safeName = name.replace(/\s+/g, "_").toLowerCase()
            return uploadToCloudinary(buffer, "rvsf_kyc", `${safeName}_${Date.now()}`, "raw", {
                format: "pdf",
            })
        }

        const [gstCertificateUrl, cpcbLetterUrl, morthCertificateUrl, panCardUrl] = await Promise.all([
            uploadFile(gstCertFile, `gst_cert_${gstNumber}`),
            uploadFile(cpcbLetterFile, `cpcb_letter_${cpcbAuthNumber}`),
            uploadFile(morthCertFile, `morth_cert_${morthAuthNumber}`),
            uploadFile(panCardFile, `pan_card_${panNumber}`),
        ])

        // ── Save to MongoDB ─────────────────────────────────────
        // Get userId from session if logged in (optional)
        const session = await getServerSession(authOptions)
        const userId = (session?.user as any)?.id || null

        const detail = await RVSFDetail.create({
            legalEntityName,
            gstNumber: gstNumber.toUpperCase(),
            panNumber: panNumber.toUpperCase(),
            cpcbAuthNumber,
            morthAuthNumber,
            businessEmail,
            phoneNumber,
            registeredAddress,
            city,
            state,
            pincode,
            gstCertificateUrl,
            cpcbLetterUrl,
            morthCertificateUrl,
            panCardUrl,
            accountHolderName,
            bankName,
            accountNumber,
            ifscCode: ifscCode.toUpperCase(),
            accountType,
            status: "pending_review",
            ...(userId ? { userId } : {}),
        })

        // ── Send confirmation email via Resend ─────────────────
        const RESEND_API_KEY = process.env.RESEND_API_KEY
        if (RESEND_API_KEY) {
            const confirmationHtml = `
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
                            <p style="margin:0 0 16px;font-size:16px;color:#111827;">Dear <strong>${legalEntityName}</strong>,</p>
                            <p style="margin:0 0 24px;font-size:15px;color:#374151;line-height:1.6;">
                              Thank you for applying to join ScrapCentre as a Registered Vehicle Scrapping Facility. We have successfully received your application and our team will get in touch with you shortly.
                            </p>
                            <!-- What happens next -->
                            <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;margin-bottom:24px;">
                              <tr><td style="padding:20px 24px;">
                                <p style="margin:0 0 16px;font-size:11px;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:0.8px;">Here is what happens next</p>
                                ${[
                                    { n: 1, title: "Application Under Review", desc: "Our ops team will carefully review your submitted documents and details." },
                                    { n: 2, title: "KYC Video Call", desc: "You will receive an email with a scheduled KYC verification call link and timing." },
                                    { n: 3, title: "Account Activation", desc: "Once verified, your RVSF account will be activated and your login credentials will be sent to your registered email address." },
                                    { n: 4, title: "Login & Get Started", desc: "You can then log in to your RVSF dashboard at: <a href='https://scrapcentre.com/rvsf/login' style='color:#E31E24;text-decoration:none;'>scrapcentre.com/rvsf/login</a>" },
                                ].map(s => `
                                    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:14px;">
                                      <tr>
                                        <td width="32" valign="top">
                                          <div style="width:26px;height:26px;border-radius:50%;background:#fff3f3;border:1px solid #fecaca;text-align:center;line-height:26px;font-size:12px;font-weight:700;color:#E31E24;">${s.n}</div>
                                        </td>
                                        <td style="padding-left:10px;">
                                          <p style="margin:0 0 2px;font-size:14px;font-weight:700;color:#111827;">${s.title}</p>
                                          <p style="margin:0;font-size:13px;color:#6b7280;line-height:1.5;">${s.desc}</p>
                                        </td>
                                      </tr>
                                    </table>
                                `).join("")}
                              </td></tr>
                            </table>
                            <p style="margin:0 0 24px;font-size:15px;color:#374151;line-height:1.6;">
                              If you have any questions, feel free to reach out to us at 
                              <a href="mailto:support@scrapcentre.com" style="color:#E31E24;text-decoration:none;">support@scrapcentre.com</a>
                            </p>
                            <p style="margin:0;font-size:15px;color:#374151;">Warm regards,<br/><strong>Team ScrapCentre</strong></p>
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
            try {
                await fetch("https://api.resend.com/emails", {
                    method: "POST",
                    headers: {
                        "Authorization": `Bearer ${RESEND_API_KEY}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        from: "ScrapCentre <noreply@scrapcentre.com>",
                        to: businessEmail,
                        subject: "Application Received — ScrapCentre",
                        html: confirmationHtml,
                    }),
                })
            } catch (emailErr) {
                // Don't fail the submission if email fails
                console.error("[RVSF Apply] Confirmation email failed:", emailErr)
            }
        }

        return NextResponse.json(
            { message: "Application submitted successfully!", id: detail._id.toString() },
            { status: 201 }
        )
    } catch (error: any) {
        console.error("[RVSF Apply API] Error:", error)
        return NextResponse.json(
            { message: error.message || "Internal server error" },
            { status: 500 }
        )
    }
}

export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        const userId = (session?.user as any)?.id
        if (!userId) {
            return NextResponse.json({ exists: false })
        }
        await connectToDatabase()
        const existing = await RVSFDetail.findOne({ userId }).lean()
        return NextResponse.json({ exists: !!existing })
    } catch (error: any) {
        return NextResponse.json({ message: error.message || "Internal server error" }, { status: 500 })
    }
}

import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import connectToDatabase from "@/lib/db"
import RefundRequest from "@/models/RefundRequest"
import RVSFUser from "@/models/RVSFUser"
import Razorpay from "razorpay"

const RESEND_API_KEY = process.env.RESEND_API_KEY

// Helper to send email via Resend API HTTP endpoint
async function sendEmailViaResend(to: string, subject: string, html: string) {
    if (!RESEND_API_KEY) {
        console.error("[Email] RESEND_API_KEY not configured")
        return
    }
    try {
        const res = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${RESEND_API_KEY}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                from: "noreply@scrapcentre.com",
                to: [to],
                subject,
                html,
            }),
        })
        const data = await res.json()
        if (!res.ok) {
            console.error("[Email] Resend API Error:", data)
        } else {
            console.log("[Email] Sent successfully to:", to, "ID:", data.id)
        }
    } catch (err) {
        console.error("[Email] Resend fetch exception:", err)
    }
}

// POST /api/admin/refund-requests/[id]
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        // 1. Authorize Admin Session
        const session = await getServerSession(authOptions)
        if (!session || (session.user as any)?.role !== "admin") {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
        }

        const body = await request.json()
        const { action, reason } = body

        if (!action || (action !== "approve" && action !== "deny")) {
            return NextResponse.json({ message: "Invalid action. Must be 'approve' or 'deny'." }, { status: 400 })
        }

        await connectToDatabase()

        const { id } = await params

        // 2. Fetch the refund request document
        const refundRequest = await RefundRequest.findById(id)
        if (!refundRequest) {
            return NextResponse.json({ message: "Refund request not found" }, { status: 404 })
        }

        if (refundRequest.status !== "pending_admin_review") {
            return NextResponse.json(
                { message: `Refund request has already been processed (Current status: ${refundRequest.status})` },
                { status: 400 }
            )
        }

        // 3. Fetch RVSF user details for recipient information
        const rvsfUser = await RVSFUser.findOne({ rvsfId: refundRequest.rvsfId }).lean() as any
        const recipientEmail = rvsfUser?.email
        const recipientName = rvsfUser?.name || "RVSF Partner"

        if (!recipientEmail) {
            console.warn(`[Refund Review] No email found for RVSF: ${refundRequest.rvsfId}. Will attempt fallback or proceed with logs.`)
        }

        if (action === "approve") {
            // -- APPROVE REFUND --
            if (!refundRequest.unlockPaymentId) {
                return NextResponse.json({ message: "No payment ID stored on this refund request." }, { status: 400 })
            }

            // A. Initiate Razorpay refund
            const key_id = process.env.RAZORPAY_KEY_ID?.trim()
            const key_secret = process.env.RAZORPAY_KEY_SECRET?.trim()

            if (!key_id || !key_secret) {
                console.error("[Refund Review] Razorpay credentials missing from env variables.")
                return NextResponse.json({ message: "Payment processor keys not configured" }, { status: 500 })
            }

            const razorpay = new Razorpay({ key_id, key_secret })
            
            // Amount in paise
            const amountInPaise = Math.round(refundRequest.amount * 100)
            console.log(`[Refund Review] Initiating Razorpay refund for payment: ${refundRequest.unlockPaymentId}, Amount: ${amountInPaise} paise`)

            let razorpayRefundId = ""
            try {
                const refundResult = await razorpay.payments.refund(refundRequest.unlockPaymentId, {
                    amount: amountInPaise,
                    speed: "normal",
                    notes: {
                        reason: "Admin approved RVSF lead refund request",
                        refundRequestId: id,
                        leadId: refundRequest.leadId,
                    },
                })
                razorpayRefundId = refundResult.id
                console.log(`[Refund Review] Razorpay refund succeeded. Refund ID: ${razorpayRefundId}`)
            } catch (rzpErr: any) {
                console.error("[Refund Review] Razorpay refund API failed:", rzpErr)
                return NextResponse.json(
                    { message: `Payment gateway refund failed: ${rzpErr.message || rzpErr.description || "Unknown error"}` },
                    { status: 502 }
                )
            }

            // B. Update Database Status
            refundRequest.status = "refunded"
            refundRequest.adminNotes = "Approved by admin. Razorpay Refund ID: " + razorpayRefundId
            await refundRequest.save()

            // C. Send email to RVSF
            if (recipientEmail) {
                const emailHtml = `
                    <!DOCTYPE html>
                    <html>
                    <body style="margin:0;padding:0;background:#f4f4f5;font-family:Arial,sans-serif;">
                        <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:40px 0;">
                            <tr><td align="center">
                                <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);border-collapse:collapse;">
                                    <tr>
                                        <td style="background:#0E192D;padding:32px 40px;">
                                            <p style="margin:0;font-size:22px;font-weight:800;color:#ffffff;letter-spacing:-0.5px;">
                                                Scrap<span style="color:#E31E24;">Centre</span><sup style="font-size:12px;color:#aaa;">®</sup>
                                            </p>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style="padding:40px;">
                                            <h2 style="color:#10B981;margin:0 0 16px;font-size:20px;">Refund Approved & Initiated</h2>
                                            <p style="color:#374151;font-size:15px;line-height:1.6;margin:0 0 16px;">
                                                Dear ${recipientName},
                                            </p>
                                            <p style="color:#374151;font-size:15px;line-height:1.6;margin:0 0 20px;">
                                                Great news! Your lead refund request has been approved by the admin team. We have successfully processed the full refund via our payment gateway.
                                            </p>
                                            <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;margin-bottom:24px;">
                                                <tr>
                                                    <td style="padding:16px 20px;">
                                                        <table width="100%" cellpadding="0" cellspacing="0">
                                                            <tr>
                                                                <td style="padding:4px 0;font-size:14px;color:#6b7280;width:130px;">Lead ID</td>
                                                                <td style="padding:4px 0;font-size:14px;color:#111827;font-weight:600;">${refundRequest.leadId}</td>
                                                            </tr>
                                                            <tr>
                                                                <td style="padding:4px 0;font-size:14px;color:#6b7280;">Refund Amount</td>
                                                                <td style="padding:4px 0;font-size:14px;color:#111827;font-weight:600;">₹${refundRequest.amount}</td>
                                                            </tr>
                                                            <tr>
                                                                <td style="padding:4px 0;font-size:14px;color:#6b7280;">Refund ID</td>
                                                                <td style="padding:4px 0;font-size:14px;color:#111827;font-family:monospace;font-size:13px;color:#E31E24;font-weight:600;">${razorpayRefundId}</td>
                                                            </tr>
                                                            <tr>
                                                                <td style="padding:4px 0;font-size:14px;color:#6b7280;">Payment Method</td>
                                                                <td style="padding:4px 0;font-size:14px;color:#111827;">Original Source Payment</td>
                                                            </tr>
                                                        </table>
                                                    </td>
                                                </tr>
                                            </table>
                                            <p style="color:#374151;font-size:15px;line-height:1.6;margin:0 0 16px;">
                                                The refund has been approved and **will reflect in your account in 5-7 business days**, depending on your bank's processing cycles.
                                            </p>
                                            <p style="color:#9ca3af;font-size:12px;line-height:1.5;margin-top:32px;border-top:1px solid #f3f4f6;padding-top:16px;">
                                                If you have any questions or have not received the funds after 7 business days, feel free to reach out to us at
                                                <a href="mailto:support@scrapcentre.com" style="color:#E31E24;text-decoration:none;">support@scrapcentre.com</a>.
                                            </p>
                                        </td>
                                    </tr>
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
                await sendEmailViaResend(
                    recipientEmail,
                    `Refund Approved for Lead ID: ${refundRequest.leadId} — ScrapCentre`,
                    emailHtml
                )
            }

            return NextResponse.json({
                success: true,
                message: "Refund approved and successfully initiated through Razorpay.",
                refundId: razorpayRefundId,
            })

        } else {
            // -- DENY REFUND --
            if (!reason || reason.trim().length === 0) {
                return NextResponse.json({ message: "A reason for denial is required." }, { status: 400 })
            }

            // A. Update Database Status
            refundRequest.status = "denied"
            refundRequest.adminNotes = reason.trim()
            await refundRequest.save()

            // B. Send Email to RVSF
            if (recipientEmail) {
                const emailHtml = `
                    <!DOCTYPE html>
                    <html>
                    <body style="margin:0;padding:0;background:#f4f4f5;font-family:Arial,sans-serif;">
                        <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:40px 0;">
                            <tr><td align="center">
                                <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);border-collapse:collapse;">
                                    <tr>
                                        <td style="background:#0E192D;padding:32px 40px;">
                                            <p style="margin:0;font-size:22px;font-weight:800;color:#ffffff;letter-spacing:-0.5px;">
                                                Scrap<span style="color:#E31E24;">Centre</span><sup style="font-size:12px;color:#aaa;">®</sup>
                                            </p>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style="padding:40px;">
                                            <h2 style="color:#EF4444;margin:0 0 16px;font-size:20px;">Refund Request Denied</h2>
                                            <p style="color:#374151;font-size:15px;line-height:1.6;margin:0 0 16px;">
                                                Dear ${recipientName},
                                            </p>
                                            <p style="color:#374151;font-size:15px;line-height:1.6;margin:0 0 20px;">
                                                Your request for a refund regarding **Lead ID: ${refundRequest.leadId}** has been reviewed by the administrator and was **denied**.
                                            </p>
                                            <table width="100%" cellpadding="0" cellspacing="0" style="background:#fff5f5;border:1px solid #fecaca;border-radius:8px;margin-bottom:24px;">
                                                <tr>
                                                    <td style="padding:18px 20px;">
                                                        <p style="margin:0 0 8px;font-size:11px;font-weight:700;color:#b91c1c;text-transform:uppercase;letter-spacing:0.8px;">Reason for Denial</p>
                                                        <p style="margin:0;font-size:15px;color:#7f1d1d;line-height:1.6;font-weight:500;">
                                                            ${reason.trim()}
                                                        </p>
                                                    </td>
                                                </tr>
                                            </table>
                                            <p style="color:#374151;font-size:15px;line-height:1.6;margin:0 0 16px;">
                                                If you believe this decision was made in error, or if you can supply additional documentation to support your claim, please get in touch with our operations desk.
                                            </p>
                                            <p style="color:#9ca3af;font-size:12px;line-height:1.5;margin-top:32px;border-top:1px solid #f3f4f6;padding-top:16px;">
                                                If you have any questions, feel free to reach out to us at
                                                <a href="mailto:support@scrapcentre.com" style="color:#E31E24;text-decoration:none;">support@scrapcentre.com</a>.
                                            </p>
                                        </td>
                                    </tr>
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
                await sendEmailViaResend(
                    recipientEmail,
                    `Refund Request Denied for Lead ID: ${refundRequest.leadId} — ScrapCentre`,
                    emailHtml
                )
            }

            return NextResponse.json({
                success: true,
                message: "Refund request has been denied.",
                denialReason: reason.trim(),
            })
        }

    } catch (error: any) {
        console.error("[Refund Review API] General Error:", error)
        return NextResponse.json({ message: error.message || "Internal server error" }, { status: 500 })
    }
}

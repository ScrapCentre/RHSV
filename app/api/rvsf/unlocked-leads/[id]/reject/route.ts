import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import connectToDatabase from "@/lib/db"
import UnlockedLead from "@/models/UnlockedLead"
import RefundRequest from "@/models/RefundRequest"
import ExchangeVehicle from "@/models/ExchangeVehicle"
import BuyVehicle from "@/models/BuyVehicle"
import WizardLead from "@/models/WizardLead"
import RVSFUser from "@/models/RVSFUser"
import Razorpay from "razorpay"

const RESEND_API_KEY = process.env.RESEND_API_KEY

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
                from: "ScrapCentre <noreply@scrapcentre.com>",
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

// ─── Model map ──────────────────────────────────────────────────
const MODEL_MAP: Record<string, any> = {
    ExchangeVehicle,
    BuyVehicle,
    WizardLead,
}

// ─── POST /api/rvsf/unlocked-leads/[id]/reject ─────────────────
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions)
        if (!session || (session.user as any)?.role !== "rvsf") {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
        }

        const rvsfId = (session.user as any)?.rvsfId
        if (!rvsfId) {
            return NextResponse.json({ message: "RVSF ID not found" }, { status: 403 })
        }

        const body = await request.json()
        const { rejectionReason } = body

        if (!rejectionReason || rejectionReason.trim().length === 0) {
            return NextResponse.json(
                { message: "Rejection reason is required" },
                { status: 400 }
            )
        }

        const { id } = await params
        await connectToDatabase()

        // 1. Update unlocked lead status to "rejected"
        const unlockedLead = await UnlockedLead.findOneAndUpdate(
            { _id: id, rvsfId, status: "pending_decision" },
            {
                $set: {
                    status: "rejected",
                    rejectionReason: rejectionReason.trim(),
                },
            },
            { new: true }
        )

        if (!unlockedLead) {
            return NextResponse.json(
                { message: "Lead not found or already processed" },
                { status: 404 }
            )
        }

        // 2. Reset lead status back to "approved_to_rvsf" in original collection
        const Model = MODEL_MAP[unlockedLead.leadSource]
        if (Model) {
            await Model.findByIdAndUpdate(unlockedLead.leadId, {
                $set: { status: "approved_to_rvsf" },
                $unset: {
                    unlockedByRvsfId: "",
                    unlockedAt: "",
                    unlockPaymentId: "",
                },
            })
            console.log(`[Reject] Lead ${unlockedLead.leadId} returned to marketplace`)
        }

        // 3. Initiate Razorpay refund or fallback
        const key_id = process.env.RAZORPAY_KEY_ID?.trim()
        const key_secret = process.env.RAZORPAY_KEY_SECRET?.trim()

        let isAutoRefunded = false
        let razorpayRefundId = ""
        let refundError = ""

        if (key_id && key_secret && unlockedLead.unlockPaymentId) {
            try {
                const razorpay = new Razorpay({ key_id, key_secret })
                const amountInPaise = Math.round(unlockedLead.amount * 100)
                
                console.log(`[Reject Auto-Refund] Initiating Razorpay refund for payment: ${unlockedLead.unlockPaymentId}, Amount: ${amountInPaise} paise`)
                const refundResult = await razorpay.payments.refund(unlockedLead.unlockPaymentId, {
                    amount: amountInPaise,
                    speed: "normal",
                    notes: {
                        reason: "RVSF lead rejection auto-refund",
                        leadId: unlockedLead.leadId,
                    },
                })
                razorpayRefundId = refundResult.id
                isAutoRefunded = true
                console.log(`[Reject Auto-Refund] Success. Refund ID: ${razorpayRefundId}`)
            } catch (rzpErr: any) {
                console.error("[Reject Auto-Refund] Failed, falling back to admin review:", rzpErr)
                refundError = rzpErr.message || rzpErr.description || "Unknown Razorpay error"
            }
        } else {
            console.warn("[Reject Auto-Refund] Razorpay credentials or payment ID missing. Falling back to admin review.")
            refundError = "Razorpay credentials or payment ID missing"
        }

        // 4. Create refund request in database with appropriate status
        await RefundRequest.create({
            leadId: unlockedLead.leadId,
            rvsfId,
            amount: unlockedLead.amount,
            rejectionReason: rejectionReason.trim(),
            unlockPaymentId: unlockedLead.unlockPaymentId,
            razorpayOrderId: unlockedLead.razorpayOrderId,
            status: isAutoRefunded ? "refunded" : "failed",
            adminNotes: isAutoRefunded 
                ? `Auto-refunded upon RVSF rejection. Razorpay Refund ID: ${razorpayRefundId}`
                : `Auto-refund failed: ${refundError}.`
        })

        // 5. Send email notification if auto-refunded successfully
        if (isAutoRefunded) {
            try {
                const rvsfUser = await RVSFUser.findOne({ rvsfId }).lean() as any
                const recipientEmail = rvsfUser?.email
                const recipientName = rvsfUser?.name || "RVSF Partner"

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
                                                <h2 style="color:#10B981;margin:0 0 16px;font-size:20px;">Refund Processed Automatically</h2>
                                                <p style="color:#374151;font-size:15px;line-height:1.6;margin:0 0 16px;">
                                                    Dear ${recipientName},
                                                </p>
                                                <p style="color:#374151;font-size:15px;line-height:1.6;margin:0 0 20px;">
                                                    Your refund has been automatically initiated because you rejected the lead. We have successfully processed the full refund via our payment gateway.
                                                </p>
                                                <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;margin-bottom:24px;">
                                                    <tr>
                                                        <td style="padding:16px 20px;">
                                                            <table width="100%" cellpadding="0" cellspacing="0">
                                                                <tr>
                                                                    <td style="padding:4px 0;font-size:14px;color:#6b7280;width:130px;">Lead ID</td>
                                                                    <td style="padding:4px 0;font-size:14px;color:#111827;font-weight:600;">${unlockedLead.leadId}</td>
                                                                </tr>
                                                                <tr>
                                                                    <td style="padding:4px 0;font-size:14px;color:#6b7280;">Refund Amount</td>
                                                                    <td style="padding:4px 0;font-size:14px;color:#111827;font-weight:600;">₹${unlockedLead.amount}</td>
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
                        `Automatic Refund Initiated for Lead ID: ${unlockedLead.leadId} — ScrapCentre`,
                        emailHtml
                    )
                }
            } catch (emailErr) {
                console.error("[Reject Auto-Refund] Email sending failed:", emailErr)
            }
        }

        console.log(`[Reject] Lead ${unlockedLead.leadId} rejected by ${rvsfId}. Status: ${isAutoRefunded ? "Auto-refunded" : "Auto-refund failed"}`)

        return NextResponse.json({
            success: true,
            message: isAutoRefunded
                ? "Lead rejected. A refund has been automatically initiated to your original payment method."
                : `Lead rejected. Automatic refund failed: ${refundError}. The administrator has been notified.`,
        })


    } catch (error: any) {
        console.error("[Reject API] Error:", error)
        return NextResponse.json({ message: error.message || "Internal server error" }, { status: 500 })
    }
}

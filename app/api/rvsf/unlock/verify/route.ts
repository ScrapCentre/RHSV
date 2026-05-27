import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import connectToDatabase from "@/lib/db"
import crypto from "crypto"
import Razorpay from "razorpay"

// Models
import Valuation from "@/models/Valuation"
import ExchangeVehicle from "@/models/ExchangeVehicle"
import BuyVehicle from "@/models/BuyVehicle"
import WizardLead from "@/models/WizardLead"
import RVSFUser from "@/models/RVSFUser"
import UnlockedLead from "@/models/UnlockedLead"
import ChatThread from "@/models/ChatThread"

// ─── Model map ──────────────────────────────────────────────────
const MODEL_MAP: Record<string, any> = {
    Valuation,
    ExchangeVehicle,
    BuyVehicle,
    WizardLead,
}

// ─── Send email via Resend ──────────────────────────────────────
async function sendEmailViaResend(to: string, subject: string, html: string) {
    const RESEND_API_KEY = process.env.RESEND_API_KEY
    if (!RESEND_API_KEY) {
        console.error("[Email] RESEND_API_KEY not set")
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
            console.error("[Email] Failed to send:", data)
        } else {
            console.log("[Email] Sent to:", to)
        }
    } catch (err) {
        console.error("[Email] Error:", err)
    }
}

// ─── Extract customer info from lead ────────────────────────────
function extractCustomerInfo(lead: any, source: string) {
    let name = "Customer"
    let email = ""
    let phone = ""
    let customerId = ""
    let vehicleInfo = ""

    if (source === "Valuation") {
        name = lead.contact?.name || "Customer"
        email = lead.contact?.email || ""
        phone = lead.contact?.phone || ""
        customerId = lead.userId || ""
        vehicleInfo = `${lead.year || ""} ${lead.brand || ""} ${lead.model || ""}`.trim()
    } else if (source === "ExchangeVehicle") {
        name = lead.customerName || "Customer"
        phone = lead.customerPhone || ""
        customerId = lead.userId || ""
        vehicleInfo = `${lead.oldVehicleBrand || ""} ${lead.oldVehicleModel || ""}`.trim()
    } else if (source === "BuyVehicle") {
        name = lead.customerName || "Customer"
        email = lead.customerEmail || ""
        phone = lead.customerPhone || ""
        customerId = lead.userId || ""
        vehicleInfo = `${lead.vehicleBrand || ""} ${lead.vehicleModel || ""}`.trim()
    } else if (source === "WizardLead") {
        name = lead.name || "Customer"
        phone = lead.phone || ""
        customerId = lead.userId || ""
        vehicleInfo = `${lead.year || ""} ${lead.brand || ""} ${lead.model || ""}`.trim()
    }

    return { name, email, phone, customerId, vehicleInfo }
}

// ─── Razorpay refund helper ─────────────────────────────────────
async function issueRefund(paymentId: string, amountInPaise: number) {
    const key_id = process.env.RAZORPAY_KEY_ID?.trim()
    const key_secret = process.env.RAZORPAY_KEY_SECRET?.trim()
    if (!key_id || !key_secret) throw new Error("Razorpay keys not configured")

    const razorpay = new Razorpay({ key_id, key_secret })
    const refund = await razorpay.payments.refund(paymentId, {
        amount: amountInPaise,
        speed: "normal",
        notes: { reason: "Lead already unlocked by another RVSF" },
    })
    console.log(`[Refund] Initiated refund ${refund.id} for payment ${paymentId}`)
    return refund
}

// ─── POST /api/rvsf/unlock/verify ───────────────────────────────
export async function POST(request: NextRequest) {
    try {
        // Auth check
        const session = await getServerSession(authOptions)
        if (!session || (session.user as any)?.role !== "rvsf") {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
        }

        const rvsfId = (session.user as any)?.rvsfId
        if (!rvsfId) {
            return NextResponse.json({ message: "RVSF ID not found in session" }, { status: 403 })
        }

        const body = await request.json()
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            leadId,
            source,
            amount, // in paise
        } = body

        // Validate required fields
        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !leadId || !source) {
            return NextResponse.json({ message: "Missing required payment fields" }, { status: 400 })
        }

        // ── 1. Verify Razorpay signature ────────────────────────
        const key_secret = process.env.RAZORPAY_KEY_SECRET?.trim()
        if (!key_secret) {
            return NextResponse.json({ message: "Payment configuration error" }, { status: 500 })
        }

        const expectedSignature = crypto
            .createHmac("sha256", key_secret)
            .update(`${razorpay_order_id}|${razorpay_payment_id}`)
            .digest("hex")

        if (expectedSignature !== razorpay_signature) {
            console.error("[Verify] Signature mismatch")
            return NextResponse.json({ message: "Payment verification failed — invalid signature" }, { status: 400 })
        }

        console.log(`[Verify] Signature verified for order ${razorpay_order_id}`)

        await connectToDatabase()

        // Validate source
        if (!MODEL_MAP[source]) {
            return NextResponse.json({ message: `Invalid source: ${source}` }, { status: 400 })
        }

        // ── 2. RACE CONDITION PREVENTION — Atomic lock ──────────
        // Try to atomically update the lead status ONLY if it's still "approved_to_rvsf"
        const Model = MODEL_MAP[source]
        const atomicResult = await Model.findOneAndUpdate(
            { _id: leadId, status: "approved_to_rvsf" },
            {
                $set: {
                    status: "unlocked",
                    unlockedByRvsfId: rvsfId,
                    unlockedAt: new Date(),
                    unlockPaymentId: razorpay_payment_id,
                },
            },
            { new: true }
        ).lean()

        if (!atomicResult) {
            // Lead was already taken by another RVSF!
            // Issue immediate automatic refund
            console.warn(`[Verify] RACE CONDITION: Lead ${leadId} already taken. Refunding ${razorpay_payment_id}`)
            try {
                await issueRefund(razorpay_payment_id, amount || 0)
            } catch (refundErr) {
                console.error("[Verify] Refund failed:", refundErr)
            }
            return NextResponse.json(
                { message: "Sorry, this lead was just unlocked by another RVSF. Your payment has been automatically refunded. Please browse other available leads." },
                { status: 409 }
            )
        }

        const lead = atomicResult as any
        console.log(`[Verify] Lead ${leadId} atomically locked by ${rvsfId}`)

        // ── 3. Extract customer info ────────────────────────────
        const customer = extractCustomerInfo(lead, source)

        // ── 4. Fetch RVSF user details ──────────────────────────
        const rvsfUser = await RVSFUser.findOne({ rvsfId }).lean() as any

        // ── 5. Create UnlockedLead document ─────────────────────
        await UnlockedLead.create({
            leadId,
            leadSource: source,
            rvsfId,
            customerId: customer.customerId,
            customerName: customer.name,
            customerEmail: customer.email,
            customerPhone: customer.phone,
            vehicleInfo: customer.vehicleInfo,
            unlockPaymentId: razorpay_payment_id,
            razorpayOrderId: razorpay_order_id,
            amount: (amount || 0) / 100, // Convert paise to rupees
            unlockedAt: new Date(),
            status: "pending_decision",
        })

        // ── 6. Add to purchasedLeads array on RVSFUser ──────────
        await RVSFUser.updateOne(
            { rvsfId },
            { $addToSet: { purchasedLeads: leadId } }
        )

        // ── 7. Create chat thread with system message ───────────
        const rvsfName = rvsfUser?.name || "An RVSF"
        await ChatThread.create({
            leadId,
            rvsfId,
            customerId: customer.customerId,
            messages: [
                {
                    sender: "system",
                    message: `${rvsfName} has unlocked your lead and will reach out shortly.`,
                    isSystemMessage: true,
                    createdAt: new Date(),
                },
            ],
        })

        // ── 8. Send email to customer ───────────────────────────
        if (customer.email) {
            const emailHtml = `
                <!DOCTYPE html>
                <html>
                <body style="margin:0;padding:0;background:#f4f4f5;font-family:Arial,sans-serif;">
                    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:40px 0;">
                        <tr><td align="center">
                            <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
                                <tr>
                                    <td style="background:#0E192D;padding:32px 40px;">
                                        <p style="margin:0;font-size:22px;font-weight:800;color:#ffffff;">
                                            Scrap<span style="color:#E31E24;">Centre</span><sup style="font-size:12px;color:#aaa;">®</sup>
                                        </p>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding:40px;">
                                        <h2 style="color:#0E192D;margin:0 0 16px;">Your Lead Has Been Unlocked</h2>
                                        <p style="color:#555;line-height:1.6;">
                                            Dear ${customer.name},
                                        </p>
                                        <p style="color:#555;line-height:1.6;">
                                            An RVSF (Registered Vehicle Scrapping Facility) has reviewed your vehicle lead
                                            and will contact you shortly via the platform.
                                        </p>
                                        <p style="color:#555;line-height:1.6;">
                                            You don't need to take any action right now. The facility will reach out to you
                                            to discuss the next steps for your vehicle.
                                        </p>
                                        <p style="color:#999;font-size:12px;margin-top:30px;">
                                            If you have any questions, feel free to reach out to us at
                                            <a href="mailto:support@scrapcentre.com" style="color:#E31E24;">support@scrapcentre.com</a>.
                                        </p>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="background:#f9fafb;padding:20px 40px;text-align:center;">
                                        <p style="margin:0;color:#aaa;font-size:12px;">© ${new Date().getFullYear()} ScrapCentre. All rights reserved.</p>
                                    </td>
                                </tr>
                            </table>
                        </td></tr>
                    </table>
                </body>
                </html>
            `
            await sendEmailViaResend(
                customer.email,
                "Your lead has been unlocked — ScrapCentre",
                emailHtml
            )
        }

        console.log(`[Verify] Unlock complete: Lead ${leadId} | RVSF ${rvsfId} | Payment ${razorpay_payment_id}`)

        return NextResponse.json({
            success: true,
            message: "Lead unlocked successfully!",
            unlockedLead: {
                leadId,
                source,
                vehicleInfo: customer.vehicleInfo,
                customerName: customer.name,
            },
        })

    } catch (error: any) {
        console.error("[Verify API] Error:", error)
        return NextResponse.json(
            { message: error.message || "Internal server error" },
            { status: 500 }
        )
    }
}

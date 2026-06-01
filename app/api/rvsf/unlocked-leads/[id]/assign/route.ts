import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import connectToDatabase from "@/lib/db"
import UnlockedLead from "@/models/UnlockedLead"
import CollectionCenter from "@/models/CollectionCenter"

// Dynamic import to prevent model registration issues
async function getCCOperatorModel() {
    return (await import("@/models/CCOperator")).default
}

// Resend Email Helper
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
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                from: "noreply@scrapcentre.com",
                to,
                subject,
                html
            })
        })
        const data = await res.json()
        return data
    } catch (err) {
        console.error("[Email] Resend error:", err)
    }
}

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
            return NextResponse.json({ message: "RVSF ID not found in session" }, { status: 403 })
        }

        const resolvedParams = await params
        const unlockedLeadId = resolvedParams.id

        const body = await request.json()
        const { ccId } = body // ccId is the _id of CollectionCenter

        if (!ccId) {
            return NextResponse.json({ message: "Collection Center ID is required" }, { status: 400 })
        }

        await connectToDatabase()

        // 1. Verify Unlocked Lead belongs to this RVSF
        const lead = await UnlockedLead.findOne({ _id: unlockedLeadId, rvsfId })
        if (!lead) {
            return NextResponse.json({ message: "Unlocked lead not found" }, { status: 404 })
        }

        // 2. Verify Collection Center belongs to this RVSF
        const cc = await CollectionCenter.findOne({ _id: ccId, rvsfId })
        if (!cc) {
            return NextResponse.json({ message: "Collection Center not found" }, { status: 404 })
        }

        // 3. Find CC Operator
        const CCOperator = await getCCOperatorModel()
        const operator = await CCOperator.findOne({ email: cc.contactPersonEmail.toLowerCase() })
        if (!operator) {
            return NextResponse.json({ message: "CC Operator account not found for this center" }, { status: 404 })
        }

        // 4. Update the Lead document
        lead.assignedCcId = operator.ccId
        lead.assignedCcName = cc.name
        lead.assignedAt = new Date()
        lead.status = "assigned_to_cc"
        await lead.save()

        // 5. Send notification email to CC Operator
        const emailHtml = `
            <h3>New Lead Assigned — ScrapCentre</h3>
            <p>Hello ${operator.name},</p>
            <p>A new vehicle lead has been assigned to your Collection Center (${cc.name}).</p>
            <p>Please log in to your dashboard to view the details.</p>
            <p>Thank you,<br/>ScrapCentre Team</p>
        `
        await sendEmailViaResend(operator.email, "New Lead Assigned — ScrapCentre", emailHtml)

        return NextResponse.json({
            message: "Lead successfully assigned to Collection Center",
            assignedCcId: operator.ccId,
            assignedCcName: cc.name
        })

    } catch (error: any) {
        console.error("Error in lead assignment POST:", error)
        return NextResponse.json({ message: error.message || "Internal server error" }, { status: 500 })
    }
}

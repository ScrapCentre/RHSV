import { NextRequest, NextResponse } from "next/server"
import connectToDatabase from "@/lib/db"
import CollectionCenter from "@/models/CollectionCenter"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"

export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        if (!session || (session.user as any).role !== "rvsf") {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
        }
        const rvsfId = (session.user as any).rvsfId
        if (!rvsfId) return NextResponse.json({ message: "No RVSF ID in session" }, { status: 400 })

        await connectToDatabase()
        const centers = await CollectionCenter.find({ rvsfId }).sort({ createdAt: -1 }).lean()
        return NextResponse.json({ data: centers })
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 })
    }
}

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        if (!session || (session.user as any).role !== "rvsf") {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
        }
        const rvsfId = (session.user as any).rvsfId
        if (!rvsfId) return NextResponse.json({ message: "No RVSF ID in session" }, { status: 400 })

        const body = await request.json()
        const { name, fullAddress, city, state, pincode, catchmentRadius, contactPersonName, contactPersonPhone, contactPersonEmail } = body

        if (!name || !fullAddress || !city || !state || !pincode || !contactPersonName || !contactPersonPhone || !contactPersonEmail) {
            return NextResponse.json({ message: "All fields are required." }, { status: 400 })
        }

        await connectToDatabase()

        // Import here to avoid model registration issues
        const CCOperator = (await import("@/models/CCOperator")).default
        const bcrypt = (await import("bcryptjs")).default

        // Auto-generate CC operator credentials
        const ccId = "CC" + Math.floor(100000 + Math.random() * 900000)
        const tempPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-4).toUpperCase()
        const hashedPassword = await bcrypt.hash(tempPassword, 10)

        // Check if email already exists
        const existingOp = await CCOperator.findOne({ email: contactPersonEmail.toLowerCase() })
        if (existingOp) {
            return NextResponse.json({ message: "A CC operator with this email already exists." }, { status: 400 })
        }

        // Create Collection Center
        const cc = await CollectionCenter.create({
            rvsfId, name, fullAddress, city, state, pincode: String(pincode),
            catchmentRadius: Number(catchmentRadius),
            contactPersonName, contactPersonPhone, contactPersonEmail,
        })

        // Create CC Operator account
        await CCOperator.create({
            ccId, rvsfId,
            name: contactPersonName,
            phone: contactPersonPhone,
            email: contactPersonEmail.toLowerCase(),
            password: hashedPassword,
            role: "cc_operator",
            mustChangePassword: true,
        })

        // Send email via Resend
        const RESEND_API_KEY = process.env.RESEND_API_KEY
        if (RESEND_API_KEY) {
            const emailHtml = `
                <h2>Welcome to ScrapCentre — Collection Center Operator Account</h2>
                <p>Hello ${contactPersonName},</p>
                <p>You have been registered as a CC Operator for <strong>${name}</strong>.</p>
                <p>Your login credentials are:</p>
                <p><strong>Email:</strong> ${contactPersonEmail}</p>
                <p><strong>One-Time Password:</strong> <code style="font-size:18px;background:#f5f5f5;padding:4px 10px;border-radius:4px;">${tempPassword}</code></p>
                <p style="color:red;"><strong>⚠️ You must change your password after your first login.</strong></p>
                <p>This password will not be shown again. Please keep it safe until you change it.</p>
                <p>Thank you,<br/>ScrapCentre Team</p>
            `
            try {
                await fetch("https://api.resend.com/emails", {
                    method: "POST",
                    headers: { "Authorization": `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
                    body: JSON.stringify({
                        from: "ScrapCentre <noreply@scrapcentre.com>",
                        to: contactPersonEmail,
                        subject: "Your CC Operator Login Credentials",
                        html: emailHtml,
                    })
                })
            } catch (emailErr) {
                console.error("Email send failed:", emailErr)
            }
        }

        return NextResponse.json({
            message: "Collection Center created successfully!",
            ccId: cc._id.toString(),
            tempPassword, // Send back once to show on screen
        }, { status: 201 })
    } catch (error: any) {
        console.error("CC Create Error:", error)
        return NextResponse.json({ message: error.message }, { status: 500 })
    }
}

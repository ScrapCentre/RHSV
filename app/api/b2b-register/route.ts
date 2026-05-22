import { NextResponse, type NextRequest } from "next/server"
import connectToDatabase from "@/lib/db"
import B2BRegistration from "@/models/B2BRegistration"
import { withAuth } from "@/lib/middleware/requireRole"
import { checkRateLimit } from "@/lib/services/rate-limit"

/**
 * SECURITY (hotfix 2026-05-22, P0 zero-auth audit):
 *  - POST   — PUBLIC "become a partner" registration form. Intentionally
 *             open (anonymous self-serve, no session to ride → CSRF can't
 *             apply). Abuse-protected with a per-IP rate limit instead.
 *  - PATCH  — approves/rejects a registration. ADMIN-ONLY (withAuth).
 *  - DELETE — deletes a registration. ADMIN-ONLY (withAuth).
 *  - GET    — read-only listing; safe verb, no CSRF needed.
 */

export async function POST(req: NextRequest) {
    try {
        // Abuse protection: this endpoint is intentionally anonymous, so it
        // can't use a session-bound CSRF token. Rate-limit by client IP so a
        // bot can't flood B2BRegistration docs. 5 submissions / 10 min / IP.
        const ip =
            req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
            req.headers.get("x-real-ip") ||
            "unknown"
        const rl = await checkRateLimit(`b2b-register:post:${ip}`, 5, 600)
        if (!rl.ok) {
            return NextResponse.json(
                { message: "Too many registration attempts. Please try again later." },
                { status: 429, headers: { "Retry-After": String(rl.retryAfter ?? 600) } }
            )
        }

        await connectToDatabase()
        const body = await req.json()

        const { name, address, pincode, city, state, contactNumber, email, userId } = body

        // Basic validation
        if (!name || !address || !pincode || !city || !state || !contactNumber || !email) {
            return NextResponse.json(
                { message: "All fields are required" },
                { status: 400 }
            )
        }

        // Check for existing pending registration
        if (userId) {
            const existingPending = await B2BRegistration.findOne({ userId, status: 'pending' })
            if (existingPending) {
                return NextResponse.json(
                    { message: "You already have a pending registration request." },
                    { status: 400 }
                )
            }
        }

        // Create new registration
        const newRegistration = await B2BRegistration.create({
            name,
            address,
            pincode,
            city,
            state,
            contactNumber,
            email,
            userId,
        })

        return NextResponse.json(
            { message: "Registration successful", data: newRegistration },
            { status: 201 }
        )
    } catch (error: any) {
        console.error("B2B Registration Error:", error)
        return NextResponse.json(
            { message: error.message || "Internal Server Error" },
            { status: 500 }
        )
    }
}

export async function GET(req: Request) {
    try {
        await connectToDatabase()
        const { searchParams } = new URL(req.url)
        const userId = searchParams.get("userId")
        const email = searchParams.get("email")

        if (userId) {
            // First check if they are already a partner (Approved)
            // Check by originalUserId OR email (for backward compatibility)
            const B2BPartner = (await import("@/models/B2BPartner")).default
            const partner = await B2BPartner.findOne({
                $or: [
                    { originalUserId: userId },
                    { email: email }
                ]
            })

            if (partner) {
                return NextResponse.json(
                    {
                        message: "Partner fetched successfully",
                        data: {
                            ...partner.toObject(),
                            status: "approved", // Explicitly set status for UI
                            name: partner.businessName
                        }
                    },
                    { status: 200 }
                )
            }

            // If not partner, check for pending registration
            const registration = await B2BRegistration.findOne({ userId }).sort({ createdAt: -1 })
            return NextResponse.json(
                { message: "Registration fetched successfully", data: registration },
                { status: 200 }
            )
        }

        const registrations = await B2BRegistration.find().sort({ createdAt: -1 })

        // Cache-control headers to prevent caching issues in admin panel
        return NextResponse.json(
            { message: "Registrations fetched successfully", data: registrations },
            {
                status: 200,
                headers: {
                    "Cache-Control": "no-store, max-age=0"
                }
            }
        )
    } catch (error: any) {
        console.error("B2B Fetch Error:", error)
        return NextResponse.json(
            { message: error.message || "Internal Server Error" },
            { status: 500 }
        )
    }
}

// ADMIN-ONLY: deletes a B2B registration request. `withAuth` enforces the
// admin role gate AND CSRF (double-submit) before the handler runs.
export const DELETE = withAuth(["admin"], async (req) => {
    try {
        await connectToDatabase()
        const { searchParams } = new URL(req.url)
        const id = searchParams.get("id")

        if (!id) {
            return NextResponse.json(
                { message: "Registration ID is required" },
                { status: 400 }
            )
        }

        const deletedRegistration = await B2BRegistration.findByIdAndDelete(id)

        if (!deletedRegistration) {
            return NextResponse.json(
                { message: "Registration not found" },
                { status: 404 }
            )
        }

        return NextResponse.json(
            { message: "Registration deleted successfully" },
            { status: 200 }
        )
    } catch (error: any) {
        console.error("B2B Deletion Error:", error)
        return NextResponse.json(
            { message: error.message || "Internal Server Error" },
            { status: 500 }
        )
    }
})

// ADMIN-ONLY: approves/rejects/changes the status of a registration.
// `withAuth` enforces the admin role gate AND CSRF before the handler runs.
export const PATCH = withAuth(["admin"], async (req) => {
    try {
        await connectToDatabase()
        const { searchParams } = new URL(req.url)
        const id = searchParams.get("id")
        const { status } = await req.json()

        if (!id || !status) {
            return NextResponse.json(
                { message: "Registration ID and Status are required" },
                { status: 400 }
            )
        }

        const updatedRegistration = await B2BRegistration.findByIdAndUpdate(
            id,
            { status },
            { new: true }
        )

        if (!updatedRegistration) {
            return NextResponse.json(
                { message: "Registration not found" },
                { status: 404 }
            )
        }

        return NextResponse.json(
            { message: `Registration ${status} successfully`, data: updatedRegistration },
            { status: 200 }
        )
    } catch (error: any) {
        console.error("B2B Status Update Error:", error)
        return NextResponse.json(
            { message: error.message || "Internal Server Error" },
            { status: 500 }
        )
    }
})

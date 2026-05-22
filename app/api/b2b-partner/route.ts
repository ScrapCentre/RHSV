import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import connectToDatabase from "@/lib/db"
import B2BPartner from "@/models/B2BPartner"
import B2BRegistration from "@/models/B2BRegistration"
import { withAuth } from "@/lib/middleware/requireRole"

/**
 * SECURITY (hotfix 2026-05-22, P0 zero-auth audit):
 *  - POST — provisions a B2B partner LOGIN account. The only live caller is
 *           the admin "Access Generator" page (app/admin/b2b-generator),
 *           which sits behind the admin panel. This is NOT a public
 *           self-serve endpoint, so it is gated ADMIN-ONLY via `withAuth`
 *           (role gate + CSRF for free).
 *           Additionally, the password is now bcrypt-hashed before storage
 *           (was plaintext). Both B2B login providers in lib/auth.ts already
 *           detect a `$2`-prefixed hash and `bcrypt.compare` against it, so
 *           this is backward-compatible with any existing plaintext docs.
 *  - GET  — read-only listing; safe verb, no CSRF needed.
 */

// ADMIN-ONLY: creates a B2B partner login account. `withAuth` enforces the
// admin role gate AND CSRF (double-submit) before the handler runs.
export const POST = withAuth(["admin"], async (req) => {
    try {
        await connectToDatabase()
        const body = await req.json()

        const { userId, password, businessName, contactNumber, email, address, city, state, pincode, registrationId, originalUserId } = body

        // Basic validation
        if (!userId || !password || !businessName) {
            return NextResponse.json(
                { message: "User ID, Password and Business Name are required" },
                { status: 400 }
            )
        }

        // Check if userId already exists
        const existingUser = await B2BPartner.findOne({ userId })
        if (existingUser) {
            return NextResponse.json(
                { message: "User ID already exists" },
                { status: 400 }
            )
        }

        // Hash the password before storage — NEVER persist plaintext.
        // Mirrors app/api/register/route.ts (bcrypt.hash(pw, 10)).
        const hashedPassword = await bcrypt.hash(password, 10)

        // Create new partner
        const newPartner = await B2BPartner.create({
            userId,
            password: hashedPassword,
            businessName,
            contactNumber,
            email,
            address,
            city,
            state,
            pincode,
            registrationId,
            originalUserId
        })

        // If created successfully, and we have a registrationId, delete the original request
        if (registrationId) {
            await B2BRegistration.findByIdAndDelete(registrationId)
        }

        // Strip the password hash from the response — don't echo credentials back.
        const { password: _pw, ...partnerSafe } = newPartner.toObject()

        return NextResponse.json(
            { message: "Partner created successfully", data: partnerSafe },
            { status: 201 }
        )
    } catch (error: any) {
        console.error("B2B Partner Creation Error:", error)
        return NextResponse.json(
            { message: error.message || "Internal Server Error" },
            { status: 500 }
        )
    }
})

export async function GET() {
    try {
        await connectToDatabase()
        const partners = await B2BPartner.find().sort({ createdAt: -1 })

        // Cache-control to prevent stale data
        return NextResponse.json(
            { message: "Partners fetched successfully", data: partners },
            {
                status: 200,
                headers: {
                    "Cache-Control": "no-store, max-age=0"
                }
            }
        )
    } catch (error: any) {
        console.error("B2B Partner Fetch Error:", error)
        return NextResponse.json(
            { message: error.message || "Internal Server Error" },
            { status: 500 }
        )
    }
}


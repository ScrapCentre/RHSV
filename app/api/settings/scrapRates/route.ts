import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import connectToDatabase from "@/lib/db"
import Setting from "@/models/Setting"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { requireCsrf } from "@/lib/middleware/csrf"

export const dynamic = "force-dynamic"

// GET /api/settings/scrapRates - Fetch the current scrap rate, pickup charge, and RVSF lead price
export async function GET() {
    try {
        await connectToDatabase()

        // Fetch scrap price, default to 25 if not set
        const setting = await Setting.findOne({ key: "scrapPricePerKg" })
        const price = setting ? setting.value : 25

        // Fetch pickup charge, default to 5 if not set
        const pickupSetting = await Setting.findOne({ key: "pickupChargePerKm" })
        const pickupCharge = pickupSetting ? pickupSetting.value : 5

        // Fetch RVSF lead price, default to 499 if not set
        const rvsfLeadSetting = await Setting.findOne({ key: "rvsfLeadPrice" })
        const rvsfLeadPrice = rvsfLeadSetting ? rvsfLeadSetting.value : 499

        return NextResponse.json({ 
            scrapPricePerKg: price, 
            pickupChargePerKm: pickupCharge,
            rvsfLeadPrice: rvsfLeadPrice
        }, { status: 200 })
    } catch (error) {
        console.error("Error fetching settings:", error)
        return NextResponse.json({ message: "Internal server error" }, { status: 500 })
    }
}

// POST /api/settings/scrapRates - Update settings
export async function POST(req: NextRequest) {
    // CSRF guard — this route calls getServerSession directly (no `withAuth`
    // wrapper), so per lib/middleware/csrf.ts it must add requireCsrf itself.
    const csrfFail = requireCsrf(req)
    if (csrfFail) return csrfFail
    try {
        const session = await getServerSession(authOptions)

        // Only allow admin to change settings
        if ((session?.user as any)?.role !== "admin") {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
        }

        const body = await req.json()
        const { scrapPricePerKg, pickupChargePerKm, rvsfLeadPrice } = body

        await connectToDatabase()

        // Update Scrap Price if valid
        if (typeof scrapPricePerKg === 'number' && scrapPricePerKg > 0) {
            await Setting.findOneAndUpdate(
                { key: "scrapPricePerKg" },
                {
                    value: scrapPricePerKg,
                    description: "Global base rate for scrap calculation per kg"
                },
                { upsert: true, new: true }
            )
        }

        // Update Pickup Charge if valid
        if (typeof pickupChargePerKm === 'number' && pickupChargePerKm >= 0) {
            await Setting.findOneAndUpdate(
                { key: "pickupChargePerKm" },
                {
                    value: pickupChargePerKm,
                    description: "Global rate for pickup charge per kilometer"
                },
                { upsert: true, new: true }
            )
        }

        // Update RVSF Lead Price if valid
        if (typeof rvsfLeadPrice === 'number' && rvsfLeadPrice > 0) {
            await Setting.findOneAndUpdate(
                { key: "rvsfLeadPrice" },
                {
                    value: rvsfLeadPrice,
                    description: "Global price per lead for RVSF registration"
                },
                { upsert: true, new: true }
            )
        }

        return NextResponse.json(
            { 
                message: "Settings updated successfully", 
                scrapPricePerKg, 
                pickupChargePerKm,
                rvsfLeadPrice
            },
            { status: 200 }
        )
    } catch (error) {
        console.error("Error updating settings:", error)
        return NextResponse.json({ message: "Internal server error" }, { status: 500 })
    }
}

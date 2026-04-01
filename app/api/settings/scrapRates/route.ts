import { NextResponse } from "next/server"
import connectToDatabase from "@/lib/db"
import Setting from "@/models/Setting"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

// GET /api/settings/scrapRates - Fetch the current scrap rate and pickup charge
export async function GET() {
    try {
        await connectToDatabase()

        // Fetch scrap price, default to 25 if not set
        const setting = await Setting.findOne({ key: "scrapPricePerKg" })
        const price = setting ? setting.value : 25

        // Fetch pickup charge, default to 5 if not set
        const pickupSetting = await Setting.findOne({ key: "pickupChargePerKm" })
        const pickupCharge = pickupSetting ? pickupSetting.value : 5

        return NextResponse.json({ scrapPricePerKg: price, pickupChargePerKm: pickupCharge }, { status: 200 })
    } catch (error) {
        console.error("Error fetching settings:", error)
        return NextResponse.json({ message: "Internal server error" }, { status: 500 })
    }
}

// POST /api/settings/scrapRates - Update settings
export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions)

        // Only allow admin to change settings
        if ((session?.user as any)?.role !== "admin") {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
        }

        const body = await req.json()
        const { scrapPricePerKg, pickupChargePerKm } = body

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

        return NextResponse.json(
            { message: "Settings updated successfully", scrapPricePerKg, pickupChargePerKm },
            { status: 200 }
        )
    } catch (error) {
        console.error("Error updating settings:", error)
        return NextResponse.json({ message: "Internal server error" }, { status: 500 })
    }
}

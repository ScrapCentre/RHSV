import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import connectToDatabase from "@/lib/db"
import Razorpay from "razorpay"

// Models
import Valuation from "@/models/Valuation"
import ExchangeVehicle from "@/models/ExchangeVehicle"
import BuyVehicle from "@/models/BuyVehicle"
import WizardLead from "@/models/WizardLead"
import RVSFUser from "@/models/RVSFUser"

// ─── Model map ──────────────────────────────────────────────────
const MODEL_MAP: Record<string, any> = {
    Valuation,
    ExchangeVehicle,
    BuyVehicle,
    WizardLead,
}

// ─── Extract weight from lead ───────────────────────────────────
// Returns weight in TONS (numeric). Falls back to 1 ton if missing.
function extractWeightTons(lead: any, source: string): number {
    let weightKg = 0

    if (source === "Valuation") {
        // vehicleWeight is stored as string, could be in tons or kg
        const raw = parseFloat(lead.vehicleWeight || "0")
        if (raw > 0) {
            // If value is < 10, it's likely in tons; otherwise kg
            weightKg = raw < 10 ? raw * 1000 : raw
        }
    } else if (source === "WizardLead") {
        // weight field — stored as string (tons)
        const raw = parseFloat(lead.weight || "0")
        if (raw > 0) {
            weightKg = raw < 10 ? raw * 1000 : raw
        }
    }
    // ExchangeVehicle and BuyVehicle don't have weight fields

    // Convert to tons
    const tons = weightKg > 0 ? weightKg / 1000 : 0
    return tons
}

// ─── Calculate unlock price ─────────────────────────────────────
// Formula: max(VAHAN weight, secondary API weight) × 0.75
// Since we only have one weight source currently, we use it directly.
// Minimum unlock price: ₹99
// For BuyVehicle leads (no weight): flat ₹99
function calculateUnlockPrice(lead: any, source: string): number {
    if (source === "BuyVehicle") {
        return 99 // Flat rate for buy leads
    }

    const weightTons = extractWeightTons(lead, source)

    if (weightTons <= 0) {
        // No weight data — use flat rate based on estimated value
        if (lead.estimatedValue && lead.estimatedValue > 0) {
            // 0.75% of estimated value, min ₹99, max ₹999
            const price = Math.round(lead.estimatedValue * 0.0075)
            return Math.max(99, Math.min(price, 999))
        }
        return 199 // Default fallback
    }

    // weight (tons) × ₹750 per ton (0.75 × 1000)
    const price = Math.round(weightTons * 750)
    return Math.max(99, Math.min(price, 999))
}

// ─── Razorpay instance ──────────────────────────────────────────
function getRazorpayInstance() {
    const key_id = process.env.RAZORPAY_KEY_ID?.trim()
    const key_secret = process.env.RAZORPAY_KEY_SECRET?.trim()

    if (!key_id || !key_secret) {
        throw new Error("Razorpay keys not configured")
    }

    return new Razorpay({ key_id, key_secret })
}

// ─── POST /api/rvsf/unlock/create-order ─────────────────────────
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
        const { leadId, source } = body

        if (!leadId || !source) {
            return NextResponse.json(
                { message: "leadId and source are required" },
                { status: 400 }
            )
        }

        // Validate source
        if (!MODEL_MAP[source]) {
            return NextResponse.json(
                { message: `Invalid source: ${source}. Must be one of: ${Object.keys(MODEL_MAP).join(", ")}` },
                { status: 400 }
            )
        }

        await connectToDatabase()

        // Fetch the lead
        const Model = MODEL_MAP[source]
        const lead = await Model.findById(leadId).lean()

        if (!lead) {
            return NextResponse.json({ message: "Lead not found" }, { status: 404 })
        }

        // Check lead is still approved_to_rvsf
        if ((lead as any).status !== "approved_to_rvsf") {
            return NextResponse.json(
                { message: "This lead is no longer available for unlocking" },
                { status: 400 }
            )
        }

        // Fetch RVSF user for receipt info
        const rvsfUser = await RVSFUser.findOne({ rvsfId }).lean() as any
        if (!rvsfUser) {
            return NextResponse.json({ message: "RVSF user not found" }, { status: 404 })
        }

        // Check if already purchased
        if (rvsfUser.purchasedLeads?.includes(leadId)) {
            return NextResponse.json(
                { message: "You have already unlocked this lead" },
                { status: 400 }
            )
        }

        // Calculate unlock price
        const unlockPrice = calculateUnlockPrice(lead, source)
        const amountInPaise = unlockPrice * 100 // Razorpay expects paise

        // Build lead description
        let leadDescription = "Vehicle Lead Unlock"
        if (source === "Valuation") {
            const l = lead as any
            leadDescription = `${l.year || ""} ${l.brand || ""} ${l.model || ""}`.trim() || "Vehicle Lead"
        } else if (source === "WizardLead") {
            const l = lead as any
            leadDescription = `${l.year || ""} ${l.brand || ""} ${l.model || ""}`.trim() || "Vehicle Lead"
        } else if (source === "ExchangeVehicle") {
            const l = lead as any
            leadDescription = `${l.oldVehicleBrand || ""} ${l.oldVehicleModel || ""}`.trim() || "Exchange Lead"
        } else if (source === "BuyVehicle") {
            const l = lead as any
            leadDescription = `${l.vehicleBrand || ""} ${l.vehicleModel || ""}`.trim() || "Buy Lead"
        }

        // Create Razorpay order
        const razorpay = getRazorpayInstance()
        const order = await razorpay.orders.create({
            amount: amountInPaise,
            currency: "INR",
            receipt: `unlock_${rvsfId}_${leadId.slice(-6)}`,
            notes: {
                leadId,
                source,
                rvsfId,
                rvsfEmail: rvsfUser.email,
                unlockPrice: unlockPrice.toString(),
                leadDescription,
            },
        })

        console.log(`[Unlock] Order created: ${order.id} | Lead: ${leadId} | RVSF: ${rvsfId} | ₹${unlockPrice}`)

        return NextResponse.json({
            orderId: order.id,
            amount: amountInPaise,
            currency: "INR",
            unlockPrice,
            leadDescription,
            rvsfName: rvsfUser.name,
            rvsfEmail: rvsfUser.email,
            keyId: process.env.RAZORPAY_KEY_ID?.trim(),
        })

    } catch (error: any) {
        console.error("[Unlock Create Order] Error:", error)
        return NextResponse.json(
            { message: error.message || "Internal server error" },
            { status: 500 }
        )
    }
}

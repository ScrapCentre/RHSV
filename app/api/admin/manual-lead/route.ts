import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import connectToDatabase from "@/lib/db"
import WizardLead from "@/models/WizardLead"
import { z } from "zod"

const manualLeadSchema = z.object({
    category: z.enum(["scrap_only", "buy_only", "scrap_and_buy"]),
    name: z.string().trim().min(1, "Name is required"),
    phone: z.string().trim().regex(/^(\+91)?[6-9]\d{9}$/, "Invalid 10-digit Indian phone number"),
    pincode: z.string().trim().regex(/^\d{6}$/, "Pincode must be exactly 6 digits").optional().or(z.literal("")),
    city: z.string().trim().optional(),
    state: z.string().trim().optional(),
    
    // Scrap vehicle details (required if category is scrap_only or scrap_and_buy)
    brand: z.string().trim().optional(),
    model: z.string().trim().optional(),
    year: z.union([z.string(), z.number()]).optional(),
    regNo: z.string().trim().toUpperCase().optional(),
    fuel: z.union([z.array(z.string()), z.string()]).optional(),
    kms: z.union([z.string(), z.number()]).optional(),
    weight: z.union([z.string(), z.number()]).optional(),

    // Desired new vehicle details (required if category is buy_only or scrap_and_buy)
    desiredCompany: z.string().trim().optional(),
    desiredModel: z.string().trim().optional(),
    carPhoto: z.string().trim().optional().or(z.literal("")),
})

export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        const role = (session?.user as any)?.role
        if (!session || (role !== "admin" && role !== "executive")) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
        }

        await connectToDatabase()
        const leads = await WizardLead.find({ isManual: true }).sort({ createdAt: -1 })
        return NextResponse.json(leads)
    } catch (error: any) {
        console.error("Error fetching manual leads:", error)
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 })
    }
}

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        const role = (session?.user as any)?.role
        if (!session || (role !== "admin" && role !== "executive")) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
        }

        const body = await req.json()
        const parsed = manualLeadSchema.safeParse(body)
        if (!parsed.success) {
            const errorMsg = parsed.error.issues[0]?.message || "Validation failed"
            return NextResponse.json({ message: errorMsg }, { status: 400 })
        }

        const data = parsed.data

        // Additional validation based on lead category
        if (data.category === "scrap_only" || data.category === "scrap_and_buy") {
            if (!data.brand) {
                return NextResponse.json({ message: "Vehicle Brand is required for scrap leads" }, { status: 400 })
            }
            if (!data.model) {
                return NextResponse.json({ message: "Vehicle Model is required for scrap leads" }, { status: 400 })
            }
        }
        if (data.category === "buy_only" || data.category === "scrap_and_buy") {
            if (!data.desiredCompany) {
                return NextResponse.json({ message: "Desired Brand is required for buy leads" }, { status: 400 })
            }
            if (!data.desiredModel) {
                return NextResponse.json({ message: "Desired Model is required for buy leads" }, { status: 400 })
            }
        }

        await connectToDatabase()

        // Map category to serviceType
        let serviceType = "scrap"
        if (data.category === "buy_only") {
            serviceType = "buy"
        }

        // Format fuel type array
        let fuels: string[] = []
        if (data.fuel) {
            fuels = Array.isArray(data.fuel) ? data.fuel : [data.fuel]
        }

        // Parse year & kms if provided
        let yearVal = undefined
        if (data.year) {
            const yr = parseInt(String(data.year), 10)
            if (!isNaN(yr)) yearVal = String(yr)
        }

        let kmsVal = undefined
        if (data.kms) {
            const km = parseFloat(String(data.kms))
            if (!isNaN(km)) kmsVal = String(km)
        }

        const newLead = new WizardLead({
            serviceType,
            category: data.category,
            name: data.name,
            phone: data.phone,
            pincode: data.pincode || undefined,
            city: data.city || undefined,
            state: data.state || undefined,
            brand: data.brand || undefined,
            model: data.model || undefined,
            year: yearVal,
            regNo: data.regNo || undefined,
            fuel: fuels,
            kms: kmsVal,
            weight: data.weight ? String(data.weight) : undefined,
            desiredCompany: data.desiredCompany || undefined,
            desiredModel: data.desiredModel || undefined,
            isManual: true,
            status: "pending",
            carPhoto: data.carPhoto || undefined
        })

        const savedLead = await newLead.save()
        return NextResponse.json({ message: "Manual lead saved successfully", lead: savedLead }, { status: 201 })
    } catch (error: any) {
        console.error("Error creating manual lead:", error)
        return NextResponse.json({ message: "Internal Server Error", details: error.message }, { status: 500 })
    }
}

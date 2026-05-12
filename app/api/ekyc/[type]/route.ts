// engineering-design.md §11 / 07-tech-debt HIGH — session check + ownership check added
import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import connectToDatabase from "@/lib/db"
import SellVehicle from "@/models/SellVehicle"
import Valuation from "@/models/Valuation"
import ExchangeVehicle from "@/models/ExchangeVehicle"
import { uploadToCloudinary } from "@/lib/cloudinary"

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ type: string }> }
) {
    // Require authentication — engineering-design.md §11
    const session = await getServerSession(authOptions)
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    const userId = (session.user as any).id as string

    try {
        await connectToDatabase()

        const { type } = await params
        const validTypes = ["sell", "valuation", "exchange"]

        if (!validTypes.includes(type)) {
            return NextResponse.json({ error: "Invalid eKYC form type" }, { status: 400 })
        }

        const formData = await req.formData()

        const id = formData.get("id") as string
        const firstName = formData.get("firstName") as string
        const dob = formData.get("dob") as string
        const aadharPhone = formData.get("aadharPhone") as string
        const aadharNumber = formData.get("aadharNumber") as string

        const aadharFile = formData.get("aadharFile") as File
        const rcFile = formData.get("rcFile") as File
        const carPhoto = formData.get("carPhoto") as File

        if (!id) {
            return NextResponse.json({ error: "Missing document ID" }, { status: 400 })
        }

        let Model: typeof SellVehicle | typeof Valuation | typeof ExchangeVehicle
        switch (type) {
            case "sell":     Model = SellVehicle;     break
            case "valuation": Model = Valuation;      break
            case "exchange": Model = ExchangeVehicle; break
            default:         Model = Valuation
        }

        // Ownership check — IDOR fix per 07-tech-debt HIGH
        const existingRecord = await (Model as any).findOne({ _id: id, userId })
        if (!existingRecord) {
            return NextResponse.json({ error: "Record not found or access denied" }, { status: 404 })
        }

        const uploadFile = async (file: File | null, folder: string) => {
            if (!file) return null
            // Validate file type and size — 07-tech-debt MEDIUM
            const allowedTypes = ["image/jpeg", "image/png", "image/webp", "application/pdf"]
            if (!allowedTypes.includes(file.type)) return null
            if (file.size > 5 * 1024 * 1024) return null
            const buffer = Buffer.from(await file.arrayBuffer())
            const filename = `${folder}_${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.\-_]/g, '')}`
            return await uploadToCloudinary(buffer, `scrapcentre/ekyc/${type}/${id}`, filename)
        }

        const [aadharUrl, rcUrl, carPhotoUrl] = await Promise.all([
            uploadFile(aadharFile, "aadhar"),
            uploadFile(rcFile, "rc"),
            uploadFile(carPhoto, "car")
        ])

        const updateData: any = {
            firstName,
            dob,
            aadharPhone,
            aadharNumber,
            ...(aadharUrl && { aadharFile: aadharUrl }),
            ...(rcUrl && { rcFile: rcUrl }),
            ...(carPhotoUrl && { carPhoto: carPhotoUrl }),
            // Set to "pending" — not auto-verified; engineering-design.md §11 / 07-tech-debt HIGH
            ekycStatus: "pending"
        }

        const updatedDoc = await (Model as any).findByIdAndUpdate(
            id,
            { $set: updateData },
            { new: true }
        )

        if (!updatedDoc) {
            return NextResponse.json({ error: "Document not found" }, { status: 404 })
        }

        return NextResponse.json({
            success: true,
            message: "eKYC documents submitted successfully",
            document: updatedDoc
        })

    } catch (error: any) {
        console.error("eKYC upload error:", error?.message)
        return NextResponse.json(
            { error: "Failed to upload eKYC documents" },
            { status: 500 }
        )
    }
}

// engineering-design.md §11 / 07-tech-debt HIGH — session check + ownership check added
// ekycStatus no longer auto-set to "verified" (set to "pending" per tech debt fix)
import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import connectToDatabase from "@/lib/db"
import Valuation from "@/models/Valuation"
import SellVehicle from "@/models/SellVehicle"
import ExchangeVehicle from "@/models/ExchangeVehicle"
import { uploadToCloudinary } from "@/lib/cloudinary"

export async function PATCH(req: NextRequest) {
    // Require authentication — engineering-design.md §11 / 07-tech-debt HIGH
    const session = await getServerSession(authOptions)
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    const userId = (session.user as any).id as string

    try {
        const formData = await req.formData()
        const valuationId = formData.get("valuationId") as string
        const source = formData.get("source") as string

        const firstName = formData.get("firstName") as string
        const dob = formData.get("dob") as string
        const aadharPhone = formData.get("aadharPhone") as string
        const aadharNumber = formData.get("aadharNumber") as string

        if (!valuationId) {
            return NextResponse.json(
                { message: "Valuation ID is required" },
                { status: 400 }
            )
        }

        const aadharFile = formData.get("aadharFile") as File
        const rcFile = formData.get("rcFile") as File
        const carPhoto = formData.get("carPhoto") as File

        await connectToDatabase()

        // Ownership check — only allow update of own records (IDOR fix)
        let Model: typeof Valuation | typeof SellVehicle | typeof ExchangeVehicle
        if (source === "sell-vehicle") {
            Model = SellVehicle
        } else if (source === "exchange-vehicle") {
            Model = ExchangeVehicle
        } else {
            Model = Valuation
        }

        const existingRecord = await (Model as any).findOne({ _id: valuationId, userId })
        if (!existingRecord) {
            return NextResponse.json(
                { message: "Record not found or access denied" },
                { status: 404 }
            )
        }

        const uploadFile = async (file: File | null, folder: string) => {
            if (!file || typeof file === "string") return null
            // Validate file type and size — engineering-design.md §11 / 07-tech-debt MEDIUM
            const allowedTypes = ["image/jpeg", "image/png", "image/webp", "application/pdf"]
            if (!allowedTypes.includes(file.type)) return null
            if (file.size > 5 * 1024 * 1024) return null  // 5MB cap
            const buffer = Buffer.from(await file.arrayBuffer())
            const cleanName = file.name.replace(/\.[^/.]+$/, "").replace(/[^a-zA-Z0-9.\-_]/g, '')
            const publicId = `${folder}_${Date.now()}_${cleanName}`
            return await uploadToCloudinary(buffer, `scrapcentre/ekyc/${valuationId}`, publicId, "auto")
        }

        const [aadharUrl, rcUrl, carPhotoUrl] = await Promise.all([
            uploadFile(aadharFile, "aadhar"),
            uploadFile(rcFile, "rc"),
            uploadFile(carPhoto, "car")
        ])

        const ekycData: any = {
            firstName,
            dob,
            aadharPhone,
            aadharNumber,
            // Set to "pending" not "verified" — real validation happens via admin/integration
            // engineering-design.md §11 / 07-tech-debt HIGH
            ekycStatus: "pending"
        }

        if (aadharUrl) ekycData.aadharFile = aadharUrl
        if (rcUrl) ekycData.rcFile = rcUrl
        if (carPhotoUrl) ekycData.carPhoto = carPhotoUrl

        let updateStatus = source === "sell-vehicle" || source === "exchange-vehicle" ? "pending" : "reviewed"

        const updatedRecord = await (Model as any).findByIdAndUpdate(
            valuationId,
            { $set: { ...ekycData, status: updateStatus } },
            { new: true }
        )

        return NextResponse.json(
            { message: "eKYC Details submitted successfully", success: true, record: updatedRecord },
            { status: 200 }
        )

    } catch (error) {
        console.error("eKYC update error:", (error as any)?.message)
        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 }
        )
    }
}

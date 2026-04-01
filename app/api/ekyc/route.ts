import { type NextRequest, NextResponse } from "next/server"
import connectToDatabase from "@/lib/db"
import Valuation from "@/models/Valuation"
import SellVehicle from "@/models/SellVehicle"
import ExchangeVehicle from "@/models/ExchangeVehicle"
import { uploadToCloudinary } from "@/lib/cloudinary"

export async function PATCH(req: NextRequest) {
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

        const uploadFile = async (file: File | null, folder: string) => {
            if (!file || typeof file === "string") return null
            const buffer = Buffer.from(await file.arrayBuffer())

            // Clean publicId - remove extension if present
            const cleanName = file.name.replace(/\.[^/.]+$/, "").replace(/[^a-zA-Z0-9.\-_]/g, '')
            const publicId = `${folder}_${Date.now()}_${cleanName}`

            // Use resource_type: "auto" for all documents (now images)
            return await uploadToCloudinary(buffer, `autoscrap/ekyc/${valuationId}`, publicId, "auto")
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
            ekycStatus: "verified"
        }

        if (aadharUrl) ekycData.aadharFile = aadharUrl
        if (rcUrl) ekycData.rcFile = rcUrl
        if (carPhotoUrl) ekycData.carPhoto = carPhotoUrl

        let Model;
        let updateStatus = "pending";

        if (source === "sell-vehicle") {
            Model = SellVehicle
        } else if (source === "exchange-vehicle") {
            Model = ExchangeVehicle
        } else {
            Model = Valuation
            updateStatus = "reviewed"
        }

        const updatedRecord = await Model.findByIdAndUpdate(
            valuationId,
            {
                $set: {
                    ...ekycData,
                    status: updateStatus
                }
            },
            { new: true }
        )

        if (!updatedRecord) {
            return NextResponse.json(
                { message: "Record not found" },
                { status: 404 }
            )
        }

        return NextResponse.json(
            { message: "eKYC Details updated successfully", success: true, record: updatedRecord },
            { status: 200 }
        )

    } catch (error) {
        console.error("eKYC update error:", error)
        return NextResponse.json(
            { message: "Internal server error", error: String(error) },
            { status: 500 }
        )
    }
}


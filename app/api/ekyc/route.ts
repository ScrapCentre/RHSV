import { type NextRequest, NextResponse } from "next/server"
import connectToDatabase from "@/lib/db"

import ExchangeVehicle from "@/models/ExchangeVehicle"
import WizardLead from "@/models/WizardLead"
import { uploadToCloudinary } from "@/lib/cloudinary"

export async function PATCH(req: NextRequest) {
    try {
        const formData = await req.formData()
        const valuationId = formData.get("valuationId") as string
        const source = formData.get("source") as string

        const firstName = formData.get("firstName") as string
        const dob = formData.get("dob") as string
        const whatsapp = formData.get("whatsapp") as string
        const aadharNumber = formData.get("aadharNumber") as string

        const fullAddress = formData.get("fullAddress") as string
        const state = formData.get("state") as string
        const city = formData.get("city") as string
        const pincode = formData.get("pincode") as string

        if (!valuationId) {
            return NextResponse.json(
                { message: "Valuation ID is required" },
                { status: 400 }
            )
        }

        const aadharFile = formData.get("aadharFile") as File
        const rcFile = formData.get("rcFile") as File
        const photoFront = formData.get("photoFront") as File
        const photoBack = formData.get("photoBack") as File
        const photoLeft = formData.get("photoLeft") as File
        const photoRight = formData.get("photoRight") as File

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

        const [aadharUrl, rcUrl, photoFrontUrl, photoBackUrl, photoLeftUrl, photoRightUrl] = await Promise.all([
            uploadFile(aadharFile, "aadhar"),
            uploadFile(rcFile, "rc"),
            uploadFile(photoFront, "car_front"),
            uploadFile(photoBack, "car_back"),
            uploadFile(photoLeft, "car_left"),
            uploadFile(photoRight, "car_right"),
        ])

        const ekycData: any = {
            firstName,
            dob,
            whatsapp,
            aadharNumber,
            ekycStatus: "verified"
        }

        if (aadharUrl) ekycData.aadharFile = aadharUrl
        if (rcUrl) ekycData.rcFile = rcUrl
        if (photoFrontUrl) ekycData.photoFront = photoFrontUrl
        if (photoBackUrl) ekycData.photoBack = photoBackUrl
        if (photoLeftUrl) ekycData.photoLeft = photoLeftUrl
        if (photoRightUrl) ekycData.photoRight = photoRightUrl

        let Model;
        let updateStatus = "pending";
        const customFieldsToSet: any = {};

        if (source === "exchange-vehicle") {
            Model = ExchangeVehicle
            if (fullAddress) customFieldsToSet.fullAddress = fullAddress
            if (state) customFieldsToSet.state = state
            if (city) customFieldsToSet.city = city
            if (pincode) customFieldsToSet.pincode = pincode
        } else {
            Model = WizardLead
            updateStatus = "reviewed"
            if (fullAddress) customFieldsToSet.address = fullAddress
            if (state) customFieldsToSet.state = state
            if (city) customFieldsToSet.city = city
            if (pincode) customFieldsToSet.pincode = pincode
        }

        const updatedRecord = await Model.findByIdAndUpdate(
            valuationId,
            {
                $set: {
                    ...ekycData,
                    ...customFieldsToSet,
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


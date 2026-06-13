import { type NextRequest, NextResponse } from "next/server"
import connectToDatabase from "@/lib/db"

import ExchangeVehicle from "@/models/ExchangeVehicle"
import WizardLead from "@/models/WizardLead"
import { uploadToCloudinary } from "@/lib/cloudinary"
import {
    zMongoId,
    zAadhar,
    zPhone,
    zPincode,
    validateDocumentFile,
    validateImageFile,
    formatZodError,
} from "@/lib/validation"
import { z } from "zod"
import { rateLimiters } from "@/lib/rate-limit"

const ALLOWED_SOURCES = ["exchange-vehicle", "exchange", "valuation", "scrap", "sell", "buy", "get-quote"] as const

export async function PATCH(req: NextRequest) {
    try {
        // Rate limit: 20 eKYC submissions per IP per hour
        const limited = await rateLimiters.ekyc(req)
        if (limited) return limited

        const formData = await req.formData()
        const valuationId = formData.get("valuationId") as string
        let source = formData.get("source") as string | null
        if (!source) {
            source = "valuation"
        }

        // Validate valuationId
        const idCheck = zMongoId.safeParse(valuationId)
        if (!idCheck.success) {
            return NextResponse.json(
                { message: "Invalid or missing valuation ID" },
                { status: 400 }
            )
        }

        // Validate source
        if (!ALLOWED_SOURCES.includes(source as any)) {
            return NextResponse.json(
                { message: `Invalid source. Must be one of: ${ALLOWED_SOURCES.join(", ")}` },
                { status: 400 }
            )
        }

        const firstName = (formData.get("firstName") as string | null)?.trim().slice(0, 100) ?? ""
        const dob = (formData.get("dob") as string | null)?.trim() ?? ""
        const fullAddress = (formData.get("fullAddress") as string | null)?.trim().slice(0, 500) ?? ""
        const state = (formData.get("state") as string | null)?.trim().slice(0, 100) ?? ""
        const city = (formData.get("city") as string | null)?.trim().slice(0, 100) ?? ""

        // Validate whatsapp phone
        const whatsappRaw = formData.get("whatsapp") as string | null
        if (whatsappRaw) {
            const phoneCheck = zPhone.safeParse(whatsappRaw)
            if (!phoneCheck.success) {
                return NextResponse.json(
                    { message: formatZodError(phoneCheck.error) },
                    { status: 400 }
                )
            }
        }
        const whatsapp = whatsappRaw?.trim() ?? ""

        // Validate Aadhar number
        const aadharNumberRaw = formData.get("aadharNumber") as string | null
        const cleanAadhar = aadharNumberRaw ? aadharNumberRaw.replace(/\D/g, "") : ""
        if (aadharNumberRaw) {
            const aadharCheck = zAadhar.safeParse(cleanAadhar)
            if (!aadharCheck.success) {
                return NextResponse.json(
                    { message: formatZodError(aadharCheck.error) },
                    { status: 400 }
                )
            }
        }
        const aadharNumber = cleanAadhar

        // Validate pincode
        const pincodeRaw = formData.get("pincode") as string | null
        if (pincodeRaw) {
            const pinCheck = zPincode.safeParse(pincodeRaw)
            if (!pinCheck.success) {
                return NextResponse.json(
                    { message: formatZodError(pinCheck.error) },
                    { status: 400 }
                )
            }
        }
        const pincode = pincodeRaw?.trim() ?? ""

        // Collect and validate files
        const aadharFile = formData.get("aadharFile") as File | null
        const rcFile = formData.get("rcFile") as File | null
        const photoFront = formData.get("photoFront") as File | null
        const photoBack = formData.get("photoBack") as File | null
        const photoLeft = formData.get("photoLeft") as File | null
        const photoRight = formData.get("photoRight") as File | null

        // Validate document files (PDF or image, max 10 MB)
        for (const [file, label] of [
            [aadharFile, "Aadhar document"],
            [rcFile, "RC document"],
        ] as [File | null, string][]) {
            if (file && typeof file !== "string") {
                const check = validateDocumentFile(file, label)
                if (!check.valid) {
                    return NextResponse.json({ message: check.message }, { status: 400 })
                }
            }
        }

        // Validate photo files (image only, max 5 MB)
        for (const [file, label] of [
            [photoFront, "Front photo"],
            [photoBack, "Back photo"],
            [photoLeft, "Left photo"],
            [photoRight, "Right photo"],
        ] as [File | null, string][]) {
            if (file && typeof file !== "string") {
                const check = validateImageFile(file, label)
                if (!check.valid) {
                    return NextResponse.json({ message: check.message }, { status: 400 })
                }
            }
        }

        await connectToDatabase()

        const uploadFile = async (file: File | null, folder: string) => {
            if (!file || typeof file === "string") return null
            const buffer = Buffer.from(await file.arrayBuffer())
            const cleanName = file.name.replace(/\.[^/.]+$/, "").replace(/[^a-zA-Z0-9.\-_]/g, "")
            const publicId = `${folder}_${Date.now()}_${cleanName}`
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

        let Model
        let updateStatus = "pending"
        const customFieldsToSet: any = {}

        if (source === "exchange-vehicle" || source === "exchange") {
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
            { message: "Internal server error" },
            { status: 500 }
        )
    }
}

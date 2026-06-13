import { type NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";

import WizardLead from "@/models/WizardLead";
import ExchangeVehicle from "@/models/ExchangeVehicle";
import { uploadToCloudinary } from "@/lib/cloudinary";
import {
    zMongoId,
    zAadhar,
    zPhone,
    validateDocumentFile,
    validateImageFile,
    formatZodError,
} from "@/lib/validation";

export async function POST(
    req: NextRequest,
    { params }: any
) {
    try {
        await connectToDatabase();

        const type = params.type;
        const validTypes = ["valuation", "exchange"];

        if (!validTypes.includes(type)) {
            return NextResponse.json({ error: "Invalid eKYC form type" }, { status: 400 });
        }

        const formData = await req.formData();

        // Validate document ID
        const id = formData.get("id") as string;
        const idCheck = zMongoId.safeParse(id);
        if (!idCheck.success) {
            return NextResponse.json({ error: "Invalid or missing document ID" }, { status: 400 });
        }

        const firstName = (formData.get("firstName") as string | null)?.trim().slice(0, 100) ?? "";
        const dob = (formData.get("dob") as string | null)?.trim() ?? "";

        // Validate phone
        const aadharPhoneRaw = formData.get("aadharPhone") as string | null;
        if (aadharPhoneRaw) {
            const phoneCheck = zPhone.safeParse(aadharPhoneRaw);
            if (!phoneCheck.success) {
                return NextResponse.json({ error: formatZodError(phoneCheck.error) }, { status: 400 });
            }
        }
        const aadharPhone = aadharPhoneRaw?.trim() ?? "";

        // Validate Aadhar number
        const aadharNumberRaw = formData.get("aadharNumber") as string | null;
        const cleanAadhar = aadharNumberRaw ? aadharNumberRaw.replace(/\D/g, "") : "";
        if (aadharNumberRaw) {
            const aadharCheck = zAadhar.safeParse(cleanAadhar);
            if (!aadharCheck.success) {
                return NextResponse.json({ error: formatZodError(aadharCheck.error) }, { status: 400 });
            }
        }
        const aadharNumber = cleanAadhar;

        // Collect files
        const aadharFile = formData.get("aadharFile") as File | null;
        const rcFile = formData.get("rcFile") as File | null;
        const carPhoto = formData.get("carPhoto") as File | null;

        // Validate Aadhar and RC as documents (PDF or image, max 10 MB)
        for (const [file, label] of [
            [aadharFile, "Aadhar document"],
            [rcFile, "RC document"],
        ] as [File | null, string][]) {
            if (file && typeof file !== "string") {
                const check = validateDocumentFile(file, label);
                if (!check.valid) {
                    return NextResponse.json({ error: check.message }, { status: 400 });
                }
            }
        }

        // Validate car photo as image (max 5 MB)
        if (carPhoto && typeof carPhoto !== "string") {
            const check = validateImageFile(carPhoto, "Car photo");
            if (!check.valid) {
                return NextResponse.json({ error: check.message }, { status: 400 });
            }
        }

        const uploadFile = async (file: File | null, folder: string) => {
            if (!file) return null;
            const buffer = Buffer.from(await file.arrayBuffer());
            const filename = `${folder}_${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.\-_]/g, "")}`;
            return await uploadToCloudinary(buffer, `autoscrap/ekyc/${type}/${id}`, filename);
        };

        const [aadharUrl, rcUrl, carPhotoUrl] = await Promise.all([
            uploadFile(aadharFile, "aadhar"),
            uploadFile(rcFile, "rc"),
            uploadFile(carPhoto, "car")
        ]);

        let Model;
        switch (type) {
            case "valuation":
                Model = WizardLead;
                break;
            case "exchange":
                Model = ExchangeVehicle;
                break;
            default:
                return NextResponse.json({ error: "Invalid eKYC form type" }, { status: 400 });
        }

        const updateData = {
            firstName,
            dob,
            aadharPhone,
            aadharNumber,
            ...(aadharUrl && { aadharFile: aadharUrl }),
            ...(rcUrl && { rcFile: rcUrl }),
            ...(carPhotoUrl && { carPhoto: carPhotoUrl }),
            ekycStatus: "verified"
        };

        const updatedDoc = await Model.findByIdAndUpdate(
            id,
            { $set: updateData },
            { new: true }
        );

        if (!updatedDoc) {
            return NextResponse.json({ error: "Document not found" }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            message: "eKYC documents uploaded successfully",
            document: updatedDoc
        });

    } catch (error: any) {
        console.error("eKYC upload error:", error);
        return NextResponse.json(
            { error: "Failed to upload eKYC documents" },
            { status: 500 }
        );
    }
}

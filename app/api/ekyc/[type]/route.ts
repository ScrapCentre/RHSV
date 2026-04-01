import { type NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import SellVehicle from "@/models/SellVehicle";
import Valuation from "@/models/Valuation";
import ExchangeVehicle from "@/models/ExchangeVehicle";
import { uploadToCloudinary } from "@/lib/cloudinary";

export async function POST(
    req: NextRequest,
    { params }: { params: { type: string } }
) {
    try {
        await connectToDatabase();

        const type = params.type;
        const validTypes = ["sell", "valuation", "exchange"];

        if (!validTypes.includes(type)) {
            return NextResponse.json({ error: "Invalid eKYC form type" }, { status: 400 });
        }

        const formData = await req.formData();

        // Extract fields
        const id = formData.get("id") as string;
        const firstName = formData.get("firstName") as string;
        const dob = formData.get("dob") as string;
        const aadharPhone = formData.get("aadharPhone") as string;
        const aadharNumber = formData.get("aadharNumber") as string;

        // Extract files
        const aadharFile = formData.get("aadharFile") as File;
        const rcFile = formData.get("rcFile") as File;
        const carPhoto = formData.get("carPhoto") as File;

        if (!id) {
            return NextResponse.json({ error: "Missing document ID" }, { status: 400 });
        }

        const uploadFile = async (file: File | null, folder: string) => {
            if (!file) return null;
            const buffer = Buffer.from(await file.arrayBuffer());
            const filename = `${folder}_${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.\-_]/g, '')}`;
            return await uploadToCloudinary(buffer, `autoscrap/ekyc/${type}/${id}`, filename);
        };

        const [aadharUrl, rcUrl, carPhotoUrl] = await Promise.all([
            uploadFile(aadharFile, "aadhar"),
            uploadFile(rcFile, "rc"),
            uploadFile(carPhoto, "car")
        ]);

        let Model;
        switch (type) {
            case "sell":
                Model = SellVehicle;
                break;
            case "valuation":
                Model = Valuation;
                break;
            case "exchange":
                Model = ExchangeVehicle;
                break;
        }

        const updateData = {
            firstName,
            dob,
            aadharPhone,
            aadharNumber,
            ...(aadharUrl && { aadharFile: aadharUrl }),
            ...(rcUrl && { rcFile: rcUrl }),
            ...(carPhotoUrl && { carPhoto: carPhotoUrl }),
            ekycStatus: "verified" // Set to verified upon submission or pending depending on your workflow
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
            { error: "Failed to upload eKYC documents", details: error.message },
            { status: 500 }
        );
    }
}

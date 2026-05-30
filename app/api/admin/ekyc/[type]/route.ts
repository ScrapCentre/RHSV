import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";

import WizardLead from "@/models/WizardLead";
import ExchangeVehicle from "@/models/ExchangeVehicle";

export async function GET(
    request: Request,
    { params }: any
) {
    try {
        await connectToDatabase();

        const type = params.type;
        const validTypes = ["valuation", "exchange"];

        if (!validTypes.includes(type)) {
            return NextResponse.json({ error: "Invalid document type" }, { status: 400 });
        }

        let Model;
        switch (type) {

            case "valuation":
                Model = WizardLead;
                break;
            case "exchange":
                Model = ExchangeVehicle;
                break;
            default:
                return NextResponse.json({ error: "Invalid document type" }, { status: 400 });
        }

        // Fetch documents that have eKYC data submitted
        const documents = await Model.find({
            aadharFile: { $exists: true, $ne: null }
        }).sort({ updatedAt: -1 });

        return NextResponse.json(documents);
    } catch (error) {
        console.error("Error fetching eKYC documents:", error);
        return NextResponse.json(
            { error: "Failed to fetch eKYC documents" },
            { status: 500 }
        );
    }
}

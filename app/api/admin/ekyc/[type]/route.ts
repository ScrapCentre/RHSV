import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import SellVehicle from "@/models/SellVehicle";
import Valuation from "@/models/Valuation";
import ExchangeVehicle from "@/models/ExchangeVehicle";

export async function GET(
    request: Request,
    { params }: { params: { type: string } }
) {
    try {
        await connectToDatabase();

        const type = params.type;
        const validTypes = ["sell", "valuation", "exchange"];

        if (!validTypes.includes(type)) {
            return NextResponse.json({ error: "Invalid document type" }, { status: 400 });
        }

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

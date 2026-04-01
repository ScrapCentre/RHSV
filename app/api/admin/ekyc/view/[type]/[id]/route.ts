import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectToDatabase from "@/lib/db";
import SellVehicle from "@/models/SellVehicle";
import Valuation from "@/models/Valuation";
import ExchangeVehicle from "@/models/ExchangeVehicle";

export async function GET(
    request: Request,
    { params }: { params: { type: string, id: string } }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || (session.user as any).role !== "admin") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await connectToDatabase();

        const { type, id } = params;
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

        const document = await Model.findById(id);

        if (!document) {
            return NextResponse.json({ error: "Document not found" }, { status: 404 });
        }

        if (!document.aadharFile) {
            return NextResponse.json({ error: "eKYC not submitted for this request" }, { status: 404 });
        }

        return NextResponse.json(document);
    } catch (error) {
        console.error("Error fetching eKYC document:", error);
        return NextResponse.json(
            { error: "Failed to fetch eKYC document" },
            { status: 500 }
        );
    }
}

import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import Valuation from "@/models/Valuation";
import SellVehicle from "@/models/SellVehicle";
import ExchangeVehicle from "@/models/ExchangeVehicle";
import BuyVehicle from "@/models/BuyVehicle";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        // Authentication & Role Check
        if (!session || (session.user as any).role !== "partner") {
            return NextResponse.json(
                { message: "Unauthorized: Partner access required" },
                { status: 403 }
            );
        }

        await connectToDatabase();

        // Fetch only approved requests from all categories
        const [valuations, sellRequests, exchangeRequests, buyRequests] = await Promise.all([
            Valuation.find({ status: "approved" }).sort({ createdAt: -1 }),
            SellVehicle.find({ status: "approved" }).sort({ createdAt: -1 }),
            ExchangeVehicle.find({ status: "approved" }).sort({ createdAt: -1 }),
            BuyVehicle.find({ status: "approved" }).sort({ createdAt: -1 })
        ]);

        // Merge all approved requests with type identifier
        const allApprovedRequests = [
            ...valuations.map(v => ({ ...v.toObject(), type: 'valuation' })),
            ...sellRequests.map(s => ({ ...s.toObject(), type: 'sell' })),
            ...exchangeRequests.map(e => ({ ...e.toObject(), type: 'exchange' })),
            ...buyRequests.map(b => ({ ...b.toObject(), type: 'buy' }))
        ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        return NextResponse.json(
            { success: true, count: allApprovedRequests.length, data: allApprovedRequests },
            { status: 200 }
        );
    } catch (error: any) {
        console.error("Marketplace API Error:", error);
        return NextResponse.json(
            { message: "Internal server error", error: error.message },
            { status: 500 }
        );
    }
}


import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectToDatabase from "@/lib/db";
import Valuation from "@/models/Valuation";
import SellVehicle from "@/models/SellVehicle";
import ExchangeVehicle from "@/models/ExchangeVehicle";
import BuyVehicle from "@/models/BuyVehicle";

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || (session.user as any).role !== "executive") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await connectToDatabase();

        // Fetch recent pending requests from the 4 forms
        const [quotes, sells, exchanges, buys] = await Promise.all([
            Valuation.find({ status: 'pending' }).sort({ createdAt: -1 }).limit(10).lean(),
            SellVehicle.find({ status: 'pending' }).sort({ createdAt: -1 }).limit(10).lean(),
            ExchangeVehicle.find({ status: 'pending' }).sort({ createdAt: -1 }).limit(10).lean(),
            BuyVehicle.find({ status: 'pending' }).sort({ createdAt: -1 }).limit(10).lean(),
        ]);

        let notifications = [
            ...quotes.map((item: any) => ({
                id: item._id,
                type: 'quote',
                title: 'New Quote Request',
                message: `${item.contact?.name || 'A customer'} requested a quote for ${item.year} ${item.brand} ${item.model}`,
                createdAt: item.createdAt
            })),
            ...sells.map((item: any) => ({
                id: item._id,
                type: 'sell',
                title: 'New Sell Inquiry',
                message: `${item.name || 'A customer'} wants to sell a ${item.registrationYear} ${item.brand} ${item.model}`,
                createdAt: item.createdAt
            })),
            ...exchanges.map((item: any) => ({
                id: item._id,
                type: 'exchange',
                title: 'New Exchange Request',
                message: `${item.customerName || 'A customer'} wants to exchange a ${item.oldVehicleBrand} for a ${item.newVehicleBrand}`,
                createdAt: item.createdAt
            })),
            ...buys.map((item: any) => ({
                id: item._id,
                type: 'buy',
                title: 'New Purchase Inquiry',
                message: `${item.customerName || 'A customer'} is looking to buy a ${item.vehicleBrand} ${item.vehicleModel}`,
                createdAt: item.createdAt
            }))
        ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5);

        return NextResponse.json({ notifications });
    } catch (error) {
        console.error("Notifications fetch error:", error);
        return NextResponse.json({ error: "Failed to fetch notifications" }, { status: 500 });
    }
}

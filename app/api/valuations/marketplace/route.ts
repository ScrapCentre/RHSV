import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import Valuation from "@/models/Valuation";

import ExchangeVehicle from "@/models/ExchangeVehicle";
import BuyVehicle from "@/models/BuyVehicle";
import WizardLead from "@/models/WizardLead";
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
        const [valuations, exchangeRequests, buyRequests, wizardLeads] = await Promise.all([
            Valuation.find({ status: { $in: ["approved", "approved_to_rvsf"] } }).sort({ createdAt: -1 }),
            ExchangeVehicle.find({ status: { $in: ["approved", "approved_to_rvsf"] } }).sort({ createdAt: -1 }),
            BuyVehicle.find({ status: { $in: ["approved", "approved_to_rvsf"] } }).sort({ createdAt: -1 }),
            WizardLead.find({ status: { $in: ["approved", "approved_to_rvsf"] } }).sort({ createdAt: -1 })
        ]);

        // Merge all approved requests with type identifier
        const allApprovedRequests = [
            ...valuations.map(v => ({ ...v.toObject(), type: 'valuation' })),

            ...exchangeRequests.map(e => ({ ...e.toObject(), type: 'exchange' })),
            ...buyRequests.map(b => ({ ...b.toObject(), type: 'buy' })),
            ...wizardLeads.map(w => {
                const plain = w.toObject();
                const serviceType = plain.serviceType || plain.type || 'wizard';
                let mappedType = 'valuation';
                
                // Map properties to match what b2b/marketplace UI expects
                if (serviceType === 'wizard-sell' || serviceType === 'sell') {
                    mappedType = 'sell';
                    plain.registrationYear = plain.year;
                } else if (serviceType === 'wizard-buy' || serviceType === 'buy') {
                    mappedType = 'buy';
                    plain.vehicleBrand = plain.desiredCompany || plain.brand;
                    plain.vehicleModel = plain.desiredModel || plain.model;
                    plain.customerName = plain.name;
                    plain.customerPhone = plain.phone;
                } else if (serviceType === 'scrap-buy') {
                    mappedType = 'exchange';
                    plain.oldVehicleBrand = plain.brand;
                    plain.oldVehicleModel = plain.model;
                    plain.oldVehicleYear = plain.year;
                    plain.newVehicleBrand = plain.desiredCompany;
                    plain.newVehicleModel = plain.desiredModel;
                    plain.customerName = plain.name;
                    plain.customerPhone = plain.phone;
                } else {
                    mappedType = 'valuation'; // Default for scrap
                    plain.contact = { name: plain.name, phone: plain.phone };
                }
                
                return { ...plain, type: mappedType, originalType: serviceType };
            })
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


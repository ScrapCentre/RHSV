import { NextResponse } from "next/server"
import connectToDatabase from "@/lib/db"
import Valuation from "@/models/Valuation"
import SellVehicle from "@/models/SellVehicle"
import ExchangeVehicle from "@/models/ExchangeVehicle"
import BuyVehicle from "@/models/BuyVehicle"
import WizardLead from "@/models/WizardLead"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"

export const dynamic = "force-dynamic"

export async function GET() {
    try {
        const session = await getServerSession(authOptions)
        if (!session || (session.user as any).role !== "rvsf") {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
        }

        await connectToDatabase()

        const excludeFilter = { status: "approved_to_rvsf" }
        const quoteExcludeFilter = { status: "approved_to_rvsf" }

        const [
            latestQuotes,
            latestSells,
            latestExchanges,
            latestBuys,
            latestWizards
        ] = await Promise.all([
            Valuation.find(quoteExcludeFilter).sort({ createdAt: -1 }).lean(),
            SellVehicle.find(excludeFilter).sort({ createdAt: -1 }).lean(),
            ExchangeVehicle.find(excludeFilter).sort({ createdAt: -1 }).lean(),
            BuyVehicle.find(excludeFilter).sort({ createdAt: -1 }).lean(),
            WizardLead.find(excludeFilter).sort({ createdAt: -1 }).lean(),
        ])

        const formatName = (name: string) => {
            if (!name || name === "N/A") return "Customer"
            return name.substring(0, 2) + "****"
        }

        const formatPhone = (phone: string) => {
            if (!phone || phone === "N/A") return "N/A"
            return phone.substring(0, 2) + "******" + phone.substring(phone.length - 2)
        }

        let feed = [
            ...latestQuotes.map((item: any) => {
                const plainItem = JSON.parse(JSON.stringify(item));
                return {
                    _id: plainItem._id,
                    createdAt: plainItem.createdAt,
                    type: 'quote',
                    customerName: formatName(item.contact?.name),
                    customerPhone: formatPhone(item.contact?.phone),
                    vehicleInfo: `${item.year || ''} ${item.brand || ''} ${item.model || ''} (${item.vehicleType || ''})`.trim(),
                    location: `${item.address?.city || 'N/A'}, ${item.address?.state || 'N/A'}`
                };
            }),
            ...latestSells.map((item: any) => {
                const plainItem = JSON.parse(JSON.stringify(item));
                return {
                    _id: plainItem._id,
                    createdAt: plainItem.createdAt,
                    type: 'sell',
                    customerName: formatName(item.name),
                    customerPhone: formatPhone(item.phone),
                    vehicleInfo: `${item.registrationYear || ''} ${item.customBrand || item.brand || ''} ${item.customModel || item.model || ''}`.trim(),
                    location: `${item.city || 'N/A'}, ${item.state || 'N/A'}`
                };
            }),
            ...latestExchanges.map((item: any) => {
                const plainItem = JSON.parse(JSON.stringify(item));
                return {
                    _id: plainItem._id,
                    createdAt: plainItem.createdAt,
                    type: 'exchange',
                    customerName: formatName(item.customerName),
                    customerPhone: formatPhone(item.customerPhone),
                    vehicleInfo: `Old: ${item.oldVehicleBrand || ''} ${item.oldVehicleModel || ''} -> New: ${item.newVehicleBrand || ''}`.trim(),
                    location: `${item.city || 'N/A'}, ${item.state || 'N/A'}`
                };
            }),
            ...latestBuys.map((item: any) => {
                const plainItem = JSON.parse(JSON.stringify(item));
                return {
                    _id: plainItem._id,
                    createdAt: plainItem.createdAt,
                    type: 'buy',
                    customerName: formatName(item.customerName),
                    customerPhone: formatPhone(item.customerPhone),
                    vehicleInfo: `Looking for: ${item.customBrand || item.vehicleBrand || ''} ${item.customModel || item.vehicleModel || ''}`.trim(),
                    location: `${item.city || 'N/A'}, ${item.state || 'N/A'}`
                };
            }),
            ...latestWizards.map((item: any) => {
                const plainItem = JSON.parse(JSON.stringify(item));
                const serviceType = plainItem.serviceType || plainItem.type || "wizard";
                let linkType = serviceType;
                if (serviceType === "scrap") { linkType = "quote"; }
                if (serviceType === "sell" || serviceType === "wizard-sell") { linkType = "sell"; }
                if (serviceType === "buy" || serviceType === "wizard-buy") { linkType = "buy"; }
                
                let vehicleInfoStr = serviceType === "buy" ? `Looking for: ${item.desiredCompany || ''} ${item.desiredModel || ''}` : 
                                   (serviceType === "scrap" && item.category === "scrap_and_buy") ? `Scrap: ${item.brand || ''} ${item.model || ''} | Buy: ${item.desiredCompany || ''} ${item.desiredModel || ''}` :
                                   `${item.year || ''} ${item.brand || ''} ${item.model || ''}`;

                return {
                    _id: plainItem._id,
                    createdAt: plainItem.createdAt,
                    type: linkType,
                    customerName: formatName(item.name),
                    customerPhone: formatPhone(item.phone),
                    vehicleInfo: vehicleInfoStr.trim(),
                    location: `${item.city || 'N/A'}, ${item.state || 'N/A'}`
                };
            })
        ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        return NextResponse.json(feed, { status: 200 })
    } catch (error: any) {
        console.error("Fetch RVSF Leads Error:", error)
        return NextResponse.json(
            { message: "Failed to fetch leads" },
            { status: 500 }
        )
    }
}

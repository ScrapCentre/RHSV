import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import connectToDatabase from "@/lib/db"
import Valuation from "@/models/Valuation"

import ExchangeVehicle from "@/models/ExchangeVehicle"
import BuyVehicle from "@/models/BuyVehicle"
import WizardLead from "@/models/WizardLead"
import { CheckCircle, ChevronLeft, ArrowUpRight, FileText } from "lucide-react"
import Link from "next/link"
import ExecutiveApprovedTable from "@/components/ExecutiveApprovedTable"

export const dynamic = "force-dynamic"

export default async function ExecutiveApprovedLeads() {
    const session = await getServerSession(authOptions)

    if (!session || (session.user as any).role !== "executive") {
        redirect("/executive")
    }

    await connectToDatabase()
    
    // Fetch approved, approved_to_rvsf, pickup_scheduled, reached_collection_centre, and car_scrapped leads from all collections
    const [
        approvedQuotes,
        approvedExchanges,
        approvedBuys,
        approvedWizards
    ] = await Promise.all([
        Valuation.find({ status: { $in: ['approved', 'pickup_scheduled', 'reached_collection_centre', 'car_scrapped'] } }).sort({ createdAt: -1 }).lean(),
        ExchangeVehicle.find({ status: { $in: ['approved', 'pickup_scheduled', 'reached_collection_centre', 'car_scrapped'] } }).sort({ createdAt: -1 }).lean(),
        BuyVehicle.find({ status: { $in: ['approved', 'pickup_scheduled', 'reached_collection_centre', 'car_scrapped'] } }).sort({ createdAt: -1 }).lean(),
        WizardLead.find({ status: { $in: ['approved', 'pickup_scheduled', 'reached_collection_centre', 'car_scrapped'] } }).sort({ createdAt: -1 }).lean(),
    ])

    const allApproved = [
        ...approvedQuotes.map((item: any) => ({
            ...JSON.parse(JSON.stringify(item)),
            type: 'quote',
            customerName: item.contact?.name || "N/A",
            customerPhone: item.contact?.phone || "N/A",
            vehicleInfo: `${item.year || 'N/A'} ${item.brand || 'Unknown'} ${item.model || ''}`
        })),

        ...approvedExchanges.map((item: any) => ({
            ...JSON.parse(JSON.stringify(item)),
            type: 'exchange',
            customerName: item.customerName || "N/A",
            customerPhone: item.customerPhone || "N/A",
            vehicleInfo: `Exchange: ${item.oldVehicleBrand || ''} -> ${item.newVehicleBrand || ''}`
        })),
        ...approvedBuys.map((item: any) => ({
            ...JSON.parse(JSON.stringify(item)),
            type: 'buy',
            customerName: item.customerName || "N/A",
            customerPhone: item.customerPhone || "N/A",
            vehicleInfo: `Buying: ${item.vehicleBrand || ''} ${item.vehicleModel || ''}`
        })),
        ...approvedWizards.map((item: any) => {
            const plain = JSON.parse(JSON.stringify(item));
            const serviceType = plain.serviceType || plain.type || "wizard";
            let linkType = serviceType;
            if (serviceType === "scrap") linkType = "quote";
            if (serviceType === "wizard-sell") linkType = "sell";
            if (serviceType === "wizard-buy") linkType = "buy";
            
            let vehicleInfo = "N/A";
            if (serviceType === "buy" || serviceType === "wizard-buy") {
                vehicleInfo = `Buying: ${plain.desiredCompany || plain.vehicleBrand || ''} ${plain.desiredModel || plain.vehicleModel || ''}`;
            } else {
                vehicleInfo = `${plain.year || plain.registrationYear || 'N/A'} ${plain.brand || plain.desiredCompany || 'Unknown'} ${plain.model || plain.desiredModel || ''}`;
            }

            return {
                ...plain,
                type: linkType,
                originalType: serviceType,
                customerName: plain.name || plain.customerName || "N/A",
                customerPhone: plain.phone || plain.customerPhone || "N/A",
                vehicleInfo: vehicleInfo.trim()
            }
        })
    ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    return (
        <div className="space-y-8 max-w-7xl mx-auto pb-12">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-center gap-4">
                    <Link href="/executive/dashboard" className="p-2 hover:bg-black dark:hover:bg-white hover:text-white dark:hover:text-black rounded-xl transition-all border border-transparent hover:border-black dark:hover:border-white">
                        <ChevronLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 dark:text-white flex items-center gap-3 tracking-tight uppercase">
                            <CheckCircle className="w-8 h-8" />
                            Approved Portfolio
                        </h1>
                        <p className="text-gray-500 dark:text-white/40 mt-1 font-medium italic text-sm">Consolidated view of all verified and approved transactions.</p>
                    </div>
                </div>
            </div>

            {/* Interactive List */}
            <ExecutiveApprovedTable data={allApproved} />
        </div>
    )
}


import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import connectToDatabase from "@/lib/db"
import ExchangeVehicle from "@/models/ExchangeVehicle"
import BuyVehicle from "@/models/BuyVehicle"
import WizardLead from "@/models/WizardLead"
import SubcontractingFeed from "@/components/admin/SubcontractingFeed"

export const dynamic = "force-dynamic"

export default async function SubcontractingPage() {
    const session = await getServerSession(authOptions)

    // Role Check
    if (!session || (session.user as any).role !== "admin") {
        redirect("/")
    }

    let subcontractingFeed: any[] = []
    let fetchError: string | null = null

    try {
        await connectToDatabase()

        // We want all requests that have been approved to RVSF
        const excludeFilter = { status: "approved_to_rvsf" }

        // Mongoose Queries for approved RVSF leads
        const [
            latestExchanges,
            latestBuys,
            latestWizards
        ] = await Promise.all([
            ExchangeVehicle.find(excludeFilter).sort({ createdAt: -1 }).lean(),
            BuyVehicle.find(excludeFilter).sort({ createdAt: -1 }).lean(),
            WizardLead.find(excludeFilter).sort({ createdAt: -1 }).lean(),
        ])

        // Parse and combine the feed similarly to the main dashboard
        subcontractingFeed = [

            ...latestExchanges.map((item: any) => {
                const plainItem = JSON.parse(JSON.stringify(item));
                return {
                    ...plainItem,
                    type: 'exchange',
                    customerName: item.customerName || "N/A",
                    customerPhone: item.customerPhone || "N/A",
                    vehicleInfo: `Old: ${item.oldVehicleBrand} ${item.oldVehicleModel} -> New: ${item.newVehicleBrand}`,
                    location: `${item.city || 'N/A'}, ${item.state || 'N/A'}`
                };
            }),
            ...latestBuys.map((item: any) => {
                const plainItem = JSON.parse(JSON.stringify(item));
                return {
                    ...plainItem,
                    type: 'buy',
                    customerName: item.customerName || "N/A",
                    customerPhone: item.customerPhone || "N/A",
                    vehicleInfo: `Looking for: ${item.customBrand || item.vehicleBrand} ${item.customModel || item.vehicleModel}`,
                    location: `${item.city || 'N/A'}, ${item.state || 'N/A'}`
                };
            }),
            ...latestWizards.map((item: any) => {
                const plainItem = JSON.parse(JSON.stringify(item));
                let typeName = "Vehicle Request";
                const serviceType = plainItem.serviceType || plainItem.type || "wizard";
                let linkType = serviceType;
                if (serviceType === "scrap") { typeName = "Scrap Vehicle"; linkType = "quote"; }
                if (serviceType === "scrap-buy") { typeName = "Scrap & Buy New"; }

                if (serviceType === "buy" || serviceType === "wizard-buy") { typeName = "Buy New Vehicle"; linkType = "buy"; }

                let vehicleInfoStr = serviceType === "buy" ? `Looking for: ${item.desiredCompany || ''} ${item.desiredModel || ''}` :
                    (serviceType === "scrap" && item.category === "scrap_and_buy") ? `Scrap: ${item.brand || ''} ${item.model || ''} | Buy: ${item.desiredCompany || ''} ${item.desiredModel || ''}` :
                        `${item.year || ''} ${item.brand || ''} ${item.model || ''}`;

                return {
                    ...plainItem,
                    type: linkType,
                    originalType: serviceType,
                    typeName,
                    customerName: item.name || "N/A",
                    customerPhone: item.phone || "N/A",
                    vehicleInfo: vehicleInfoStr,
                    location: `${item.city || 'N/A'}, ${item.state || 'N/A'}`
                };
            })
        ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    } catch (error: any) {
        console.error("Error fetching Subcontracting data:", error)
        // Extract a user-friendly message from the error
        if (error?.message?.includes("ECONNREFUSED") || error?.message?.includes("connect")) {
            fetchError = "Could not connect to the database. Please check your MongoDB connection and ensure your IP is whitelisted in Atlas."
        } else {
            fetchError = error?.message || "An unexpected error occurred while loading RVSF data."
        }
    }

    return (
        <div className="space-y-4 sm:space-y-6">
            <div className="bg-white dark:bg-[#0E192D] rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100 dark:border-slate-800">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                    <div>
                        <h1 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white tracking-tight">RVSF's</h1>
                        <p className="text-[13px] sm:text-sm text-gray-500 dark:text-slate-400 mt-1 font-medium leading-relaxed">
                            Live market feed for all leads successfully approved to RVSF's.
                        </p>
                    </div>
                </div>
            </div>

            <SubcontractingFeed initialData={subcontractingFeed} error={fetchError} />
        </div>
    )
}

import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import connectToDatabase from "@/lib/db"
import Valuation from "@/models/Valuation"
import SellVehicle from "@/models/SellVehicle"
import ExchangeVehicle from "@/models/ExchangeVehicle"
import BuyVehicle from "@/models/BuyVehicle"
import SubcontractingFeed from "@/components/admin/SubcontractingFeed"

export const dynamic = "force-dynamic"

export default async function SubcontractingPage() {
    const session = await getServerSession(authOptions)

    // Role Check
    if (!session || (session.user as any).role !== "admin") {
        redirect("/")
    }

    let subcontractingFeed: any[] = []

    try {
        await connectToDatabase()

        // We want all requests EXCEPT where state is "Uttar Pradesh"
        const excludeFilter = { state: { $ne: "Uttar Pradesh" }, status: { $ne: "approved" } }
        const quoteExcludeFilter = { "address.state": { $ne: "Uttar Pradesh" }, status: { $ne: "approved" } }

        // Mongoose Queries combining normal filters and our UP exclusion
        const [
            latestQuotes,
            latestSells,
            latestExchanges,
            latestBuys
        ] = await Promise.all([
            Valuation.find(quoteExcludeFilter).sort({ createdAt: -1 }).lean(),
            SellVehicle.find(excludeFilter).sort({ createdAt: -1 }).lean(),
            ExchangeVehicle.find(excludeFilter).sort({ createdAt: -1 }).lean(),
            BuyVehicle.find(excludeFilter).sort({ createdAt: -1 }).lean(),
        ])

        // Parse and combine the feed similarly to the main dashboard
        subcontractingFeed = [
            ...latestQuotes.map((item: any) => {
                const plainItem = JSON.parse(JSON.stringify(item));
                return {
                    ...plainItem,
                    type: 'quote',
                    customerName: item.contact?.name || "N/A",
                    customerPhone: item.contact?.phone || "N/A",
                    vehicleInfo: `${item.year} ${item.brand} ${item.model} (${item.vehicleType})`,
                    location: `${item.address?.city || 'N/A'}, ${item.address?.state || 'N/A'}`
                };
            }),
            ...latestSells.map((item: any) => {
                const plainItem = JSON.parse(JSON.stringify(item));
                return {
                    ...plainItem,
                    type: 'sell',
                    customerName: item.name || "N/A",
                    customerPhone: item.phone || "N/A",
                    vehicleInfo: `${item.registrationYear} ${item.customBrand || item.brand} ${item.customModel || item.model}`,
                    location: `${item.city || 'N/A'}, ${item.state || 'N/A'}`
                };
            }),
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
            })
        ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    } catch (error) {
        console.error("Error fetching Subcontracting data:", error)
    }

    return (
        <div className="space-y-4 sm:space-y-6">
            <div className="bg-white dark:bg-[#0E192D] rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100 dark:border-slate-800">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                    <div>
                        <h1 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white tracking-tight">Subcontracting</h1>
                        <p className="text-[13px] sm:text-sm text-gray-500 dark:text-slate-400 mt-1 font-medium leading-relaxed">
                            Live market feed for all requests outside of Uttar Pradesh.
                        </p>
                    </div>
                </div>
            </div>

            <SubcontractingFeed initialData={subcontractingFeed} />
        </div>
    )
}

import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import connectToDatabase from "@/lib/db"
import Valuation from "@/models/Valuation"
import SellVehicle from "@/models/SellVehicle"
import ExchangeVehicle from "@/models/ExchangeVehicle"
import BuyVehicle from "@/models/BuyVehicle"
import { CheckCircle, ChevronLeft, ArrowUpRight, FileText } from "lucide-react"
import Link from "next/link"

export const dynamic = "force-dynamic"

export default async function ExecutiveApprovedLeads() {
    const session = await getServerSession(authOptions)

    if (!session || (session.user as any).role !== "executive") {
        redirect("/executive")
    }

    await connectToDatabase()
    
    // Fetch approved, pickup_scheduled, reached_collection_centre, and car_scrapped leads from all collections
    const [
        approvedQuotes,
        approvedSells,
        approvedExchanges,
        approvedBuys
    ] = await Promise.all([
        Valuation.find({ status: { $in: ['approved', 'pickup_scheduled', 'reached_collection_centre', 'car_scrapped'] } }).sort({ createdAt: -1 }).lean(),
        SellVehicle.find({ status: { $in: ['approved', 'pickup_scheduled', 'reached_collection_centre', 'car_scrapped'] } }).sort({ createdAt: -1 }).lean(),
        ExchangeVehicle.find({ status: { $in: ['approved', 'pickup_scheduled', 'reached_collection_centre', 'car_scrapped'] } }).sort({ createdAt: -1 }).lean(),
        BuyVehicle.find({ status: { $in: ['approved', 'pickup_scheduled', 'reached_collection_centre', 'car_scrapped'] } }).sort({ createdAt: -1 }).lean(),
    ])

    const allApproved = [
        ...approvedQuotes.map((item: any) => ({
            ...JSON.parse(JSON.stringify(item)),
            type: 'quote',
            customerName: item.contact?.name || "N/A",
            vehicleInfo: `${item.year} ${item.brand} ${item.model}`
        })),
        ...approvedSells.map((item: any) => ({
            ...JSON.parse(JSON.stringify(item)),
            type: 'sell',
            customerName: item.name || "N/A",
            vehicleInfo: `${item.registrationYear} ${item.brand} ${item.model}`
        })),
        ...approvedExchanges.map((item: any) => ({
            ...JSON.parse(JSON.stringify(item)),
            type: 'exchange',
            customerName: item.customerName || "N/A",
            vehicleInfo: `Exchange: ${item.oldVehicleBrand} -> ${item.newVehicleBrand}`
        })),
        ...approvedBuys.map((item: any) => ({
            ...JSON.parse(JSON.stringify(item)),
            type: 'buy',
            customerName: item.customerName || "N/A",
            vehicleInfo: `Buying: ${item.vehicleBrand} ${item.vehicleModel}`
        }))
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

            {/* List */}
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-white/5 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 dark:bg-black/40 text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-white/20 border-b border-gray-100 dark:border-white/5">
                            <tr>
                                <th className="px-6 py-4">Classification</th>
                                <th className="px-6 py-4">Principal Entity</th>
                                <th className="px-6 py-4">Details</th>
                                <th className="px-6 py-4">Approval Date</th>
                                <th className="px-6 py-4">B2B Status</th>
                                <th className="px-6 py-4 text-right">Analytical View</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 dark:divide-white/5">
                            {allApproved.map((item: any) => (
                                <tr key={item._id} className="hover:bg-gray-50 dark:hover:bg-white/[0.03] transition-colors group">
                                    <td className="px-6 py-4">
                                        <span className="inline-flex px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                                            {item.type}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <span className="font-bold text-gray-900 dark:text-white">{item.customerName}</span>
                                            <span className="text-[10px] font-medium text-gray-500 dark:text-white/40">{item.customerPhone || 'N/A'}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-[11px] font-medium text-gray-500 dark:text-white/40 uppercase tracking-widest">
                                        {item.vehicleInfo}
                                    </td>
                                    <td className="px-6 py-4 text-[11px] font-medium text-gray-500 dark:text-white/40">
                                        {new Date(item.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4">
                                        {item.status === 'pickup_scheduled' ? (
                                            <span className="inline-flex px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                                                Accepted
                                            </span>
                                        ) : item.status === 'reached_collection_centre' ? (
                                            <span className="inline-flex px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                                                Reached Centre
                                            </span>
                                        ) : item.status === 'car_scrapped' ? (
                                            <span className="inline-flex px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20">
                                                Car Scrapped Successfully
                                            </span>
                                        ) : (
                                            <span className="inline-flex px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                                                Published
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <Link href={`/executive/valuations/${item.type}/${item._id}`} className="inline-flex items-center gap-2 px-4 py-2 bg-black dark:bg-white text-white dark:text-black rounded-xl text-[10px] font-black uppercase tracking-widest hover:opacity-80 transition-all border border-transparent dark:border-white/10 hover:dark:border-white/20">
                                            Access File <ArrowUpRight className="w-3 h-3" />
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                            {allApproved.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-gray-400 dark:text-white/20 text-xs font-bold uppercase tracking-widest">
                                        No approved portfolio entries identified
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}

import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import connectToDatabase from "@/lib/db"
import Valuation from "@/models/Valuation"
import SellVehicle from "@/models/SellVehicle"
import ExchangeVehicle from "@/models/ExchangeVehicle"
import BuyVehicle from "@/models/BuyVehicle"
import { FileText, ChevronLeft, ArrowUpRight, Search, Clock, Calendar, CheckCircle } from "lucide-react"
import Link from "next/link"

export const dynamic = "force-dynamic"

export default async function ExecutiveLeadsListing({ params }: { params: Promise<{ type: string }> }) {
    const session = await getServerSession(authOptions)
    const { type } = await params

    if (!session || (session.user as any).role !== "executive") {
        redirect("/executive")
    }

    await connectToDatabase()
    
    let leads: any[] = []
    let title = ""
    let icon = <FileText className="w-8 h-8 text-blue-600 dark:text-blue-500" />

    switch (type) {
        case "quote":
            leads = await Valuation.find().sort({ createdAt: -1 }).lean()
            title = "Valuation Quotes"
            break
        case "sell":
            leads = await SellVehicle.find().sort({ createdAt: -1 }).lean()
            title = "Sell Leads"
            break
        case "exchange":
            leads = await ExchangeVehicle.find().sort({ createdAt: -1 }).lean()
            title = "Exchange Leads"
            break
        case "buy":
            leads = await BuyVehicle.find().sort({ createdAt: -1 }).lean()
            title = "Purchase Leads"
            break
        default:
            redirect("/executive/dashboard")
    }

    const formattedLeads = leads.map((item: any) => {
        const plainItem = JSON.parse(JSON.stringify(item))
        return {
            ...plainItem,
            customerName: item.customerName || item.name || item.contact?.name || "N/A",
            customerPhone: item.customerPhone || item.phone || item.contact?.phone || "N/A",
            vehicleInfo: item.vehicleInfo || (item.brand ? `${item.brand} ${item.model}` : "N/A")
        }
    })

    function getStatusBadge(status: string) {
        const baseClass = "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border"
        switch (status) {
            case "approved":
                return <span className={`${baseClass} bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20`}><CheckCircle className="w-3 h-3" /> Approved</span>
            case "pending":
                return <span className={`${baseClass} bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20`}><Clock className="w-3 h-3" /> Pending</span>
            case "reviewed":
            case "reviewing":
            case "contacted":
                return <span className={`${baseClass} bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20`}><Clock className="w-3 h-3" /> Reviewing</span>
            default:
                return <span className={`${baseClass} bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20`}>{status}</span>
        }
    }

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
                            {icon}
                            {title}
                        </h1>
                        <p className="text-gray-500 dark:text-white/40 mt-1 font-medium italic text-sm">Reviewing consolidated market data feed.</p>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-white/5 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 dark:bg-black/40 text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-white/20 border-b border-gray-100 dark:border-white/5">
                            <tr>
                                <th className="px-6 py-4">Timestamp</th>
                                <th className="px-6 py-4">Principal Entity</th>
                                <th className="px-6 py-4">Operational Status</th>
                                <th className="px-6 py-4 text-right">Analytical View</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 dark:divide-white/5">
                            {formattedLeads.map((item: any) => (
                                <tr key={item._id} className="hover:bg-gray-50 dark:hover:bg-white/[0.03] transition-colors group">
                                    <td className="px-6 py-4 text-[11px] font-medium text-gray-500 dark:text-white/40">
                                        <div className="flex flex-col">
                                            <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                                            <span className="text-[9px] text-gray-400 dark:text-white/20">{new Date(item.createdAt).toLocaleTimeString()}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <span className="font-bold text-gray-900 dark:text-white">{item.customerName}</span>
                                            <span className="text-[10px] font-medium text-gray-500 dark:text-white/40 uppercase tracking-widest">{item.vehicleInfo}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        {getStatusBadge(item.status)}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <Link href={`/executive/valuations/${type}/${item._id}`} className="inline-flex items-center gap-2 px-4 py-2 bg-black dark:bg-white text-white dark:text-black rounded-xl text-[10px] font-black uppercase tracking-widest hover:opacity-80 transition-all border border-transparent dark:border-white/10 hover:dark:border-white/20">
                                            Review Lead <ArrowUpRight className="w-3 h-3" />
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                            {formattedLeads.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center text-gray-400 dark:text-white/20 text-xs font-bold uppercase tracking-widest">
                                        No data entries found for this classification
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

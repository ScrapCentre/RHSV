import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import connectToDatabase from "@/lib/db"
import Valuation from "@/models/Valuation"
import SellVehicle from "@/models/SellVehicle"
import BuyVehicle from "@/models/BuyVehicle"
import WizardLead from "@/models/WizardLead"
import { FileText, Recycle, ShoppingCart, Sparkles, ArrowUpRight, CheckCircle, Clock } from "lucide-react"
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
    let accentColor = "blue"
    let icon = <FileText className="w-8 h-8 text-blue-500" />

    switch (type) {
        case "quote": {
            // Merge legacy Valuation + WizardLead scrap_only
            const [valuations, wizardScrap] = await Promise.all([
                Valuation.find().sort({ createdAt: -1 }).lean(),
                WizardLead.find({ serviceType: "scrap", category: "scrap_only" }).sort({ createdAt: -1 }).lean()
            ])
            leads = [
                ...valuations.map((v: any) => ({
                    _id: v._id.toString(),
                    customerName: v.contact?.name || "N/A",
                    customerPhone: v.contact?.phone || "N/A",
                    vehicleInfo: `${v.brand || ""} ${v.model || ""}`.trim() || "N/A",
                    regNo: v.vehicleNumber || "N/A",
                    status: v.status || "pending",
                    createdAt: v.createdAt,
                    viewHref: `/executive/valuations/quote/${v._id}`
                })),
                ...wizardScrap.map((w: any) => ({
                    _id: w._id.toString(),
                    customerName: w.name || "N/A",
                    customerPhone: w.phone || "N/A",
                    vehicleInfo: `${w.brand || ""} ${w.model || ""}`.trim() || "N/A",
                    regNo: w.regNo || "N/A",
                    status: w.status || "pending",
                    createdAt: w.createdAt,
                    viewHref: `/executive/valuations/quote/${w._id}`
                }))
            ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            title = "Scrap Vehicle"
            accentColor = "blue"
            icon = <Recycle className="w-8 h-8 text-blue-500" />
            break
        }
        case "scrap-buy": {
            const wizardScrapBuy = await WizardLead.find({ serviceType: "scrap", category: "scrap_and_buy" }).sort({ createdAt: -1 }).lean()
            leads = wizardScrapBuy.map((w: any) => ({
                _id: w._id.toString(),
                customerName: w.name || "N/A",
                customerPhone: w.phone || "N/A",
                vehicleInfo: `${w.brand || ""} ${w.model || ""}`.trim() || "N/A",
                regNo: w.regNo || "N/A",
                desiredCompany: w.desiredCompany || "N/A",
                desiredModel: w.desiredModel || "N/A",
                status: w.status || "pending",
                createdAt: w.createdAt,
                viewHref: `/executive/valuations/scrap-buy/${w._id}`
            }))
            title = "Scrap & Buy New"
            accentColor = "purple"
            icon = <Sparkles className="w-8 h-8 text-purple-500" />
            break
        }
        case "sell": {
            const [legacySells, wizardSells] = await Promise.all([
                SellVehicle.find().sort({ createdAt: -1 }).lean(),
                WizardLead.find({ serviceType: "sell" }).sort({ createdAt: -1 }).lean()
            ])
            leads = [
                ...legacySells.map((r: any) => ({
                    _id: r._id.toString(),
                    customerName: r.name || "N/A",
                    customerPhone: r.phone || "N/A",
                    vehicleInfo: `${r.brand || ""} ${r.model || ""}`.trim() || "N/A",
                    regNo: r.registrationNumber || "N/A",
                    status: r.status || "pending",
                    createdAt: r.createdAt,
                    viewHref: `/executive/valuations/sell/${r._id}`
                })),
                ...wizardSells.map((w: any) => ({
                    _id: w._id.toString(),
                    customerName: w.name || "N/A",
                    customerPhone: w.phone || "N/A",
                    vehicleInfo: `${w.brand || ""} ${w.model || ""}`.trim() || "N/A",
                    regNo: w.regNo || "N/A",
                    status: w.status || "pending",
                    createdAt: w.createdAt,
                    viewHref: `/executive/valuations/sell/${w._id}`
                }))
            ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            title = "Sell Old Vehicle"
            accentColor = "green"
            icon = <ShoppingCart className="w-8 h-8 text-green-500" />
            break
        }
        case "buy": {
            const [legacyBuys, wizardBuys] = await Promise.all([
                BuyVehicle.find().sort({ createdAt: -1 }).lean(),
                WizardLead.find({ serviceType: "buy" }).sort({ createdAt: -1 }).lean()
            ])
            leads = [
                ...legacyBuys.map((r: any) => ({
                    _id: r._id.toString(),
                    customerName: r.customerName || "N/A",
                    customerPhone: r.customerPhone || "N/A",
                    vehicleInfo: `${r.vehicleBrand || ""} ${r.vehicleModel || ""}`.trim() || "N/A",
                    regNo: "N/A",
                    status: r.status || "pending",
                    createdAt: r.createdAt,
                    viewHref: `/executive/valuations/buy/${r._id}`
                })),
                ...wizardBuys.map((w: any) => ({
                    _id: w._id.toString(),
                    customerName: w.name || "N/A",
                    customerPhone: w.phone || "N/A",
                    vehicleInfo: `${w.desiredCompany || ""} ${w.desiredModel || ""}`.trim() || "N/A",
                    regNo: "N/A",
                    status: w.status || "pending",
                    createdAt: w.createdAt,
                    viewHref: `/executive/valuations/buy/${w._id}`
                }))
            ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            title = "Buy New Vehicle"
            accentColor = "orange"
            icon = <ShoppingCart className="w-8 h-8 text-orange-500" />
            break
        }
        default:
            redirect("/executive/dashboard")
    }

    const accentMap: Record<string, string> = {
        blue: "text-blue-600 dark:text-blue-400 border-blue-500/20 bg-blue-500/10",
        purple: "text-purple-600 dark:text-purple-400 border-purple-500/20 bg-purple-500/10",
        green: "text-green-600 dark:text-green-400 border-green-500/20 bg-green-500/10",
        orange: "text-orange-600 dark:text-orange-400 border-orange-500/20 bg-orange-500/10"
    }

    function getStatusBadge(status: string) {
        const base = "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border"
        switch (status) {
            case "approved":
                return <span className={`${base} bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20`}><CheckCircle className="w-3 h-3" /> Approved</span>
            case "pending":
                return <span className={`${base} bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20`}><Clock className="w-3 h-3" /> Pending</span>
            case "reviewed": case "reviewing": case "contacted":
                return <span className={`${base} bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20`}><Clock className="w-3 h-3" /> Reviewing</span>
            default:
                return <span className={`${base} bg-gray-500/10 text-gray-600 dark:text-gray-400 border-gray-500/20`}>{status}</span>
        }
    }

    return (
        <div className="space-y-8 max-w-7xl mx-auto pb-12">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 dark:text-white flex items-center gap-3 tracking-tight uppercase">
                            {icon}
                            {title}
                        </h1>
                        <div className="flex items-center gap-3 mt-2">
                            <p className="text-gray-500 dark:text-white/40 font-medium italic text-sm">Market data feed — all sources merged.</p>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest border ${accentMap[accentColor]}`}>
                                {leads.length} leads
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Scrap-Buy extra info banner */}
            {type === "scrap-buy" && (
                <div className="flex items-center gap-3 px-5 py-3 rounded-xl bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800/40">
                    <Sparkles className="w-5 h-5 text-purple-600 dark:text-purple-400 flex-shrink-0" />
                    <p className="text-sm font-medium text-purple-800 dark:text-purple-300">
                        High-intent dual leads — customer wants to scrap their old vehicle <strong>and</strong> buy a new one.
                    </p>
                </div>
            )}

            {/* Desktop Table */}
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-white/5 overflow-hidden shadow-sm">
                <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 dark:bg-black/40 text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-white/20 border-b border-gray-100 dark:border-white/5">
                            <tr>
                                <th className="px-6 py-4">Timestamp</th>
                                <th className="px-6 py-4">Customer</th>
                                <th className="px-6 py-4">Vehicle</th>
                                {type === "scrap-buy" && <th className="px-6 py-4">Desired New Car</th>}
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 dark:divide-white/5">
                            {leads.length === 0 ? (
                                <tr>
                                    <td colSpan={type === "scrap-buy" ? 6 : 5} className="px-6 py-12 text-center text-gray-400 dark:text-white/20 text-xs font-bold uppercase tracking-widest">
                                        No data entries found
                                    </td>
                                </tr>
                            ) : leads.map((item: any) => (
                                <tr key={item._id} className="hover:bg-gray-50 dark:hover:bg-white/[0.03] transition-colors group">
                                    <td className="px-6 py-4 text-[11px] font-medium text-gray-500 dark:text-white/40 whitespace-nowrap">
                                        <div className="flex flex-col">
                                            <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                                            <span className="text-[9px] text-gray-400 dark:text-white/20">{new Date(item.createdAt).toLocaleTimeString()}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="font-bold text-gray-900 dark:text-white">{item.customerName}</p>
                                        <p className="text-[10px] text-gray-500 dark:text-white/40">{item.customerPhone}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="font-medium text-gray-900 dark:text-white">{item.vehicleInfo}</p>
                                        {item.regNo && item.regNo !== "N/A" && (
                                            <p className="text-[10px] font-mono text-gray-400 dark:text-white/30">{item.regNo}</p>
                                        )}
                                    </td>
                                    {type === "scrap-buy" && (
                                        <td className="px-6 py-4">
                                            <p className="font-medium text-purple-700 dark:text-purple-300">{item.desiredCompany}</p>
                                            <p className="text-[10px] text-gray-500 dark:text-white/40">{item.desiredModel}</p>
                                        </td>
                                    )}
                                    <td className="px-6 py-4">{getStatusBadge(item.status)}</td>
                                    <td className="px-6 py-4 text-right">
                                        <Link
                                            href={item.viewHref}
                                            className="inline-flex items-center gap-2 px-4 py-2 bg-black dark:bg-white text-white dark:text-black rounded-xl text-[10px] font-black uppercase tracking-widest hover:opacity-80 transition-all"
                                        >
                                            Review Lead <ArrowUpRight className="w-3 h-3" />
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Mobile Cards */}
                <div className="md:hidden p-4 space-y-4">
                    {leads.length === 0 ? (
                        <div className="py-12 text-center text-gray-400 dark:text-white/20 text-xs font-bold uppercase tracking-widest">No data entries found</div>
                    ) : leads.map((item: any) => (
                        <div key={item._id} className="bg-gray-50 dark:bg-black/20 rounded-xl border border-gray-100 dark:border-white/5 p-4 space-y-3">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="font-bold text-gray-900 dark:text-white">{item.customerName}</p>
                                    <p className="text-[11px] text-gray-500 dark:text-white/40">{item.customerPhone}</p>
                                </div>
                                {getStatusBadge(item.status)}
                            </div>
                            <div className="grid grid-cols-2 gap-3 py-3 border-y border-gray-100 dark:border-white/5">
                                <div>
                                    <p className="text-[9px] text-gray-400 font-black uppercase tracking-widest mb-1">Vehicle</p>
                                    <p className="text-xs font-bold text-gray-900 dark:text-white">{item.vehicleInfo}</p>
                                    {item.regNo && item.regNo !== "N/A" && <p className="text-[10px] font-mono text-gray-400">{item.regNo}</p>}
                                </div>
                                {type === "scrap-buy" ? (
                                    <div>
                                        <p className="text-[9px] text-gray-400 font-black uppercase tracking-widest mb-1">Wants to Buy</p>
                                        <p className="text-xs font-bold text-purple-700 dark:text-purple-300">{item.desiredCompany}</p>
                                        <p className="text-[10px] text-gray-400">{item.desiredModel}</p>
                                    </div>
                                ) : (
                                    <div>
                                        <p className="text-[9px] text-gray-400 font-black uppercase tracking-widest mb-1">Date</p>
                                        <p className="text-xs text-gray-600 dark:text-white/60">{new Date(item.createdAt).toLocaleDateString()}</p>
                                    </div>
                                )}
                            </div>
                            <Link
                                href={item.viewHref}
                                className="w-full flex items-center justify-center gap-2 py-2.5 bg-black dark:bg-white text-white dark:text-black rounded-xl text-[10px] font-black uppercase tracking-widest hover:opacity-80 transition-all"
                            >
                                Review Lead <ArrowUpRight className="w-3 h-3" />
                            </Link>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}


import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import connectToDatabase from "@/lib/db"
import Valuation from "@/models/Valuation"
import SellVehicle from "@/models/SellVehicle"
import ExchangeVehicle from "@/models/ExchangeVehicle"
import BuyVehicle from "@/models/BuyVehicle"
import { CheckCircle, FileText, ShoppingCart, RefreshCcw, Calendar, Eye } from "lucide-react"
import Link from "next/link"

export const dynamic = "force-dynamic"

export default async function ApprovedRequestsPage() {
    const session = await getServerSession(authOptions)

    if (!session || (session.user as any).role !== "admin") {
        redirect("/")
    }

    await connectToDatabase()

    // Fetch all approved requests from all collections
    const [quoteRequests, sellRequests, exchangeRequests, buyRequests] = await Promise.all([
        Valuation.find({ status: "approved" }).sort({ createdAt: -1 }).lean(),
        SellVehicle.find({ status: "approved" }).sort({ createdAt: -1 }).lean(),
        ExchangeVehicle.find({ status: "approved" }).sort({ createdAt: -1 }).lean(),
        BuyVehicle.find({ status: "approved" }).sort({ createdAt: -1 }).lean()
    ])

    // Combine all requests with type information
    const allRequests = [
        ...quoteRequests.map((req: any) => ({ ...req, type: "quote", typeName: "Get Free Quote", color: "blue" })),
        ...sellRequests.map((req: any) => ({ ...req, type: "sell", typeName: "Sell Old Vehicle", color: "green" })),
        ...exchangeRequests.map((req: any) => ({ ...req, type: "exchange", typeName: "Exchange Vehicle", color: "purple" })),
        ...buyRequests.map((req: any) => ({ ...req, type: "buy", typeName: "Buy New Vehicle", color: "orange" }))
    ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    function getCustomerInfo(req: any) {
        if (req.type === "quote") {
            return {
                name: req.contact?.name || "N/A",
                phone: req.contact?.phone || "N/A"
            }
        } else if (req.type === "sell") {
            return {
                name: req.name || "N/A",
                phone: req.phone || "N/A"
            }
        } else if (req.type === "exchange" || req.type === "buy") {
            return {
                name: req.customerName || "N/A",
                phone: req.customerPhone || "N/A"
            }
        }
        return { name: "N/A", phone: "N/A" }
    }

    function getVehicleInfo(req: any) {
        if (req.type === "quote") {
            return `${req.brand} ${req.model} (${req.year})`
        } else if (req.type === "sell") {
            return `${req.brand} ${req.model} (${req.registrationYear})`
        } else if (req.type === "exchange") {
            return `${req.oldVehicleBrand} ${req.oldVehicleModel} → ${req.newVehicleBrand}`
        } else if (req.type === "buy") {
            return `${req.vehicleBrand} ${req.vehicleModel}`
        }
        return "N/A"
    }

    function getTypeBadge(type: string, typeName: string, color: string) {
        const colorClasses: any = {
            blue: "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400 border-blue-200 dark:border-blue-900/50",
            green: "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 border-green-200 dark:border-green-900/50",
            purple: "bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-400 border-purple-200 dark:border-purple-900/50",
            orange: "bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-400 border-orange-200 dark:border-orange-900/50"
        }
        return (
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${colorClasses[color]}`}>
                {typeName}
            </span>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <CheckCircle className="w-6 h-6 text-emerald-600" />
                        Approved Requests
                    </h1>
                    <p className="text-gray-500 dark:text-slate-400 mt-1">All approved requests from all categories.</p>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-slate-400">
                    <span className="font-semibold text-gray-900 dark:text-white">{allRequests.length}</span>
                    <span>Total Approved</span>
                </div>
            </div>

            <div className="bg-white dark:bg-[#0E192D] rounded-xl shadow-sm border border-gray-200 dark:border-slate-800 overflow-hidden">
                {/* Desktop View (Table) */}
                <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 dark:bg-slate-900/50 text-gray-700 dark:text-slate-300 font-semibold border-b border-gray-200 dark:border-slate-800">
                            <tr>
                                <th className="px-6 py-4 whitespace-nowrap">Date</th>
                                <th className="px-6 py-4 whitespace-nowrap">Type</th>
                                <th className="px-6 py-4 whitespace-nowrap">Customer</th>
                                <th className="px-6 py-4 whitespace-nowrap">Details</th>
                                <th className="px-6 py-4 whitespace-nowrap">Approved On</th>
                                <th className="px-6 py-4 whitespace-nowrap text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                            {allRequests.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500 dark:text-slate-500">
                                        No approved requests found.
                                    </td>
                                </tr>
                            ) : (
                                allRequests.map((req: any) => {
                                    const customer = getCustomerInfo(req)
                                    const vehicle = getVehicleInfo(req)
                                    return (
                                        <tr key={`${req.type}-${req._id}`} className="hover:bg-gray-50/50 dark:hover:bg-slate-800/50 transition-colors">
                                            <td className="px-6 py-4 text-gray-500 dark:text-slate-400 whitespace-nowrap">
                                                {new Date(req.createdAt).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4">
                                                {getTypeBadge(req.type, req.typeName, req.color)}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-8 h-8 rounded-full bg-${req.color}-50 dark:bg-${req.color}-900/30 flex items-center justify-center text-${req.color}-600 dark:text-${req.color}-400 font-bold text-xs`}>
                                                        {customer.name[0]}
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-gray-900 dark:text-white">{customer.name}</p>
                                                        <p className="text-xs text-gray-500 dark:text-slate-500">{customer.phone}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="font-medium text-gray-900 dark:text-white">{vehicle}</p>
                                            </td>
                                            <td className="px-6 py-4 text-gray-500 dark:text-slate-400 whitespace-nowrap">
                                                {new Date(req.updatedAt).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <Link
                                                    href={`/admin/valuations/${req.type}/${req._id}`}
                                                    className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium text-xs"
                                                >
                                                    View Details
                                                </Link>
                                            </td>
                                        </tr>
                                    )
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Mobile View (Cards) */}
                <div className="md:hidden p-4 space-y-4 bg-gray-50/30 dark:bg-slate-900/20">
                    {allRequests.length === 0 ? (
                        <div className="px-6 py-12 text-center text-gray-500 dark:text-slate-500 bg-white dark:bg-[#0E192D] rounded-xl border border-gray-100 dark:border-slate-800">
                            No approved requests found.
                        </div>
                    ) : (
                        allRequests.map((req: any) => {
                            const customer = getCustomerInfo(req)
                            const vehicle = getVehicleInfo(req)
                            return (
                                <div key={`${req.type}-${req._id}`} className="bg-white dark:bg-[#0E192D] rounded-xl border border-gray-200 dark:border-slate-800 shadow-sm overflow-hidden transition-all active:scale-[0.98]">
                                    <div className="p-4 space-y-4">
                                        <div className="flex justify-between items-start">
                                            {getTypeBadge(req.type, req.typeName, req.color)}
                                            <div className="text-right">
                                                <p className="text-[10px] text-gray-400 dark:text-slate-500 font-bold uppercase tracking-wider">Date</p>
                                                <p className="text-[11px] text-gray-500 dark:text-slate-400 font-medium">
                                                    {new Date(req.createdAt).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="border-y border-gray-50 dark:border-slate-800/50 py-3">
                                            <p className="text-[10px] text-gray-400 dark:text-slate-500 font-bold uppercase tracking-wider mb-1">Vehicle Details</p>
                                            <p className="text-sm font-bold text-gray-900 dark:text-white leading-snug">
                                                {vehicle}
                                            </p>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-1">
                                                <p className="text-[10px] text-gray-400 dark:text-slate-500 font-bold uppercase tracking-wider">Customer</p>
                                                <p className="text-xs font-bold text-gray-900 dark:text-white truncate">{customer.name}</p>
                                                <p className="text-[10px] font-mono text-gray-500 dark:text-slate-400">{customer.phone}</p>
                                            </div>
                                            <div className="space-y-1 text-right">
                                                <p className="text-[10px] text-gray-400 dark:text-slate-500 font-bold uppercase tracking-wider">Approved On</p>
                                                <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                                                    {new Date(req.updatedAt).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>

                                        <Link
                                            href={`/admin/valuations/${req.type}/${req._id}`}
                                            className={`flex items-center justify-center gap-2 w-full py-2.5 rounded-lg font-bold text-xs transition-all active:scale-[0.95] shadow-sm
                                                ${req.color === 'blue' ? 'bg-blue-600 text-white shadow-blue-100 dark:bg-blue-500/10 dark:text-blue-400 dark:shadow-none' :
                                                    req.color === 'green' ? 'bg-emerald-600 text-white shadow-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:shadow-none' :
                                                        req.color === 'purple' ? 'bg-purple-600 text-white shadow-purple-100 dark:bg-purple-500/10 dark:text-purple-400 dark:shadow-none' :
                                                            'bg-orange-600 text-white shadow-orange-100 dark:bg-orange-500/10 dark:text-orange-400 dark:shadow-none'}`}
                                        >
                                            <Eye className="w-4 h-4" />
                                            View Details
                                        </Link>
                                    </div>
                                </div>
                            )
                        })
                    )}
                </div>
            </div>
        </div>
    )
}


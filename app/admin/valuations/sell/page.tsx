

import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import connectToDatabase from "@/lib/db"
import SellVehicle from "@/models/SellVehicle"
import { ShoppingCart, Calendar, CheckCircle, Clock } from "lucide-react"
import Link from "next/link"
import ExportCSVButton from "@/components/admin/ExportCSVButton"

export const dynamic = "force-dynamic"

export default async function SellValuationsPage() {
    const session = await getServerSession(authOptions)

    if (!session || (session.user as any).role !== "admin") {
        redirect("/")
    }

    await connectToDatabase()
    // Explicitly casting to any to avoid TS errors with lean() or older mongoose types if strict
    const requests = await SellVehicle.find({ status: { $ne: "approved" } }).sort({ createdAt: -1 })

    function getStatusBadge(status: string) {
        switch (status) {
            case "pending":
                return <span className="px-2 py-1 rounded-full text-xs font-semibold bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-900/50">Pending</span>
            case "contacted":
                return <span className="px-2 py-1 rounded-full text-xs font-semibold bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400 border border-blue-200 dark:border-blue-900/50">Contacted</span>
            case "completed":
                return <span className="px-2 py-1 rounded-full text-xs font-semibold bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 border border-green-200 dark:border-green-900/50">Completed</span>
            case "rejected":
                return <span className="px-2 py-1 rounded-full text-xs font-semibold bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400 border border-red-200 dark:border-red-900/50">Rejected</span>
            default:
                return <span className="px-2 py-1 rounded bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-400 text-xs">{status}</span>
        }
    }

    const exportHeaders = ["Date", "Owner Name", "Phone Number", "Vehicle Info", "Registration", "Loan Status", "Status"]
    const exportRows = requests.map((req: any) => {
        const date = new Date(req.createdAt).toLocaleDateString()
        const owner = req.name || "N/A"
        const phone = req.phone || "N/A"
        const vehicleInfo = `${req.brand} ${req.model} (${req.registrationYear} - ${req.fuelType})`
        const reg = req.registrationNumber || "N/A"
        const loan = req.pendingLoan === "yes" ? `Yes (${req.loanAmount || "N/A"})` : "No Loan"

        return [date, owner, phone, vehicleInfo, reg, loan, req.status]
    })

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <ShoppingCart className="w-6 h-6 text-green-600" />
                        Sell Old Vehicle Requests
                    </h1>
                    <p className="text-gray-500 dark:text-slate-400 mt-1">Direct requests from users wanting to sell/scrap vehicles.</p>
                </div>
                <ExportCSVButton headers={exportHeaders} rows={exportRows} filename="sell_requests.csv" />
            </div>

            <div className="bg-white dark:bg-[#0E192D] rounded-xl shadow-sm border border-gray-200 dark:border-slate-800 overflow-hidden">
                {/* Desktop Table View */}
                <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 dark:bg-slate-900/50 text-gray-700 dark:text-slate-300 font-semibold border-b border-gray-200 dark:border-slate-800">
                            <tr>
                                <th className="px-6 py-4 whitespace-nowrap">Date</th>
                                <th className="px-6 py-4 whitespace-nowrap">Owner Details</th>
                                <th className="px-6 py-4 whitespace-nowrap">Vehicle Info</th>
                                <th className="px-6 py-4 whitespace-nowrap">Registration</th>
                                <th className="px-6 py-4 whitespace-nowrap">Loan Status</th>
                                <th className="px-6 py-4 whitespace-nowrap">Status</th>
                                <th className="px-6 py-4 whitespace-nowrap text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                            {requests.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-8 text-center text-gray-500 dark:text-slate-500">
                                        No sell requests found.
                                    </td>
                                </tr>
                            ) : (
                                requests.map((req: any) => (
                                    <tr key={req._id} className="hover:bg-gray-50/50 dark:hover:bg-slate-800/50 transition-colors">
                                        <td className="px-6 py-4 text-gray-500 dark:text-slate-400 whitespace-nowrap">
                                            {new Date(req.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-green-50 dark:bg-green-900/20 flex items-center justify-center text-green-600 dark:text-green-400 font-bold text-xs">
                                                    {(req.name || "U")[0]}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-900 dark:text-white">{req.name}</p>
                                                    <p className="text-xs text-gray-500 dark:text-slate-400">{req.phone}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="font-medium text-gray-900 dark:text-white">{req.brand} {req.model}</p>
                                            <p className="text-xs text-gray-500 dark:text-slate-400">{req.fuelType} • {req.registrationYear}</p>
                                        </td>
                                        <td className="px-6 py-4 font-mono text-gray-600 dark:text-slate-400">
                                            {req.registrationNumber}
                                        </td>
                                        <td className="px-6 py-4 text-gray-600 dark:text-slate-400">
                                            {req.pendingLoan === "yes" ? (
                                                <span className="text-red-600 dark:text-red-400 font-medium text-xs">Yes ({req.loanAmount})</span>
                                            ) : (
                                                <span className="text-green-600 dark:text-green-400 font-medium text-xs">No Loan</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            {getStatusBadge(req.status)}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <Link href={`/admin/valuations/sell/${req._id}`} className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium text-xs">
                                                View
                                            </Link>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Mobile Card View */}
                <div className="md:hidden p-4 space-y-4 bg-gray-50/30 dark:bg-slate-900/20">
                    {requests.length === 0 ? (
                        <div className="px-6 py-8 text-center text-gray-500 dark:text-slate-500 text-sm bg-white dark:bg-[#0E192D] rounded-xl border border-gray-200 dark:border-slate-800">
                            No sell requests found.
                        </div>
                    ) : (
                        requests.map((req: any) => (
                            <div key={req._id} className="bg-white dark:bg-[#0E192D] rounded-xl border border-gray-200 dark:border-slate-800 shadow-sm overflow-hidden transition-all active:scale-[0.98]">
                                <div className="p-4 space-y-4">
                                    <div className="flex justify-between items-start">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-green-50 dark:bg-green-900/20 flex items-center justify-center text-green-600 dark:text-green-400 font-bold text-sm">
                                                {(req.name || "U")[0]}
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-900 dark:text-white leading-tight">{req.name}</p>
                                                <p className="text-[11px] text-gray-400 dark:text-slate-500 mt-0.5">{new Date(req.createdAt).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                        {getStatusBadge(req.status)}
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 text-sm py-3 border-y border-gray-50 dark:border-slate-800/50">
                                        <div>
                                            <p className="text-[10px] text-gray-400 dark:text-slate-500 font-bold uppercase tracking-wider mb-1">Vehicle</p>
                                            <p className="font-semibold text-gray-900 dark:text-white truncate">{req.brand} {req.model}</p>
                                            <p className="text-[11px] text-gray-500 dark:text-slate-400 truncate">{req.fuelType} • {req.registrationYear}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-gray-400 dark:text-slate-500 font-bold uppercase tracking-wider mb-1">Registration</p>
                                            <p className="font-mono text-[11px] text-gray-900 dark:text-white">{req.registrationNumber}</p>
                                            <div className="mt-1">
                                                {req.pendingLoan === "yes" ? (
                                                    <span className="text-red-600 dark:text-red-400 font-bold text-[10px] uppercase bg-red-50 dark:bg-red-900/20 px-1.5 py-0.5 rounded">Loan: Yes</span>
                                                ) : (
                                                    <span className="text-green-600 dark:text-green-400 font-bold text-[10px] uppercase bg-green-50 dark:bg-green-900/20 px-1.5 py-0.5 rounded">No Loan</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between pt-1">
                                        <div className="flex flex-col">
                                            <p className="text-[10px] text-gray-400 dark:text-slate-500 font-bold uppercase tracking-wider">Contact</p>
                                            <p className="text-xs font-mono text-gray-600 dark:text-slate-400">{req.phone}</p>
                                        </div>
                                        <Link
                                            href={`/admin/valuations/sell/${req._id}`}
                                            className="inline-flex items-center justify-center px-4 py-2 bg-green-600 hover:bg-green-700 dark:bg-green-500/10 dark:hover:bg-green-500/20 text-white dark:text-green-400 rounded-lg font-bold text-xs transition-all shadow-md shadow-green-200 dark:shadow-none"
                                        >
                                            View Details
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    )
}


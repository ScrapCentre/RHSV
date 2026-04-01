
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import connectToDatabase from "@/lib/db"
import Valuation from "@/models/Valuation"
import { FileText, Car, Smartphone, MapPin, Clock, Calendar, CheckCircle, ChevronLeft } from "lucide-react"
import Link from "next/link"
import ExportCSVButton from "@/components/admin/ExportCSVButton"

export const dynamic = "force-dynamic"

export default async function QuoteValuationsPage() {
    const session = await getServerSession(authOptions)

    if (!session || (session.user as any).role !== "admin") {
        redirect("/")
    }

    await connectToDatabase()
    const valuations = await Valuation.find({ status: { $ne: "approved" } }).sort({ createdAt: -1 })

    function getStatusBadge(status: string) {
        switch (status) {
            case "pending":
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-900/50">
                        <Clock className="w-3.5 h-3.5" /> Pending
                    </span>
                )
            case "reviewed":
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400 border border-blue-200 dark:border-blue-900/50">
                        <Calendar className="w-3.5 h-3.5" /> Reviewed
                    </span>
                )
            case "completed":
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 border border-green-200 dark:border-green-900/50">
                        <CheckCircle className="w-3.5 h-3.5" /> Completed
                    </span>
                )
            default:
                return <span className="px-2 py-1 rounded bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-400 text-xs">{status}</span>
        }
    }

    const exportHeaders = ["Date", "Customer Name", "Phone Number", "Vehicle Details", "Location", "Status"]
    const exportRows = valuations.map((val: any) => {
        const date = new Date(val.createdAt).toLocaleDateString()
        const customerName = val.contact?.name || "N/A"
        const phone = val.contact?.phone || "N/A"
        const vehicle = `${val.brand} ${val.model} (${val.year}) ${val.vehicleNumber ? `- ${val.vehicleNumber}` : ''}`
        const location = [val.address?.city, val.address?.state].filter(Boolean).join(", ") || val.address?.pincode || "N/A"

        return [date, customerName, phone, vehicle, location, val.status]
    })

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <FileText className="w-6 h-6 text-blue-600" />
                        Get Free Quote Requests
                    </h1>
                    <p className="text-gray-500 dark:text-slate-400 mt-1">Manage standard valuation inquiries.</p>
                </div>
                <ExportCSVButton headers={exportHeaders} rows={exportRows} filename="quote_requests.csv" />
            </div>

            <div className="bg-white dark:bg-[#0E192D] rounded-xl shadow-sm border border-gray-200 dark:border-slate-800 overflow-hidden">
                {/* Desktop Table View */}
                <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 dark:bg-slate-900/50 text-gray-700 dark:text-slate-300 font-semibold border-b border-gray-200 dark:border-slate-800">
                            <tr>
                                <th className="px-6 py-4 whitespace-nowrap">Date</th>
                                <th className="px-6 py-4 whitespace-nowrap">Customer</th>
                                <th className="px-6 py-4 whitespace-nowrap">Vehicle Details</th>
                                <th className="px-6 py-4 whitespace-nowrap">Location</th>
                                <th className="px-6 py-4 whitespace-nowrap">Status</th>
                                <th className="px-6 py-4 whitespace-nowrap text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                            {valuations.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500 dark:text-slate-500">
                                        No quote requests found.
                                    </td>
                                </tr>
                            ) : (
                                valuations.map((val: any) => (
                                    <tr key={val._id} className="hover:bg-gray-50/50 dark:hover:bg-slate-800/50 transition-colors">
                                        <td className="px-6 py-4 text-gray-500 dark:text-slate-400 whitespace-nowrap">
                                            {new Date(val.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-xs">
                                                    {(val.contact?.name || "U")[0]}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-900 dark:text-white">{val.contact?.name}</p>
                                                    <p className="text-xs text-gray-500 dark:text-slate-400">{val.contact?.phone}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="font-medium text-gray-900 dark:text-white">{val.brand} {val.model}</p>
                                            <p className="text-xs text-gray-500 dark:text-slate-400">{val.year} • {val.vehicleNumber}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            {val.address?.city || val.address?.state ? (
                                                <div className="flex flex-col">
                                                    <span className="text-gray-900 dark:text-white font-medium text-sm">
                                                        {[val.address?.city, val.address?.state].filter(Boolean).join(", ")}
                                                    </span>
                                                    <span className="text-xs text-gray-500 dark:text-slate-400">
                                                        {val.address?.pincode}
                                                    </span>
                                                </div>
                                            ) : (
                                                <span className="text-gray-600 dark:text-slate-400">{val.address?.pincode || "N/A"}</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            {getStatusBadge(val.status)}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <Link href={`/admin/valuations/quote/${val._id}`} target="_blank" className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium text-xs">
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
                    {valuations.length === 0 ? (
                        <div className="px-6 py-8 text-center text-gray-500 dark:text-slate-500 text-sm bg-white dark:bg-[#0E192D] rounded-xl border border-gray-200 dark:border-slate-800">
                            No quote requests found.
                        </div>
                    ) : (
                        valuations.map((val: any) => (
                            <div key={val._id} className="bg-white dark:bg-[#0E192D] rounded-xl border border-gray-200 dark:border-slate-800 shadow-sm overflow-hidden transition-all active:scale-[0.98]">
                                <div className="p-4 space-y-4">
                                    <div className="flex justify-between items-start">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-sm">
                                                {(val.contact?.name || "U")[0]}
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-900 dark:text-white leading-tight">{val.contact?.name}</p>
                                                <p className="text-[11px] text-gray-400 dark:text-slate-500 mt-0.5">{new Date(val.createdAt).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                        {getStatusBadge(val.status)}
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 text-sm py-3 border-y border-gray-50 dark:border-slate-800/50">
                                        <div>
                                            <p className="text-[10px] text-gray-400 dark:text-slate-500 font-bold uppercase tracking-wider mb-1">Vehicle</p>
                                            <p className="font-semibold text-gray-900 dark:text-white truncate">{val.brand}</p>
                                            <p className="text-[11px] text-gray-500 dark:text-slate-400 truncate">{val.model} ({val.year})</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-gray-400 dark:text-slate-500 font-bold uppercase tracking-wider mb-1">Location</p>
                                            <p className="font-medium text-gray-800 dark:text-slate-300 truncate">
                                                {val.address?.city || val.address?.pincode || "N/A"}
                                            </p>
                                            <p className="text-[11px] text-gray-500 dark:text-slate-500 truncate">{val.address?.state || "India"}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between pt-1">
                                        <div className="flex flex-col">
                                            <p className="text-[10px] text-gray-400 dark:text-slate-500 font-bold uppercase tracking-wider">Contact</p>
                                            <p className="text-xs font-mono text-gray-600 dark:text-slate-400">{val.contact?.phone}</p>
                                        </div>
                                        <Link
                                            href={`/admin/valuations/quote/${val._id}`}
                                            className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500/10 dark:hover:bg-blue-500/20 text-white dark:text-blue-400 rounded-lg font-bold text-xs transition-all shadow-md shadow-blue-200 dark:shadow-none"
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


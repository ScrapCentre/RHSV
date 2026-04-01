import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import connectToDatabase from "@/lib/db"
import BulkOutsourcing from "@/models/BulkOutsourcing"
import { CheckCircle, Eye, Database, Calendar } from "lucide-react"
import Link from "next/link"

export const dynamic = "force-dynamic"

export default async function ApprovedPartnerRequestsPage() {
    const session = await getServerSession(authOptions)

    if (!session || (session.user as any).role !== "admin") {
        redirect("/")
    }

    await connectToDatabase()

    // Fetch all approved requests from BulkOutsourcing collection
    const bulkRequests = await BulkOutsourcing.find({ status: "approved" }).sort({ createdAt: -1 }).lean()

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <CheckCircle className="w-6 h-6 text-emerald-600" />
                        Approved Partner Requests
                    </h1>
                    <p className="text-gray-500 dark:text-slate-400 mt-1">All approved bulk outsourcing requests from partners.</p>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-slate-400">
                    <span className="font-semibold text-gray-900 dark:text-white">{bulkRequests.length}</span>
                    <span>Total Approved</span>
                </div>
            </div>

            <div className="bg-white dark:bg-[#0E192D] rounded-xl shadow-sm border border-gray-200 dark:border-slate-800 overflow-hidden">
                {/* Desktop View (Table) */}
                <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 dark:bg-slate-900/50 text-gray-700 dark:text-slate-300 font-semibold border-b border-gray-200 dark:border-slate-800">
                            <tr>
                                <th className="px-6 py-4 whitespace-nowrap">Date Submitted</th>
                                <th className="px-6 py-4 whitespace-nowrap">Partner</th>
                                <th className="px-6 py-4 whitespace-nowrap text-center">Total Entries</th>
                                <th className="px-6 py-4 whitespace-nowrap text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                            {bulkRequests.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center text-gray-500 dark:text-slate-500">
                                        <div className="flex flex-col items-center justify-center">
                                            <Database className="w-12 h-12 text-gray-300 dark:text-slate-600 mb-4" />
                                            <p className="text-lg font-medium text-gray-900 dark:text-white">No approved requests found</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                bulkRequests.map((req: any) => {
                                    return (
                                        <tr key={req._id.toString()} className="hover:bg-gray-50/50 dark:hover:bg-slate-800/50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center text-sm text-gray-500 dark:text-slate-300">
                                                    <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                                                    {new Date(req.createdAt).toLocaleDateString()}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-gray-900 dark:text-white">{req.partnerName}</span>
                                                    <span className="text-sm text-gray-500 dark:text-slate-400">{req.partnerEmail}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <div className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 font-bold text-sm">
                                                    {req.entries?.length || 0} Vehicles
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right">
                                                <Link
                                                    href={`/admin/bulk-outsourcing/${req._id}`}
                                                    className="inline-flex items-center gap-2 px-3 py-2 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-800/40 rounded-lg font-medium transition-colors"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                    Review
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
                    {bulkRequests.length === 0 ? (
                        <div className="px-6 py-12 text-center text-gray-500 dark:text-slate-500 bg-white dark:bg-[#0E192D] rounded-xl border border-gray-100 dark:border-slate-800">
                            No approved requests found.
                        </div>
                    ) : (
                        bulkRequests.map((req: any) => (
                            <div key={req._id.toString()} className="bg-white dark:bg-[#0E192D] rounded-xl border border-gray-200 dark:border-slate-800 shadow-sm overflow-hidden transition-all active:scale-[0.98]">
                                <div className="p-4 space-y-4">
                                    <div className="flex justify-between items-start">
                                        <div className="space-y-1">
                                            <p className="text-[10px] text-gray-400 dark:text-slate-500 font-bold uppercase tracking-wider">Partner</p>
                                            <p className="text-sm font-bold text-gray-900 dark:text-white leading-tight">{req.partnerName}</p>
                                            <p className="text-[11px] text-gray-500 dark:text-slate-400">{req.partnerEmail}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[10px] text-gray-400 dark:text-slate-500 font-bold uppercase tracking-wider">Date</p>
                                            <p className="text-[11px] text-gray-500 dark:text-slate-400 font-medium">
                                                {new Date(req.createdAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="border-y border-gray-50 dark:border-slate-800/50 py-3 flex justify-between items-center">
                                        <div>
                                            <p className="text-[10px] text-gray-400 dark:text-slate-500 font-bold uppercase tracking-wider mb-1">Total Entries</p>
                                            <div className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 font-bold text-xs">
                                                {req.entries?.length || 0} Vehicles
                                            </div>
                                        </div>
                                        <div className="w-8 h-8 rounded-full bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                                            <Database className="w-4 h-4" />
                                        </div>
                                    </div>

                                    <Link
                                        href={`/admin/bulk-outsourcing/${req._id}`}
                                        className="flex items-center justify-center gap-2 w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white dark:bg-emerald-500/10 dark:text-emerald-400 dark:hover:bg-emerald-500/20 rounded-lg font-bold text-xs transition-all active:scale-[0.95] shadow-sm shadow-emerald-100 dark:shadow-none"
                                    >
                                        <Eye className="w-4 h-4" />
                                        Review Details
                                    </Link>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    )
}

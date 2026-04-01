"use client"

import { motion } from "framer-motion"
import { Shield, FileText, CheckCircle, Users, UploadCloud, ChevronRight } from "lucide-react"
import Link from "next/link"
import DashboardCharts from "./DashboardCharts"

interface DashboardOverviewProps {
    totalRequests: number
    formattedTotalTons: string
    b2bTotal: number
    totalApproved: number
    marketFeed: any[]
    valuationCounts: {
        quote: number
        sell: number
        exchange: number
        buy: number
    }
    b2bStats: {
        total: number
        pending: number
        approved: number
    }
    monthlyGrowthData: { name: string, value: number }[]
    activityData: { name: string, requests: number, partners: number }[]
}

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
            delayChildren: 0.1
        }
    }
}

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.6, ease: [0.215, 0.61, 0.355, 1] as any }
    }
}

export default function DashboardOverview({
    totalRequests,
    formattedTotalTons,
    b2bTotal,
    totalApproved,
    marketFeed,
    valuationCounts,
    b2bStats,
    monthlyGrowthData,
    activityData
}: DashboardOverviewProps) {
    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-8 max-w-7xl mx-auto"
        >
            {/* Header */}
            <motion.div variants={itemVariants} className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 dark:text-white flex items-center gap-3 tracking-tight">
                        <Shield className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
                        Admin Dashboard
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-2 font-medium">Overview of platform performance.</p>
                </div>
            </motion.div>

            {/* Color Legend */}
            <motion.div variants={itemVariants} className="bg-white dark:bg-[#0E192D] px-4 py-3 rounded-xl border border-gray-100 dark:border-slate-800 shadow-sm transition-colors duration-300">
                <h3 className="text-xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wide mb-2">Data Type Legend</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="flex items-center gap-2 p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/30">
                        <div className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-sm shadow-blue-200 dark:shadow-none"></div>
                        <span className="text-xs font-bold text-blue-700 dark:text-blue-400">Free Quote</span>
                    </div>
                    <div className="flex items-center gap-2 p-2 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800/30">
                        <div className="w-2.5 h-2.5 rounded-full bg-green-500 shadow-sm shadow-green-200 dark:shadow-none"></div>
                        <span className="text-xs font-bold text-green-700 dark:text-green-400">Sell Vehicle</span>
                    </div>
                    <div className="flex items-center gap-2 p-2 rounded-lg bg-purple-50 dark:bg-purple-900/20 border border-purple-100 dark:border-purple-800/30">
                        <div className="w-2.5 h-2.5 rounded-full bg-purple-500 shadow-sm shadow-purple-200 dark:shadow-none"></div>
                        <span className="text-xs font-bold text-purple-700 dark:text-purple-400">Exchange</span>
                    </div>
                    <div className="flex items-center gap-2 p-2 rounded-lg bg-orange-50 dark:bg-orange-900/20 border border-orange-100 dark:border-orange-800/30">
                        <div className="w-2.5 h-2.5 rounded-full bg-orange-500 shadow-sm shadow-orange-200 dark:shadow-none"></div>
                        <span className="text-xs font-bold text-orange-700 dark:text-orange-400">Buy Vehicle</span>
                    </div>
                </div>
            </motion.div>

            {/* Summary Data Cards */}
            <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Total Requests */}
                <div className="bg-white dark:bg-[#0E192D] p-6 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm flex flex-col items-center text-center gap-2 hover:translate-y-[-4px] transition-transform duration-300 cursor-default">
                    <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl mb-2">
                        <FileText className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <h3 className="text-3xl font-black text-gray-900 dark:text-white">{totalRequests}</h3>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Total Requests</p>
                </div>

                {/* Total Tons */}
                <div className="bg-white dark:bg-[#0E192D] p-6 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm flex flex-col items-center text-center gap-2 hover:translate-y-[-4px] transition-transform duration-300 cursor-default">
                    <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl mb-2">
                        <UploadCloud className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <h3 className="text-3xl font-black text-gray-900 dark:text-white">{formattedTotalTons} <span className="text-lg text-gray-400 font-bold">tons</span></h3>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Business Done</p>
                </div>

                {/* Total Partners */}
                <div className="bg-white dark:bg-[#0E192D] p-6 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm flex flex-col items-center text-center gap-2 hover:translate-y-[-4px] transition-transform duration-300 cursor-default">
                    <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl mb-2">
                        <Users className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <h3 className="text-3xl font-black text-gray-900 dark:text-white">{b2bTotal}</h3>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Total Partners</p>
                </div>

                {/* Total Approved */}
                <div className="bg-white dark:bg-[#0E192D] p-6 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm flex flex-col items-center text-center gap-2 hover:translate-y-[-4px] transition-transform duration-300 cursor-default">
                    <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl mb-2">
                        <CheckCircle className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <h3 className="text-3xl font-black text-gray-900 dark:text-white">{totalApproved}</h3>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Approved Requests</p>
                </div>
            </motion.div>

            {/* Dashboard Charts */}
            <motion.div variants={itemVariants}>
                <DashboardCharts
                    valuationCounts={valuationCounts}
                    b2bStats={b2bStats}
                    monthlyGrowthData={monthlyGrowthData}
                    activityData={activityData}
                />
            </motion.div>

            {/* Market Feed Section */}
            <motion.div variants={itemVariants} className="mt-8 bg-white dark:bg-[#0E192D] rounded-xl shadow-sm border border-gray-200 dark:border-slate-800 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-slate-800 flex justify-between items-center bg-gray-50 dark:bg-slate-900/50">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <FileText className="w-5 h-5 text-blue-600 dark:text-blue-500" />
                        Market Feed
                    </h2>
                    <span className="text-xs font-medium px-2 py-1 rounded bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400">
                        Latest Activities
                    </span>
                </div>

                {/* Desktop View (Table) */}
                <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 dark:bg-slate-900/50 text-gray-500 dark:text-slate-400 font-medium border-b border-gray-200 dark:border-slate-800">
                            <tr>
                                <th className="px-6 py-3">Type</th>
                                <th className="px-6 py-3">Customer</th>
                                <th className="px-6 py-3">Vehicle Details</th>
                                <th className="px-6 py-3">Date</th>
                                <th className="px-6 py-3">Status</th>
                                <th className="px-6 py-3 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                            {marketFeed.map((item: any) => (
                                <tr key={item._id} className="hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors">
                                    <td className="px-6 py-4">
                                        {item.type === 'quote' && (
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400 border border-blue-200 dark:border-blue-800/50">
                                                Quote
                                            </span>
                                        )}
                                        {item.type === 'sell' && (
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 border border-green-200 dark:border-green-800/50">
                                                Sell
                                            </span>
                                        )}
                                        {item.type === 'exchange' && (
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-400 border border-purple-200 dark:border-purple-800/50">
                                                Exchange
                                            </span>
                                        )}
                                        {item.type === 'buy' && (
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-400 border border-orange-200 dark:border-orange-800/50">
                                                Buy
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                                        {item.customerName || "N/A"}
                                        <div className="text-xs text-gray-500 dark:text-gray-400 font-normal mt-0.5">{item.customerPhone}</div>
                                    </td>
                                    <td className="px-6 py-4 text-gray-600 dark:text-gray-300">
                                        {item.vehicleInfo}
                                    </td>
                                    <td className="px-6 py-4 text-gray-500 dark:text-slate-400">
                                        {new Date(item.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium capitalize ${item.status === 'pending' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400' :
                                            item.status === 'approved' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' :
                                                'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                                            }`}>
                                            {item.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <Link
                                            href={`/admin/valuations/${item.type}/${item._id}`}
                                            className="inline-flex items-center justify-center p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all"
                                        >
                                            <ChevronRight className="w-5 h-5" />
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Mobile View (Cards) */}
                <div className="md:hidden p-4 space-y-4 bg-gray-50/30 dark:bg-slate-900/20">
                    {marketFeed.length === 0 ? (
                        <div className="px-6 py-8 text-center text-gray-500 dark:text-slate-500 text-sm bg-white dark:bg-[#0E192D] rounded-xl border border-gray-200 dark:border-slate-800">
                            No recent activity found.
                        </div>
                    ) : (
                        marketFeed.map((item: any) => (
                            <Link key={item._id} href={`/admin/valuations/${item.type}/${item._id}`} className="block">
                                <div className="bg-white dark:bg-[#0E192D] rounded-xl border border-gray-200 dark:border-slate-800 shadow-sm overflow-hidden transition-all active:scale-[0.98]">
                                    <div className="p-4 space-y-3">
                                        <div className="flex justify-between items-start">
                                            {item.type === 'quote' && (
                                                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400 border border-blue-200 dark:border-blue-800/50">
                                                    Quote
                                                </span>
                                            )}
                                            {item.type === 'sell' && (
                                                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 border border-green-200 dark:border-green-800/50">
                                                    Sell
                                                </span>
                                            )}
                                            {item.type === 'exchange' && (
                                                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-400 border border-purple-200 dark:border-purple-800/50">
                                                    Exchange
                                                </span>
                                            )}
                                            {item.type === 'buy' && (
                                                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-400 border border-orange-200 dark:border-orange-800/50">
                                                    Buy
                                                </span>
                                            )}
                                            <p className="text-[11px] text-gray-400 dark:text-slate-500 font-medium">
                                                {new Date(item.createdAt).toLocaleDateString()}
                                            </p>
                                        </div>

                                        <div className="space-y-1">
                                            <p className="text-[10px] text-gray-400 dark:text-slate-500 font-bold uppercase tracking-wider">Request Details</p>
                                            <p className="text-sm font-bold text-gray-900 dark:text-white leading-snug line-clamp-2">
                                                {item.vehicleInfo}
                                            </p>
                                        </div>

                                        <div className="flex items-center justify-between pt-2 border-t border-gray-50 dark:border-slate-800/50">
                                            <div className="flex flex-col">
                                                <p className="text-[13px] font-bold text-gray-900 dark:text-white">{item.customerName || "N/A"}</p>
                                                <p className="text-[10px] font-mono text-gray-500 dark:text-slate-400">{item.customerPhone}</p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${item.status === 'pending' ? 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400' :
                                                    item.status === 'approved' ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400' :
                                                        'bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400'
                                                    }`}>
                                                    {item.status}
                                                </span>
                                                <div className="w-7 h-7 rounded-lg bg-gray-50 dark:bg-slate-800 flex items-center justify-center text-gray-400 border border-gray-100 dark:border-slate-700">
                                                    <ChevronRight className="w-4 h-4" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))
                    )}
                </div>
            </motion.div>
        </motion.div>
    )
}

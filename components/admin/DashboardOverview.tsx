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
            staggerChildren: 0.05,
            delayChildren: 0.05
        }
    }
}

const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.4, ease: [0.215, 0.61, 0.355, 1] as any }
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
            className="space-y-5 max-w-7xl mx-auto text-slate-800"
        >
            {/* Header */}
            <motion.div variants={itemVariants} className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2 mb-2">
                <div>
                    <h1 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2 tracking-tight">
                        <Shield className="w-5 h-5 text-[#E31E24]" />
                        Admin Dashboard
                    </h1>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 font-medium">Overview of platform performance.</p>
                </div>
            </motion.div>

            {/* Color Legend */}
            <motion.div variants={itemVariants} className="bg-white dark:bg-[#0E192D] px-4 py-2.5 rounded-xl border border-gray-100 dark:border-slate-800 shadow-sm transition-colors duration-300">
                <h3 className="text-[9px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-1.5">Data Type Legend</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5">
                    <div className="flex items-center gap-2 p-1.5 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/30">
                        <div className="w-2 h-2 rounded-full bg-blue-500 shadow-sm shadow-blue-200 dark:shadow-none shrink-0"></div>
                        <span className="text-[10px] font-bold text-blue-700 dark:text-blue-400">Scrap</span>
                    </div>
                    <div className="flex items-center gap-2 p-1.5 rounded-lg bg-purple-50 dark:bg-purple-900/20 border border-purple-100 dark:border-purple-800/30">
                        <div className="w-2 h-2 rounded-full bg-purple-500 shadow-sm shadow-purple-200 dark:shadow-none shrink-0"></div>
                        <span className="text-[10px] font-bold text-purple-700 dark:text-purple-400">Scrap &amp; Buy</span>
                    </div>
                    <div className="flex items-center gap-2 p-1.5 rounded-lg bg-orange-50 dark:bg-orange-900/20 border border-orange-100 dark:border-orange-800/30">
                        <div className="w-2 h-2 rounded-full bg-orange-500 shadow-sm shadow-orange-200 dark:shadow-none shrink-0"></div>
                        <span className="text-[10px] font-bold text-orange-700 dark:text-orange-400">Buy New</span>
                    </div>
                </div>
            </motion.div>

            {/* Summary Data Cards */}
            <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Total Requests */}
                <div className="bg-white dark:bg-[#0E192D] p-4 rounded-xl border border-gray-100 dark:border-slate-800 shadow-sm flex flex-col items-center text-center gap-1.5 hover:translate-y-[-2px] transition-transform duration-300 cursor-default">
                    <div className="p-2 bg-red-50 rounded-lg mb-1">
                        <FileText className="w-4.5 h-4.5 text-[#E31E24]" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white leading-none">{totalRequests}</h3>
                    <p className="text-[9px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest">Total Requests</p>
                </div>

                {/* Total Tons */}
                <div className="bg-white dark:bg-[#0E192D] p-4 rounded-xl border border-gray-100 dark:border-slate-800 shadow-sm flex flex-col items-center text-center gap-1.5 hover:translate-y-[-2px] transition-transform duration-300 cursor-default">
                    <div className="p-2 bg-red-50 rounded-lg mb-1">
                        <UploadCloud className="w-4.5 h-4.5 text-[#E31E24]" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white leading-none">{formattedTotalTons} <span className="text-xs text-gray-400 font-bold">tons</span></h3>
                    <p className="text-[9px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest">Business Done</p>
                </div>

                {/* Total Partners */}
                <div className="bg-white dark:bg-[#0E192D] p-4 rounded-xl border border-gray-100 dark:border-slate-800 shadow-sm flex flex-col items-center text-center gap-1.5 hover:translate-y-[-2px] transition-transform duration-300 cursor-default">
                    <div className="p-2 bg-red-50 rounded-lg mb-1">
                        <Users className="w-4.5 h-4.5 text-[#E31E24]" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white leading-none">{b2bTotal}</h3>
                    <p className="text-[9px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest">Total Partners</p>
                </div>

                {/* Total Approved */}
                <div className="bg-white dark:bg-[#0E192D] p-4 rounded-xl border border-gray-100 dark:border-slate-800 shadow-sm flex flex-col items-center text-center gap-1.5 hover:translate-y-[-2px] transition-transform duration-300 cursor-default">
                    <div className="p-2 bg-red-50 rounded-lg mb-1">
                        <CheckCircle className="w-4.5 h-4.5 text-[#E31E24]" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white leading-none">{totalApproved}</h3>
                    <p className="text-[9px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest">Approved Requests</p>
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
            <motion.div variants={itemVariants} className="mt-4 bg-white dark:bg-[#0E192D] rounded-xl shadow-sm border border-gray-100 dark:border-slate-800 overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-100 dark:border-slate-800 flex justify-between items-center bg-gray-50 dark:bg-slate-900/30">
                    <h2 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <FileText className="w-4 h-4 text-blue-650" />
                        Market Feed
                    </h2>
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 tracking-wider uppercase">
                        Latest Activities
                    </span>
                </div>

                {/* Desktop View (Table) */}
                <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                        <thead className="bg-gray-50 dark:bg-slate-900/30 text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider border-b border-gray-100 dark:border-slate-800">
                            <tr>
                                <th className="px-4 py-2">Type</th>
                                <th className="px-4 py-2">Customer</th>
                                <th className="px-4 py-2">Vehicle Details</th>
                                <th className="px-4 py-2">Date</th>
                                <th className="px-4 py-2">Status</th>
                                <th className="px-4 py-2 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                            {marketFeed.map((item: any, index: number) => (
                                <tr key={item._id} onClick={() => window.location.href = `/admin/valuations/${item.type}/${item._id}`} className={`transition-all duration-350 cursor-pointer ${index % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'} hover:bg-slate-100/50`}>
                                    <td className="px-4 py-3">
                                        {item.type === 'quote' && (
                                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border border-blue-100 dark:border-blue-800/30 leading-none">
                                                Scrap
                                            </span>
                                        )}
                                        {item.type === 'scrap-buy' && (
                                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 border border-purple-100 dark:border-purple-800/30 leading-none">
                                                Scrap &amp; Buy
                                            </span>
                                        )}
                                        {item.type === 'buy' && (
                                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400 border border-orange-100 dark:border-orange-800/30 leading-none">
                                                Buy Vehicle
                                            </span>
                                        )}
                                        {item.type === 'exchange' && (
                                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-800/30 leading-none">
                                                Exchange
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3 font-semibold text-slate-800 dark:text-white">
                                        {item.customerName || "N/A"}
                                        <div className="text-[10px] text-slate-400 font-normal mt-0.5">{item.customerPhone}</div>
                                    </td>
                                    <td className="px-4 py-3 text-slate-600 dark:text-gray-300 font-medium truncate max-w-xs">
                                        {item.vehicleInfo}
                                    </td>
                                    <td className="px-4 py-3 text-slate-500 dark:text-slate-400">
                                        {new Date(item.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-4 py-3">
                                        {item.status === 'pickup_scheduled' ? (
                                            <span className="inline-flex px-2 py-0.5 rounded-full text-[9px] font-bold uppercase bg-blue-50 text-blue-600 border border-blue-100 leading-none">
                                                Pickup Scheduled
                                            </span>
                                        ) : item.status === 'reached_collection_centre' ? (
                                            <span className="inline-flex px-2 py-0.5 rounded-full text-[9px] font-bold uppercase bg-purple-50 text-purple-600 border border-purple-100 leading-none">
                                                Picked Up
                                            </span>
                                        ) : item.status === 'car_scrapped' ? (
                                            <span className="inline-flex px-2 py-0.5 rounded-full text-[9px] font-bold uppercase bg-red-50 text-[#E31E24] border border-red-100 leading-none">
                                                Scrapped
                                            </span>
                                        ) : item.status === 'approved' ? (
                                            <span className="inline-flex px-2 py-0.5 rounded-full text-[9px] font-bold uppercase bg-emerald-50 text-emerald-700 border border-emerald-100 leading-none">
                                                Approved
                                            </span>
                                        ) : item.status === 'reviewing' ? (
                                            <span className="inline-flex px-2 py-0.5 rounded-full text-[9px] font-bold uppercase bg-blue-50 text-blue-500 border border-blue-100 leading-none">
                                                Reviewing
                                            </span>
                                        ) : (
                                            <span className="inline-flex px-2 py-0.5 rounded-full text-[9px] font-bold uppercase bg-yellow-50 text-yellow-700 border border-yellow-100 leading-none">
                                                {item.status || 'Pending'}
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <Link
                                            href={`/admin/valuations/${item.type}/${item._id}`}
                                            className="inline-flex items-center justify-center p-1.5 text-slate-400 hover:text-[#E31E24] hover:bg-slate-50 rounded-lg transition-all"
                                        >
                                            <ChevronRight className="w-4 h-4" />
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Mobile View (Cards) */}
                <div className="md:hidden p-3 space-y-3 bg-gray-50/30">
                    {marketFeed.length === 0 ? (
                        <div className="px-4 py-6 text-center text-slate-400 text-xs bg-white rounded-xl border border-gray-100">
                            No recent activity found.
                        </div>
                    ) : (
                        marketFeed.map((item: any, index: number) => (
                            <Link key={item._id} href={`/admin/valuations/${item.type}/${item._id}`} className="block">
                                <div className={`rounded-xl border border-gray-100 shadow-sm overflow-hidden transition-all duration-300 hover:shadow active:scale-[0.98] ${index % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}`}>
                                    <div className="p-3.5 space-y-2.5">
                                        <div className="flex justify-between items-start">
                                            {item.type === 'quote' && (
                                                <span className="inline-flex items-center px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-100">
                                                    Scrap
                                                </span>
                                            )}
                                            {item.type === 'scrap-buy' && (
                                                <span className="inline-flex items-center px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider bg-purple-50 text-purple-700 border border-purple-100">
                                                    Scrap &amp; Buy
                                                </span>
                                            )}
                                            {item.type === 'buy' && (
                                                <span className="inline-flex items-center px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider bg-orange-50 text-orange-700 border border-orange-100">
                                                    Buy Vehicle
                                                </span>
                                            )}
                                            {item.type === 'exchange' && (
                                                <span className="inline-flex items-center px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-750 border border-indigo-100">
                                                    Exchange
                                                </span>
                                            )}
                                            <p className="text-[10px] text-slate-400 font-medium">
                                                {new Date(item.createdAt).toLocaleDateString()}
                                            </p>
                                        </div>

                                        <div className="space-y-0.5">
                                            <p className="text-[8px] text-slate-400 font-bold uppercase tracking-wider">Request Details</p>
                                            <p className="text-xs font-bold text-slate-800 leading-snug line-clamp-2">
                                                {item.vehicleInfo}
                                            </p>
                                        </div>

                                        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                                            <div className="flex flex-col">
                                                <p className="text-xs font-bold text-slate-800">{item.customerName || "N/A"}</p>
                                                <p className="text-[9px] font-mono text-slate-400 mt-0.5">{item.customerPhone}</p>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                {item.status === 'pickup_scheduled' ? (
                                                    <span className="px-2 py-0.5 rounded-full text-[8px] font-bold uppercase bg-blue-50 text-blue-600 border border-blue-100">
                                                        Scheduled
                                                    </span>
                                                ) : item.status === 'reached_collection_centre' ? (
                                                    <span className="px-2 py-0.5 rounded-full text-[8px] font-bold uppercase bg-purple-50 text-purple-600 border border-purple-100">
                                                        Picked Up
                                                    </span>
                                                ) : item.status === 'car_scrapped' ? (
                                                    <span className="px-2 py-0.5 rounded-full text-[8px] font-bold uppercase bg-red-50 text-[#E31E24] border border-red-100">
                                                        Scrapped
                                                    </span>
                                                ) : item.status === 'approved' ? (
                                                    <span className="px-2 py-0.5 rounded-full text-[8px] font-bold uppercase bg-emerald-50 text-emerald-600 border border-emerald-100">
                                                        Approved
                                                    </span>
                                                ) : item.status === 'reviewing' ? (
                                                    <span className="px-2 py-0.5 rounded-full text-[8px] font-bold uppercase bg-blue-50 text-blue-500 border border-blue-100">
                                                        Reviewing
                                                    </span>
                                                ) : (
                                                    <span className="px-2 py-0.5 rounded-full text-[8px] font-bold uppercase bg-yellow-50 text-yellow-600 border border-yellow-100">
                                                        {item.status || 'Pending'}
                                                    </span>
                                                )}
                                                <div className="w-6 h-6 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 border border-slate-100">
                                                    <ChevronRight className="w-3.5 h-3.5" />
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

"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { 
    Shield, 
    FileText, 
    CheckCircle, 
    Users, 
    Database, 
    ChevronRight,
    Activity,
    Clock,
    ArrowUpRight
} from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"

interface ExecutiveDashboardOverviewProps {
    marketFeed: any[]
    outsourcingFeed: any[]
    timelineItems: any[]
    stats: {
        totalApproved: number
        totalOutsourcing: number
        totalLeadVolume: number
    }
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

const getTypeColor = (type: string) => {
    switch (type?.toLowerCase()) {
        case 'quote': return 'text-blue-600 dark:text-blue-400 bg-blue-500/10 border-blue-500/20'
        case 'sell': return 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
        case 'exchange': return 'text-purple-600 dark:text-purple-400 bg-purple-500/10 border-purple-500/20'
        case 'buy': return 'text-orange-600 dark:text-orange-400 bg-orange-500/10 border-orange-500/20'
        default: return 'text-gray-600 dark:text-gray-400 bg-gray-500/10 border-gray-500/20'
    }
}

export default function ExecutiveDashboardOverview({
    marketFeed,
    outsourcingFeed,
    timelineItems,
    stats
}: ExecutiveDashboardOverviewProps) {
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-8 max-w-7xl mx-auto pb-12"
        >
            {/* Header */}
            <motion.div variants={itemVariants} className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 dark:text-white flex items-center gap-3 tracking-tight uppercase">
                        <Shield className="w-8 h-8 text-blue-600 dark:text-blue-500" />
                        Executive Terminal
                    </h1>
                    <p className="text-gray-500 dark:text-white/40 mt-2 font-medium">Real-time analytical oversight & operational intelligence.</p>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">Live Monitoring Active</span>
                </div>
            </motion.div>

            {/* Metrics */}
            <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm flex flex-col gap-4 hover:border-emerald-500/50 transition-colors cursor-default group">
                    <div className="flex justify-between items-start">
                        <div className="p-3 bg-emerald-500/10 rounded-xl">
                            <CheckCircle className="w-6 h-6 text-emerald-600 dark:text-emerald-500" />
                        </div>
                        <span className="text-[10px] font-black text-gray-400 dark:text-white/20 uppercase tracking-widest">Approved Leads</span>
                    </div>
                    <div>
                        <h3 className="text-4xl font-black text-gray-900 dark:text-white">{stats.totalApproved}</h3>
                        <p className="text-xs font-bold text-gray-400 dark:text-white/40 uppercase mt-1">Verified Conversions</p>
                    </div>
                </div>


                <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm flex flex-col gap-4 hover:border-blue-500/50 transition-colors cursor-default group">
                    <div className="flex justify-between items-start">
                        <div className="p-3 bg-blue-500/10 rounded-xl">
                            <Activity className="w-6 h-6 text-blue-600 dark:text-blue-500" />
                        </div>
                        <span className="text-[10px] font-black text-gray-400 dark:text-white/20 uppercase tracking-widest">Total Volume</span>
                    </div>
                    <div>
                        <h3 className="text-4xl font-black text-gray-900 dark:text-white">{stats.totalLeadVolume}</h3>
                        <p className="text-xs font-bold text-gray-400 dark:text-white/40 uppercase mt-1">Aggregate Throughput</p>
                    </div>
                </div>
            </motion.div>

            <div className="space-y-8">
                {/* Main Feeds */}
                <div className="space-y-8">
                    {/* Market Feed */}
                    <motion.div variants={itemVariants} className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-white/5 overflow-hidden shadow-sm">
                        <div className="px-6 py-5 border-b border-gray-100 dark:border-white/5 flex justify-between items-center">
                            <h2 className="text-sm font-black uppercase tracking-widest text-gray-900 dark:text-white flex items-center gap-2">
                                <FileText className="w-4 h-4 text-blue-500" />
                                Market Feed
                            </h2>
                        </div>
                        
                        {/* Data Type Legend */}
                        <div className="px-6 py-3 border-b border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-white/[0.02] flex items-center gap-4 overflow-x-auto scrollbar-hide">
                            <span className="text-[10px] font-black uppercase tracking-widest text-gray-900 dark:text-white whitespace-nowrap">Legend:</span>
                            <div className="flex items-center gap-4">
                                <span className="inline-flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-widest text-gray-900 dark:text-white whitespace-nowrap">
                                    <span className="w-2 h-2 rounded-full bg-blue-500"></span> Free Quote
                                </span>
                                <span className="inline-flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-widest text-gray-900 dark:text-white whitespace-nowrap">
                                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Sell Vehicle
                                </span>
                                {/* <span className="inline-flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-widest text-gray-900 dark:text-white whitespace-nowrap">
                                    <span className="w-2 h-2 rounded-full bg-purple-500"></span> Exchange
                                </span> */}
                                <span className="inline-flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-widest text-gray-900 dark:text-white whitespace-nowrap">
                                    <span className="w-2 h-2 rounded-full bg-orange-500"></span> Buy Vehicle
                                </span>
                            </div>
                        </div>

                        {/* Desktop View (Table) */}
                        <div className="hidden md:block overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-gray-50 dark:bg-black/40 text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-white/20 border-b border-gray-100 dark:border-white/5">
                                    <tr>
                                        <th className="px-6 py-3">Type</th>
                                        <th className="px-6 py-3">Customer</th>
                                        <th className="px-6 py-3">Vehicle Details</th>
                                        <th className="px-6 py-3">Date</th>
                                        <th className="px-6 py-3">Status</th>
                                        <th className="px-6 py-3 text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50 dark:divide-white/5">
                                    {marketFeed.filter((item: any) => item.type !== 'exchange').map((item: any, index: number) => (
                                        <tr key={item._id} onClick={() => window.location.href = `/executive/valuations/${item.type}/${item._id}`} className={`transition-all duration-300 group hover:scale-[1.01] hover:shadow-lg relative z-0 hover:z-10 cursor-pointer ${index % 2 === 0 ? 'bg-white dark:bg-transparent' : 'bg-gray-50 dark:bg-white/[0.02]'} hover:bg-gray-100 dark:hover:bg-white/[0.06]`}>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest border ${getTypeColor(item.type)}`}>
                                                    {item.type}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-gray-900 dark:text-white">{item.customerName || "N/A"}</span>
                                                    <span className="text-[10px] font-medium text-gray-500 dark:text-white/40">{item.customerPhone}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-[13px] font-medium text-gray-600 dark:text-white/70">
                                                {item.vehicleInfo}
                                            </td>
                                            <td className="px-6 py-4 text-[11px] font-medium text-gray-500 dark:text-white/40">
                                                {mounted ? format(new Date(item.createdAt), "MMM d, HH:mm") : ""}
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
                                                <Link href={`/executive/valuations/${item.type}/${item._id}`} className="p-2 inline-flex items-center justify-center rounded-lg hover:bg-black dark:hover:bg-white text-gray-400 hover:text-white dark:hover:text-black transition-all">
                                                    <ChevronRight className="w-4 h-4" />
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                    {marketFeed.length === 0 && (
                                        <tr>
                                            <td colSpan={6} className="px-6 py-12 text-center text-gray-400 dark:text-white/20 text-xs font-bold uppercase tracking-widest">
                                                No recent activity found.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile View (Cards) */}
                        <div className="md:hidden p-4 space-y-4 bg-gray-50/30 dark:bg-black/10">
                            {marketFeed.length === 0 ? (
                                <div className="px-6 py-8 text-center text-gray-400 dark:text-white/20 text-xs font-bold uppercase tracking-widest bg-white dark:bg-zinc-900 rounded-xl border border-gray-100 dark:border-white/5">
                                    No recent activity found.
                                </div>
                            ) : (
                                marketFeed.filter((item: any) => item.type !== 'exchange').map((item: any, index: number) => (
                                    <Link key={item._id} href={`/executive/valuations/${item.type}/${item._id}`} className="block">
                                        <div className={`rounded-xl border border-gray-100 dark:border-white/5 shadow-sm overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-lg dark:hover:border-white/20 active:scale-[0.98] ${index % 2 === 0 ? 'bg-white dark:bg-zinc-900' : 'bg-gray-50 dark:bg-zinc-800/60'}`}>
                                            <div className="p-4 space-y-3">
                                                <div className="flex justify-between items-start">
                                                    <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider border ${getTypeColor(item.type)}`}>
                                                        {item.type}
                                                    </span>
                                                    <p className="text-[11px] text-gray-400 dark:text-white/40 font-medium">
                                                        {mounted ? format(new Date(item.createdAt), "MMM d, yyyy") : ""}
                                                    </p>
                                                </div>

                                                <div className="space-y-1">
                                                    <p className="text-[10px] text-gray-400 dark:text-white/30 font-bold uppercase tracking-wider">Request Details</p>
                                                    <p className="text-sm font-bold text-gray-900 dark:text-white leading-snug line-clamp-2">
                                                        {item.vehicleInfo}
                                                    </p>
                                                </div>

                                                <div className="flex items-center justify-between pt-2 border-t border-gray-50 dark:border-white/5">
                                                    <div className="flex flex-col">
                                                        <p className="text-[13px] font-bold text-gray-900 dark:text-white">{item.customerName || "N/A"}</p>
                                                        <p className="text-[10px] font-mono text-gray-500 dark:text-white/40">{item.customerPhone}</p>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${item.status === 'pending' ? 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400' :
                                                            item.status === 'approved' ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' :
                                                                'bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400'
                                                            }`}>
                                                            {item.status}
                                                        </span>
                                                        <div className="w-7 h-7 rounded-lg bg-gray-50 dark:bg-black/20 flex items-center justify-center text-gray-400 border border-gray-100 dark:border-white/5">
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
                </div>

            </div>
        </motion.div>
    )
}

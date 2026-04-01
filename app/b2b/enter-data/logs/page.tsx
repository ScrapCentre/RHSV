"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
    Database,
    Calendar,
    Car,
    Hash,
    Scale,
    Activity,
    ChevronDown,
    Clock,
    CheckCircle2,
    ShieldCheck,
    XCircle
} from "lucide-react"
import { format } from "date-fns"
import Link from "next/link"

interface VehicleEntry {
    vehicleType: string
    weight: string
    registrationNumber: string
}

interface BulkOutsourcingDoc {
    _id: string
    partnerId: string
    partnerName: string
    partnerEmail: string
    entries: VehicleEntry[]
    status: "pending" | "reviewed" | "approved" | "rejected"
    createdAt: string
    updatedAt: string
}

const getStatusConfig = (status: string) => {
    switch (status) {
        case "reviewed":
            return {
                style: "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800",
                icon: <ShieldCheck className="w-4 h-4 mr-1.5" />,
                label: "Under Process"
            }
        case "approved":
            return {
                style: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800",
                icon: <CheckCircle2 className="w-4 h-4 mr-1.5" />,
                label: "Approved"
            }
        case "rejected":
            return {
                style: "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800",
                icon: <XCircle className="w-4 h-4 mr-1.5" />,
                label: "Rejected"
            }
        default:
            return {
                style: "bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800",
                icon: <Clock className="w-4 h-4 mr-1.5" />,
                label: "Pending"
            }
    }
}

export default function PartnerLogsPage() {
    const [submissions, setSubmissions] = useState<BulkOutsourcingDoc[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [expandedIds, setExpandedIds] = useState<string[]>([])

    const toggleExpanded = (id: string) => {
        setExpandedIds((prev) =>
            prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
        )
    }

    useEffect(() => {
        fetchLogs()
    }, [])

    const fetchLogs = async () => {
        try {
            const res = await fetch("/api/b2b/bulk-outsourcing")
            const data = await res.json()
            if (data.success) {
                setSubmissions(data.data)
            }
        } catch (error) {
            console.error("Failed to fetch logs:", error)
        } finally {
            setIsLoading(false)
        }
    }

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <div className="w-12 h-12 border-4 border-purple-200 dark:border-purple-900/50 border-t-purple-600 dark:border-t-purple-500 rounded-full animate-spin"></div>
                <p className="mt-4 text-gray-500 dark:text-slate-400 font-medium">Loading your logs...</p>
            </div>
        )
    }

    return (
        <div className="max-w-6xl mx-auto space-y-8 pb-12">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <Link href="/b2b/enter-data" className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-semibold flex items-center gap-2 mb-2 transition-colors">
                        ← Back to Data Entry
                    </Link>
                    <h1 className="text-3xl font-black text-gray-900 dark:text-white flex items-center gap-3 tracking-tight">
                        <Activity className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                        Submission Logs
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-2 font-medium">View the status and details of your previous batch submissions.</p>
                </div>
            </div>

            {submissions.length === 0 ? (
                <div className="bg-white dark:bg-[#0E192D] rounded-3xl p-12 text-center border border-gray-100 dark:border-slate-800 shadow-sm">
                    <Database className="w-16 h-16 text-gray-300 dark:text-slate-700 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">No Submissions Yet</h2>
                    <p className="text-gray-500 dark:text-slate-400 mb-6 font-medium">You haven&apos;t submitted any bulk vehicle data yet.</p>
                    <Link
                        href="/b2b/enter-data"
                        className="inline-flex items-center justify-center px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-purple-600/20"
                    >
                        Create Your First Entry
                    </Link>
                </div>
            ) : (
                <div className="space-y-6">
                    {submissions.map((sub, index) => {
                        const isExpanded = expandedIds.includes(sub._id)
                        const statusConfig = getStatusConfig(sub.status)

                        return (
                            <motion.div
                                key={sub._id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                onClick={() => toggleExpanded(sub._id)}
                                className={`bg-white dark:bg-[#0E192D] rounded-[1.5rem] p-5 md:p-6 shadow-sm border border-gray-100 dark:border-slate-800 cursor-pointer transition-all hover:shadow-md ${isExpanded ? "ring-2 ring-purple-600/20" : ""}`}
                            >
                                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                                    <div className="space-y-1.5">
                                        <div className="flex items-center gap-3">
                                            <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                                Batch <span className="text-purple-600 dark:text-purple-400">#{sub._id.slice(-6).toUpperCase()}</span>
                                            </h2>
                                            <span className={`px-2.5 py-0.5 flex items-center text-[10px] font-bold rounded-full border ${statusConfig.style} uppercase tracking-wider`}>
                                                {statusConfig.icon}
                                                {statusConfig.label}
                                            </span>
                                        </div>
                                        <p className="text-gray-500 dark:text-slate-400 flex items-center text-sm font-medium">
                                            <Calendar className="w-3.5 h-3.5 mr-1.5" />
                                            Submitted on {format(new Date(sub.createdAt), "MMMM d, yyyy 'at' h:mm a")}
                                        </p>
                                    </div>
                                    <div className="flex items-center justify-between lg:justify-end gap-4">
                                        <div className="bg-gray-50 dark:bg-slate-900/50 px-4 py-2 rounded-xl border border-gray-100 dark:border-slate-800 text-center shadow-sm">
                                            <p className="text-[10px] font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-0.5">Total Entries</p>
                                            <p className="text-xl font-black text-gray-900 dark:text-white">{sub.entries.length}</p>
                                        </div>
                                        <div className={`p-2 rounded-full bg-gray-50 dark:bg-slate-800 text-gray-400 dark:text-slate-500 transition-transform duration-300 ${isExpanded ? "rotate-180 bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400" : ""}`}>
                                            <ChevronDown className="w-5 h-5" />
                                        </div>
                                    </div>
                                </div>

                                <AnimatePresence>
                                    {isExpanded && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: "auto" }}
                                            exit={{ opacity: 0, height: 0 }}
                                            transition={{ duration: 0.4, type: "spring", bounce: 0.25 }}
                                            className="overflow-hidden"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <div className="pt-6 mt-6 border-t border-gray-100 dark:border-slate-800/60">
                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                    {sub.entries.map((entry, idx) => (
                                                        <div key={idx} className="bg-gray-50/50 dark:bg-slate-800/30 p-4 rounded-2xl border border-gray-200/60 dark:border-slate-700/50 hover:border-purple-200 dark:hover:border-purple-800/50 transition-colors">
                                                            <div className="flex items-center justify-between mb-3 pb-3 border-b border-gray-200/60 dark:border-slate-700/50">
                                                                <h4 className="font-bold text-gray-900 dark:text-white text-sm">Entry #{idx + 1}</h4>
                                                                <div className="bg-white dark:bg-slate-800 p-1.5 rounded-lg text-gray-500 dark:text-slate-400 shadow-sm border border-gray-100 dark:border-slate-700">
                                                                    <Car className="w-3.5 h-3.5" />
                                                                </div>
                                                            </div>
                                                            <div className="space-y-3">
                                                                <div>
                                                                    <p className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-1 shadow-sm">Vehicle Type</p>
                                                                    <p className="text-sm font-bold text-gray-900 dark:text-white">{entry.vehicleType}</p>
                                                                </div>
                                                                <div className="grid grid-cols-2 gap-3">
                                                                    <div>
                                                                        <p className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-1.5 mb-1">
                                                                            <Scale className="w-3 h-3" /> Weight
                                                                        </p>
                                                                        <p className="text-sm font-bold text-gray-900 dark:text-white">{entry.weight}</p>
                                                                    </div>
                                                                    <div>
                                                                        <p className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-1.5 mb-1">
                                                                            <Hash className="w-3 h-3" /> Reg. Number
                                                                        </p>
                                                                        <p className="font-mono text-xs font-bold text-gray-900 dark:text-white uppercase px-2 py-0.5 bg-white dark:bg-slate-800 inline-block rounded-md border border-gray-100 dark:border-slate-700 shadow-sm">{entry.registrationNumber}</p>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>

                                                <div className="flex justify-center mt-6">
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            toggleExpanded(sub._id);
                                                        }}
                                                        className="px-6 py-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-300 rounded-full text-sm font-bold transition-colors flex items-center gap-2"
                                                    >
                                                        Close Details
                                                    </button>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        )
                    })}
                </div>
            )}
        </div>
    )
}

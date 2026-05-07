"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
    Truck,
    MapPin,
    Car,
    Calendar,
    User,
    Phone,
    AlertCircle,
    RefreshCcw,
    X,
    CheckCircle,
    Clock,
    Package,
    Hash,
    Eye
} from "lucide-react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"

const statusConfig: Record<string, { label: string; color: string; bg: string; border: string }> = {
    accepted: {
        label: "Accepted",
        color: "text-blue-600 dark:text-blue-400",
        bg: "bg-blue-500/10",
        border: "border-blue-500/20"
    },
    scheduled: {
        label: "Scheduled",
        color: "text-yellow-600 dark:text-yellow-400",
        bg: "bg-yellow-500/10",
        border: "border-yellow-500/20"
    },
    completed: {
        label: "Completed",
        color: "text-emerald-600 dark:text-emerald-400",
        bg: "bg-emerald-500/10",
        border: "border-emerald-500/20"
    },
    picked_up: {
        label: "Picked Up",
        color: "text-purple-600 dark:text-purple-400",
        bg: "bg-purple-500/10",
        border: "border-purple-500/20"
    },
    cancelled: {
        label: "Cancelled",
        color: "text-red-600 dark:text-red-400",
        bg: "bg-red-500/10",
        border: "border-red-500/20"
    }
}

export default function B2BPickupsPage() {
    const { data: session, status } = useSession()
    const [pickups, setPickups] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [selectedPickup, setSelectedPickup] = useState<any | null>(null)
    const { toast } = useToast()
    const router = useRouter()

    useEffect(() => {
        if (status === "authenticated" && (session?.user as any)?.role === "partner") {
            fetchPickups()
        }
    }, [status, session])

    const fetchPickups = async () => {
        setIsLoading(true)
        setError(null)
        try {
            const res = await fetch("/api/b2b/pickups")
            const data = await res.json()
            if (!res.ok) throw new Error(data.message || "Failed to fetch pickups")
            setPickups(data.data || [])
        } catch (err: any) {
            setError(err.message)
            toast({ title: "Error", description: err.message, variant: "destructive" })
        } finally {
            setIsLoading(false)
        }
    }

    const handleStatusUpdate = async (pickupId: string, newStatus: string) => {
        try {
            const res = await fetch(`/api/b2b/pickups/${pickupId}/status`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: newStatus }),
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.message || "Failed to update status")
            
            toast({ title: "Success", description: "Pickup status updated successfully" })
            fetchPickups() // refresh list
            
            if (selectedPickup && selectedPickup._id === pickupId) {
                setSelectedPickup({ ...selectedPickup, status: newStatus })
            }
        } catch (err: any) {
            toast({ title: "Error", description: err.message, variant: "destructive" })
        }
    }

    if (status === "loading") {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-600" />
            </div>
        )
    }

    if (status === "unauthenticated" || (session?.user as any)?.role !== "partner") {
        return (
            <div className="min-h-screen flex items-center justify-center px-4">
                <div className="max-w-md w-full text-center space-y-6 bg-white dark:bg-[#0E192D] p-8 rounded-2xl shadow-xl border border-gray-100 dark:border-slate-800">
                    <AlertCircle className="w-10 h-10 text-red-500 mx-auto" />
                    <h1 className="text-2xl font-black text-gray-900 dark:text-white">Access Denied</h1>
                    <button onClick={() => router.push("/b2b")} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 rounded-xl transition-all">
                        Go to Partner Login
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-slate-950 pt-8 pb-12 px-4 sm:px-6 lg:px-8 font-sans transition-colors duration-300">
            <div className="max-w-7xl mx-auto space-y-8">

                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                            <Truck className="w-7 h-7 text-emerald-600" />
                            My Pickups
                        </h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            Leads you've accepted from the market feed.
                        </p>
                    </div>
                    <button
                        onClick={fetchPickups}
                        className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-[#0E192D] border border-gray-200 dark:border-slate-800 rounded-xl text-sm font-bold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors shadow-sm"
                    >
                        <RefreshCcw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
                        Refresh
                    </button>
                </div>

                {/* Stats strip */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    {(["accepted", "scheduled", "picked_up", "completed", "cancelled"] as const).map((s) => {
                        const count = pickups.filter(p => p.status === s).length
                        const cfg = statusConfig[s]
                        return (
                            <div key={s} className={`${cfg.bg} border ${cfg.border} rounded-2xl p-4 flex items-center gap-4`}>
                                <div className={`text-2xl font-black ${cfg.color}`}>{count}</div>
                                <div className={`text-xs font-bold uppercase tracking-widest ${cfg.color}`}>{cfg.label}</div>
                            </div>
                        )
                    })}
                </div>

                {/* Error */}
                {error && (
                    <div className="bg-red-50 border border-red-100 rounded-2xl p-6 flex flex-col items-center text-center gap-4">
                        <AlertCircle className="w-12 h-12 text-red-500" />
                        <div>
                            <h3 className="text-lg font-bold text-red-900">Failed to load pickups</h3>
                            <p className="text-red-700">{error}</p>
                        </div>
                        <button onClick={fetchPickups} className="bg-red-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-red-700">
                            Try Again
                        </button>
                    </div>
                )}

                {/* Loading skeletons */}
                {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="bg-white dark:bg-[#0E192D] rounded-2xl p-6 h-56 animate-pulse border border-gray-100 dark:border-slate-800">
                                <div className="h-10 w-10 bg-gray-100 dark:bg-slate-800 rounded-xl mb-4" />
                                <div className="h-5 bg-gray-100 dark:bg-slate-800 rounded-full w-2/3 mb-3" />
                                <div className="h-4 bg-gray-50 dark:bg-slate-800/50 rounded-full w-full mb-2" />
                                <div className="h-4 bg-gray-50 dark:bg-slate-800/50 rounded-full w-4/5" />
                            </div>
                        ))}
                    </div>
                ) : pickups.length === 0 ? (
                    <div className="bg-white dark:bg-[#0E192D] rounded-3xl p-16 text-center border-2 border-dashed border-gray-200 dark:border-slate-800">
                        <div className="w-20 h-20 bg-gray-50 dark:bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Truck className="w-10 h-10 text-gray-300 dark:text-slate-600" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">No pickups yet</h3>
                        <p className="text-gray-500 dark:text-gray-400 max-w-sm mx-auto mb-6">
                            Head to the Market Feed and accept leads to see them here.
                        </p>
                        <button
                            onClick={() => router.push("/b2b/marketplace")}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-3 rounded-xl transition-all shadow-lg shadow-emerald-500/10"
                        >
                            Browse Market Feed
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {pickups.map((pickup) => {
                            const cfg = statusConfig[pickup.status] || statusConfig.accepted
                            return (
                                <motion.div
                                    layout
                                    key={pickup._id}
                                    className="group bg-white dark:bg-[#0E192D] rounded-2xl p-6 border border-gray-100 dark:border-slate-800 hover:border-emerald-200 dark:hover:border-emerald-900/50 hover:shadow-xl hover:shadow-emerald-500/5 transition-all"
                                >
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-xl group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                                            <Truck className="w-6 h-6" />
                                        </div>
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${cfg.bg} ${cfg.color} border ${cfg.border}`}>
                                            {cfg.label}
                                        </span>
                                    </div>

                                    {/* Lead type badge */}
                                    <div className="mb-3">
                                        <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wide bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800/30">
                                            {pickup.leadType === 'valuation' ? '📋 Quote'
                                                : pickup.leadType === 'sell' ? '🏷️ Sell'
                                                    : pickup.leadType === 'exchange' ? '🔄 Exchange'
                                                        : '🛒 Buy'}
                                        </span>
                                    </div>

                                    <h3 className="font-bold text-gray-900 dark:text-white text-lg mb-1 truncate">
                                        {pickup.vehicleInfo}
                                    </h3>

                                    <div className="space-y-2 border-t border-gray-50 dark:border-slate-800 pt-4 mt-3 mb-4">
                                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                                            <User className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                                            <span className="font-medium truncate">{pickup.customerName}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                                            <Phone className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                                            <span className="font-medium">{pickup.customerPhone}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                                            <MapPin className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                                            <span className="font-medium truncate">{pickup.city}, {pickup.state}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-gray-400 italic">
                                            <Calendar className="w-4 h-4" />
                                            Accepted {new Date(pickup.createdAt).toLocaleDateString()}
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => setSelectedPickup(pickup)}
                                        className="w-full bg-gray-900 dark:bg-white/10 hover:bg-black dark:hover:bg-white/20 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 text-sm"
                                    >
                                        <Eye className="w-4 h-4" />
                                        View Details
                                    </button>
                                </motion.div>
                            )
                        })}
                    </div>
                )}

                {/* Detail Modal */}
                <AnimatePresence>
                    {selectedPickup && (
                        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedPickup(null)}>
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                                onClick={(e) => e.stopPropagation()}
                                className="bg-white dark:bg-[#0E192D] rounded-2xl md:rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden relative flex flex-col"
                            >
                                {/* Close */}
                                <button onClick={() => setSelectedPickup(null)} className="absolute top-4 right-4 p-2.5 bg-red-500 hover:bg-red-600 rounded-full transition-all z-30 shadow-2xl">
                                    <X className="w-5 h-5 text-white" />
                                </button>

                                {/* Header */}
                                <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 p-6 md:p-8 text-white flex-shrink-0">
                                    <div className="flex items-center gap-2 mb-3 pr-12 flex-wrap">
                                        <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wide border border-white/30 ${statusConfig[selectedPickup.status]?.bg || ''}`}>
                                            {statusConfig[selectedPickup.status]?.label || selectedPickup.status}
                                        </span>
                                    </div>
                                    <h2 className="text-2xl md:text-3xl font-black leading-tight pr-12">
                                        {selectedPickup.vehicleInfo}
                                    </h2>
                                    <p className="text-emerald-100 mt-1 text-sm">
                                        {selectedPickup.leadType?.toUpperCase()} Lead
                                    </p>
                                </div>

                                {/* Content */}
                                <div className="p-4 md:p-8 space-y-5 overflow-y-auto max-h-[55vh]">
                                    {/* Customer Info */}
                                    <div>
                                        <h3 className="text-xs font-black text-gray-400 dark:text-slate-500 uppercase tracking-wider mb-4">Customer</h3>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div className="flex items-start gap-3 bg-gray-50 dark:bg-slate-900/50 p-4 rounded-xl">
                                                <User className="w-5 h-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                                                <div>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">Name</p>
                                                    <p className="font-bold text-gray-900 dark:text-white">{selectedPickup.customerName}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-start gap-3 bg-gray-50 dark:bg-slate-900/50 p-4 rounded-xl">
                                                <Phone className="w-5 h-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                                                <div>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">Phone</p>
                                                    <p className="font-bold text-gray-900 dark:text-white">{selectedPickup.customerPhone}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Location */}
                                    <div>
                                        <h3 className="text-xs font-black text-gray-400 dark:text-slate-500 uppercase tracking-wider mb-4">Location</h3>
                                        <div className="flex items-start gap-3 bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-xl">
                                            <MapPin className="w-5 h-5 text-emerald-600 dark:text-emerald-400 mt-0.5 flex-shrink-0" />
                                            <div>
                                                <p className="font-bold text-gray-900 dark:text-white">{selectedPickup.city}, {selectedPickup.state}</p>
                                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Pincode: {selectedPickup.pincode}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Timestamps */}
                                    <div className="pt-4 border-t border-gray-100 dark:border-slate-800 text-center">
                                        <p className="text-xs text-gray-400 italic flex items-center justify-center gap-2">
                                            <Calendar className="w-3 h-3" />
                                            Accepted on {new Date(selectedPickup.createdAt).toLocaleString()}
                                        </p>
                                    </div>
                                </div>

                                {/* Footer */}
                                <div className="p-4 md:p-6 border-t border-gray-100 dark:border-slate-800 space-y-3">
                                    {(selectedPickup.status === 'accepted' || selectedPickup.status === 'scheduled') && (
                                        <button 
                                            onClick={() => handleStatusUpdate(selectedPickup._id, 'picked_up')} 
                                            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
                                        >
                                            <CheckCircle className="w-5 h-5" />
                                            Vehicle Successfully Picked Up
                                        </button>
                                    )}
                                    <button onClick={() => setSelectedPickup(null)} className="w-full bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-gray-900 dark:text-white font-bold py-3 rounded-xl transition-all">
                                        Close
                                    </button>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    )
}

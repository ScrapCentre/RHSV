"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { motion } from "framer-motion"
import {
    Activity,
    Truck,
    CheckCircle,
    TrendingUp,
    ArrowRight,
    MapPin,
    AlertCircle,
    Clock,
    Database,
    Package
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function B2BDashboard() {
    const { data: session, status } = useSession()
    const router = useRouter()

    const [pickups, setPickups] = useState<any[]>([])
    const [marketLeads, setMarketLeads] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        if (status === "unauthenticated" || (session?.user as any)?.role !== "partner") {
            router.push("/b2b")
            return
        }

        const fetchDashboardData = async () => {
            try {
                // Fetch Pickups
                const pickupsRes = await fetch("/api/b2b/pickups")
                const pickupsData = await pickupsRes.json()

                // Fetch Market Leads
                const marketRes = await fetch("/api/valuations/marketplace")
                const marketData = await marketRes.json()

                if (pickupsData.success) {
                    setPickups(pickupsData.data)
                }

                if (marketData.success) {
                    setMarketLeads(marketData.data)
                }
            } catch (error) {
                console.error("Error fetching dashboard data:", error)
            } finally {
                setIsLoading(false)
            }
        }

        if (status === "authenticated") {
            fetchDashboardData()
        }
    }, [status, session, router])

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        )
    }

    const activePickups = pickups.filter(p => !["scrapped", "car_scrapped", "cancelled", "completed"].includes(p.status?.toLowerCase() || ""))
    const completedPickups = pickups.filter(p => ["scrapped", "car_scrapped", "completed"].includes(p.status?.toLowerCase() || ""))
    const recentPickups = pickups.slice(0, 4)

    return (
        <div className="max-w-7xl mx-auto space-y-8 font-sans">
            {/* Header */}
            <div>
                <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white flex items-center gap-3">
                    Partner Overview
                </h1>
                <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">
                    Welcome back, {session?.user?.name || 'Partner'}. Here&apos;s what&apos;s happening today.
                </p>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white dark:bg-[#0E192D] p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm"
                >
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1">Active Pickups</p>
                            <h3 className="text-3xl font-black text-slate-900 dark:text-white">{activePickups.length}</h3>
                        </div>
                        <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center">
                            <Truck className="w-5 h-5 text-blue-500" />
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white dark:bg-[#0E192D] p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm"
                >
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1">Available Leads</p>
                            <h3 className="text-3xl font-black text-slate-900 dark:text-white">{marketLeads.length}</h3>
                        </div>
                        <div className="w-10 h-10 bg-purple-500/10 rounded-xl flex items-center justify-center">
                            <Activity className="w-5 h-5 text-purple-500" />
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-white dark:bg-[#0E192D] p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm"
                >
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1">Completed</p>
                            <h3 className="text-3xl font-black text-slate-900 dark:text-white">{completedPickups.length}</h3>
                        </div>
                        <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center">
                            <CheckCircle className="w-5 h-5 text-emerald-500" />
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="bg-white dark:bg-[#0E192D] p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm"
                >
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1">Total Lifetime</p>
                            <h3 className="text-3xl font-black text-slate-900 dark:text-white">{pickups.length}</h3>
                        </div>
                        <div className="w-10 h-10 bg-orange-500/10 rounded-xl flex items-center justify-center">
                            <TrendingUp className="w-5 h-5 text-orange-500" />
                        </div>
                    </div>
                </motion.div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
                {/* Recent Pickups */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="lg:col-span-2 space-y-4"
                >
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <Truck className="w-5 h-5 text-blue-500" />
                            Recent Pickups
                        </h2>
                        <Link href="/b2b/pickups" className="text-sm font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1">
                            View All <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>

                    <div className="bg-white dark:bg-[#0E192D] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                        {recentPickups.length === 0 ? (
                            <div className="p-8 text-center">
                                <Package className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                                <p className="text-slate-500 dark:text-slate-400 font-medium">No recent pickups found.</p>
                                <Link href="/b2b/marketplace" className="inline-block mt-4 bg-blue-600 text-white font-bold px-6 py-2 rounded-xl transition-all hover:bg-blue-700">
                                    Browse Marketplace
                                </Link>
                            </div>
                        ) : (
                            <div className="divide-y divide-slate-100 dark:divide-slate-800">
                                {recentPickups.map((pickup) => (
                                    <div key={pickup._id} className="p-4 sm:p-5 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                        <div className="flex items-start gap-4">
                                            <div className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${pickup.status === 'accepted' ? 'bg-blue-500' :
                                                    ['scrapped', 'car_scrapped', 'completed'].includes(pickup.status) ? 'bg-emerald-500' :
                                                        'bg-orange-500'
                                                }`} />
                                            <div>
                                                <h3 className="font-bold text-slate-900 dark:text-white text-base">
                                                    {pickup.vehicleInfo || 'Vehicle Pickup'}
                                                </h3>
                                                <div className="flex items-center gap-3 mt-1 text-sm text-slate-500 dark:text-slate-400">
                                                    <span className="flex items-center gap-1">
                                                        <MapPin className="w-3.5 h-3.5" />
                                                        {pickup.city}, {pickup.state}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <Clock className="w-3.5 h-3.5" />
                                                        {new Date(pickup.createdAt).toLocaleDateString()}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div>
                                            <span className={`inline-flex px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${pickup.status === 'accepted' ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400' :
                                                    ['scrapped', 'car_scrapped', 'completed'].includes(pickup.status) ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' :
                                                        'bg-orange-500/10 text-orange-600 dark:text-orange-400'
                                                }`}>
                                                {pickup.status === 'car_scrapped' ? 'Vehicle Scrapped' : (pickup.status || 'Pending')}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </motion.div>

                {/* Quick Actions & Live Market */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="space-y-6"
                >
                    <div className="space-y-4">
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <Activity className="w-5 h-5 text-blue-500" />
                            Live Market Feed
                        </h2>
                        
                        <div className="bg-white dark:bg-[#0E192D] p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-bl-full -mr-10 -mt-10 transition-transform group-hover:scale-110" />
                            
                            <div className="relative z-10">
                                <p className="text-3xl font-black text-slate-900 dark:text-white mb-1">
                                    {marketLeads.length}
                                </p>
                                <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-6">
                                    Vehicles available for pickup in the marketplace today.
                                </p>
                                
                                <Link 
                                    href="/b2b/marketplace"
                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-all shadow-md shadow-blue-600/20 active:scale-[0.98] flex items-center justify-center gap-2"
                                >
                                    Browse Leads <ArrowRight className="w-4 h-4" />
                                </Link>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <Database className="w-5 h-5 text-purple-500" />
                            Quick Actions
                        </h2>
                        <div className="flex flex-col gap-3">
                            <Link href="/b2b/pickups" className="flex items-center gap-4 p-4 bg-white dark:bg-[#0E192D] rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-emerald-500 dark:hover:border-emerald-500 transition-colors shadow-sm group">
                                <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                                    <CheckCircle className="w-5 h-5 text-emerald-500" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-900 dark:text-white text-sm">Manage Pickups</h3>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Update pickup status</p>
                                </div>
                            </Link>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    )
}

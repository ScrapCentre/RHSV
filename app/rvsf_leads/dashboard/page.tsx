"use client"

import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { LogOut, ShieldCheck, Factory, Filter, Activity, MapPin, Download, Lock } from "lucide-react"

const tableRowVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: (i: number) => ({
        opacity: 1,
        y: 0,
        transition: { delay: i * 0.05, duration: 0.3 }
    })
}

export default function RVSFDashboard() {
    const { data: session, status } = useSession()
    const router = useRouter()
    
    const [leads, setLeads] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)

    const [filterState, setFilterState] = useState<string>("all")
    const [filterCity, setFilterCity] = useState<string>("all")

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/rvsf")
        } else if (status === "authenticated" && (session?.user as any)?.role !== "rvsf") {
            router.push("/")
        } else if (status === "authenticated") {
            fetchLeads()
        }
    }, [status, session, router])

    const fetchLeads = async () => {
        try {
            const res = await fetch("/api/rvsf/leads")
            if (res.ok) {
                const data = await res.json()
                setLeads(data)
            }
        } catch (error) {
            console.error(error)
        } finally {
            setIsLoading(false)
        }
    }

    if (status === "loading" || status === "unauthenticated") {
        return (
            <div className="min-h-screen bg-[#020617] flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-[#E31E24]/20 border-t-[#E31E24] rounded-full animate-spin"></div>
            </div>
        )
    }

    // Extract unique states and cities
    const uniqueStates = Array.from(new Set(leads.map(item => {
        const parts = item.location?.split(', ') || []
        return parts.length > 1 ? parts[1] : 'N/A'
    }))).filter(s => s !== 'N/A').sort()

    const uniqueCities = Array.from(new Set(leads.filter(item => {
        if (filterState === "all") return true
        const parts = item.location?.split(', ') || []
        return (parts.length > 1 ? parts[1] : 'N/A') === filterState
    }).map(item => {
        const parts = item.location?.split(', ') || []
        return parts[0] || 'N/A'
    }))).filter(c => c !== 'N/A').sort()

    const filteredData = leads.filter((item) => {
        const locParts = item.location?.split(', ') || []
        const itemCity = locParts[0] || 'N/A'
        const itemState = locParts.length > 1 ? locParts[1] : 'N/A'

        const matchesState = filterState === "all" || itemState === filterState
        const matchesCity = filterCity === "all" || itemCity === filterCity

        return matchesState && matchesCity
    })

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'quote': return 'bg-blue-500/20 text-blue-400 border border-blue-500/20'
            case 'sell': return 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/20'
            case 'exchange': return 'bg-purple-500/20 text-purple-400 border border-purple-500/20'
            case 'buy': return 'bg-orange-500/20 text-orange-400 border border-orange-500/20'
            default: return 'bg-gray-800 text-gray-300 border border-gray-700'
        }
    }

    const getTypeLabel = (type: string) => {
        switch (type) {
            case 'quote': return 'Scrap Quote'
            case 'sell': return 'Sell Vehicle'
            case 'exchange': return 'Exchange'
            case 'buy': return 'Buy Vehicle'
            default: return type
        }
    }

    const generateCSV = (data: any[]) => {
        const headers = ["Type", "Customer Name", "Phone Number", "Vehicle Info", "Location", "Request Date"];
        const rows = data.map(item => {
            const reqDate = new Date(item.createdAt).toLocaleString('en-IN');
            return [
                `"${getTypeLabel(item.type)}"`,
                `"${(item.customerName || 'N/A').replace(/"/g, '""')}"`,
                `"${(item.customerPhone || 'N/A').replace(/"/g, '""')}"`,
                `"${(item.vehicleInfo || "").replace(/"/g, '""')}"`,
                `"${(item.location || "").replace(/"/g, '""')}"`,
                `"${reqDate}"`
            ].join(",");
        });
        return [headers.join(","), ...rows].join("\n");
    };

    const handleDownloadExcel = () => {
        if (filteredData.length === 0) return;
        const csvString = generateCSV(filteredData);
        const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `market_feed_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="min-h-screen bg-[#020617] text-white flex flex-col font-sans selection:bg-[#E31E24] selection:text-white">
            {/* Header */}
            <header className="relative z-10 border-b border-white/5 bg-white/5 backdrop-blur-xl sticky top-0">
                <div className="max-w-7xl mx-auto px-4 md:px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="bg-[#E31E24]/10 p-2.5 rounded-xl border border-[#E31E24]/20 hidden md:block">
                            <Factory className="w-6 h-6 text-[#E31E24]" />
                        </div>
                        <div>
                            <h1 className="text-lg md:text-xl font-black tracking-tight leading-none">RVSF Market Feed</h1>
                            <p className="text-[10px] md:text-xs text-slate-400 font-bold tracking-widest uppercase mt-1">Authorized Access</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 md:gap-6">
                        <div className="hidden sm:flex flex-col items-end">
                            <div className="flex items-center gap-1.5">
                                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                                <span className="text-sm font-bold text-slate-200">{session?.user?.name}</span>
                            </div>
                            <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-0.5">{session?.user?.email}</span>
                        </div>
                        
                        <div className="w-px h-8 bg-white/10 hidden sm:block"></div>

                        <button
                            onClick={() => signOut({ callbackUrl: "/rvsf_leads" })}
                            className="flex items-center gap-2 px-3 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition-all font-semibold text-sm group"
                        >
                            <LogOut className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                            <span className="hidden sm:inline">Sign Out</span>
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 w-full max-w-7xl mx-auto p-4 md:p-6 space-y-6">
                
                {/* Stats & Filters Panel */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-4 md:p-6 shadow-xl backdrop-blur-md">
                    <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-6">
                        <div>
                            <h2 className="text-2xl font-black flex items-center gap-3">
                                Live Feed
                                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/20">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1.5 animate-pulse"></div>
                                    {filteredData.length} Active Leads
                                </span>
                            </h2>
                            <p className="text-sm text-slate-400 mt-1">These leads are securely masked until unlocked.</p>
                        </div>
                        <button
                            onClick={handleDownloadExcel}
                            disabled={filteredData.length === 0}
                            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#E31E24] text-white hover:bg-red-700 rounded-xl text-sm font-bold transition-all shadow-lg shadow-red-500/20 disabled:opacity-50"
                        >
                            <Download className="w-4 h-4" />
                            Download CSV
                        </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="relative">
                            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                            <select
                                value={filterState}
                                onChange={(e) => {
                                    setFilterState(e.target.value)
                                    setFilterCity("all")
                                }}
                                className="w-full bg-black/40 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm font-medium text-slate-200 focus:outline-none focus:ring-2 focus:ring-[#E31E24]/50 focus:border-[#E31E24]/50 appearance-none cursor-pointer"
                            >
                                <option value="all">All States</option>
                                {uniqueStates.map(state => (
                                    <option key={state} value={state}>{state}</option>
                                ))}
                            </select>
                        </div>

                        <div className="relative">
                            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                            <select
                                value={filterCity}
                                onChange={(e) => setFilterCity(e.target.value)}
                                disabled={filterState === "all"}
                                className="w-full bg-black/40 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm font-medium text-slate-200 focus:outline-none focus:ring-2 focus:ring-[#E31E24]/50 focus:border-[#E31E24]/50 appearance-none cursor-pointer disabled:opacity-50"
                            >
                                <option value="all">All Cities</option>
                                {uniqueCities.map(city => (
                                    <option key={city} value={city}>{city}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Loading State */}
                {isLoading && (
                    <div className="flex flex-col items-center justify-center py-20 text-slate-500">
                        <div className="w-8 h-8 border-2 border-[#E31E24]/20 border-t-[#E31E24] rounded-full animate-spin mb-4"></div>
                        <p className="font-medium">Syncing market feed...</p>
                    </div>
                )}

                {/* Empty State */}
                {!isLoading && filteredData.length === 0 && (
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-16 text-center text-slate-400">
                        <Activity className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                        <p className="text-lg font-bold text-slate-200 mb-1">No Leads Found</p>
                        <p className="text-sm">Try adjusting your state or city filters.</p>
                    </div>
                )}

                {/* Feed Table */}
                {!isLoading && filteredData.length > 0 && (
                    <div className="bg-white/5 border border-white/10 rounded-2xl shadow-xl overflow-hidden backdrop-blur-md">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-white/10 bg-black/20 text-[11px] uppercase tracking-wider text-slate-400 font-black">
                                        <th className="p-5 pl-6">Req Details</th>
                                        <th className="p-5">Customer (Masked)</th>
                                        <th className="p-5">Location</th>
                                        <th className="p-5">Request Date</th>
                                        <th className="p-5 text-right pr-6">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    <AnimatePresence>
                                        {filteredData.map((item, index) => (
                                            <motion.tr
                                                key={item._id}
                                                custom={index}
                                                variants={tableRowVariants}
                                                initial="hidden"
                                                animate="visible"
                                                exit={{ opacity: 0 }}
                                                className="hover:bg-white/[0.02] transition-colors group"
                                            >
                                                <td className="p-5 pl-6 align-top">
                                                    <div className="flex flex-col gap-2">
                                                        <span className={`self-start inline-flex items-center px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest ${getTypeColor(item.type)}`}>
                                                            {getTypeLabel(item.type)}
                                                        </span>
                                                        <p className="text-sm font-bold text-slate-200">
                                                            {item.vehicleInfo || "Details unavailable"}
                                                        </p>
                                                    </div>
                                                </td>

                                                <td className="p-5 align-top">
                                                    <div className="flex flex-col gap-1">
                                                        <p className="text-sm font-bold text-slate-300 flex items-center gap-1.5">
                                                            <Lock className="w-3 h-3 text-slate-500" />
                                                            {item.customerName}
                                                        </p>
                                                        <p className="text-xs font-mono text-slate-500">
                                                            {item.customerPhone}
                                                        </p>
                                                    </div>
                                                </td>

                                                <td className="p-5 align-top">
                                                    <div className="flex items-center text-sm font-semibold text-slate-400">
                                                        <MapPin className="w-3.5 h-3.5 mr-1.5 text-slate-500 shrink-0" />
                                                        {item.location}
                                                    </div>
                                                </td>

                                                <td className="p-5 align-top">
                                                    <p className="text-sm text-slate-300 font-semibold">
                                                        {new Date(item.createdAt).toLocaleDateString('en-IN', {
                                                            day: 'numeric',
                                                            month: 'short',
                                                            year: 'numeric'
                                                        })}
                                                    </p>
                                                    <p className="text-[11px] text-slate-500 mt-1 font-medium tracking-wider uppercase">
                                                        {new Date(item.createdAt).toLocaleTimeString('en-IN', {
                                                            hour: '2-digit',
                                                            minute: '2-digit'
                                                        })}
                                                    </p>
                                                </td>

                                                <td className="p-5 pr-6 align-top text-right">
                                                    <button className="inline-flex items-center justify-center px-3 py-1.5 rounded-lg bg-[#E31E24]/10 text-[#E31E24] border border-[#E31E24]/20 hover:bg-[#E31E24] hover:text-white transition-all text-xs font-bold uppercase tracking-wider">
                                                        Unlock
                                                    </button>
                                                </td>
                                            </motion.tr>
                                        ))}
                                    </AnimatePresence>
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </main>
        </div>
    )
}

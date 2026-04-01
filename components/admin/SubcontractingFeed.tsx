"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Filter, ArrowRight, Activity, MapPin, Download, Mail } from "lucide-react"
import Link from "next/link"

interface SubcontractingFeedProps {
    initialData: any[]
}

const tableRowVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: (i: number) => ({
        opacity: 1,
        y: 0,
        transition: { delay: i * 0.05, duration: 0.3 }
    })
}

export default function SubcontractingFeed({ initialData }: SubcontractingFeedProps) {
    const [filterType, setFilterType] = useState<string>("all")
    const [filterState, setFilterState] = useState<string>("all")
    const [filterCity, setFilterCity] = useState<string>("all")

    // Extract unique states and cities for the dropdowns
    const uniqueStates = Array.from(new Set(initialData.map(item => {
        const parts = item.location?.split(', ') || []
        return parts.length > 1 ? parts[1] : 'N/A'
    }))).filter(s => s !== 'N/A').sort()

    const uniqueCities = Array.from(new Set(initialData.filter(item => {
        if (filterState === "all") return true
        const parts = item.location?.split(', ') || []
        return (parts.length > 1 ? parts[1] : 'N/A') === filterState
    }).map(item => {
        const parts = item.location?.split(', ') || []
        return parts[0] || 'N/A'
    }))).filter(c => c !== 'N/A').sort()

    const filteredData = initialData.filter((item) => {
        const matchesType = filterType === "all" || item.type === filterType

        const locParts = item.location?.split(', ') || []
        const itemCity = locParts[0] || 'N/A'
        const itemState = locParts.length > 1 ? locParts[1] : 'N/A'

        const matchesState = filterState === "all" || itemState === filterState
        const matchesCity = filterCity === "all" || itemCity === filterCity

        return matchesType && matchesState && matchesCity
    })

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'quote': return 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400'
            case 'sell': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400'
            case 'exchange': return 'bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400'
            case 'buy': return 'bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-400'
            default: return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
        }
    }

    const getTypeLabel = (type: string) => {
        switch (type) {
            case 'quote': return 'Scrap / Get Quote'
            case 'sell': return 'Sell Old Vehicle'
            case 'exchange': return 'Exchange Vehicle'
            case 'buy': return 'Buy New Vehicle'
            default: return type
        }
    }

    const getLinkHref = (type: string, id: string) => {
        switch (type) {
            case 'quote': return `/admin/valuations/quote/${id}`
            case 'sell': return `/admin/valuations/sell/${id}`
            case 'exchange': return `/admin/valuations/exchange/${id}`
            case 'buy': return `/admin/valuations/buy/${id}`
            default: return '#'
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
        link.setAttribute("download", `subcontracting_export_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleExportCSV = () => {
        if (filteredData.length === 0) return;

        // Trigger the download automatically first so they have the file
        handleDownloadExcel();

        // Open Gmail explicitly in a new tab instead of generic mailto handler
        const subject = encodeURIComponent("Subcontracting Requests Export");
        const bodyText = `Please find the latest filtered subcontracting requests attached to this email.\n\nNote: The file "subcontracting_export_${new Date().toISOString().split('T')[0]}.csv" has been automatically downloaded to your computer. Please attach it manually to this email as browser security restricts automatic attachments.`;
        const body = encodeURIComponent(bodyText);

        // Gmail web compose URL pattern
        const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&su=${subject}&body=${body}`;
        window.open(gmailUrl, '_blank');
    };

    return (
        <div className="bg-white dark:bg-[#0E192D] rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 overflow-hidden">
            {/* Header / Filters */}
            <div className="p-4 sm:p-6 border-b border-gray-100 dark:border-slate-800 flex flex-col gap-4 bg-gray-50/50 dark:bg-[#0E192D]">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:flex lg:items-center gap-3">
                    <div className="flex items-center gap-2 lg:min-w-[140px]">
                        <Filter className="w-4 h-4 text-gray-400 shrink-0" />
                        <select
                            value={filterType}
                            onChange={(e) => setFilterType(e.target.value)}
                            className="w-full bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl px-3 py-2 text-[13px] sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-gray-700 dark:text-gray-300 transition-all cursor-pointer"
                        >
                            <option value="all">All Types</option>
                            <option value="quote">Scrap Quotes</option>
                            <option value="sell">Sell Requests</option>
                            <option value="exchange">Exchange Requests</option>
                            <option value="buy">Buy Requests</option>
                        </select>
                    </div>

                    <div className="flex items-center gap-2">
                        <select
                            value={filterState}
                            onChange={(e) => {
                                setFilterState(e.target.value)
                                setFilterCity("all")
                            }}
                            className="w-full bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl px-3 py-2 text-[13px] sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-gray-700 dark:text-gray-300 transition-all cursor-pointer"
                        >
                            <option value="all">All States</option>
                            {uniqueStates.map(state => (
                                <option key={state} value={state}>{state}</option>
                            ))}
                        </select>
                    </div>

                    <div className="flex items-center gap-2 text-[13px] sm:text-sm">
                        <select
                            value={filterCity}
                            onChange={(e) => setFilterCity(e.target.value)}
                            disabled={filterState === "all"}
                            className="w-full bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl px-3 py-2 text-[13px] sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-gray-700 dark:text-gray-300 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <option value="all">All Cities</option>
                            {uniqueCities.map(city => (
                                <option key={city} value={city}>{city}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-3 w-full border-t border-gray-100 dark:border-slate-800 pt-4 mt-1 lg:border-t-0 lg:pt-0 lg:mt-0 lg:w-auto lg:ml-auto">
                    <button
                        onClick={handleDownloadExcel}
                        disabled={filteredData.length === 0}
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 text-white hover:bg-emerald-700 dark:hover:bg-emerald-500 rounded-xl text-[13px] sm:text-sm font-semibold transition-all shadow-sm active:scale-[0.98] disabled:opacity-50"
                    >
                        <Download className="w-4 h-4" />
                        Download
                    </button>

                    <button
                        onClick={handleExportCSV}
                        disabled={filteredData.length === 0}
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-amber-500 text-white hover:bg-amber-600 rounded-xl text-[13px] sm:text-sm font-semibold transition-all shadow-sm active:scale-[0.98] disabled:opacity-50"
                    >
                        <Mail className="w-4 h-4" />
                        Export
                    </button>
                </div>
            </div>

            {/* Empty State */}
            {filteredData.length === 0 && (
                <div className="p-12 text-center text-gray-500 dark:text-gray-400 flex flex-col items-center">
                    <Activity className="w-12 h-12 text-gray-300 dark:text-slate-600 mb-4" />
                    <p className="text-lg font-medium text-gray-900 dark:text-white mb-1">No Requests Found</p>
                    <p className="text-sm">Try adjusting your filters.</p>
                </div>
            )}

            {/* Content Section */}
            {filteredData.length > 0 && (
                <>
                    {/* Mobile View (Cards) */}
                    <div className="md:hidden p-4 space-y-4 bg-gray-50/30 dark:bg-slate-900/20">
                        {filteredData.map((item, index) => (
                            <Link key={item._id} href={getLinkHref(item.type, item._id)}>
                                <motion.div
                                    custom={index}
                                    variants={tableRowVariants}
                                    initial="hidden"
                                    animate="visible"
                                    className="bg-white dark:bg-[#0E192D] rounded-xl border border-gray-200 dark:border-slate-800 shadow-sm overflow-hidden transition-all active:scale-[0.98]"
                                >
                                    <div className="p-4 space-y-4">
                                        <div className="flex justify-between items-start">
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider ${getTypeColor(item.type)}`}>
                                                {getTypeLabel(item.type)}
                                            </span>
                                            <p className="text-[11px] text-gray-400 dark:text-slate-500 font-medium">
                                                {new Date(item.createdAt).toLocaleDateString('en-IN')}
                                            </p>
                                        </div>

                                        <div className="border-y border-gray-50 dark:border-slate-800/50 py-3">
                                            <p className="text-[10px] text-gray-400 dark:text-slate-500 font-bold uppercase tracking-wider mb-1">Request Details</p>
                                            <h3 className="text-sm font-bold text-gray-900 dark:text-white leading-snug">
                                                {item.vehicleInfo}
                                            </h3>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4 text-xs font-medium">
                                            <div className="flex flex-col gap-1">
                                                <p className="text-[10px] text-gray-400 dark:text-slate-500 font-bold uppercase tracking-wider">Location</p>
                                                <div className="flex items-center text-gray-700 dark:text-slate-300">
                                                    <MapPin className="w-3 h-3 mr-1 text-gray-400 shrink-0" />
                                                    <span className="truncate">{item.location}</span>
                                                </div>
                                            </div>
                                            <div className="flex flex-col gap-1 text-right">
                                                <p className="text-[10px] text-gray-400 dark:text-slate-500 font-bold uppercase tracking-wider">Customer</p>
                                                <p className="text-gray-900 dark:text-white truncate">{item.customerName}</p>
                                                <p className="text-[10px] font-mono text-gray-500 dark:text-slate-400">{item.customerPhone}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between pt-1 border-t border-gray-50 dark:border-slate-800/50">
                                            <p className="text-[10px] text-gray-400 dark:text-slate-500 font-bold uppercase tracking-wider">
                                                Tap to view details
                                            </p>
                                            <div className="w-8 h-8 rounded-lg bg-gray-50 dark:bg-slate-800 flex items-center justify-center text-emerald-500 shadow-sm border border-gray-100 dark:border-slate-700">
                                                <ArrowRight className="w-4 h-4" />
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            </Link>
                        ))}
                    </div>

                    {/* Desktop View (Table) */}
                    <div className="hidden md:block overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50 dark:bg-slate-900/50 border-b border-gray-100 dark:border-slate-800 text-[11px] uppercase tracking-wider text-gray-500 dark:text-slate-400 font-bold">
                                    <th className="p-4 pl-6">Req Details</th>
                                    <th className="p-4">Customer</th>
                                    <th className="p-4">Location</th>
                                    <th className="p-4">Request Date</th>
                                    <th className="p-4 text-right pr-6">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-slate-800/60">
                                <AnimatePresence>
                                    {filteredData.map((item, index) => (
                                        <motion.tr
                                            key={item._id}
                                            custom={index}
                                            variants={tableRowVariants}
                                            initial="hidden"
                                            animate="visible"
                                            exit={{ opacity: 0, scale: 0.95 }}
                                            layout
                                            className="hover:bg-gray-50/50 dark:hover:bg-slate-800/30 transition-colors group"
                                        >
                                            <td className="p-4 pl-6 align-top">
                                                <div className="flex flex-col gap-1.5">
                                                    <div className={`self-start inline-flex items-center px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${getTypeColor(item.type)}`}>
                                                        {getTypeLabel(item.type)}
                                                    </div>
                                                    <p className="text-[13px] font-bold text-gray-900 dark:text-white line-clamp-2 max-w-xs xl:max-w-md">
                                                        {item.vehicleInfo}
                                                    </p>
                                                </div>
                                            </td>

                                            <td className="p-4 align-top">
                                                <div className="flex flex-col">
                                                    <p className="text-[13px] font-bold text-gray-900 dark:text-white">{item.customerName}</p>
                                                    <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">{item.customerPhone}</p>
                                                </div>
                                            </td>

                                            <td className="p-4 align-top">
                                                <div className="flex items-center text-[13px] font-semibold text-gray-700 dark:text-gray-300">
                                                    <MapPin className="w-3.5 h-3.5 mr-1.5 text-gray-400" />
                                                    {item.location}
                                                </div>
                                            </td>

                                            <td className="p-4 align-top">
                                                <p className="text-[13px] text-gray-600 dark:text-slate-300 font-semibold">
                                                    {new Date(item.createdAt).toLocaleDateString('en-IN', {
                                                        day: 'numeric',
                                                        month: 'short',
                                                        year: 'numeric'
                                                    })}
                                                </p>
                                                <p className="text-[11px] text-gray-400 dark:text-slate-500 mt-0.5 font-medium">
                                                    {new Date(item.createdAt).toLocaleTimeString('en-IN', {
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                </p>
                                            </td>

                                            <td className="p-4 pr-6 align-top text-right">
                                                <Link href={getLinkHref(item.type, item._id)}>
                                                    <button className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-300 hover:bg-emerald-100 hover:text-emerald-600 dark:hover:bg-emerald-500/20 dark:hover:text-emerald-400 transition-all group-hover:scale-110 active:scale-95 shadow-sm">
                                                        <ArrowRight className="w-4 h-4" />
                                                    </button>
                                                </Link>
                                            </td>
                                        </motion.tr>
                                    ))}
                                </AnimatePresence>
                            </tbody>
                        </table>
                    </div>
                </>
            )}
        </div >
    )
}

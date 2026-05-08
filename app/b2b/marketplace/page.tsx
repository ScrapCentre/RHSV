"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
    Building2,
    Search,
    Package,
    Car,
    Calendar,
    Clock,
    MapPin,
    AlertCircle,
    RefreshCcw,
    ArrowRight,
    Filter,
    TrendingUp,
    Eye,
    X,
    User,
    Phone,
    Hash,
    CheckCircle,
    Loader2
} from "lucide-react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"

export default function B2BMarketplace() {
    const { data: session, status } = useSession()
    const [valuations, setValuations] = useState<any[]>([])
    const [filteredValuations, setFilteredValuations] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [hasSearched, setHasSearched] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [selectedRequest, setSelectedRequest] = useState<any | null>(null)
    const [showFilters, setShowFilters] = useState(false)
    const [acceptedIds, setAcceptedIds] = useState<Set<string>>(new Set())
    const [acceptingId, setAcceptingId] = useState<string | null>(null)

    // Filter states
    const [filterState, setFilterState] = useState("")
    const [filterCity, setFilterCity] = useState("")
    const [filterPincode, setFilterPincode] = useState("")

    const { toast } = useToast()
    const router = useRouter()

    useEffect(() => {
        if (status === "authenticated" && (session?.user as any)?.role === "partner") {
            fetchOpportunities()
        }
    }, [status, session])

    const handleAcceptLead = async (lead: any) => {
        if (acceptedIds.has(lead._id)) return
        setAcceptingId(lead._id)
        try {
            const res = await fetch("/api/b2b/pickups", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    leadId: lead._id,
                    leadType: lead.type,
                    leadSnapshot: lead,
                }),
            })
            const data = await res.json()
            if (res.ok) {
                setAcceptedIds(prev => new Set([...prev, lead._id]))
                toast({
                    title: "Lead Accepted!",
                    description: "This pickup has been added to your Pickups page.",
                })
                setSelectedRequest(null)
            } else if (res.status === 409) {
                setAcceptedIds(prev => new Set([...prev, lead._id]))
                toast({ title: "Already Accepted", description: data.message })
            } else {
                throw new Error(data.message || "Failed to accept lead")
            }
        } catch (err: any) {
            toast({ title: "Error", description: err.message, variant: "destructive" })
        } finally {
            setAcceptingId(null)
        }
    }


    const fetchOpportunities = async () => {
        setIsLoading(true)
        setError(null)
        setHasSearched(true)

        try {
            const res = await fetch("/api/valuations/marketplace")
            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.message || "Failed to fetch opportunities")
            }

            setValuations(data.data || [])
            setFilteredValuations(data.data || [])
            toast({
                title: "Marketplace Updated",
                description: `Found ${data.data?.length || 0} new opportunities for you.`,
            })
        } catch (err: any) {
            console.error("Marketplace Fetch Error:", err)
            setError(err.message)
            toast({
                title: "Connection Error",
                description: err.message,
                variant: "destructive",
            })
        } finally {
            setIsLoading(false)
        }
    }

    // Apply filters
    const applyFilters = () => {
        let filtered = [...valuations]

        if (filterState) {
            filtered = filtered.filter(val =>
                (val.address?.state || val.state || '').toLowerCase().includes(filterState.toLowerCase())
            )
        }

        if (filterCity) {
            filtered = filtered.filter(val =>
                (val.address?.city || val.city || '').toLowerCase().includes(filterCity.toLowerCase())
            )
        }

        if (filterPincode) {
            filtered = filtered.filter(val =>
                (val.address?.pincode || val.pincode || '').toString().includes(filterPincode)
            )
        }

        setFilteredValuations(filtered)
        toast({
            title: "Filters Applied",
            description: `Showing ${filtered.length} of ${valuations.length} requests`,
        })
    }

    // Clear filters
    const clearFilters = () => {
        setFilterState("")
        setFilterCity("")
        setFilterPincode("")
        setFilteredValuations(valuations)
        toast({
            title: "Filters Cleared",
            description: `Showing all ${valuations.length} requests`,
        })
    }

    if (status === "loading") {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-600"></div>
            </div>
        )
    }

    if (status === "unauthenticated" || (session?.user as any)?.role !== "partner") {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-[#070D19] flex items-center justify-center px-4 pt-20 transition-colors duration-300">
                <div className="max-w-md w-full text-center space-y-6 bg-white dark:bg-[#0E192D] p-8 rounded-2xl shadow-xl shadow-black/20 border border-slate-100 dark:border-slate-800">
                    <div className="w-20 h-20 bg-red-50 dark:bg-red-900/20 rounded-2xl flex items-center justify-center mx-auto text-red-600 dark:text-red-500">
                        <AlertCircle className="w-10 h-10" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-slate-900 dark:text-white">Access Denied</h1>
                        <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">Only verified B2B partners can access the marketplace. Please sign in with your partner credentials.</p>
                    </div>
                    <button
                        onClick={() => router.push("/b2b")}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-blue-600/20 hover:shadow-blue-600/30 hover:-translate-y-0.5"
                    >
                        Go to Partner Login
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#070D19] pt-8 pb-12 px-4 sm:px-6 lg:px-8 font-sans transition-colors duration-300">
            <div className="max-w-7xl mx-auto space-y-8">

                {/* Hero section removed for direct access */}
                <div className="hidden"></div>

                {/* Content Area */}
                <AnimatePresence mode="wait">
                    {hasSearched && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-6"
                        >
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                <h2 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2 tracking-wide uppercase">
                                    <Package className="w-6 h-6 text-blue-600 dark:text-blue-500" />
                                    Marketplace Feed
                                    <span className="ml-2 text-xs font-black text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 px-2 py-0.5 rounded-md">
                                        {filteredValuations.length} of {valuations.length}
                                    </span>
                                </h2>
                                <div className="flex gap-3 w-full md:w-auto">
                                    <button
                                        onClick={() => fetchOpportunities()}
                                        className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-white dark:bg-[#0E192D] border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-bold text-slate-700 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm"
                                    >
                                        <RefreshCcw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                                        Refresh
                                    </button>
                                    <button
                                        onClick={() => setShowFilters(!showFilters)}
                                        className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 border rounded-xl text-sm font-bold transition-colors shadow-sm ${showFilters ? 'bg-blue-600 text-white border-blue-600' : 'bg-white dark:bg-[#0E192D] text-slate-700 dark:text-white border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
                                            }`}
                                    >
                                        <Filter className="w-4 h-4" />
                                        Filters
                                    </button>
                                </div>
                            </div>

                            {/* Filter Panel */}
                            <AnimatePresence>
                                {showFilters && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: "auto" }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="bg-white dark:bg-[#0E192D] rounded-2xl border-2 border-blue-100 dark:border-slate-800 p-6 shadow-lg overflow-hidden"
                                    >
                                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                                            <Filter className="w-5 h-5 text-blue-600 dark:text-blue-500" />
                                            Filter Requests
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                            <div>
                                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">State</label>
                                                <select
                                                    value={filterState}
                                                    onChange={(e) => setFilterState(e.target.value)}
                                                    className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-slate-50 dark:bg-slate-900/50 dark:text-white"
                                                >
                                                    <option value="">All States</option>
                                                    <option value="Andhra Pradesh">Andhra Pradesh</option>
                                                    <option value="Arunachal Pradesh">Arunachal Pradesh</option>
                                                    <option value="Assam">Assam</option>
                                                    <option value="Bihar">Bihar</option>
                                                    <option value="Chhattisgarh">Chhattisgarh</option>
                                                    <option value="Goa">Goa</option>
                                                    <option value="Gujarat">Gujarat</option>
                                                    <option value="Haryana">Haryana</option>
                                                    <option value="Himachal Pradesh">Himachal Pradesh</option>
                                                    <option value="Jharkhand">Jharkhand</option>
                                                    <option value="Karnataka">Karnataka</option>
                                                    <option value="Kerala">Kerala</option>
                                                    <option value="Madhya Pradesh">Madhya Pradesh</option>
                                                    <option value="Maharashtra">Maharashtra</option>
                                                    <option value="Manipur">Manipur</option>
                                                    <option value="Meghalaya">Meghalaya</option>
                                                    <option value="Mizoram">Mizoram</option>
                                                    <option value="Nagaland">Nagaland</option>
                                                    <option value="Odisha">Odisha</option>
                                                    <option value="Punjab">Punjab</option>
                                                    <option value="Rajasthan">Rajasthan</option>
                                                    <option value="Sikkim">Sikkim</option>
                                                    <option value="Tamil Nadu">Tamil Nadu</option>
                                                    <option value="Telangana">Telangana</option>
                                                    <option value="Tripura">Tripura</option>
                                                    <option value="Uttar Pradesh">Uttar Pradesh</option>
                                                    <option value="Uttarakhand">Uttarakhand</option>
                                                    <option value="West Bengal">West Bengal</option>
                                                    <option value="Delhi">Delhi</option>
                                                    <option value="Jammu and Kashmir">Jammu and Kashmir</option>
                                                    <option value="Ladakh">Ladakh</option>
                                                    <option value="Puducherry">Puducherry</option>
                                                    <option value="Chandigarh">Chandigarh</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">City</label>
                                                <input
                                                    type="text"
                                                    value={filterCity}
                                                    onChange={(e) => setFilterCity(e.target.value)}
                                                    placeholder="e.g., Mumbai"
                                                    className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-slate-50 dark:bg-slate-900/50 dark:text-white"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Pincode</label>
                                                <input
                                                    type="text"
                                                    value={filterPincode}
                                                    onChange={(e) => setFilterPincode(e.target.value)}
                                                    placeholder="e.g., 400001"
                                                    className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-slate-50 dark:bg-slate-900/50 dark:text-white"
                                                />
                                            </div>
                                        </div>
                                        <div className="flex gap-3">
                                            <button
                                                onClick={() => applyFilters()}
                                                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-6 rounded-lg transition-colors shadow-md"
                                            >
                                                Apply Filters
                                            </button>
                                            <button
                                                onClick={() => clearFilters()}
                                                className="flex-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold py-2.5 px-6 rounded-lg transition-colors"
                                            >
                                                Clear All
                                            </button>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {error && (
                                <div className="bg-red-50 border border-red-100 rounded-2xl p-6 flex flex-col items-center text-center gap-4">
                                    <AlertCircle className="w-12 h-12 text-red-500" />
                                    <div>
                                        <h3 className="text-lg font-bold text-red-900">Failed to load marketplace</h3>
                                        <p className="text-red-700">{error}</p>
                                    </div>
                                    <button
                                        onClick={() => fetchOpportunities()}
                                        className="bg-red-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-red-700"
                                    >
                                        Try Again
                                    </button>
                                </div>
                            )}

                            {isLoading ? (
                                <div className="flex items-center justify-center py-20">
                                    <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
                                </div>
                            ) : filteredValuations.length === 0 ? (
                                <div className="bg-white dark:bg-[#0E192D] rounded-3xl p-16 text-center border border-slate-200 dark:border-slate-800 shadow-sm">
                                    <div className="w-20 h-20 bg-slate-100 dark:bg-slate-900/50 rounded-full flex items-center justify-center mx-auto mb-6">
                                        <Search className="w-10 h-10 text-slate-400 dark:text-slate-500" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">No matching requests</h3>
                                    <p className="text-slate-500 dark:text-gray-400 max-w-sm mx-auto">
                                        {valuations.length > 0 ? "Try adjusting your filters to see more results." : "There are no new scrap requests available right now. Check back soon!"}
                                    </p>
                                </div>
                            ) : (
                                <div className="bg-white dark:bg-[#0E192D] rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm relative">
                                    <div className="hidden md:block overflow-hidden">
                                        <table className="w-full text-left text-sm table-fixed">
                                            <thead className="bg-slate-50 dark:bg-slate-900/50 text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                                                <tr>
                                                    <th className="px-4 py-3 w-[15%]">Request Type</th>
                                                    <th className="px-4 py-3 w-[25%]">Vehicle Info</th>
                                                    <th className="px-4 py-3 w-[15%]">Lead Value</th>
                                                    <th className="px-4 py-3 w-[20%]">Location</th>
                                                    <th className="px-4 py-3 w-[10%]">Date Listed</th>
                                                    <th className="px-4 py-3 w-[15%] text-right">Action</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                                                {filteredValuations.map((val, index) => (
                                                    <tr key={val._id} className={`transition-all duration-300 group hover:scale-[1.01] hover:shadow-lg relative z-0 hover:z-10 cursor-default ${index % 2 === 0 ? 'bg-white dark:bg-[#0E192D]' : 'bg-slate-50 dark:bg-slate-800/40'} hover:bg-slate-100 dark:hover:bg-slate-800/70`}>
                                                        <td className="px-4 py-3">
                                                            <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded text-[9px] font-black uppercase tracking-widest max-w-full truncate ${
                                                                val.type === 'valuation' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' :
                                                                val.type === 'sell' ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20' :
                                                                val.type === 'exchange' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                                                                'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                                                            }`}>
                                                                <span className="truncate">
                                                                    {val.type === 'valuation' ? 'Quote' :
                                                                     val.type === 'sell' ? 'Sell' :
                                                                     val.type === 'exchange' ? 'Exchange' : 'Buy'}
                                                                </span>
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            <div className="flex flex-col overflow-hidden w-full">
                                                                <span className="font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
                                                                    {val.brand || val.vehicleBrand || val.oldVehicleBrand} {val.model || val.vehicleModel || val.oldVehicleModel}
                                                                </span>
                                                                <span className="text-[10px] font-medium text-slate-500 dark:text-white/40 truncate">
                                                                    {val.year || val.oldVehicleYear || val.registrationYear || 'N/A'} • {val.vehicleType || val.fuelType || 'Vehicle'}
                                                                </span>
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-3 text-[12px] font-medium text-slate-700 dark:text-white/70 truncate">
                                                            {val.vehicleWeight ? `${val.vehicleWeight} Tons` : val.budgetRange ? val.budgetRange : 'N/A'}
                                                        </td>
                                                        <td className="px-4 py-3 text-[12px] font-medium text-slate-600 dark:text-white/60 truncate">
                                                            {val.address?.city || val.city || 'Location'}, {val.address?.pincode || val.pincode || 'N/A'}
                                                        </td>
                                                        <td className="px-4 py-3 text-[11px] font-medium text-slate-400 dark:text-white/40 truncate">
                                                            {new Date(val.createdAt).toLocaleDateString()}
                                                        </td>
                                                        <td className="px-4 py-3 text-right">
                                                            <div className="flex justify-end gap-2">
                                                                {acceptedIds.has(val._id) ? (
                                                                    <div className="bg-blue-500/10 text-blue-600 dark:text-blue-400 px-3 py-1.5 rounded-lg border border-blue-500/30 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest cursor-default">
                                                                        <CheckCircle className="w-3.5 h-3.5" /> Accepted
                                                                    </div>
                                                                ) : (
                                                                    <button
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            handleAcceptLead(val);
                                                                        }}
                                                                        disabled={acceptingId === val._id}
                                                                        className="bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white px-3 py-1.5 rounded-lg transition-colors border border-blue-600 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest shadow-sm"
                                                                    >
                                                                        {acceptingId === val._id ? (
                                                                            <><Loader2 className="w-3.5 h-3.5 animate-spin" /> ...</>
                                                                        ) : (
                                                                            <><CheckCircle className="w-3.5 h-3.5" /> Accept</>
                                                                        )}
                                                                    </button>
                                                                )}
                                                                <button
                                                                    onClick={() => setSelectedRequest(val)}
                                                                    className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 hover:text-slate-900 dark:text-white dark:hover:text-white px-3 py-1.5 rounded-lg transition-colors border border-slate-200 dark:border-slate-700 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest"
                                                                >
                                                                    <Eye className="w-3.5 h-3.5" /> View
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>

                                    {/* Mobile View (Cards) */}
                                    <div className="md:hidden p-4 space-y-4 bg-slate-50 dark:bg-slate-900/20">
                                        {filteredValuations.map((val, index) => (
                                            <div key={val._id} className={`rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:border-blue-300 dark:hover:border-slate-700 active:scale-[0.98] ${index % 2 === 0 ? 'bg-white dark:bg-[#0E192D]' : 'bg-slate-50 dark:bg-slate-800/40'}`}>
                                                <div className="p-4 space-y-3">
                                                    <div className="flex justify-between items-start">
                                                        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
                                                            val.type === 'valuation' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' :
                                                            val.type === 'sell' ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20' :
                                                            val.type === 'exchange' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                                                            'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                                                        }`}>
                                                            {val.type === 'valuation' ? 'Quote' :
                                                             val.type === 'sell' ? 'Sell' :
                                                             val.type === 'exchange' ? 'Exchange' : 'Buy'}
                                                        </span>
                                                        <p className="text-[11px] text-white/40 font-medium">
                                                            {new Date(val.createdAt).toLocaleDateString()}
                                                        </p>
                                                    </div>

                                                    <div className="space-y-1">
                                                        <p className="text-sm font-bold text-slate-900 dark:text-white leading-snug line-clamp-2">
                                                            {val.brand || val.vehicleBrand || val.oldVehicleBrand} {val.model || val.vehicleModel || val.oldVehicleModel}
                                                        </p>
                                                        <p className="text-[11px] text-slate-500 dark:text-white/50">
                                                            {val.year || val.oldVehicleYear || val.registrationYear || 'N/A'} • {val.vehicleType || val.fuelType || 'Vehicle'}
                                                        </p>
                                                    </div>

                                                    <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-800/50">
                                                        <div className="flex flex-col">
                                                            <p className="text-[12px] font-medium text-slate-700 dark:text-white/80">
                                                                {val.vehicleWeight ? `${val.vehicleWeight} Tons` : val.budgetRange ? val.budgetRange : 'N/A'}
                                                            </p>
                                                            <p className="text-[10px] font-mono text-slate-500 dark:text-white/40">
                                                                {val.address?.city || val.city || 'Location'}, {val.address?.pincode || val.pincode || 'N/A'}
                                                            </p>
                                                        </div>
                                                        <div className="flex gap-2">
                                                            {acceptedIds.has(val._id) ? (
                                                                <div className="bg-blue-500/10 text-blue-600 dark:text-blue-400 px-3 py-2 rounded-lg border border-blue-500/30 flex items-center justify-center gap-1.5 text-[10px] font-bold uppercase tracking-widest cursor-default">
                                                                    <CheckCircle className="w-4 h-4" />
                                                                </div>
                                                            ) : (
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        handleAcceptLead(val);
                                                                    }}
                                                                    disabled={acceptingId === val._id}
                                                                    className="bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white px-3 py-2 rounded-lg transition-colors border border-blue-600 flex items-center justify-center gap-1.5 text-[10px] font-bold uppercase tracking-widest shadow-sm"
                                                                >
                                                                    {acceptingId === val._id ? (
                                                                        <Loader2 className="w-4 h-4 animate-spin" />
                                                                    ) : (
                                                                        <><CheckCircle className="w-4 h-4" /> Accept</>
                                                                    )}
                                                                </button>
                                                            )}
                                                            <button
                                                                onClick={() => setSelectedRequest(val)}
                                                                className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-white px-3 py-2 rounded-lg transition-colors border border-slate-200 dark:border-slate-700 flex items-center justify-center gap-1.5 text-[10px] font-bold uppercase tracking-widest"
                                                            >
                                                                <Eye className="w-4 h-4" /> View
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* View Details Modal */}
                <AnimatePresence>
                    {selectedRequest && (
                        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedRequest(null)}>
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                                onClick={(e) => e.stopPropagation()}
                                className="bg-white dark:bg-[#0E192D] rounded-2xl md:rounded-3xl shadow-2xl w-full max-w-2xl max-h-[95vh] md:max-h-[90vh] overflow-hidden relative flex flex-col"
                            >
                                {/* Close Button - Sticky */}
                                <button
                                    onClick={() => setSelectedRequest(null)}
                                    className="absolute top-4 right-4 p-2.5 bg-red-500 hover:bg-red-600 rounded-full transition-all z-30 shadow-2xl group"
                                >
                                    <X className="w-5 h-5 text-white" />
                                </button>

                                {/* Modal Header */}
                                <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 md:p-8 text-white flex-shrink-0">
                                    <div className="flex items-center gap-2 mb-3 flex-wrap pr-12">
                                        <span className={`px-2.5 md:px-3 py-1 md:py-1.5 rounded-lg text-[10px] md:text-xs font-bold uppercase tracking-wide ${selectedRequest.type === 'valuation' ? 'bg-purple-500/30 text-white border border-white/30' :
                                            selectedRequest.type === 'sell' ? 'bg-orange-500/30 text-white border border-white/30' :
                                                selectedRequest.type === 'exchange' ? 'bg-emerald-500/30 text-white border border-white/30' :
                                                    'bg-green-500/30 text-white border border-white/30'
                                            }`}>
                                            {selectedRequest.type === 'valuation' ? '📋 Get Free Quote' :
                                                selectedRequest.type === 'sell' ? '🏷️ Sell Old Vehicle' :
                                                    selectedRequest.type === 'exchange' ? '🔄 Exchange Vehicle' :
                                                        '🛒 Buy New Vehicle'}
                                        </span>
                                    </div>
                                    <h2 className="text-2xl md:text-3xl font-black leading-tight pr-12">
                                        {selectedRequest.brand || selectedRequest.vehicleBrand || selectedRequest.oldVehicleBrand} {selectedRequest.model || selectedRequest.vehicleModel || selectedRequest.oldVehicleModel}
                                    </h2>
                                    <p className="text-blue-100 mt-2 font-medium text-sm md:text-base">
                                        {selectedRequest.year || selectedRequest.oldVehicleYear || selectedRequest.registrationYear || 'N/A'} • {selectedRequest.vehicleType || selectedRequest.fuelType || 'Vehicle'}
                                    </p>
                                </div>

                                {/* Modal Content */}
                                <div className="p-4 md:p-8 space-y-5 md:space-y-6 max-h-[60vh] overflow-y-auto">
                                    {/* Vehicle Details */}
                                    <div>
                                        <h3 className="text-xs md:text-sm font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3 md:mb-4">Vehicle Information</h3>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                                            {selectedRequest.vehicleNumber && (
                                                <div className="flex items-start gap-2 md:gap-3 bg-slate-50 dark:bg-slate-900/50 p-3 rounded-lg">
                                                    <Hash className="w-4 h-4 text-blue-500 mt-1 flex-shrink-0" />
                                                    <div className="min-w-0">
                                                        <p className="text-xs text-slate-500 dark:text-slate-400">Vehicle Number</p>
                                                        <p className="font-bold text-slate-900 dark:text-white text-sm md:text-base truncate">{selectedRequest.vehicleNumber}</p>
                                                    </div>
                                                </div>
                                            )}
                                            {selectedRequest.registrationNumber && (
                                                <div className="flex items-start gap-2 md:gap-3 bg-slate-50 dark:bg-slate-900/50 p-3 rounded-lg">
                                                    <Hash className="w-4 h-4 text-blue-500 mt-1 flex-shrink-0" />
                                                    <div className="min-w-0">
                                                        <p className="text-xs text-slate-500 dark:text-slate-400">Registration Number</p>
                                                        <p className="font-bold text-slate-900 dark:text-white text-sm md:text-base truncate">{selectedRequest.registrationNumber}</p>
                                                    </div>
                                                </div>
                                            )}
                                            {selectedRequest.vehicleWeight && (
                                                <div className="flex items-start gap-2 md:gap-3 bg-slate-50 dark:bg-slate-900/50 p-3 rounded-lg">
                                                    <Car className="w-4 h-4 text-blue-500 mt-1 flex-shrink-0" />
                                                    <div className="min-w-0">
                                                        <p className="text-xs text-slate-500 dark:text-slate-400">Weight</p>
                                                        <p className="font-bold text-slate-900 dark:text-white text-sm md:text-base">{selectedRequest.vehicleWeight} Tons</p>
                                                    </div>
                                                </div>
                                            )}
                                            {selectedRequest.budgetRange && (
                                                <div className="flex items-start gap-2 md:gap-3 bg-slate-50 dark:bg-slate-900/50 p-3 rounded-lg">
                                                    <Car className="w-4 h-4 text-blue-500 mt-1 flex-shrink-0" />
                                                    <div className="min-w-0">
                                                        <p className="text-xs text-slate-500 dark:text-slate-400">Budget Range</p>
                                                        <p className="font-bold text-slate-900 dark:text-white text-sm md:text-base">{selectedRequest.budgetRange}</p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Financial Details (For Sell Requests) */}
                                    {selectedRequest.type === 'sell' && (
                                        <div>
                                            <h3 className="text-xs md:text-sm font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3 md:mb-4">Financial Information</h3>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                                                <div className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded-lg">
                                                    <p className="text-xs text-slate-500 dark:text-slate-400">Pending Loan</p>
                                                    <p className="font-bold text-slate-900 dark:text-white text-sm md:text-base">{selectedRequest.pendingLoan}</p>
                                                </div>
                                                {selectedRequest.pendingLoan === 'Yes' && (
                                                    <>
                                                        <div className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded-lg">
                                                            <p className="text-xs text-slate-500 dark:text-slate-400">Loan Amount</p>
                                                            <p className="font-bold text-slate-900 dark:text-white text-sm md:text-base">{selectedRequest.loanAmount}</p>
                                                        </div>
                                                        <div className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded-lg">
                                                            <p className="text-xs text-slate-500 dark:text-slate-400">Bank Name</p>
                                                            <p className="font-bold text-slate-900 dark:text-white text-sm md:text-base">{selectedRequest.loanBank}</p>
                                                        </div>
                                                    </>
                                                )}
                                                <div className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded-lg">
                                                    <p className="text-xs text-slate-500 dark:text-slate-400">Insurance</p>
                                                    <p className="font-bold text-slate-900 dark:text-white text-sm md:text-base">{selectedRequest.insuranceName || 'N/A'}</p>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Exchange Details (For Exchange Requests) */}
                                    {selectedRequest.type === 'exchange' && (
                                        <div>
                                            <h3 className="text-xs md:text-sm font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3 md:mb-4">Exchange Details</h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-xl border border-orange-100 dark:border-orange-900/40">
                                                    <h4 className="font-bold text-orange-800 dark:text-orange-400 text-sm mb-2">Old Vehicle (Selling)</h4>
                                                    <div className="space-y-1 text-sm">
                                                        <p><span className="text-slate-500 dark:text-slate-400">Brand:</span> <span className="font-semibold text-slate-900 dark:text-white">{selectedRequest.oldVehicleBrand}</span></p>
                                                        <p><span className="text-slate-500 dark:text-slate-400">Model:</span> <span className="font-semibold text-slate-900 dark:text-white">{selectedRequest.oldVehicleModel}</span></p>
                                                        <p><span className="text-slate-500 dark:text-slate-400">Year:</span> <span className="font-semibold text-slate-900 dark:text-white">{selectedRequest.oldVehicleYear}</span></p>
                                                        <p><span className="text-slate-500 dark:text-slate-400">Reg No:</span> <span className="font-semibold text-slate-900 dark:text-white">{selectedRequest.oldVehicleRegistration}</span></p>
                                                    </div>
                                                </div>
                                                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-900/40">
                                                    <h4 className="font-bold text-blue-800 dark:text-blue-400 text-sm mb-2">New Vehicle (Buying)</h4>
                                                    <div className="space-y-1 text-sm">
                                                        <p><span className="text-slate-500 dark:text-slate-400">Brand:</span> <span className="font-semibold text-slate-900 dark:text-white">{selectedRequest.newVehicleBrand}</span></p>
                                                        <p><span className="text-slate-500 dark:text-slate-400">Model:</span> <span className="font-semibold text-slate-900 dark:text-white">{selectedRequest.newVehicleModel}</span></p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* KYC Information */}
                                    {(selectedRequest.firstName || selectedRequest.dob || selectedRequest.aadharNumber) && (
                                        <div>
                                            <h3 className="text-xs md:text-sm font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3 md:mb-4">KYC Information</h3>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4 bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl">
                                                {selectedRequest.firstName && (
                                                    <div>
                                                        <p className="text-xs text-slate-500 dark:text-slate-400">Legal Name</p>
                                                        <p className="font-bold text-slate-900 dark:text-white text-sm md:text-base">{selectedRequest.firstName}</p>
                                                    </div>
                                                )}
                                                {selectedRequest.dob && (
                                                    <div>
                                                        <p className="text-xs text-slate-500 dark:text-slate-400">Date of Birth</p>
                                                        <p className="font-bold text-slate-900 dark:text-white text-sm md:text-base">{selectedRequest.dob}</p>
                                                    </div>
                                                )}
                                                {selectedRequest.aadharNumber && (
                                                    <div>
                                                        <p className="text-xs text-slate-500 dark:text-slate-400">Aadhar Number</p>
                                                        <p className="font-bold text-slate-900 dark:text-white text-sm md:text-base font-mono">{selectedRequest.aadharNumber}</p>
                                                    </div>
                                                )}
                                                {selectedRequest.aadharPhone && (
                                                    <div>
                                                        <p className="text-xs text-slate-500 dark:text-slate-400">Aadhar Linked Phone</p>
                                                        <p className="font-bold text-slate-900 dark:text-white text-sm md:text-base">{selectedRequest.aadharPhone}</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* Location */}
                                    <div>
                                        <h3 className="text-xs md:text-sm font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3 md:mb-4">Location</h3>
                                        <div className="flex items-start gap-3 bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl">
                                            <MapPin className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                                            <div className="min-w-0">
                                                <p className="font-bold text-slate-900 dark:text-white text-sm md:text-base">
                                                    {selectedRequest.address?.city || selectedRequest.city || 'Location'}, {selectedRequest.address?.state || selectedRequest.state || ''}
                                                </p>
                                                <p className="text-xs md:text-sm text-slate-600 dark:text-slate-400 mt-1">Pincode: {selectedRequest.address?.pincode || selectedRequest.pincode || 'N/A'}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Contact Information */}
                                    <div>
                                        <h3 className="text-xs md:text-sm font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3 md:mb-4">Contact Information</h3>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                                            <div className="flex items-start gap-3 bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl">
                                                <User className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                                                <div className="min-w-0">
                                                    <p className="text-xs text-slate-500 dark:text-slate-400">Name</p>
                                                    <p className="font-bold text-slate-900 dark:text-white text-sm md:text-base break-words">
                                                        {selectedRequest.contact?.name || selectedRequest.name || selectedRequest.customerName || 'N/A'}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-start gap-3 bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl">
                                                <Phone className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                                                <div className="min-w-0">
                                                    <p className="text-xs text-slate-500 dark:text-slate-400">Phone</p>
                                                    <p className="font-bold text-slate-900 dark:text-white text-sm md:text-base">
                                                        {selectedRequest.contact?.phone || selectedRequest.phone || selectedRequest.customerPhone || 'N/A'}
                                                    </p>
                                                </div>
                                            </div>
                                            {(selectedRequest.email || selectedRequest.customerEmail) && (
                                                <div className="col-span-1 sm:col-span-2 flex items-start gap-3 bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl">
                                                    <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                                                    <div className="min-w-0">
                                                        <p className="text-xs text-slate-500 dark:text-slate-400">Email</p>
                                                        <p className="font-bold text-slate-900 dark:text-white text-sm md:text-base break-all">
                                                            {selectedRequest.email || selectedRequest.customerEmail}
                                                        </p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Documents - Re-verifying structure */}
                                    {(selectedRequest.rcFile || selectedRequest.aadharFile || selectedRequest.carPhoto) && (
                                        <div>
                                            <h3 className="text-xs md:text-sm font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3 md:mb-4">Documents & Photos</h3>
                                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                                {selectedRequest.rcFile && (
                                                    <a href={selectedRequest.rcFile} target="_blank" rel="noopener noreferrer" className="block p-3 border border-slate-200 dark:border-slate-800 rounded-xl hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all text-center group">
                                                        <div className="w-10 h-10 bg-slate-100 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 rounded-full flex items-center justify-center mx-auto mb-2 group-hover:bg-blue-200 dark:group-hover:bg-blue-900/40 group-hover:text-blue-700 dark:group-hover:text-blue-300">
                                                            <Package className="w-5 h-5" />
                                                        </div>
                                                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300 group-hover:text-blue-700 dark:group-hover:text-blue-400">RC Document</span>
                                                    </a>
                                                )}
                                                {selectedRequest.aadharFile && (
                                                    <a href={selectedRequest.aadharFile} target="_blank" rel="noopener noreferrer" className="block p-3 border border-slate-200 dark:border-slate-800 rounded-xl hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all text-center group">
                                                        <div className="w-10 h-10 bg-slate-100 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 rounded-full flex items-center justify-center mx-auto mb-2 group-hover:bg-blue-200 dark:group-hover:bg-blue-900/40 group-hover:text-blue-700 dark:group-hover:text-blue-300">
                                                            <User className="w-5 h-5" />
                                                        </div>
                                                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300 group-hover:text-blue-700 dark:group-hover:text-blue-400">Aadhar Card</span>
                                                    </a>
                                                )}
                                                {selectedRequest.carPhoto && (
                                                    <a href={selectedRequest.carPhoto} target="_blank" rel="noopener noreferrer" className="block p-3 border border-slate-200 dark:border-slate-800 rounded-xl hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all text-center group">
                                                        <div className="w-10 h-10 bg-slate-100 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 rounded-full flex items-center justify-center mx-auto mb-2 group-hover:bg-blue-200 dark:group-hover:bg-blue-900/40 group-hover:text-blue-700 dark:group-hover:text-blue-300">
                                                            <Car className="w-5 h-5" />
                                                        </div>
                                                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300 group-hover:text-blue-700 dark:group-hover:text-blue-400">Car Photo</span>
                                                    </a>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* Timestamp */}
                                    <div className="pt-4 border-t border-slate-200 dark:border-slate-800 text-center">
                                        <p className="text-xs text-slate-400 italic flex items-center justify-center gap-2 flex-wrap">
                                            <Calendar className="w-3 h-3" />
                                            <span>Submitted on {new Date(selectedRequest.createdAt).toLocaleString()}</span>
                                        </p>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="p-4 md:p-6 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row gap-3">
                                    {acceptedIds.has(selectedRequest._id) ? (
                                        <div className="flex-1 flex items-center justify-center gap-2 py-3 md:py-4 bg-blue-500/10 border border-blue-500/30 text-blue-600 dark:text-blue-400 font-bold rounded-xl text-sm">
                                            <CheckCircle className="w-5 h-5" />
                                            Pickup Accepted
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => handleAcceptLead(selectedRequest)}
                                            disabled={acceptingId === selectedRequest._id}
                                            className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-bold py-3 md:py-4 rounded-xl transition-all shadow-lg shadow-blue-500/10 active:scale-[0.98] flex items-center justify-center gap-2"
                                        >
                                            {acceptingId === selectedRequest._id ? (
                                                <><Loader2 className="w-5 h-5 animate-spin" /> Accepting...</>
                                            ) : (
                                                <><CheckCircle className="w-5 h-5" /> Accept Pickup</>
                                            )}
                                        </button>
                                    )}
                                    <button
                                        onClick={() => setSelectedRequest(null)}
                                        className="flex-1 sm:flex-none sm:w-32 bg-slate-900 dark:bg-slate-800 hover:bg-black dark:hover:bg-slate-700 text-white font-bold py-3 md:py-4 rounded-xl transition-all shadow-lg active:scale-[0.98]"
                                    >
                                        Close
                                    </button>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </div >
    )
}


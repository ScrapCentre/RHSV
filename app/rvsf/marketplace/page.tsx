"use client"

import { useState, useEffect, useCallback } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import Script from "next/script"
import {
    Loader2, MapPin, Navigation, Lock, Unlock, Car, Zap,
    Building2, SlidersHorizontal, Search, AlertCircle, Store,
    ArrowRight, Star, Shield, Clock, ChevronDown, CreditCard, CheckCircle2
} from "lucide-react"

// Razorpay type declaration
declare global {
    interface Window {
        Razorpay: any
    }
}

// ── Types ────────────────────────────────────────────────────────
interface Lead {
    _id: string
    type: string
    source: string
    customerName: string
    vehicleInfo: string
    location: string
    city: string
    state: string
    pincode: string
    createdAt: string
    estimatedValue?: number
    carPhoto?: string
    vehicleWeight?: string
    year?: string
    brand?: string
    model?: string
    weight?: string
    distanceKm: number
    nearestCC?: string
    nearestCCId?: string
}

interface CC {
    _id: string
    name: string
    city: string
    state: string
    pincode: string
    catchmentRadius: number
}

// ── Quality Badge logic ──────────────────────────────────────────
function getQualityBadge(lead: Lead): { label: string; color: string; bg: string; border: string; icon: typeof Star } {
    const year = parseInt(lead.year || "0")
    const currentYear = new Date().getFullYear()
    const age = currentYear - year

    if (age <= 8) return { label: "Gold", color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/30", icon: Star }
    if (age <= 15) return { label: "Silver", color: "text-slate-300", bg: "bg-slate-500/10", border: "border-slate-400/30", icon: Shield }
    return { label: "Bronze", color: "text-orange-400", bg: "bg-orange-500/10", border: "border-orange-500/30", icon: Zap }
}

// ── Estimated scrap value range ──────────────────────────────────
function getEstimatedRange(lead: Lead): string {
    if (lead.estimatedValue && lead.estimatedValue > 0) {
        const low = Math.round(lead.estimatedValue * 0.85)
        const high = Math.round(lead.estimatedValue * 1.15)
        return `₹${(low / 1000).toFixed(0)}K — ₹${(high / 1000).toFixed(0)}K`
    }
    // Estimate based on weight if available
    const weight = parseFloat(lead.vehicleWeight || lead.weight || "0")
    if (weight > 0) {
        const base = weight * 1000 * 28 // ~₹28/kg average scrap
        const low = Math.round(base * 0.8)
        const high = Math.round(base * 1.2)
        return `₹${(low / 1000).toFixed(0)}K — ₹${(high / 1000).toFixed(0)}K`
    }
    return "₹15K — ₹45K"
}

// ── Unlock price ─────────────────────────────────────────────────
function getUnlockPrice(lead: Lead): number {
    if (lead.type === "buy" || lead.source === "BuyVehicle") {
        return 99
    }

    let weightKg = 0
    if (lead.source === "Valuation") {
        const raw = parseFloat(lead.vehicleWeight || "0")
        if (raw > 0) {
            weightKg = raw < 10 ? raw * 1000 : raw
        }
    } else if (lead.source === "WizardLead") {
        const raw = parseFloat(lead.weight || "0")
        if (raw > 0) {
            weightKg = raw < 10 ? raw * 1000 : raw
        }
    }

    const weightTons = weightKg > 0 ? weightKg / 1000 : 0

    if (weightTons <= 0) {
        if (lead.estimatedValue && lead.estimatedValue > 0) {
            const price = Math.round(lead.estimatedValue * 0.0075)
            return Math.max(99, Math.min(price, 999))
        }
        return 199 // Default fallback
    }

    const price = Math.round(weightTons * 750)
    return Math.max(99, Math.min(price, 999))
}

// ── Type badge ───────────────────────────────────────────────────
function getTypeBadge(type: string) {
    switch (type) {
        case "quote": return { label: "Scrap Vehicle", color: "text-red-400", bg: "bg-red-500/10" }
        case "exchange": return { label: "Exchange", color: "text-blue-400", bg: "bg-blue-500/10" }
        case "buy": return { label: "Buy Request", color: "text-emerald-400", bg: "bg-emerald-500/10" }
        default: return { label: "Lead", color: "text-purple-400", bg: "bg-purple-500/10" }
    }
}

// ─── Main Page ───────────────────────────────────────────────────
export default function RVSFMarketplacePage() {
    const { data: session, status } = useSession()
    const router = useRouter()

    const [mode, setMode] = useState<"coverage" | "explore">("coverage")
    const [radius, setRadius] = useState(200)
    const [leads, setLeads] = useState<Lead[]>([])
    const [ccs, setCcs] = useState<CC[]>([])
    const [rvsfLocation, setRvsfLocation] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [apiMessage, setApiMessage] = useState<string | null>(null)
    const [unlockingLeadId, setUnlockingLeadId] = useState<string | null>(null)
    const [paymentSuccess, setPaymentSuccess] = useState<string | null>(null)

    // Auth guard
    useEffect(() => {
        if (status === "unauthenticated") router.push("/rvsf/login")
        if (status === "authenticated" && (session?.user as any)?.role !== "rvsf") router.push("/rvsf/login")
    }, [session, status, router])

    // Fetch marketplace data
    const fetchLeads = useCallback(async () => {
        setLoading(true)
        setError(null)
        setApiMessage(null)
        try {
            const params = new URLSearchParams({ mode })
            if (mode === "explore") params.set("radius", radius.toString())
            const res = await fetch(`/api/rvsf/marketplace?${params}`)
            const data = await res.json()
            if (!res.ok) throw new Error(data.message || "Failed to fetch leads")
            setLeads(data.leads || [])
            setCcs(data.ccs || [])
            setRvsfLocation(data.rvsfLocation || null)
            if (data.message) setApiMessage(data.message)
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }, [mode, radius])

    useEffect(() => {
        if (status === "authenticated") fetchLeads()
    }, [status, fetchLeads])

    // Debounced radius change
    const [debouncedRadius, setDebouncedRadius] = useState(radius)
    useEffect(() => {
        const timer = setTimeout(() => setDebouncedRadius(radius), 500)
        return () => clearTimeout(timer)
    }, [radius])

    useEffect(() => {
        if (mode === "explore" && status === "authenticated") {
            fetchLeads()
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [debouncedRadius])

    if (status === "loading") {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-[#E31E24]" />
            </div>
        )
    }

    // ── Unlock handler ─────────────────────────────────────────
    const handleUnlock = async (lead: Lead) => {
        if (unlockingLeadId) return // Already processing
        setUnlockingLeadId(lead._id)

        try {
            // 1. Create Razorpay order
            const res = await fetch("/api/rvsf/unlock/create-order", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ leadId: lead._id, source: lead.source }),
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.message || "Failed to create order")

            // 2. Open Razorpay checkout
            if (!window.Razorpay) {
                throw new Error("Payment system not loaded. Please refresh and try again.")
            }

            const options = {
                key: data.keyId,
                amount: data.amount,
                currency: data.currency,
                name: "ScrapCentre",
                description: `Unlock: ${data.leadDescription}`,
                order_id: data.orderId,
                prefill: {
                    name: data.rvsfName,
                    email: data.rvsfEmail,
                },
                theme: {
                    color: "#7C3AED", // Purple theme
                    backdrop_color: "rgba(0,0,0,0.7)",
                },
                handler: async function (response: any) {
                    console.log("[Razorpay] Payment success, verifying...", response)
                    try {
                        const verifyRes = await fetch("/api/rvsf/unlock/verify", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                                razorpay_order_id: response.razorpay_order_id,
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_signature: response.razorpay_signature,
                                leadId: lead._id,
                                source: lead.source,
                                amount: data.amount,
                            }),
                        })
                        const verifyData = await verifyRes.json()
                        if (!verifyRes.ok) {
                            throw new Error(verifyData.message || "Verification failed")
                        }

                        setPaymentSuccess(lead._id)
                        setUnlockingLeadId(null)

                        // Remove unlocked lead from active list
                        setLeads(prev => prev.filter(l => l._id !== lead._id))

                        // Clear success state after 3 seconds
                        setTimeout(() => setPaymentSuccess(null), 3000)
                    } catch (err: any) {
                        console.error("[Verify Error]:", err)
                        setError(err.message || "Failed to verify payment")
                        setUnlockingLeadId(null)
                    }
                },
                modal: {
                    ondismiss: function () {
                        console.log("[Razorpay] Checkout closed")
                        setUnlockingLeadId(null)
                    },
                },
            }

            const rzp = new window.Razorpay(options)
            rzp.on("payment.failed", function (response: any) {
                console.error("[Razorpay] Payment failed:", response.error)
                setError(`Payment failed: ${response.error.description}`)
                setUnlockingLeadId(null)
            })
            rzp.open()

        } catch (err: any) {
            console.error("[Unlock] Error:", err)
            setError(err.message)
            setUnlockingLeadId(null)
        }
    }

    return (
        <>
        {/* Load Razorpay checkout script */}
        <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />

        <div className="space-y-6 max-w-6xl">
            {/* ── Page Header ─────────────────────────────────── */}
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-r from-purple-500/10 via-[#0E192D] to-[#0E192D] border border-purple-500/20 rounded-2xl p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2.5 mb-1">
                            <Store className="w-6 h-6 text-purple-400" />
                            <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">Marketplace</h1>
                        </div>
                        <p className="text-sm text-slate-400 font-medium">
                            Browse and unlock verified vehicle leads near your facilities
                        </p>
                    </div>
                    <div className="flex items-center gap-2 text-xs font-bold">
                        <div className="bg-purple-500/10 border border-purple-500/30 text-purple-300 px-3 py-1.5 rounded-full">
                            {leads.length} Lead{leads.length !== 1 ? "s" : ""} Available
                        </div>
                        {ccs.length > 0 && (
                            <div className="bg-blue-500/10 border border-blue-500/30 text-blue-300 px-3 py-1.5 rounded-full">
                                {ccs.length} CC{ccs.length !== 1 ? "s" : ""}
                            </div>
                        )}
                    </div>
                </div>
            </motion.div>

            {/* ── Mode Toggle ─────────────────────────────────── */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                className="bg-white dark:bg-[#0E192D] border border-gray-100 dark:border-slate-800 rounded-2xl p-4 md:p-5">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    <div className="flex bg-slate-100 dark:bg-slate-900 rounded-xl p-1 border border-gray-200 dark:border-slate-700">
                        <button
                            onClick={() => setMode("coverage")}
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold transition-all duration-200 ${
                                mode === "coverage"
                                    ? "bg-white dark:bg-[#E31E24] text-gray-900 dark:text-white shadow-sm"
                                    : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                            }`}
                        >
                            <Building2 className="w-4 h-4" />
                            My Coverage Area
                        </button>
                        <button
                            onClick={() => setMode("explore")}
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold transition-all duration-200 ${
                                mode === "explore"
                                    ? "bg-white dark:bg-[#E31E24] text-gray-900 dark:text-white shadow-sm"
                                    : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                            }`}
                        >
                            <Navigation className="w-4 h-4" />
                            Explore by Distance
                        </button>
                    </div>

                    {mode === "coverage" && (
                        <p className="text-xs text-slate-500 font-medium">
                            Showing leads within your Collection Centers' catchment radius
                        </p>
                    )}
                </div>

                {/* ── Distance Slider (Explore Mode) ──────────── */}
                <AnimatePresence>
                    {mode === "explore" && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="overflow-hidden"
                        >
                            <div className="mt-5 pt-5 border-t border-slate-100 dark:border-slate-800">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                        <SlidersHorizontal className="w-4 h-4 text-slate-400" />
                                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Search Radius</span>
                                    </div>
                                    <span className="text-lg font-extrabold text-[#E31E24]">{radius} km</span>
                                </div>
                                <input
                                    type="range"
                                    min={50}
                                    max={1000}
                                    step={10}
                                    value={radius}
                                    onChange={e => setRadius(Number(e.target.value))}
                                    className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full appearance-none cursor-pointer accent-[#E31E24]"
                                />
                                <div className="flex justify-between text-xs text-slate-500 mt-1.5 font-medium">
                                    <span>50 km</span>
                                    <span>500 km</span>
                                    <span>1000 km</span>
                                </div>
                                {rvsfLocation && (
                                    <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
                                        <MapPin className="w-3.5 h-3.5 text-[#E31E24]" />
                                        <span>Center: <strong className="text-slate-300">{rvsfLocation.city}, {rvsfLocation.state}</strong></span>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>

            {/* ── Error State ─────────────────────────────────── */}
            {error && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="bg-red-500/10 border border-red-500/30 rounded-2xl p-5 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                    <div>
                        <p className="text-sm font-bold text-red-400">Something went wrong</p>
                        <p className="text-xs text-red-400/70 mt-1">{error}</p>
                    </div>
                </motion.div>
            )}

            {/* ── API Message (e.g. no CCs) ───────────────────── */}
            {apiMessage && !error && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-5 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                        <p className="text-sm font-bold text-amber-400">{apiMessage}</p>
                        <p className="text-xs text-amber-400/70 mt-1">
                            Add Collection Centers from your dashboard to start seeing nearby leads.
                        </p>
                    </div>
                </motion.div>
            )}

            {/* ── Loading State ────────────────────────────────── */}
            {loading && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                        <div key={i} className="bg-white dark:bg-[#0E192D] border border-gray-100 dark:border-slate-800 rounded-2xl p-5 animate-pulse">
                            <div className="h-40 bg-slate-100 dark:bg-slate-800 rounded-xl mb-4" />
                            <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded w-3/4 mb-3" />
                            <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded w-1/2 mb-2" />
                            <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded w-2/3" />
                        </div>
                    ))}
                </div>
            )}

            {/* ── Empty State ──────────────────────────────────── */}
            {!loading && !error && leads.length === 0 && !apiMessage && (
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                    className="bg-white dark:bg-[#0E192D] border border-gray-100 dark:border-slate-800 rounded-2xl p-12 text-center">
                    <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-4">
                        <Search className="w-7 h-7 text-slate-400" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">No Leads Found</h3>
                    <p className="text-sm text-slate-500 max-w-md mx-auto">
                        {mode === "coverage"
                            ? "No approved vehicle leads found within your Collection Centers' coverage areas. Check back later as new leads are approved daily."
                            : `No approved leads found within ${radius}km of your registered address. Try increasing the radius.`}
                    </p>
                </motion.div>
            )}

            {/* ── Lead Cards Grid ─────────────────────────────── */}
            {!loading && leads.length > 0 && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.15 }}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                >
                    {leads.map((lead, idx) => (
                        <LeadCard key={lead._id} lead={lead} index={idx} mode={mode}
                            onUnlock={handleUnlock}
                            isUnlocking={unlockingLeadId === lead._id}
                            isPaymentSuccess={paymentSuccess === lead._id}
                        />
                    ))}
                </motion.div>
            )}
        </div>
        </>
    )
}

// ─── Lead Card Component ─────────────────────────────────────────
function LeadCard({ lead, index, mode, onUnlock, isUnlocking, isPaymentSuccess }: {
    lead: Lead;
    index: number;
    mode: "coverage" | "explore";
    onUnlock: (lead: Lead) => void;
    isUnlocking: boolean;
    isPaymentSuccess: boolean;
}) {
    const badge = getQualityBadge(lead)
    const typeBadge = getTypeBadge(lead.type)
    const BadgeIcon = badge.icon
    const valueRange = getEstimatedRange(lead)
    const unlockPrice = getUnlockPrice(lead)
    const hasPhoto = !!lead.carPhoto

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05, duration: 0.3 }}
            className="bg-white dark:bg-[#0E192D] border border-gray-100 dark:border-slate-800 rounded-2xl overflow-hidden hover:border-purple-500/30 dark:hover:border-purple-500/30 transition-all duration-300 group"
        >
            {/* Image Area */}
            <div className="relative h-44 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 overflow-hidden">
                {hasPhoto ? (
                    <>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={lead.carPhoto!}
                            alt="Vehicle"
                            className="w-full h-full object-cover filter blur-lg scale-110 opacity-60"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    </>
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <Car className="w-16 h-16 text-slate-300 dark:text-slate-700 opacity-50" />
                    </div>
                )}

                {/* Locked overlay */}
                <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-sm">
                    <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur border border-white/20 flex items-center justify-center">
                        <Lock className="w-5 h-5 text-white/80" />
                    </div>
                </div>

                {/* Badges */}
                <div className="absolute top-3 left-3 flex gap-2">
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${typeBadge.bg} ${typeBadge.color} backdrop-blur-sm`}>
                        {typeBadge.label}
                    </span>
                </div>
                <div className="absolute top-3 right-3">
                    <span className={`flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full ${badge.bg} ${badge.color} ${badge.border} border backdrop-blur-sm`}>
                        <BadgeIcon className="w-3 h-3" />
                        {badge.label}
                    </span>
                </div>
            </div>

            {/* Card Body */}
            <div className="p-5">
                {/* Vehicle Info */}
                <h3 className="font-bold text-gray-900 dark:text-white text-sm mb-1 truncate group-hover:text-purple-400 transition-colors">
                    {lead.vehicleInfo || "Vehicle Details Locked"}
                </h3>

                {/* Location */}
                <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-3">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span className="truncate">{lead.location}</span>
                </div>

                {/* Value & Distance */}
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Est. Scrap Value</p>
                        <p className="text-sm font-extrabold text-emerald-400">{valueRange}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Distance</p>
                        <p className="text-sm font-extrabold text-[#E31E24]">{lead.distanceKm} km</p>
                    </div>
                </div>

                {/* Nearest CC (Coverage mode) */}
                {mode === "coverage" && lead.nearestCC && (
                    <div className="flex items-center gap-2 mb-4 bg-blue-500/5 border border-blue-500/10 rounded-lg px-3 py-2">
                        <Building2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                        <span className="text-xs text-blue-300 font-medium truncate">
                            Nearest: <strong>{lead.nearestCC}</strong>
                        </span>
                    </div>
                )}

                {/* Posted date */}
                <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mb-4">
                    <Clock className="w-3 h-3" />
                    <span>{new Date(lead.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
                </div>

                {/* Unlock Button */}
                {isPaymentSuccess ? (
                    <div className="w-full flex items-center justify-center gap-2 py-3 bg-emerald-600 text-white font-bold text-sm rounded-xl">
                        <CheckCircle2 className="w-4 h-4" />
                        Payment Successful!
                    </div>
                ) : (
                    <button
                        onClick={() => onUnlock(lead)}
                        disabled={isUnlocking}
                        className={`w-full flex items-center justify-center gap-2 py-3 font-bold text-sm rounded-xl transition-all shadow-lg group/btn ${
                            isUnlocking
                                ? "bg-purple-800 text-purple-200 cursor-wait shadow-purple-800/20"
                                : "bg-purple-600 hover:bg-purple-700 text-white active:scale-[0.98] shadow-purple-600/20"
                        }`}
                    >
                        {isUnlocking ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Processing...
                            </>
                        ) : (
                            <>
                                <CreditCard className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
                                Unlock for ₹{unlockPrice}
                                <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 transition-transform" />
                            </>
                        )}
                    </button>
                )}
            </div>
        </motion.div>
    )
}

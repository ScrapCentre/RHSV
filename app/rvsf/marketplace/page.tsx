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
import { Plus_Jakarta_Sans } from "next/font/google"

const plusJakartaSans = Plus_Jakarta_Sans({
    subsets: ["latin"],
    weight: ["400", "500", "600", "700", "800"],
})

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

    if (age <= 8) return { label: "Gold", color: "text-amber-700", bg: "bg-amber-50", border: "border-amber-200", icon: Star }
    if (age <= 15) return { label: "Silver", color: "text-slate-700", bg: "bg-slate-50", border: "border-slate-200", icon: Shield }
    return { label: "Bronze", color: "text-orange-700", bg: "bg-orange-50", border: "border-orange-200", icon: Zap }
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
        case "quote": return { label: "Scrap Vehicle", color: "text-[#E31E24]", bg: "bg-red-50" }
        case "exchange": return { label: "Exchange", color: "text-blue-600", bg: "bg-blue-50" }
        case "buy": return { label: "Buy Request", color: "text-emerald-600", bg: "bg-emerald-50" }
        default: return { label: "Lead", color: "text-purple-600", bg: "bg-purple-50" }
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
            <div className={`${plusJakartaSans.className} flex items-center justify-center h-48`}>
                <Loader2 className="w-6 h-6 animate-spin text-[#E31E24]" />
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
                    color: "#E31E24", // Premium Red theme
                    backdrop_color: "rgba(0,0,0,0.6)",
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

        <div className={`${plusJakartaSans.className} space-y-5 max-w-6xl text-slate-800`}>
            {/* ── Page Header ─────────────────────────────────── */}
            <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }}
                className="bg-white border border-slate-100 rounded-xl p-4 sm:p-5 relative overflow-hidden shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-0.5">
                        <Store className="w-5 h-5 text-[#E31E24]" />
                        <h1 className="text-lg font-bold text-slate-800 tracking-tight">Marketplace</h1>
                    </div>
                    <p className="text-xs text-slate-500 font-medium">
                        Browse and unlock verified vehicle leads near your facilities
                    </p>
                </div>
                <div className="flex items-center gap-2 text-[10px] font-bold">
                    <div className="bg-[#E31E24]/5 border border-[#E31E24]/10 text-[#E31E24] px-2.5 py-1 rounded-full">
                        {leads.length} Lead{leads.length !== 1 ? "s" : ""} Available
                    </div>
                    {ccs.length > 0 && (
                        <div className="bg-slate-50 border border-slate-200 text-slate-600 px-2.5 py-1 rounded-full">
                            {ccs.length} Center{ccs.length !== 1 ? "s" : ""}
                        </div>
                    )}
                </div>
            </motion.div>

            {/* ── Mode Toggle ─────────────────────────────────── */}
            <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
                className="bg-white border border-slate-100 rounded-xl p-4 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                    <div className="flex bg-slate-50 rounded-lg p-0.5 border border-slate-100 self-start">
                        <button
                            onClick={() => setMode("coverage")}
                            className={`flex items-center gap-1.5 px-4 py-2 rounded-md text-xs font-bold transition-all duration-200 ${
                                mode === "coverage"
                                    ? "bg-[#E31E24] text-white shadow-sm"
                                    : "text-slate-500 hover:text-slate-850"
                            }`}
                        >
                            <Building2 className="w-3.5 h-3.5" />
                            My Coverage Area
                        </button>
                        <button
                            onClick={() => setMode("explore")}
                            className={`flex items-center gap-1.5 px-4 py-2 rounded-md text-xs font-bold transition-all duration-200 ${
                                mode === "explore"
                                    ? "bg-[#E31E24] text-white shadow-sm"
                                    : "text-slate-500 hover:text-slate-850"
                            }`}
                        >
                            <Navigation className="w-3.5 h-3.5" />
                            Explore by Distance
                        </button>
                    </div>

                    {mode === "coverage" && (
                        <p className="text-[11px] text-slate-500 font-medium leading-none mt-1 sm:mt-0">
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
                            <div className="mt-4 pt-4 border-t border-slate-100">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
                                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Search Radius</span>
                                    </div>
                                    <span className="text-sm font-extrabold text-[#E31E24]">{radius} km</span>
                                </div>
                                <input
                                    type="range"
                                    min={50}
                                    max={1000}
                                    step={10}
                                    value={radius}
                                    onChange={e => setRadius(Number(e.target.value))}
                                    className="w-full h-1.5 bg-slate-100 rounded-full appearance-none cursor-pointer accent-[#E31E24]"
                                />
                                <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-medium">
                                    <span>50 km</span>
                                    <span>500 km</span>
                                    <span>1000 km</span>
                                </div>
                                {rvsfLocation && (
                                    <div className="mt-2.5 flex items-center gap-1.5 text-[10px] text-slate-500">
                                        <MapPin className="w-3 h-3 text-[#E31E24]" />
                                        <span>Center: <strong className="text-slate-700">{rvsfLocation.city}, {rvsfLocation.state}</strong></span>
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
                    className="bg-red-50 border border-red-100 rounded-xl p-4 flex items-start gap-3">
                    <AlertCircle className="w-4.5 h-4.5 text-red-500 shrink-0 mt-0.5" />
                    <div>
                        <p className="text-xs font-bold text-red-700">Something went wrong</p>
                        <p className="text-[10px] text-red-500/80 mt-0.5">{error}</p>
                    </div>
                </motion.div>
            )}

            {/* ── API Message (e.g. no CCs) ───────────────────── */}
            {apiMessage && !error && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="bg-amber-50 border border-amber-100 rounded-xl p-4 flex items-start gap-3">
                    <AlertCircle className="w-4.5 h-4.5 text-amber-500 shrink-0 mt-0.5" />
                    <div>
                        <p className="text-xs font-bold text-amber-700">{apiMessage}</p>
                        <p className="text-[10px] text-slate-500 mt-0.5 font-semibold">
                            Add Collection Centers from your dashboard to start seeing nearby leads.
                        </p>
                    </div>
                </motion.div>
            )}

            {/* ── Loading State ────────────────────────────────── */}
            {loading && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                        <div key={i} className="bg-white border border-slate-100 rounded-xl p-4 animate-pulse">
                            <div className="h-32 bg-slate-50 rounded-lg mb-3" />
                            <div className="h-3.5 bg-slate-50 rounded w-3/4 mb-2.5" />
                            <div className="h-2.5 bg-slate-50 rounded w-1/2 mb-1.5" />
                            <div className="h-2.5 bg-slate-50 rounded w-2/3" />
                        </div>
                    ))}
                </div>
            )}

            {/* ── Empty State ──────────────────────────────────── */}
            {!loading && !error && leads.length === 0 && !apiMessage && (
                <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}
                    className="bg-white border border-slate-100 rounded-xl p-10 text-center shadow-sm">
                    <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center mx-auto mb-3">
                        <Search className="w-5 h-5 text-slate-400" />
                    </div>
                    <h3 className="text-sm font-bold text-slate-800 mb-1">No Leads Found</h3>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto font-medium">
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
                    transition={{ delay: 0.1 }}
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
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.03, duration: 0.25 }}
            className="bg-white border border-slate-100 rounded-xl overflow-hidden hover:border-[#E31E24]/20 hover:shadow transition-all duration-300 group flex flex-col justify-between"
        >
            {/* Image Area */}
            <div className="relative h-36 bg-gradient-to-br from-slate-50 to-slate-100 overflow-hidden">
                {hasPhoto ? (
                    <>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={lead.carPhoto!}
                            alt="Vehicle"
                            className="w-full h-full object-cover filter blur-md scale-105 opacity-60"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    </>
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <Car className="w-12 h-12 text-slate-200 dark:text-slate-700 opacity-40" />
                    </div>
                )}

                {/* Locked overlay */}
                <div className="absolute inset-0 flex items-center justify-center bg-black/10 backdrop-blur-sm">
                    <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur border border-white/20 flex items-center justify-center shadow-sm">
                        <Lock className="w-4.5 h-4.5 text-white/90" />
                    </div>
                </div>

                {/* Badges */}
                <div className="absolute top-2.5 left-2.5 flex gap-1.5">
                    <span className={`text-[8px] font-bold px-2 py-0.5 rounded-full ${typeBadge.bg} ${typeBadge.color} backdrop-blur-sm shadow-sm`}>
                        {typeBadge.label}
                    </span>
                </div>
                <div className="absolute top-2.5 right-2.5">
                    <span className={`flex items-center gap-0.5 text-[8px] font-bold px-2 py-0.5 rounded-full ${badge.bg} ${badge.color} ${badge.border} border backdrop-blur-sm shadow-sm`}>
                        <BadgeIcon className="w-2.5 h-2.5" />
                        {badge.label}
                    </span>
                </div>
            </div>

            {/* Card Body */}
            <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                    {/* Vehicle Info */}
                    <h3 className="font-bold text-slate-800 text-xs mb-1 truncate group-hover:text-[#E31E24] transition-colors leading-tight">
                        {lead.vehicleInfo || "Vehicle Details Locked"}
                    </h3>

                    {/* Location */}
                    <div className="flex items-center gap-1 text-[10px] text-slate-500 mb-2">
                        <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                        <span className="truncate">{lead.location}</span>
                    </div>

                    {/* Value & Distance */}
                    <div className="flex items-center justify-between mb-3 bg-slate-50/50 p-2 rounded-lg border border-slate-100/50">
                        <div>
                            <p className="text-[8px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Est. Scrap Value</p>
                            <p className="text-[11px] font-extrabold text-emerald-600">{valueRange}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-[8px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Distance</p>
                            <p className="text-[11px] font-extrabold text-[#E31E24]">{lead.distanceKm} km</p>
                        </div>
                    </div>

                    {/* Nearest CC (Coverage mode) */}
                    {mode === "coverage" && lead.nearestCC && (
                        <div className="flex items-center gap-1.5 mb-3 bg-blue-50/50 border border-blue-100 rounded-lg px-2 py-1">
                            <Building2 className="w-3 h-3 text-blue-500 shrink-0" />
                            <span className="text-[10px] text-blue-700 font-semibold truncate leading-none">
                                Nearest: <strong>{lead.nearestCC}</strong>
                            </span>
                        </div>
                    )}
                </div>

                <div>
                    {/* Posted date */}
                    <div className="flex items-center gap-1 text-[9px] text-slate-400 mb-3">
                        <Clock className="w-2.5 h-2.5" />
                        <span>{new Date(lead.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
                    </div>

                    {/* Unlock Button */}
                    {isPaymentSuccess ? (
                        <div className="w-full flex items-center justify-center gap-1 py-2 bg-emerald-600 text-white font-bold text-[10px] rounded-lg shadow-sm">
                            <CheckCircle2 className="w-3 h-3" />
                            Payment Successful!
                        </div>
                    ) : (
                        <button
                            onClick={() => onUnlock(lead)}
                            disabled={isUnlocking}
                            className={`w-full flex items-center justify-center gap-1 py-2 font-bold text-[10px] rounded-lg transition-all shadow-sm group/btn ${
                                isUnlocking
                                    ? "bg-red-800 text-red-200 cursor-wait"
                                    : "bg-[#E31E24] hover:bg-[#c9181d] text-white active:scale-[0.98] shadow-red-600/5"
                            }`}
                        >
                            {isUnlocking ? (
                                <>
                                    <Loader2 className="w-3 h-3 animate-spin" />
                                    Processing...
                                </>
                            ) : (
                                <>
                                    <CreditCard className="w-3 h-3 group-hover/btn:scale-105 transition-transform" />
                                    Unlock for ₹{unlockPrice}
                                    <ArrowRight className="w-3 h-3 group-hover/btn:translate-x-0.5 transition-transform" />
                                </>
                            )}
                        </button>
                    )}
                </div>
            </div>
        </motion.div>
    )
}

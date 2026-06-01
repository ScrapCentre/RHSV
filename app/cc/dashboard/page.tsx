"use client"

import React, { useEffect, useState } from "react"
import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { 
    Loader2, 
    Building2, 
    LogOut, 
    Car, 
    User, 
    Phone, 
    Calendar, 
    Clock, 
    AlertCircle, 
    Check, 
    ChevronsUpDown,
    Plus,
    X,
    ClipboardList,
    TrendingUp
} from "lucide-react"
import { Plus_Jakarta_Sans } from "next/font/google"
import { useToast } from "@/hooks/use-toast"

const plusJakartaSans = Plus_Jakarta_Sans({
    subsets: ["latin"],
    weight: ["400", "500", "600", "700", "800"],
})

interface AssignedLead {
    _id: string
    leadId: string
    leadSource: string
    vehicleInfo: string
    customerName: string
    customerPhone: string
    assignedAt: string
    pickupStatus?: string
    status: string
}

export default function CCDashboardPage() {
    const { data: session, status } = useSession()
    const router = useRouter()
    const { toast } = useToast()

    const [leads, setLeads] = useState<AssignedLead[]>([])
    const [ccName, setCcName] = useState("")
    const [ccCity, setCcCity] = useState("")
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    // Update Status Modal State
    const [updatingLead, setUpdatingLead] = useState<AssignedLead | null>(null)
    const [newStatus, setNewStatus] = useState("")
    const [isUpdatingSubmit, setIsUpdatingSubmit] = useState(false)

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/cc/login")
        }
        if (status === "authenticated" && (session?.user as any)?.role !== "cc_operator") {
            router.push("/cc/login")
        }
    }, [session, status, router])

    const fetchLeads = async () => {
        if (status !== "authenticated") return
        try {
            setLoading(true)
            setError(null)
            const res = await fetch("/api/cc/leads")
            if (!res.ok) {
                if (res.status === 401 || res.status === 403) {
                    router.push("/cc/login")
                    return
                }
                throw new Error("Failed to load assigned leads")
            }
            const data = await res.json()
            setLeads(data.leads || [])
            setCcName(data.ccName || "Collection Center")
            setCcCity(data.ccCity || "")
        } catch (err: any) {
            console.error("Dashboard error:", err)
            setError(err.message || "Failed to load dashboard data. Please try again.")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchLeads()
    }, [status])

    const openUpdateModal = (lead: AssignedLead) => {
        setUpdatingLead(lead)
        setNewStatus(lead.pickupStatus || "Awaiting Pickup")
    }

    const handleStatusUpdate = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!updatingLead || !newStatus) return

        setIsUpdatingSubmit(true)
        try {
            const res = await fetch(`/api/cc/leads/${updatingLead._id}/status`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ pickupStatus: newStatus })
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.message || "Failed to update status")

            // Update local state instantly
            setLeads(prev => 
                prev.map(l => l._id === updatingLead._id ? { ...l, pickupStatus: newStatus } : l)
            )

            toast({
                title: "Status Updated Successfully",
                description: `Pickup status set to: ${newStatus}`,
            })

            setUpdatingLead(null)
        } catch (err: any) {
            console.error("Status update error:", err)
            toast({
                title: "Error Updating Status",
                description: err.message || "An unexpected error occurred",
                variant: "destructive"
            })
        } finally {
            setIsUpdatingSubmit(false)
        }
    }

    if (status === "loading" || loading) {
        return (
            <div className={`h-screen w-full flex flex-col items-center justify-center bg-slate-50 ${plusJakartaSans.className}`}>
                <Loader2 className="w-8 h-8 animate-spin text-[#E31E24] mb-2" />
                <p className="text-[10px] uppercase tracking-widest font-extrabold text-slate-450">Loading Terminal...</p>
            </div>
        )
    }

    // Stats calculations
    const awaitingPickup = leads.filter(l => !l.pickupStatus || l.pickupStatus === "Awaiting Pickup").length
    const pickedUp = leads.filter(l => l.pickupStatus === "Vehicle Picked Up").length
    const atYard = leads.filter(l => l.pickupStatus === "Vehicle at CC Yard").length
    const weighingDone = leads.filter(l => l.pickupStatus === "Weighing Done").length

    return (
        <div className={`min-h-screen bg-slate-50 text-slate-800 ${plusJakartaSans.className}`}>
            {/* Top Navigation */}
            <header className="h-16 bg-white border-b border-slate-200 flex items-center px-4 md:px-8 justify-between sticky top-0 z-30 shadow-sm">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#E31E24]/5 border border-[#E31E24]/10 flex items-center justify-center text-[#E31E24] shrink-0">
                        <Building2 className="w-5 h-5" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-xs font-black uppercase tracking-wider text-slate-900 leading-tight">Operator Dashboard</span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mt-0.5">ScrapCentre Terminal</span>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="hidden md:flex flex-col items-end">
                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Logged In As</span>
                        <span className="text-xs font-bold text-slate-800">{session?.user?.name || "Operator"}</span>
                    </div>
                    <button 
                        onClick={() => signOut({ callbackUrl: "/cc/login" })}
                        className="flex items-center gap-2 px-3 py-1.5 bg-red-50 hover:bg-red-100 border border-red-100/50 rounded-lg text-[10px] font-black text-[#E31E24] uppercase tracking-wider transition-all active:scale-[0.98]"
                    >
                        <LogOut className="w-3.5 h-3.5" />
                        Log Out
                    </button>
                </div>
            </header>

            {/* Main Content Area */}
            <main className="max-w-6xl mx-auto p-4 md:p-8 space-y-6">
                {/* CC Title Banner */}
                <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white border border-slate-100 rounded-xl p-5 md:p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                    <div className="space-y-1">
                        <p className="text-[9px] text-[#E31E24] font-black uppercase tracking-widest">Active Station</p>
                        <h1 className="text-xl md:text-2xl font-black text-slate-800 tracking-tight leading-tight">{ccName}</h1>
                        <p className="text-xs font-medium text-slate-400">{ccCity ? `${ccCity}, India` : "Registered Collection Center"}</p>
                    </div>
                    <div className="flex items-center gap-2 self-start md:self-center">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Station Code:</span>
                        <span className="text-[10px] font-mono font-black text-[#E31E24] bg-[#E31E24]/5 px-2.5 py-0.5 rounded border border-[#E31E24]/10">
                            {(session?.user as any)?.ccId || "—"}
                        </span>
                    </div>
                </motion.div>

                {/* Stats Dashboard */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                        { label: "Awaiting Pickup", count: awaitingPickup, color: "text-amber-500 bg-amber-500/5 border-amber-500/10" },
                        { label: "Vehicle Picked Up", count: pickedUp, color: "text-blue-500 bg-blue-500/5 border-blue-500/10" },
                        { label: "Vehicle at CC Yard", count: atYard, color: "text-purple-500 bg-purple-500/5 border-purple-500/10" },
                        { label: "Weighing Done", count: weighingDone, color: "text-emerald-500 bg-emerald-500/5 border-emerald-500/10" }
                    ].map((stat, i) => (
                        <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}
                            key={stat.label}
                            className="bg-white border border-slate-100 rounded-xl p-4 shadow-sm flex items-center gap-4 hover:shadow transition-all duration-300"
                        >
                            <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 border ${stat.color}`}>
                                <ClipboardList className="w-4.5 h-4.5" />
                            </div>
                            <div>
                                <span className="text-[8px] text-slate-400 font-extrabold uppercase tracking-wider block leading-none">{stat.label}</span>
                                <span className="text-xl font-black text-slate-800 leading-tight block mt-1">{stat.count}</span>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {error && (
                    <div className="bg-red-50 border border-red-100 text-red-700 py-3 px-4 rounded-xl flex items-center gap-3">
                        <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                        <p className="text-xs font-semibold">{error}</p>
                    </div>
                )}

                {/* Lead Management Section */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-[#E31E24] animate-pulse" />
                            <h2 className="text-sm font-black text-slate-800 tracking-wider uppercase">Assigned Operations</h2>
                        </div>
                        <span className="text-[10px] font-bold text-slate-500 bg-slate-100 border border-slate-200 px-2.5 py-0.5 rounded-full">
                            {leads.length} Leads Total
                        </span>
                    </div>

                    {leads.length === 0 ? (
                        <div className="bg-white border border-slate-100 rounded-xl p-12 text-center shadow-sm">
                            <ClipboardList className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                            <p className="text-slate-500 font-bold text-sm">No operations assigned to your station.</p>
                            <p className="text-[10px] text-slate-400 mt-1">Assignments are managed in real-time by your RVSF Administrator.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {leads.map((lead) => (
                                <motion.div 
                                    key={lead._id}
                                    layout
                                    className="bg-white border border-slate-150 hover:border-slate-350 rounded-xl p-4 flex flex-col justify-between shadow-sm hover:shadow transition-all duration-300 group"
                                >
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-start gap-2">
                                            <h3 className="font-extrabold text-slate-850 text-xs leading-normal">
                                                {lead.vehicleInfo || "Vehicle Information"}
                                            </h3>
                                            <span className={`text-[8.5px] font-extrabold px-2 py-0.5 rounded border uppercase tracking-wider shrink-0 whitespace-nowrap ${
                                                !lead.pickupStatus || lead.pickupStatus === "Awaiting Pickup" 
                                                    ? "bg-amber-50 text-amber-600 border-amber-100" 
                                                    : lead.pickupStatus === "Vehicle Picked Up"
                                                    ? "bg-blue-50 text-blue-600 border-blue-100"
                                                    : lead.pickupStatus === "Vehicle at CC Yard"
                                                    ? "bg-purple-50 text-purple-600 border-purple-100"
                                                    : "bg-emerald-50 text-emerald-600 border-emerald-100"
                                            }`}>
                                                {lead.pickupStatus || "Awaiting Pickup"}
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-medium">
                                            <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                            <span>Assigned: {new Date(lead.assignedAt).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</span>
                                        </div>

                                        {/* Contact & Location Details */}
                                        <div className="bg-slate-50 border border-slate-100 rounded-lg p-3 space-y-1.5 text-[11px] text-slate-650">
                                            <p className="font-bold text-slate-800 pb-1 border-b border-slate-200/50 flex items-center gap-1.5">
                                                <User className="w-3.5 h-3.5 text-[#E31E24] shrink-0" />
                                                {lead.customerName || "Customer Details"}
                                            </p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                                <span className="font-mono font-bold select-all text-slate-800">{lead.customerPhone || "No Phone Number"}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-4 pt-3 border-t border-slate-100">
                                        <button 
                                            onClick={() => openUpdateModal(lead)}
                                            className="w-full flex items-center justify-center gap-1.5 py-2 bg-slate-900 hover:bg-black text-white font-extrabold text-[10px] uppercase tracking-wider rounded-lg active:scale-[0.98] transition-all"
                                        >
                                            <Clock className="w-3.5 h-3.5" />
                                            Update Pickup Status
                                        </button>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>
            </main>

            {/* ── UPDATE STATUS MODAL ─────────────────────── */}
            <AnimatePresence>
                {updatingLead && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        {/* Backdrop */}
                        <motion.div 
                            initial={{ opacity: 0 }} 
                            animate={{ opacity: 1 }} 
                            exit={{ opacity: 0 }}
                            onClick={() => setUpdatingLead(null)}
                            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                        />

                        {/* Modal Box */}
                        <motion.div 
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-white border border-slate-100 w-full max-w-sm rounded-xl p-5 relative z-10 shadow-2xl space-y-4"
                        >
                            <div className="flex justify-between items-start gap-2">
                                <div className="flex items-center gap-2.5">
                                    <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center text-white shrink-0">
                                        <Clock className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-850 text-xs">Update Pickup Status</h3>
                                        <p className="text-[9px] text-slate-400 font-bold mt-0.5 leading-none">Vehicle: {updatingLead.vehicleInfo}</p>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => setUpdatingLead(null)}
                                    className="p-1 rounded text-slate-400 hover:text-slate-650 hover:bg-slate-50 transition-all shrink-0"
                                >
                                    <X className="w-3.5 h-3.5" />
                                </button>
                            </div>

                            <form onSubmit={handleStatusUpdate} className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block">
                                        Select Operational Stage
                                    </label>
                                    <div className="space-y-2">
                                        {[
                                            "Awaiting Pickup",
                                            "Vehicle Picked Up",
                                            "Vehicle at CC Yard",
                                            "Weighing Done"
                                        ].map((statusOption) => (
                                            <div 
                                                key={statusOption}
                                                onClick={() => setNewStatus(statusOption)}
                                                className={`border rounded-lg p-2.5 flex justify-between items-center cursor-pointer transition-all duration-150 ${newStatus === statusOption ? 'border-slate-900 bg-slate-900/5 font-extrabold' : 'border-slate-100 hover:border-slate-200 text-slate-600'}`}
                                            >
                                                <span className="text-xs">{statusOption}</span>
                                                {newStatus === statusOption && (
                                                    <div className="w-4 h-4 rounded-full bg-slate-900 flex items-center justify-center text-white shrink-0">
                                                        <Check className="w-2.5 h-2.5" />
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex gap-2.5 pt-1">
                                    <button 
                                        type="button"
                                        onClick={() => setUpdatingLead(null)}
                                        className="flex-1 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-650 font-bold text-[10px] rounded-lg active:scale-[0.98] transition-all"
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        type="submit"
                                        disabled={isUpdatingSubmit}
                                        className="flex-1 py-1.5 bg-slate-900 hover:bg-black text-white font-extrabold text-[10px] rounded-lg active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1 shadow-sm shadow-slate-900/5"
                                    >
                                        {isUpdatingSubmit ? (
                                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                        ) : (
                                            <Check className="w-3.5 h-3.5" />
                                        )}
                                        Save Status
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    )
}

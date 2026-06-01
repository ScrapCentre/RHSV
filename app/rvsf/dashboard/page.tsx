"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { 
    Building2, Loader2, Calendar, Check, X, 
    MessageSquare, AlertCircle, Sparkles, ShieldCheck, Mail, Phone, 
    Car, Trash2, Clock, Landmark
} from "lucide-react"
import { Plus_Jakarta_Sans } from "next/font/google"

const plusJakartaSans = Plus_Jakarta_Sans({
    subsets: ["latin"],
    weight: ["400", "500", "600", "700", "800"],
})

interface UnlockedLead {
    _id: string
    leadId: string
    leadSource: string
    rvsfId: string
    customerId?: string
    customerName?: string
    customerEmail?: string
    customerPhone?: string
    vehicleInfo?: string
    unlockPaymentId: string
    amount: number
    unlockedAt: string
    status: string
    chatThreadId?: string | null
    assignedCcId?: string
    assignedCcName?: string
    pickupStatus?: string
}

export default function RVSFDashboardPage() {
    const { data: session, status } = useSession()
    const router = useRouter()
    const [stats, setStats] = useState<{ totalCCs: number, rvsfId: string, name: string } | null>(null)
    const [unlockedLeads, setUnlockedLeads] = useState<UnlockedLead[]>([])
    const [loading, setLoading] = useState(true)
    const [actionLoadingId, setActionLoadingId] = useState<string | null>(null)
    
    // Rejection Modal State
    const [rejectingLead, setRejectingLead] = useState<UnlockedLead | null>(null)
    const [rejectionReason, setRejectionReason] = useState("")
    const [rejectError, setRejectError] = useState<string | null>(null)

    // Main error state
    const [dashboardError, setDashboardError] = useState<string | null>(null)

    // CC Assignment Modal State
    const [assigningLead, setAssigningLead] = useState<any | null>(null)
    const [ccsList, setCcsList] = useState<any[] | null>(null)
    const [ccsLoading, setCcsLoading] = useState(false)
    const [selectedCcId, setSelectedCcId] = useState("")
    const [isAssigningSubmit, setIsAssigningSubmit] = useState(false)

    const openAssignModal = async (lead: any) => {
        setAssigningLead(lead)
        setSelectedCcId("")
        setCcsLoading(true)
        try {
            const res = await fetch(`/api/rvsf/unlocked-leads/${lead._id}/ccs-with-distance`)
            if (res.ok) {
                const data = await res.json()
                setCcsList(data.ccs || [])
                if (data.ccs?.length > 0) {
                    setSelectedCcId(data.ccs[0]._id)
                }
            }
        } catch (err) {
            console.error("Error fetching CCs with distance:", err)
        } finally {
            setCcsLoading(false)
        }
    }

    const handleAssignConfirm = async () => {
        if (!assigningLead || !selectedCcId) return
        setIsAssigningSubmit(true)
        setDashboardError(null)
        try {
            const res = await fetch(`/api/rvsf/unlocked-leads/${assigningLead._id}/assign`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ccId: selectedCcId })
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.message || "Failed to assign lead")
            
            setUnlockedLeads(prev => 
                prev.map(l => l._id === assigningLead._id ? { 
                    ...l, 
                    status: "assigned_to_cc", 
                    assignedCcId: data.assignedCcId, 
                    assignedCcName: data.assignedCcName,
                    pickupStatus: "Awaiting Pickup"
                } : l)
            )
            setAssigningLead(null)
        } catch (err: any) {
            console.error("Assignment error:", err)
            setDashboardError(err.message || "An error occurred while assigning lead")
        } finally {
            setIsAssigningSubmit(false)
        }
    }

    useEffect(() => {
        if (status === "unauthenticated") router.push("/rvsf/login")
        if (status === "authenticated" && (session?.user as any)?.role !== "rvsf") router.push("/rvsf/login")
    }, [session, status, router])

    const fetchDashboardData = async () => {
        if (status !== "authenticated") return
        try {
            setLoading(true)
            const [statsRes, leadsRes] = await Promise.all([
                fetch("/api/rvsf/stats"),
                fetch("/api/rvsf/unlocked-leads")
            ])
            
            if (statsRes.ok) {
                const statsData = await statsRes.json()
                setStats(statsData)
            }
            
            if (leadsRes.ok) {
                const leadsData = await leadsRes.json()
                setUnlockedLeads(leadsData.leads || [])
            }
        } catch (error) {
            console.error("Error loading dashboard data:", error)
            setDashboardError("Failed to fetch dashboard data. Please try again.")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchDashboardData()
    }, [status])

    // Accept Handler
    const handleAccept = async (leadId: string) => {
        setActionLoadingId(leadId)
        setDashboardError(null)
        try {
            const res = await fetch(`/api/rvsf/unlocked-leads/${leadId}/accept`, {
                method: "POST"
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.message || "Failed to accept lead")
            
            // Update local state atomically
            setUnlockedLeads(prev => 
                prev.map(l => l._id === leadId ? { ...l, status: "accepted" } : l)
            )
        } catch (error: any) {
            console.error(error)
            setDashboardError(error.message || "An error occurred while accepting lead")
        } finally {
            setActionLoadingId(null)
        }
    }

    // Open Rejection Dialog
    const openRejectModal = (lead: UnlockedLead) => {
        setRejectingLead(lead)
        setRejectionReason("")
        setRejectError(null)
    }

    // Submit Rejection
    const handleRejectSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!rejectingLead) return
        if (!rejectionReason.trim()) {
            setRejectError("Rejection reason is required")
            return
        }

        setActionLoadingId(rejectingLead._id)
        setRejectError(null)

        try {
            const res = await fetch(`/api/rvsf/unlocked-leads/${rejectingLead._id}/reject`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ rejectionReason })
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.message || "Failed to reject lead")

            // Remove/update locally
            setUnlockedLeads(prev => 
                prev.filter(l => l._id !== rejectingLead._id)
            )
            setRejectingLead(null)
        } catch (error: any) {
            console.error(error)
            setRejectError(error.message || "An error occurred while rejecting lead")
        } finally {
            setActionLoadingId(null)
        }
    }

    if (status === "loading" || loading) {
        return (
            <div className={`${plusJakartaSans.className} flex items-center justify-center h-48`}>
                <Loader2 className="w-6 h-6 animate-spin text-[#E31E24]" />
            </div>
        )
    }

    const pendingLeads = unlockedLeads.filter(l => l.status === "pending_decision")
    const activeLeads = unlockedLeads.filter(l => l.status === "accepted" || l.status === "assigned_to_cc")

    return (
        <div className={`${plusJakartaSans.className} space-y-6 max-w-6xl text-slate-800`}>
            {/* Welcome banner */}
            <motion.div 
                initial={{ opacity: 0, y: -5 }} 
                animate={{ opacity: 1, y: 0 }}
                className="bg-white border border-slate-100 rounded-xl p-4 sm:p-5 relative overflow-hidden shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
            >
                <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-[0.02] pointer-events-none hidden sm:block">
                    <Sparkles className="w-20 h-20 text-slate-900" />
                </div>
                
                <div className="space-y-1">
                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Welcome back</p>
                    <h1 className="text-lg font-bold text-slate-800 leading-tight">{stats?.name || session?.user?.name}</h1>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-center">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">RVSF ID:</span>
                    <span className="text-[10px] font-mono font-bold text-[#E31E24] bg-[#E31E24]/5 px-2.5 py-0.5 rounded border border-[#E31E24]/10">
                        {stats?.rvsfId || (session?.user as any)?.rvsfId || "—"}
                    </span>
                </div>
            </motion.div>

            {/* Error Message */}
            {dashboardError && (
                <div className="bg-red-50 border border-red-100 text-red-700 py-2.5 px-4 rounded-xl flex items-center gap-3">
                    <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                    <p className="text-xs font-semibold">{dashboardError}</p>
                </div>
            )}

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <motion.div 
                    initial={{ opacity: 0, y: 5 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    transition={{ delay: 0.05 }}
                    className="bg-white border border-slate-100 rounded-xl p-4 shadow-sm hover:border-[#E31E24]/15 hover:shadow transition-all duration-300 flex items-center gap-4"
                >
                    <div className="w-8 h-8 rounded-lg bg-[#E31E24]/5 border border-[#E31E24]/10 flex items-center justify-center shrink-0">
                        <Building2 className="w-4.5 h-4.5 text-[#E31E24]" />
                    </div>
                    <div className="space-y-0.5">
                        <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Centers</span>
                        <div className="flex items-baseline gap-1.5">
                            <span className="text-xl font-bold text-slate-800 leading-none">{stats?.totalCCs ?? "0"}</span>
                            <span className="text-[10px] text-slate-500 font-medium">Active Collection Centers</span>
                        </div>
                    </div>
                </motion.div>

                <motion.div 
                    initial={{ opacity: 0, y: 5 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    transition={{ delay: 0.1 }}
                    className="bg-white border border-slate-100 rounded-xl p-4 shadow-sm hover:border-[#E31E24]/15 hover:shadow transition-all duration-300 flex items-center gap-4"
                >
                    <div className="w-8 h-8 rounded-lg bg-amber-500/5 border border-amber-500/10 flex items-center justify-center shrink-0">
                        <Clock className="w-4.5 h-4.5 text-amber-500" />
                    </div>
                    <div className="space-y-0.5">
                        <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Unresolved</span>
                        <div className="flex items-baseline gap-1.5">
                            <span className="text-xl font-bold text-slate-800 leading-none">{pendingLeads.length}</span>
                            <span className="text-[10px] text-slate-500 font-medium">Leads Awaiting Decision</span>
                        </div>
                    </div>
                </motion.div>

                <motion.div 
                    initial={{ opacity: 0, y: 5 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    transition={{ delay: 0.15 }}
                    className="bg-white border border-slate-100 rounded-xl p-4 shadow-sm hover:border-[#E31E24]/15 hover:shadow transition-all duration-300 flex items-center gap-4"
                >
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/5 border border-emerald-500/10 flex items-center justify-center shrink-0">
                        <ShieldCheck className="w-4.5 h-4.5 text-emerald-500" />
                    </div>
                    <div className="space-y-0.5">
                        <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Active</span>
                        <div className="flex items-baseline gap-1.5">
                            <span className="text-xl font-bold text-slate-800 leading-none">{activeLeads.length}</span>
                            <span className="text-[10px] text-slate-500 font-medium">Scraping Operations</span>
                        </div>
                    </div>
                </motion.div>
            </div>



            <hr className="border-slate-100" />

            {/* ── SECTION 1: MY UNLOCKED LEADS ───────────────────────── */}
            <div className="space-y-3">
                <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                    <h2 className="text-sm font-bold text-slate-800 tracking-tight">My Unlocked Leads</h2>
                    <span className="text-[9px] font-bold text-amber-600 bg-amber-50 border border-amber-100 px-2 py-0.5 rounded-full leading-none">
                        {pendingLeads.length} Pending
                    </span>
                </div>

                {pendingLeads.length === 0 ? (
                    <div className="bg-white border border-slate-100 border-dashed rounded-xl p-8 text-center">
                        <p className="text-slate-400 font-bold text-xs">No unlocked leads awaiting decision</p>
                        <p className="text-[10px] text-slate-400 mt-0.5 font-medium">Unlock leads within your coverage radius via the Marketplace!</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {pendingLeads.map(lead => (
                            <motion.div 
                                key={lead._id}
                                layout
                                className="bg-white border border-slate-100 rounded-xl p-4 flex flex-col justify-between shadow-sm hover:shadow-md transition-all duration-300"
                            >
                                <div className="space-y-3">
                                    <div className="flex justify-between items-start gap-2">
                                        <h3 className="font-bold text-slate-800 text-xs leading-normal">
                                            {lead.vehicleInfo || "Vehicle Details"}
                                        </h3>
                                        <span className="text-[8px] font-bold px-1.5 py-0.5 rounded bg-slate-50 text-slate-500 uppercase tracking-wider shrink-0">
                                            {lead.leadSource}
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                                        <Clock className="w-3 h-3 text-slate-400 shrink-0" />
                                        <span className="font-medium">Unlocked: {new Date(lead.unlockedAt).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</span>
                                    </div>

                                    {/* Obfuscated contact or locked indicator */}
                                    <div className="bg-slate-50 border border-slate-100 rounded-lg p-2.5 space-y-1 text-[10px] text-slate-500">
                                        <div className="flex items-center gap-1.5">
                                            <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                                            <span className="filter blur-[4px] select-none font-medium">xxxx@xxxx.com</span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                                            <span className="filter blur-[4px] select-none font-medium font-mono">+91 xxxxxxxxxx</span>
                                        </div>
                                        <div className="mt-1 pt-1 border-t border-slate-200/50 text-[9px] text-amber-600 font-bold">
                                            *Accept the lead to reveal customer details and begin chats.
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-2.5 mt-3 pt-3 border-t border-slate-100">
                                    <button 
                                        onClick={() => handleAccept(lead._id)}
                                        disabled={actionLoadingId === lead._id}
                                        className="flex-1 flex items-center justify-center gap-1 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] rounded-lg active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-wait shadow-sm shadow-emerald-600/5"
                                    >
                                        {actionLoadingId === lead._id ? (
                                            <Loader2 className="w-3 h-3 animate-spin" />
                                        ) : (
                                            <Check className="w-3.5 h-3.5" />
                                        )}
                                        Accept Lead
                                    </button>
                                    <button 
                                        onClick={() => openRejectModal(lead)}
                                        disabled={actionLoadingId === lead._id}
                                        className="flex-1 flex items-center justify-center gap-1 py-1.5 bg-red-50 hover:bg-red-100 border border-red-100 text-[#E31E24] font-bold text-[10px] rounded-lg active:scale-[0.98] transition-all disabled:opacity-50"
                                    >
                                        <X className="w-3 h-3" />
                                        Reject & Refund
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>

            {/* ── SECTION 2: ACTIVE LEADS ────────────────────────────── */}
            <div className="space-y-3 pt-2">
                <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <h2 className="text-sm font-bold text-slate-800 tracking-tight">Active Leads</h2>
                    <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full leading-none">
                        {activeLeads.length} Running
                    </span>
                </div>

                {activeLeads.length === 0 ? (
                    <div className="bg-white border border-slate-100 border-dashed rounded-xl p-8 text-center">
                        <p className="text-slate-400 font-bold text-xs">No active scrap operations</p>
                        <p className="text-[10px] text-slate-400 mt-0.5 font-medium">Accept unlocked leads above to initiate direct chats!</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {activeLeads.map(lead => (
                            <motion.div 
                                key={lead._id}
                                layout
                                className="bg-white border border-slate-100 hover:border-emerald-500/15 rounded-xl p-4 flex flex-col justify-between shadow-sm hover:shadow transition-all duration-300"
                            >
                                <div className="space-y-3">
                                    <div className="flex justify-between items-start gap-2">
                                        <h3 className="font-bold text-slate-800 text-xs leading-normal">
                                            {lead.vehicleInfo || "Vehicle Details"}
                                        </h3>
                                        <span className="text-[8px] font-bold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-600 border border-emerald-100 uppercase tracking-wider shrink-0">
                                            Active
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                                        <Calendar className="w-3 h-3 text-slate-400 shrink-0" />
                                        <span className="font-semibold">Assigned Scrap Operations</span>
                                    </div>

                                    {/* Unveiled Contact details */}
                                    <div className="bg-slate-50 border border-slate-100 rounded-lg p-2.5 space-y-1.5 text-[10px] text-slate-600">
                                        <p className="font-bold text-slate-800 pb-1 border-b border-slate-200/50 flex items-center gap-1">
                                            <Car className="w-3.5 h-3.5 text-[#E31E24] shrink-0" />
                                            {lead.customerName || "Customer Details"}
                                        </p>
                                        <div className="flex items-center gap-1.5 mt-1">
                                            <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                            <span className="font-medium select-all">{lead.customerEmail || "No Email Provided"}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                            <span className="font-medium font-mono select-all">{lead.customerPhone || "No Phone Provided"}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-2 mt-3 pt-3 border-t border-slate-100">
                                    <Link href={lead.chatThreadId ? `/rvsf/chat/${lead.chatThreadId}` : "/rvsf/chats"} className="flex-1">
                                        <button className="w-full flex items-center justify-center gap-1.5 py-2.5 bg-[#E31E24] hover:bg-[#c9181d] text-white font-bold text-[10px] rounded-lg active:scale-[0.98] transition-all shadow-sm shadow-red-600/5 h-full">
                                            <MessageSquare className="w-3.5 h-3.5" />
                                            Open Chat Thread
                                        </button>
                                    </Link>
                                    <div className="flex-1">
                                        {lead.assignedCcId ? (
                                            <button 
                                                onClick={() => openAssignModal(lead)}
                                                className="w-full flex flex-col items-center justify-center py-1.5 bg-blue-50 hover:bg-blue-100 border border-blue-100 text-blue-850 font-bold text-[9px] rounded-lg active:scale-[0.98] transition-all h-full"
                                            >
                                                <span className="flex items-center gap-1">
                                                    <Building2 className="w-3.5 h-3.5 text-[#E31E24] shrink-0" />
                                                    Assigned: {lead.assignedCcName || "CC"}
                                                </span>
                                                {lead.pickupStatus && (
                                                    <span className="text-[7.5px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-100 mt-0.5 uppercase tracking-wider">
                                                        {lead.pickupStatus}
                                                    </span>
                                                )}
                                            </button>
                                        ) : (
                                            <button 
                                                onClick={() => openAssignModal(lead)}
                                                className="w-full flex items-center justify-center gap-1.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-[10px] rounded-lg active:scale-[0.98] transition-all h-full"
                                            >
                                                <Building2 className="w-3.5 h-3.5 text-[#E31E24]" />
                                                Assign to CC
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>

            {/* ── REJECTION / REFUND REASON MODAL ─────────────────────── */}
            <AnimatePresence>
                {rejectingLead && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        {/* Backdrop */}
                        <motion.div 
                            initial={{ opacity: 0 }} 
                            animate={{ opacity: 1 }} 
                            exit={{ opacity: 0 }}
                            onClick={() => setRejectingLead(null)}
                            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                        />

                        {/* Modal Box */}
                        <motion.div 
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-white border border-slate-100 w-full max-w-sm rounded-xl p-5 relative z-10 shadow-2xl space-y-3.5"
                        >
                            <div className="flex justify-between items-start gap-2">
                                <div className="flex items-center gap-2.5">
                                    <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center text-[#E31E24] shrink-0">
                                        <AlertCircle className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-800 text-xs">Reject & Refund Lead</h3>
                                        <p className="text-[9px] text-slate-400 font-bold mt-0.5 leading-none">Lead: {rejectingLead.vehicleInfo}</p>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => setRejectingLead(null)}
                                    className="p-1 rounded text-slate-400 hover:text-slate-650 hover:bg-slate-50 transition-all shrink-0"
                                >
                                    <X className="w-3.5 h-3.5" />
                                </button>
                            </div>

                            <form onSubmit={handleRejectSubmit} className="space-y-3">
                                <div className="space-y-1.5">
                                    <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">
                                        Why are you rejecting this lead?
                                    </label>
                                    <textarea 
                                        value={rejectionReason}
                                        onChange={(e) => setRejectionReason(e.target.value)}
                                        rows={3}
                                        placeholder="Detailed reason is required for refund validation."
                                        className="w-full bg-slate-50 border border-slate-200 focus:border-[#E31E24] rounded-lg p-2.5 text-[11px] text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#E31E24] transition-all placeholder:text-slate-400"
                                    />
                                    <p className="text-[9px] text-slate-400 leading-normal">
                                        *Lead returns to marketplace and a refund request of <strong>₹{rejectingLead.amount}</strong> will be submitted to the ScrapCentre admin.
                                    </p>
                                </div>

                                {rejectError && (
                                    <div className="bg-red-50 border border-red-100 text-red-600 text-[10px] p-2 rounded-lg flex items-center gap-1.5">
                                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                                        <span className="font-semibold">{rejectError}</span>
                                    </div>
                                )}

                                <div className="flex gap-2.5 pt-1">
                                    <button 
                                        type="button"
                                        onClick={() => setRejectingLead(null)}
                                        className="flex-1 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 font-bold text-[10px] rounded-lg active:scale-[0.98] transition-all"
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        type="submit"
                                        disabled={actionLoadingId === rejectingLead._id}
                                        className="flex-1 py-1.5 bg-[#E31E24] hover:bg-[#c9181d] text-white font-bold text-[10px] rounded-lg active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-wait flex items-center justify-center gap-1 shadow-sm shadow-red-600/5"
                                    >
                                        {actionLoadingId === rejectingLead._id ? (
                                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                        ) : (
                                            <Trash2 className="w-3.5 h-3.5" />
                                        )}
                                        Confirm
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* ── CC OPERATOR ASSIGNMENT MODAL ─────────────────────── */}
            <AnimatePresence>
                {assigningLead && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        {/* Backdrop */}
                        <motion.div 
                            initial={{ opacity: 0 }} 
                            animate={{ opacity: 1 }} 
                            exit={{ opacity: 0 }}
                            onClick={() => setAssigningLead(null)}
                            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                        />

                        {/* Modal Box */}
                        <motion.div 
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-white border border-slate-100 w-full max-w-md rounded-xl p-5 relative z-10 shadow-2xl space-y-3.5"
                        >
                            <div className="flex justify-between items-start gap-2">
                                <div className="flex items-center gap-2.5">
                                    <div className="w-8 h-8 rounded-lg bg-[#E31E24]/5 border border-[#E31E24]/10 flex items-center justify-center text-[#E31E24] shrink-0">
                                        <Building2 className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-800 text-xs">Assign Lead to Collection Center</h3>
                                        <p className="text-[9px] text-slate-400 font-bold mt-0.5 leading-none">Vehicle: {assigningLead.vehicleInfo}</p>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => setAssigningLead(null)}
                                    className="p-1 rounded text-slate-400 hover:text-slate-650 hover:bg-slate-50 transition-all shrink-0"
                                >
                                    <X className="w-3.5 h-3.5" />
                                </button>
                            </div>

                            {ccsLoading ? (
                                <div className="flex flex-col items-center justify-center py-8 gap-2">
                                    <Loader2 className="w-6 h-6 animate-spin text-[#E31E24]" />
                                    <p className="text-[10px] text-slate-450 uppercase font-black tracking-wider">Calculating distances...</p>
                                </div>
                            ) : !ccsList || ccsList.length === 0 ? (
                                <div className="text-center py-6">
                                    <p className="text-xs font-bold text-slate-400">No Collection Centers registered.</p>
                                    <p className="text-[9px] text-slate-400 mt-1">Please add a Collection Center from the sidebar first.</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block">
                                            Select Nearest Collection Center
                                        </label>
                                        <div className="max-h-[220px] overflow-y-auto space-y-2 pr-1 scrollbar-hide">
                                            {ccsList.map((cc) => (
                                                <div 
                                                    key={cc._id}
                                                    onClick={() => setSelectedCcId(cc._id)}
                                                    className={`border rounded-xl p-3 flex justify-between items-center cursor-pointer transition-all duration-200 ${selectedCcId === cc._id ? 'border-[#E31E24] bg-[#E31E24]/5' : 'border-slate-100 hover:border-slate-300'}`}
                                                >
                                                    <div className="space-y-0.5">
                                                        <p className="font-bold text-xs text-slate-800">{cc.name}</p>
                                                        <p className="text-[10px] font-medium text-slate-405">{cc.city}, {cc.state} ({cc.pincode})</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <span className="text-[10px] font-black text-slate-500 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-full whitespace-nowrap">
                                                            {cc.distanceKm !== null ? `${cc.distanceKm} km` : "N/A"}
                                                        </span>
                                                        <p className="text-[8px] font-bold text-slate-400 mt-0.5">Radius: {cc.catchmentRadius}km</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="flex gap-2.5 pt-1">
                                        <button 
                                            type="button"
                                            onClick={() => setAssigningLead(null)}
                                            className="flex-1 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 font-bold text-[10px] rounded-lg active:scale-[0.98] transition-all"
                                        >
                                            Cancel
                                        </button>
                                        <button 
                                            onClick={handleAssignConfirm}
                                            disabled={isAssigningSubmit || !selectedCcId}
                                            className="flex-1 py-1.5 bg-[#E31E24] hover:bg-[#c9181d] text-white font-bold text-[10px] rounded-lg active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1 shadow-sm shadow-red-600/5"
                                        >
                                            {isAssigningSubmit ? (
                                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                            ) : (
                                                <Building2 className="w-3.5 h-3.5" />
                                            )}
                                            Confirm Assignment
                                        </button>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    )
}

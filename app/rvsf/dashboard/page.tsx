"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { 
    Building2, ArrowRight, Loader2, Calendar, Check, X, 
    MessageSquare, AlertCircle, Sparkles, ShieldCheck, Mail, Phone, 
    Car, Trash2, Clock, Landmark
} from "lucide-react"

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
    status: "pending_decision" | "accepted" | "rejected"
    chatThreadId?: string | null
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
            <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-[#E31E24]" />
            </div>
        )
    }

    const pendingLeads = unlockedLeads.filter(l => l.status === "pending_decision")
    const activeLeads = unlockedLeads.filter(l => l.status === "accepted")

    return (
        <div className="space-y-8 max-w-6xl">
            {/* Welcome banner */}
            <motion.div 
                initial={{ opacity: 0, y: -10 }} 
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-r from-[#E31E24]/10 to-slate-900/50 border border-[#E31E24]/20 rounded-2xl p-6 relative overflow-hidden"
            >
                <div className="absolute right-4 top-4 opacity-10">
                    <Sparkles className="w-24 h-24 text-white" />
                </div>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">Welcome back</p>
                <h1 className="text-3xl font-extrabold text-white">{stats?.name || session?.user?.name}</h1>
                <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">RVSF ID:</span>
                    <span className="text-sm font-mono font-bold text-[#E31E24] bg-[#E31E24]/10 px-3 py-0.5 rounded-full border border-[#E31E24]/20">
                        {stats?.rvsfId || (session?.user as any)?.rvsfId || "—"}
                    </span>
                </div>
            </motion.div>

            {/* Error Message */}
            {dashboardError && (
                <div className="bg-red-500/10 border border-red-500/30 text-red-200 p-4 rounded-xl flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
                    <p className="text-sm font-medium">{dashboardError}</p>
                </div>
            )}

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <motion.div 
                    initial={{ opacity: 0, y: 10 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    transition={{ delay: 0.1 }}
                    className="bg-[#0E192D]/60 backdrop-blur border border-slate-800 rounded-2xl p-6"
                >
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                            <Building2 className="w-5 h-5 text-blue-400" />
                        </div>
                        <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Centers</span>
                    </div>
                    <p className="text-4xl font-extrabold text-white">{stats?.totalCCs ?? "0"}</p>
                    <p className="text-sm text-slate-400 mt-1 font-medium">Collection Centers</p>
                </motion.div>

                <motion.div 
                    initial={{ opacity: 0, y: 10 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    transition={{ delay: 0.15 }}
                    className="bg-[#0E192D]/60 backdrop-blur border border-slate-800 rounded-2xl p-6"
                >
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-10 h-10 rounded-xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center">
                            <Clock className="w-5 h-5 text-yellow-400" />
                        </div>
                        <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Unresolved</span>
                    </div>
                    <p className="text-4xl font-extrabold text-white">{pendingLeads.length}</p>
                    <p className="text-sm text-slate-400 mt-1 font-medium">Leads Awaiting Decision</p>
                </motion.div>

                <motion.div 
                    initial={{ opacity: 0, y: 10 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    transition={{ delay: 0.2 }}
                    className="bg-[#0E192D]/60 backdrop-blur border border-slate-800 rounded-2xl p-6"
                >
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                            <ShieldCheck className="w-5 h-5 text-emerald-400" />
                        </div>
                        <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Active</span>
                    </div>
                    <p className="text-4xl font-extrabold text-white">{activeLeads.length}</p>
                    <p className="text-sm text-slate-400 mt-1 font-medium">Active Leads Under Scraping</p>
                </motion.div>
            </div>

            {/* Quick Actions / Link */}
            <div className="flex flex-wrap gap-4">
                <Link href="/rvsf/ccs">
                    <button className="flex items-center gap-3 px-6 py-3.5 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 text-blue-400 hover:text-blue-300 rounded-2xl font-bold transition-all group">
                        <Building2 className="w-5 h-5" />
                        Manage Collection Centers
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                </Link>
                <Link href="/rvsf/marketplace">
                    <button className="flex items-center gap-3 px-6 py-3.5 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 text-purple-400 hover:text-purple-300 rounded-2xl font-bold transition-all group">
                        <Sparkles className="w-5 h-5" />
                        Explore Lead Marketplace
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                </Link>
            </div>

            <hr className="border-slate-800" />

            {/* ── SECTION 1: MY UNLOCKED LEADS ───────────────────────── */}
            <div className="space-y-4">
                <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
                    <h2 className="text-xl font-bold text-white tracking-tight">My Unlocked Leads</h2>
                    <span className="text-xs font-bold text-yellow-500 bg-yellow-500/10 border border-yellow-500/20 px-2 py-0.5 rounded-full">
                        {pendingLeads.length} Awaiting Decision
                    </span>
                </div>

                {pendingLeads.length === 0 ? (
                    <div className="bg-[#0E192D]/20 border border-slate-800/80 border-dashed rounded-2xl p-8 text-center">
                        <p className="text-slate-400 font-medium">No unlocked leads awaiting your decision.</p>
                        <p className="text-xs text-slate-500 mt-1">Unlock hot leads within your coverage radius via the Marketplace!</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {pendingLeads.map(lead => (
                            <motion.div 
                                key={lead._id}
                                layout
                                className="bg-[#0E192D]/60 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between"
                            >
                                <div className="space-y-3">
                                    <div className="flex justify-between items-start">
                                        <h3 className="font-bold text-white text-base group-hover:text-purple-400 transition-colors">
                                            {lead.vehicleInfo || "Vehicle Details"}
                                        </h3>
                                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300 uppercase">
                                            {lead.leadSource}
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-2 text-xs text-slate-400">
                                        <Clock className="w-3.5 h-3.5 text-slate-500" />
                                        <span>Unlocked: {new Date(lead.unlockedAt).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</span>
                                    </div>

                                    {/* Obfuscated contact or locked indicator */}
                                    <div className="bg-slate-900/50 border border-slate-800/40 rounded-xl p-3 space-y-1.5 text-xs text-slate-400">
                                        <div className="flex items-center gap-2">
                                            <Mail className="w-3.5 h-3.5 text-slate-500" />
                                            <span className="filter blur-[3px]">xxxx@xxxx.com</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Phone className="w-3.5 h-3.5 text-slate-500" />
                                            <span className="filter blur-[3px]">+91 xxxxxxxxxx</span>
                                        </div>
                                        <div className="mt-1 pt-1.5 border-t border-slate-800/50 text-[10px] text-yellow-500/80 font-medium">
                                            *Accept the lead to reveal customer contact info and open chat thread.
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-2 mt-4 pt-3 border-t border-slate-800/40">
                                    <button 
                                        onClick={() => handleAccept(lead._id)}
                                        disabled={actionLoadingId === lead._id}
                                        className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-wait"
                                    >
                                        {actionLoadingId === lead._id ? (
                                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                        ) : (
                                            <Check className="w-3.5 h-3.5" />
                                        )}
                                        Accept Lead
                                    </button>
                                    <button 
                                        onClick={() => openRejectModal(lead)}
                                        disabled={actionLoadingId === lead._id}
                                        className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 hover:border-red-500/30 text-red-400 hover:text-red-300 font-bold text-xs rounded-xl active:scale-[0.98] transition-all disabled:opacity-50"
                                    >
                                        <X className="w-3.5 h-3.5" />
                                        Reject / Refund
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>

            {/* ── SECTION 2: ACTIVE LEADS ────────────────────────────── */}
            <div className="space-y-4 pt-4">
                <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    <h2 className="text-xl font-bold text-white tracking-tight">Active Leads</h2>
                    <span className="text-xs font-bold text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                        {activeLeads.length} Scrap Operations
                    </span>
                </div>

                {activeLeads.length === 0 ? (
                    <div className="bg-[#0E192D]/20 border border-slate-800/80 border-dashed rounded-2xl p-8 text-center">
                        <p className="text-slate-400 font-medium">No active leads under operation.</p>
                        <p className="text-xs text-slate-500 mt-1">Accept unlocked leads above to initiate direct chats and tow pickups!</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {activeLeads.map(lead => (
                            <motion.div 
                                key={lead._id}
                                layout
                                className="bg-[#0E192D]/60 border border-slate-800 hover:border-emerald-500/20 rounded-2xl p-5 flex flex-col justify-between transition-all"
                            >
                                <div className="space-y-3">
                                    <div className="flex justify-between items-start">
                                        <h3 className="font-bold text-white text-base">
                                            {lead.vehicleInfo || "Vehicle Details"}
                                        </h3>
                                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase">
                                            Active
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-2 text-xs text-slate-400">
                                        <Calendar className="w-3.5 h-3.5 text-slate-500" />
                                        <span>Accepted Lead</span>
                                    </div>

                                    {/* Unveiled Contact details */}
                                    <div className="bg-slate-900/40 border border-emerald-500/10 rounded-xl p-3.5 space-y-2 text-xs text-slate-300">
                                        <p className="font-semibold text-slate-200 pb-1.5 border-b border-slate-800 flex items-center gap-1.5">
                                            <Car className="w-4 h-4 text-emerald-400" />
                                            {lead.customerName || "Customer Details"}
                                        </p>
                                        <div className="flex items-center gap-2">
                                            <Mail className="w-3.5 h-3.5 text-slate-500" />
                                            <span>{lead.customerEmail || "No Email Provided"}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Phone className="w-3.5 h-3.5 text-slate-500" />
                                            <span>{lead.customerPhone || "No Phone Provided"}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-2 mt-4 pt-3 border-t border-slate-800/40">
                                    <Link href={lead.chatThreadId ? `/rvsf/chat/${lead.chatThreadId}` : "/rvsf/chats"} className="w-full">
                                        <button className="w-full flex items-center justify-center gap-2 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl active:scale-[0.98] transition-all">
                                            <MessageSquare className="w-4 h-4" />
                                            Open Chat
                                        </button>
                                    </Link>
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
                            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                        />

                        {/* Modal Box */}
                        <motion.div 
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-[#0E192D] border border-slate-800 w-full max-w-md rounded-2xl p-6 relative z-10 shadow-2xl space-y-4"
                        >
                            <div className="flex justify-between items-start">
                                <div className="flex items-center gap-2.5">
                                    <div className="w-9 h-9 rounded-lg bg-red-500/10 flex items-center justify-center text-red-400">
                                        <AlertCircle className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h3 className="font-extrabold text-white text-base">Reject & Refund Lead</h3>
                                        <p className="text-[11px] text-slate-400 font-medium">Lead: {rejectingLead.vehicleInfo}</p>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => setRejectingLead(null)}
                                    className="p-1 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-slate-800/50 transition-all"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            <form onSubmit={handleRejectSubmit} className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                                        Why are you rejecting this lead?
                                    </label>
                                    <textarea 
                                        value={rejectionReason}
                                        onChange={(e) => setRejectionReason(e.target.value)}
                                        rows={4}
                                        placeholder="Please provide a clear and detailed reason for rejection. This is required for refund processing."
                                        className="w-full bg-slate-900 border border-slate-800 focus:border-red-500 rounded-xl p-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-red-500 transition-all placeholder:text-slate-600"
                                    />
                                    <p className="text-[10px] text-slate-500 leading-normal">
                                        *Upon submission, this lead status reverts back to the marketplace. A refund request of <strong>₹{rejectingLead.amount}</strong> will be submitted to the ScrapCentre admin for validation.
                                    </p>
                                </div>

                                {rejectError && (
                                    <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-xs p-3 rounded-lg flex items-center gap-2">
                                        <AlertCircle className="w-4 h-4 shrink-0" />
                                        <span>{rejectError}</span>
                                    </div>
                                )}

                                <div className="flex gap-2.5 pt-2">
                                    <button 
                                        type="button"
                                        onClick={() => setRejectingLead(null)}
                                        className="flex-1 py-2.5 bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-300 font-bold text-xs rounded-xl active:scale-[0.98] transition-all"
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        type="submit"
                                        disabled={actionLoadingId === rejectingLead._id}
                                        className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-wait flex items-center justify-center gap-1.5"
                                    >
                                        {actionLoadingId === rejectingLead._id ? (
                                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                        ) : (
                                            <Trash2 className="w-3.5 h-3.5" />
                                        )}
                                        Confirm Rejection
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

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
    TrendingUp,
    MessageSquare,
    Mail
} from "lucide-react"
import { Plus_Jakarta_Sans } from "next/font/google"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"

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
    customerEmail?: string
    assignedAt: string
    pickupStatus?: string
    status: string
    chatThreadId?: string | null
    regNo?: string
    brand?: string
    model?: string
    year?: string
    fuel?: string | string[]
    kms?: string
    weight?: string
    desiredCompany?: string
    desiredModel?: string
}

function getCategoryBadge(lead: AssignedLead) {
    const source = lead.leadSource
    if (source === "ExchangeVehicle") {
        return { label: "Scrap&Buy", color: "text-purple-700 bg-purple-50 border-purple-100" }
    } else if (source === "BuyVehicle") {
        return { label: "Buy", color: "text-orange-700 bg-orange-50 border-orange-100" }
    } else if (source === "WizardLead") {
        if (lead.desiredCompany) {
            return { label: "Scrap&Buy", color: "text-purple-700 bg-purple-50 border-purple-100" }
        }
        return { label: "Srap", color: "text-blue-700 bg-blue-50 border-blue-100" }
    } else {
        return { label: "Srap", color: "text-blue-700 bg-blue-50 border-blue-100" }
    }
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
    const [actionLoadingId, setActionLoadingId] = useState<string | null>(null)

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

    const handleDirectPickupUpdate = async (leadId: string) => {
        setActionLoadingId(leadId)
        try {
            const res = await fetch(`/api/cc/leads/${leadId}/status`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ pickupStatus: "Vehicle Picked Up" })
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.message || "Failed to update status")

            setLeads(prev => 
                prev.map(l => l._id === leadId ? { ...l, pickupStatus: "Vehicle Picked Up", status: "vehicle_picked_up" } : l)
            )

            toast({
                title: "Status Updated Successfully",
                description: "Vehicle status set to Picked Up",
            })
        } catch (err: any) {
            console.error("Status update error:", err)
            toast({
                title: "Error Updating Status",
                description: err.message || "An unexpected error occurred",
                variant: "destructive"
            })
        } finally {
            setActionLoadingId(null)
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
                    </div>                    {leads.length === 0 ? (
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
                                            <div className="space-y-1">
                                                {lead.chatThreadId !== undefined && (() => {
                                                    const cat = getCategoryBadge(lead)
                                                    return (
                                                        <span className={`inline-block text-[8px] font-bold px-2 py-0.5 rounded-full border ${cat.color} mb-1`}>
                                                            {cat.label}
                                                        </span>
                                                    )
                                                })()}
                                                <h3 className="font-extrabold text-slate-850 text-xs leading-normal">
                                                    {lead.vehicleInfo || "Vehicle Information"}
                                                </h3>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-medium">
                                            <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                            <span>Assigned: {new Date(lead.assignedAt).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</span>
                                        </div>

                                        {(lead.regNo || lead.brand || lead.model || lead.year || lead.fuel || lead.kms || lead.weight || lead.desiredCompany) && (
                                            <div className="mt-2.5 text-[10px] bg-slate-50 border border-slate-100 rounded-lg p-2.5 space-y-1.5">
                                                <p className="font-bold text-slate-855 pb-1 border-b border-slate-200/50 flex items-center gap-1">
                                                    <Car className="w-3.5 h-3.5 text-slate-450 shrink-0" />
                                                    Vehicle Information
                                                </p>
                                                <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-slate-655">
                                                    {lead.regNo && (
                                                        <div>
                                                            <span className="text-slate-400 font-medium">Reg No: </span>
                                                            <span className="font-bold uppercase tracking-wider">{lead.regNo}</span>
                                                        </div>
                                                    )}
                                                    {lead.brand && (
                                                        <div>
                                                            <span className="text-slate-400 font-medium">Brand: </span>
                                                            <span className="font-bold">{lead.brand}</span>
                                                        </div>
                                                    )}
                                                    {lead.model && (
                                                        <div>
                                                            <span className="text-slate-400 font-medium">Model: </span>
                                                            <span className="font-bold">{lead.model}</span>
                                                        </div>
                                                    )}
                                                    {lead.year && (
                                                        <div>
                                                            <span className="text-slate-400 font-medium">Year: </span>
                                                            <span className="font-bold">{lead.year}</span>
                                                        </div>
                                                    )}
                                                    {lead.fuel && (
                                                        <div>
                                                            <span className="text-slate-400 font-medium">Fuel: </span>
                                                            <span className="font-bold">{Array.isArray(lead.fuel) ? lead.fuel.join(', ') : lead.fuel}</span>
                                                        </div>
                                                    )}
                                                    {lead.kms && (
                                                        <div>
                                                            <span className="text-slate-400 font-medium">Odometer: </span>
                                                            <span className="font-bold">{lead.kms} KM</span>
                                                        </div>
                                                    )}
                                                    {lead.weight && (
                                                        <div>
                                                            <span className="text-slate-400 font-medium">Weight: </span>
                                                            <span className="font-bold">{lead.weight} kg</span>
                                                        </div>
                                                    )}
                                                    {lead.desiredCompany && (
                                                        <div className="col-span-2 pt-1.5 border-t border-slate-200/50 mt-1">
                                                            <span className="text-slate-450 font-bold uppercase tracking-wider text-[8px]">Exchange For:</span>
                                                            <p className="font-bold text-slate-800 mt-0.5">{lead.desiredCompany} {lead.desiredModel || ""}</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        {/* Contact & Location Details */}
                                        <div className="bg-slate-50 border border-slate-100 rounded-lg p-3 space-y-1.5 text-[11px] text-slate-650">
                                            <p className="font-bold text-slate-800 pb-1 border-b border-slate-200/50 flex items-center gap-1.5">
                                                <User className="w-3.5 h-3.5 text-[#E31E24] shrink-0" />
                                                {lead.customerName || "Customer Details"}
                                            </p>
                                            {lead.chatThreadId !== undefined && lead.customerEmail && (
                                                <div className="flex items-center gap-2 mt-1">
                                                    <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                                    <span className="font-medium select-all text-slate-800">{lead.customerEmail}</span>
                                                </div>
                                            )}
                                            <div className="flex items-center gap-2">
                                                <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                                <span className="font-mono font-bold select-all text-slate-800">{lead.customerPhone || "No Phone Number"}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-4 pt-3 border-t border-slate-100 flex gap-2">
                                        {(lead.pickupStatus === "Vehicle Picked Up" || lead.pickupStatus === "Vehicle at CC Yard" || lead.pickupStatus === "Weighing Done") ? (
                                            <div className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-emerald-50 border border-emerald-100 text-emerald-700 font-extrabold text-[10px] uppercase tracking-wider rounded-lg">
                                                <Check className="w-3.5 h-3.5" />
                                                Vehicle Picked Up
                                            </div>
                                        ) : (
                                            <button 
                                                onClick={() => handleDirectPickupUpdate(lead._id)}
                                                disabled={actionLoadingId === lead._id}
                                                className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-slate-900 hover:bg-black text-white font-extrabold text-[10px] uppercase tracking-wider rounded-lg active:scale-[0.98] transition-all disabled:opacity-50"
                                            >
                                                {actionLoadingId === lead._id ? (
                                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                                ) : (
                                                    <Clock className="w-3.5 h-3.5" />
                                                )}
                                                Vehicle Picked Up
                                            </button>
                                        )}
                                        {lead.chatThreadId && (
                                            <Link href={`/cc/chat/${lead.chatThreadId}`} className="flex-1">
                                                <button 
                                                    className="w-full flex items-center justify-center gap-1.5 py-2 bg-[#E31E24] hover:bg-[#c9181d] text-white font-extrabold text-[10px] uppercase tracking-wider rounded-lg active:scale-[0.98] transition-all h-full"
                                                >
                                                    <MessageSquare className="w-3.5 h-3.5" />
                                                    Chat
                                                </button>
                                            </Link>
                                        )}
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </div>
    )
}

"use client"

import { useEffect, useState, use } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { 
    Car, 
    User, 
    MapPin, 
    ChevronLeft, 
    CheckCircle, 
    Trash2, 
    Phone, 
    Hash, 
    Weight, 
    ShoppingCart, 
    MessageCircle, 
    Sparkles, 
    Send, 
    Fuel, 
    Scale, 
    Calendar, 
    Building, 
    MoreHorizontal, 
    ShieldCheck,
    Info,
    Globe
} from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
import { motion } from "framer-motion"
import { Plus_Jakarta_Sans } from "next/font/google"

const plusJakartaSans = Plus_Jakarta_Sans({
    subsets: ["latin"],
    weight: ["400", "500", "600", "700", "800"],
})

export default function ScrapBuyDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter()
    const searchParams = useSearchParams()
    const highlight = searchParams.get("highlight") === "true"
    const { toast } = useToast()
    const { id } = use(params)
    const [request, setRequest] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [showMoreMenu, setShowMoreMenu] = useState(false)

    useEffect(() => {
        fetchRequest()
    }, [id])

    const fetchRequest = async () => {
        try {
            const res = await fetch(`/api/admin/valuations/scrap-buy/${id}`)
            if (res.ok) {
                const data = await res.json()
                setRequest(data)
            } else {
                toast({
                    title: "Error",
                    description: "Failed to load request details",
                    variant: "destructive"
                })
            }
        } catch (error) {
            toast({
                title: "Error",
                description: "Something went wrong",
                variant: "destructive"
            })
        } finally {
            setLoading(false)
        }
    }

    const handleStatusUpdate = async (newStatus: string) => {
        if (!confirm(`Confirm status transition to ${newStatus.toUpperCase()}?`)) return

        try {
            const res = await fetch("/api/admin/requests/approve", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id: id, type: "scrap-buy", status: newStatus })
            })

            if (res.ok) {
                toast({
                    title: "Status Updated",
                    description: `Lead status has been successfully transitioned to ${newStatus}.`
                })
                fetchRequest()
            } else {
                toast({
                    title: "Error",
                    description: "Failed to update lead status.",
                    variant: "destructive"
                })
            }
        } catch (error) {
            toast({
                title: "Error",
                description: "Critical failure during status update.",
                variant: "destructive"
            })
        }
    }

    const handleDelete = async () => {
        if (!confirm("Are you sure you want to delete this request? This action cannot be undone.")) return

        try {
            const res = await fetch(`/api/admin/requests/delete?id=${id}&type=scrap-buy`, {
                method: "DELETE"
            })

            if (res.ok) {
                toast({
                    title: "Success",
                    description: "Request deleted successfully"
                })
                router.push("/admin/valuations/scrap-buy")
            } else {
                toast({
                    title: "Error",
                    description: "Failed to delete request",
                    variant: "destructive"
                })
            }
        } catch (error) {
            toast({
                title: "Error",
                description: "Something went wrong",
                variant: "destructive"
            })
        }
    }

    function getStatusBadge(status: string) {
        switch (status) {
            case "pending":
                return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-yellow-50 text-yellow-700 border border-yellow-100">Pending</span>
            case "reviewed":
            case "reviewing":
                return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#EFF6FF] text-[#3B82F6] border border-[#DBEAFE]">Reviewing</span>
            case "completed":
                return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-green-50 text-green-700 border border-green-100">Completed</span>
            case "rejected":
                return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-50 text-red-700 border border-red-100">Rejected</span>
            case "approved":
                return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-100">Approved to Personal Lead</span>
            case "approved_to_rvsf":
                return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-purple-50 text-purple-700 border border-purple-100">Approved to RVSF's</span>
            default:
                return <span className="px-3 py-1 rounded-full bg-gray-50 text-gray-700 border border-gray-100 text-xs font-bold uppercase">{status}</span>
        }
    }

    if (loading) {
        return (
            <div className={`flex items-center justify-center min-h-[400px] ${plusJakartaSans.className}`}>
                <div className="flex flex-col items-center gap-3">
                    <div className="w-8 h-8 border-4 border-purple-650 border-t-transparent rounded-full animate-spin"></div>
                    <div className="text-gray-500 text-sm font-semibold">Loading details...</div>
                </div>
            </div>
        )
    }

    if (!request) {
        return (
            <div className={`flex flex-col items-center justify-center min-h-[400px] p-6 bg-white dark:bg-[#0E192D] rounded-2xl border border-slate-100 dark:border-slate-800 text-center ${plusJakartaSans.className}`}>
                <p className="text-slate-505 dark:text-slate-400 font-bold mb-2">Lead details not found.</p>
                <Link href="/admin" className="text-xs font-bold text-purple-650 hover:text-purple-700 uppercase tracking-widest">Back to Dashboard</Link>
            </div>
        )
    }

    return (
        <div className={`min-h-screen bg-[#F8FAFC] dark:bg-[#070e1a] p-4 md:p-6 lg:p-8 space-y-5 max-w-7xl mx-auto ${plusJakartaSans.className}`}>
            
            {/* Back Button */}
            <div className="flex items-center mb-1">
                <Link 
                    href="/admin" 
                    className="group flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors uppercase tracking-wider"
                >
                    <ChevronLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
                    Back to Leads
                </Link>
            </div>

            {/* Header Section */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                <div className="space-y-1.5">
                    <h1 className="text-xl md:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                        Scrap &amp; Buy New — Lead Details
                    </h1>
                    <div className="flex flex-wrap items-center gap-3">
                        {getStatusBadge(request.status || "pending")}
                        <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 font-mono tracking-wider">
                            Lead ID: <span className="text-slate-500 dark:text-slate-400">{request._id}</span>
                        </span>
                    </div>
                </div>

                {/* Actions Toolbar */}
                <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
                    {/* Chat with Customer */}
                    <a
                        href={`https://wa.me/${request.phone?.replace(/\D/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 lg:flex-none inline-flex items-center justify-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 border border-emerald-250 text-emerald-650 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 rounded-xl font-bold text-xs shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98]"
                    >
                        <MessageCircle className="w-4 h-4 fill-emerald-100 dark:fill-none" />
                        <span>Chat</span>
                    </a>

                    {/* Approve to Personal Lead */}
                    <button
                        onClick={() => handleStatusUpdate('approved')}
                        disabled={request.status === 'approved'}
                        className={`flex-1 lg:flex-none inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl font-bold text-xs shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98] ${
                            request.status === 'approved' 
                            ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed dark:bg-slate-800 dark:text-slate-600 dark:border-slate-700 hover:scale-100'
                            : 'bg-[#2563EB] text-white hover:bg-[#1D4ED8] hover:shadow-blue-500/10'
                        }`}
                    >
                        <User className="w-4 h-4" />
                        <span>Personal Lead</span>
                    </button>

                    {/* Approve to RVSF's */}
                    <button
                        onClick={() => handleStatusUpdate('approved_to_rvsf')}
                        disabled={request.status === 'approved_to_rvsf'}
                        className={`flex-1 lg:flex-none inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl font-bold text-xs shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98] ${
                            request.status === 'approved_to_rvsf'
                            ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed dark:bg-slate-800 dark:text-slate-600 dark:border-slate-700 hover:scale-100'
                            : 'bg-[#7C3AED] text-white hover:bg-[#6D28D9] hover:shadow-purple-500/10'
                        }`}
                    >
                        <ShieldCheck className="w-4 h-4" />
                        <span>Approve to RVSF's</span>
                    </button>

                    {/* More Actions Dropdown */}
                    <div className="relative flex-1 lg:flex-none">
                        <button
                            onClick={() => setShowMoreMenu(!showMoreMenu)}
                            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl font-bold text-xs shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98]"
                        >
                            <span>More</span>
                            <MoreHorizontal className="w-3.5 h-3.5" />
                        </button>
                        {showMoreMenu && (
                            <>
                                <div className="fixed inset-0 z-10" onClick={() => setShowMoreMenu(false)} />
                                <div className="absolute right-0 mt-2 w-44 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-lg py-1.5 z-20">
                                    <button 
                                        onClick={() => { handleStatusUpdate('reviewing'); setShowMoreMenu(false); }}
                                        className="w-full text-left px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                                    >
                                        Set to Reviewing
                                    </button>
                                    <button 
                                        onClick={() => { handleStatusUpdate('completed'); setShowMoreMenu(false); }}
                                        className="w-full text-left px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                                    >
                                        Set to Completed
                                    </button>
                                    <button 
                                        onClick={() => { handleStatusUpdate('rejected'); setShowMoreMenu(false); }}
                                        className="w-full text-left px-4 py-2 text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20"
                                    >
                                        Set to Rejected
                                    </button>
                                </div>
                            </>
                        )}
                    </div>

                    {/* Delete Lead */}
                    <button
                        onClick={handleDelete}
                        className="flex-1 lg:flex-none inline-flex items-center justify-center gap-2 px-4 py-2 bg-[#FEE2E2] hover:bg-[#FCA5A5] text-[#EF4444] rounded-xl font-bold text-xs shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98]"
                    >
                        <Trash2 className="w-4 h-4" />
                        <span>Delete</span>
                    </button>
                </div>
            </div>

            {/* Banner Section */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-violet-50/70 via-purple-50/40 to-fuchsia-50/20 dark:from-purple-950/15 dark:to-transparent border border-purple-100/60 dark:border-purple-900/30 p-5 md:p-6 flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex items-start gap-3.5 z-10 max-w-xl">
                    <div className="w-10 h-10 rounded-xl bg-purple-600/10 dark:bg-purple-500/20 flex items-center justify-center flex-shrink-0 shadow-sm">
                        <Sparkles className="w-5 h-5 text-purple-600 dark:text-purple-400 animate-pulse" />
                    </div>
                    <div>
                        <h3 className="text-sm md:text-base font-extrabold text-slate-800 dark:text-purple-300">
                            This is a <span className="text-purple-750 font-black dark:text-purple-400">Scrap &amp; Buy New</span> lead —
                        </h3>
                        <p className="text-xs text-slate-505 dark:text-slate-400 mt-0.5 leading-relaxed">
                            the customer wants to scrap their current vehicle <strong className="text-purple-700 dark:text-purple-300 font-bold">and</strong> purchase a new one.
                        </p>
                    </div>
                </div>
                {/* SVG Car Illustration */}
                <div className="relative w-40 h-20 md:w-48 md:h-24 flex-shrink-0 z-10 select-none opacity-85 pointer-events-none">
                    <svg className="w-full h-full text-purple-600 dark:text-purple-500" viewBox="0 0 200 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <ellipse cx="100" cy="85" rx="75" ry="10" fill="rgba(168, 85, 247, 0.12)" />
                        <path d="M140 30h20l10 20h20v5h-20l-10-20h-20V30z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.3" />
                        <circle cx="150" cy="60" r="4" fill="currentColor" opacity="0.3" />
                        <circle cx="165" cy="60" r="4" fill="currentColor" opacity="0.3" />
                        
                        <path d="M30 70h130c5 0 8-3 9-7l7-20c1-3-1-6-4-6h-30c-2-5-6-15-18-17H75c-12 2-16 12-18 17H35c-3 0-5 3-4 6l4 20c1 4 4 7 9 7z" fill="rgba(168, 85, 247, 0.08)" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M60 52h20l3-12c1-3-1-5-4-5H65c-3 0-5 2-5 5l0 12z" fill="rgba(255, 255, 255, 0.5)" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        <circle cx="55" cy="73" r="12" fill="#fff" stroke="currentColor" strokeWidth="2.5" />
                        <circle cx="55" cy="73" r="5" fill="currentColor" />
                        <circle cx="135" cy="73" r="12" fill="#fff" stroke="currentColor" strokeWidth="2.5" />
                        <circle cx="135" cy="73" r="5" fill="currentColor" />
                    </svg>
                </div>
                <div className="absolute top-0 right-0 w-64 h-64 bg-purple-200/20 dark:bg-purple-800/10 rounded-full blur-3xl -z-0 pointer-events-none" />
            </div>

            {/* Grid Area with ultra-clean compact cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

                {/* ── CARD 1: Vehicle to Scrap (Green theme) ── */}
                <div className="bg-white dark:bg-[#0E192D] rounded-2xl border border-slate-100 dark:border-slate-800/80 p-4 md:p-5 shadow-sm transition-all duration-300">
                    <div className="flex items-center gap-2.5 pb-2.5 border-b border-slate-100 dark:border-slate-800">
                        <div className="p-2 bg-[#EFFBF3] dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-lg">
                            <Car className="w-4.5 h-4.5" />
                        </div>
                        <div>
                            <h2 className="text-sm font-extrabold text-slate-800 dark:text-white tracking-tight">
                                Vehicle to Scrap
                            </h2>
                            <div className="h-0.5 w-8 bg-emerald-500 rounded-full mt-1" />
                        </div>
                    </div>

                    <div className="space-y-1 mt-2.5">
                        {[
                            { icon: Hash, label: "Registration No.", value: request.regNo },
                            { icon: Car, label: "Brand", value: request.brand },
                            { icon: Car, label: "Model", value: request.model },
                            { icon: Calendar, label: "Year", value: request.year },
                            { icon: Scale, label: "Weight", value: request.weight },
                            { icon: Fuel, label: "Fuel Type", value: Array.isArray(request.fuel) ? request.fuel.join(", ") : request.fuel },
                        ].map(({ icon: IconComponent, label, value }, index) => (
                            <div 
                                key={label} 
                                className={`flex items-center justify-between py-2 px-3 rounded-xl transition-all duration-200 hover:translate-x-1 border border-transparent group ${
                                    index % 2 === 0 
                                    ? "bg-white dark:bg-slate-900/10" 
                                    : "bg-emerald-50/45 dark:bg-emerald-950/20 border-emerald-100/10 dark:border-emerald-900/10"
                                } hover:bg-emerald-100/40 dark:hover:bg-emerald-900/30 hover:border-emerald-200/20`}
                            >
                                <div className="flex items-center gap-2">
                                    <IconComponent className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-500 dark:group-hover:text-emerald-400 transition-colors" />
                                    <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">{label}</span>
                                </div>
                                <span className="text-xs text-slate-800 dark:text-slate-200 font-black uppercase tracking-wide group-hover:text-emerald-650 dark:group-hover:text-emerald-400 transition-colors">
                                    {value || "N/A"}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ── CARD 2: New Car Desired (Purple theme) ── */}
                <div className="bg-white dark:bg-[#0E192D] rounded-2xl border border-slate-100 dark:border-slate-800/80 p-4 md:p-5 shadow-sm transition-all duration-300">
                    <div className="flex items-center gap-2.5 pb-2.5 border-b border-slate-100 dark:border-slate-800">
                        <div className="p-2 bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 rounded-lg">
                            <ShoppingCart className="w-4.5 h-4.5" />
                        </div>
                        <div>
                            <h2 className="text-sm font-extrabold text-slate-800 dark:text-white tracking-tight">
                                New Car Desired
                            </h2>
                            <div className="h-0.5 w-8 bg-purple-500 rounded-full mt-1" />
                        </div>
                    </div>

                    <div className="space-y-1 mt-2.5">
                        {[
                            { icon: Building, label: "Desired Company", value: request.desiredCompany },
                            { icon: Car, label: "Desired Model", value: request.desiredModel },
                        ].map(({ icon: IconComponent, label, value }, index) => (
                            <div 
                                key={label} 
                                className={`flex items-center justify-between py-2 px-3 rounded-xl transition-all duration-200 hover:translate-x-1 border border-transparent group ${
                                    index % 2 === 0 
                                    ? "bg-white dark:bg-slate-900/10" 
                                    : "bg-purple-50/45 dark:bg-purple-950/20 border-purple-100/10 dark:border-purple-900/10"
                                } hover:bg-purple-100/40 dark:hover:bg-purple-900/30 hover:border-purple-200/20`}
                            >
                                <div className="flex items-center gap-2">
                                    <IconComponent className="w-3.5 h-3.5 text-slate-400 group-hover:text-purple-500 dark:group-hover:text-purple-400 transition-colors" />
                                    <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">{label}</span>
                                </div>
                                <span className="text-xs text-slate-800 dark:text-slate-200 font-black uppercase tracking-wide group-hover:text-purple-650 dark:group-hover:text-purple-400 transition-colors">
                                    {value || "Not specified"}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ── CARD 3: Contact Information (Orange theme) ── */}
                <div className="bg-white dark:bg-[#0E192D] rounded-2xl border border-slate-100 dark:border-slate-800/80 p-4 md:p-5 shadow-sm transition-all duration-300">
                    <div className="flex items-center gap-2.5 pb-2.5 border-b border-slate-100 dark:border-slate-800">
                        <div className="p-2 bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 rounded-lg">
                            <User className="w-4.5 h-4.5" />
                        </div>
                        <div>
                            <h2 className="text-sm font-extrabold text-slate-800 dark:text-white tracking-tight">
                                Contact Information
                            </h2>
                            <div className="h-0.5 w-8 bg-orange-500 rounded-full mt-1" />
                        </div>
                    </div>

                    <div className="space-y-1 mt-2.5">
                        {[
                            { icon: User, label: "Name", value: request.name },
                            { icon: Phone, label: "Phone", value: request.phone, type: "phone" },
                            { icon: MapPin, label: "Pincode", value: request.pincode },
                            { icon: Building, label: "City", value: request.city },
                            { icon: Globe, label: "State", value: request.state }
                        ].map(({ icon: IconComponent, label, value, type }, index) => (
                            <div 
                                key={label} 
                                className={`flex items-center justify-between py-2 px-3 rounded-xl transition-all duration-200 hover:translate-x-1 border border-transparent group ${
                                    index % 2 === 0 
                                    ? "bg-white dark:bg-slate-900/10" 
                                    : "bg-orange-50/45 dark:bg-orange-950/20 border-orange-100/10 dark:border-orange-900/10"
                                } hover:bg-orange-100/40 dark:hover:bg-orange-900/30 hover:border-orange-200/20`}
                            >
                                <div className="flex items-center gap-2">
                                    <IconComponent className="w-3.5 h-3.5 text-slate-400 group-hover:text-orange-500 dark:group-hover:text-orange-400 transition-colors" />
                                    <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">{label}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs text-slate-800 dark:text-slate-200 font-black uppercase tracking-wide group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                                        {value || "N/A"}
                                    </span>
                                    {type === "phone" && value && (
                                        <a 
                                            href={`tel:${value}`} 
                                            className="w-6 h-6 rounded-full bg-orange-100 dark:bg-orange-900/40 text-orange-600 dark:text-orange-400 flex items-center justify-center transition-all hover:scale-110 shadow-sm"
                                            title="Call Customer"
                                        >
                                            <Phone className="w-3 h-3 fill-current" />
                                        </a>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ── CARD 4: WhatsApp (Green theme & illustration) ── */}
                <div className="relative overflow-hidden bg-white dark:bg-[#0E192D] rounded-2xl border border-slate-100 dark:border-slate-800/80 p-4 md:p-5 shadow-sm flex flex-col justify-between">
                    <div>
                        <div className="flex items-center gap-2.5 pb-2.5 border-b border-slate-100 dark:border-slate-800">
                            <div className="p-2 bg-[#EFFBF3] dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-lg">
                                <MessageCircle className="w-4.5 h-4.5" />
                            </div>
                            <div>
                                <h2 className="text-sm font-extrabold text-slate-800 dark:text-white tracking-tight">
                                    WhatsApp
                                </h2>
                                <div className="h-0.5 w-8 bg-emerald-500 rounded-full mt-1" />
                            </div>
                        </div>

                        <div className="py-4 space-y-3 max-w-[280px]">
                            <div>
                                <h3 className="font-extrabold text-xs text-slate-800 dark:text-white">
                                    Connect via WhatsApp
                                </h3>
                                <p className="text-[11px] text-slate-455 dark:text-slate-500 leading-relaxed font-medium mt-0.5">
                                    Click below to open a direct WhatsApp chat with the client
                                </p>
                            </div>
                            <a
                                href={`https://wa.me/${request.phone?.replace(/\D/g, '')}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 font-bold text-[11px] transition-all hover:scale-[1.02] active:scale-[0.98]"
                            >
                                <MessageCircle className="w-3.5 h-3.5 fill-emerald-500/10 dark:fill-none" />
                                <span>Chat on WhatsApp</span>
                            </a>
                        </div>
                    </div>

                    {/* SVG 3D-styled Message Illustration */}
                    <div className="hidden sm:block absolute right-4 bottom-4 w-24 h-24 text-emerald-500/15 dark:text-emerald-400/5 pointer-events-none">
                        <svg className="w-full h-full" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M20 70 L50 85 L80 70 L50 55 Z" fill="currentColor" opacity="0.3" />
                            <path d="M20 70 L50 85 L50 89 L20 74 Z" fill="currentColor" opacity="0.4" />
                            <path d="M80 70 L50 85 L50 89 L80 74 Z" fill="currentColor" opacity="0.2" />
                            <circle cx="50" cy="45" r="18" fill="#10B981" />
                            <path d="M42 53 L38 57 L43 52 Z" fill="#10B981" />
                            <path d="M45 37 C42 37 39 40 39 43 C39 45 40 47 42 48 L41 52 L45 51 C46 51 47 52 48 52 C51 52 53 49 53 46 C53 43 51 37 45 37 Z" fill="#fff" />
                        </svg>
                    </div>
                </div>

            </div>

            {/* Bottom Footer Notice Bar */}
            <div className="flex items-center justify-between px-4 py-3 rounded-2xl bg-blue-50/30 dark:bg-slate-900/30 border border-blue-100/30 dark:border-slate-800/20">
                <div className="flex items-center gap-2 text-[11px] font-bold text-blue-600 dark:text-blue-400">
                    <Info className="w-3.5 h-3.5 shrink-0" />
                    <span>All details are provided by the customer. Please review before proceeding.</span>
                </div>
                <div className="hidden sm:block opacity-10 dark:opacity-5 text-blue-600 dark:text-blue-400">
                    <ShieldCheck className="w-5 h-5" />
                </div>
            </div>

        </div>
    )
}

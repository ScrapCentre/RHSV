"use client"

import { useEffect, useState, use } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { 
    FileText,
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
    Globe,
    ImageIcon,
    Download,
    Mail,
    DollarSign,
    Activity
} from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
import { motion } from "framer-motion"
import { Plus_Jakarta_Sans } from "next/font/google"

const plusJakartaSans = Plus_Jakarta_Sans({
    subsets: ["latin"],
    weight: ["400", "500", "600", "700", "800"],
})

export default function ExecutiveLeadDetailPage({ params }: { params: Promise<{ type: string, id: string }> }) {
    const router = useRouter()
    const searchParams = useSearchParams()
    const { toast } = useToast()
    const { type, id } = use(params)
    const [request, setRequest] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [showMoreMenu, setShowMoreMenu] = useState(false)

    useEffect(() => {
        fetchRequest()
    }, [id])

    const fetchRequest = async () => {
        try {
            const res = await fetch(`/api/admin/valuations/${type}/${id}`)
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
        if (!confirm(`Confirm Executive Authorization for status: ${newStatus.toUpperCase()}?`)) return

        try {
            const res = await fetch("/api/admin/requests/approve", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id: id, type: type, status: newStatus })
            })

            if (res.ok) {
                toast({
                    title: "Authorized",
                    description: `Lead status transitioned to ${newStatus.toUpperCase()} by Executive Command.`
                })
                fetchRequest()
            } else {
                toast({
                    title: "Error",
                    description: "Failed to authorize status transition.",
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
        if (!confirm("WARNING: Permanent Deletion. Proceed?")) return

        try {
            const res = await fetch(`/api/admin/requests/delete?id=${id}&type=${type}`, {
                method: "DELETE"
            })

            if (res.ok) {
                toast({
                    title: "Purged",
                    description: "Lead record permanently removed from database."
                })
                router.push(`/executive/valuations/${type}`)
            } else {
                toast({
                    title: "Error",
                    description: "Failed to purge record.",
                    variant: "destructive"
                })
            }
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to purge record.",
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
                return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-100">Approved to CC</span>
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
                    <div className="w-8 h-8 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                    <div className="text-gray-500 text-sm font-semibold">Loading details...</div>
                </div>
            </div>
        )
    }

    if (!request) {
        return (
            <div className={`flex flex-col items-center justify-center min-h-[400px] p-6 bg-white dark:bg-[#0E192D] rounded-2xl border border-slate-100 dark:border-slate-800 text-center ${plusJakartaSans.className}`}>
                <p className="text-slate-500 dark:text-slate-400 font-bold mb-2">Lead details not found.</p>
                <Link href="/executive/dashboard" className="text-xs font-bold text-red-650 hover:underline uppercase tracking-widest">Return to Dashboard</Link>
            </div>
        )
    }

    // Action Toolbar for Executives
    const ActionToolbar = () => {
        const phoneNo = (request.contact?.phone || request.customerPhone || request.phone || '').replace(/\D/g, '')
        return (
            <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
                {/* Chat with Customer */}
                <a
                    href={`https://wa.me/${phoneNo}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 lg:flex-none inline-flex items-center justify-center gap-2 px-4 py-2 bg-[#10B981] hover:bg-emerald-600 text-white rounded-xl font-bold text-xs shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                    <MessageCircle className="w-4 h-4" />
                    <span>Chat</span>
                </a>

                {/* Approve & Push to CC / RVSF */}
                {request.status === 'approved' ? (
                    <div className="px-4 py-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-550 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center gap-2">
                        <CheckCircle className="w-4 h-4" />
                        Approved to CC
                    </div>
                ) : request.status === 'approved_to_rvsf' ? (
                    <div className="px-4 py-2 bg-purple-500/10 border border-purple-500/30 text-purple-550 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center gap-2">
                        <CheckCircle className="w-4 h-4" />
                        Approved to RVSF's
                    </div>
                ) : (
                    <div className="flex flex-wrap items-center gap-2">
                        <button
                            onClick={() => handleStatusUpdate('approved')}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-all shadow-md active:scale-[0.98]"
                        >
                            <Send className="w-4 h-4" />
                            Approve to CC
                        </button>
                        <button
                            onClick={() => handleStatusUpdate('approved_to_rvsf')}
                            className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-all shadow-md active:scale-[0.98]"
                        >
                            <Send className="w-4 h-4" />
                            Approve to RVSF's
                        </button>
                    </div>
                )}

                {/* Status Dropdown */}
                <div className="flex items-center gap-2 bg-black/10 dark:bg-[#0E192D] p-1.5 rounded-xl border border-slate-200 dark:border-slate-800">
                    <select 
                        value={request.status || "pending"} 
                        onChange={(e) => handleStatusUpdate(e.target.value)}
                        className="bg-transparent text-[10px] font-bold uppercase tracking-[0.2em] text-slate-800 dark:text-white border-none focus:ring-0 cursor-pointer outline-none px-4"
                    >
                        <option value="pending" className="bg-white dark:bg-zinc-900 text-slate-800 dark:text-white">Pending</option>
                        <option value="reviewing" className="bg-white dark:bg-zinc-900 text-slate-800 dark:text-white">Reviewing</option>
                    </select>
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
        )
    }

    // ── VIEW 1: Scrap Only Lead ──
    const QuoteDetailView = () => {
        return (
            <div className={`space-y-5 ${plusJakartaSans.className}`}>
                {/* Banner Section */}
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-50/70 via-teal-50/40 to-cyan-50/20 dark:from-emerald-950/15 dark:to-transparent border border-emerald-100/60 dark:border-emerald-900/30 p-5 md:p-6 flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="flex items-start gap-3.5 z-10 max-w-xl">
                        <div className="w-10 h-10 rounded-xl bg-emerald-600/10 dark:bg-emerald-500/20 flex items-center justify-center flex-shrink-0 shadow-sm">
                            <Sparkles className="w-5 h-5 text-emerald-650 dark:text-emerald-455 animate-pulse" />
                        </div>
                        <div>
                            <h3 className="text-sm md:text-base font-extrabold text-slate-800 dark:text-emerald-300">
                                This is a <span className="text-emerald-700 font-black dark:text-emerald-400">Scrap Only</span> lead —
                            </h3>
                            <p className="text-xs text-slate-505 dark:text-slate-400 mt-0.5 leading-relaxed">
                                the customer wants to scrap their end-of-life vehicle (ELV) and obtain a valid scrap valuation quote.
                            </p>
                        </div>
                    </div>
                    {/* SVG Eco Car */}
                    <div className="relative w-40 h-20 md:w-48 md:h-24 flex-shrink-0 z-10 select-none opacity-85 pointer-events-none">
                        <svg className="w-full h-full text-emerald-600 dark:text-emerald-500" viewBox="0 0 200 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <ellipse cx="100" cy="85" rx="75" ry="10" fill="rgba(16, 185, 129, 0.12)" />
                            <path d="M125 25 C145 25 155 45 145 65 C130 55 125 40 125 25 Z" fill="currentColor" opacity="0.15" />
                            <path d="M30 70h110c4 0 7-3 8-7l6-20c1-3-1-6-4-6h-25c-2-5-5-15-15-17H70c-10 2-13 12-15 17H35c-3 0-5 3-4 6l4 20c1 4 4 7 9 7z" fill="rgba(16, 185, 129, 0.08)" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                            <circle cx="50" cy="73" r="12" fill="#fff" stroke="currentColor" strokeWidth="2.5" />
                            <circle cx="50" cy="73" r="5" fill="currentColor" />
                            <circle cx="120" cy="73" r="12" fill="#fff" stroke="currentColor" strokeWidth="2.5" />
                            <circle cx="120" cy="73" r="5" fill="currentColor" />
                        </svg>
                    </div>
                    <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-200/20 dark:bg-emerald-800/10 rounded-full blur-3xl -z-0 pointer-events-none" />
                </div>

                {/* Grid Area with ultra-clean compact cards */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                    {/* CARD 1: Vehicle Information (Green theme) */}
                    <div className="bg-white dark:bg-[#0E192D] rounded-2xl border border-slate-100 dark:border-slate-800/80 p-4 md:p-5 shadow-sm transition-all duration-300">
                        <div className="flex items-center gap-2.5 pb-2.5 border-b border-slate-100 dark:border-slate-800">
                            <div className="p-2 bg-[#EFFBF3] dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-lg">
                                <Car className="w-4.5 h-4.5" />
                            </div>
                            <div>
                                <h2 className="text-sm font-extrabold text-slate-800 dark:text-white tracking-tight">
                                    Vehicle Information
                                </h2>
                                <div className="h-0.5 w-8 bg-emerald-500 rounded-full mt-1" />
                            </div>
                        </div>

                        <div className="space-y-1 mt-2.5">
                            {[
                                { icon: Building, label: "Type", value: request.vehicleType },
                                { icon: Car, label: "Brand", value: request.brand },
                                { icon: Car, label: "Model", value: request.model },
                                { icon: Calendar, label: "Year", value: request.year },
                                { icon: Hash, label: "Registration No.", value: request.vehicleNumber },
                                { icon: Scale, label: "Weight", value: request.vehicleWeight },
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

                    {/* CARD 2: Contact Information (Orange theme) */}
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
                                { icon: User, label: "Name", value: request.contact?.name },
                                { icon: Phone, label: "Phone", value: request.contact?.phone, type: "phone" },
                                { icon: MapPin, label: "Pincode", value: request.address?.pincode },
                                { icon: Building, label: "City", value: request.address?.city },
                                { icon: Globe, label: "State", value: request.address?.state }
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

                    {/* CARD 3: eKYC Details (Blue theme - Conditional) */}
                    {(request.firstName || request.aadharNumber) && (
                        <div className="bg-white dark:bg-[#0E192D] rounded-2xl border border-slate-100 dark:border-slate-800/80 p-4 md:p-5 shadow-sm transition-all duration-300">
                            <div className="flex items-center gap-2.5 pb-2.5 border-b border-slate-100 dark:border-slate-800">
                                <div className="p-2 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 rounded-lg">
                                    <CheckCircle className="w-4.5 h-4.5" />
                                </div>
                                <div>
                                    <h2 className="text-sm font-extrabold text-slate-800 dark:text-white tracking-tight">
                                        eKYC Verification Details
                                    </h2>
                                    <div className="h-0.5 w-8 bg-blue-500 rounded-full mt-1" />
                                </div>
                            </div>

                            <div className="space-y-1 mt-2.5">
                                {[
                                    { label: "Verified First Name", value: request.firstName },
                                    { label: "Date of Birth", value: request.dob },
                                    { label: "Aadhar Linked Mobile", value: request.aadharPhone },
                                    { label: "Aadhar Card Number", value: request.aadharNumber, mono: true }
                                ].map(({ label, value, mono }, index) => value ? (
                                    <div 
                                        key={label} 
                                        className={`flex items-center justify-between py-2 px-3 rounded-xl transition-all duration-200 hover:translate-x-1 border border-transparent group ${
                                            index % 2 === 0 
                                            ? "bg-white dark:bg-slate-900/10" 
                                            : "bg-blue-50/45 dark:bg-blue-950/20 border-blue-100/10 dark:border-blue-900/10"
                                        } hover:bg-blue-100/40 dark:hover:bg-blue-900/30 hover:border-blue-200/20`}
                                    >
                                        <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">{label}</span>
                                        <span className={`text-xs text-slate-800 dark:text-slate-200 font-black group-hover:text-blue-650 dark:group-hover:text-blue-405 transition-colors ${mono ? "font-mono tracking-wider" : "uppercase"}`}>{value}</span>
                                    </div>
                                ) : null)}
                            </div>
                        </div>
                    )}

                    {/* CARD 4: WhatsApp connect */}
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
                                    href={`https://wa.me/${(request.contact?.phone || '').replace(/\D/g, '')}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 font-bold text-[11px] transition-all hover:scale-[1.02] active:scale-[0.98]"
                                >
                                    <MessageCircle className="w-3.5 h-3.5" />
                                    <span>Chat on WhatsApp</span>
                                </a>
                            </div>
                        </div>

                        {/* SVG Illustration */}
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

                {/* Document Repositories */}
                {(request.aadharFile || request.rcFile || request.carPhoto) && (
                    <div className="bg-white dark:bg-[#0E192D] rounded-2xl border border-slate-100 dark:border-slate-800/80 p-4 md:p-5 shadow-sm">
                        <h2 className="text-sm font-extrabold text-slate-800 dark:text-white tracking-tight pb-2.5 border-b border-slate-100 dark:border-slate-800 mb-4">
                            Document Repositories
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {[
                                { label: 'Aadhar Card', file: request.aadharFile },
                                { label: 'RC Document', file: request.rcFile },
                                { label: 'Asset Photo', file: request.carPhoto }
                            ].map((doc, idx) => doc.file && (
                                <div key={idx} className="p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 rounded-xl flex flex-col justify-between gap-3">
                                    <p className="text-[10px] font-black text-slate-450 dark:text-slate-500 uppercase tracking-widest">{doc.label}</p>
                                    <div className="flex items-center gap-4">
                                        <button
                                            onClick={() => window.open(doc.file, '_blank')}
                                            className="text-[10px] font-black text-blue-500 uppercase hover:underline"
                                        >
                                            View
                                        </button>
                                        <button
                                            onClick={() => window.open(doc.file.replace("/upload/", "/upload/fl_attachment/"), '_blank')}
                                            className="text-[10px] font-black text-slate-500 hover:text-slate-850 dark:text-slate-400 dark:hover:text-white flex items-center gap-1"
                                        >
                                            <Download className="w-3 h-3" />
                                            Download
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        )
    }

    // ── VIEW 2: Scrap & Buy New Lead ──
    const ScrapBuyDetailView = () => {
        return (
            <div className={`space-y-5 ${plusJakartaSans.className}`}>
                {/* Banner Section */}
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-purple-50/70 via-fuchsia-50/40 to-pink-50/20 dark:from-purple-950/15 dark:to-transparent border border-purple-100/60 dark:border-purple-900/30 p-5 md:p-6 flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="flex items-start gap-3.5 z-10 max-w-xl">
                        <div className="w-10 h-10 rounded-xl bg-purple-600/10 dark:bg-purple-500/20 flex items-center justify-center flex-shrink-0 shadow-sm">
                            <Sparkles className="w-5 h-5 text-purple-655 dark:text-purple-455 animate-pulse" />
                        </div>
                        <div>
                            <h3 className="text-sm md:text-base font-extrabold text-slate-800 dark:text-purple-300">
                                This is a <span className="text-purple-707 font-black dark:text-purple-400">Scrap &amp; Buy New</span> lead —
                            </h3>
                            <p className="text-xs text-slate-555 dark:text-slate-400 mt-0.5 leading-relaxed font-semibold">
                                the customer wants to scrap their current vehicle and purchase a new one.
                            </p>
                        </div>
                    </div>
                    {/* SVG Illustration */}
                    <div className="relative w-40 h-20 md:w-48 md:h-24 flex-shrink-0 z-10 select-none opacity-85 pointer-events-none">
                        <svg className="w-full h-full text-purple-600 dark:text-purple-500" viewBox="0 0 200 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <ellipse cx="100" cy="85" rx="75" ry="10" fill="rgba(124, 58, 237, 0.12)" />
                            <path d="M125 25 C145 25 155 45 145 65 Z" fill="currentColor" opacity="0.15" />
                            <circle cx="50" cy="73" r="12" fill="#fff" stroke="currentColor" strokeWidth="2.5" />
                            <circle cx="50" cy="73" r="5" fill="currentColor" />
                            <circle cx="120" cy="73" r="12" fill="#fff" stroke="currentColor" strokeWidth="2.5" />
                            <circle cx="120" cy="73" r="5" fill="currentColor" />
                        </svg>
                    </div>
                    <div className="absolute top-0 right-0 w-64 h-64 bg-purple-200/20 dark:bg-purple-800/10 rounded-full blur-3xl -z-0 pointer-events-none" />
                </div>

                {/* Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                    {/* CARD 1: Vehicle to Scrap (Green theme) */}
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
                                { icon: Hash, label: "Registration No.", value: request.registrationNo },
                                { icon: Car, label: "Brand", value: request.brand },
                                { icon: Car, label: "Model", value: request.model },
                                { icon: Calendar, label: "Year", value: request.year },
                                { icon: Weight, label: "Weight", value: request.vehicleWeight },
                                { icon: Fuel, label: "Fuel Type", value: request.fuelType },
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
                                        {value || "Not specified"}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* CARD 2: New Car Desired (Purple theme) */}
                    <div className="bg-white dark:bg-[#0E192D] rounded-2xl border border-slate-100 dark:border-slate-800/80 p-4 md:p-5 shadow-sm transition-all duration-300">
                        <div className="flex items-center gap-2.5 pb-2.5 border-b border-slate-100 dark:border-slate-800">
                            <div className="p-2 bg-purple-50 dark:bg-purple-950/40 text-purple-650 dark:text-purple-400 rounded-lg">
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

                    {/* CARD 3: Contact Information (Orange theme) */}
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

                    {/* CARD 4: WhatsApp (Green theme & illustration) */}
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
                                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 text-emerald-650 dark:text-emerald-400 font-bold text-[11px] transition-all hover:scale-[1.02] active:scale-[0.98]"
                                >
                                    <MessageCircle className="w-3.5 h-3.5" />
                                    <span>Chat on WhatsApp</span>
                                </a>
                            </div>
                        </div>

                        {/* SVG Illustration */}
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

                {/* Footer Notice Bar */}
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

    // ── VIEW 3: Buy Only Lead ──
    const BuyDetailView = () => {
        return (
            <div className={`space-y-5 ${plusJakartaSans.className}`}>
                {/* Banner Section */}
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-orange-50/70 via-amber-50/40 to-yellow-50/20 dark:from-orange-950/15 dark:to-transparent border border-orange-100/60 dark:border-orange-900/30 p-5 md:p-6 flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="flex items-start gap-3.5 z-10 max-w-xl">
                        <div className="w-10 h-10 rounded-xl bg-orange-600/10 dark:bg-orange-500/20 flex items-center justify-center flex-shrink-0 shadow-sm">
                            <ShoppingCart className="w-5 h-5 text-orange-655 dark:text-orange-400" />
                        </div>
                        <div>
                            <h3 className="text-sm md:text-base font-extrabold text-slate-800 dark:text-orange-300">
                                This is a <span className="text-orange-705 font-black dark:text-orange-400">Buy New Vehicle</span> lead —
                            </h3>
                            <p className="text-xs text-slate-505 dark:text-slate-400 mt-0.5 leading-relaxed font-semibold">
                                the customer is looking to purchase a new vehicle and has specified their budget and brand preferences.
                            </p>
                        </div>
                    </div>
                    {/* SVG Car Purchase */}
                    <div className="relative w-40 h-20 md:w-48 md:h-24 flex-shrink-0 z-10 select-none opacity-85 pointer-events-none">
                        <svg className="w-full h-full text-orange-600 dark:text-orange-500" viewBox="0 0 200 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <ellipse cx="100" cy="85" rx="75" ry="10" fill="rgba(249, 115, 22, 0.12)" />
                            <path d="M140 30h20l10 20h20v5h-20l-10-20h-20V30z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.3" />
                            <path d="M30 70h110c4 0 7-3 8-7l6-20c1-3-1-6-4-6h-25c-2-5-5-15-15-17H70c-10 2-13 12-15 17H35c-3 0-5 3-4 6l4 20c1 4 4 7 9 7z" fill="rgba(249, 115, 22, 0.08)" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                            <circle cx="50" cy="73" r="12" fill="#fff" stroke="currentColor" strokeWidth="2.5" />
                            <circle cx="50" cy="73" r="5" fill="currentColor" />
                            <circle cx="120" cy="73" r="12" fill="#fff" stroke="currentColor" strokeWidth="2.5" />
                            <circle cx="120" cy="73" r="5" fill="currentColor" />
                        </svg>
                    </div>
                    <div className="absolute top-0 right-0 w-64 h-64 bg-orange-200/20 dark:bg-orange-800/10 rounded-full blur-3xl -z-0 pointer-events-none" />
                </div>

                {/* Grid Area with ultra-clean compact cards */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                    {/* CARD 1: Vehicle Preferences (Blue theme) */}
                    <div className="bg-white dark:bg-[#0E192D] rounded-2xl border border-slate-100 dark:border-slate-800/80 p-4 md:p-5 shadow-sm transition-all duration-300">
                        <div className="flex items-center gap-2.5 pb-2.5 border-b border-slate-100 dark:border-slate-800">
                            <div className="p-2 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 rounded-lg">
                                <Car className="w-4.5 h-4.5" />
                            </div>
                            <div>
                                <h2 className="text-sm font-extrabold text-slate-800 dark:text-white tracking-tight">
                                    Vehicle Preferences
                                </h2>
                                <div className="h-0.5 w-8 bg-blue-500 rounded-full mt-1" />
                            </div>
                        </div>

                        <div className="space-y-1 mt-2.5">
                            {[
                                { icon: Building, label: "Preferred Brand", value: request.customBrand || request.vehicleBrand },
                                { icon: Car, label: "Preferred Model", value: request.customModel || request.vehicleModel },
                                { icon: Fuel, label: "Fuel Preference", value: request.fuelType },
                                { icon: DollarSign, label: "Budget Range", value: request.budgetRange },
                            ].map(({ icon: IconComponent, label, value }, index) => (
                                <div 
                                    key={label} 
                                    className={`flex items-center justify-between py-2 px-3 rounded-xl transition-all duration-200 hover:translate-x-1 border border-transparent group ${
                                        index % 2 === 0 
                                        ? "bg-white dark:bg-slate-900/10" 
                                        : "bg-blue-50/45 dark:bg-blue-950/20 border-blue-100/10 dark:border-blue-900/10"
                                    } hover:bg-blue-100/40 dark:hover:bg-blue-900/30 hover:border-blue-200/20`}
                                >
                                    <div className="flex items-center gap-2">
                                        <IconComponent className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors" />
                                        <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">{label}</span>
                                    </div>
                                    <span className="text-xs text-slate-800 dark:text-slate-100 font-extrabold uppercase tracking-wide group-hover:text-blue-655 dark:group-hover:text-blue-400 transition-colors">
                                        {value || "N/A"}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* CARD 2: Contact Information (Orange theme) */}
                    <div className="bg-white dark:bg-[#0E192D] rounded-2xl border border-slate-100 dark:border-slate-800/80 p-4 md:p-5 shadow-sm transition-all duration-300">
                        <div className="flex items-center gap-2.5 pb-2.5 border-b border-slate-100 dark:border-slate-800">
                            <div className="p-2 bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 rounded-lg">
                                <User className="w-4.5 h-4.5" />
                            </div>
                            <div>
                                <h2 className="text-sm font-extrabold text-slate-800 dark:text-white tracking-tight">
                                    Contact &amp; Location
                                </h2>
                                <div className="h-0.5 w-8 bg-orange-500 rounded-full mt-1" />
                            </div>
                        </div>

                        <div className="space-y-1 mt-2.5">
                            {[
                                { icon: User, label: "Name", value: request.customerName },
                                { icon: Phone, label: "Phone", value: request.customerPhone, type: "phone" },
                                { icon: Mail, label: "Email", value: request.customerEmail },
                                { icon: MapPin, label: "Pincode", value: request.pincode },
                                { icon: Building, label: "City", value: request.customCity || request.city },
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
                                        <span className="text-xs text-slate-800 dark:text-slate-100 font-extrabold uppercase tracking-wide group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
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

                    {/* CARD 4: WhatsApp (Green theme & illustration) */}
                    <div className="relative overflow-hidden bg-white dark:bg-[#0E192D] rounded-2xl border border-slate-100 dark:border-slate-800/80 p-4 md:p-5 shadow-sm flex flex-col justify-between lg:col-span-2">
                        <div>
                            <div className="flex items-center gap-2.5 pb-2.5 border-b border-slate-100 dark:border-slate-800">
                                <div className="p-2 bg-[#EFFBF3] dark:bg-emerald-950/40 text-emerald-650 dark:text-emerald-400 rounded-lg">
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
                                    href={`https://wa.me/${request.customerPhone?.replace(/\D/g, '')}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#10B981] hover:bg-emerald-600 text-white rounded-xl font-bold text-xs shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98]"
                                >
                                    <MessageCircle className="w-3.5 h-3.5 fill-emerald-100" />
                                    <span>Chat on WhatsApp</span>
                                </a>
                            </div>
                        </div>

                        {/* SVG Illustration */}
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
            </div>
        )
    }

    return (
        <div className={`min-h-screen bg-[#F8FAFC] dark:bg-[#070e1a] p-4 md:p-6 lg:p-8 space-y-5 max-w-7xl mx-auto ${plusJakartaSans.className}`}>
            {/* Back Button */}
            <div className="flex items-center mb-1">
                <Link 
                    href={`/executive/valuations/${type}`} 
                    className="group flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors uppercase tracking-wider"
                >
                    <ChevronLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
                    Back to Leads
                </Link>
            </div>

            {/* Header Section */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                <div className="space-y-1.5">
                    <h1 className="text-xl md:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                        <FileText className="w-5 h-5 text-blue-500 shrink-0" />
                        LEAD INTELLIGENCE
                    </h1>
                    <div className="flex flex-wrap items-center gap-3">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-50/80 text-blue-600 border border-blue-100">
                            {type === 'quote' ? 'QUOTE' : type === 'scrap-buy' ? 'SCRAP & BUY' : 'BUY'}
                        </span>
                        {getStatusBadge(request.status || "pending")}
                        <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 font-mono tracking-wider">
                            Lead ID: <span className="text-slate-500 dark:text-slate-400">{request._id}</span>
                        </span>
                    </div>
                </div>

                {/* Action Toolbar */}
                <ActionToolbar />
            </div>

            {/* Render Layout dynamically by Type */}
            {type === 'quote' && <QuoteDetailView />}
            {type === 'scrap-buy' && <ScrapBuyDetailView />}
            {type === 'buy' && <BuyDetailView />}

        </div>
    )
}

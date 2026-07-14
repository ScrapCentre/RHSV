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
    Globe,
    ImageIcon,
    Download,
    Pencil,
    X
} from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
import { motion, AnimatePresence } from "framer-motion"
import { Plus_Jakarta_Sans } from "next/font/google"
import { useSession } from "next-auth/react"
import VehiclePhotosSection from "@/components/admin/VehiclePhotosSection"

const plusJakartaSans = Plus_Jakarta_Sans({
    subsets: ["latin"],
    weight: ["400", "500", "600", "700", "800"],
})

export default function ScrapBuyDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { data: session } = useSession()
    const isAdmin = session && (session.user as any)?.role === "admin"
    const router = useRouter()
    const searchParams = useSearchParams()
    const highlight = searchParams.get("highlight") === "true"
    const { toast } = useToast()
    const { id } = use(params)
    const [request, setRequest] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [showMoreMenu, setShowMoreMenu] = useState(false)

    // Edit states
    const [editSection, setEditSection] = useState<"scrap_vehicle" | "desired_vehicle" | "contact" | null>(null)
    const [editForm, setEditForm] = useState<any>({})
    const [isSaving, setIsSaving] = useState(false)

    const openEditModal = (section: "scrap_vehicle" | "desired_vehicle" | "contact") => {
        setEditSection(section)
        if (section === "scrap_vehicle") {
            setEditForm({
                regNo: request.regNo || "",
                brand: request.brand || "",
                model: request.model || "",
                year: request.year || "",
                weight: request.weight || "",
                fuel: Array.isArray(request.fuel) ? request.fuel.join(", ") : request.fuel || "",
            })
        } else if (section === "desired_vehicle") {
            setEditForm({
                desiredCompany: request.desiredCompany || "",
                desiredModel: request.desiredModel || "",
            })
        } else {
            setEditForm({
                name: request.name || "",
                phone: request.phone || "",
                pincode: request.pincode || "",
                city: request.city || "",
                state: request.state || "",
            })
        }
    }

    const handleSave = async () => {
        setIsSaving(true)
        try {
            const body = editSection === "scrap_vehicle"
                ? {
                    regNo: editForm.regNo,
                    brand: editForm.brand,
                    model: editForm.model,
                    year: editForm.year,
                    weight: editForm.weight,
                    fuel: editForm.fuel,
                }
                : editSection === "desired_vehicle"
                ? {
                    desiredCompany: editForm.desiredCompany,
                    desiredModel: editForm.desiredModel,
                }
                : {
                    name: editForm.name,
                    phone: editForm.phone,
                    pincode: editForm.pincode,
                    city: editForm.city,
                    state: editForm.state,
                }

            const res = await fetch(`/api/admin/valuations/scrap-buy/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            })

            if (res.ok) {
                toast({
                    title: "Success",
                    description: "Lead details updated successfully",
                })
                setEditSection(null)
                fetchRequest()
            } else {
                const data = await res.json()
                toast({
                    title: "Error",
                    description: data.error || "Failed to update details",
                    variant: "destructive",
                })
            }
        } catch (error) {
            toast({
                title: "Error",
                description: "Something went wrong",
                variant: "destructive",
            })
        } finally {
            setIsSaving(false)
        }
    }

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
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">                {/* ── CARD 1: Vehicle to Scrap (Green theme) ── */}
                <div className="bg-white dark:bg-[#0E192D] rounded-2xl border border-slate-100 dark:border-slate-800/80 p-4 md:p-5 shadow-sm transition-all duration-300">
                    <div className="flex items-center justify-between pb-2.5 border-b border-slate-100 dark:border-slate-800">
                        <div className="flex items-center gap-2.5">
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
                        {isAdmin && (
                            <button
                                onClick={() => openEditModal("scrap_vehicle")}
                                className="p-1.5 text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-all"
                                title="Edit Scrap Vehicle Info"
                            >
                                <Pencil className="w-4 h-4" />
                            </button>
                        )}
                    </div>

                    <div className="space-y-1 mt-2.5">
                        {[
                            { icon: Hash, label: "Registration No.", value: request.regNo || request.registrationNo },
                            { icon: Car, label: "Brand", value: request.brand },
                            { icon: Car, label: "Model", value: request.model },
                            { icon: Calendar, label: "Year", value: request.year },
                            { icon: Scale, label: "Weight", value: request.weight || request.vehicleWeight },
                            { icon: Fuel, label: "Fuel Type", value: Array.isArray(request.fuel) ? request.fuel.join(", ") : (request.fuel || request.fuelType) },
                            { icon: User, label: "Owner Name", value: request.ownerName },
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
                    <div className="flex items-center justify-between pb-2.5 border-b border-slate-100 dark:border-slate-800">
                        <div className="flex items-center gap-2.5">
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
                        {isAdmin && (
                            <button
                                onClick={() => openEditModal("desired_vehicle")}
                                className="p-1.5 text-slate-400 hover:text-purple-655 dark:hover:text-purple-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-all"
                                title="Edit Desired Vehicle Info"
                            >
                                <Pencil className="w-4 h-4" />
                            </button>
                        )}
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
                    <div className="flex items-center justify-between pb-2.5 border-b border-slate-100 dark:border-slate-800">
                        <div className="flex items-center gap-2.5">
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
                        {isAdmin && (
                            <button
                                onClick={() => openEditModal("contact")}
                                className="p-1.5 text-slate-400 hover:text-orange-655 dark:hover:text-orange-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-all"
                                title="Edit Contact Info"
                            >
                                <Pencil className="w-4 h-4" />
                            </button>
                        )}
                    </div>


                    <div className="space-y-1 mt-2.5">
                        {[
                            { icon: User, label: "Name", value: request.name },
                            { icon: Phone, label: "Phone", value: request.phone, type: "phone" },
                            { icon: MapPin, label: "Pincode", value: request.pincode },
                            { icon: Building, label: "City", value: request.city },
                            { icon: Globe, label: "State", value: request.state },
                            { icon: MapPin, label: "Registered Address", value: request.address || request.streetAddress },
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
                                    <span className="text-xs text-slate-800 dark:text-slate-200 font-black uppercase tracking-wide group-hover:text-orange-655 dark:group-hover:text-orange-400 transition-colors">
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

                <VehiclePhotosSection
                    leadId={id}
                    leadType="scrap-buy"
                    request={request}
                    onPhotoUploaded={fetchRequest}
                />

            </div>

            {/* Documents Section */}
            {(request.aadharFile || request.rcFile || request.carPhoto) && (
                <div className="bg-white dark:bg-[#0E192D] rounded-2xl border border-slate-100 dark:border-slate-800/80 p-4 md:p-5 shadow-sm transition-all duration-300">
                    <div className="flex items-center gap-2.5 pb-2.5 border-b border-slate-100 dark:border-slate-800 mb-3">
                        <div className="p-2 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 rounded-lg">
                            <ImageIcon className="w-4.5 h-4.5" />
                        </div>
                        <div>
                            <h2 className="text-sm font-extrabold text-slate-800 dark:text-white tracking-tight">
                                Uploaded Documents
                            </h2>
                            <div className="h-0.5 w-8 bg-blue-500 rounded-full mt-1" />
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {request.aadharFile && (
                            <div className="border border-slate-100 dark:border-slate-800/60 rounded-xl p-3 bg-slate-50/50 dark:bg-slate-900/30 flex flex-col justify-between gap-2.5">
                                <div>
                                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-0.5">Aadhar Card Document</span>
                                    <p className="text-xs text-slate-600 dark:text-slate-400 font-semibold truncate">Uploaded File</p>
                                </div>
                                <div className="flex items-center gap-3 pt-1.5 border-t border-slate-100/50 dark:border-slate-800/30">
                                    <button
                                        onClick={() => window.open(request.aadharFile, '_blank')}
                                        className="text-blue-650 dark:text-blue-455 hover:underline text-xs font-bold"
                                    >
                                        View
                                    </button>
                                    <button
                                        onClick={() => window.open(request.aadharFile.replace("/upload/", "/upload/fl_attachment/"), '_blank')}
                                        className="text-slate-450 hover:text-blue-600 dark:text-slate-500 dark:hover:text-blue-400 transition-colors flex items-center gap-0.5 text-xs font-bold"
                                        title="Download Document"
                                    >
                                        <Download className="w-3 h-3" />
                                        Download
                                    </button>
                                </div>
                            </div>
                        )}
                        {request.rcFile && (
                            <div className="border border-slate-100 dark:border-slate-800/60 rounded-xl p-3 bg-slate-50/50 dark:bg-slate-900/30 flex flex-col justify-between gap-2.5">
                                <div>
                                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-0.5">Registration Certificate (RC)</span>
                                    <p className="text-xs text-slate-600 dark:text-slate-400 font-semibold truncate">Uploaded File</p>
                                </div>
                                <div className="flex items-center gap-3 pt-1.5 border-t border-slate-100/50 dark:border-slate-800/30">
                                    <button
                                        onClick={() => window.open(request.rcFile, '_blank')}
                                        className="text-blue-655 dark:text-blue-455 hover:underline text-xs font-bold"
                                    >
                                        View
                                    </button>
                                    <button
                                        onClick={() => window.open(request.rcFile.replace("/upload/", "/upload/fl_attachment/"), '_blank')}
                                        className="text-slate-455 hover:text-blue-650 dark:text-slate-550 dark:hover:text-blue-455 transition-colors flex items-center gap-0.5 text-xs font-bold"
                                        title="Download Document"
                                    >
                                        <Download className="w-3 h-3" />
                                        Download
                                    </button>
                                </div>
                            </div>
                        )}
                        {request.carPhoto && (
                            <div className="border border-slate-100 dark:border-slate-800/60 rounded-xl overflow-hidden bg-slate-50/50 dark:bg-slate-900/30 flex flex-col">
                                {/* Image Preview */}
                                <div className="relative w-full aspect-video overflow-hidden bg-slate-100 dark:bg-slate-800/50 group cursor-pointer" onClick={() => window.open(request.carPhoto, '_blank')}>
                                    <img
                                        src={request.carPhoto}
                                        alt="Vehicle Photo"
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                    />
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
                                        <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/60 text-white text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-widest">
                                            Open Full Size
                                        </span>
                                    </div>
                                </div>
                                {/* Label + Actions */}
                                <div className="p-3 flex items-center justify-between">
                                    <div>
                                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Vehicle Photo</span>
                                        <p className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold">Uploaded by customer</p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={() => window.open(request.carPhoto, '_blank')}
                                            className="text-blue-600 dark:text-blue-400 hover:underline text-xs font-bold"
                                        >
                                            View
                                        </button>
                                        <button
                                            onClick={() => window.open(request.carPhoto.replace("/upload/", "/upload/fl_attachment/"), '_blank')}
                                            className="text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center gap-0.5 text-xs font-bold"
                                            title="Download Photo"
                                        >
                                            <Download className="w-3 h-3" />
                                            Download
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

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

            {/* Edit Modal */}
            <AnimatePresence>
                {editSection && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setEditSection(null)}
                            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ scale: 0.95, y: 15, opacity: 0 }}
                            animate={{ scale: 1, y: 0, opacity: 1 }}
                            exit={{ scale: 0.95, y: 15, opacity: 0 }}
                            className="bg-white dark:bg-[#0E192D] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl w-full max-w-md z-10 overflow-hidden"
                        >
                            {/* Modal Header */}
                            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                                <h3 className="text-sm font-extrabold text-slate-800 dark:text-white uppercase tracking-wider">
                                    Edit {editSection === "scrap_vehicle" ? "Vehicle to Scrap" : editSection === "desired_vehicle" ? "Desired Vehicle Preferences" : "Contact Details"}
                                </h3>
                                <button
                                    onClick={() => setEditSection(null)}
                                    className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            {/* Modal Content */}
                            <div className="p-5 space-y-4 max-h-[60vh] overflow-y-auto">
                                {editSection === "scrap_vehicle" && (
                                    <>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Registration No.</label>
                                            <input
                                                type="text"
                                                value={editForm.regNo || ""}
                                                onChange={(e) => setEditForm({ ...editForm, regNo: e.target.value })}
                                                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-all font-semibold"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Brand</label>
                                            <input
                                                type="text"
                                                value={editForm.brand || ""}
                                                onChange={(e) => setEditForm({ ...editForm, brand: e.target.value })}
                                                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-all font-semibold"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Model</label>
                                            <input
                                                type="text"
                                                value={editForm.model || ""}
                                                onChange={(e) => setEditForm({ ...editForm, model: e.target.value })}
                                                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-all font-semibold"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Year</label>
                                            <input
                                                type="text"
                                                value={editForm.year || ""}
                                                onChange={(e) => setEditForm({ ...editForm, year: e.target.value })}
                                                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-all font-semibold"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Weight</label>
                                            <input
                                                type="text"
                                                value={editForm.weight || ""}
                                                onChange={(e) => setEditForm({ ...editForm, weight: e.target.value })}
                                                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-all font-semibold"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Fuel (comma separated)</label>
                                            <input
                                                type="text"
                                                value={editForm.fuel || ""}
                                                onChange={(e) => setEditForm({ ...editForm, fuel: e.target.value })}
                                                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-all font-semibold"
                                            />
                                        </div>
                                    </>
                                )}
                                {editSection === "desired_vehicle" && (
                                    <>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Desired Company</label>
                                            <input
                                                type="text"
                                                value={editForm.desiredCompany || ""}
                                                onChange={(e) => setEditForm({ ...editForm, desiredCompany: e.target.value })}
                                                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500 transition-all font-semibold"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Desired Model</label>
                                            <input
                                                type="text"
                                                value={editForm.desiredModel || ""}
                                                onChange={(e) => setEditForm({ ...editForm, desiredModel: e.target.value })}
                                                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500 transition-all font-semibold"
                                            />
                                        </div>
                                    </>
                                )}
                                {editSection === "contact" && (
                                    <>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Name</label>
                                            <input
                                                type="text"
                                                value={editForm.name || ""}
                                                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500 transition-all font-semibold"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Phone</label>
                                            <input
                                                type="text"
                                                value={editForm.phone || ""}
                                                onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                                                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500 transition-all font-semibold"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Pincode</label>
                                            <input
                                                type="text"
                                                value={editForm.pincode || ""}
                                                onChange={(e) => setEditForm({ ...editForm, pincode: e.target.value })}
                                                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500 transition-all font-semibold"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">City</label>
                                            <input
                                                type="text"
                                                value={editForm.city || ""}
                                                onChange={(e) => setEditForm({ ...editForm, city: e.target.value })}
                                                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500 transition-all font-semibold"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">State</label>
                                            <input
                                                type="text"
                                                value={editForm.state || ""}
                                                onChange={(e) => setEditForm({ ...editForm, state: e.target.value })}
                                                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500 transition-all font-semibold"
                                            />
                                        </div>
                                    </>
                                )}
                            </div>

                            {/* Modal Footer */}
                            <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/10">
                                <button
                                    onClick={() => setEditSection(null)}
                                    className="px-4 py-2 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-305 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl font-bold text-xs transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSave}
                                    disabled={isSaving}
                                    className={`px-4 py-2 rounded-xl text-white font-bold text-xs shadow-sm transition-all flex items-center gap-1.5 ${
                                        editSection === "scrap_vehicle"
                                            ? "bg-emerald-600 hover:bg-emerald-700 hover:shadow-emerald-500/10"
                                            : editSection === "desired_vehicle"
                                            ? "bg-purple-650 hover:bg-purple-700 hover:shadow-purple-500/10"
                                            : "bg-orange-655 hover:bg-orange-700 hover:shadow-orange-500/10"
                                    }`}
                                >
                                    {isSaving ? "Saving..." : "Save Changes"}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

        </div>
    )
}

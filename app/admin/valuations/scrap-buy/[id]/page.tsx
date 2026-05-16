"use client"

import { useEffect, useState, use } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Recycle, Car, User, MapPin, ChevronLeft, CheckCircle, Trash2, Phone, Hash, Weight, ShoppingCart, MessageCircle, Sparkles } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
import { motion } from "framer-motion"

export default function ScrapBuyDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter()
    const searchParams = useSearchParams()
    const highlight = searchParams.get("highlight") === "true"
    const { toast } = useToast()
    const { id } = use(params)
    const [request, setRequest] = useState<any>(null)
    const [loading, setLoading] = useState(true)

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
                router.push("/admin/valuations/quote")
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
                return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-500 border border-yellow-200 dark:border-yellow-900/50">Pending</span>
            case "reviewed":
            case "reviewing":
                return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-500 border border-blue-200 dark:border-blue-900/50">Reviewing</span>
            case "completed":
                return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-500 border border-green-200 dark:border-green-900/50">Completed</span>
            case "approved":
                return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-500 border border-emerald-200 dark:border-emerald-900/50"><CheckCircle className="w-3.5 h-3.5" />Approved</span>
            default:
                return <span className="px-2 py-1 rounded bg-gray-100 text-gray-600 text-xs">{status}</span>
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-gray-500">Loading...</div>
            </div>
        )
    }

    if (!request) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-gray-500">Request not found</div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-[#070e1a] p-4 md:p-8 space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-center gap-4">
                    <Link href="/admin/valuations/quote" className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                        <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-slate-400" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <Sparkles className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                            Scrap &amp; Buy New — Lead Details
                        </h1>
                        <div className="flex flex-wrap items-center gap-2 mt-2">
                            {getStatusBadge(request.status || "pending")}
                            <span className="text-xs sm:text-sm text-gray-500 dark:text-slate-500 font-mono break-all">ID: {request._id}</span>
                        </div>
                    </div>
                </div>
                <div className="flex flex-wrap items-center gap-3 w-full md:w-auto mt-4 md:mt-0">
                    <a
                        href={`https://wa.me/${request.phone?.replace(/\D/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 md:flex-none justify-center px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium text-sm flex items-center gap-2 md:mr-4"
                    >
                        <MessageCircle className="w-4 h-4" />
                        Chat
                    </a>
                    <div className="flex items-center gap-2 bg-gray-100 dark:bg-slate-800 p-1 rounded-lg border border-gray-200 dark:border-slate-700">
                        <select
                            value={request.status || "pending"}
                            onChange={(e) => handleStatusUpdate(e.target.value)}
                            className="bg-transparent text-xs font-bold uppercase tracking-widest text-gray-900 dark:text-white border-none focus:ring-0 cursor-pointer outline-none px-2"
                        >
                            <option value="pending" className="bg-white dark:bg-slate-900">Pending</option>
                            <option value="reviewing" className="bg-white dark:bg-slate-900">Reviewing</option>
                            <option value="approved" className="bg-white dark:bg-slate-900">Approved</option>
                        </select>
                    </div>
                    <button
                        onClick={handleDelete}
                        className="flex-1 md:flex-none justify-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium text-sm flex items-center gap-2"
                    >
                        <Trash2 className="w-4 h-4" />
                        Delete
                    </button>
                </div>
            </div>

            {/* Purple "Scrap & Buy" banner */}
            <div className="flex items-center gap-3 px-5 py-3 rounded-xl bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800/40">
                <Sparkles className="w-5 h-5 text-purple-600 dark:text-purple-400 flex-shrink-0" />
                <p className="text-sm font-semibold text-purple-800 dark:text-purple-300">
                    This is a <strong>Scrap &amp; Buy New</strong> lead — the customer wants to scrap their current vehicle <em>and</em> purchase a new one.
                </p>
            </div>

            <motion.div
                className="grid grid-cols-1 lg:grid-cols-2 gap-6"
                animate={highlight ? {
                    scale: [1, 1.02, 1, 1.02, 1],
                    transition: { duration: 1.5, times: [0, 0.25, 0.5, 0.75, 1] }
                } : {}}
            >
                {/* ── SECTION 1: Vehicle to Scrap ── */}
                <div className="bg-white dark:bg-[#0E192D] rounded-xl shadow-sm border border-gray-200 dark:border-slate-800 p-6">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <Recycle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        Vehicle to Scrap
                    </h2>
                    <div className="space-y-3">
                        {[
                            { label: "Registration No.", value: request.regNo },
                            { label: "Brand", value: request.brand },
                            { label: "Model", value: request.model },
                            { label: "Year", value: request.year },
                            { label: "Weight", value: request.weight },
                            { label: "KMs Driven", value: request.kms },
                            { label: "Fuel Type", value: Array.isArray(request.fuel) ? request.fuel.join(", ") : request.fuel },
                        ].map(({ label, value }) => value ? (
                            <div key={label} className="flex justify-between py-2 border-b border-gray-100 dark:border-slate-800 last:border-0">
                                <span className="text-gray-500 dark:text-slate-400 font-medium">{label}:</span>
                                <span className="text-gray-900 dark:text-white font-semibold">{value}</span>
                            </div>
                        ) : null)}
                    </div>
                </div>

                {/* ── SECTION 2: New Car Desired ── */}
                <div className="bg-white dark:bg-[#0E192D] rounded-xl shadow-sm border border-gray-200 dark:border-slate-800 p-6">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <ShoppingCart className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                        New Car Desired
                    </h2>
                    <div className="space-y-3">
                        {[
                            { label: "Desired Company", value: request.desiredCompany },
                            { label: "Desired Model", value: request.desiredModel },
                        ].map(({ label, value }) => (
                            <div key={label} className="flex justify-between py-2 border-b border-gray-100 dark:border-slate-800 last:border-0">
                                <span className="text-gray-500 dark:text-slate-400 font-medium">{label}:</span>
                                <span className="text-gray-900 dark:text-white font-semibold">{value || "Not specified"}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ── SECTION 3: Contact Information ── */}
                <div className="bg-white dark:bg-[#0E192D] rounded-xl shadow-sm border border-gray-200 dark:border-slate-800 p-6">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <User className="w-5 h-5 text-blue-600 dark:text-blue-500" />
                        Contact Information
                    </h2>
                    <div className="space-y-3">
                        <div className="flex justify-between py-2 border-b border-gray-100 dark:border-slate-800">
                            <span className="text-gray-500 dark:text-slate-400 font-medium">Name:</span>
                            <span className="text-gray-900 dark:text-white font-semibold">{request.name || "N/A"}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-gray-100 dark:border-slate-800">
                            <span className="text-gray-500 dark:text-slate-400 font-medium flex items-center gap-2"><Phone className="w-4 h-4" />Phone:</span>
                            <span className="text-gray-900 dark:text-white font-semibold">{request.phone || "N/A"}</span>
                        </div>
                        <div className="flex justify-between py-2">
                            <span className="text-gray-500 dark:text-slate-400 font-medium flex items-center gap-2"><MapPin className="w-4 h-4" />Pincode:</span>
                            <span className="text-gray-900 dark:text-white font-semibold">{request.pincode || "N/A"}</span>
                        </div>
                    </div>
                </div>

                {/* ── SECTION 4: WhatsApp ── */}
                <div className="bg-white dark:bg-[#0E192D] rounded-xl shadow-sm border border-gray-200 dark:border-slate-800 p-6">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <MessageCircle className="w-5 h-5 text-green-600 dark:text-green-500" />
                        WhatsApp
                    </h2>
                    <div className="flex flex-col items-center justify-center py-6 text-center space-y-4">
                        <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-full">
                            <MessageCircle className="w-8 h-8 text-green-600 dark:text-green-500" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-900 dark:text-white">Connect via WhatsApp</h3>
                            <p className="text-sm text-gray-500 dark:text-slate-400 max-w-[250px] mx-auto mt-1">
                                Click below to open a direct WhatsApp chat with the client
                            </p>
                        </div>
                        <a
                            href={`https://wa.me/${request.phone?.replace(/\D/g, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="relative inline-flex items-center gap-3 bg-gradient-to-r from-[#25D366] to-[#128C7E] hover:from-[#128C7E] hover:to-[#075E54] text-white px-8 py-4 rounded-full font-bold text-lg transition-all shadow-lg hover:shadow-emerald-500/30 hover:-translate-y-1 group"
                        >
                            <div className="absolute inset-0 rounded-full border border-white/20 group-hover:border-white/40 transition-colors"></div>
                            <MessageCircle className="w-6 h-6" />
                            <span>Chat on WhatsApp</span>
                        </a>
                    </div>
                </div>
            </motion.div>
        </div>
    )
}

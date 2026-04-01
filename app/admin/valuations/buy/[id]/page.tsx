"use client"

import { useEffect, useState, use } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { ShoppingCart, Car, User, MapPin, Calendar, ChevronLeft, CheckCircle, Trash2, Phone, Mail, DollarSign, MessageCircle } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
import { motion } from "framer-motion"

export default function BuyDetailPage({ params }: { params: Promise<{ id: string }> }) {
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
            const res = await fetch(`/api/admin/valuations/buy/${id}`)
            if (res.ok) {
                const data = await res.json()
                setRequest(data)

                // Auto-update status from pending to reviewed
                if (data.status === "pending") {
                    await fetch("/api/admin/requests/approve", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ id: id, type: "buy", status: "reviewed" })
                    })
                    // Update local state to reflect the change
                    setRequest({ ...data, status: "reviewed" })
                }
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

    const handleApprove = async () => {
        if (!confirm("Are you sure you want to approve this request?")) return

        try {
            const res = await fetch("/api/admin/requests/approve", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id: id, type: "buy" })
            })

            if (res.ok) {
                toast({
                    title: "Success",
                    description: "Request approved successfully"
                })
                fetchRequest()
            } else {
                toast({
                    title: "Error",
                    description: "Failed to approve request",
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

    const handleDelete = async () => {
        if (!confirm("Are you sure you want to delete this request? This action cannot be undone.")) return

        try {
            const res = await fetch(`/api/admin/requests/delete?id=${id}&type=buy`, {
                method: "DELETE"
            })

            if (res.ok) {
                toast({
                    title: "Success",
                    description: "Request deleted successfully"
                })
                router.push("/admin/valuations/buy")
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
                return <span className="px-2 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800 border border-yellow-200">Pending</span>
            case "contacted":
                return <span className="px-2 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200">Contacted</span>
            case "completed":
                return <span className="px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800 border border-green-200">Completed</span>
            case "rejected":
                return <span className="px-2 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800 border border-red-200">Rejected</span>
            case "approved":
                return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200"><CheckCircle className="w-3.5 h-3.5" />Approved</span>
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
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-center gap-4">
                    <Link href="/admin/valuations/buy" className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                        <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-slate-400" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <ShoppingCart className="w-6 h-6 text-orange-600 dark:text-orange-500" />
                            Buy Vehicle Request Details
                        </h1>
                        <p className="text-[13px] sm:text-sm text-gray-500 dark:text-slate-400 mt-1 break-all">Request ID: {request._id}</p>
                    </div>
                </div>
                <div className="flex flex-wrap items-center gap-3 w-full md:w-auto mt-4 md:mt-0">
                    <div className="w-full md:w-auto mb-2 md:mb-0">
                        {getStatusBadge(request.status)}
                    </div>
                    <a
                        href={`https://wa.me/${request.customerPhone?.replace(/\D/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 md:flex-none justify-center px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium text-sm flex items-center gap-2 md:mr-4"
                    >
                        <MessageCircle className="w-4 h-4" />
                        Chat
                    </a>
                    {request.status !== "approved" && (
                        <button
                            onClick={handleApprove}
                            className="flex-1 md:flex-none justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium text-sm flex items-center gap-2"
                        >
                            <CheckCircle className="w-4 h-4" />
                            Approve
                        </button>
                    )}
                    <button
                        onClick={handleDelete}
                        className="flex-1 md:flex-none justify-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium text-sm flex items-center gap-2"
                    >
                        <Trash2 className="w-4 h-4" />
                        Delete
                    </button>
                </div>
            </div>

            {/* Content Grid */}
            <motion.div
                className="grid grid-cols-1 lg:grid-cols-2 gap-6"
                animate={highlight ? {
                    scale: [1, 1.02, 1, 1.02, 1],
                    transition: { duration: 1.5, times: [0, 0.25, 0.5, 0.75, 1] }
                } : {}}
            >
                {/* Vehicle Preferences */}
                {/* Vehicle Preferences */}
                <div className="bg-white dark:bg-[#0E192D] rounded-xl shadow-sm border border-gray-200 dark:border-slate-800 p-6">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <Car className="w-5 h-5 text-orange-600 dark:text-orange-500" />
                        Vehicle Preferences
                    </h2>
                    <div className="space-y-3">
                        <div className="flex justify-between py-2 border-b border-gray-100 dark:border-slate-800">
                            <span className="text-gray-500 dark:text-slate-400 font-medium">Brand:</span>
                            <span className="text-gray-900 dark:text-white font-semibold">{request.customBrand || request.vehicleBrand}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-gray-100 dark:border-slate-800">
                            <span className="text-gray-500 dark:text-slate-400 font-medium">Model:</span>
                            <span className="text-gray-900 dark:text-white font-semibold">{request.customModel || request.vehicleModel}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-gray-100 dark:border-slate-800">
                            <span className="text-gray-500 dark:text-slate-400 font-medium">Fuel Type:</span>
                            <span className="text-gray-900 dark:text-white font-semibold">{request.fuelType}</span>
                        </div>
                        <div className="flex justify-between py-2">
                            <span className="text-gray-500 dark:text-slate-400 font-medium flex items-center gap-2"><DollarSign className="w-4 h-4" />Budget Range:</span>
                            <span className="text-gray-900 dark:text-white font-semibold">{request.budgetRange}</span>
                        </div>
                    </div>
                </div>

                {/* Customer Information */}
                {/* Customer Information */}
                <div className="bg-white dark:bg-[#0E192D] rounded-xl shadow-sm border border-gray-200 dark:border-slate-800 p-6">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <User className="w-5 h-5 text-orange-600 dark:text-orange-500" />
                        Customer Information
                    </h2>
                    <div className="space-y-3">
                        <div className="flex justify-between py-2 border-b border-gray-100 dark:border-slate-800">
                            <span className="text-gray-500 dark:text-slate-400 font-medium">Name:</span>
                            <span className="text-gray-900 dark:text-white font-semibold">{request.customerName}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-gray-100 dark:border-slate-800">
                            <span className="text-gray-500 dark:text-slate-400 font-medium flex items-center gap-2"><Phone className="w-4 h-4" />Phone:</span>
                            <span className="text-gray-900 dark:text-white font-semibold">{request.customerPhone}</span>
                        </div>
                        <div className="flex justify-between py-2">
                            <span className="text-gray-500 dark:text-slate-400 font-medium flex items-center gap-2"><Mail className="w-4 h-4" />Email:</span>
                            <span className="text-gray-900 dark:text-white font-semibold">{request.customerEmail}</span>
                        </div>
                    </div>
                </div>

                {/* Location Information */}
                {/* Location Information */}
                <div className="bg-white dark:bg-[#0E192D] rounded-xl shadow-sm border border-gray-200 dark:border-slate-800 p-6">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <MapPin className="w-5 h-5 text-orange-600 dark:text-orange-500" />
                        Location
                    </h2>
                    <div className="space-y-3">
                        {request.state && (
                            <div className="flex justify-between py-2 border-b border-gray-100 dark:border-slate-800">
                                <span className="text-gray-500 dark:text-slate-400 font-medium">State:</span>
                                <span className="text-gray-900 dark:text-white font-semibold">{request.state}</span>
                            </div>
                        )}
                        {(request.city || request.customCity) && (
                            <div className="flex justify-between py-2 border-b border-gray-100 dark:border-slate-800">
                                <span className="text-gray-500 dark:text-slate-400 font-medium">City:</span>
                                <span className="text-gray-900 dark:text-white font-semibold">{request.customCity || request.city}</span>
                            </div>
                        )}
                        {request.pincode && (
                            <div className="flex justify-between py-2">
                                <span className="text-gray-500 dark:text-slate-400 font-medium">Pincode:</span>
                                <span className="text-gray-900 dark:text-white font-semibold">{request.pincode}</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* WhatsApp Logs */}
                {/* WhatsApp Logs */}
                <div className="bg-white dark:bg-[#0E192D] rounded-xl shadow-sm border border-gray-200 dark:border-slate-800 p-6">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <MessageCircle className="w-5 h-5 text-green-600 dark:text-green-500" />
                        WhatsApp Logs
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
                            href={`https://wa.me/${request.customerPhone?.replace(/\D/g, '')}`}
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

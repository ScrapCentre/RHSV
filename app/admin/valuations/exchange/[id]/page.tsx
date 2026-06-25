"use client"

import { useEffect, useState, use } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { RefreshCcw, Car, User, MapPin, Calendar, ChevronLeft, CheckCircle, Trash2, Phone, Hash, MessageCircle, Image as ImageIcon, Download, Pencil, X } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
import { motion, AnimatePresence } from "framer-motion"
import { useSession } from "next-auth/react"
import VehiclePhotosSection from "@/components/admin/VehiclePhotosSection"

export default function ExchangeDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { data: session } = useSession()
    const isAdmin = session && (session.user as any)?.role === "admin"
    const router = useRouter()
    const searchParams = useSearchParams()
    const highlight = searchParams.get("highlight") === "true"
    const { toast } = useToast()
    const { id } = use(params)
    const [request, setRequest] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    // Edit states
    const [editSection, setEditSection] = useState<"old_vehicle" | "new_vehicle" | "customer" | "location" | null>(null)
    const [editForm, setEditForm] = useState<any>({})
    const [isSaving, setIsSaving] = useState(false)

    const openEditModal = (section: "old_vehicle" | "new_vehicle" | "customer" | "location") => {
        setEditSection(section)
        if (section === "old_vehicle") {
            setEditForm({
                oldVehicleRegistration: request.oldVehicleRegistration || "",
                oldVehicleBrand: request.oldVehicleBrand || "",
                oldVehicleModel: request.oldVehicleModel || "",
                oldVehicleYear: request.oldVehicleYear || "",
                oldVehicleFuelType: request.oldVehicleFuelType || "",
            })
        } else if (section === "new_vehicle") {
            setEditForm({
                newVehicleBrand: request.newVehicleBrand || "",
                newVehicleModel: request.newVehicleModel || "",
            })
        } else if (section === "customer") {
            setEditForm({
                customerName: request.customerName || "",
                customerPhone: request.customerPhone || "",
            })
        } else if (section === "location") {
            setEditForm({
                state: request.state || "",
                city: request.city || "",
                customCity: request.customCity || "",
                pincode: request.pincode || "",
            })
        }
    }

    const handleSave = async () => {
        setIsSaving(true)
        try {
            const body = editSection === "old_vehicle"
                ? {
                    oldVehicleRegistration: editForm.oldVehicleRegistration,
                    oldVehicleBrand: editForm.oldVehicleBrand,
                    oldVehicleModel: editForm.oldVehicleModel,
                    oldVehicleYear: editForm.oldVehicleYear,
                    oldVehicleFuelType: editForm.oldVehicleFuelType,
                }
                : editSection === "new_vehicle"
                ? {
                    newVehicleBrand: editForm.newVehicleBrand,
                    newVehicleModel: editForm.newVehicleModel,
                }
                : editSection === "customer"
                ? {
                    customerName: editForm.customerName,
                    customerPhone: editForm.customerPhone,
                }
                : {
                    state: editForm.state,
                    city: editForm.city,
                    customCity: editForm.customCity,
                    pincode: editForm.pincode,
                }

            const res = await fetch(`/api/admin/valuations/exchange/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            })

            if (res.ok) {
                toast({
                    title: "Success",
                    description: "Exchange request details updated successfully",
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
            const res = await fetch(`/api/admin/valuations/exchange/${id}`)
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
                body: JSON.stringify({ id: id, type: "exchange", status: newStatus })
            })

            if (res.ok) {
                toast({
                    title: "Status Updated",
                    description: `Lead status successfully transitioned to ${newStatus}.`
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
            const res = await fetch(`/api/admin/requests/delete?id=${id}&type=exchange`, {
                method: "DELETE"
            })

            if (res.ok) {
                toast({
                    title: "Success",
                    description: "Request deleted successfully"
                })
                router.push("/admin/valuations/exchange")
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
            case "reviewed":
            case "reviewing":
                return <span className="px-2 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200">Reviewing</span>
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
        <div className="min-h-screen bg-gray-50 dark:bg-[#070e1a] p-4 md:p-8 space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-center gap-4">
                    <Link href="/admin/valuations/exchange" className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                        <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-slate-400" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <RefreshCcw className="w-6 h-6 text-purple-600 dark:text-purple-500" />
                            Exchange Vehicle Request Details
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
                    <div className="flex items-center gap-2 bg-gray-100 dark:bg-slate-800 p-1 rounded-lg border border-gray-200 dark:border-slate-700">
                        <select 
                            value={request.status || "pending"} 
                            onChange={(e) => handleStatusUpdate(e.target.value)}
                            className="bg-transparent text-xs font-bold uppercase tracking-widest text-gray-900 dark:text-white border-none focus:ring-0 cursor-pointer outline-none px-2"
                        >
                            <option value="pending" className="bg-white dark:bg-slate-900">Pending</option>
                            <option value="reviewing" className="bg-white dark:bg-slate-900">Reviewing</option>
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

            {/* Content Grid */}
            <motion.div
                className="grid grid-cols-1 lg:grid-cols-2 gap-6"
                animate={highlight ? {
                    scale: [1, 1.02, 1, 1.02, 1],
                    transition: { duration: 1.5, times: [0, 0.25, 0.5, 0.75, 1] }
                } : {}}
            >
                {/* Old Vehicle Information */}
                {/* Old Vehicle Information */}
                <div className="bg-white dark:bg-[#0E192D] rounded-xl shadow-sm border border-gray-200 dark:border-slate-800 p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <Car className="w-5 h-5 text-purple-600 dark:text-purple-500" />
                            Old Vehicle Information
                        </h2>
                        {isAdmin && (
                            <button
                                onClick={() => openEditModal("old_vehicle")}
                                className="p-1.5 text-slate-400 hover:text-purple-600 dark:hover:text-purple-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all"
                                title="Edit Old Vehicle Info"
                            >
                                <Pencil className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                    <div className="space-y-3">
                        <div className="flex justify-between py-2 border-b border-gray-100 dark:border-slate-800">
                            <span className="text-gray-500 dark:text-slate-400 font-medium flex items-center gap-2"><Hash className="w-4 h-4" />Registration:</span>
                            <span className="text-gray-900 dark:text-white font-semibold font-mono">{request.oldVehicleRegistration}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-gray-100 dark:border-slate-800">
                            <span className="text-gray-500 dark:text-slate-400 font-medium">Brand:</span>
                            <span className="text-gray-900 dark:text-white font-semibold">{request.oldVehicleBrand}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-gray-100 dark:border-slate-800">
                            <span className="text-gray-500 dark:text-slate-400 font-medium">Model:</span>
                            <span className="text-gray-900 dark:text-white font-semibold">{request.oldVehicleModel}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-gray-100 dark:border-slate-800">
                            <span className="text-gray-500 dark:text-slate-400 font-medium">Year:</span>
                            <span className="text-gray-900 dark:text-white font-semibold">{request.oldVehicleYear}</span>
                        </div>
                        <div className="flex justify-between py-2">
                            <span className="text-gray-500 dark:text-slate-400 font-medium">Fuel Type:</span>
                            <span className="text-gray-900 dark:text-white font-semibold">{request.oldVehicleFuelType}</span>
                        </div>
                    </div>
                </div>

                {/* New Vehicle Preferences */}
                <div className="bg-white dark:bg-[#0E192D] rounded-xl shadow-sm border border-gray-200 dark:border-slate-800 p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <Car className="w-5 h-5 text-purple-600 dark:text-purple-500" />
                            New Vehicle Preferences
                        </h2>
                        {isAdmin && (
                            <button
                                onClick={() => openEditModal("new_vehicle")}
                                className="p-1.5 text-slate-400 hover:text-purple-600 dark:hover:text-purple-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all"
                                title="Edit Desired Vehicle Preferences"
                            >
                                <Pencil className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                    <div className="space-y-3">
                        <div className="flex justify-between py-2 border-b border-gray-100 dark:border-slate-800">
                            <span className="text-gray-500 dark:text-slate-400 font-medium">Brand:</span>
                            <span className="text-gray-900 dark:text-white font-semibold">{request.newVehicleBrand}</span>
                        </div>
                        <div className="flex justify-between py-2">
                            <span className="text-gray-500 dark:text-slate-400 font-medium">Model:</span>
                            <span className="text-gray-900 dark:text-white font-semibold">{request.newVehicleModel || "Any Model"}</span>
                        </div>
                    </div>
                </div>

                {/* Customer Information */}
                <div className="bg-white dark:bg-[#0E192D] rounded-xl shadow-sm border border-gray-200 dark:border-slate-800 p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <User className="w-5 h-5 text-purple-600 dark:text-purple-500" />
                            Customer Information
                        </h2>
                        {isAdmin && (
                            <button
                                onClick={() => openEditModal("customer")}
                                className="p-1.5 text-slate-400 hover:text-purple-600 dark:hover:text-purple-505 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all"
                                title="Edit Customer Info"
                            >
                                <Pencil className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                    <div className="space-y-3">
                        <div className="flex justify-between py-2 border-b border-gray-100 dark:border-slate-800">
                            <span className="text-gray-500 dark:text-slate-400 font-medium">Name:</span>
                            <span className="text-gray-900 dark:text-white font-semibold">{request.customerName}</span>
                        </div>
                        <div className="flex justify-between py-2">
                            <span className="text-gray-500 dark:text-slate-400 font-medium flex items-center gap-2"><Phone className="w-4 h-4" />Phone:</span>
                            <span className="text-gray-900 dark:text-white font-semibold">{request.customerPhone}</span>
                        </div>
                    </div>
                </div>

                {/* Location Information */}
                <div className="bg-white dark:bg-[#0E192D] rounded-xl shadow-sm border border-gray-200 dark:border-slate-800 p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <MapPin className="w-5 h-5 text-purple-600 dark:text-purple-500" />
                            Location
                        </h2>
                        {isAdmin && (
                            <button
                                onClick={() => openEditModal("location")}
                                className="p-1.5 text-slate-400 hover:text-purple-600 dark:hover:text-purple-505 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all"
                                title="Edit Location Info"
                            >
                                <Pencil className="w-4 h-4" />
                            </button>
                        )}
                    </div>
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

                <VehiclePhotosSection
                    leadId={id}
                    leadType="exchange"
                    request={request}
                    onPhotoUploaded={fetchRequest}
                    className="lg:col-span-2"
                />
            </motion.div>

            {/* Documents Section */}
            {(request.aadharFile || request.rcFile || request.carPhoto) && (
                <div className="bg-white dark:bg-[#0E192D] rounded-xl shadow-sm border border-gray-200 dark:border-slate-800 p-6">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <ImageIcon className="w-5 h-5 text-purple-600 dark:text-purple-500" />
                        Uploaded Documents
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {request.aadharFile && (
                            <div className="border border-gray-200 dark:border-slate-800 rounded-lg p-4 bg-gray-50/50 dark:bg-slate-900/50">
                                <p className="text-sm font-medium text-gray-700 dark:text-slate-300 mb-2 font-bold uppercase tracking-wider text-[10px]">Aadhar Card</p>
                                <div className="flex items-center gap-4">
                                    <button
                                        onClick={() => window.open(request.aadharFile, '_blank')}
                                        className="text-purple-600 dark:text-purple-400 hover:underline text-sm font-bold flex items-center gap-1.5"
                                    >
                                        View Document
                                    </button>
                                    <button
                                        onClick={() => window.open(request.aadharFile.replace("/upload/", "/upload/fl_attachment/"), '_blank')}
                                        className="text-gray-500 hover:text-purple-600 dark:text-slate-400 dark:hover:text-purple-400 transition-colors flex items-center gap-1.5 text-sm font-bold"
                                        title="Download Document"
                                    >
                                        <Download className="w-4 h-4" />
                                        Download
                                    </button>
                                </div>
                            </div>
                        )}
                        {request.rcFile && (
                            <div className="border border-gray-200 dark:border-slate-800 rounded-lg p-4 bg-gray-50/50 dark:bg-slate-900/50">
                                <p className="text-sm font-medium text-gray-700 dark:text-slate-300 mb-2 font-bold uppercase tracking-wider text-[10px]">RC Document</p>
                                <div className="flex items-center gap-4">
                                    <button
                                        onClick={() => window.open(request.rcFile, '_blank')}
                                        className="text-purple-600 dark:text-purple-400 hover:underline text-sm font-bold flex items-center gap-1.5"
                                    >
                                        View Document
                                    </button>
                                    <button
                                        onClick={() => window.open(request.rcFile.replace("/upload/", "/upload/fl_attachment/"), '_blank')}
                                        className="text-gray-500 hover:text-purple-600 dark:text-slate-400 dark:hover:text-purple-400 transition-colors flex items-center gap-1.5 text-sm font-bold"
                                        title="Download Document"
                                    >
                                        <Download className="w-4 h-4" />
                                        Download
                                    </button>
                                </div>
                            </div>
                        )}
                        {request.carPhoto && (
                            <div className="border border-gray-200 dark:border-slate-800 rounded-xl overflow-hidden bg-gray-50/50 dark:bg-slate-900/50 flex flex-col">
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
                                    <p className="text-[10px] font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Vehicle Photo</p>
                                    <div className="flex items-center gap-4">
                                        <button
                                            onClick={() => window.open(request.carPhoto, '_blank')}
                                            className="text-purple-600 dark:text-purple-400 hover:underline text-xs font-bold"
                                        >
                                            View
                                        </button>
                                        <button
                                            onClick={() => window.open(request.carPhoto.replace("/upload/", "/upload/fl_attachment/"), '_blank')}
                                            className="text-gray-500 hover:text-purple-600 dark:text-slate-400 dark:hover:text-purple-400 transition-colors flex items-center gap-1.5 text-xs font-bold"
                                            title="Download Photo"
                                        >
                                            <Download className="w-4 h-4" />
                                            Download
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
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
                                    Edit {editSection === "old_vehicle" ? "Old Vehicle Info" : editSection === "new_vehicle" ? "New Vehicle Preferences" : editSection === "customer" ? "Customer Info" : "Location Details"}
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
                                {editSection === "old_vehicle" && (
                                    <>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Registration No.</label>
                                            <input
                                                type="text"
                                                value={editForm.oldVehicleRegistration || ""}
                                                onChange={(e) => setEditForm({ ...editForm, oldVehicleRegistration: e.target.value })}
                                                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500 transition-all font-semibold"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Brand</label>
                                            <input
                                                type="text"
                                                value={editForm.oldVehicleBrand || ""}
                                                onChange={(e) => setEditForm({ ...editForm, oldVehicleBrand: e.target.value })}
                                                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500 transition-all font-semibold"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Model</label>
                                            <input
                                                type="text"
                                                value={editForm.oldVehicleModel || ""}
                                                onChange={(e) => setEditForm({ ...editForm, oldVehicleModel: e.target.value })}
                                                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500 transition-all font-semibold"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Year</label>
                                            <input
                                                type="text"
                                                value={editForm.oldVehicleYear || ""}
                                                onChange={(e) => setEditForm({ ...editForm, oldVehicleYear: e.target.value })}
                                                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500 transition-all font-semibold"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Fuel Type</label>
                                            <input
                                                type="text"
                                                value={editForm.oldVehicleFuelType || ""}
                                                onChange={(e) => setEditForm({ ...editForm, oldVehicleFuelType: e.target.value })}
                                                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500 transition-all font-semibold"
                                            />
                                        </div>
                                    </>
                                )}
                                {editSection === "new_vehicle" && (
                                    <>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Brand Preference</label>
                                            <input
                                                type="text"
                                                value={editForm.newVehicleBrand || ""}
                                                onChange={(e) => setEditForm({ ...editForm, newVehicleBrand: e.target.value })}
                                                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500 transition-all font-semibold"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Model Preference</label>
                                            <input
                                                type="text"
                                                value={editForm.newVehicleModel || ""}
                                                onChange={(e) => setEditForm({ ...editForm, newVehicleModel: e.target.value })}
                                                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500 transition-all font-semibold"
                                            />
                                        </div>
                                    </>
                                )}
                                {editSection === "customer" && (
                                    <>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Customer Name</label>
                                            <input
                                                type="text"
                                                value={editForm.customerName || ""}
                                                onChange={(e) => setEditForm({ ...editForm, customerName: e.target.value })}
                                                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500 transition-all font-semibold"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Customer Phone</label>
                                            <input
                                                type="text"
                                                value={editForm.customerPhone || ""}
                                                onChange={(e) => setEditForm({ ...editForm, customerPhone: e.target.value })}
                                                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500 transition-all font-semibold"
                                            />
                                        </div>
                                    </>
                                )}
                                {editSection === "location" && (
                                    <>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">State</label>
                                            <input
                                                type="text"
                                                value={editForm.state || ""}
                                                onChange={(e) => setEditForm({ ...editForm, state: e.target.value })}
                                                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500 transition-all font-semibold"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">City</label>
                                            <input
                                                type="text"
                                                value={editForm.city || ""}
                                                onChange={(e) => setEditForm({ ...editForm, city: e.target.value })}
                                                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500 transition-all font-semibold"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Custom City (Optional)</label>
                                            <input
                                                type="text"
                                                value={editForm.customCity || ""}
                                                onChange={(e) => setEditForm({ ...editForm, customCity: e.target.value })}
                                                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500 transition-all font-semibold"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Pincode</label>
                                            <input
                                                type="text"
                                                value={editForm.pincode || ""}
                                                onChange={(e) => setEditForm({ ...editForm, pincode: e.target.value })}
                                                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500 transition-all font-semibold"
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
                                    className="px-4 py-2 rounded-xl text-white font-bold text-xs shadow-sm transition-all flex items-center gap-1.5 bg-[#7C3AED] hover:bg-[#6D28D9] hover:shadow-purple-500/10"
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

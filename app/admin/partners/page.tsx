"use client"

import { useState, useEffect } from "react"
import { Shield, CheckCircle, Clock, MapPin, Phone, Mail, FileText, User } from "lucide-react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface B2BRegistration {
    _id: string
    name: string
    address: string
    pincode: string
    city: string
    state: string
    contactNumber: string
    email: string
    userId?: string
    status?: string
    createdAt: string
}

interface B2BPartner {
    _id: string
    userId: string
    businessName: string
    email: string
    contactNumber: string
    address: string
    city: string
    state: string
    pincode: string
    createdAt: string
}

export default function B2BPartnersPage() {
    const [activeTab, setActiveTab] = useState<"partners" | "requests">("requests")
    const [registrations, setRegistrations] = useState<B2BRegistration[]>([])
    const [partners, setPartners] = useState<B2BPartner[]>([])
    const [isLoading, setIsLoading] = useState(true)

    const router = useRouter()
    const { toast } = useToast()
    const [deletingId, setDeletingId] = useState<string | null>(null)

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true)
            try {
                const [regRes, partnerRes] = await Promise.all([
                    fetch("/api/b2b-register"),
                    fetch("/api/b2b-partner")
                ])

                const regData = await regRes.json()
                const partnerData = await partnerRes.json()

                if (regRes.ok) {
                    // Only show pending requests
                    const pendingRequests = regData.data.filter((r: any) => r.status === 'pending')
                    setRegistrations(pendingRequests)
                }
                if (partnerRes.ok) setPartners(partnerData.data)
            } catch (error) {
                console.error("Failed to fetch data", error)
            } finally {
                setIsLoading(false)
            }
        }

        fetchData()
    }, [])

    // Handlers
    const handleReject = async (id: string) => {
        try {
            const res = await fetch(`/api/b2b-register?id=${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: 'rejected' })
            })

            if (res.ok) {
                // Keep the registration but remove from the pending list if needed?
                // Actually, the current registrations state filters for 'pending'.
                // So updating it will hide it from the list anyway if we refetch or update state localy.
                setRegistrations(prev => prev.filter(reg => reg._id !== id))
                toast({
                    title: "Request Rejected",
                    description: "The B2B registration request has been marked as rejected.",
                })
            } else {
                throw new Error("Failed to reject request")
            }
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to reject request. Please try again.",
                variant: "destructive",
            })
        } finally {
            setDeletingId(null)
        }
    }

    const handleApprove = (reg: B2BRegistration) => {
        // Redirect to generator page with pre-filled details
        const params = new URLSearchParams({
            registrationId: reg._id, // Pass ID to link/delete later
            name: reg.name,
            email: reg.email,
            contactNumber: reg.contactNumber, // Fixed key name consistency
            address: reg.address,
            city: reg.city,
            state: reg.state,
            pincode: reg.pincode,
            originalUserId: reg.userId || ""
        })
        router.push(`/admin/b2b-generator?${params.toString()}`)
    }

    return (
        <div className="space-y-8 max-w-7xl mx-auto">
            <AlertDialog open={!!deletingId} onOpenChange={() => setDeletingId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Reject Request?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete the B2B registration request. This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            className="bg-red-600 hover:bg-red-700"
                            onClick={() => deletingId && handleReject(deletingId)}
                        >
                            Reject
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                        <User className="w-8 h-8 text-blue-600 dark:text-blue-500" />
                        B2B Partners Management
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-2">Manage your verified partners and review new applications.</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex space-x-1 rounded-xl bg-blue-900/5 dark:bg-blue-900/20 p-1 mb-8 w-fit">
                <button
                    onClick={() => setActiveTab("requests")}
                    className={`w-full rounded-lg py-2.5 px-6 text-sm font-medium leading-5 transition-all
                        ${activeTab === "requests"
                            ? "bg-white dark:bg-blue-600 text-blue-700 dark:text-white shadow"
                            : "text-blue-600 dark:text-blue-400 hover:bg-white/[0.12] dark:hover:bg-blue-800/50 hover:text-blue-800 dark:hover:text-blue-300"
                        }`}
                >
                    Requests Submitted
                </button>
                <button
                    onClick={() => setActiveTab("partners")}
                    className={`w-full rounded-lg py-2.5 px-6 text-sm font-medium leading-5 transition-all
                        ${activeTab === "partners"
                            ? "bg-white dark:bg-blue-600 text-blue-700 dark:text-white shadow"
                            : "text-blue-600 dark:text-blue-400 hover:bg-white/[0.12] dark:hover:bg-blue-800/50 hover:text-blue-800 dark:hover:text-blue-300"
                        }`}
                >
                    Our Partners
                </button>
            </div>

            {/* Content */}
            {activeTab === "requests" && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                >
                    {isLoading ? (
                        <div className="flex justify-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
                        </div>
                    ) : registrations.length === 0 ? (
                        <div className="text-center py-12 bg-white dark:bg-[#0E192D] rounded-xl shadow-sm border border-gray-100 dark:border-slate-800">
                            <FileText className="h-12 w-12 text-gray-400 dark:text-slate-600 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white">No requests found</h3>
                            <p className="text-gray-500 dark:text-slate-400">New partner applications will appear here.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            {registrations.map((reg) => (
                                <div key={reg._id} className="bg-white dark:bg-[#0E192D] overflow-hidden shadow rounded-xl border border-gray-100 dark:border-slate-800 hover:shadow-md transition-shadow">
                                    <div className="px-4 py-5 sm:p-6">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                                                    <User className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                                </div>
                                                <div>
                                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">{reg.name}</h3>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">{new Date(reg.createdAt).toLocaleDateString()}</p>
                                                </div>
                                            </div>
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400">
                                                Pending
                                            </span>
                                        </div>

                                        <div className="space-y-3">
                                            <div className="flex items-start gap-3 text-gray-600 dark:text-gray-300">
                                                <MapPin className="h-4 w-4 mt-1 shrink-0" />
                                                <p className="text-sm">{reg.address}, {reg.city}, {reg.state} - {reg.pincode}</p>
                                            </div>
                                            <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
                                                <Phone className="h-4 w-4 shrink-0" />
                                                <p className="text-sm">{reg.contactNumber}</p>
                                            </div>
                                            <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
                                                <Mail className="h-4 w-4 shrink-0" />
                                                <p className="text-sm">{reg.email}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="bg-gray-50 dark:bg-slate-900 px-4 py-4 sm:px-6 flex justify-end gap-2 border-t border-gray-100 dark:border-slate-800">
                                        <button
                                            onClick={() => setDeletingId(reg._id)}
                                            className="text-sm text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300 font-medium px-3 py-1 bg-red-50 dark:bg-red-900/20 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
                                        >
                                            Reject
                                        </button>
                                        <button
                                            onClick={() => handleApprove(reg)}
                                            className="text-sm bg-blue-600 dark:bg-blue-500 text-white px-3 py-1 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors font-medium shadow-sm"
                                        >
                                            Approve
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </motion.div>
            )}

            {activeTab === "partners" && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                >
                    {isLoading ? (
                        <div className="flex justify-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600"></div>
                        </div>
                    ) : partners.length === 0 ? (
                        <div className="text-center py-16 bg-white dark:bg-[#0E192D] rounded-xl shadow-sm border border-gray-100 dark:border-slate-800">
                            <CheckCircle className="h-16 w-16 text-green-100 dark:text-green-900/30 text-green-500 mx-auto mb-4" />
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">No Active Partners</h3>
                            <p className="text-gray-500 dark:text-slate-400 mt-2 max-w-md mx-auto">There are no approved partners yet.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            {partners.map((partner) => (
                                <div key={partner._id} className="bg-white dark:bg-[#0E192D] overflow-hidden shadow rounded-xl border border-gray-100 dark:border-slate-800 hover:shadow-md transition-shadow">
                                    <div className="px-4 py-5 sm:p-6">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                                                    <Shield className="h-5 w-5 text-green-600 dark:text-green-400" />
                                                </div>
                                                <div>
                                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">{partner.businessName}</h3>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">ID: {partner.userId}</p>
                                                </div>
                                            </div>
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400">
                                                Active
                                            </span>
                                        </div>

                                        <div className="space-y-3">
                                            <div className="flex items-start gap-3 text-gray-600 dark:text-gray-300">
                                                <MapPin className="h-4 w-4 mt-1 shrink-0" />
                                                <p className="text-sm">{partner.address}, {partner.city}, {partner.state} - {partner.pincode}</p>
                                            </div>
                                            <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
                                                <Phone className="h-4 w-4 shrink-0" />
                                                <p className="text-sm">{partner.contactNumber}</p>
                                            </div>
                                            <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
                                                <Mail className="h-4 w-4 shrink-0" />
                                                <p className="text-sm">{partner.email}</p>
                                            </div>
                                            <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
                                                <Clock className="h-4 w-4 shrink-0" />
                                                <p className="text-sm">Joined: {new Date(partner.createdAt).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="bg-gray-50 dark:bg-slate-900 px-4 py-3 sm:px-6 flex justify-end items-center gap-3 border-t border-gray-100 dark:border-slate-800">
                                        <span className="text-xs text-gray-400 dark:text-slate-500 font-mono">{partner._id}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </motion.div>
            )}
        </div>
    )
}


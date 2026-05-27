"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
    Search, 
    Calendar, 
    RefreshCcw, 
    Eye, 
    X, 
    CheckCircle, 
    XCircle, 
    Clock, 
    CreditCard, 
    AlertCircle,
    Loader2,
    DollarSign,
    User,
    FileText
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface RefundRequest {
    _id: string
    leadId: string
    rvsfId: string
    amount: number
    rejectionReason: string
    unlockPaymentId: string
    razorpayOrderId?: string
    status: string
    createdAt: string
    rvsfName: string
}

interface RefundReviewClientProps {
    initialRequests: RefundRequest[]
}

export default function RefundReviewClient({ initialRequests }: RefundReviewClientProps) {
    const { toast } = useToast()
    const [requests, setRequests] = useState<RefundRequest[]>(initialRequests)
    const [searchTerm, setSearchTerm] = useState("")
    const [selectedRequest, setSelectedRequest] = useState<RefundRequest | null>(null)
    
    // Action states
    const [isProcessing, setIsProcessing] = useState(false)
    const [showDenyInput, setShowDenyInput] = useState(false)
    const [denialReason, setDenialReason] = useState("")

    // Filter requests by search term (Lead ID or RVSF Name)
    const filteredRequests = requests.filter(req => 
        req.leadId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.rvsfName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.rvsfId.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const handleOpenReview = (req: RefundRequest) => {
        setSelectedRequest(req)
        setShowDenyInput(false)
        setDenialReason("")
    }

    const handleCloseReview = () => {
        if (isProcessing) return
        setSelectedRequest(null)
        setShowDenyInput(false)
        setDenialReason("")
    }

    // Call backend API to Approve Refund
    const handleApproveRefund = async () => {
        if (!selectedRequest) return
        
        const confirmApprove = window.confirm(
            `Are you sure you want to APPROVE this refund of ₹${selectedRequest.amount} for RVSF "${selectedRequest.rvsfName}"?\n\nThis will trigger an immediate full refund via Razorpay.`
        )
        if (!confirmApprove) return

        setIsProcessing(true)
        try {
            const res = await fetch(`/api/admin/refund-requests/${selectedRequest._id}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ action: "approve" }),
            })

            const data = await res.json()

            if (res.ok) {
                toast({
                    title: "Refund Approved",
                    description: `Successfully processed full refund for lead ${selectedRequest.leadId}. Refund ID: ${data.refundId || "N/A"}`,
                })
                // Remove from pending list
                setRequests(prev => prev.filter(r => r._id !== selectedRequest._id))
                setSelectedRequest(null)
            } else {
                toast({
                    title: "Approval Failed",
                    description: data.message || "Failed to initiate refund.",
                    variant: "destructive",
                })
            }
        } catch (err: any) {
            console.error("Refund approval exception:", err)
            toast({
                title: "Gateway Connection Error",
                description: "Something went wrong while contacting the refund servers.",
                variant: "destructive",
            })
        } finally {
            setIsProcessing(false)
        }
    }

    // Call backend API to Deny Refund
    const handleDenyRefundSubmit = async () => {
        if (!selectedRequest) return
        if (!denialReason.trim()) {
            toast({
                title: "Reason Required",
                description: "Please enter a valid reason for denial.",
                variant: "destructive",
            })
            return
        }

        setIsProcessing(true)
        try {
            const res = await fetch(`/api/admin/refund-requests/${selectedRequest._id}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ 
                    action: "deny",
                    reason: denialReason.trim()
                }),
            })

            const data = await res.json()

            if (res.ok) {
                toast({
                    title: "Refund Request Denied",
                    description: `Refund request for lead ${selectedRequest.leadId} has been successfully denied.`,
                })
                // Remove from pending list
                setRequests(prev => prev.filter(r => r._id !== selectedRequest._id))
                setSelectedRequest(null)
            } else {
                toast({
                    title: "Denial Failed",
                    description: data.message || "Failed to deny refund.",
                    variant: "destructive",
                })
            }
        } catch (err: any) {
            console.error("Refund denial exception:", err)
            toast({
                title: "Error",
                description: "Something went wrong while processing denial request.",
                variant: "destructive",
            })
        } finally {
            setIsProcessing(false)
        }
    }

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.05 }
        }
    }

    const itemVariants = {
        hidden: { opacity: 0, y: 10 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.35, ease: "easeOut" as const }
        }
    }

    return (
        <div className="space-y-6">
            {/* Search and Filters Bar */}
            <div className="bg-white dark:bg-[#0E192D] p-5 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="relative flex-1 w-full max-w-md">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input 
                        type="text" 
                        placeholder="Search by RVSF Name, ID, or Lead ID..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-11 pr-4 py-2.5 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 dark:focus:ring-emerald-400/50 text-gray-900 dark:text-white transition-all"
                    />
                    {searchTerm && (
                        <button 
                            onClick={() => setSearchTerm("")}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5 rounded-full"
                        >
                            <X className="w-3.5 h-3.5" />
                        </button>
                    )}
                </div>
                <div className="text-sm font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-2">
                    <span className="text-gray-900 dark:text-white font-bold bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full text-xs">
                        {filteredRequests.length}
                    </span>
                    Pending Requests
                </div>
            </div>

            {/* List Table / Card Grid */}
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="bg-white dark:bg-[#0E192D] rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm overflow-hidden hidden md:block"
            >
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm border-collapse">
                        <thead>
                            <tr className="bg-gray-50 dark:bg-slate-900/50 border-b border-gray-100 dark:border-slate-800 text-slate-500 dark:text-slate-400 uppercase text-xs font-bold tracking-wider">
                                <th className="px-6 py-4.5 font-bold">RVSF Info</th>
                                <th className="px-6 py-4.5 font-bold">Lead ID</th>
                                <th className="px-6 py-4.5 font-bold">Unlock Amount</th>
                                <th className="px-6 py-4.5 font-bold">Rejection Reason</th>
                                <th className="px-6 py-4.5 font-bold">Date of Request</th>
                                <th className="px-6 py-4.5 font-bold text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                            {filteredRequests.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-slate-400 dark:text-slate-500 font-medium">
                                        No pending refund requests found.
                                    </td>
                                </tr>
                            ) : (
                                filteredRequests.map((req, i) => (
                                    <motion.tr 
                                        key={req._id}
                                        variants={itemVariants}
                                        className="hover:bg-gray-50/50 dark:hover:bg-slate-800/40 transition-colors"
                                    >
                                        <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white align-middle">
                                            <div className="flex flex-col">
                                                <span>{req.rvsfName}</span>
                                                <span className="text-[10px] text-slate-400 font-mono tracking-tight font-normal uppercase">{req.rvsfId}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-700 dark:text-slate-300 font-mono text-xs font-semibold align-middle">
                                            {req.leadId}
                                        </td>
                                        <td className="px-6 py-4 font-bold text-gray-900 dark:text-emerald-400 align-middle">
                                            ₹{req.amount}
                                        </td>
                                        <td className="px-6 py-4 text-slate-600 dark:text-slate-300 align-middle max-w-xs truncate" title={req.rejectionReason}>
                                            {req.rejectionReason}
                                        </td>
                                        <td className="px-6 py-4 text-slate-500 dark:text-slate-400 align-middle">
                                            <div className="flex items-center gap-1.5">
                                                <Calendar className="w-3.5 h-3.5 text-blue-500" />
                                                <span>{new Date(req.createdAt).toLocaleDateString()}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right align-middle">
                                            <button 
                                                onClick={() => handleOpenReview(req)}
                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-emerald-500 hover:text-white dark:bg-slate-800 dark:hover:bg-emerald-500 text-gray-900 dark:text-white rounded-lg text-xs font-bold transition-all shadow-sm group"
                                            >
                                                <Eye className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
                                                Review
                                            </button>
                                        </td>
                                    </motion.tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </motion.div>

            {/* Mobile Cards View */}
            <div className="grid grid-cols-1 gap-4 md:hidden">
                {filteredRequests.length === 0 ? (
                    <div className="bg-white dark:bg-[#0E192D] rounded-2xl border border-gray-100 dark:border-slate-800 p-8 text-center text-slate-400 dark:text-slate-500">
                        No pending refund requests found.
                    </div>
                ) : (
                    filteredRequests.map((req) => (
                        <div key={req._id} className="bg-white dark:bg-[#0E192D] rounded-2xl border border-gray-100 dark:border-slate-800 p-5 space-y-4 shadow-sm">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h4 className="font-bold text-gray-900 dark:text-white text-base">{req.rvsfName}</h4>
                                    <span className="text-[9px] text-slate-400 font-mono uppercase font-medium">{req.rvsfId}</span>
                                </div>
                                <span className="font-extrabold text-emerald-600 dark:text-emerald-400 text-base">₹{req.amount}</span>
                            </div>
                            
                            <div className="bg-gray-50 dark:bg-slate-900/60 p-3 rounded-xl space-y-1.5 text-xs">
                                <p className="text-slate-500 dark:text-slate-400 flex justify-between">
                                    <span>Lead ID:</span>
                                    <span className="font-mono font-semibold text-gray-800 dark:text-gray-200">{req.leadId}</span>
                                </p>
                                <div className="text-slate-500 dark:text-slate-400 flex flex-col pt-1">
                                    <span className="font-semibold text-slate-700 dark:text-slate-300">Rejection Reason:</span>
                                    <p className="text-slate-600 dark:text-slate-400 italic line-clamp-2 mt-0.5">"{req.rejectionReason}"</p>
                                </div>
                            </div>

                            <div className="flex justify-between items-center pt-2 border-t border-gray-100 dark:border-slate-800">
                                <span className="text-[11px] text-slate-400 flex items-center gap-1">
                                    <Calendar className="w-3 h-3 text-blue-500" />
                                    {new Date(req.createdAt).toLocaleDateString()}
                                </span>
                                <button 
                                    onClick={() => handleOpenReview(req)}
                                    className="px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-lg text-xs transition-colors flex items-center gap-1 shadow-sm shadow-emerald-500/10"
                                >
                                    <Eye className="w-3.5 h-3.5" />
                                    Review
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Review Detail Slider / Modal */}
            <AnimatePresence>
                {selectedRequest && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={handleCloseReview}
                            className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm"
                        />

                        {/* Modal container */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 15 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 15 }}
                            className="relative w-full max-w-2xl bg-white dark:bg-[#0E192D] rounded-3xl shadow-2xl border border-gray-200 dark:border-slate-800 overflow-hidden z-10"
                        >
                            {/* Header */}
                            <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-900/50">
                                <div className="flex items-center gap-3">
                                    <div className="bg-emerald-500/10 p-2.5 rounded-2xl">
                                        <RefreshCcw className="w-5 h-5 text-emerald-500" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-black text-gray-900 dark:text-white tracking-tight">Refund Review</h3>
                                        <p className="text-xs text-gray-500 dark:text-slate-500 font-mono uppercase tracking-tight">ID: {selectedRequest._id.slice(-8)}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={handleCloseReview}
                                    disabled={isProcessing}
                                    className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Body */}
                            <div className="p-6 sm:p-8 space-y-6 max-h-[75vh] overflow-y-auto">
                                {/* Grid information cards */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="bg-gray-50 dark:bg-slate-900/40 p-4.5 rounded-2xl border border-gray-100 dark:border-slate-800 space-y-3">
                                        <div>
                                            <p className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-1.5"><User className="w-3 h-3 text-blue-500" /> RVSF Partner</p>
                                            <p className="text-base font-bold text-gray-900 dark:text-white mt-1">{selectedRequest.rvsfName}</p>
                                            <span className="text-[10px] text-slate-400 font-mono tracking-tight uppercase">{selectedRequest.rvsfId}</span>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-1.5"><FileText className="w-3 h-3 text-purple-500" /> Lead Details</p>
                                            <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 mt-1 font-mono">{selectedRequest.leadId}</p>
                                        </div>
                                    </div>

                                    <div className="bg-gray-50 dark:bg-slate-900/40 p-4.5 rounded-2xl border border-gray-100 dark:border-slate-800 space-y-3">
                                        <div>
                                            <p className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-1.5"><DollarSign className="w-3 h-3 text-emerald-500" /> Unlock Amount</p>
                                            <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-0.5">₹{selectedRequest.amount}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-1.5"><Calendar className="w-3 h-3 text-orange-500" /> Request Date</p>
                                            <p className="text-xs font-bold text-gray-700 dark:text-slate-300 mt-1">
                                                {new Date(selectedRequest.createdAt).toLocaleString()}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Payment Details Card */}
                                <div className="bg-slate-50 dark:bg-slate-900/30 p-5 rounded-2xl border border-gray-100 dark:border-slate-800 space-y-2">
                                    <h4 className="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                                        <CreditCard className="w-4 h-4 text-emerald-500" /> Payment Identifiers
                                    </h4>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1.5">
                                        <div>
                                            <span className="text-slate-400">Unlock Payment ID (Razorpay):</span>
                                            <p className="font-mono font-semibold text-gray-800 dark:text-gray-200 mt-0.5 truncate select-all">{selectedRequest.unlockPaymentId}</p>
                                        </div>
                                        {selectedRequest.razorpayOrderId && (
                                            <div>
                                                <span className="text-slate-400">Razorpay Order ID:</span>
                                                <p className="font-mono font-semibold text-gray-800 dark:text-gray-200 mt-0.5 truncate select-all">{selectedRequest.razorpayOrderId}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Rejection Reason Section */}
                                <div className="space-y-2">
                                    <h4 className="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                                        <AlertCircle className="w-4 h-4 text-red-500" /> Rejection Reason given by RVSF
                                    </h4>
                                    <div className="bg-red-50/40 dark:bg-red-950/10 p-5 rounded-2xl border border-red-100/60 dark:border-red-900/20">
                                        <p className="text-gray-800 dark:text-slate-300 text-sm leading-relaxed italic">
                                            "{selectedRequest.rejectionReason}"
                                        </p>
                                    </div>
                                </div>

                                {/* Review Actions Panel */}
                                <div className="pt-4 border-t border-gray-100 dark:border-slate-800">
                                    {!showDenyInput ? (
                                        <div className="flex flex-col sm:flex-row gap-3">
                                            <button
                                                onClick={handleApproveRefund}
                                                disabled={isProcessing}
                                                className="flex-1 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white font-extrabold py-3.5 px-6 rounded-2xl shadow-lg shadow-emerald-500/20 hover:shadow-xl transition-all flex items-center justify-center gap-2"
                                            >
                                                {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle className="w-5 h-5" />}
                                                Approve Refund
                                            </button>
                                            <button
                                                onClick={() => setShowDenyInput(true)}
                                                disabled={isProcessing}
                                                className="flex-1 bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white font-extrabold py-3.5 px-6 rounded-2xl shadow-lg shadow-red-500/20 hover:shadow-xl transition-all flex items-center justify-center gap-2"
                                            >
                                                <XCircle className="w-5 h-5" />
                                                Deny Refund
                                            </button>
                                        </div>
                                    ) : (
                                        <motion.div 
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: "auto" }}
                                            className="space-y-4"
                                        >
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-red-500 uppercase tracking-wider block">
                                                    Reason for Denial
                                                </label>
                                                <textarea
                                                    disabled={isProcessing}
                                                    rows={3}
                                                    placeholder="Explain why this refund request is being denied. This reason will be emailed directly to the RVSF Partner."
                                                    value={denialReason}
                                                    onChange={(e) => setDenialReason(e.target.value)}
                                                    className="w-full p-4 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500/40 text-gray-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500"
                                                />
                                            </div>
                                            <div className="flex flex-col sm:flex-row gap-3">
                                                <button
                                                    onClick={handleDenyRefundSubmit}
                                                    disabled={isProcessing || !denialReason.trim()}
                                                    className="flex-1 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-extrabold py-3 px-6 rounded-2xl transition-colors flex items-center justify-center gap-2"
                                                >
                                                    {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                                                    Confirm Denial & Send Email
                                                </button>
                                                <button
                                                    onClick={() => setShowDenyInput(false)}
                                                    disabled={isProcessing}
                                                    className="flex-1 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 font-bold py-3 px-6 rounded-2xl transition-colors text-slate-700 dark:text-slate-300"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        </motion.div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    )
}

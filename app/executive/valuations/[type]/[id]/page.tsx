"use client"

import { useEffect, useState, use } from "react"
import { useRouter } from "next/navigation"
import { 
    FileText, 
    Car, 
    User, 
    MapPin, 
    Calendar, 
    ChevronLeft, 
    Phone, 
    Hash, 
    Weight, 
    Image as ImageIcon, 
    MessageCircle, 
    Activity,
    CheckCircle,
    Trash2,
    Download,
    Send
} from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"
import { useToast } from "@/hooks/use-toast"
import { apiFetch } from "@/lib/fetch"

export default function ExecutiveLeadDetailPage({ params }: { params: Promise<{ type: string, id: string }> }) {
    const { type, id } = use(params)
    const [request, setRequest] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const { toast } = useToast()
    const router = useRouter()

    useEffect(() => {
        fetchRequest()
    }, [id])

    const fetchRequest = async () => {
        try {
            const res = await fetch(`/api/admin/valuations/${type}/${id}`)
            if (res.ok) {
                const data = await res.json()
                setRequest(data)
            }
        } catch (error) {
            console.error("Failed to fetch lead details")
        } finally {
            setLoading(false)
        }
    }

    const handleStatusUpdate = async (newStatus: string) => {
        if (!confirm(`Confirm Executive Authorization for status: ${newStatus.toUpperCase()}?`)) return

        try {
            const res = await apiFetch("/api/admin/requests/approve", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id: id, type: type, status: newStatus })
            })

            if (res.ok) {
                toast({
                    title: "Authorized",
                    description: `Lead status successfully transitioned to ${newStatus.toUpperCase()} by Executive Command.`
                })
                fetchRequest()
            }
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to authorize status transition.",
                variant: "destructive"
            })
        }
    }

    const handleDelete = async () => {
        if (!confirm("WARNING: Permanent Deletion. Proceed?")) return

        try {
            const res = await apiFetch(`/api/admin/requests/delete?id=${id}&type=${type}`, {
                method: "DELETE"
            })

            if (res.ok) {
                toast({
                    title: "Purged",
                    description: "Lead record permanently removed from database."
                })
                router.push(`/executive/valuations/${type}`)
            }
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to purge record.",
                variant: "destructive"
            })
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent animate-spin rounded-full"></div>
            </div>
        )
    }

    if (!request) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
                <Activity className="w-12 h-12 text-gray-200" />
                <div className="text-gray-500 font-bold uppercase tracking-widest text-xs">Record not found in database</div>
                <Link href="/executive/dashboard" className="text-black dark:text-white underline text-xs font-bold uppercase tracking-widest">Return to Terminal</Link>
            </div>
        )
    }

    return (
        <div className="max-w-5xl mx-auto space-y-8 pb-12">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-center gap-4">
                    <Link href={`/executive/valuations/${type}`} className="p-2 hover:bg-black dark:hover:bg-white hover:text-white dark:hover:text-black rounded-xl transition-all border border-transparent hover:border-black dark:hover:border-white">
                        <ChevronLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-3 tracking-tight uppercase">
                            <FileText className="w-6 h-6 text-blue-500" />
                            Lead Intelligence
                        </h1>
                        <div className="flex items-center gap-2 mt-2">
                            <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 text-[9px] font-black uppercase tracking-widest">
                                {type}
                            </span>
                            <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest border ${
                                request.status === 'approved' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' : 
                                request.status === 'approved_to_rvsf' ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20' :
                                request.status === 'completed' ? 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20' :
                                request.status === 'rejected' ? 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20' :
                                request.status === 'reviewing' ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20' :
                                'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20'
                            }`}>
                                {request.status === 'approved_to_rvsf' ? "Approved to RVSF's" : request.status === 'approved' ? 'Approved to CC' : request.status}
                            </span>
                        </div>
                    </div>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    <a
                        href={`https://wa.me/${(request.contact?.phone || request.customerPhone || request.phone || '').replace(/\D/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-6 py-3 bg-emerald-600 dark:bg-emerald-500 text-white rounded-xl font-black text-xs uppercase tracking-widest flex items-center gap-2 hover:opacity-80 transition-all shadow-lg"
                    >
                        <MessageCircle className="w-4 h-4" />
                        Chat
                    </a>

                    {/* Approve & Push to CC / RVSF */}
                    {request.status === 'approved' ? (
                        <div className="px-6 py-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 rounded-xl font-black text-xs uppercase tracking-widest flex items-center gap-2">
                            <CheckCircle className="w-4 h-4" />
                            Approved to CC
                        </div>
                    ) : request.status === 'approved_to_rvsf' ? (
                        <div className="px-6 py-3 bg-purple-500/10 border border-purple-500/30 text-purple-500 rounded-xl font-black text-xs uppercase tracking-widest flex items-center gap-2">
                            <CheckCircle className="w-4 h-4" />
                            Approved to RVSF's
                        </div>
                    ) : (
                        <div className="flex flex-wrap items-center gap-2">
                            <button
                                onClick={() => handleStatusUpdate('approved')}
                                className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-black text-xs uppercase tracking-widest flex items-center gap-2 transition-all shadow-lg shadow-blue-600/20 active:scale-[0.98]"
                            >
                                <Send className="w-4 h-4" />
                                Approve to CC
                            </button>
                            <button
                                onClick={() => handleStatusUpdate('approved_to_rvsf')}
                                className="px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-black text-xs uppercase tracking-widest flex items-center gap-2 transition-all shadow-lg shadow-purple-600/20 active:scale-[0.98]"
                            >
                                <Send className="w-4 h-4" />
                                Approve to RVSF's
                            </button>
                        </div>
                    )}

                    <div className="flex items-center gap-2 bg-black/20 dark:bg-black/40 p-1.5 rounded-xl border border-white/5">
                        <select 
                            value={request.status || "pending"} 
                            onChange={(e) => handleStatusUpdate(e.target.value)}
                            className="bg-transparent text-[10px] font-black uppercase tracking-[0.2em] text-white border-none focus:ring-0 cursor-pointer outline-none px-4"
                        >
                            <option value="pending" className="bg-zinc-900">Pending</option>
                            <option value="reviewing" className="bg-zinc-900">Reviewing</option>
                        </select>
                    </div>
                    <button
                        onClick={handleDelete}
                        className="px-6 py-3 bg-red-600 text-white rounded-xl font-black text-xs uppercase tracking-widest flex items-center gap-2 hover:opacity-80 transition-all shadow-lg"
                    >
                        <Trash2 className="w-4 h-4" />
                        Delete
                    </button>
                </div>
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Information Block 1 */}
                <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-white/5 p-8 space-y-6 shadow-sm">
                    <h2 className="text-xs font-black uppercase tracking-[0.2em] text-blue-600 dark:text-blue-400 border-b border-gray-50 dark:border-white/5 pb-4">Principal Subject Details</h2>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Entity Name</span>
                            <span className="text-sm font-black text-gray-900 dark:text-white uppercase">{request.customerName || request.name || request.contact?.name || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Verification ID</span>
                            <span className="text-xs font-mono text-gray-500 dark:text-white/40">{request._id}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Phone Link</span>
                            <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">{request.customerPhone || request.phone || request.contact?.phone || 'N/A'}</span>
                        </div>
                    </div>
                </div>

                {/* Information Block 2 */}
                <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-white/5 p-8 space-y-6 shadow-sm">
                    <h2 className="text-xs font-black uppercase tracking-[0.2em] text-blue-600 dark:text-blue-400 border-b border-gray-50 dark:border-white/5 pb-4">Asset Classification</h2>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Asset Type</span>
                            <span className="text-sm font-black text-gray-900 dark:text-white uppercase">{request.vehicleType || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Manufacturer</span>
                            <span className="text-sm font-black text-gray-900 dark:text-white uppercase">{request.brand || request.vehicleBrand || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Model Index</span>
                            <span className="text-sm font-black text-gray-900 dark:text-white uppercase">{request.model || request.vehicleModel || 'N/A'}</span>
                        </div>
                    </div>
                </div>

                {/* eKYC Information */}
                {(request.firstName || request.aadharNumber) && (
                    <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-white/5 p-8 space-y-6 shadow-sm">
                        <h2 className="text-xs font-black uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-400 border-b border-gray-50 dark:border-white/5 pb-4">Identity Verification (eKYC)</h2>
                        <div className="space-y-4">
                            {request.firstName && (
                                <div className="flex justify-between items-center">
                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Full Name</span>
                                    <span className="text-sm font-black text-gray-900 dark:text-white uppercase">{request.firstName} {request.lastName}</span>
                                </div>
                            )}
                            {request.aadharNumber && (
                                <div className="flex justify-between items-center">
                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Aadhar Index</span>
                                    <span className="text-xs font-mono text-gray-900 dark:text-white">{request.aadharNumber}</span>
                                </div>
                            )}
                            {request.dob && (
                                <div className="flex justify-between items-center">
                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Birth Registry</span>
                                    <span className="text-sm font-black text-gray-900 dark:text-white uppercase">{request.dob}</span>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* WhatsApp Strategy */}
                <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-white/5 p-8 space-y-6 shadow-sm">
                    <h2 className="text-xs font-black uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-400 border-b border-gray-50 dark:border-white/5 pb-4">Communication Hub</h2>
                    <div className="flex flex-col items-center justify-center py-4 text-center space-y-4">
                        <div className="p-4 bg-emerald-500/10 rounded-full">
                            <MessageCircle className="w-8 h-8 text-emerald-500" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-widest">Direct Line Established</p>
                            <p className="text-[10px] text-gray-500 dark:text-white/40 mt-1 max-w-[200px] mx-auto uppercase">Secure encryption via standard WhatsApp protocol.</p>
                        </div>
                        <a
                            href={`https://wa.me/${(request.contact?.phone || request.customerPhone || request.phone || '').replace(/\D/g, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-emerald-600 text-white px-6 py-3 rounded-full font-black text-[10px] uppercase tracking-widest hover:opacity-80 transition-all shadow-lg"
                        >
                            Open WhatsApp Link
                        </a>
                    </div>
                </div>

                {/* Documents Section */}
                {(request.aadharFile || request.rcFile || request.carPhoto) && (
                    <div className="md:col-span-2 bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-white/5 p-8 space-y-6 shadow-sm">
                        <h2 className="text-xs font-black uppercase tracking-[0.2em] text-blue-600 dark:text-blue-400 border-b border-gray-50 dark:border-white/5 pb-4">Document Repositories</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {[
                                { label: 'Aadhar Card', file: request.aadharFile },
                                { label: 'RC Document', file: request.rcFile },
                                { label: 'Asset Photo', file: request.carPhoto }
                            ].map((doc, idx) => doc.file && (
                                <div key={idx} className="p-4 bg-black/20 border border-white/5 rounded-xl space-y-3">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{doc.label}</p>
                                    <div className="flex items-center gap-4">
                                        <button
                                            onClick={() => window.open(doc.file, '_blank')}
                                            className="text-[10px] font-black text-blue-500 uppercase hover:underline"
                                        >
                                            View
                                        </button>
                                        <button
                                            onClick={() => window.open(doc.file.replace("/upload/", "/upload/fl_attachment/"), '_blank')}
                                            className="text-[10px] font-black text-gray-500 uppercase hover:text-white flex items-center gap-1"
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

                {/* Full Data Dump */}
                <div className="md:col-span-2 bg-gray-50 dark:bg-zinc-900/50 rounded-2xl border border-gray-100 dark:border-white/5 p-8 shadow-inner">
                     <h2 className="text-xs font-black uppercase tracking-[0.2em] text-gray-400 dark:text-white/20 mb-6">Complete Analytical Dataset</h2>
                     <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
                        {Object.entries(request).map(([key, value]) => {
                            if (typeof value !== 'string' && typeof value !== 'number') return null
                            if (['_id', 'createdAt', 'updatedAt', '__v'].includes(key)) return null
                            return (
                                <div key={key} className="space-y-1">
                                    <p className="text-[9px] font-black text-gray-400 dark:text-white/20 uppercase tracking-widest">{key.replace(/([A-Z])/g, ' $1')}</p>
                                    <p className="text-xs font-bold text-gray-900 dark:text-white uppercase">{value.toString()}</p>
                                </div>
                            )
                        })}
                     </div>
                </div>
            </div>
        </div>
    )
}

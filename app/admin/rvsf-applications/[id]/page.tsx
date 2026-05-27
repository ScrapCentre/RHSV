"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, ExternalLink, Calendar, Key, XCircle, FileText, CheckCircle, Clock } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function ApplicationDetailPage() {
    const params = useParams()
    const router = useRouter()
    const { toast } = useToast()
    const [app, setApp] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [actionLoading, setActionLoading] = useState(false)

    // Form states
    const [showKycForm, setShowKycForm] = useState(false)
    const [showRejectForm, setShowRejectForm] = useState(false)
    
    const [kycDate, setKycDate] = useState("")
    const [kycLink, setKycLink] = useState("")
    const [rejectReason, setRejectReason] = useState("")

    useEffect(() => {
        fetch(`/api/admin/rvsf-applications/${params.id}`)
            .then(res => res.json())
            .then(data => {
                if (data.data) setApp(data.data)
            })
            .catch(console.error)
            .finally(() => setLoading(false))
    }, [params.id])

    const handleAction = async (action: string, payload: any = {}) => {
        setActionLoading(true)
        try {
            const res = await fetch(`/api/admin/rvsf-applications/${params.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action, ...payload })
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.message || "Failed to update")
            
            toast({ title: "Success", description: data.message })
            router.push("/admin/rvsf-applications")
        } catch (err: any) {
            toast({ title: "Error", description: err.message, variant: "destructive" })
        } finally {
            setActionLoading(false)
        }
    }

    const submitKyc = (e: React.FormEvent) => {
        e.preventDefault()
        if (!kycDate || !kycLink) return toast({ title: "Missing fields", variant: "destructive" })
        handleAction("schedule_kyc", { date: kycDate, meetLink: kycLink })
    }

    const submitReject = (e: React.FormEvent) => {
        e.preventDefault()
        if (!rejectReason) return toast({ title: "Missing reason", variant: "destructive" })
        handleAction("reject", { reason: rejectReason })
    }

    if (loading) return <div className="p-8 text-center text-slate-500">Loading details...</div>
    if (!app) return <div className="p-8 text-center text-slate-500">Application not found.</div>

    return (
        <div className="space-y-6 max-w-5xl mx-auto pb-10">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/admin/rvsf-applications">
                        <button className="p-2 bg-white dark:bg-[#0E192D] border border-gray-200 dark:border-slate-800 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors">
                            <ArrowLeft className="w-5 h-5 text-slate-500" />
                        </button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">{app.legalEntityName}</h1>
                        <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">Application ID: {app._id}</p>
                    </div>
                </div>
                <div>
                    <span className="px-4 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-full text-xs font-bold uppercase tracking-wider border border-slate-200 dark:border-slate-700">
                        Status: {app.status.replace("_", " ")}
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Details Column */}
                <div className="lg:col-span-2 space-y-6">
                    
                    {/* Identity Details */}
                    <div className="bg-white dark:bg-[#0E192D] rounded-2xl border border-gray-100 dark:border-slate-800 p-6">
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2"><FileText className="w-5 h-5 text-[#E31E24]"/> Identity Details</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <DetailItem label="Legal Entity Name" value={app.legalEntityName} />
                            <DetailItem label="Business Email" value={app.businessEmail} />
                            <DetailItem label="Phone Number" value={app.phoneNumber} />
                            <DetailItem label="GST Number" value={app.gstNumber} />
                            <DetailItem label="PAN Number" value={app.panNumber} />
                            <DetailItem label="CPCB Auth No." value={app.cpcbAuthNumber} />
                            <DetailItem label="MoRTH Auth No." value={app.morthAuthNumber} />
                        </div>
                    </div>

                    {/* KYC Documents */}
                    <div className="bg-white dark:bg-[#0E192D] rounded-2xl border border-gray-100 dark:border-slate-800 p-6">
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2"><FileText className="w-5 h-5 text-emerald-500"/> KYC Documents</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <DocLink label="GST Certificate" url={app.gstCertificateUrl} />
                            <DocLink label="CPCB Letter" url={app.cpcbLetterUrl} />
                            <DocLink label="MoRTH Certificate" url={app.morthCertificateUrl} />
                            <DocLink label="PAN Card" url={app.panCardUrl} />
                        </div>
                    </div>

                    {/* Bank Details */}
                    <div className="bg-white dark:bg-[#0E192D] rounded-2xl border border-gray-100 dark:border-slate-800 p-6">
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2"><FileText className="w-5 h-5 text-blue-500"/> Bank Details</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <DetailItem label="Account Holder" value={app.accountHolderName} />
                            <DetailItem label="Bank Name" value={app.bankName} />
                            <DetailItem label="Account Number" value={app.accountNumber} />
                            <DetailItem label="IFSC Code" value={app.ifscCode} />
                            <DetailItem label="Account Type" value={app.accountType} />
                        </div>
                    </div>
                </div>

                {/* Actions Column */}
                <div className="space-y-6">
                    <div className="bg-white dark:bg-[#0E192D] rounded-2xl border border-gray-100 dark:border-slate-800 p-6 sticky top-24">
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Actions</h2>
                        
                        <div className="space-y-3">
                            <button onClick={() => { setShowKycForm(!showKycForm); setShowRejectForm(false) }} 
                                disabled={app.status !== "pending_review" && app.status !== "pending"}
                                className="w-full flex items-center justify-center gap-2 py-3 bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded-xl font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                                <Calendar className="w-4 h-4" /> Schedule KYC Call
                            </button>

                            <button onClick={() => handleAction("activate")} 
                                disabled={app.status === "activated" || app.status === "rejected"}
                                className="w-full flex items-center justify-center gap-2 py-3 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-xl font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                                <Key className="w-4 h-4" /> Activate RVSF
                            </button>

                            <button onClick={() => { setShowRejectForm(!showRejectForm); setShowKycForm(false) }} 
                                disabled={app.status === "rejected" || app.status === "activated"}
                                className="w-full flex items-center justify-center gap-2 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 rounded-xl font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                                <XCircle className="w-4 h-4" /> Reject Application
                            </button>
                        </div>

                        {showKycForm && (
                            <form onSubmit={submitKyc} className="mt-6 space-y-4 p-4 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl">
                                <h3 className="font-bold text-sm text-gray-900 dark:text-white mb-2">Schedule Call</h3>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 mb-1">Date & Time</label>
                                    <input type="datetime-local" required value={kycDate} onChange={e => setKycDate(e.target.value)}
                                        className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-gray-200 dark:border-slate-700 rounded-lg text-sm outline-none focus:border-blue-500" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 mb-1">Meet Link</label>
                                    <input type="url" placeholder="https://meet.google.com/..." required value={kycLink} onChange={e => setKycLink(e.target.value)}
                                        className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-gray-200 dark:border-slate-700 rounded-lg text-sm outline-none focus:border-blue-500" />
                                </div>
                                <button disabled={actionLoading} className="w-full py-2 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-lg text-sm disabled:opacity-50">
                                    {actionLoading ? "Sending..." : "Confirm & Send Email"}
                                </button>
                            </form>
                        )}

                        {showRejectForm && (
                            <form onSubmit={submitReject} className="mt-6 space-y-4 p-4 bg-red-50 dark:bg-red-500/5 border border-red-200 dark:border-red-500/20 rounded-xl">
                                <h3 className="font-bold text-sm text-red-600 dark:text-red-400 mb-2">Reject Application</h3>
                                <div>
                                    <label className="block text-xs font-bold text-red-500 dark:text-red-400 mb-1">Reason for Rejection</label>
                                    <textarea required value={rejectReason} onChange={e => setRejectReason(e.target.value)} placeholder="Explain why..." rows={3}
                                        className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-red-200 dark:border-red-500/30 rounded-lg text-sm outline-none focus:border-red-500 resize-none" />
                                </div>
                                <button disabled={actionLoading} className="w-full py-2 bg-red-500 hover:bg-red-600 text-white font-bold rounded-lg text-sm disabled:opacity-50">
                                    {actionLoading ? "Processing..." : "Reject & Notify"}
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

function DetailItem({ label, value }: { label: string, value: string }) {
    return (
        <div className="bg-gray-50 dark:bg-slate-900 border border-gray-100 dark:border-slate-800 p-3 rounded-xl">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">{label}</p>
            <p className="text-sm font-semibold text-gray-900 dark:text-white break-words">{value}</p>
        </div>
    )
}

function DocLink({ label, url }: { label: string, url: string }) {
    return (
        <a href={url} target="_blank" rel="noreferrer" className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-xl hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all group">
            <span className="font-semibold text-sm text-gray-700 dark:text-slate-300 group-hover:text-emerald-600 dark:group-hover:text-emerald-400">{label}</span>
            <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-emerald-500" />
        </a>
    )
}

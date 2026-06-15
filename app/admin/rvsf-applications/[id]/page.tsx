"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { 
    ArrowLeft, ExternalLink, Calendar, Key, XCircle, 
    FileText, CheckCircle2, Clock, Edit3, Save, X, 
    Building2, Landmark, ShieldCheck, Mail, Phone, MapPin, 
    Loader2, AlertCircle
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function ApplicationDetailPage() {
    const params = useParams()
    const router = useRouter()
    const { toast } = useToast()
    const [app, setApp] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [actionLoading, setActionLoading] = useState(false)
    const [isEditing, setIsEditing] = useState(false)

    // Form states for scheduling/rejection
    const [showKycForm, setShowKycForm] = useState(false)
    const [showRejectForm, setShowRejectForm] = useState(false)
    const [kycDate, setKycDate] = useState("")
    const [kycLink, setKycLink] = useState("")
    const [rejectReason, setRejectReason] = useState("")

    // Form states for RVSF editing
    const [formData, setFormData] = useState({
        legalEntityName: "",
        businessEmail: "",
        phoneNumber: "",
        gstNumber: "",
        panNumber: "",
        cpcbAuthNumber: "",
        morthAuthNumber: "",
        registeredAddress: "",
        city: "",
        state: "",
        pincode: "",
        accountHolderName: "",
        bankName: "",
        accountNumber: "",
        ifscCode: "",
        accountType: "savings" as "savings" | "current"
    })

    const fetchDetails = () => {
        setLoading(true)
        fetch(`/api/admin/rvsf-applications/${params.id}`)
            .then(res => res.json())
            .then(data => {
                if (data.data) {
                    setApp(data.data)
                    setFormData({
                        legalEntityName: data.data.legalEntityName || "",
                        businessEmail: data.data.businessEmail || "",
                        phoneNumber: data.data.phoneNumber || "",
                        gstNumber: data.data.gstNumber || "",
                        panNumber: data.data.panNumber || "",
                        cpcbAuthNumber: data.data.cpcbAuthNumber || "",
                        morthAuthNumber: data.data.morthAuthNumber || "",
                        registeredAddress: data.data.registeredAddress || "",
                        city: data.data.city || "",
                        state: data.data.state || "",
                        pincode: data.data.pincode?.toString() || "",
                        accountHolderName: data.data.accountHolderName || "",
                        bankName: data.data.bankName || "",
                        accountNumber: data.data.accountNumber || "",
                        ifscCode: data.data.ifscCode || "",
                        accountType: data.data.accountType || "savings"
                    })
                }
            })
            .catch(console.error)
            .finally(() => setLoading(false))
    }

    useEffect(() => {
        fetchDetails()
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
            if (action === "edit_details") {
                setIsEditing(false)
                fetchDetails()
            } else {
                router.push("/admin/rvsf-applications")
            }
        } catch (err: any) {
            toast({ title: "Error", description: err.message, variant: "destructive" })
        } finally {
            setActionLoading(false)
        }
    }

    const saveDetails = (e: React.FormEvent) => {
        e.preventDefault()
        handleAction("edit_details", formData)
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

    if (loading) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
                <Loader2 className="w-10 h-10 text-[#E31E24] animate-spin" />
                <p className="text-sm font-semibold text-slate-500 animate-pulse">Loading application details...</p>
            </div>
        )
    }

    if (!app) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3 max-w-md mx-auto text-center">
                <AlertCircle className="w-12 h-12 text-red-500" />
                <h2 className="text-xl font-bold text-slate-800">Application Not Found</h2>
                <p className="text-sm text-slate-500">The requested RVSF application record does not exist or has been deleted.</p>
                <Link href="/admin/rvsf-applications" className="mt-4 px-5 py-2.5 bg-[#E31E24] text-white font-bold rounded-xl text-sm shadow-lg shadow-red-600/10">
                    Back to Applications
                </Link>
            </div>
        )
    }

    const getStatusStyle = (status: string) => {
        switch (status) {
            case "activated":
                return "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20"
            case "rejected":
                return "bg-red-50 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20"
            case "under_review":
                return "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20"
            default:
                return "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20"
        }
    }

    return (
        <div className="space-y-6 max-w-6xl mx-auto pb-16 px-4 sm:px-6 lg:px-8 font-sans selection:bg-[#E31E24]/10 selection:text-[#E31E24]">
            
            {/* Top Navigation / Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
                <div className="flex items-center gap-3">
                    <Link href="/admin/rvsf-applications">
                        <button className="p-2.5 bg-white dark:bg-[#0E192D] border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 hover:scale-105 active:scale-95 transition-all shadow-sm">
                            <ArrowLeft className="w-5 h-5 text-slate-500" />
                        </button>
                    </Link>
                    <div>
                        <div className="flex items-center gap-2 flex-wrap">
                            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">{app.legalEntityName}</h1>
                            <span className={`px-2.5 py-0.5 border rounded-full text-[10px] font-extrabold uppercase tracking-widest ${getStatusStyle(app.status)}`}>
                                {app.status.replace("_", " ")}
                            </span>
                        </div>
                        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Application ID: <code className="font-mono text-[11px] bg-slate-50 dark:bg-slate-900 px-1 py-0.5 rounded border border-slate-100 dark:border-slate-800">{app._id}</code></p>
                    </div>
                </div>

                <div className="flex gap-2">
                    {!isEditing ? (
                        <button
                            onClick={() => setIsEditing(true)}
                            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white text-sm font-bold rounded-xl shadow-md transition-all hover:scale-[1.02] active:scale-[0.98]"
                        >
                            <Edit3 className="w-4 h-4" /> Edit Details
                        </button>
                    ) : (
                        <>
                            <button
                                type="button"
                                onClick={() => setIsEditing(false)}
                                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white dark:bg-[#0E192D] border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-sm font-bold rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all active:scale-[0.98]"
                            >
                                <X className="w-4 h-4" /> Cancel
                            </button>
                            <button
                                type="button"
                                onClick={saveDetails}
                                disabled={actionLoading}
                                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-[#E31E24] hover:bg-[#c9181d] text-white text-sm font-bold rounded-xl shadow-lg shadow-red-600/10 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
                            >
                                {actionLoading ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <Save className="w-4 h-4" />
                                )}
                                Save Changes
                            </button>
                        </>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                
                {/* Details Column */}
                <div className="lg:col-span-2 space-y-6">
                    
                    {/* Identity Details Card */}
                    <div className={`bg-white dark:bg-[#0E192D] rounded-2xl border p-5 sm:p-6 shadow-sm transition-colors ${isEditing ? 'border-[#E31E24]/30 bg-red-50/5' : 'border-slate-100 dark:border-slate-800'}`}>
                        <div className="flex items-center gap-2 border-b border-slate-50 dark:border-slate-800 pb-4 mb-4">
                            <Building2 className="w-5 h-5 text-[#E31E24]" />
                            <h2 className="text-base font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">Identity & Authorization</h2>
                        </div>
                        
                        {isEditing ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormInput label="Legal Entity Name" value={formData.legalEntityName} onChange={val => setFormData(prev => ({ ...prev, legalEntityName: val }))} />
                                <FormInput label="Business Email" type="email" value={formData.businessEmail} onChange={val => setFormData(prev => ({ ...prev, businessEmail: val }))} />
                                <FormInput label="Phone Number" type="tel" value={formData.phoneNumber} onChange={val => setFormData(prev => ({ ...prev, phoneNumber: val }))} />
                                <FormInput label="GST Number" value={formData.gstNumber} onChange={val => setFormData(prev => ({ ...prev, gstNumber: val }))} />
                                <FormInput label="PAN Number" value={formData.panNumber} onChange={val => setFormData(prev => ({ ...prev, panNumber: val }))} />
                                <FormInput label="CPCB Auth Number" value={formData.cpcbAuthNumber} onChange={val => setFormData(prev => ({ ...prev, cpcbAuthNumber: val }))} />
                                <FormInput label="MoRTH Auth Number" value={formData.morthAuthNumber} onChange={val => setFormData(prev => ({ ...prev, morthAuthNumber: val }))} />
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <DisplayItem icon={<Building2 className="w-4 h-4 text-slate-400" />} label="Legal Entity Name" value={app.legalEntityName} />
                                <DisplayItem icon={<Mail className="w-4 h-4 text-slate-400" />} label="Business Email" value={app.businessEmail} />
                                <DisplayItem icon={<Phone className="w-4 h-4 text-slate-400" />} label="Phone Number" value={app.phoneNumber} />
                                <DisplayItem icon={<ShieldCheck className="w-4 h-4 text-slate-400" />} label="GST Number" value={app.gstNumber} />
                                <DisplayItem icon={<FileText className="w-4 h-4 text-slate-400" />} label="PAN Number" value={app.panNumber} />
                                <DisplayItem icon={<ShieldCheck className="w-4 h-4 text-slate-400" />} label="CPCB Auth No." value={app.cpcbAuthNumber} />
                                <DisplayItem icon={<ShieldCheck className="w-4 h-4 text-slate-400" />} label="MoRTH Auth No." value={app.morthAuthNumber} />
                            </div>
                        )}
                    </div>

                    {/* Address Details Card */}
                    <div className={`bg-white dark:bg-[#0E192D] rounded-2xl border p-5 sm:p-6 shadow-sm transition-colors ${isEditing ? 'border-[#E31E24]/30 bg-red-50/5' : 'border-slate-100 dark:border-slate-800'}`}>
                        <div className="flex items-center gap-2 border-b border-slate-50 dark:border-slate-800 pb-4 mb-4">
                            <MapPin className="w-5 h-5 text-indigo-500" />
                            <h2 className="text-base font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">Registered Office Address</h2>
                        </div>

                        {isEditing ? (
                            <div className="space-y-4">
                                <FormInput label="Registered Address" value={formData.registeredAddress} onChange={val => setFormData(prev => ({ ...prev, registeredAddress: val }))} />
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <FormInput label="City" value={formData.city} onChange={val => setFormData(prev => ({ ...prev, city: val }))} />
                                    <FormInput label="State" value={formData.state} onChange={val => setFormData(prev => ({ ...prev, state: val }))} />
                                    <FormInput label="Pincode" type="number" value={formData.pincode} onChange={val => setFormData(prev => ({ ...prev, pincode: val }))} />
                                </div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="md:col-span-2">
                                    <DisplayItem icon={<MapPin className="w-4 h-4 text-slate-400" />} label="Registered Address" value={app.registeredAddress} />
                                </div>
                                <DisplayItem icon={<MapPin className="w-4 h-4 text-slate-400" />} label="City / State" value={`${app.city}, ${app.state}`} />
                                <DisplayItem icon={<MapPin className="w-4 h-4 text-slate-400" />} label="Pincode" value={app.pincode} />
                            </div>
                        )}
                    </div>

                    {/* Bank Details Card */}
                    <div className={`bg-white dark:bg-[#0E192D] rounded-2xl border p-5 sm:p-6 shadow-sm transition-colors ${isEditing ? 'border-[#E31E24]/30 bg-red-50/5' : 'border-slate-100 dark:border-slate-800'}`}>
                        <div className="flex items-center gap-2 border-b border-slate-50 dark:border-slate-800 pb-4 mb-4">
                            <Landmark className="w-5 h-5 text-blue-500" />
                            <h2 className="text-base font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">Bank Details</h2>
                        </div>

                        {isEditing ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormInput label="Account Holder" value={formData.accountHolderName} onChange={val => setFormData(prev => ({ ...prev, accountHolderName: val }))} />
                                <FormInput label="Bank Name" value={formData.bankName} onChange={val => setFormData(prev => ({ ...prev, bankName: val }))} />
                                <FormInput label="Account Number" value={formData.accountNumber} onChange={val => setFormData(prev => ({ ...prev, accountNumber: val }))} />
                                <FormInput label="IFSC Code" value={formData.ifscCode} onChange={val => setFormData(prev => ({ ...prev, ifscCode: val }))} />
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">Account Type</label>
                                    <select
                                        value={formData.accountType}
                                        onChange={e => setFormData(prev => ({ ...prev, accountType: e.target.value as any }))}
                                        className="w-full bg-slate-50/50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:border-[#E31E24]/60 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white outline-none transition-all font-medium"
                                    >
                                        <option value="savings">Savings</option>
                                        <option value="current">Current</option>
                                    </select>
                                </div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <DisplayItem icon={<Landmark className="w-4 h-4 text-slate-400" />} label="Account Holder" value={app.accountHolderName} />
                                <DisplayItem icon={<Landmark className="w-4 h-4 text-slate-400" />} label="Bank Name" value={app.bankName} />
                                <DisplayItem icon={<FileText className="w-4 h-4 text-slate-400" />} label="Account Number" value={app.accountNumber} />
                                <DisplayItem icon={<ShieldCheck className="w-4 h-4 text-slate-400" />} label="IFSC Code" value={app.ifscCode} />
                                <DisplayItem icon={<Landmark className="w-4 h-4 text-slate-400" />} label="Account Type" value={app.accountType} className="capitalize" />
                            </div>
                        )}
                    </div>

                    {/* KYC Documents Card */}
                    <div className="bg-white dark:bg-[#0E192D] rounded-2xl border border-slate-100 dark:border-slate-800 p-5 sm:p-6 shadow-sm">
                        <div className="flex items-center gap-2 border-b border-slate-50 dark:border-slate-800 pb-4 mb-4">
                            <FileText className="w-5 h-5 text-emerald-500" />
                            <h2 className="text-base font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">KYC Verification Documents</h2>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <DocLink label="GST Certificate" url={app.gstCertificateUrl} />
                            <DocLink label="CPCB Letter" url={app.cpcbLetterUrl} />
                            <DocLink label="MoRTH Certificate" url={app.morthCertificateUrl} />
                            <DocLink label="PAN Card" url={app.panCardUrl} />
                        </div>
                    </div>

                </div>

                {/* Actions Sidebar */}
                <div className="space-y-6 lg:sticky lg:top-24">
                    
                    {/* Action Cards */}
                    <div className="bg-white dark:bg-[#0E192D] rounded-2xl border border-slate-100 dark:border-slate-800 p-5 sm:p-6 shadow-sm">
                        <h2 className="text-base font-extrabold text-slate-900 dark:text-white uppercase tracking-wider border-b border-slate-50 dark:border-slate-800 pb-4 mb-5">Application Actions</h2>
                        
                        <div className="space-y-3">
                            <button 
                                onClick={() => { setShowKycForm(!showKycForm); setShowRejectForm(false) }} 
                                disabled={app.status !== "pending_review" && app.status !== "pending"}
                                className="w-full flex items-center justify-center gap-2 py-3 bg-blue-50 hover:bg-blue-100 text-blue-600 dark:bg-blue-500/10 dark:hover:bg-blue-500/20 dark:text-blue-400 rounded-xl font-bold transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 text-sm"
                            >
                                <Calendar className="w-4.5 h-4.5" /> Schedule KYC Call
                            </button>

                            <button 
                                onClick={() => handleAction("activate")} 
                                disabled={app.status === "activated" || app.status === "rejected" || actionLoading}
                                className="w-full flex items-center justify-center gap-2 py-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 dark:bg-emerald-500/10 dark:hover:bg-emerald-500/20 dark:text-emerald-400 rounded-xl font-bold transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 text-sm"
                            >
                                {actionLoading ? (
                                    <Loader2 className="w-4.5 h-4.5 animate-spin" />
                                ) : (
                                    <Key className="w-4.5 h-4.5" />
                                )}
                                Activate RVSF Account
                            </button>

                            <button 
                                onClick={() => { setShowRejectForm(!showRejectForm); setShowKycForm(false) }} 
                                disabled={app.status === "rejected" || app.status === "activated"}
                                className="w-full flex items-center justify-center gap-2 py-3 bg-red-50 hover:bg-red-100 text-red-600 dark:bg-red-500/10 dark:hover:bg-red-500/20 dark:text-red-400 rounded-xl font-bold transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 text-sm"
                            >
                                <XCircle className="w-4.5 h-4.5" /> Reject Application
                            </button>
                        </div>

                        {/* Schedule KYC Form */}
                        {showKycForm && (
                            <form onSubmit={submitKyc} className="mt-5 space-y-4 p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
                                <h3 className="font-extrabold text-xs text-slate-800 dark:text-white uppercase tracking-wider mb-2">Schedule KYC Video Call</h3>
                                <div className="space-y-1.5">
                                    <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">Date & Time</label>
                                    <input 
                                        type="datetime-local" 
                                        required 
                                        value={kycDate} 
                                        onChange={e => setKycDate(e.target.value)}
                                        className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm outline-none focus:border-blue-500 text-slate-950 dark:text-white font-medium" 
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">Google Meet Link</label>
                                    <input 
                                        type="url" 
                                        placeholder="https://meet.google.com/..." 
                                        required 
                                        value={kycLink} 
                                        onChange={e => setKycLink(e.target.value)}
                                        className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm outline-none focus:border-blue-500 text-slate-950 dark:text-white font-medium" 
                                    />
                                </div>
                                <button 
                                    disabled={actionLoading} 
                                    className="w-full py-2.5 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-lg text-xs uppercase tracking-wider transition-all disabled:opacity-50"
                                >
                                    {actionLoading ? "Scheduling..." : "Confirm & Notify Admin"}
                                </button>
                            </form>
                        )}

                        {/* Reject Application Form */}
                        {showRejectForm && (
                            <form onSubmit={submitReject} className="mt-5 space-y-4 p-4 bg-red-50/50 dark:bg-red-500/5 border border-red-200 dark:border-red-500/20 rounded-xl">
                                <h3 className="font-extrabold text-xs text-red-600 dark:text-red-400 uppercase tracking-wider mb-2">Reject Registration</h3>
                                <div className="space-y-1.5">
                                    <label className="block text-[10px] font-bold text-red-500 dark:text-red-400 uppercase tracking-widest ml-1">Reason for Rejection</label>
                                    <textarea 
                                        required 
                                        value={rejectReason} 
                                        onChange={e => setRejectReason(e.target.value)} 
                                        placeholder="Please provide details for the rejection email..." 
                                        rows={4}
                                        className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-red-200 dark:border-red-500/20 rounded-lg text-sm outline-none focus:border-red-500 text-slate-950 dark:text-white font-medium resize-none" 
                                    />
                                </div>
                                <button 
                                    disabled={actionLoading} 
                                    className="w-full py-2.5 bg-red-500 hover:bg-red-600 text-white font-bold rounded-lg text-xs uppercase tracking-wider transition-all disabled:opacity-50"
                                >
                                    {actionLoading ? "Processing..." : "Reject & Send Email"}
                                </button>
                            </form>
                        )}
                    </div>
                </div>

            </div>
        </div>
    )
}

function FormInput({ label, type = "text", value, onChange }: { label: string, type?: string, value: string, onChange: (val: string) => void }) {
    return (
        <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">{label}</label>
            <input
                type={type}
                value={value}
                onChange={e => onChange(e.target.value)}
                className="w-full bg-slate-50/50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:border-[#E31E24]/60 focus:bg-white dark:focus:bg-slate-950 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white outline-none transition-all placeholder:text-slate-400 font-medium"
            />
        </div>
    )
}

function DisplayItem({ icon, label, value, className = "" }: { icon: React.ReactNode, label: string, value: string, className?: string }) {
    return (
        <div className="flex items-start gap-3 bg-slate-50/50 dark:bg-slate-900 border border-slate-100/80 dark:border-slate-800/80 p-3.5 rounded-xl hover:border-slate-200 dark:hover:border-slate-700 transition-colors">
            <div className="mt-0.5 p-1 bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-100 dark:border-slate-800">
                {icon}
            </div>
            <div className="min-w-0">
                <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-0.5">{label}</p>
                <p className={`text-sm font-semibold text-slate-800 dark:text-slate-200 break-words ${className}`}>{value || "—"}</p>
            </div>
        </div>
    )
}

function DocLink({ label, url }: { label: string, url: string }) {
    return (
        <a 
            href={url} 
            target="_blank" 
            rel="noreferrer" 
            className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all group shadow-sm hover:scale-[1.01]"
        >
            <span className="font-semibold text-sm text-slate-700 dark:text-slate-300 group-hover:text-emerald-600 dark:group-hover:text-emerald-400">{label}</span>
            <ExternalLink className="w-4.5 h-4.5 text-slate-400 group-hover:text-emerald-500 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </a>
    )
}

"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import {
    Database,
    ArrowLeft,
    Car,
    Hash,
    Scale,
    Calendar,
    User,
    Mail,
    CheckCircle,
    Download,
    Send,
    XCircle
} from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"

interface VehicleEntry {
    vehicleType: string
    weight: string
    registrationNumber: string
}

interface BulkOutsourcingDoc {
    _id: string
    partnerId: string
    partnerName: string
    partnerEmail: string
    entries: VehicleEntry[]
    status: string
    createdAt: string
    updatedAt: string
}

export default function BulkOutsourcingAdminDetailsPage() {
    const params = useParams()
    const router = useRouter()
    const id = params.id as string

    const [submission, setSubmission] = useState<BulkOutsourcingDoc | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        if (id) {
            fetchSubmission()
        }
    }, [id])

    const fetchSubmission = async () => {
        setIsLoading(true)
        try {
            const res = await fetch(`/api/admin/bulk-outsourcing/${id}`)
            const data = await res.json()
            if (data.success) {
                setSubmission(data.data)
            }
        } catch (error) {
            console.error("Failed to fetch bulk outsourcing submission details:", error)
        } finally {
            setIsLoading(false)
        }
    }

    const handleApprove = async () => {
        try {
            const res = await fetch(`/api/admin/bulk-outsourcing/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'approved' })
            });
            const data = await res.json();
            if (data.success) {
                setSubmission(prev => prev ? { ...prev, status: 'approved' } : null);
            }
        } catch (error) {
            console.error("Failed to approve:", error);
        }
    }

    const handleDelete = async () => {
        if (!confirm("Are you sure you want to reject and delete this submission?")) return;

        try {
            const res = await fetch(`/api/admin/bulk-outsourcing/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'rejected' })
            });
            const data = await res.json();
            if (data.success) {
                setSubmission(prev => prev ? { ...prev, status: 'rejected' } : null);
            } else {
                alert(data.message || "Failed to reject submission");
            }
        } catch (error) {
            console.error("Failed to reject:", error);
            alert("An error occurred while rejecting the submission");
        }
    }

    const getStatusStyle = (status: string) => {
        switch (status.toLowerCase()) {
            case 'pending':
                return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800/30'
            case 'reviewed':
                return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800/30'
            case 'approved':
                return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/30'
            case 'rejected':
                return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800/30'
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-slate-800 dark:text-slate-300 border-gray-200 dark:border-slate-700'
        }
    }

    const handleDownloadCSV = () => {
        if (!submission) return

        // Create CSV Header
        const headers = ["Vehicle Type", "Weight", "Registration Number"]

        // Map entries to CSV rows
        const rows = submission.entries.map(entry =>
            `"${entry.vehicleType}","${entry.weight}","${entry.registrationNumber}"`
        )

        // Combine
        const csvContent = [headers.join(","), ...rows].join("\n")

        // Create a Blob and trigger download
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
        const url = URL.createObjectURL(blob)
        const link = document.createElement("a")
        link.setAttribute("href", url)
        link.setAttribute("download", `Batch_${submission._id.slice(-6).toUpperCase()}_Vehicles.csv`)
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }

    const handleExportToMail = () => {
        if (!submission) return

        const subject = encodeURIComponent(`Batch Review Details - ${submission.partnerName} (${submission._id.slice(-6).toUpperCase()})`)

        const bodyText = [
            `Partner Name: ${submission.partnerName}`,
            `Partner Email: ${submission.partnerEmail}`,
            `Submitted: ${format(new Date(submission.createdAt), "MMM d, yyyy h:mm a")}`,
            `Total Entries: ${submission.entries.length}`,
            ``,
            `--- VEHICLE ENTRIES ---`,
            ...submission.entries.map((entry, index) =>
                `${index + 1}. Type: ${entry.vehicleType} | Weight: ${entry.weight} | Reg: ${entry.registrationNumber}`
            )
        ].join("\n")

        const encodedBody = encodeURIComponent(bodyText)

        // Open Gmail explicitly in a new tab instead of generic mailto handler
        const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&su=${subject}&body=${encodedBody}`;
        window.open(gmailUrl, '_blank');
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center p-12 mt-20">
                <div className="flex flex-col items-center">
                    <div className="w-10 h-10 rounded-full border-4 border-purple-500 border-t-transparent animate-spin mb-4" />
                    <p className="text-gray-500 dark:text-slate-400 font-medium">Loading details...</p>
                </div>
            </div>
        )
    }

    if (!submission) {
        return (
            <div className="max-w-4xl mx-auto flex flex-col items-center justify-center p-12 bg-white dark:bg-[#0E192D] rounded-3xl border border-gray-100 dark:border-slate-800 text-center mt-8 shadow-sm">
                <div className="w-20 h-20 bg-gray-50 dark:bg-slate-900 rounded-full flex items-center justify-center mb-6">
                    <Database className="w-10 h-10 text-gray-400 dark:text-slate-500" />
                </div>
                <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-2 tracking-tight">Submission Not Found</h2>
                <p className="text-gray-500 dark:text-slate-400 mb-8 font-medium max-w-sm">The bulk outsourcing submission you are looking for does not exist or has been removed.</p>
                <Link href="/admin/bulk-outsourcing" className="px-6 py-3.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl transition-all shadow-md shadow-purple-600/20">
                    Back to All Submissions
                </Link>
            </div>
        )
    }

    return (
        <div className="max-w-5xl mx-auto space-y-6 pb-12 px-4 sm:px-6 lg:px-0">
            {/* Header: Title left, 2×2 buttons right */}
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">

                {/* Left: Back + Title */}
                <div className="flex items-start gap-3">
                    <Link href="/admin/bulk-outsourcing" className="mt-1 p-2 hover:bg-gray-200 dark:hover:bg-slate-800 rounded-xl transition-colors group shrink-0">
                        <ArrowLeft className="w-5 h-5 text-gray-500 dark:text-slate-400 group-hover:text-gray-900 dark:group-hover:text-white transition-colors" />
                    </Link>
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white flex items-center gap-2 sm:gap-3 tracking-tight leading-tight">
                            <Database className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600 dark:text-purple-400 shrink-0" />
                            Batch Review Details
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400 mt-1 font-medium text-sm sm:text-base">Review the complete list of vehicles submitted by the partner.</p>
                    </div>
                </div>

                {/* Right: 2×2 action button grid */}
                <div className="grid grid-cols-2 gap-2 sm:shrink-0">
                    {/* Row 1: Download + Export */}
                    <button
                        onClick={handleDownloadCSV}
                        className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800 rounded-xl font-bold text-sm transition-all shadow-sm whitespace-nowrap"
                    >
                        <Download className="w-4 h-4 shrink-0" />
                        <span>Download CSV</span>
                    </button>
                    <button
                        onClick={handleExportToMail}
                        className="flex items-center justify-center gap-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold text-sm transition-all shadow-md shadow-purple-600/20 whitespace-nowrap"
                    >
                        <Send className="w-4 h-4 shrink-0" />
                        <span>Export to Mail</span>
                    </button>

                    {/* Row 2: Approve + Delete (pending only) or status badge */}
                    {submission.status !== 'approved' && submission.status !== 'rejected' ? (
                        <>
                            <button
                                onClick={handleApprove}
                                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm transition-all shadow-md shadow-emerald-600/20 whitespace-nowrap"
                            >
                                <CheckCircle className="w-4 h-4 shrink-0" />
                                <span>Approve</span>
                            </button>
                            <button
                                onClick={handleDelete}
                                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-sm transition-all shadow-md shadow-red-600/20 whitespace-nowrap"
                            >
                                <XCircle className="w-4 h-4 shrink-0" />
                                <span>Delete</span>
                            </button>
                        </>
                    ) : (
                        <div className="col-span-2 flex items-center justify-center mt-1">
                            <span className={`px-4 py-1.5 text-xs font-black rounded-full border uppercase tracking-widest ${submission.status === 'approved'
                                    ? 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800/30'
                                    : 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800/30'
                                }`}>
                                {submission.status}
                            </span>
                        </div>
                    )}
                </div>
            </div>

            {/* Partner Information Card */}
            <div className="bg-white dark:bg-[#0E192D] rounded-3xl shadow-sm border border-gray-100 dark:border-slate-800 p-4 sm:p-6 md:p-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6">
                    <div className="space-y-4">
                        <div className="flex flex-wrap items-center gap-2 sm:gap-4">
                            <h2 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white">Partner Information</h2>
                            <span className={`px-4 py-1.5 inline-flex text-xs font-black rounded-full border ${getStatusStyle(submission.status)} uppercase tracking-widest`}>
                                {submission.status}
                            </span>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-4 sm:gap-8 text-sm text-gray-600 dark:text-slate-400">
                            <span className="flex items-center bg-gray-50 dark:bg-slate-900/50 px-4 py-2 rounded-xl">
                                <User className="w-4 h-4 mr-3 text-purple-500" />
                                <span className="font-bold text-gray-900 dark:text-slate-200">{submission.partnerName}</span>
                            </span>
                            <span className="flex items-center bg-gray-50 dark:bg-slate-900/50 px-4 py-2 rounded-xl">
                                <Mail className="w-4 h-4 mr-3 text-emerald-500" />
                                <span className="font-bold text-gray-900 dark:text-slate-200">{submission.partnerEmail}</span>
                            </span>
                            <span className="flex items-center bg-gray-50 dark:bg-slate-900/50 px-4 py-2 rounded-xl">
                                <Calendar className="w-4 h-4 mr-3 text-blue-500" />
                                <span className="font-bold text-gray-900 dark:text-slate-200">{format(new Date(submission.createdAt), "MMM d, yyyy h:mm a")}</span>
                            </span>
                        </div>
                    </div>
                </div>

                {/* Submissions Section */}
                <div className="border-t border-gray-100 dark:border-slate-800 pt-8 mt-4">
                    <div className="flex items-center justify-center mb-5 sm:mb-8">
                        <h3 className="font-black text-gray-900 dark:text-white text-lg sm:text-2xl tracking-tight bg-gray-50 dark:bg-slate-900/50 px-5 sm:px-8 py-2.5 sm:py-3 rounded-2xl border border-gray-100 dark:border-slate-800">
                            Submitted Vehicles <span className="text-purple-600 dark:text-purple-400 ml-2">({submission.entries.length})</span>
                        </h3>
                    </div>

                    <div className="space-y-6">
                        {submission.entries.map((entry, idx) => (
                            <div key={idx} className="bg-gray-50 hover:bg-white dark:bg-slate-900/50 dark:hover:bg-slate-900 p-4 sm:p-6 md:p-8 rounded-2xl sm:rounded-3xl border border-gray-200 dark:border-slate-700 hover:border-purple-300 dark:hover:border-purple-500/50 transition-all shadow-sm text-center relative overflow-hidden group">
                                <div className="absolute left-0 top-0 bottom-0 w-2 bg-purple-500 opacity-50 group-hover:opacity-100 transition-opacity" />

                                <div className="flex items-center justify-center mb-4 sm:mb-8">
                                    <h4 className="font-black text-gray-800 dark:text-gray-200 uppercase tracking-widest text-sm flex items-center gap-3">
                                        <span className="bg-purple-600 text-white px-3 py-1 rounded-lg shadow-sm">#{idx + 1}</span>
                                        Vehicle Entry
                                    </h4>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 md:gap-8">
                                    {/* Type */}
                                    <div className="flex flex-col items-center p-4 bg-white dark:bg-[#0E192D] rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm">
                                        <p className="text-xs font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2 bg-purple-50 dark:bg-purple-900/20 px-3 py-1 rounded-full text-purple-600 dark:text-purple-400">
                                            <Car className="w-4 h-4" /> Vehicle Type
                                        </p>
                                        <p className="font-black text-gray-900 dark:text-white text-xl">{entry.vehicleType}</p>
                                    </div>

                                    {/* Weight */}
                                    <div className="flex flex-col items-center p-4 bg-white dark:bg-[#0E192D] rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm relative">
                                        <div className="hidden md:block absolute -left-4 top-1/2 -translate-y-1/2 w-8 border-t-2 border-dashed border-gray-200 dark:border-slate-700" />
                                        <p className="text-xs font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2 bg-emerald-50 dark:bg-emerald-900/20 px-3 py-1 rounded-full text-emerald-600 dark:text-emerald-400">
                                            <Scale className="w-4 h-4" /> Weight
                                        </p>
                                        <p className="font-black text-gray-900 dark:text-white text-xl">{entry.weight}</p>
                                        <div className="hidden md:block absolute -right-4 top-1/2 -translate-y-1/2 w-8 border-t-2 border-dashed border-gray-200 dark:border-slate-700" />
                                    </div>

                                    {/* Reg Number */}
                                    <div className="flex flex-col items-center p-4 bg-white dark:bg-[#0E192D] rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm">
                                        <p className="text-xs font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2 bg-blue-50 dark:bg-blue-900/20 px-3 py-1 rounded-full text-blue-600 dark:text-blue-400">
                                            <Hash className="w-4 h-4" /> Reg. Number
                                        </p>
                                        <p className="font-black text-gray-900 dark:text-white uppercase font-mono tracking-widest text-xl">{entry.registrationNumber}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}

"use client"

import { useState, useEffect } from "react"
import {
    Database,
    Search,
    RefreshCcw,
    Eye,
    Calendar,
} from "lucide-react"
import { format } from "date-fns"
import Link from "next/link"

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

export default function BulkOutsourcingAdminPage() {
    const [submissions, setSubmissions] = useState<BulkOutsourcingDoc[]>([])
    const [filteredSubmissions, setFilteredSubmissions] = useState<BulkOutsourcingDoc[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState("")

    useEffect(() => {
        fetchSubmissions()
    }, [])

    const fetchSubmissions = async () => {
        setIsLoading(true)
        try {
            const res = await fetch("/api/admin/bulk-outsourcing")
            const data = await res.json()
            if (data.success) {
                setSubmissions(data.data)
                setFilteredSubmissions(data.data)
            }
        } catch (error) {
            console.error("Failed to fetch bulk outsourcing submissions:", error)
        } finally {
            setIsLoading(false)
        }
    }

    // Filter Logic
    useEffect(() => {
        if (!searchTerm.trim()) {
            setFilteredSubmissions(submissions)
            return
        }

        const lowerSearch = searchTerm.toLowerCase()
        const filtered = submissions.filter(sub =>
            sub.partnerName.toLowerCase().includes(lowerSearch) ||
            sub.partnerEmail.toLowerCase().includes(lowerSearch) ||
            sub.status.toLowerCase().includes(lowerSearch)
        )
        setFilteredSubmissions(filtered)
    }, [searchTerm, submissions])


    const getStatusStyle = (status: string) => {
        switch (status.toLowerCase()) {
            case 'pending':
                return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800/30'
            case 'reviewed':
                return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800/30'
            case 'approved':
                return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/30'
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-slate-800 dark:text-slate-300 border-gray-200 dark:border-slate-700'
        }
    }

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 dark:text-white flex items-center gap-3 tracking-tight">
                        <Database className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                        Bulk Outsourcing
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-2 font-medium">Manage and review bulk vehicle data submitted by partners.</p>
                </div>
            </div>

            {/* Toolbar */}
            <div className="bg-white dark:bg-[#0E192D] p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative w-full md:w-96 flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search by partner name, email, or status..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none transition-all dark:text-white"
                    />
                </div>

                <button
                    onClick={fetchSubmissions}
                    className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors font-medium text-gray-700 dark:text-gray-300 w-full md:w-auto justify-center"
                >
                    <RefreshCcw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                    Refresh Data
                </button>
            </div>

            {/* Data Table */}
            <div className="bg-white dark:bg-[#0E192D] rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 dark:bg-slate-900 border-b border-gray-100 dark:border-slate-800">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Partner details</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Date Submitted</th>
                                <th className="px-6 py-4 text-center text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Total Entries</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                                        <div className="flex flex-col items-center justify-center">
                                            <div className="w-8 h-8 rounded-full border-2 border-purple-500 border-t-transparent animate-spin mb-4" />
                                            <p>Loading submissions...</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredSubmissions.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                                        <div className="flex flex-col items-center justify-center">
                                            <Database className="w-12 h-12 text-gray-300 dark:text-slate-600 mb-4" />
                                            <p className="text-lg font-medium text-gray-900 dark:text-white">No entries found</p>
                                            <p className="text-sm">Partners have not submitted any bulk data yet.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredSubmissions.map((sub) => (
                                    <tr key={sub._id} className="hover:bg-gray-50 dark:hover:bg-slate-900/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="font-bold text-gray-900 dark:text-white">{sub.partnerName}</span>
                                                <span className="text-sm text-gray-500 dark:text-slate-400">{sub.partnerEmail}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center text-sm text-gray-500 dark:text-slate-300">
                                                <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                                                {format(new Date(sub.createdAt), "MMM d, yyyy h:mm a")}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <div className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 font-bold text-sm">
                                                {sub.entries.length} Vehicles
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full border ${getStatusStyle(sub.status)} uppercase tracking-wider`}>
                                                {sub.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right">
                                            <Link
                                                href={`/admin/bulk-outsourcing/${sub._id}`}
                                                className="inline-flex items-center gap-2 px-3 py-2 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 hover:bg-purple-100 dark:hover:bg-purple-800/40 rounded-lg font-medium transition-colors"
                                            >
                                                <Eye className="w-4 h-4" />
                                                Review
                                            </Link>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

        </div>
    )
}

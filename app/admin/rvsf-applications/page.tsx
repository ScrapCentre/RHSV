"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { Eye, Clock, CheckCircle, XCircle, Search } from "lucide-react"

export default function RVSFApplicationsPage() {
    const [applications, setApplications] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetch("/api/admin/rvsf-applications")
            .then(res => res.json())
            .then(data => {
                if (data.data) {
                    setApplications(data.data)
                }
            })
            .catch(console.error)
            .finally(() => setLoading(false))
    }, [])

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "pending":
            case "pending_review":
                return <span className="px-3 py-1 bg-amber-500/10 text-amber-500 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1"><Clock className="w-3 h-3" /> Pending</span>
            case "under_review":
                return <span className="px-3 py-1 bg-blue-500/10 text-blue-500 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1"><Clock className="w-3 h-3" /> Under Review</span>
            case "activated":
                return <span className="px-3 py-1 bg-emerald-500/10 text-emerald-500 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Activated</span>
            case "rejected":
                return <span className="px-3 py-1 bg-red-500/10 text-red-500 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1"><XCircle className="w-3 h-3" /> Rejected</span>
            default:
                return <span className="px-3 py-1 bg-slate-500/10 text-slate-500 rounded-full text-xs font-bold uppercase tracking-wider">{status}</span>
        }
    }

    if (loading) return <div className="p-8 text-center text-slate-500">Loading applications...</div>

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-white dark:bg-[#0E192D] p-6 rounded-2xl border border-gray-100 dark:border-slate-800">
                <div>
                    <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">RVSF Applications</h1>
                    <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">Review and manage RVSF registration requests</p>
                </div>
            </div>

            <div className="bg-white dark:bg-[#0E192D] rounded-2xl border border-gray-100 dark:border-slate-800 overflow-hidden">
                <div className="p-4 border-b border-gray-100 dark:border-slate-800 flex items-center gap-4">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input type="text" placeholder="Search entity name..." className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#E31E24]/50" />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 dark:bg-slate-900/50 text-gray-500 dark:text-slate-400 uppercase text-xs font-bold tracking-wider">
                            <tr>
                                <th className="px-6 py-4">Legal Entity Name</th>
                                <th className="px-6 py-4">Phone Number</th>
                                <th className="px-6 py-4">Date Applied</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                            {applications.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-slate-500">No applications found.</td>
                                </tr>
                            )}
                            {applications.map((app, i) => (
                                <motion.tr 
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                    key={app._id} 
                                    className="hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors"
                                >
                                    <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white">
                                        {app.legalEntityName}
                                        <div className="text-xs text-slate-500 font-normal">{app.businessEmail}</div>
                                    </td>
                                    <td className="px-6 py-4 text-gray-600 dark:text-slate-300">{app.phoneNumber}</td>
                                    <td className="px-6 py-4 text-gray-600 dark:text-slate-300">{new Date(app.createdAt).toLocaleDateString()}</td>
                                    <td className="px-6 py-4">{getStatusBadge(app.status)}</td>
                                    <td className="px-6 py-4 text-right">
                                        <Link href={`/admin/rvsf-applications/${app._id}`}>
                                            <button className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-900 dark:text-white rounded-lg text-xs font-bold transition-colors">
                                                <Eye className="w-3.5 h-3.5" /> View
                                            </button>
                                        </Link>
                                    </td>
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}

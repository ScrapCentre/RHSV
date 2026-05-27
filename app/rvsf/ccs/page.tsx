"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { Plus, Building2, Phone, Mail, User, MapPin, Loader2, Trash2, AlertTriangle, X } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function CCSPage() {
    const { data: session, status } = useSession()
    const router = useRouter()
    const { toast } = useToast()
    const [centers, setCenters] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [deleteId, setDeleteId] = useState<string | null>(null)   // which CC's confirm dialog is open
    const [deleting, setDeleting] = useState(false)

    useEffect(() => {
        if (status === "unauthenticated") router.push("/rvsf/login")
        if (status === "authenticated" && (session?.user as any)?.role !== "rvsf") router.push("/rvsf/login")
    }, [session, status, router])

    useEffect(() => {
        if (status === "authenticated") {
            fetch("/api/rvsf/ccs")
                .then(r => r.json())
                .then(data => { if (data.data) setCenters(data.data) })
                .catch(console.error)
                .finally(() => setLoading(false))
        }
    }, [status])

    const handleDelete = async (id: string) => {
        setDeleting(true)
        try {
            const res = await fetch(`/api/rvsf/ccs/${id}`, { method: "DELETE" })
            const data = await res.json()
            if (!res.ok) throw new Error(data.message || "Failed to delete")
            setCenters(prev => prev.filter(c => c._id !== id))
            toast({ title: "Deleted", description: "Collection Center removed successfully." })
        } catch (err: any) {
            toast({ title: "Error", description: err.message, variant: "destructive" })
        } finally {
            setDeleting(false)
            setDeleteId(null)
        }
    }

    if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-[#E31E24]" /></div>

    const ccToDelete = centers.find(c => c._id === deleteId)

    return (
        <div className="space-y-6">
            {/* Confirm delete dialog */}
            <AnimatePresence>
                {deleteId && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        onClick={() => !deleting && setDeleteId(null)}>
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                            onClick={e => e.stopPropagation()}
                            className="bg-[#0E192D] border border-slate-800 rounded-2xl p-6 max-w-sm w-full shadow-2xl">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center shrink-0">
                                    <AlertTriangle className="w-5 h-5 text-red-400" />
                                </div>
                                <div>
                                    <p className="font-bold text-white">Delete Collection Center?</p>
                                    <p className="text-xs text-slate-400 mt-0.5">This action cannot be undone.</p>
                                </div>
                                <button onClick={() => setDeleteId(null)} className="ml-auto text-slate-500 hover:text-white">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            <p className="text-sm text-slate-400 mb-5">
                                Are you sure you want to delete <span className="text-white font-semibold">{ccToDelete?.name}</span>?
                            </p>
                            <div className="flex gap-3">
                                <button onClick={() => setDeleteId(null)} disabled={deleting}
                                    className="flex-1 py-2.5 border border-slate-700 text-slate-400 hover:text-white rounded-xl text-sm font-bold transition-colors">
                                    Cancel
                                </button>
                                <button onClick={() => handleDelete(deleteId!)} disabled={deleting}
                                    className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl text-sm font-bold transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
                                    {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                                    {deleting ? "Deleting..." : "Yes, Delete"}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">Collection Centers</h1>
                    <p className="text-sm text-slate-500 mt-1">{centers.length} center{centers.length !== 1 ? "s" : ""} registered</p>
                </div>
                <Link href="/rvsf/ccs/new">
                    <button className="flex items-center gap-2 px-5 py-2.5 bg-[#E31E24] hover:bg-[#c1191e] text-white font-bold rounded-xl transition-all text-sm shadow-lg shadow-red-500/20">
                        <Plus className="w-4 h-4" /> Add New CC
                    </button>
                </Link>
            </div>

            {/* Empty state */}
            {centers.length === 0 && (
                <div className="bg-white dark:bg-[#0E192D] border border-dashed border-gray-200 dark:border-slate-700 rounded-2xl p-12 text-center">
                    <Building2 className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                    <p className="text-lg font-bold text-gray-700 dark:text-slate-300">No collection centers yet</p>
                    <p className="text-sm text-slate-500 mt-1 mb-5">Add your first collection center to get started.</p>
                    <Link href="/rvsf/ccs/new">
                        <button className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#E31E24] hover:bg-[#c1191e] text-white font-bold rounded-xl text-sm">
                            <Plus className="w-4 h-4" /> Add New CC
                        </button>
                    </Link>
                </div>
            )}

            {/* CC Cards grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {centers.map((cc, i) => (
                    <motion.div key={cc._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                        className="bg-white dark:bg-[#0E192D] border border-gray-100 dark:border-slate-800 rounded-2xl p-5 hover:border-blue-500/30 transition-all relative group">

                        {/* Delete button */}
                        <button onClick={() => setDeleteId(cc._id)}
                            className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all opacity-0 group-hover:opacity-100">
                            <Trash2 className="w-4 h-4" />
                        </button>

                        <div className="flex items-start gap-3 mb-4 pr-8">
                            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
                                <Building2 className="w-5 h-5 text-blue-400" />
                            </div>
                            <div className="min-w-0">
                                <h3 className="font-bold text-gray-900 dark:text-white truncate">{cc.name}</h3>
                                <div className="flex items-center gap-1 text-xs text-slate-500 mt-0.5">
                                    <MapPin className="w-3 h-3" /> {cc.city}, {cc.state}
                                </div>
                            </div>
                        </div>
                        <div className="space-y-2 text-sm border-t border-gray-100 dark:border-slate-800 pt-3">
                            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                                <User className="w-4 h-4 shrink-0 text-slate-400" />
                                <span className="truncate">{cc.contactPersonName}</span>
                            </div>
                            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                                <Phone className="w-4 h-4 shrink-0 text-slate-400" />
                                <span>{cc.contactPersonPhone}</span>
                            </div>
                            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                                <Mail className="w-4 h-4 shrink-0 text-slate-400" />
                                <span className="truncate">{cc.contactPersonEmail}</span>
                            </div>
                        </div>
                        <div className="mt-3 pt-3 border-t border-gray-100 dark:border-slate-800">
                            <span className="text-xs text-slate-500">Catchment: </span>
                            <span className="text-xs font-bold text-blue-400">{cc.catchmentRadius} km</span>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    )
}

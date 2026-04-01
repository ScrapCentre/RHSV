"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
    Database,
    Plus,
    Trash2,
    Save,
    AlertCircle,
    CheckCircle2,
    Car,
    Hash,
    Scale
} from "lucide-react"
import { useSession } from "next-auth/react"
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"
import Link from "next/link"

interface VehicleEntry {
    id: string; // Temporary ID for UI rendering
    vehicleType: string;
    weight: string;
    registrationNumber: string;
}

export default function EnterDataPage() {
    const { data: session } = useSession()
    const { toast } = useToast()
    const router = useRouter()

    const [entries, setEntries] = useState<VehicleEntry[]>([
        { id: Date.now().toString(), vehicleType: "", weight: "", registrationNumber: "" }
    ])
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [showSuccessModal, setShowSuccessModal] = useState(false)

    const handleAddEntry = () => {
        setEntries([
            ...entries,
            { id: Date.now().toString(), vehicleType: "", weight: "", registrationNumber: "" }
        ])
    }

    const handleRemoveEntry = (idToRemove: string) => {
        if (entries.length === 1) {
            toast({
                title: "Cannot remove",
                description: "You must have at least one entry.",
                variant: "destructive",
            })
            return
        }
        setEntries(entries.filter(entry => entry.id !== idToRemove))
    }

    const handleChange = (id: string, field: keyof VehicleEntry, value: string) => {
        setEntries(entries.map(entry =>
            entry.id === id ? { ...entry, [field]: value } : entry
        ))
    }

    const validateEntries = (): boolean => {
        for (const [index, entry] of entries.entries()) {
            if (!entry.vehicleType.trim()) {
                toast({ title: "Validation Error", description: `Vehicle Type is required for entry #${index + 1}`, variant: "destructive" });
                return false;
            }
            if (!entry.weight.trim()) {
                toast({ title: "Validation Error", description: `Weight is required for entry #${index + 1}`, variant: "destructive" });
                return false;
            }
            if (!entry.registrationNumber.trim()) {
                toast({ title: "Validation Error", description: `Registration Number is required for entry #${index + 1}`, variant: "destructive" });
                return false;
            }
        }
        return true;
    }

    const handleSubmit = async () => {
        if (!validateEntries()) return

        setIsSubmitting(true)

        try {
            // Clean up the temporary ID before sending to backend
            const payload = entries.map(({ id, ...rest }) => rest)

            const res = await fetch("/api/b2b/bulk-outsourcing", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ entries: payload }),
            })

            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.message || "Failed to submit data")
            }

            // Show success modal
            setShowSuccessModal(true)

            // Reset form
            setEntries([{ id: Date.now().toString(), vehicleType: "", weight: "", registrationNumber: "" }])

            // Optionally redirect to a confirmation or stay on page
            router.refresh()

        } catch (error: any) {
            console.error("Submission error:", error)
            toast({
                title: "Submission Failed",
                description: error.message,
                variant: "destructive",
            })
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="max-w-5xl mx-auto space-y-8 pb-12">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 dark:text-white flex items-center gap-3 tracking-tight">
                        <Database className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                        Bulk Data Entry
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-2 font-medium">Add multiple vehicle entries to be processed by our team.</p>
                </div>

                <Link
                    href="/b2b/enter-data/logs"
                    className="flex items-center gap-2 px-6 py-3 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800 rounded-xl font-bold transition-all shadow-sm shrink-0"
                >
                    <Database className="w-4 h-4" />
                    View Logs
                </Link>
            </div>

            <div className="bg-white dark:bg-[#0E192D] rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100 dark:border-slate-800 transition-all">
                <div className="space-y-6">
                    <AnimatePresence>
                        {entries.map((entry, index) => (
                            <motion.div
                                key={entry.id}
                                initial={{ opacity: 0, height: 0, scale: 0.95 }}
                                animate={{ opacity: 1, height: "auto", scale: 1 }}
                                exit={{ opacity: 0, height: 0, scale: 0.95 }}
                                transition={{ duration: 0.3 }}
                                className="relative bg-gray-50 dark:bg-slate-900/50 p-6 rounded-2xl border border-gray-200 dark:border-slate-800 overflow-hidden group"
                            >
                                <div className="absolute top-0 left-0 w-1.5 h-full bg-purple-500" />

                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="font-bold text-gray-900 dark:text-white tracking-wide">Vehicle Entry #{index + 1}</h3>

                                    <button
                                        onClick={() => handleRemoveEntry(entry.id)}
                                        className="text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 p-2 rounded-lg transition-colors"
                                        title="Remove Entry"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                            <Car className="w-4 h-4 text-purple-500" />
                                            Vehicle Type / Model
                                        </label>
                                        <input
                                            type="text"
                                            value={entry.vehicleType}
                                            onChange={(e) => handleChange(entry.id, 'vehicleType', e.target.value)}
                                            placeholder="e.g., Sedan, SUV, Truck"
                                            className="w-full bg-white dark:bg-slate-950 border border-gray-300 dark:border-slate-700 rounded-xl px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all dark:text-white"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                            <Scale className="w-4 h-4 text-emerald-500" />
                                            Weight (Approx)
                                        </label>
                                        <input
                                            type="text"
                                            value={entry.weight}
                                            onChange={(e) => handleChange(entry.id, 'weight', e.target.value)}
                                            placeholder="e.g., 2.5 Tons or 2500 kg"
                                            className="w-full bg-white dark:bg-slate-950 border border-gray-300 dark:border-slate-700 rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all dark:text-white"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                            <Hash className="w-4 h-4 text-blue-500" />
                                            Registration Number
                                        </label>
                                        <input
                                            type="text"
                                            value={entry.registrationNumber}
                                            onChange={(e) => handleChange(entry.id, 'registrationNumber', e.target.value)}
                                            placeholder="e.g., MH 02 AB 1234"
                                            className="w-full bg-white dark:bg-slate-950 border border-gray-300 dark:border-slate-700 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all dark:text-white font-mono uppercase"
                                        />
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>

                    <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-gray-100 dark:border-slate-800">
                        <button
                            onClick={handleAddEntry}
                            className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-6 py-4 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 hover:bg-purple-100 dark:hover:bg-purple-900/40 rounded-xl font-bold transition-all border border-purple-200 dark:border-purple-800/30 border-dashed"
                        >
                            <Plus className="w-5 h-5" />
                            Add More Vehicles
                        </button>

                        <div className="flex-1" />

                        <button
                            onClick={handleSubmit}
                            disabled={isSubmitting || entries.length === 0}
                            className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-emerald-600/20 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <Save className="w-5 h-5" />
                            )}
                            Submit {entries.length} {entries.length === 1 ? 'Entry' : 'Entries'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Success Modal */}
            <AnimatePresence>
                {showSuccessModal && (
                    <div className="fixed inset-0 z-[101] lg:pl-[288px] flex items-center justify-center pointer-events-none">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 0 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 0 }}
                            className="pointer-events-auto w-[90%] max-w-md bg-white dark:bg-[#0E192D] p-10 rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.1)] dark:shadow-[0_0_50px_rgba(0,0,0,0.5)] text-center border-2 border-emerald-500/20 dark:border-emerald-500/20 flex flex-col items-center justify-center"
                        >
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: "spring", delay: 0.2, bounce: 0.5 }}
                                className="w-24 h-24 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mb-6 shadow-inner"
                            >
                                <CheckCircle2 className="w-12 h-12 text-emerald-600 dark:text-emerald-400" />
                            </motion.div>

                            <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-3 tracking-tight">Data Submitted!</h2>
                            <p className="text-gray-500 dark:text-slate-400 mb-8 font-medium text-lg leading-relaxed">
                                Your vehicle entries have been successfully saved and sent to the administrative team.
                            </p>

                            <button
                                onClick={() => setShowSuccessModal(false)}
                                className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-emerald-600/20 text-lg"
                            >
                                Close & Continue
                            </button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div >
    )
}

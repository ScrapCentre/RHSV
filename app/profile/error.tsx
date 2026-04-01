"use client"

import { useEffect } from "react"
import { motion } from "framer-motion"
import { RefreshCcw, User, ShieldAlert } from "lucide-react"

export default function ProfileError({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        console.error("Profile Data Error:", error)
    }, [error])

    return (
        <div className="min-h-[50vh] flex items-center justify-center p-4 font-sans">
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/80 backdrop-blur-xl p-10 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-gray-100 max-w-lg w-full text-center relative overflow-hidden"
            >
                {/* Decorative Element */}
                <div className="absolute top-0 right-0 p-4 opacity-[0.03] pointer-events-none">
                    <User size={120} />
                </div>

                <motion.div
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-inner"
                >
                    <ShieldAlert className="w-10 h-10" />
                </motion.div>

                <h2 className="text-3xl font-black text-gray-900 mb-4 tracking-tight leading-tight">
                    Data Retrieval <span className="text-emerald-500">Failed</span>
                </h2>

                <p className="text-gray-500 mb-10 text-lg font-medium leading-relaxed">
                    We couldn&apos;t synchronize your profile data. Please verify your connection and try refreshing the dashboard.
                </p>

                <div className="space-y-4">
                    <button
                        onClick={reset}
                        className="w-full bg-[#0E192D] hover:bg-emerald-600 text-white font-black py-5 px-8 rounded-2xl transition-all shadow-xl shadow-slate-900/10 flex items-center justify-center gap-3 text-lg uppercase tracking-wider active:scale-[0.98]"
                    >
                        <RefreshCcw className="w-5 h-5" />
                        Sync Data
                    </button>

                    {process.env.NODE_ENV === 'development' && (
                        <div className="mt-8 pt-8 border-t border-gray-100 text-left">
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-4 block">Engine Logs</span>
                            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 overflow-auto max-h-32">
                                <p className="text-xs font-mono text-red-500/80 leading-relaxed font-bold">
                                    {error.message || "Unknown error occurred"}
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    )
}


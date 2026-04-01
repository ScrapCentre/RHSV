"use client"

import { useEffect } from "react"
import { motion } from "framer-motion"
import { RefreshCcw, ShieldAlert } from "lucide-react"

export default function AdminError({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        console.error("Admin Portal Error:", error)
    }, [error])

    return (
        <div className="min-h-[70vh] flex items-center justify-center p-6 font-sans">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="max-w-md w-full bg-white rounded-3xl p-10 shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-gray-100 text-center relative overflow-hidden"
            >
                {/* Decorative Pattern */}
                <div className="absolute top-0 left-0 w-full h-2 bg-red-500" />

                <div className="relative z-10">
                    <motion.div
                        initial={{ rotate: -10 }}
                        animate={{ rotate: 0 }}
                        className="w-20 h-20 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-sm"
                    >
                        <ShieldAlert className="w-10 h-10" />
                    </motion.div>

                    <h2 className="text-3xl font-black text-gray-900 mb-4 tracking-tight">System Encountered an Issue</h2>

                    <p className="text-gray-500 mb-10 leading-relaxed font-medium">
                        The admin portal hit an unexpected roadblock. We&apos;ve logged the technical details for review.
                    </p>

                    <div className="space-y-4">
                        <button
                            onClick={reset}
                            className="w-full flex items-center justify-center gap-3 bg-red-600 hover:bg-black text-white font-bold py-4 rounded-xl transition-all shadow-[0_10px_20px_rgba(220,38,38,0.2)] active:scale-[0.98]"
                        >
                            <RefreshCcw className="w-5 h-5" />
                            Restart Session
                        </button>

                        <div className="pt-6 border-t border-gray-100 flex items-center justify-between">
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                ID: {error.digest?.slice(0, 8) || "Internal"}
                            </span>
                            <div className="flex items-center gap-2 text-emerald-500">
                                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                <span className="text-[10px] font-black uppercase tracking-widest">System Online</span>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    )
}


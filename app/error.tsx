"use client"

import { useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { AlertCircle, RefreshCw, Home, ShieldAlert, WifiOff } from "lucide-react"
import Link from "next/link"

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        console.error("Application Error:", error)
    }, [error])

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#0E192D] px-4 py-12 relative overflow-hidden font-sans">
            {/* Animated Background Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <motion.div
                    animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.1, 0.2, 0.1],
                        rotate: [0, 90, 0]
                    }}
                    transition={{ duration: 15, repeat: Infinity, ease: "linear" as const }}
                    className="absolute -top-1/4 -right-1/4 w-[600px] h-[600px] bg-red-600/20 rounded-full blur-[120px]"
                />
                <motion.div
                    animate={{
                        scale: [1, 1.3, 1],
                        opacity: [0.1, 0.15, 0.1],
                        rotate: [0, -60, 0]
                    }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" as const }}
                    className="absolute -bottom-1/4 -left-1/4 w-[600px] h-[600px] bg-blue-600/20 rounded-full blur-[120px]"
                />
                <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] mix-blend-overlay"></div>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 40, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] as any }}
                className="max-w-2xl w-full relative z-10"
            >
                {/* Main Card */}
                <div className="bg-white/5 backdrop-blur-2xl rounded-[2.5rem] p-8 md:p-12 border border-white/10 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] overflow-hidden relative group">
                    {/* Error Icon Decoration */}
                    <div className="absolute top-0 right-0 p-8 opacity-5">
                        <ShieldAlert size={180} className="text-red-500" />
                    </div>

                    <div className="flex flex-col items-center text-center">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.2 }}
                            className="w-24 h-24 bg-gradient-to-br from-red-500 to-red-600 rounded-3xl flex items-center justify-center mb-10 shadow-[0_20px_40px_-10px_rgba(239,68,68,0.5)] rotate-3 group-hover:rotate-0 transition-transform duration-500"
                        >
                            <AlertCircle className="w-12 h-12 text-white" />
                        </motion.div>

                        <motion.h2
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="text-4xl md:text-5xl font-black text-white mb-6 uppercase tracking-tight"
                        >
                            Something <span className="text-red-500">Broke</span>.
                        </motion.h2>

                        <motion.p
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="text-gray-400 text-lg md:text-xl font-medium mb-10 max-w-lg leading-relaxed"
                        >
                            Our digital engine hit a snag. But don't worry, we're ready to jumpstart it back into action.
                        </motion.p>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                            className="flex flex-col sm:flex-row gap-4 w-full"
                        >
                            <button
                                onClick={reset}
                                className="flex-1 flex items-center justify-center gap-3 bg-red-600 hover:bg-red-500 text-white font-black py-5 rounded-2xl transition-all shadow-[0_15px_30px_-5px_rgba(239,68,68,0.3)] hover:shadow-[0_20px_40px_-5px_rgba(239,68,68,0.5)] hover:-translate-y-1 active:scale-[0.98] text-lg uppercase tracking-wider"
                            >
                                <RefreshCw className="w-5 h-5" />
                                Try Again
                            </button>
                            <Link
                                href="/"
                                className="flex-1 flex items-center justify-center gap-3 bg-white/10 hover:bg-white/15 text-white font-black py-5 rounded-2xl border border-white/10 transition-all backdrop-blur-md hover:-translate-y-1 active:scale-[0.98] text-lg uppercase tracking-wider"
                            >
                                <Home className="w-5 h-5" />
                                Back to Home
                            </Link>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 0.5 }}
                            transition={{ delay: 1 }}
                            className="mt-12 flex items-center gap-2 text-gray-500 text-sm font-bold uppercase tracking-[0.2em]"
                        >
                            <span className="w-8 h-[2px] bg-red-500/50"></span>
                            System Status: Recoverable
                            <span className="w-8 h-[2px] bg-red-500/50"></span>
                        </motion.div>
                    </div>
                </div>

                {/* Developer Debug Card (Conditional) */}
                <AnimatePresence>
                    {process.env.NODE_ENV === "development" && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mt-6 bg-[#1a1c23] border border-white/5 rounded-3xl p-6 shadow-2xl"
                        >
                            <div className="flex items-center gap-2 mb-4 text-red-400">
                                <ShieldAlert size={16} />
                                <span className="text-xs font-black uppercase tracking-widest">Debug Info</span>
                            </div>
                            <div className="bg-black/40 rounded-xl p-4 overflow-auto max-h-40 border border-white/5">
                                <p className="text-xs font-mono text-red-500 whitespace-pre-wrap leading-relaxed">
                                    {error.stack || error.message}
                                </p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    )
}


"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { FileQuestion, Home, Search, MoveLeft } from "lucide-react"

export default function NotFound() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-[#0B0D11] px-4 py-12 relative overflow-hidden font-sans text-white">
            {/* Ambient Background Lights */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <motion.div
                    animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.15, 0.25, 0.15],
                        x: [0, 50, 0]
                    }}
                    transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" as const }}
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-emerald-500/10 rounded-full blur-[160px]"
                />
                <motion.div
                    animate={{
                        scale: [1, 1.4, 1],
                        opacity: [0.1, 0.2, 0.1],
                        x: [0, -40, 0]
                    }}
                    transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" as const, delay: 2 }}
                    className="absolute -top-1/4 -right-1/4 w-[500px] h-[500px] bg-orange-500/10 rounded-full blur-[120px]"
                />
            </div>

            <div className="max-w-4xl w-full relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

                {/* Visual Side */}
                <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] as any }}
                    className="relative order-2 lg:order-1"
                >
                    <div className="relative">
                        <motion.span
                            animate={{ y: [0, -20, 0] }}
                            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" as const }}
                            className="text-[12rem] md:text-[18rem] font-black leading-none opacity-10 select-none block text-center"
                        >
                            404
                        </motion.span>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <motion.div
                                animate={{ rotate: [0, 5, -5, 0] }}
                                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" as const }}
                                className="w-48 h-48 md:w-64 md:h-64 bg-gradient-to-br from-orange-400 to-orange-600 rounded-[3rem] shadow-[0_40px_80px_-15px_rgba(249,115,22,0.4)] flex items-center justify-center border border-white/20"
                            >
                                <FileQuestion size={100} className="text-white drop-shadow-2xl" />
                            </motion.div>
                        </div>
                    </div>
                </motion.div>

                {/* Content Side */}
                <motion.div
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] as any, delay: 0.1 }}
                    className="text-center lg:text-left order-1 lg:order-2"
                >
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500/10 border border-orange-500/20 rounded-full text-orange-500 text-xs font-black uppercase tracking-[0.2em] mb-8"
                    >
                        <Search size={14} />
                        Lost in hyperspace
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="text-5xl md:text-7xl font-black mb-6 tracking-tight leading-[0.9]"
                    >
                        PAGE <br /> <span className="text-orange-500 italic">OFF-ROAD</span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="text-gray-400 text-xl md:text-2xl font-medium mb-12 max-w-sm ml-0 mx-auto lg:mx-0 leading-relaxed"
                    >
                        Looks like this route doesn&apos;t exist. Let&apos;s get you back on the main highway.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                        className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
                    >
                        <Link
                            href="/"
                            className="inline-flex items-center justify-center gap-3 bg-white text-black hover:bg-orange-500 hover:text-white font-black py-5 px-10 rounded-2xl transition-all shadow-[0_20px_40px_-10px_rgba(255,255,255,0.1)] active:scale-[0.98] text-lg uppercase tracking-wider"
                        >
                            <Home className="w-5 h-5" />
                            Back to Home
                        </Link>
                        <button
                            onClick={() => window.history.back()}
                            className="inline-flex items-center justify-center gap-3 bg-white/5 hover:bg-white/10 text-white font-black py-5 px-10 rounded-2xl border border-white/10 transition-all active:scale-[0.98] text-lg uppercase tracking-wider"
                        >
                            <MoveLeft className="w-5 h-5" />
                            Previous Page
                        </button>
                    </motion.div>

                    <div className="mt-16 pt-8 border-t border-white/5 flex items-center justify-center lg:justify-start gap-4">
                        <div className="flex -space-x-2">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className={`w-8 h-8 rounded-full border-2 border-[#0B0D11] bg-gray-800 flex items-center justify-center`}>
                                    <div className="w-4 h-4 rounded-full bg-emerald-500/50 animate-pulse" />
                                </div>
                            ))}
                        </div>
                        <p className="text-gray-600 text-xs font-bold uppercase tracking-widest">Our team is patrolling this area</p>
                    </div>
                </motion.div>
            </div>
        </div>
    )
}


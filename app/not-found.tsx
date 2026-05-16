"use client"
 
import Link from "next/link"
import { motion } from "framer-motion"
import { Home, MoveLeft, ShieldAlert } from "lucide-react"
 
export default function NotFound() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 py-12 relative overflow-hidden font-sans">
            {/* Industrial Background Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] mix-blend-overlay"></div>
                
                {/* Red Brand Glows */}
                <motion.div
                    animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.1, 0.15, 0.1],
                    }}
                    transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute -top-1/4 -left-1/4 w-[800px] h-[800px] bg-red-500/10 rounded-full blur-[160px]"
                />
                <motion.div
                    animate={{
                        scale: [1, 1.3, 1],
                        opacity: [0.05, 0.1, 0.05],
                    }}
                    transition={{ duration: 15, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                    className="absolute -bottom-1/4 -right-1/4 w-[600px] h-[600px] bg-slate-900/10 rounded-full blur-[140px]"
                />

                {/* Grid Pattern */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#00000005_1px,transparent_1px),linear-gradient(to_bottom,#00000005_1px,transparent_1px)] bg-[size:40px_40px]"></div>
            </div>
 
            <div className="max-w-4xl w-full relative z-10 flex flex-col items-center text-center">
                {/* Content Side */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] as any }}
                    className="w-full"
                >
                    <motion.div
                        className="inline-flex items-center gap-2 px-5 py-2 bg-red-50 border border-red-100 rounded-full text-red-600 text-[10px] font-black uppercase tracking-[0.25em] mb-10 shadow-sm"
                    >
                        <ShieldAlert size={14} className="animate-pulse" />
                        Lost in hyperspace
                    </motion.div>
 
                    <h1 className="text-5xl md:text-7xl font-black mb-12 tracking-tighter leading-[0.85] text-slate-900 uppercase">
                        PAGE <br /> <span className="text-red-600">OFF-ROAD</span>
                    </h1>
 
                    <div className="flex flex-col sm:flex-row gap-5 justify-center mt-4">
                        <Link
                            href="/"
                            className="c-button--gooey group relative inline-flex items-center justify-center gap-4 bg-red-600 text-white font-black py-4 px-10 rounded-2xl transition-all shadow-2xl shadow-red-600/30 active:scale-[0.98] text-base uppercase tracking-widest overflow-hidden"
                        >
                            <span className="relative z-10 flex items-center gap-3">
                                <Home className="w-5 h-5" />
                                Back to Home
                            </span>
                            <div className="c-button__blobs">
                                <div />
                                <div />
                                <div />
                            </div>
                        </Link>
                        
                        <button
                            onClick={() => window.history.back()}
                            className="inline-flex items-center justify-center gap-4 bg-white hover:bg-slate-50 text-slate-900 font-black py-4 px-10 rounded-2xl border-2 border-slate-100 transition-all active:scale-[0.98] text-base uppercase tracking-widest shadow-sm"
                        >
                            <MoveLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                            Previous Page
                        </button>
                    </div>
 
                    {/* Professional Patrolling Section */}
                    <div className="mt-20 pt-10 border-t border-slate-200/60 flex flex-col items-center gap-6">
                        <div className="flex items-center gap-3">
                            <div className="flex -space-x-3">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className={`w-10 h-10 rounded-full border-4 border-white bg-slate-100 flex items-center justify-center overflow-hidden shadow-sm`}>
                                        <div className={`w-full h-full bg-slate-200 animate-pulse`} style={{ animationDelay: `${i * 0.2}s` }} />
                                    </div>
                                ))}
                            </div>
                            <div className="flex flex-col items-start text-left">
                                <div className="flex items-center gap-1.5">
                                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Status: Active</span>
                                </div>
                                <p className="text-slate-600 text-xs font-black uppercase tracking-widest mt-1">Monitoring Area</p>
                            </div>
                        </div>
                        <p className="text-slate-400 text-[11px] font-bold uppercase tracking-[0.2em] bg-slate-100/50 px-4 py-2 rounded-lg">
                            Our team is patrolling this area
                        </p>
                    </div>
                </motion.div>
            </div>

            {/* SVG Filter for Gooey Effect */}
            <svg xmlns="http://www.w3.org/2000/svg" version="1.1" style={{ display: 'none' }}>
                <defs>
                    <filter id="goo">
                        <feGaussianBlur in="SourceGraphic" stdDeviation="10" result="blur" />
                        <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -7" result="goo" />
                        <feBlend in="SourceGraphic" in2="goo" />
                    </filter>
                </defs>
            </svg>
        </div>
    )
}

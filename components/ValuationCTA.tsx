"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Car, Truck, Bike, ArrowRight } from "lucide-react"
import Link from "next/link"

export default function ValuationCTA() {
    const [isHovered, setIsHovered] = useState(false)

    // Generate random positions and delays for the falling background icons
    const icons = Array.from({ length: 20 }).map((_, i) => ({
        id: i,
        icon: [Car, Truck, Bike][i % 3],
        left: `${Math.random() * 100}%`,
        delay: Math.random() * 5,
        duration: 10 + Math.random() * 10,
        size: 40 + Math.random() * 40,
    }))

    return (
        <section
            className="py-8 px-4 overflow-hidden transition-colors duration-500"
            style={{ backgroundColor: isHovered ? "#0E192D" : "#ffffff" }}
        >
            <motion.div
                initial={{ opacity: 0, y: 100 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] as any }}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                className="group relative max-w-6xl mx-auto rounded-[3rem] overflow-hidden shadow-2xl transform-gpu bg-[#0E192D] hover:bg-white transition-colors duration-500"
            >
                {/* Animated Background: Falling Vehicles */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    {icons.map((item) => {
                        const Icon = item.icon
                        return (
                            <motion.div
                                key={item.id}
                                initial={{ y: -100, opacity: 0 }}
                                animate={{ y: 600, opacity: [0, 0.3, 0.3, 0] }}
                                transition={{
                                    repeat: Infinity,
                                    duration: item.duration,
                                    delay: item.delay,
                                    ease: "linear" as const,
                                }}
                                style={{ left: item.left }}
                                className="absolute top-0 text-emerald-500/10 group-hover:text-emerald-900/5 transition-colors duration-500"
                            >
                                <Icon size={item.size} />
                            </motion.div>
                        )
                    })}
                </div>

                {/* Content */}
                <div className="relative z-10 px-8 py-8 md:px-16 md:py-8 flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
                    <div className="max-w-xl">
                        <motion.span
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.4 }}
                            className="inline-block py-1 px-3 rounded-full bg-emerald-500/20 group-hover:bg-emerald-100 text-emerald-300 group-hover:text-emerald-700 text-xs font-bold uppercase tracking-wider mb-3 backdrop-blur-sm border border-emerald-500/20 group-hover:border-emerald-200 transition-all duration-500"
                        >
                            Free Service
                        </motion.span>
                        <h2 className="text-3xl md:text-5xl font-black text-white group-hover:text-slate-900 mb-4 uppercase tracking-tight leading-none transition-colors duration-500">
                            Get <span className="text-emerald-400 group-hover:text-emerald-600 transition-colors duration-500">Free</span> Valuation <br /> <span className="text-slate-300 group-hover:text-slate-600 transition-colors duration-500">Of Your Car</span>
                        </h2>
                        <p className="text-slate-300 group-hover:text-slate-500 text-lg font-medium max-w-md mx-auto md:mx-0 transition-colors duration-500">
                            Instantly check the current market scrap value of your vehicle with our AI-powered tool.
                        </p>
                    </div>

                    <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="relative"
                    >
                        <Link href="/quote" className="group/btn relative inline-flex items-center gap-3 px-8 py-4 bg-white group-hover:bg-[#0E192D] text-emerald-700 group-hover:text-white rounded-full text-xl font-bold shadow-[0_10px_20px_rgba(0,0,0,0.2)] hover:shadow-[0_15px_30px_rgba(16,185,129,0.3)] transition-all duration-500 border border-transparent group-hover:border-slate-800 overflow-hidden">
                            <span className="relative z-10">Check For Free</span>
                            <span className="bg-emerald-50 group-hover:group-hover/btn:bg-emerald-600 p-1 rounded-full group-hover/btn:bg-slate-800 group-hover/btn:text-white transition-colors duration-300 relative z-10">
                                <ArrowRight className="w-5 h-5" />
                            </span>

                            {/* Shimmer Effect */}
                            <motion.div
                                className="absolute top-0 -left-[100%] w-full h-full bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-[-20deg]"
                                animate={{ left: ["-100%", "200%"] }}
                                transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" as const, repeatDelay: 1 }}
                            />
                        </Link>
                    </motion.div>
                </div>
            </motion.div>
        </section>
    )
}


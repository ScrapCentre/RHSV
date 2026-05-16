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
            className="py-10 px-4 overflow-hidden transition-colors duration-500"
            style={{ backgroundColor: isHovered ? "#ffffff" : "#f8fafc" }}
        >
            <motion.div
                initial={{ opacity: 0, y: 100 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] as any }}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                className="group relative max-w-5xl mx-auto rounded-[2.5rem] overflow-hidden shadow-xl transform-gpu bg-white border border-slate-100 hover:border-red-100 transition-all duration-500"
            >
                {/* Animated Background: Falling Vehicles */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    {icons.map((item) => {
                        const Icon = item.icon
                        return (
                            <motion.div
                                key={item.id}
                                initial={{ y: -100, opacity: 0 }}
                                animate={{ y: 600, opacity: [0, 0.2, 0.2, 0] }}
                                transition={{
                                    repeat: Infinity,
                                    duration: item.duration,
                                    delay: item.delay,
                                    ease: "linear" as const,
                                }}
                                style={{ left: item.left }}
                                className="absolute top-0 text-red-500/5 group-hover:text-red-500/10 transition-colors duration-500"
                            >
                                <Icon size={item.size} />
                            </motion.div>
                        )
                    })}
                </div>

                {/* Content */}
                <div className="relative z-10 px-8 py-10 md:px-12 md:py-12 flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
                    <div className="max-w-xl">
                        <motion.span
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.4 }}
                            className="inline-block py-1 px-3 rounded-full bg-red-50 text-red-600 text-[10px] font-bold uppercase tracking-wider mb-3 border border-red-100 shadow-sm transition-all duration-500"
                        >
                            Free Service
                        </motion.span>
                        <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-slate-900 mb-4 uppercase tracking-tight leading-[0.95] transition-colors duration-500">
                            Get <span className="text-red-600">Free</span> Valuation <br /> <span className="text-slate-400">Of Your Car</span>
                        </h2>
                        <p className="text-slate-500 text-base md:text-lg font-medium max-w-md mx-auto md:mx-0 leading-snug transition-colors duration-500">
                            Instantly check the current market scrap value of your vehicle with our AI-powered tool.
                        </p>
                    </div>

                    <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="relative"
                    >
                        <Link href="/quote" className="c-button--gooey group/btn relative inline-flex items-center gap-3 px-8 py-4 bg-red-600 text-white rounded-xl text-lg font-black shadow-[0_15px_30px_-5px_rgba(227,30,36,0.3)] hover:shadow-[0_20px_40px_-8px_rgba(227,30,36,0.4)] transition-all duration-500 overflow-hidden">
                            <span className="relative z-10 flex items-center gap-3">
                                Check For Free
                                <span className="bg-white/20 p-1 rounded-full transition-colors duration-300">
                                    <ArrowRight className="w-4 h-4" />
                                </span>
                            </span>

                            <div className="c-button__blobs">
                                <div />
                                <div />
                                <div />
                            </div>

                            {/* Shimmer Effect */}
                            <motion.div
                                className="absolute top-0 -left-[100%] w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-[-20deg]"
                                animate={{ left: ["-100%", "200%"] }}
                                transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" as const, repeatDelay: 1 }}
                            />
                        </Link>
                    </motion.div>
                </div>
            </motion.div>

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
        </section>
    )
}


"use client"

import { useSession } from "next-auth/react"
import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowRight, Handshake, TrendingUp } from "lucide-react"

export default function GrowWithUs() {
    const { data: session } = useSession()

    return (
        <section className="py-12 bg-white overflow-hidden">
            <div className="container mx-auto px-4">
                {/* 
                  To show the "puri img" (full image), we use a relative container 
                  and let the image dictate the aspect ratio, or use object-contain.
                  Here we use a container with a flexible height that matches the banner style.
                */}
                <div className="relative w-full max-w-7xl mx-auto rounded-[1.5rem] md:rounded-[2.5rem] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.08)] bg-white group">
                    
                    {/* The Background Image - Using object-contain or responsive h-auto to see everything */}
                    <div className="relative w-full">
                        <img 
                            src="/partner.png" 
                            alt="Partner with ScrapCenter" 
                            className="w-full h-auto block min-h-[300px] object-cover md:object-contain lg:object-contain bg-white"
                        />
                        
                        {/* Overlay Content - Positioned absolute over the image */}
                        <div className="absolute inset-0 z-10 flex flex-col items-center lg:items-start lg:pl-[38%] justify-center px-6 md:px-12 text-center lg:text-left">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6 }}
                                className="max-w-xl bg-white/10 md:bg-transparent backdrop-blur-[2px] md:backdrop-blur-none p-4 rounded-2xl"
                            >
                                {/* Badge */}
                                <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-50 rounded-full mb-4 md:mb-6 border border-red-100">
                                    <div className="p-1 bg-red-600 rounded-full">
                                        <Handshake className="w-3 h-3 text-white" />
                                    </div>
                                    <span className="text-[10px] md:text-xs font-black text-red-600 uppercase tracking-widest">
                                        Be Our Partner
                                    </span>
                                </div>

                                {/* Heading with Animated Underline */}
                                <h2 className="text-3xl md:text-5xl lg:text-6xl font-black text-slate-900 mb-6 leading-tight">
                                    <span className="relative inline-block">
                                        Grow
                                        <motion.div 
                                            className="absolute -bottom-1 left-0 h-1 md:h-1.5 bg-red-600 rounded-full"
                                            animate={{ 
                                                width: ["0%", "100%", "0%"] 
                                            }}
                                            transition={{ 
                                                duration: 3, 
                                                repeat: Infinity,
                                                ease: "easeInOut"
                                            }}
                                        />
                                    </span> <span className="text-red-600">With</span> Us
                                </h2>

                                {/* Description */}
                                <p className="text-slate-600 font-bold mb-6 md:mb-10 text-base md:text-lg lg:text-xl leading-snug">
                                    Join our network of verified partners and expand your business with <span className="text-red-600">ScrapCenter India.</span>
                                </p>

                                {/* Button */}
                                <div className="flex flex-col sm:flex-row items-center gap-4">
                                    <Link
                                        href="/rvsf/apply"
                                        className="c-button--gooey group/btn relative inline-flex items-center gap-3 px-8 md:px-10 py-3 md:py-4 bg-red-600 text-white rounded-xl md:rounded-2xl font-black text-base md:text-lg shadow-lg shadow-red-500/30 transition-all duration-300"
                                    >
                                        <span className="relative z-10 flex items-center gap-3">
                                            Apply For Partner
                                            <ArrowRight className="w-5 h-5 md:w-6 md:h-6 group-hover/btn:translate-x-1 transition-transform" />
                                        </span>
                                        <div className="c-button__blobs">
                                            <div />
                                            <div />
                                            <div />
                                        </div>
                                    </Link>
                                </div>
                            </motion.div>
                        </div>

                        {/* Floating extra icon (Chart circle) - Positioned relative to the banner */}
                        <div className="absolute top-[20%] right-[12%] hidden lg:block z-20">
                            <motion.div
                                animate={{ y: [0, -10, 0] }}
                                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                                className="bg-white p-4 rounded-full shadow-2xl border border-slate-50"
                            >
                                <TrendingUp className="w-8 h-8 text-red-600" />
                            </motion.div>
                        </div>
                    </div>

                </div>
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
        </section>
    )
}


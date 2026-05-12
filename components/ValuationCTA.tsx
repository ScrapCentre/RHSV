"use client"

/**
 * ValuationCTA — ScrapCentre.com
 * REPURPOSED per design-system §6: kept visual structure, rewrote microcopy
 * to calculator hook, replaced green with brand-red, removed falling vehicle icons
 * (bandwidth cost per design-system §1).
 */

import { motion } from "framer-motion"
import { ArrowRight, Calculator } from "lucide-react"
import Link from "next/link"

export default function ValuationCTA() {
    return (
        <section className="py-8 px-4 overflow-hidden">
            <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] as any }}
                className="max-w-6xl mx-auto rounded-3xl overflow-hidden shadow-2xl bg-[var(--brand-red)]"
            >
                <div className="px-8 py-10 md:px-16 md:py-12 flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
                    <div className="max-w-xl">
                        <span className="inline-block py-1 px-3 rounded-full bg-white/20 text-white text-xs font-bold uppercase tracking-wider mb-3 border border-white/30">
                            Free — No Spam
                        </span>
                        <h2 className="text-3xl md:text-5xl font-black text-white mb-4 leading-tight">
                            Find out what your<br />
                            <span className="underline decoration-white/50 underline-offset-4">old vehicle is worth.</span>
                        </h2>
                        <p className="text-white/80 text-lg font-medium max-w-md mx-auto md:mx-0">
                            Enter your registration number. We calculate the exact government-scheme
                            value — scrap + CD + road tax — in seconds.
                        </p>
                        {/* [HINDI: आपकी गाड़ी का असली मूल्य जानिए।] */}
                    </div>

                    <motion.div
                        whileHover={{ scale: 1.04 }}
                        whileTap={{ scale: 0.97 }}
                        className="shrink-0"
                    >
                        <Link
                            href="/calculator?type=A"
                            className="inline-flex items-center gap-3 px-8 py-5 bg-white text-[var(--brand-red)] rounded-full text-xl font-bold shadow-lg hover:shadow-xl hover:bg-[var(--brand-red-xlight)] transition-all duration-200"
                            aria-label="Get my vehicle's value"
                        >
                            <Calculator className="w-6 h-6" aria-hidden="true" />
                            <span>Get My Vehicle&apos;s Value</span>
                            <ArrowRight className="w-5 h-5" aria-hidden="true" />
                        </Link>
                    </motion.div>
                </div>
            </motion.div>
        </section>
    )
}

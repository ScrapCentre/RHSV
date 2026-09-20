"use client"

import React, { useState } from "react"
import { motion } from "framer-motion"
import { Sparkles, ShieldCheck, Car, Recycle, Award, CheckCircle2, Clock } from "lucide-react"
import ValuationWizardCard from "@/components/ValuationWizardCard"
import LoadingScreen from "@/components/LoadingScreen"
import { useTranslations, useLocale } from "next-intl"
import { Plus_Jakarta_Sans } from "next/font/google"

const plusJakartaSans = Plus_Jakarta_Sans({
    subsets: ["latin"],
    weight: ["400", "500", "600", "700", "800"],
})

export default function FreeValuationClient() {
    const t = useTranslations("HomePage.valuationWizard")
    const locale = useLocale()
    const [loading, setLoading] = useState(true)

    if (loading) {
        return <LoadingScreen onComplete={() => setLoading(false)} />
    }

    return (
        <div className={`min-h-screen bg-[#F8FAFC] relative flex flex-col justify-between ${locale === "hi" ? "" : plusJakartaSans.className}`}>
            {/* Main Content Area */}
            <main className="pt-28 sm:pt-32 pb-16 flex-1 relative overflow-hidden">
                {/* Dynamic Background Accents */}
                <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden -z-10">
                    <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-tr from-red-500/10 via-amber-500/5 to-transparent rounded-full blur-3xl opacity-60" />
                    <div className="absolute bottom-10 right-10 w-96 h-96 bg-red-500/5 rounded-full blur-3xl opacity-40" />
                </div>

                <div className="max-w-4xl mx-auto px-4 sm:px-6 relative z-10">
                    {/* Header Banner */}
                    <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-10">
                        <motion.h1
                            initial={{ opacity: 0, y: -15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.1 }}
                            className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight uppercase leading-tight"
                        >
                            Vehicle Valuation & Scrap Calculator
                        </motion.h1>
                    </div>

                    {/* Interactive Multi-step Valuation Wizard Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="mb-4"
                    >
                        <ValuationWizardCard />
                    </motion.div>
                </div>
            </main>
        </div>
    )
}

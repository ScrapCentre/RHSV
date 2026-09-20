"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { useParams } from "next/navigation"

export default function VehicleValueBanner() {
  const params = useParams()
  const isHindi = params?.locale === "hi"

  return (
    <section className="w-full bg-[#D33D2A] text-white py-6 md:py-7 px-4 sm:px-6 lg:px-8 shadow-inner overflow-hidden">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 md:gap-6">
        {/* Left Side Info */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="flex-1"
        >
          <h3 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight text-white leading-snug">
            {isHindi ? "अपने वाहन का वास्तविक मूल्य देखें" : "See Your Vehicle's Real Value"}
          </h3>
          <p className="text-white/95 text-xs sm:text-sm md:text-base font-normal mt-1">
            {isHindi ? "मुफ्त, बिना किसी बाध्यता के वैल्यूएशन" : "Free, no-obligation valuation"}
          </p>
        </motion.div>

        {/* Right Side Button */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="shrink-0 w-full sm:w-auto"
        >
          <Link
            href={isHindi ? "/hi/know-your-valuation" : "/know-your-valuation"}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-[#18181b] hover:bg-black text-white text-sm sm:text-base font-bold transition-all duration-300 shadow-md hover:scale-105 active:scale-95 w-full sm:w-auto group"
          >
            <span>{isHindi ? "मूल्य की गणना करें" : "Calculate My Value"}</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>
      </div>
    </section>
  )
}

"use client"

import { motion } from "framer-motion"
import { ArrowRight } from "lucide-react"

export default function ChecklistWhatsAppBanner() {
  const phoneNumber = "919839447733"
  const message = encodeURIComponent("Hi, please send me the vehicle scrapping document checklist.")
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`

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
            Get the Checklist on WhatsApp
          </h3>
          <p className="text-white/95 text-xs sm:text-sm md:text-base font-normal mt-1">
            We'll send a printable copy instantly
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
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-[#18181b] hover:bg-black text-white text-sm sm:text-base font-bold transition-all duration-300 shadow-md hover:scale-105 active:scale-95 w-full sm:w-auto group"
          >
            <span>Send Me the Checklist</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </a>
        </motion.div>
      </div>
    </section>
  )
}

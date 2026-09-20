"use client"

import { motion } from "framer-motion"
import { ArrowRight } from "lucide-react"
import { useParams } from "next/navigation"

export default function CityAvailabilityBanner() {
  const params = useParams()
  const locale = params?.locale === "hi" ? "hi" : "en"
  const isHindi = locale === "hi"

  const phoneNumber = "919839447733"
  const messageText = isHindi
    ? "नमस्ते, मैं अपने शहर में वाहन स्क्रैपिंग की उपलब्धता की जांच करना चाहता हूं।"
    : "Hi, I want to check vehicle scrapping availability in my city."
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(messageText)}`

  return (
    <section className="w-full bg-[#D03028] text-white py-6 md:py-8 px-4 sm:px-6 lg:px-8 shadow-inner overflow-hidden">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 md:gap-6">
        {/* Left Side Header & Subtitle */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="flex-1"
        >
          <h3 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight text-white leading-tight">
            {isHindi ? "अपने शहर में उपलब्धता की जांच करें" : "Check Availability in Your City"}
          </h3>
          <p className="text-white/85 text-xs sm:text-sm md:text-base font-normal mt-1">
            {isHindi ? "व्हाट्सएप पर पिकअप स्लॉट की पुष्टि करें" : "Pickup slots confirmed on WhatsApp"}
          </p>
        </motion.div>

        {/* Right Side Action Button */}
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
            className="
              inline-flex items-center justify-center gap-2
              px-6 py-3 rounded-full
              bg-[#18181b] hover:bg-black
              text-white text-sm sm:text-base font-bold
              transition-all duration-300 shadow-md
              hover:scale-105 active:scale-95
              w-full sm:w-auto group
            "
          >
            <span>{isHindi ? "मेरा शहर जांचें" : "Check My City"}</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </a>
        </motion.div>
      </div>
    </section>
  )
}

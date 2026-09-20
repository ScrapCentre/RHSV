"use client"

import { motion } from "framer-motion"
import { useParams } from "next/navigation"

export default function CoverageRegionSection() {
  const params = useParams()
  const locale = params?.locale === "hi" ? "hi" : "en"

  const isHindi = locale === "hi"

  const activeCities = [
    { en: "Kanpur", hi: "कानपुर" },
    { en: "Etawah", hi: "इटावा" },
    { en: "Auraiya", hi: "औरैया" },
  ]

  const comingSoonCities = [
    { en: "Mainpuri", hi: "मैनपुरी" },
    { en: "Kannauj", hi: "कन्नौज" },
    { en: "Firozabad", hi: "फिरोजाबाद" },
    { en: "Farrukhabad", hi: "फर्रुखाबाद" },
    { en: "Agra", hi: "आगरा" },
    { en: "Lucknow", hi: "लखनऊ" },
  ]

  return (
    <section className="bg-[#FAF0ED] dark:bg-slate-900/90 py-10 md:py-14 transition-colors duration-300">
      <div className="container mx-auto px-6 md:px-12 max-w-6xl">
        {/* Header Tag & Title */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="mb-6 md:mb-8 max-w-3xl"
        >
          <span className="text-[#E31E24] text-[11px] md:text-xs font-bold tracking-[0.18em] uppercase block mb-2">
            {isHindi ? "हमारी सेवा के क्षेत्र" : "WHERE WE OPERATE"}
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-snug">
            {isHindi
              ? "कानपुर और 250 किमी औरैया क्षेत्र में सेवाएं उपलब्ध"
              : "Serving Kanpur and the 250 km Auraiya region"}
          </h2>
        </motion.div>

        {/* Location Pills Grid */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="flex flex-wrap items-center gap-2.5 md:gap-3"
        >
          {/* Active Cities with Green Glowing Dot */}
          {activeCities.map((city) => (
            <motion.div
              key={city.en}
              whileHover={{ scale: 1.03, y: -1 }}
              className="
                flex items-center gap-2
                bg-white dark:bg-slate-800
                px-4 py-2 md:px-4.5 md:py-2.5
                rounded-full shadow-sm hover:shadow-md
                border border-slate-200/80 dark:border-slate-700
                text-slate-900 dark:text-white
                font-bold text-xs md:text-sm
                transition-all duration-200 cursor-default
              "
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)] shrink-0 animate-pulse" />
              <span>{isHindi ? city.hi : city.en}</span>
            </motion.div>
          ))}

          {/* Coming Soon Cities */}
          {comingSoonCities.map((city) => (
            <motion.div
              key={city.en}
              whileHover={{ scale: 1.02, y: -1 }}
              className="
                flex items-center gap-1.5
                bg-white/95 dark:bg-slate-800/90
                px-4 py-2 md:px-4.5 md:py-2.5
                rounded-full shadow-sm hover:shadow-md
                border border-slate-200/70 dark:border-slate-700/70
                text-slate-700 dark:text-slate-300
                font-medium text-xs md:text-sm
                transition-all duration-200 cursor-default
              "
            >
              <span className="font-semibold">{isHindi ? city.hi : city.en}</span>
              <span className="text-slate-400 dark:text-slate-500 font-normal text-[11px] md:text-xs">
                — {isHindi ? "शीघ्र आ रहा है" : "coming soon"}
              </span>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}


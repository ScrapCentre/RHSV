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
      <div className="container mx-auto px-6 md:px-12 max-w-6xl text-left">
        {/* Header Tag, Title & Description */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="mb-8 max-w-4xl"
        >
          <span className="text-[#E31E24] text-[11px] md:text-xs font-bold tracking-[0.18em] uppercase block mb-2">
            {isHindi ? "हमारी सेवा के क्षेत्र" : "WHERE WE OPERATE"}
          </span>
          
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-snug mb-3">
            {isHindi
              ? "आपके पास वाहन स्क्रैपिंग सेवाएं — कानपुर और 250 किमी औरैया क्षेत्र"
              : "Vehicle Scrapping Services Near You — Kanpur & the 250 KM Auraiya Region"}
          </h2>

          <p className="text-slate-700 dark:text-slate-300 text-sm md:text-base font-medium leading-relaxed mb-2">
            {isHindi
              ? "क्या आप अपने पास कार स्क्रैपिंग की तलाश कर रहे हैं? स्क्रैपसेंटर वाहन पिकअप, मूल्यांकन और स्क्रैपिंग औपचारिकताओं के समर्थन के साथ कानपुर, औरैया और आसपास के क्षेत्रों में अधिकृत वाहन स्क्रैपिंग सेवाएं प्रदान करता है।"
              : "Looking for car scrapping near you? ScrapCentre provides authorised vehicle scrapping services across Kanpur, Auraiya and nearby areas, with support for vehicle pickup, valuation and scrapping formalities."}
          </p>

          <p className="text-slate-600 dark:text-slate-400 text-xs md:text-sm font-medium leading-relaxed">
            {isHindi
              ? "चाहे आप कार स्क्रैप डीलर की तलाश कर रहे हों, जांचें कि क्या स्क्रैपसेंटर वर्तमान में आपके शहर में सेवा प्रदान करता है।"
              : "Whether you are looking for a car scrap dealer, check whether ScrapCentre currently serves your city."}
          </p>
        </motion.div>

        {/* Service Areas Header */}
        <div className="mb-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-3">
            {isHindi ? "सेवा क्षेत्र" : "Service Areas"}
          </h3>
        </div>

        {/* Live Cities Section */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
              {isHindi ? "लाइव (सक्रिय)" : "LIVE"}
            </span>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="flex flex-wrap items-center gap-2.5 md:gap-3"
          >
            {activeCities.map((city) => (
              <motion.div
                key={city.en}
                whileHover={{ scale: 1.03, y: -1 }}
                className="
                  flex items-center gap-2
                  bg-white dark:bg-slate-800
                  px-4 py-2 md:px-4.5 md:py-2.5
                  rounded-full shadow-sm hover:shadow-md
                  border border-emerald-200 dark:border-emerald-800
                  text-slate-900 dark:text-white
                  font-bold text-xs md:text-sm
                  transition-all duration-200 cursor-default
                "
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                <span>{isHindi ? city.hi : city.en}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Coming Soon Cities Section */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
              {isHindi ? "शीघ्र आ रहा है" : "COMING SOON"}
            </span>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="flex flex-wrap items-center gap-2.5 md:gap-3"
          >
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
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  )
}


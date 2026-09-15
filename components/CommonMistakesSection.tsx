"use client"

import { motion } from "framer-motion"
import { Flag } from "lucide-react"

export default function CommonMistakesSection() {
  const redFlags = [
    {
      id: "01",
      title: "Accepting a verbal quote with no written breakdown",
      detail: "Always insist on an itemized written quote including scrap value and government certificate details.",
    },
    {
      id: "02",
      title: "Skipping RC cancellation after handing over the vehicle",
      detail: "Handing over a car without RC cancellation leaves you legally responsible for any future misuse.",
    },
    {
      id: "03",
      title: "Not collecting the Certificate of Deposit (COD)",
      detail: "The official COD issued by an authorised RVSF is your legal proof of permanent vehicle destruction.",
    },
    {
      id: "04",
      title: "Choosing an unauthorised scrapper for a slightly higher cash offer",
      detail: "Unregistered dealers often resell old parts illegally or use chassis numbers on counterfeit vehicles.",
    },
    {
      id: "05",
      title: "Delaying scrapping on a long-unused, tax-accruing vehicle",
      detail: "Lapsed fitness certificates and unpaid road taxes accumulate compound penalties every month.",
    },
    {
      id: "06",
      title: "Not verifying the facility's RVSF/RTO authorisation first",
      detail: "Ensure the scrapping center holds a valid government RVSF registration number before handing over keys.",
    },
  ]

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.07,
        delayChildren: 0.08,
      },
    },
  }

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease: "easeOut" as const },
    },
  }

  return (
    <section className="relative py-8 sm:py-10 lg:py-12 bg-white text-slate-900 overflow-hidden">
      {/* Background Red Glow Accent */}
      <div className="absolute top-1/2 left-0 w-64 h-64 bg-[#E31E24]/5 rounded-full blur-3xl pointer-events-none" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl relative z-10">
        {/* Top Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-6 sm:mb-8 text-left max-w-3xl"
        >
          {/* Category Tag */}
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-black text-white text-[10px] font-black uppercase tracking-[0.2em] mb-2 border border-black shadow-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-[#E31E24] animate-pulse" />
            AVOID THESE
          </div>

          {/* Title */}
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight leading-tight mb-2">
            Mistakes owners make when{" "}
            <span className="text-[#E31E24]">scrapping their vehicle</span>
          </h2>

          <p className="text-slate-600 text-xs sm:text-sm font-medium">
            Avoid these 6 critical red flags to protect yourself from legal liabilities, unpaid challans, and scams.
          </p>
        </motion.div>

        {/* 6 Compact Red Flag Cards Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          {redFlags.map((item, idx) => (
            <motion.div
              key={idx}
              variants={cardVariants}
              whileHover={{ y: -3, scale: 1.005 }}
              transition={{ type: "spring", stiffness: 350, damping: 22 }}
              className="group bg-white border border-slate-200/90 hover:border-[#E31E24] rounded-xl p-4 sm:p-4.5 shadow-xs hover:shadow-md transition-all duration-300"
            >
              <div className="flex items-start gap-3">
                {/* Red Flag Icon Badge */}
                <div className="w-8 h-8 rounded-lg bg-red-50 border border-red-100 text-[#E31E24] flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-[#E31E24] group-hover:text-white transition-all duration-300">
                  <Flag size={16} className="fill-[#E31E24] group-hover:fill-white transition-colors" />
                </div>

                <div className="flex-1">
                  {/* Title & Badge Row */}
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <h3 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-[#E31E24] transition-colors leading-snug">
                      {item.title}
                    </h3>
                    <span className="text-[9px] font-black text-[#E31E24] uppercase tracking-wider bg-red-50 px-2 py-0.5 rounded border border-red-100 shrink-0">
                      Flag #{item.id}
                    </span>
                  </div>

                  {/* Subtext Detail */}
                  <p className="text-slate-600 text-[11px] sm:text-xs font-medium leading-relaxed">
                    {item.detail}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

"use client"

import { motion } from "framer-motion"
import { Coins, FileText, FileCheck, Car, Award, Info, X, Check, Minus } from "lucide-react"
import { useParams } from "next/navigation"

export default function HomexComparisonSection() {
  const params = useParams()
  const isHindi = params?.locale === "hi"

  const comparisonRows = [
    {
      icon: Coins,
      label: isHindi ? "नकद मूल्य" : "Cash value",
      unauthorisedSymbol: "dash", // red minus/dash
      unauthorisedText: "₹23,000",
      scrapcentreText: isHindi ? "₹1,45,000 कुल" : "₹1,45,000 total",
    },
    {
      icon: FileText,
      label: isHindi ? "रोड टैक्स में छूट" : "Road tax rebate",
      unauthorisedSymbol: "cross", // red X
      unauthorisedText: isHindi ? "लागू नहीं" : "Not applicable",
      scrapcentreText: isHindi ? "₹95,000 तक" : "Up to ₹95,000",
    },
    {
      icon: FileCheck,
      label: isHindi ? "पंजीकरण शुल्क छूट" : "Registration waiver",
      unauthorisedSymbol: "cross", // red X
      unauthorisedText: "—",
      scrapcentreText: isHindi ? "₹600 तक" : "Up to ₹600",
    },
    {
      icon: Car,
      label: isHindi ? "नए वाहन पर OEM छूट" : "OEM discount on new vehicle",
      unauthorisedSymbol: "cross", // red X
      unauthorisedText: "—",
      scrapcentreText: isHindi ? "₹20,000 तक" : "Up to ₹20,000",
    },
    {
      icon: Award,
      label: isHindi ? "जमा प्रमाणपत्र (COD)" : "Certificate of Deposit (COD)",
      unauthorisedSymbol: "cross", // red X
      unauthorisedText: isHindi ? "— RC आपकी जिम्मेदारी रहती है" : "— RC stays your liability",
      scrapcentreText: isHindi ? "तुरंत जारी" : "Issued instantly",
    },
  ]

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.15,
      },
    },
  }

  const rowVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.45, ease: "easeOut" as const },
    },
  }

  return (
    <section className="relative py-10 md:py-14 lg:py-18 bg-transparent overflow-hidden">
      {/* Background Image /homex4.png */}
      <motion.div
        initial={{ opacity: 0, scale: 1.04 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1, ease: "easeOut" as const }}
        className="absolute inset-0 bg-contain lg:bg-cover bg-right-top bg-no-repeat pointer-events-none"
        style={{ backgroundImage: `url('/homex4.png')` }}
      />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 max-w-7xl">
        {/* Top Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-2xl mb-8 sm:mb-12 text-left"
        >
          {/* Badge: — WHY CHOOSE US */}
          <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full border border-[#E31E24] text-[#E31E24] text-xs font-bold uppercase tracking-wider mb-4 bg-white/90 backdrop-blur-sm shadow-xs">
            <span className="font-semibold">—</span> {isHindi ? "हमें क्यों चुनें" : "WHY CHOOSE US"}
          </div>

          {/* Title */}
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-[1.15] mb-4">
            {isHindi ? (
              <>
                कबाड़ी (Scrap Dealer) और <span className="text-[#E31E24] block sm:inline">RVSF के बीच वास्तविक अंतर</span>
              </>
            ) : (
              <>
                The real difference between{" "}
                <span className="text-[#E31E24] block sm:inline">
                  a scrap dealer and an RVSF
                </span>
              </>
            )}
          </h2>

          {/* Subtitle / Paragraph */}
          <p className="text-slate-600 text-sm sm:text-base lg:text-lg font-medium leading-relaxed">
            {isHindi
              ? "ScrapCentre पर हम एक पारदर्शी, निष्पक्ष और परेशानी मुक्त प्रक्रिया का पालन करते हैं — बिना किसी छिपे हुए शुल्क के आपके पुराने वाहनों का सर्वोत्तम मूल्य प्रदान करते हैं।"
              : "At ScrapCentre, we follow a transparent, fair and hassle-free process — giving you the best value for your old vehicles, with no hidden charges."}
          </p>
        </motion.div>

        {/* Comparison Table Container & Footnote (Centered) */}
        <motion.div
          initial={{ opacity: 0, y: 35 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="mt-10 sm:mt-14 mx-auto max-w-5xl"
        >
          <div className="bg-white/95 backdrop-blur-md border border-slate-200/80 rounded-2xl sm:rounded-3xl shadow-xl overflow-hidden">
            {/* Table Header Row */}
            <div className="grid grid-cols-12 items-center p-2.5 sm:p-5 bg-[#FAF3F3] border-b border-red-100/80 text-slate-700 text-[9px] xs:text-[10px] sm:text-xs font-extrabold uppercase tracking-wider">
              <div className="col-span-5 sm:col-span-4 text-left">
                {isHindi ? "आपको क्या मिलता है" : "WHAT YOU GET"}
              </div>
              <div className="col-span-3 sm:col-span-4 text-center sm:text-left">
                {isHindi ? "अनधिकृत कबाड़ी" : "UNAUTHORISED SCRAPPER"}
              </div>
              <div className="col-span-4 sm:col-span-4 text-left">
                {isHindi ? "स्क्रैपसेंटर RVSF" : "SCRAPCENTRE RVSF"}
              </div>
            </div>

            {/* Table Body Rows */}
            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              className="divide-y divide-slate-100"
            >
              {comparisonRows.map((row, idx) => {
                const Icon = row.icon
                return (
                  <motion.div
                    key={idx}
                    variants={rowVariants}
                    className="grid grid-cols-12 items-center p-2.5 sm:p-5 hover:bg-slate-50/60 transition-colors"
                  >
                    {/* Column 1: Feature & Icon */}
                    <div className="col-span-5 sm:col-span-4 flex items-center gap-1.5 sm:gap-3 pr-1 sm:pr-2">
                      <div className="w-7 h-7 sm:w-10 sm:h-10 rounded-full bg-red-50 text-[#E31E24] flex items-center justify-center shrink-0 shadow-xs">
                        <Icon size={15} strokeWidth={2.2} className="sm:hidden" />
                        <Icon size={18} strokeWidth={2.2} className="hidden sm:block" />
                      </div>
                      <span className="text-slate-900 font-bold text-[10px] sm:text-sm leading-snug">
                        {row.label}
                      </span>
                    </div>

                    {/* Column 2: Unauthorised Scrapper */}
                    <div className="col-span-3 sm:col-span-4 flex items-center gap-1 sm:gap-2 text-[#E31E24] font-bold text-[9px] xs:text-[11px] sm:text-sm pr-1 sm:pr-2">
                      {row.unauthorisedSymbol === "dash" ? (
                        <Minus size={14} strokeWidth={3} className="shrink-0 text-[#E31E24]" />
                      ) : (
                        <X size={14} strokeWidth={3} className="shrink-0 text-[#E31E24]" />
                      )}
                      <span className="leading-tight break-words">{row.unauthorisedText}</span>
                    </div>

                    {/* Column 3: ScrapCentre RVSF */}
                    <div className="col-span-4 sm:col-span-4 flex items-center gap-1 sm:gap-2 text-emerald-600 font-extrabold text-[9px] xs:text-[11px] sm:text-sm">
                      <Check size={15} strokeWidth={3} className="shrink-0 text-emerald-600" />
                      <span className="leading-tight break-words">{row.scrapcentreText}</span>
                    </div>
                  </motion.div>
                )
              })}
            </motion.div>
          </div>

          {/* Footnote */}
          <div className="flex items-start sm:items-center gap-2 mt-4 text-slate-500 text-xs font-medium">
            <Info size={15} className="shrink-0 text-slate-400 mt-0.5 sm:mt-0" />
            <span>
              Illustrative figures — final numbers to be confirmed against ScrapCentre's actual pricing before publishing.
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

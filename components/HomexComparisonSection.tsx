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
      label: isHindi ? "स्क्रैप मूल्य" : "Scrap value",
      unauthorisedSymbol: "dash",
      unauthorisedText: isHindi
        ? "मुख्य रूप से वाहन के स्क्रैप मूल्य पर आधारित नकद प्रस्ताव"
        : "Cash offer based mainly on the vehicle's scrap value",
      scrapcentreText: isHindi
        ? "लागू वाहन और स्क्रैप कारकों के आधार पर वाहन मूल्यांकन"
        : "Vehicle valuation based on applicable vehicle and scrap factors",
    },
    {
      icon: FileText,
      label: isHindi ? "रोड टैक्स में छूट" : "Road tax rebate",
      unauthorisedSymbol: "cross",
      unauthorisedText: isHindi
        ? "सामान्यतः लेनदेन का हिस्सा नहीं"
        : "Generally not part of the transaction",
      scrapcentreText: isHindi
        ? "लागू लाभ प्रचलित नियमों के अनुसार संसाधित किए जा सकते हैं"
        : "Applicable benefits can be processed as per prevailing rules",
    },
    {
      icon: FileCheck,
      label: isHindi ? "पंजीकरण-संबंधित लाभ" : "Registration-related benefit",
      unauthorisedSymbol: "cross",
      unauthorisedText: isHindi
        ? "डी-रजिस्ट्रेशन लाभों के लिए कोई औपचारिक सहायता नहीं"
        : "No formal support for deregistration benefits",
      scrapcentreText: isHindi
        ? "आवश्यक डी-रजिस्ट्रेशन और स्क्रैपिंग प्रक्रिया में सहायता"
        : "Support with the required deregistration and scrapping process",
    },
    {
      icon: Car,
      label: isHindi ? "OEM छूट" : "OEM discount",
      unauthorisedSymbol: "cross",
      unauthorisedText: isHindi ? "आमतौर पर उपलब्ध नहीं" : "Usually not available",
      scrapcentreText: isHindi
        ? "पात्र OEM लाभ उपलब्ध हो सकते हैं, जो लागू शर्तों के अधीन हैं"
        : "Eligible OEM benefits may be available, subject to applicable terms",
    },
    {
      icon: Award,
      label: isHindi ? "जमा प्रमाणपत्र (COD)" : "Certificate of Deposit (COD)",
      unauthorisedSymbol: "cross",
      unauthorisedText: isHindi
        ? "अनधिकृत चैनल के माध्यम से जारी नहीं किया जाता"
        : "Not issued through an unauthorised channel",
      scrapcentreText: isHindi
        ? "अधिकृत स्क्रैपिंग प्रक्रिया के माध्यम से COD जारी किया गया"
        : "COD issued through the authorised scrapping process",
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
                अधिकृत बनाम अनधिकृत वाहन स्क्रैपिंग —{" "}
                <span className="text-[#E31E24] block sm:inline">
                  अधिकृत चुनना क्यों फ़ायदेमंद है
                </span>
              </>
            ) : (
              <>
                Authorised vs. Unauthorised Vehicle Scrapping —{" "}
                <span className="text-[#E31E24] block sm:inline">
                  Why It Pays to Go Authorised
                </span>
              </>
            )}
          </h2>

          {/* Subtitle / Paragraph */}
          <p className="text-slate-600 text-sm sm:text-base lg:text-lg font-medium leading-relaxed">
            {isHindi
              ? "केवल नकद देने वाला स्क्रैपर एक अग्रिम राशि की पेशकश कर सकता है, जबकि एक अधिकृत RVSF एक व्यापक वाहन स्क्रैपिंग लाभ प्रदान कर सकता है जिसमें स्क्रैप मूल्य, लागू छूट, पंजीकरण से संबंधित लाभ और अन्य पात्र ऑफ़र शामिल हो सकते हैं।"
              : "A cash-only scrapper may offer an upfront amount, while an authorised RVSF can provide a broader vehicle scrapping benefit that may include the scrap value, applicable rebates, registration-related benefits and other eligible offers."}
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
              <div className="col-span-4 text-left">
                {isHindi ? "लाभ" : "Benefit"}
              </div>
              <div className="col-span-4 text-left">
                {isHindi ? "अनधिकृत स्क्रैपर" : "Unauthorised Scrapper"}
              </div>
              <div className="col-span-4 text-left">
                {isHindi ? "अधिकृत RVSF / स्क्रैपसेंटर" : "Authorised RVSF / ScrapCentre"}
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
                    {/* Column 1: Benefit & Icon */}
                    <div className="col-span-4 flex items-center gap-1.5 sm:gap-3 pr-1 sm:pr-2">
                      <div className="hidden sm:flex w-10 h-10 rounded-full bg-red-50 text-[#E31E24] items-center justify-center shrink-0 shadow-xs">
                        <Icon size={18} strokeWidth={2.2} />
                      </div>
                      <span className="text-slate-900 font-bold text-[10px] sm:text-sm leading-snug">
                        {row.label}
                      </span>
                    </div>

                    {/* Column 2: Unauthorised Scrapper */}
                    <div className="col-span-4 flex items-center gap-1 sm:gap-2 text-slate-700 font-medium text-[9px] xs:text-[11px] sm:text-sm pr-1 sm:pr-2">
                      <span className="leading-tight break-words">{row.unauthorisedText}</span>
                    </div>

                    {/* Column 3: Authorised RVSF / ScrapCentre */}
                    <div className="col-span-4 flex items-center gap-1 sm:gap-2 text-slate-900 font-semibold text-[9px] xs:text-[11px] sm:text-sm">
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

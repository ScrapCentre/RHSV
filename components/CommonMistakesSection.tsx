"use client"

import { motion } from "framer-motion"
import { Flag } from "lucide-react"
import { useParams } from "next/navigation"

export default function CommonMistakesSection() {
  const params = useParams()
  const isHindi = params?.locale === "hi"

  const redFlags = [
    {
      id: "01",
      title: isHindi
        ? "केवल मौखिक कोट स्वीकार करना:"
        : "Accepting a verbal-only quote:",
      detail: isHindi
        ? "अपने वाहन को सौंपने से पहले हमेशा स्क्रैप मूल्य और लागू लाभों का स्पष्ट रूप से दस्तावेजीकरण करवाएं।"
        : "Always get the scrap value and applicable benefits clearly documented before handing over your vehicle.",
    },
    {
      id: "02",
      title: isHindi
        ? "RC रद्दीकरण को छोड़ना:"
        : "Skipping RC cancellation:",
      detail: isHindi
        ? "सुनिश्चित करें कि अधिकृत स्क्रैपिंग प्रक्रिया के हिस्से के रूप में वाहन का पंजीकरण ठीक से रद्द किया गया है।"
        : "Make sure the vehicle's registration is properly cancelled as part of the authorised scrapping process.",
    },
    {
      id: "03",
      title: isHindi
        ? "COD एकत्र न करना:"
        : "Not collecting the COD:",
      detail: isHindi
        ? "यह प्रमाण देने के लिए कि आपका वाहन स्क्रैपिंग के लिए जमा कर दिया गया है, हमेशा अपना जमा प्रमाणपत्र (COD) एकत्र करें।"
        : "Always collect your Certificate of Deposit (COD) as proof that your vehicle has been deposited for scrapping.",
    },
    {
      id: "04",
      title: isHindi
        ? "थोड़े अधिक नकद के लिए अनधिकृत स्क्रैपर को चुनना:"
        : "Choosing an unauthorised scrapper for slightly more cash:",
      detail: isHindi
        ? "एक उच्च अग्रिम प्रस्ताव अधिकृत कार स्क्रैपर के माध्यम से उपलब्ध दस्तावेज़ीकरण और औपचारिक प्रक्रिया प्रदान नहीं कर सकता है।"
        : "A higher upfront offer may not provide the documentation and formal process available through an authorised car scrapper.",
    },
    {
      id: "05",
      title: isHindi
        ? "लंबे समय से अप्रयुक्त वाहन के लिए स्क्रैपिंग में देरी:"
        : "Delaying scrapping for a long-unused vehicle:",
      detail: isHindi
        ? "यदि कोई वाहन लंबे समय से अप्रयुक्त है, तो उसकी स्थिति की जांच करें और उसे लावारिस छोड़ने के बजाय उचित अधिकृत स्क्रैपिंग मार्ग पर विचार करें।"
        : "If a vehicle has been unused for a long time, check its status and consider the appropriate authorised scrapping route instead of leaving it unattended.",
    },
    {
      id: "06",
      title: isHindi
        ? "RVSF प्राधिकरण का सत्यापन न करना:"
        : "Not verifying RVSF authorisation:",
      detail: isHindi
        ? "अपना वाहन सौंपने से पहले, पुष्टि करें कि आप पंजीकृत RVSF के माध्यम से संचालित अधिकृत वाहन स्क्रैपर के साथ व्यवहार कर रहे हैं।"
        : "Before handing over your vehicle, confirm that you are dealing with an authorised vehicle scrapper operating through a registered RVSF.",
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
            {isHindi ? "इनसे बचें" : "MISTAKES TO AVOID"}
          </div>

          {/* Title */}
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight leading-tight">
            {isHindi ? (
              <>
                वाहन स्क्रैप करते समय <span className="text-[#E31E24]">बचने योग्य सामान्य गलतियाँ</span>
              </>
            ) : (
              <>
                Common Mistakes to Avoid When <span className="text-[#E31E24]">Scrapping Your Vehicle</span>
              </>
            )}
          </h2>
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

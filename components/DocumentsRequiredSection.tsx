"use client"

import { motion } from "framer-motion"
import { CheckSquare, ShieldCheck, FileText, Info } from "lucide-react"

export default function DocumentsRequiredSection() {
  const documentList = [
    "Original Registration Certificate (RC)",
    "Valid Aadhaar / photo ID proof",
    "PUC certificate, if available",
    "Insurance copy (if valid)",
    "NOC from financier, if hypothecated",
    "Signed owner declaration form",
  ]

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.1,
      },
    },
  }

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.45, ease: "easeOut" as const },
    },
  }

  return (
    <section className="relative py-10 sm:py-14 lg:py-16 bg-gradient-to-b from-white via-[#FDF7F7] to-white text-slate-900 overflow-hidden">
      {/* Background Watermark Logo */}
      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-96 lg:w-[500px] opacity-[0.03] pointer-events-none select-none">
        <img src="/logo.png" alt="ScrapCentre Logo Watermark" className="w-full h-auto" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Column: Heading & Document Checklist */}
          <div className="lg:col-span-8">
            {/* Top Header */}
            <motion.div
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="mb-8 sm:mb-10 text-left"
            >
              {/* Category Tag */}
              <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded bg-black text-white text-[10px] font-black uppercase tracking-[0.2em] mb-3 border border-black shadow-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-[#E31E24] animate-pulse" />
                BEFORE YOU BOOK
              </div>

              {/* Main Heading */}
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight mb-3">
                What you'll need to <span className="text-[#E31E24]">hand over</span>
              </h2>

              <p className="text-slate-600 text-sm sm:text-base font-medium">
                Keep these documents ready for a smooth, hassle-free pickup and instant RTO deregistration.
              </p>
            </motion.div>

            {/* 6 Document Items Grid */}
            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.15 }}
              className="grid grid-cols-1 sm:grid-cols-2 gap-4"
            >
              {documentList.map((docText, idx) => (
                <motion.div
                  key={idx}
                  variants={cardVariants}
                  whileHover={{ scale: 1.01, x: 2 }}
                  transition={{ type: "spring", stiffness: 350, damping: 25 }}
                  className="group bg-white border-2 border-slate-100 hover:border-emerald-500 rounded-xl p-4 sm:p-4.5 flex items-center gap-3.5 shadow-xs hover:shadow-md hover:shadow-emerald-500/10 transition-all duration-300"
                >
                  {/* Checkbox Badge */}
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 group-hover:bg-emerald-600 group-hover:border-emerald-600 group-hover:text-white transition-colors duration-300">
                    <CheckSquare size={18} strokeWidth={2.2} />
                  </div>

                  {/* Document Name */}
                  <span className="text-slate-800 font-bold text-xs sm:text-sm group-hover:text-emerald-600 transition-colors leading-snug">
                    {docText}
                  </span>
                </motion.div>
              ))}
            </motion.div>

            {/* Footnote */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="flex items-center gap-2 mt-6 text-slate-500 text-xs font-medium"
            >
              <Info size={15} className="shrink-0 text-slate-400" />
              <span>
                Exact document list to be verified with ScrapCentre's compliance team before publishing.
              </span>
            </motion.div>
          </div>

          {/* Right Column: Featured ScrapCentre Brand Guarantee Card with Logo */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 30 }}
            whileInView={{ opacity: 1, scale: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-4"
          >
            <div className="relative bg-white border-2 border-slate-900 rounded-2xl p-6 sm:p-8 shadow-xl text-center overflow-hidden group">
              {/* Top Red Gradient Bar */}
              <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-black via-[#E31E24] to-black" />

              {/* ScrapCentre Logo */}
              <div className="w-32 sm:w-40 mx-auto mb-6 p-2 bg-white rounded-xl shadow-xs border border-slate-100">
                <img
                  src="/logo.png"
                  alt="ScrapCentre Logo"
                  className="w-full h-auto object-contain mx-auto"
                />
              </div>

              {/* Card Title */}
              <h3 className="text-lg font-black text-slate-900 mb-2 tracking-tight">
                100% RTO Verified Process
              </h3>

              <p className="text-slate-600 text-xs font-medium leading-relaxed mb-6">
                Our team assists you with complete paperwork & legal COD issuance right at your doorstep.
              </p>

              {/* Feature Badges */}
              <div className="space-y-2 text-left bg-slate-50 rounded-xl p-3.5 border border-slate-100 text-xs font-bold text-slate-800">
                <div className="flex items-center gap-2 text-[#E31E24]">
                  <ShieldCheck size={16} />
                  <span>Government Authorised RVSF</span>
                </div>
                <div className="flex items-center gap-2 text-emerald-600">
                  <FileText size={16} />
                  <span>Instant Certificate of Deposit</span>
                </div>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  )
}

"use client"

import { motion } from "framer-motion"
import { Check, X, ShieldCheck, AlertTriangle } from "lucide-react"

export default function RvsfTrustSection() {
  const authorizedBenefits = [
    "Legal deregistration recognised by every RTO",
    "A Certificate of Deposit (COD) — proof the vehicle is off your name, permanently",
    "Eligibility for road-tax rebate & OEM purchase benefits",
    "Environmentally compliant dismantling of fluids, battery & parts",
  ]

  const unauthorizedRisks = [
    "No COD — the vehicle can still be traced to your name",
    "Liability for challans or misuse on an \"informally\" scrapped vehicle",
    "Zero eligibility for tax rebate or OEM discounts",
    "Non-compliant, unsafe disposal of hazardous parts",
  ]

  return (
    <section className="relative py-12 sm:py-16 lg:py-20 bg-white text-slate-900 overflow-hidden">
      {/* Background Subtle Accent Lines */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#00000005_1px,transparent_1px),linear-gradient(to_bottom,#00000005_1px,transparent_1px)] bg-[size:3rem_3rem] pointer-events-none" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl relative z-10">
        {/* Top Header */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-10 sm:mb-12 text-left max-w-3xl"
        >
          {/* Category Tag */}
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded bg-black text-white text-[10px] font-black uppercase tracking-[0.2em] mb-3 border border-black shadow-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-[#E31E24] animate-pulse" />
            TRUST & COMPLIANCE
          </div>

          {/* Title */}
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight leading-tight">
            India's Largest Capacity RVSF —{" "}
            <span className="text-[#E31E24]">what that actually means for you</span>
          </h2>
        </motion.div>

        {/* 2 Comparison Cards Side-by-Side */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {/* Left Card: Authorised RVSF Benefits */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            whileHover={{ y: -4 }}
            className="bg-white border-2 border-emerald-100 hover:border-emerald-500 rounded-2xl p-6 sm:p-8 shadow-sm hover:shadow-xl hover:shadow-emerald-500/10 transition-all duration-300 flex flex-col justify-between group"
          >
            <div>
              {/* Header Pill & Title */}
              <div className="flex items-center gap-2 mb-4">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold uppercase tracking-wider border border-emerald-200">
                  <ShieldCheck size={14} className="text-emerald-600" />
                  Government Authorised
                </span>
              </div>

              <h3 className="text-lg sm:text-xl font-black text-slate-900 mb-6 tracking-tight group-hover:text-emerald-700 transition-colors">
                A government-authorised RVSF gives you
              </h3>

              {/* Benefits Checklist */}
              <ul className="space-y-4">
                {authorizedBenefits.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5 font-bold shadow-xs">
                      <Check size={14} strokeWidth={3} />
                    </div>
                    <span className="text-slate-700 text-xs sm:text-sm font-semibold leading-relaxed">
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>

          {/* Right Card: Unauthorised Scrapper Risks */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            whileHover={{ y: -4 }}
            className="bg-white border-2 border-red-100 hover:border-[#E31E24] rounded-2xl p-6 sm:p-8 shadow-sm hover:shadow-xl hover:shadow-red-500/10 transition-all duration-300 flex flex-col justify-between group"
          >
            <div>
              {/* Header Pill & Title */}
              <div className="flex items-center gap-2 mb-4">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 text-[#E31E24] text-xs font-bold uppercase tracking-wider border border-red-200">
                  <AlertTriangle size={14} className="text-[#E31E24]" />
                  Unregistered Risks
                </span>
              </div>

              <h3 className="text-lg sm:text-xl font-black text-slate-900 mb-6 tracking-tight group-hover:text-[#E31E24] transition-colors">
                Scrap with an unauthorised dealer and you risk
              </h3>

              {/* Risks Cross List */}
              <ul className="space-y-4">
                {unauthorizedRisks.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-red-100 text-[#E31E24] flex items-center justify-center shrink-0 mt-0.5 font-bold shadow-xs">
                      <X size={14} strokeWidth={3} />
                    </div>
                    <span className="text-slate-700 text-xs sm:text-sm font-semibold leading-relaxed">
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

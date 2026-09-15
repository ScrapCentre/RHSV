"use client"

import { motion } from "framer-motion"
import { ClipboardList, Truck, ShieldCheck, Banknote, ArrowRight } from "lucide-react"

export default function ScrappingProcessSection() {
  const steps = [
    {
      number: "01",
      title: "Share Vehicle Details",
      description: "Tell us the vehicle type, model & location for an instant estimate.",
      icon: ClipboardList,
    },
    {
      number: "02",
      title: "Free Doorstep Pickup",
      description: "We schedule a convenient pickup — towing included if non-running.",
      icon: Truck,
    },
    {
      number: "03",
      title: "Documentation Support",
      description: "RC cancellation & paperwork handled end-to-end.",
      icon: ShieldCheck,
    },
    {
      number: "04",
      title: "Payment + COD Issued",
      description: "Instant payment and your Certificate of Deposit, same day.",
      icon: Banknote,
    },
  ]

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
        delayChildren: 0.08,
      },
    },
  }

  const cardVariants = {
    hidden: { opacity: 0, y: 25, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] as const },
    },
  }

  return (
    <section className="relative py-8 sm:py-10 lg:py-12 bg-gradient-to-b from-white via-[#FDF7F7] to-white text-slate-900 overflow-hidden">
      {/* Background Red Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[200px] bg-[#E31E24]/5 rounded-full blur-3xl pointer-events-none" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl relative z-10">
        {/* Top Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-6 sm:mb-8 text-left max-w-3xl"
        >
          {/* Tag */}
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-black text-white text-[10px] font-black uppercase tracking-[0.2em] mb-2 border border-black shadow-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-[#E31E24] animate-pulse" />
            PROCESS
          </div>

          {/* Heading */}
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight leading-tight">
            Four steps, start to{" "}
            <span className="text-[#E31E24]">Certificate of Deposit</span>
          </h2>
        </motion.div>

        {/* Process Steps Grid */}
        <div className="relative">
          {/* Connecting Line (Desktop) */}
          <motion.div
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            className="hidden lg:block absolute top-9 left-[10%] right-[10%] h-[2px] bg-gradient-to-r from-black/10 via-[#E31E24] to-black/10 origin-left z-0"
          />

          {/* 4 Compact Cards Grid */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.15 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 relative z-10"
          >
            {steps.map((item, idx) => {
              const Icon = item.icon
              return (
                <motion.div
                  key={idx}
                  variants={cardVariants}
                  whileHover={{ y: -5, scale: 1.01 }}
                  transition={{ type: "spring", stiffness: 350, damping: 22 }}
                  className="group relative bg-white border border-slate-200/80 hover:border-[#E31E24] rounded-xl p-4 sm:p-5 flex flex-col justify-between shadow-xs hover:shadow-[0_12px_28px_-8px_rgba(227,30,36,0.18)] transition-all duration-300"
                >
                  {/* Top Step Badge & Icon */}
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-2xl font-black text-[#E31E24] tracking-tight group-hover:scale-105 transition-transform">
                      {item.number}
                    </span>
                    <div className="w-10 h-10 rounded-lg bg-black text-white flex items-center justify-center group-hover:bg-[#E31E24] group-hover:rotate-6 transition-all duration-300 shadow-sm">
                      <Icon size={18} strokeWidth={2.2} />
                    </div>
                  </div>

                  <div>
                    {/* Title */}
                    <h3 className="text-base font-black text-slate-900 group-hover:text-[#E31E24] transition-colors mb-1 tracking-tight">
                      {item.title}
                    </h3>

                    {/* Description */}
                    <p className="text-slate-600 text-xs font-medium leading-relaxed">
                      {item.description}
                    </p>
                  </div>

                  {/* Step Connector Footer */}
                  <div className="mt-4 pt-2.5 border-t border-slate-100 flex items-center justify-between text-slate-400 group-hover:text-[#E31E24] transition-colors">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider">
                      Step {item.number}
                    </span>
                    <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform duration-300" />
                  </div>
                </motion.div>
              )
            })}
          </motion.div>
        </div>
      </div>
    </section>
  )
}

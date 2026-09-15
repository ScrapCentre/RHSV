"use client"

import { motion } from "framer-motion"
import { Car, FileText, ClipboardX, Coins, ShieldCheck, Leaf } from "lucide-react"

export default function HomexWhatIsSection() {
  const criteriaList = [
    {
      icon: Car,
      text: "Vehicle not crossed its RC validity / fitness age limit",
    },
    {
      icon: FileText,
      text: "Vehicle failed its fitness or emissions test",
    },
    {
      icon: ClipboardX,
      text: "Registration has lapsed and re-registration isn't viable",
    },
    {
      icon: Coins,
      text: "Repair cost now exceeds the vehicle's resale value",
    },
    {
      icon: ShieldCheck,
      text: "Vehicle is no longer roadworthy or safe to use",
    },
    {
      icon: Leaf,
      text: "Supporting a cleaner, greener tomorrow",
    },
  ]

  // Container motion variants for smooth staggered reveal
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
        delayChildren: 0.1,
      },
    },
  }

  const headerVariants = {
    hidden: { opacity: 0, y: 35, scale: 0.98 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as const },
    },
  }

  const cardVariants = {
    hidden: { opacity: 0, y: 40, scale: 0.92 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const },
    },
  }

  return (
    <motion.section
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      className="relative py-8 md:py-12 lg:py-16 bg-transparent overflow-hidden"
    >
      {/* Background Image - Smooth Fade & Scale in on scroll */}
      <motion.div 
        initial={{ opacity: 0, scale: 1.05 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.2, ease: "easeOut" as const }}
        className="absolute inset-0 bg-contain lg:bg-cover bg-right-top bg-no-repeat opacity-100 pointer-events-none transition-all duration-300"
        style={{ backgroundImage: `url('/whatis.png')` }}
      />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 max-w-7xl">
        {/* Top Header - Shifted Left for Clean Alignment */}
        <motion.div variants={headerVariants} className="max-w-xl lg:max-w-2xl mb-8 md:mb-10 text-left">
          {/* Category Tagline */}
          <div className="flex items-center gap-3 mb-3">
            <span className="h-[2px] w-6 bg-[#E31E24]"></span>
            <span className="text-[#E31E24] font-bold text-[11px] sm:text-xs uppercase tracking-[0.2em]">
              HOW VEHICLE SCRAPPING WORKS
            </span>
            <span className="h-[2px] w-6 bg-[#E31E24]"></span>
          </div>

          {/* Main Title */}
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 leading-[1.15] mb-4 tracking-tight">
            A quick, extractable{" "}
            <span className="text-[#E31E24]">answer</span> — then the detail
          </h2>

          {/* Subtitle / Paragraph */}
          <p className="text-slate-600 text-sm sm:text-base lg:text-lg leading-relaxed font-medium">
            Vehicle scrapping is the{" "}
            <strong className="text-[#E31E24] font-bold">
              legal, permanent deregistration and dismantling
            </strong>{" "}
            of an end-of-life vehicle at a government-authorised Registered Vehicle Scrapping Facility (RVSF), which issues a Certificate of Deposit (COD) in exchange for the vehicle's material and salvage value.
          </p>
        </motion.div>

        {/* 6 Criteria Cards Grid with Staggered Scroll Entrance */}
        <motion.div
          variants={containerVariants}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6 mt-20 md:mt-32 lg:mt-40 mb-8 md:mb-10"
        >
          {criteriaList.map((item, idx) => {
            const Icon = item.icon
            return (
              <motion.div
                key={idx}
                variants={cardVariants}
                whileHover={{ y: -6, scale: 1.02 }}
                transition={{ duration: 0.3 }}
                className="bg-white/95 backdrop-blur-md border border-slate-100 rounded-2xl p-5 shadow-sm hover:shadow-xl hover:shadow-red-500/10 hover:border-red-200 transition-all flex items-center gap-4 group cursor-pointer"
              >
                <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-red-50 flex items-center justify-center text-[#E31E24] shrink-0 group-hover:bg-[#E31E24] group-hover:text-white group-hover:scale-110 transition-all duration-300 shadow-sm">
                  <Icon size={20} strokeWidth={2} />
                </div>
                <p className="text-slate-800 text-xs sm:text-sm font-bold leading-snug group-hover:text-[#E31E24] transition-colors">
                  {item.text}
                </p>
              </motion.div>
            )
          })}
        </motion.div>
      </div>
    </motion.section>
  )
}

"use client"
import { motion, useInView } from "framer-motion"
import { useRef } from "react"
import { ArrowRight } from "lucide-react"
import ValuationWizardCard from "./ValuationWizardCard"

export default function ServicesSection() {
  const containerRef = useRef<HTMLDivElement>(null)
  const isInView = useInView(containerRef, { once: false, amount: 0.1 })

  return (
    <section id="services" className="bg-white py-12 md:py-16 relative overflow-hidden" ref={containerRef}>
      {/* Subtle Background Elements & Moving Animations */}
      <div className="absolute top-0 right-0 w-1/3 h-full bg-slate-50/50 -skew-x-12 translate-x-1/2 pointer-events-none" />
      
      {/* Moving Light Orbs - Subtle & Professional */}
      <motion.div 
        animate={{ 
          x: [0, 100, 0],
          y: [0, 50, 0],
        }}
        transition={{ 
          duration: 20, 
          repeat: Infinity, 
          ease: "linear" 
        }}
        className="absolute top-20 left-10 w-[400px] h-[400px] bg-red-500/5 rounded-full blur-[120px] pointer-events-none"
      />
      <motion.div 
        animate={{ 
          x: [0, -80, 0],
          y: [0, 100, 0],
        }}
        transition={{ 
          duration: 25, 
          repeat: Infinity, 
          ease: "linear" 
        }}
        className="absolute bottom-20 right-10 w-[500px] h-[500px] bg-slate-200/40 rounded-full blur-[150px] pointer-events-none"
      />

      {/* Floating Geometric Accents */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
        className="absolute top-1/4 right-[10%] w-64 h-64 border border-slate-100 rounded-full opacity-20 pointer-events-none"
      >
        <div className="absolute top-0 left-1/2 w-2 h-2 bg-red-500 rounded-full -translate-x-1/2" />
      </motion.div>

      <div className="container mx-auto px-6 relative z-10">

        {/* ── Section Header ── */}
        <div className="max-w-4xl mb-10 lg:mb-12">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
            transition={{ duration: 0.6 }}
            className="flex items-center gap-3 mb-4"
          >
            <div className="relative w-10 h-1 bg-[#E31E24] overflow-hidden">
              <motion.div 
                animate={{ x: ["-100%", "100%"] }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
              />
            </div>
            <span className="text-[#E31E24] font-bold text-[10px] uppercase tracking-[0.3em]">Our Services</span>
          </motion.div>

          <motion.h2
            className="text-3xl md:text-4xl lg:text-5xl font-black text-slate-900 mb-4 tracking-tight leading-tight"
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            Tell us about your{" "}
            <span className="text-[#E31E24]">
              Situation
            </span>
          </motion.h2>
          
          <motion.p
            className="text-slate-500 text-sm md:text-base max-w-2xl font-medium leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Choose the option that best describes what you&apos;re looking for today. Our AI-powered platform ensures you get the most professional service.
          </motion.p>
        </div>

        {/* ── Main Component ── */}
        <div className="relative">
          <motion.div
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
          >
            <ValuationWizardCard />
          </motion.div>
        </div>

        {/* ── Bottom Assistance ── */}
        <motion.div
          className="mt-20 pt-10 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-6"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <div className="flex items-center gap-4 text-slate-500 text-sm font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            24/7 Expert Support Available
          </div>
          
          <a 
            href="/contact" 
            className="group flex items-center gap-3 px-8 py-4 bg-slate-900 text-white rounded-lg font-bold text-sm transition-all hover:bg-[#E31E24] shadow-lg shadow-slate-900/10 hover:shadow-red-500/20"
          >
            Need specialized assistance? Talk to an expert
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </a>
        </motion.div>

      </div>
    </section>
  )
}

"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowRight, Check, Car, FileText, Gift, Truck, Zap, Leaf, ShieldCheck, IndianRupee, Phone, MessageCircle, MapPin } from "lucide-react"
import { useParams } from "next/navigation"
import Link from "next/link"

export default function HomexServiceHero() {
  const params = useParams()
  const locale = params?.locale === "hi" ? "hi" : "en"
  const isHindi = locale === "hi"
  const [showTeamModal, setShowTeamModal] = useState(false)

  const checkBadges = [
    { en: "RTO Authorised RVSF", hi: "RTO अधिकृत RVSF" },
    { en: "Instant COD Issued", hi: "त्वरित COD जारी" },
    { en: "OEM Discount Support", hi: "OEM छूट सहायता" },
    { en: "Free Doorstep Pickup", hi: "मुफ्त डोरस्टेप पिकअप" },
  ]

  const bottomFeatures = [
    {
      icon: Car,
      title: isHindi ? "पंजीकरण शुल्क पर छूट" : "Discount on registration fees",
    },
    {
      icon: FileText,
      title: isHindi ? "त्वरित जमा प्रमाणपत्र (COD)" : "Instant Certificate of Deposit",
    },
    {
      icon: Gift,
      title: isHindi ? "विशेष OEM लाभ" : "Exclusive OEM benefits",
    },
    {
      icon: Truck,
      title: isHindi ? "निःशुल्क वाहन पिकअप" : "Free pan-vehicle pickup",
    },
    {
      icon: Zap,
      title: isHindi ? "EV में बदलने की सुविधा" : "Facility to convert to EV",
    },
  ]

  return (
    <section className="relative w-full pt-20 md:pt-24 pb-8 md:pb-12 bg-white overflow-hidden">
      {/* Background Graphic - Desktop servicehero.png artwork */}
      <div
        className="absolute inset-0 z-0 bg-no-repeat bg-right-top bg-cover hidden lg:block pointer-events-none opacity-95"
        style={{ backgroundImage: `url('/servicehero.png')` }}
      />

      {/* Floating Handwritten Badge: Recycle Today for a Cleaner Tomorrow */}
      <motion.div
        initial={{ opacity: 0, rotate: -12, scale: 0.9 }}
        animate={{ opacity: 1, rotate: -8, scale: 1 }}
        transition={{ duration: 0.7, delay: 0.3 }}
        className="font-sans italic font-bold hidden lg:flex flex-col items-start absolute top-28 md:top-32 left-[68%] xl:left-[65%] z-20 select-none pointer-events-none"
      >
        <div className="relative text-left leading-[0.95]">
          <span className="block text-slate-900 text-2xl xl:text-3xl font-bold tracking-tight">
            Recycle Today
          </span>
          <span className="block text-slate-900 text-2xl xl:text-3xl font-bold tracking-tight">
            for a Cleaner
          </span>
          <span className="block text-[#E31E24] text-3xl xl:text-4xl font-extrabold tracking-tight relative mt-0.5">
            Tomorrow
            {/* Red Underline Brush Stroke */}
            <svg
              className="absolute -bottom-1.5 left-0 w-[110%] h-2.5 text-[#E31E24]"
              viewBox="0 0 100 20"
              fill="none"
              preserveAspectRatio="none"
            >
              <path
                d="M 2 10 Q 48 18 98 4"
                stroke="currentColor"
                strokeWidth="4"
                strokeLinecap="round"
              />
            </svg>
            {/* Red Accent Sparks */}
            <svg
              className="absolute -top-2 -right-4 w-4 h-4 text-[#E31E24]"
              viewBox="0 0 20 20"
              fill="none"
            >
              <path d="M4 14L10 4" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
              <path d="M12 16L18 8" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          </span>
        </div>
      </motion.div>

      <div className="container mx-auto px-6 md:px-12 max-w-7xl relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Text & CTA Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-8 xl:col-span-8 max-w-3xl text-left"
          >
            {/* Top Tagline Pill */}
            <div className="inline-flex items-center gap-2 bg-[#FFF0F0] border border-[#FFD6D6] text-[#E31E24] text-xs font-bold px-4 py-1.5 rounded-full shadow-xs mb-4">
              <Leaf className="w-3.5 h-3.5 text-[#E31E24] fill-[#E31E24]" />
              <span>{isHindi ? "वाहन स्क्रैपिंग सेवाएं" : "Vehicle Scrapping Services"}</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-2xl sm:text-3xl md:text-3xl lg:text-[2.1rem] xl:text-[2.4rem] font-black text-slate-900 tracking-tight leading-[1.2] mb-4">
              {isHindi ? (
                <>
                  <span className="block">भारत में वाहन स्क्रैपिंग सेवाएं —</span>
                  <span className="block text-[#E31E24] mt-2 sm:mt-2.5">भारत के सबसे बड़े क्षमता वाले RVSF से</span>
                </>
              ) : (
                <>
                  <span className="block">Vehicle Scrapping Services in India —</span>
                  <span className="block text-[#E31E24] mt-2 sm:mt-2.5">from India’s Largest Capacity RVSF</span>
                </>
              )}
            </h1>

            {/* Paragraph Description */}
            <p className="text-slate-600 text-sm md:text-[15px] font-normal leading-relaxed mb-6 max-w-[640px]">
              {isHindi
                ? "अधिकृत RVSF पर अपने वाहन को कानूनी रूप से स्क्रैप करें और सर्वोत्तम मूल्य, मुफ्त डोरस्टेप पिकअप और परेशानी मुक्त सहायता प्राप्त करें। हमारी वाहन स्क्रैपिंग सेवाएं व्यक्तिगत मालिकों और व्यवसायों के लिए उपलब्ध हैं।"
                : "Scrap your vehicle legally at an authorised RVSF and get the best value, free doorstep pickup and hassle-free support. Our vehicle scrapping services are available for individual owners and businesses."}
            </p>

            {/* Red Checkmark Badges - 2x2 Grid on Mobile, Flex on Tablet/Desktop */}
            <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2 sm:gap-2.5 mb-6 max-w-[650px]">
              {checkBadges.map((badge) => (
                <div
                  key={badge.en}
                  className="
                    flex items-center gap-2
                    bg-[#FFF0F0]/90 border border-[#FFD6D6]
                    px-2.5 py-2 sm:px-3 sm:py-1.5 rounded-xl sm:rounded-full shadow-xs
                    text-[11px] sm:text-xs font-bold text-slate-900 leading-tight
                  "
                >
                  <span className="w-4 h-4 rounded-full bg-[#E31E24] text-white flex items-center justify-center text-[10px] font-black shrink-0">
                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                  </span>
                  <span>{isHindi ? badge.hi : badge.en}</span>
                </div>
              ))}
            </div>

            {/* CTA Buttons - Mobile-Optimized Full-Width Grid & Desktop Inline Flex */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 mb-6 w-full max-w-md sm:max-w-none">
              <Link
                href={isHindi ? "/hi/know-your-valuation" : "/know-your-valuation"}
                className="
                  c-button--gooey flex-1 inline-flex items-center justify-center gap-2.5
                  px-6 py-3.5 sm:px-6 sm:py-3 rounded-xl sm:rounded-full
                  bg-[#E31E24] text-white border-2 border-[#E31E24]
                  text-sm font-extrabold tracking-wide
                  shadow-lg shadow-red-500/25 active:scale-[0.98]
                  transition-all duration-300 relative overflow-hidden cursor-pointer
                "
              >
                <span className="relative z-10 flex items-center gap-2.5">
                  <span>{isHindi ? "मुफ्त मूल्यांकन प्राप्त करें" : "Get Free Valuation"}</span>
                  <ArrowRight className="w-4 h-4 shrink-0" />
                </span>
                <div className="c-button__blobs">
                  <div />
                  <div />
                  <div />
                </div>
              </Link>

              <button
                type="button"
                onClick={() => setShowTeamModal(true)}
                className="
                  flex-1 inline-flex items-center justify-center gap-2.5
                  px-6 py-3.5 sm:px-6 sm:py-3 rounded-xl sm:rounded-full
                  border-2 border-[#E31E24] bg-white hover:bg-red-50/80 dark:bg-slate-900 dark:hover:bg-slate-800
                  text-[#E31E24] font-extrabold text-sm tracking-wide
                  shadow-sm active:scale-[0.98]
                  transition-all duration-200 cursor-pointer
                "
              >
                <span>{isHindi ? "विशेषज्ञ से बात करें" : "Talk to an Expert"}</span>
              </button>
            </div>
          </motion.div>

          {/* Right Column - 3 Floating Feature Pills & Red/Black Hash Accent (From Design Mockup) */}
          <div className="hidden lg:flex lg:col-span-4 flex-col items-end justify-center space-y-3 pr-0 translate-x-2 lg:translate-x-6 xl:translate-x-16 2xl:translate-x-36 z-20 transition-all">
            {/* Top Right Red/Black Hash Accent Lines */}
            <div className="flex gap-1.2 mb-1 mr-2 opacity-90 select-none">
              <span className="w-1.2 h-5 bg-[#E31E24] rounded-full transform rotate-[25deg]" />
              <span className="w-1.2 h-5 bg-[#E31E24] rounded-full transform rotate-[25deg]" />
              <span className="w-1.2 h-5 bg-slate-900 rounded-full transform rotate-[25deg]" />
            </div>

            {/* Pill 1: Eco-Friendly Disposal */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="bg-white/95 backdrop-blur-md border border-slate-100 shadow-[0_8px_20px_rgba(0,0,0,0.07)] rounded-full px-4 py-2 flex items-center gap-2.5 min-w-[170px] transition-transform duration-300 hover:scale-[1.03] cursor-pointer"
            >
              <div className="w-9 h-9 rounded-full bg-[#E31E24] text-white flex items-center justify-center shrink-0 shadow-sm shadow-red-500/20">
                <Leaf className="w-4 h-4 fill-white text-white" />
              </div>
              <div className="text-left leading-tight">
                <span className="block text-slate-900 text-[11px] sm:text-xs font-bold">
                  {isHindi ? "पर्यावरण के अनुकूल" : "Eco-Friendly"}
                </span>
                <span className="block text-slate-900 text-[11px] sm:text-xs font-bold">
                  {isHindi ? "निपटान" : "Disposal"}
                </span>
              </div>
            </motion.div>

            {/* Pill 2: Hassle-Free Process */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="bg-white/95 backdrop-blur-md border border-slate-100 shadow-[0_8px_20px_rgba(0,0,0,0.07)] rounded-full px-4 py-2 flex items-center gap-2.5 min-w-[170px] transition-transform duration-300 hover:scale-[1.03] cursor-pointer"
            >
              <div className="w-9 h-9 rounded-full bg-[#E31E24] text-white flex items-center justify-center shrink-0 shadow-sm shadow-red-500/20">
                <ShieldCheck className="w-4 h-4 text-white" />
              </div>
              <div className="text-left leading-tight">
                <span className="block text-slate-900 text-[11px] sm:text-xs font-bold">
                  {isHindi ? "परेशानी मुक्त" : "Hassle-Free"}
                </span>
                <span className="block text-slate-900 text-[11px] sm:text-xs font-bold">
                  {isHindi ? "प्रक्रिया" : "Process"}
                </span>
              </div>
            </motion.div>

            {/* Pill 3: Best Valuation */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="bg-white/95 backdrop-blur-md border border-slate-100 shadow-[0_8px_20px_rgba(0,0,0,0.07)] rounded-full px-4 py-2 flex items-center gap-2.5 min-w-[170px] transition-transform duration-300 hover:scale-[1.03] cursor-pointer"
            >
              <div className="w-9 h-9 rounded-full bg-[#E31E24] text-white flex items-center justify-center shrink-0 shadow-sm shadow-red-500/20">
                <IndianRupee className="w-4 h-4 text-white" />
              </div>
              <div className="text-left leading-tight">
                <span className="block text-slate-900 text-[11px] sm:text-xs font-bold">
                  {isHindi ? "सर्वोत्तम" : "Best"}
                </span>
                <span className="block text-slate-900 text-[11px] sm:text-xs font-bold">
                  {isHindi ? "मूल्यांकन" : "Valuation"}
                </span>
              </div>
            </motion.div>
          </div>

          {/* Mobile Pills Grid (Image removed for mobile as requested) */}
          <div className="lg:hidden col-span-1 mt-2">
            {/* Mobile Pills Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="bg-white border border-slate-100 shadow-sm rounded-2xl p-3 flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-[#E31E24] text-white flex items-center justify-center shrink-0">
                  <Leaf className="w-4 h-4 fill-white text-white" />
                </div>
                <div className="text-left text-xs font-bold text-slate-900 leading-tight">
                  {isHindi ? "पर्यावरण-अनुकूल निपटान" : "Eco-Friendly Disposal"}
                </div>
              </div>
              <div className="bg-white border border-slate-100 shadow-sm rounded-2xl p-3 flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-[#E31E24] text-white flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-4 h-4 text-white" />
                </div>
                <div className="text-left text-xs font-bold text-slate-900 leading-tight">
                  {isHindi ? "परेशानी मुक्त प्रक्रिया" : "Hassle-Free Process"}
                </div>
              </div>
              <div className="bg-white border border-slate-100 shadow-sm rounded-2xl p-3 flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-[#E31E24] text-white flex items-center justify-center shrink-0">
                  <IndianRupee className="w-4 h-4 text-[#FFFFFF]" />
                </div>
                <div className="text-left text-xs font-bold text-slate-900 leading-tight">
                  {isHindi ? "सर्वोत्तम मूल्यांकन" : "Best Valuation"}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Benefits Bar (5 Feature Cards) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-10 md:mt-14 lg:mt-16 bg-white rounded-2xl sm:rounded-3xl border border-slate-100 shadow-[0_10px_40px_rgba(0,0,0,0.06)] p-4 sm:p-5 md:p-6"
        >
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 md:gap-6">
            {bottomFeatures.map((feat, idx) => {
              const Icon = feat.icon
              return (
                <div
                  key={idx}
                  className="flex flex-col items-center text-center p-3.5 bg-slate-50/60 sm:bg-transparent rounded-xl sm:rounded-none border border-slate-100 sm:border-0 transition-transform duration-200 hover:-translate-y-1"
                >
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#FFF0F0] flex items-center justify-center text-[#E31E24] mb-2.5 shadow-xs border border-red-100">
                    <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <p className="text-xs sm:text-sm font-semibold text-slate-800 leading-snug max-w-[160px]">
                    {feat.title}
                  </p>
                </div>
              )
            })}
          </div>
        </motion.div>
      </div>

      {/* Team Contact Modal (Exact Kanpur Design) */}
      <AnimatePresence>
        {showTeamModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4"
            onClick={() => setShowTeamModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-red-100 text-left relative"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-red-50 text-[#E31E24] flex items-center justify-center font-bold">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-slate-900">
                      {isHindi ? "हमारी टीम से संपर्क करें" : "Talk to Our Team"}
                    </h3>
                    <p className="text-xs text-slate-500 font-medium">Direct dispatch & paperwork support</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowTeamModal(false)}
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center cursor-pointer transition-colors"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-3 mb-6">
                {/* Option 1: Direct Phone */}
                <a
                  href="tel:+919839447733"
                  className="flex items-center justify-between p-3.5 rounded-2xl bg-red-50/60 hover:bg-red-50 border border-red-100 text-slate-900 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#E31E24] text-white flex items-center justify-center shrink-0">
                      <Phone className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Direct Hotline</div>
                      <div className="text-sm font-black text-slate-900">+91-9839447733</div>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-[#E31E24]">Call Now →</span>
                </a>

                {/* Option 2: WhatsApp Chat */}
                <a
                  href="https://wa.me/919839447733?text=Hello%20ScrapCentre,%20I%20have%20a%20vehicle%20to%20scrap."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 hover:bg-red-50/40 border border-slate-200 hover:border-red-200 text-slate-900 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center shrink-0">
                      <MessageCircle className="w-4 h-4 text-[#E31E24]" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">WhatsApp Dispatch</div>
                      <div className="text-sm font-black text-slate-900">Chat with RVSF Specialist</div>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-slate-700">Open Chat →</span>
                </a>

                {/* Option 3: Facility Address */}
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
                  <div className="font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#E31E24]" />
                    <span>Authorised RVSF Location</span>
                  </div>
                  <div className="font-semibold text-slate-800 leading-snug">
                    26-A & B, Block-E, Panki, Kalpi Road, Kanpur - 208020
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowTeamModal(false)}
                className="w-full py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors cursor-pointer"
              >
                Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* SVG Filter for Gooey Button Effect */}
      <svg xmlns="http://www.w3.org/2000/svg" version="1.1" style={{ display: "none" }}>
        <defs>
          <filter id="goo">
            <feGaussianBlur in="SourceGraphic" stdDeviation="10" result="blur" />
            <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -7" result="goo" />
            <feBlend in="SourceGraphic" in2="goo" />
          </filter>
        </defs>
      </svg>
    </section>
  )
}


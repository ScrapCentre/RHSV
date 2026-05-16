"use client"

import { useEffect, useState } from "react"

import { AnimatePresence, motion } from "framer-motion"
import HomexHero from "@/components/HomexHero"
import ServicesSection from "@/components/ServicesSection"
import FeaturesSection from "@/components/FeaturesSection"
import ValuationCTA from "@/components/ValuationCTA"
import ReviewSection from "@/components/ReviewSection"
import GrowWithUs from "@/components/GrowWithUs"
import WelcomePopup from "@/components/WelcomePopup"



export default function Home() {
  const [showLoader, setShowLoader] = useState(true)

  useEffect(() => {
    // Loader animation duration
    const loaderTimeout = setTimeout(() => setShowLoader(false), 1800)

    return () => {
      clearTimeout(loaderTimeout)
    }
  }, [])

  return (
    <div className="bg-background min-h-screen text-foreground">
      <AnimatePresence>
        {showLoader && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeInOut" as const }}
            className="fixed inset-0 bg-white flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6, ease: "backOut" as const }}
              className="text-center"
            >
              <motion.img
                src="/logo.png"
                alt="Logo"
                className="h-32 md:h-56 mx-auto mb-6"
                initial={{ rotate: -180, opacity: 0, scale: 0.5 }}
                animate={{ rotate: 0, opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, ease: "backOut" as const }}
              />
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="text-2xl md:text-4xl font-bold tracking-tight"
              >
                <span className="text-[#E31E24]">Scrap</span>
                <span className="text-black">Centre.com</span>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {!showLoader && (
        <>
          <WelcomePopup />
          <HomexHero />
          <ServicesSection />
          <ValuationCTA />
          <FeaturesSection />
          <GrowWithUs />
          <ReviewSection />
        </>
      )}
    </div>
  )
}


"use client"

import { useEffect, useState } from "react"

import { AnimatePresence, motion } from "framer-motion"
import HomexHero from "@/components/HomexHero"
import ServicesSection from "@/components/ServicesSection"
import FeaturesSection from "@/components/FeaturesSection"
import ValuationCTA from "@/components/ValuationCTA"
import FAQSection from "@/components/FAQSection"
import ReviewSection from "@/components/ReviewSection"
import GrowWithUs from "@/components/GrowWithUs"
import WelcomePopup from "@/components/WelcomePopup"



export default function Home() {
  const [showLoader, setShowLoader] = useState(true)

  useEffect(() => {
    // Loader animation duration
    const loaderTimeout = setTimeout(() => setShowLoader(false), 800)

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
                className="w-32 md:w-48 mx-auto"
                initial={{ rotate: -180, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                transition={{ duration: 0.6, ease: "backOut" as const }}
              />
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
          <ReviewSection />
          <GrowWithUs />
          <FAQSection variant="green" />
        </>
      )}
    </div>
  )
}


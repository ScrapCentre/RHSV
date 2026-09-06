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



const webPageSchema = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  "@id": "https://www.scrapcentre.com/#webpage",
  "url": "https://www.scrapcentre.com/",
  "name": "ScrapCenter India - Vehicle Scrapping Services",
  "description":
    "Official authorized vehicle scrapping center in India. We specialize in environmentally friendly disposal of end-of-life vehicles (ELVs) in compliance with current regulations.",
  "isPartOf": { "@id": "https://www.scrapcentre.com/#website" },
  "about": { "@id": "https://www.scrapcentre.com/#organization" },
  "publisher": { "@id": "https://www.scrapcentre.com/#organization" },
  "inLanguage": "en-IN",
  "primaryImageOfPage": {
    "@type": "ImageObject",
    "url": "https://www.scrapcentre.com/logo.png",
  },
}

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "@id": "https://www.scrapcentre.com/#faq",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "How does the vehicle scrapping process work?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "It's simple! Get a quote, schedule a free pickup, we collect your vehicle, complete the paperwork, and make instant payment.",
      },
    },
    {
      "@type": "Question",
      "name": "How do I get a quote for my vehicle?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "You can get an instant quote by entering your vehicle registration number on our homepage or by calling our support team.",
      },
    },
  ],
}

const serviceSchema = {
  "@context": "https://schema.org",
  "@type": "Service",
  "@id": "https://www.scrapcentre.com/#service",
  "name": "Vehicle Scrapping & Buying Services by ScrapCentre",
  "serviceType":
    "Vehicle scrapping, RVSF certificate of deposit issuance, and new vehicle buying assistance",
  "description":
    "Choose to scrap your old vehicle for the best eco-friendly value, or buy a new vehicle with exclusive OEM benefits and registration discounts.",
  "provider": { "@id": "https://www.scrapcentre.com/#organization" },
  "areaServed": { "@type": "Country", "name": "India" },
  "url": "https://www.scrapcentre.com/",
  "hasOfferCatalog": {
    "@type": "OfferCatalog",
    "name": "ScrapCentre Services",
    "itemListElement": [
      {
        "@type": "Offer",
        "itemOffered": {
          "@type": "Service",
          "name": "Scrap Your Vehicle",
          "description": "Best scrap value with eco-friendly pickup.",
        },
      },
    ],
  },
}

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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
      />
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


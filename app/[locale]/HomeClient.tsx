"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { AnimatePresence, motion } from "framer-motion"
import HomexHero from "@/components/HomexHero"
import ServicesSection from "@/components/ServicesSection"
import FeaturesSection from "@/components/FeaturesSection"
import ValuationCTA from "@/components/ValuationCTA"
import ReviewSection from "@/components/ReviewSection"
import GrowWithUs from "@/components/GrowWithUs"
import WelcomePopup from "@/components/WelcomePopup"
import enMessages from "@/messages/en.json"
import hiMessages from "@/messages/hi.json"

export default function HomeClient() {
  const params = useParams()
  const locale = (params?.locale as string) ?? "en"
  const isHindi = locale === "hi"
  const msg = isHindi ? hiMessages : enMessages

  // ── Schema 3: WebPage ─────────────────────────────────────────────────────
  // url and inLanguage are locale-aware (approved deviation).
  // name/description: English uses exact spec strings; Hindi uses HomePage.meta.
  // All other fields (isPartOf, about, publisher, primaryImageOfPage) are fixed.
  const webPageSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": "https://www.scrapcentre.com/#webpage",
    "url": isHindi
      ? "https://www.scrapcentre.com/hi"
      : "https://www.scrapcentre.com/",
    "name": msg.HomePage.meta.title,
    "description": msg.HomePage.meta.description,
    "isPartOf": { "@id": "https://www.scrapcentre.com/#website" },
    "about": { "@id": "https://www.scrapcentre.com/#organization" },
    "publisher": { "@id": "https://www.scrapcentre.com/#organization" },
    "inLanguage": isHindi ? "hi-IN" : "en-IN",
    "primaryImageOfPage": {
      "@type": "ImageObject",
      "url": "https://www.scrapcentre.com/logo.png",
    },
  }

  // ── Schema 4: FAQPage ─────────────────────────────────────────────────────
  // All 6 questions/answers pulled from messages JSON (approved deviation).
  // @id and schema structure are fixed.
  const faqQuestions = msg.HomePage.faq.questions
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "@id": "https://www.scrapcentre.com/#faq",
    "mainEntity": ([1, 2, 3, 4, 5, 6] as const).map((n) => ({
      "@type": "Question",
      "name": faqQuestions[String(n) as keyof typeof faqQuestions].question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faqQuestions[String(n) as keyof typeof faqQuestions].answer,
      },
    })),
  }

  // ── Schema 5: Service ─────────────────────────────────────────────────────
  // url is locale-aware (approved deviation).
  // name, serviceType stay fixed English (formal labels, no hi.json equivalent).
  // description, offer names/descriptions: no Hindi equivalent in messages —
  // keeping English for both locales per spec rule (ask before inventing text).
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
    "url": isHindi
      ? "https://www.scrapcentre.com/hi"
      : "https://www.scrapcentre.com/",
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
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Buy a New Vehicle",
            "description": "Exchange offers & OEM benefits on your next car.",
          },
        },
      ],
    },
  }

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

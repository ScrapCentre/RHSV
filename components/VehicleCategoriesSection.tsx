"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { useParams } from "next/navigation"
import {
  Car,
  Bike,
  Bus,
  Truck,
  Building2,
  Zap,
  Tractor,
  Plus,
  ArrowRight,
} from "lucide-react"

export default function VehicleCategoriesSection() {
  const params = useParams()
  const isHindi = params?.locale === "hi"

  const whatsappUrl =
    "https://wa.me/919839447733?text=Hi%2C%20I%20have%20a%20vehicle%20category%20query"

  const categories = [
    {
      title: isHindi ? "कार स्क्रैपिंग" : "Car Scrapping",
      description: isHindi ? "सेडान, हैचबैक, SUV — चालू या बंद।" : "Sedans, hatchbacks, SUVs — running or non-running.",
      cta: isHindi ? "मेरी कार स्क्रैप करें" : "Scrap My Car",
      href: "/quote?type=car",
      icon: Car,
    },
    {
      title: isHindi ? "बाइक / टू-व्हीलर" : "Bike / Two-Wheeler",
      description: isHindi ? "किसी भी उम्र की मोटरसाइकिल, स्कूटर, मोपेड।" : "Motorcycles, scooters, mopeds of any age.",
      cta: isHindi ? "मेरी बाइक स्क्रैप करें" : "Scrap My Bike",
      href: "/quote?type=bike",
      icon: Bike,
    },
    {
      title: isHindi ? "बस स्क्रैपिंग" : "Bus Scrapping",
      description: isHindi ? "स्कूल, स्टाफ और संस्थागत बसें।" : "School, staff and institutional buses.",
      cta: isHindi ? "मेरी बस स्क्रैप करें" : "Scrap My Bus",
      href: "/quote?type=bus",
      icon: Bus,
    },
    {
      title: isHindi ? "ट्रक स्क्रैपिंग" : "Truck Scrapping",
      description: isHindi ? "हल्के और भारी वाणिज्यिक ट्रक।" : "Light and heavy commercial trucks.",
      cta: isHindi ? "मेरा ट्रक स्क्रैप करें" : "Scrap My Truck",
      href: "/quote?type=truck",
      icon: Truck,
    },
    {
      title: isHindi ? "ऑटो-रिक्शा" : "Auto-Rickshaw",
      description: isHindi ? "यात्री और कार्गो थ्री-व्हीलर।" : "Passenger and cargo three-wheelers.",
      cta: isHindi ? "मेरा ऑटो स्क्रैप करें" : "Scrap My Auto",
      href: "/quote?type=auto",
      icon: Car,
    },
    {
      title: isHindi ? "वाणिज्यिक फ्लीट" : "Commercial Fleet",
      description: isHindi ? "व्यापारियों और डीलरशिप के लिए थोक स्क्रैपिंग।" : "Bulk scrapping for businesses & dealerships.",
      cta: isHindi ? "फ्लीट पेज देखें" : "See Fleet Page",
      href: "/quote?type=fleet",
      icon: Building2,
    },
    {
      title: isHindi ? "इलेक्ट्रिक वाहन" : "Electric Vehicles",
      description: isHindi ? "EV कारें और टू-व्हीलर, सुरक्षित बैटरी रीसाइक्लिंग।" : "EV cars & two-wheelers, battery-safe recycling.",
      cta: isHindi ? "मेरा EV स्क्रैप करें" : "Scrap My EV",
      href: "/quote?type=ev",
      icon: Zap,
    },
    {
      title: isHindi ? "औद्योगिक / कृषि" : "Industrial / Agri",
      description: isHindi ? "ट्रैक्टर, लोडर, कृषि और साइट मशीनरी।" : "Tractors, loaders, farm & site machinery.",
      cta: isHindi ? "वाहन स्क्रैप करें" : "Scrap My Vehicle",
      href: "/quote?type=agri",
      icon: Tractor,
    },
    {
      title: isHindi ? "अन्य वाहन" : "Others",
      description: isHindi ? "सूचीबद्ध नहीं है? हम फिर भी स्वीकार करते हैं — पूछें।" : "Not listed? We still take it — ask our team.",
      cta: isHindi ? "हमसे बात करें" : "Talk to Us",
      href: whatsappUrl,
      isExternal: true,
      icon: Plus,
    },
  ]

  // Staggered Scroll Animation Variants
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
    hidden: {
      opacity: 0,
      y: 40,
      scale: 0.94,
      filter: "blur(4px)",
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      filter: "blur(0px)",
      transition: {
        duration: 0.5,
        ease: [0.22, 1, 0.36, 1] as const,
      },
    },
  }

  const headerVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" as const },
    },
  }

  return (
    <section className="relative py-12 sm:py-16 bg-white text-black overflow-hidden">
      {/* Background Red Ambient Accents */}
      <div className="absolute top-1/3 -left-16 w-64 h-64 bg-[#E31E24]/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 -right-16 w-72 h-72 bg-[#E31E24]/5 rounded-full blur-3xl pointer-events-none" />

      {/* Grid line background overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#00000008_1px,transparent_1px),linear-gradient(to_bottom,#00000008_1px,transparent_1px)] bg-[size:3rem_3rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl relative z-10">
        {/* Animated Top Header */}
        <motion.div
          variants={headerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false, amount: 0.3 }}
          className="mb-8 sm:mb-10 text-left"
        >
          {/* Category Tag */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded bg-black text-white text-[10px] font-black uppercase tracking-[0.2em] mb-2 border border-black shadow-sm"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#E31E24] animate-pulse" />
            {isHindi ? "कवरेज" : "COVERAGE"}
          </motion.div>

          {/* Title */}
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-black tracking-tight leading-tight">
            {isHindi ? (
              <>
                एक RVSF। <span className="text-[#E31E24]">प्रत्येक वाहन श्रेणी।</span>
              </>
            ) : (
              <>
                One RVSF. <span className="text-[#E31E24]">Every vehicle category.</span>
              </>
            )}
          </h2>
        </motion.div>

        {/* Compact 3x3 Animated Cards Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false, amount: 0.15 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5"
        >
          {categories.map((item, idx) => {
            const Icon = item.icon
            return (
              <motion.div
                key={idx}
                variants={cardVariants}
                whileHover={{ y: -6, scale: 1.02 }}
                transition={{ type: "spring", stiffness: 350, damping: 25 }}
                className="group relative bg-white border border-black/10 hover:border-[#E31E24] rounded-xl p-4 sm:p-5 flex flex-col justify-between shadow-xs hover:shadow-[0_12px_28px_-8px_rgba(227,30,36,0.22)] transition-all duration-300"
              >
                {/* Red Top Accent Line on Hover */}
                <div className="absolute top-0 left-4 right-4 h-[2.5px] bg-[#E31E24] scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left rounded-full" />

                <div>
                  {/* Compact Icon Container */}
                  <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-lg bg-black text-white flex items-center justify-center mb-3.5 group-hover:bg-[#E31E24] group-hover:rotate-6 transition-all duration-300 shadow-sm">
                    <Icon size={20} strokeWidth={2.2} className="transition-transform group-hover:scale-110" />
                  </div>

                  {/* Title */}
                  <h3 className="text-base sm:text-lg font-black text-black group-hover:text-[#E31E24] transition-colors mb-1 tracking-tight">
                    {item.title}
                  </h3>

                  {/* Subtext */}
                  <p className="text-black/75 text-xs sm:text-sm font-medium leading-normal mb-4">
                    {item.description}
                  </p>
                </div>

                {/* Compact CTA Link */}
                <div className="pt-3 border-t border-black/5 group-hover:border-[#E31E24]/20 transition-colors">
                  {item.isExternal ? (
                    <a
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-black font-extrabold text-xs sm:text-sm group-hover:text-[#E31E24] transition-colors"
                    >
                      <span>{item.cta}</span>
                      <ArrowRight size={14} className="text-[#E31E24] group-hover:translate-x-1.5 transition-transform duration-300" />
                    </a>
                  ) : (
                    <Link
                      href={item.href}
                      className="inline-flex items-center gap-1.5 text-black font-extrabold text-xs sm:text-sm group-hover:text-[#E31E24] transition-colors"
                    >
                      <span>{item.cta}</span>
                      <ArrowRight size={14} className="text-[#E31E24] group-hover:translate-x-1.5 transition-transform duration-300" />
                    </Link>
                  )}
                </div>
              </motion.div>
            )
          })}
        </motion.div>
      </div>
    </section>
  )
}

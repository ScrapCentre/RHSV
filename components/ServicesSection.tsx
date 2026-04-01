"use client"
import { motion, useInView } from "framer-motion"
import { useRef } from "react"
import { useRouter } from "next/navigation"
import ServicesCard from "./ServicesCard"

export default function ServicesSection() {
  const router = useRouter()
  const containerRef = useRef<HTMLDivElement>(null)
  const isInView = useInView(containerRef, { once: false, amount: 0.1 })

  const services = [
    {
      id: 1,
      title: "Sell Old Vehicle",
      description: "Get the best scrap value for your end-of-life vehicle instantly.",
      image: "/frontpage/selloldvehicle.jpg",
    },
    {
      id: 2,
      title: "Exchange Vehicle",
      description: "Scrap your old vehicle and get amazing benefits on a new purchase.",
      image: "/frontpage/exchangevehical.jpg",
    },
    {
      id: 3,
      title: "Buy New Vehicle",
      description: "Purchase a brand new vehicle with exclusive facility benefits.",
      image: "/frontpage/buynewvehicle.jpg",
    },
  ]

  const handleCardClick = (id: number) => {
    if (id === 1) router.push("/services/sell-vehicle")
    if (id === 2) router.push("/services/exchange-vehicle")
    if (id === 3) router.push("/services/buy-vehicle")
  }

  return (
    <section id="services" className="bg-[#162236] py-8 md:py-12 relative overflow-hidden" ref={containerRef}>
      {/* Background decorative elements - Green/Navy Theme */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-900/5 rounded-full blur-3xl translate-x-1/3 translate-y-1/3"></div>

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <motion.h2
            className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4"
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.6 }}
          >
            Explore <span className="bg-gradient-to-r from-emerald-600 to-teal-800 bg-clip-text text-transparent">Services</span>
          </motion.h2>
          <motion.p
            className="text-slate-300 text-lg md:text-xl max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Choose the perfect service option for your needs
          </motion.p>
        </div>

        {/* Services Grid - 3 Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {services.map((service, index) => (
            <ServicesCard
              key={service.id}
              title={service.title}
              description={service.description}
              image={service.image}
              onClick={() => handleCardClick(service.id)}
              delay={index * 0.2}
            />
          ))}
        </div>
      </div>
    </section>
  )
}


"use client"

import Navbar from "@/components/Navbar"
import BuyNewVehicleForm from "@/components/BuyNewVehicleForm"
import { motion } from "framer-motion"
import Image from "next/image"
import AuthGuard from "@/components/AuthGuard"
import { Car, CheckCircle, CreditCard, Shield } from "lucide-react"

export default function BuyVehiclePage() {
  const benefits = [
    {
      icon: Car,
      title: "Wide Selection",
      description: "Explore a massive inventory of quality-checked vehicles",
    },
    {
      icon: CheckCircle,
      title: "Quality Assured",
      description: "Every vehicle undergoes a rigorous 150-point inspection",
    },
    {
      icon: CreditCard,
      title: "Easy Financing",
      description: "Flexible EMI options and instant loan approvals",
    },
    {
      icon: Shield,
      title: "Transparent Pricing",
      description: "No hidden charges, what you see is what you pay",
    },
  ]

  return (
    <div className="bg-gray-50 min-h-screen text-gray-900 selection:bg-emerald-500/30">
      <AuthGuard />
      <Navbar />

      {/* Hero Section */}
      <section className="pt-44 pb-8 px-4">
        <div className="container mx-auto max-w-7xl relative rounded-[2rem] overflow-hidden min-h-[400px] flex items-center justify-center shadow-xl">
          {/* Background Image */}
          <div className="absolute inset-0 z-0">
            <Image
              src="/getvaluation/headingbg.jpg"
              alt="Buy Vehicle Background"
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-b from-gray-900/40 via-[#0E192D]/70 to-gray-900/70 mix-blend-multiply"></div>
          </div>

          <div className="relative z-10 text-center max-w-4xl mx-auto px-4 py-12">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 text-white text-xs font-semibold mb-6 backdrop-blur-md shadow-lg"
              >
                <Car className="w-4 h-4 text-emerald-400" />
                <span>Premium Certified Vehicles</span>
              </motion.div>

              <h1 className="text-5xl md:text-7xl font-bold mb-8 text-white leading-[1.1] drop-shadow-sm">
                Buy Your <span className="text-emerald-400">Next Vehicle</span>
              </h1>

              <p className="text-xl md:text-2xl text-gray-100 max-w-2xl mx-auto leading-relaxed drop-shadow-sm font-medium">
                Explore our collection of quality vehicles with best prices and flexible financing options.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Split Layout Section */}
      <section className="py-20 px-4 relative">
        <div className="container mx-auto max-w-7xl">
          <div className="grid lg:grid-cols-2 gap-16 items-start">
            {/* Benefits Left Side */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="space-y-10"
            >
              <div className="space-y-4">
                <h2 className="text-4xl font-bold text-[#0E192D] tracking-tight">Why Choose Our <span className="text-emerald-600">Service?</span></h2>
                <div className="w-20 h-1 bg-gradient-to-r from-[#0E192D] to-emerald-600 rounded-full"></div>
                <p className="text-emerald-800 text-lg leading-relaxed font-medium">Experience a seamless buying journey with complete transparency and top-tier support.</p>
              </div>

              <div className="grid sm:grid-cols-1 gap-6">
                {benefits.map((benefit, index) => {
                  const Icon = benefit.icon
                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1, duration: 0.5 }}
                      viewport={{ once: true }}
                      className="group relative"
                    >
                      <div className="absolute inset-0 bg-white rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-300"></div>
                      <div className="relative flex gap-6 p-8 rounded-2xl border border-gray-700/30 bg-[#0E192D] shadow-lg group-hover:shadow-xl group-hover:border-transparent transition-all duration-300">
                        <div className="w-14 h-14 bg-white/10 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-emerald-50 group-hover:scale-110 transition-all duration-300">
                          <Icon className="w-7 h-7 text-emerald-400 group-hover:text-emerald-600" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold text-white text-xl mb-2 group-hover:text-emerald-700 transition-colors">{benefit.title}</h3>
                          <p className="text-gray-300 font-medium leading-relaxed group-hover:text-emerald-600 transition-colors">{benefit.description}</p>
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </motion.div>

            {/* Form Right Side */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="relative group lg:sticky lg:top-32"
            >
              <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-[2rem] blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
              <div className="relative bg-white border border-gray-200 rounded-[2rem] p-8 lg:p-12 shadow-2xl overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 blur-3xl pointer-events-none"></div>
                <div className="relative z-10 w-full max-w-full">
                  <div className="mb-8 text-center lg:text-left">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Buying Preferences</h3>
                    <p className="text-gray-500 text-sm">Tell us what you are looking for</p>
                  </div>
                  <BuyNewVehicleForm onClose={() => { }} />
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  )
}


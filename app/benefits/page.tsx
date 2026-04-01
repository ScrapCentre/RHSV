"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import BenefitsForm from "@/components/BenefitsForm"
import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"
import { CheckCircle, DollarSign, Clock, Shield } from "lucide-react"

export default function BenefitsPage() {
  const [showForm, setShowForm] = useState(false)

  const benefits = [
    {
      icon: DollarSign,
      title: "Best Price Guarantee",
      description: "Get the most competitive valuation for your vehicle based on market rates",
    },
    {
      icon: Clock,
      title: "Quick Process",
      description: "Complete your vehicle sale in just a few simple steps within 24-48 hours",
    },
    {
      icon: Shield,
      title: "Secure Transaction",
      description: "100% secure and transparent process with verified documentation",
    },
    {
      icon: CheckCircle,
      title: "Hassle-Free Pickup",
      description: "Free vehicle pickup from your location at your convenience",
    },
  ]

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  }

  if (showForm) {
    return (
      <div className="bg-black min-h-screen text-white">
        <Navbar />
        <BenefitsForm onBack={() => setShowForm(false)} />
        <Footer />
      </div>
    )
  }

  return (
    <div className="bg-black min-h-screen text-white">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-green-500/10 via-transparent to-transparent pointer-events-none"></div>

        <div className="container mx-auto max-w-4xl relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h1 className="text-5xl md:text-6xl font-bold mb-6 text-balance">
              Explore <span className="text-green-400">Benefits</span> of Selling Your Vehicle
            </h1>
            <p className="text-xl text-gray-400 mb-8 text-balance">
              Join thousands of satisfied customers who have sold their vehicles with EcoScrap India
            </p>
          </motion.div>
        </div>
      </section>

      {/* Benefits Grid */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-5xl">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            className="grid md:grid-cols-2 gap-8 mb-16"
          >
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon
              return (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  className="p-8 rounded-xl border border-green-500/30 bg-gradient-to-br from-gray-900/50 to-gray-800/50 hover:border-green-500/60 transition-all duration-300"
                >
                  <motion.div
                    className="w-14 h-14 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center mb-6"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                  >
                    <Icon className="w-7 h-7 text-white" />
                  </motion.div>
                  <h3 className="text-2xl font-bold mb-3">{benefit.title}</h3>
                  <p className="text-gray-400">{benefit.description}</p>
                </motion.div>
              )
            })}
          </motion.div>

          {/* Key Features */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-2xl p-8 md:p-12 mb-12"
          >
            <h2 className="text-3xl font-bold mb-8 text-center">Why Choose EcoScrap India?</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <p className="text-4xl font-bold text-green-400 mb-2">10000+</p>
                <p className="text-gray-300">Happy Customers</p>
              </div>
              <div className="text-center">
                <p className="text-4xl font-bold text-green-400 mb-2">₹500+ Cr</p>
                <p className="text-gray-300">Total Payouts</p>
              </div>
              <div className="text-center">
                <p className="text-4xl font-bold text-green-400 mb-2">24/7</p>
                <p className="text-gray-300">Customer Support</p>
              </div>
            </div>
          </motion.div>

          {/* Process Steps */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-12"
          >
            <h2 className="text-3xl font-bold mb-8 text-center">Simple 4-Step Process</h2>
            <div className="grid md:grid-cols-4 gap-4">
              {[
                { step: 1, title: "Enter Details", desc: "Provide vehicle information" },
                { step: 2, title: "Get Valuation", desc: "Instant quote for your vehicle" },
                { step: 3, title: "Complete eKYC", desc: "Quick verification process" },
                { step: 4, title: "Get Paid", desc: "Receive payment in your account" },
              ].map((item, index) => (
                <motion.div
                  key={index}
                  className="relative text-center"
                  whileHover={{ y: -5 }}
                >
                  <div className="p-4 rounded-lg bg-gradient-to-br from-green-500/20 to-emerald-600/10 border border-green-500/30">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 flex items-center justify-center font-bold text-lg mx-auto mb-3">
                      {item.step}
                    </div>
                    <h3 className="font-bold mb-1">{item.title}</h3>
                    <p className="text-sm text-gray-400">{item.desc}</p>
                  </div>
                  {index < 3 && (
                    <div className="hidden md:block absolute top-6 -right-2 w-4 h-0.5 bg-gradient-to-r from-green-500 to-transparent"></div>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* CTA Button */}
          <motion.div
            className="text-center"
            whileInView={{ scale: 1 }}
            initial={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <motion.button
              onClick={() => setShowForm(true)}
              className="px-8 py-4 rounded-lg font-bold text-lg bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white transition-all shadow-lg shadow-green-500/25"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Start Your Assessment
            </motion.button>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  )
}


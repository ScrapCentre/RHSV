"use client"

import { motion } from "framer-motion"
import { Award, TrendingUp, Leaf, FileCheck, X } from "lucide-react"
import { useState } from "react"
import EKYCForm from "./eKYCForm"

interface FormData {
  vehicleType: string
  brand: string
  customBrand: string
  model: string
  customModel: string
  year: string
  vehicleNumber: string
  vehicleWeight: string
  name: string
  phone: string
  pincode: string
  agreeTC: boolean
}

const valuationBenefits = [
  {
    icon: Award,
    title: "Certificate of Deposit",
    description: "Secure and reliable investment options with guaranteed returns",
  },
  {
    icon: TrendingUp,
    title: "25% Rebate Tax",
    description: "Enjoy significant tax savings with our exclusive rebate scheme",
  },
  {
    icon: Leaf,
    title: "Registration Tax Waiver",
    description: "Complete exemption from registration taxes on qualifying purchases",
  },
]

export default function ValuationPage({ formData, onClose }: { formData: FormData; onClose: () => void }) {
  const [showEKYC, setShowEKYC] = useState(false)

  // Calculate valuation based on vehicle weight
  const calculateValuation = () => {
    const weight = parseFloat(formData.vehicleWeight) || 0
    const baseValue = 50000 // Base value in INR
    const pricePerTon = 150000 // Price per ton
    return Math.round(baseValue + weight * pricePerTon)
  }

  const valuation = calculateValuation()
  const brandName = formData.brand || formData.customBrand

  if (showEKYC) {
    return <EKYCForm formData={formData} onBack={() => setShowEKYC(false)} valuation={valuation} />
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto"
    >
      <motion.div
        initial={{ scale: 0.8, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full border border-orange-200 my-8"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors z-10"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="p-8 md:p-12">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Congratulations!</h2>
            <p className="text-gray-600 text-lg">
              Dear <span className="text-orange-500 font-semibold">{formData.name}</span>, your{" "}
              <span className="text-orange-500 font-semibold">{formData.vehicleNumber}</span> has an overall valuation of
            </p>
          </motion.div>

          {/* Valuation Amount */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.4, type: "spring", stiffness: 100 }}
            className="text-center mb-12"
          >
            <div className="inline-block bg-gradient-to-r from-orange-500/10 to-orange-600/10 border border-orange-200 rounded-2xl px-8 py-6">
              <p className="text-gray-500 text-sm uppercase tracking-widest mb-2">Estimated Valuation</p>
              <p className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent">
                ₹{valuation.toLocaleString("en-IN")}
              </p>
              <p className="text-gray-500 text-sm mt-2">For your {brandName} {formData.model}</p>
            </div>
          </motion.div>

          {/* Benefits Grid */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
          >
            {valuationBenefits.map((benefit, index) => {
              const IconComponent = benefit.icon
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 + index * 0.1 }}
                  className="bg-white border border-orange-200 rounded-xl p-6 hover:border-orange-400 transition-all duration-300 group shadow-sm"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-500/10 to-orange-600/20 rounded-lg flex items-center justify-center mb-4 group-hover:from-orange-500/20 group-hover:to-orange-600/30 transition-all">
                    <IconComponent className="w-6 h-6 text-orange-500" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{benefit.title}</h3>
                  <p className="text-gray-600 text-sm">{benefit.description}</p>
                </motion.div>
              )
            })}
          </motion.div>

          {/* CTA Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
            className="flex justify-center"
          >
            <motion.button
              onClick={() => setShowEKYC(true)}
              className="relative px-8 py-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold text-lg rounded-lg shadow-lg overflow-hidden group"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {/* Animated background */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-orange-600 to-orange-700 opacity-0 group-hover:opacity-100 transition-opacity"
                initial={false}
              />

              {/* Button text with pulsing animation */}
              <motion.span
                className="relative z-10 flex items-center justify-center"
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY }}
              >
                🚀 Final Step eKYC
              </motion.span>

              {/* Highlight effect - rings expanding */}
              <motion.div
                className="absolute inset-0 border-2 border-orange-400 rounded-lg"
                animate={{
                  scale: [1, 1.1, 1.2],
                  opacity: [1, 0.5, 0],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Number.POSITIVE_INFINITY,
                }}
              />
            </motion.button>
          </motion.div>

          {/* Additional Info */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            className="text-center text-gray-500 text-sm mt-8"
          >
            Complete eKYC to proceed with the valuation and claim your vehicle benefits
          </motion.p>
        </div>
      </motion.div>
    </motion.div>
  )
}


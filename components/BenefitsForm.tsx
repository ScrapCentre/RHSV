"use client"

import React, { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowRight, AlertCircle } from "lucide-react"
import EKYCForm from "@/components/eKYCForm"

interface BenefitsFormData {
  registrationNumber: string
  vehicleBrand: string
  vehicleModel: string
  registrationYear: string
  fuelType: string
  hasPendingLoan: string
  loanDetails: string
  isCarAccidental: string
}

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

export default function BenefitsForm({ onBack }: { onBack: () => void }) {
  const [formData, setFormData] = useState<BenefitsFormData>({
    registrationNumber: "",
    vehicleBrand: "",
    vehicleModel: "",
    registrationYear: "",
    fuelType: "petrol",
    hasPendingLoan: "no",
    loanDetails: "",
    isCarAccidental: "no",
  })

  const [showEKYC, setShowEKYC] = useState(false)
  const [formError, setFormError] = useState("")

  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 30 }, (_, i) => currentYear - i)

  const calculateValuation = (): number => {
    const basePrice = 500000 // Base price
    const yearFactor = (currentYear - parseInt(formData.registrationYear)) * 15000 // Depreciation
    const fuelBonus = formData.fuelType === "electric" ? 50000 : 0
    const accidentalDeduction = formData.isCarAccidental === "yes" ? 100000 : 0

    return Math.max(100000, basePrice - yearFactor + fuelBonus - accidentalDeduction)
  }

  const validateForm = () => {
    if (!formData.registrationNumber.trim()) {
      setFormError("Registration number is required")
      return false
    }
    if (!formData.vehicleBrand.trim()) {
      setFormError("Vehicle brand is required")
      return false
    }
    if (!formData.vehicleModel.trim()) {
      setFormError("Vehicle model is required")
      return false
    }
    if (!formData.registrationYear) {
      setFormError("Registration year is required")
      return false
    }
    if (formData.hasPendingLoan === "yes" && !formData.loanDetails.trim()) {
      setFormError("Loan details are required")
      return false
    }
    setFormError("")
    return true
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validateForm()) {
      setShowEKYC(true)
    }
  }

  if (showEKYC) {
    const eKYCFormData: FormData = {
      vehicleType: "car",
      brand: formData.vehicleBrand,
      customBrand: "",
      model: formData.vehicleModel,
      customModel: "",
      year: formData.registrationYear,
      vehicleNumber: formData.registrationNumber,
      vehicleWeight: "0",
      name: "",
      phone: "",
      pincode: "",
      agreeTC: false,
    }

    return (
      <EKYCForm
        formData={eKYCFormData}
        onBack={() => setShowEKYC(false)}
        valuation={calculateValuation()}
      />
    )
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
        className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full border border-green-500/30 my-8"
      >
        {/* Header */}
        <div className="sticky top-0 flex items-center justify-between p-6 bg-gradient-to-r from-gray-900 to-gray-800 border-b border-green-500/20 z-10 rounded-t-2xl">
          <h2 className="text-2xl font-bold text-white">Vehicle Benefits Assessment</h2>
          <button
            onClick={onBack}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form Content */}
        <div className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Error Message */}
            {formError && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-start gap-3 p-4 bg-red-500/10 border border-red-500/30 rounded-lg"
              >
                <AlertCircle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
                <p className="text-red-300 text-sm">{formError}</p>
              </motion.div>
            )}

            {/* Vehicle Registration Number */}
            <div>
              <label className="text-sm font-bold text-green-400 mb-2 block uppercase tracking-wider">
                Vehicle Registration Number*
              </label>
              <input
                type="text"
                value={formData.registrationNumber}
                onChange={(e) => setFormData({ ...formData, registrationNumber: e.target.value.toUpperCase() })}
                placeholder="e.g., DL 01 AB 1234"
                className="w-full px-4 py-3 rounded-lg bg-gray-700/50 border border-gray-600 text-white placeholder-gray-500 focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-all"
              />
            </div>

            {/* Vehicle Brand */}
            <div>
              <label className="text-sm font-bold text-green-400 mb-2 block uppercase tracking-wider">Vehicle Brand*</label>
              <input
                type="text"
                value={formData.vehicleBrand}
                onChange={(e) => setFormData({ ...formData, vehicleBrand: e.target.value })}
                placeholder="e.g., Hyundai, Maruti, Tata"
                className="w-full px-4 py-3 rounded-lg bg-gray-700/50 border border-gray-600 text-white placeholder-gray-500 focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-all"
              />
            </div>

            {/* Vehicle Model */}
            <div>
              <label className="text-sm font-bold text-green-400 mb-2 block uppercase tracking-wider">Vehicle Model*</label>
              <input
                type="text"
                value={formData.vehicleModel}
                onChange={(e) => setFormData({ ...formData, vehicleModel: e.target.value })}
                placeholder="e.g., Creta, Swift, Nexon"
                className="w-full px-4 py-3 rounded-lg bg-gray-700/50 border border-gray-600 text-white placeholder-gray-500 focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-all"
              />
            </div>

            {/* Registration Year */}
            <div>
              <label className="text-sm font-bold text-green-400 mb-2 block uppercase tracking-wider">Registration Year*</label>
              <select
                value={formData.registrationYear}
                onChange={(e) => setFormData({ ...formData, registrationYear: e.target.value })}
                className="w-full px-4 py-3 rounded-lg bg-gray-700/50 border border-gray-600 text-white focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-all"
              >
                <option value="">Select Year</option>
                {years.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>

            {/* Fuel Type */}
            <div>
              <label className="text-sm font-bold text-green-400 mb-2 block uppercase tracking-wider">Fuel Type*</label>
              <div className="flex gap-4 flex-wrap">
                {["petrol", "diesel", "cng", "electric"].map((type) => (
                  <label key={type} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="fuelType"
                      value={type}
                      checked={formData.fuelType === type}
                      onChange={(e) => setFormData({ ...formData, fuelType: e.target.value })}
                      className="w-4 h-4 rounded-full bg-gray-700 border border-gray-600 text-green-500 focus:ring-2 focus:ring-green-500"
                    />
                    <span className="text-gray-300 capitalize">{type}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Pending Loan */}
            <div>
              <label className="text-sm font-bold text-green-400 mb-2 block uppercase tracking-wider">
                Is There Any Pending Loan?*
              </label>
              <div className="flex gap-4">
                {["no", "yes"].map((option) => (
                  <label key={option} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="hasPendingLoan"
                      value={option}
                      checked={formData.hasPendingLoan === option}
                      onChange={(e) => setFormData({ ...formData, hasPendingLoan: e.target.value })}
                      className="w-4 h-4 rounded-full bg-gray-700 border border-gray-600 text-green-500 focus:ring-2 focus:ring-green-500"
                    />
                    <span className="text-gray-300 capitalize">{option}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Loan Details - Conditional */}
            <AnimatePresence>
              {formData.hasPendingLoan === "yes" && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div>
                    <label className="text-sm font-bold text-green-400 mb-2 block uppercase tracking-wider">
                      Loan Details*
                    </label>
                    <textarea
                      value={formData.loanDetails}
                      onChange={(e) => setFormData({ ...formData, loanDetails: e.target.value })}
                      placeholder="Please provide loan details (bank name, outstanding amount, etc.)"
                      rows={3}
                      className="w-full px-4 py-3 rounded-lg bg-gray-700/50 border border-gray-600 text-white placeholder-gray-500 focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-all resize-none"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Car Accidental History */}
            <div>
              <label className="text-sm font-bold text-green-400 mb-2 block uppercase tracking-wider">
                Has the Car Met with Any Accident?*
              </label>
              <div className="flex gap-4">
                {["no", "yes"].map((option) => (
                  <label key={option} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="isCarAccidental"
                      value={option}
                      checked={formData.isCarAccidental === option}
                      onChange={(e) => setFormData({ ...formData, isCarAccidental: e.target.value })}
                      className="w-4 h-4 rounded-full bg-gray-700 border border-gray-600 text-green-500 focus:ring-2 focus:ring-green-500"
                    />
                    <span className="text-gray-300 capitalize">{option}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Estimated Valuation Display */}
            <motion.div
              className="p-4 bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-lg"
              animate={{ boxShadow: ["0 0 0 0 rgba(74, 222, 128, 0.1)", "0 0 20px 0 rgba(74, 222, 128, 0.1)"] }}
              transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
            >
              <p className="text-green-400 text-sm font-semibold mb-1">Estimated Vehicle Valuation</p>
              <p className="text-white text-3xl font-bold">₹{calculateValuation().toLocaleString("en-IN")}</p>
              <p className="text-gray-400 text-xs mt-2">
                *Valuation is indicative and may change based on vehicle condition assessment
              </p>
            </motion.div>

            {/* Submit Button */}
            <motion.button
              type="submit"
              className="w-full py-4 rounded-lg font-bold text-lg bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white transition-all flex items-center justify-center gap-2"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Continue to eKYC <ArrowRight className="w-5 h-5" />
            </motion.button>
          </form>
        </div>
      </motion.div>
    </motion.div>
  )
}


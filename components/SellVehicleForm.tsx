"use client"

import React from "react"
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { CheckCircle, Zap, Leaf, Car, FileText, Phone, MapPin, User } from "lucide-react"

import { useRouter } from "next/navigation"
import { indiaData, states } from "@/lib/india-data"
import { useToast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"

interface SellVehicleFormProps {
  onClose: () => void
}

interface FormData {
  registrationNumber: string
  brand: string
  customBrand: string
  model: string
  customModel: string
  registrationYear: string
  fuelType: string
  pendingLoan: string
  loanAmount?: string
  loanBank?: string
  name?: string
  phone?: string
  state?: string
  city?: string
  customCity?: string
  pincode?: string
  insuranceName?: string
}

export default function SellVehicleForm({ onClose }: SellVehicleFormProps) {
  const router = useRouter()
  const [formData, setFormData] = useState<FormData>({
    registrationNumber: "",
    brand: "",
    customBrand: "",
    model: "",
    customModel: "",
    registrationYear: "",
    fuelType: "",
    pendingLoan: "no",
    loanAmount: "",
    loanBank: "",
    name: "",
    phone: "",
    state: "",
    city: "",
    customCity: "",
    pincode: "",
    insuranceName: "",
  })
  const [showSuccess, setShowSuccess] = useState(false)

  const [showIntermediateModal, setShowIntermediateModal] = useState(false)
  const [valuation, setValuation] = useState(0)
  const [valuationId, setValuationId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const benefits = [
    {
      icon: Zap,
      title: "Fair and Transparent Valuation",
      description: "Get accurate market-based pricing for your vehicle with complete transparency",
    },
    {
      icon: CheckCircle,
      title: "Paperwork & Pickup Handled",
      description: "We handle all documentation and provide free vehicle pickup at your convenience",
    },
    {
      icon: Leaf,
      title: "Full Legal Compliance",
      description: "Eco-friendly benefits and CD certificate provided for responsible vehicle disposal",
    },
  ]

  const fuelTypes = ["Petrol", "Diesel", "CNG", "LPG", "Electric", "Hybrid"]
  const years = Array.from({ length: 30 }, (_, i) => new Date().getFullYear() - i)
  const brands = ["Maruti Suzuki", "Hyundai", "Tata", "Honda", "Toyota", "Mahindra", "Kia", "Skoda", "Nissan", "BMW", "Audi"]
  const models = ["Sedan", "SUV", "Hatchback", "MUV", "Coupe", "Convertible", "Wagon"]

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const brandValue = formData.brand === "other" ? formData.customBrand : formData.brand
    const modelValue = formData.model === "other" ? formData.customModel : formData.model

    const requiredFields = [
      formData.registrationNumber,
      brandValue,
      modelValue,
      formData.registrationYear,
      formData.fuelType,
      formData.pendingLoan,
      formData.state,
      formData.city === "other" ? formData.customCity : formData.city,
      formData.pincode,
      formData.name,
      formData.phone,
    ]

    if (formData.pendingLoan === "yes" && (!formData.loanAmount || !formData.loanBank)) {
      toast({
        variant: "destructive",
        title: "Missing Details",
        description: "Please fill in loan details",
      })
      return
    }

    if (requiredFields.every((field) => field !== "")) {
      // Calculate random valuation
      const randomValuation = Math.floor(Math.random() * (500000 - 50000) + 50000)
      setValuation(randomValuation)
      setLoading(true)

      // Submit to API
      fetch("/api/sell-vehicle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })
        .then(async (res) => {
          if (res.ok) {
            const responseData = await res.json()
            if (responseData.data && responseData.data._id) {
              setValuationId(responseData.data._id)
            }
            setShowIntermediateModal(true)
          } else {
            res.json().then(data => {
              toast({
                variant: "destructive",
                title: "Submission Failed",
                description: data.message || "Failed to submit request",
              })
            })
          }
        })
        .catch((err) => {
          console.error(err)
          toast({
            variant: "destructive",
            title: "Error",
            description: "Something went wrong. Please try again.",
          })
        })
        .finally(() => {
          setLoading(false)
        })
    } else {
      toast({
        variant: "destructive",
        title: "Incomplete Form",
        description: "Please fill in all required fields.",
      })
    }
  }

  return (
    <div className="grid grid-cols-1 items-start">
      {/* Form Section - Full Width */}
      <motion.div
        initial={{ opacity: 0, x: 30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        className="relative"
      >
        <form onSubmit={handleSubmit} className="space-y-5">

          <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-100 mb-6">
            <h3 className="text-lg font-bold text-[#0E192D] flex items-center gap-2 mb-4">
              <Car className="w-5 h-5 text-emerald-600" />
              Vehicle Details
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Registration Number */}
              <div>
                <label className="text-xs font-bold text-[#0E192D]/70 mb-1.5 block uppercase tracking-wider">Registration Number*</label>
                <input
                  type="text"
                  name="registrationNumber"
                  value={formData.registrationNumber}
                  onChange={handleChange}
                  placeholder="e.g., MH 02 AB 1234"
                  className="w-full px-4 py-2.5 rounded-lg bg-white border border-gray-200 text-[#0E192D] focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all font-medium text-sm"
                  required
                />
              </div>

              {/* Registration Year */}
              <div>
                <label className="text-xs font-bold text-[#0E192D]/70 mb-1.5 block uppercase tracking-wider">Year*</label>
                <select
                  name="registrationYear"
                  value={formData.registrationYear}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-lg bg-white border border-gray-200 text-[#0E192D] focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all font-medium text-sm"
                  required
                >
                  <option value="">Select year</option>
                  {years.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              {/* Brand */}
              <div>
                <label className="text-xs font-bold text-gray-400 mb-1.5 block uppercase tracking-wider">Brand*</label>
                <select
                  name="brand"
                  value={formData.brand}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-lg bg-white border border-gray-200 text-[#0E192D] focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all font-medium text-sm"
                  required
                >
                  <option value="">Select brand</option>
                  {brands.map((brand) => (
                    <option key={brand} value={brand}>
                      {brand}
                    </option>
                  ))}
                  <option value="other">Other</option>
                </select>
              </div>

              {/* Model */}
              <div>
                <label className="text-xs font-bold text-gray-400 mb-1.5 block uppercase tracking-wider">Model*</label>
                <select
                  name="model"
                  value={formData.model}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-lg bg-white border border-gray-200 text-[#0E192D] focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all font-medium text-sm"
                  required
                >
                  <option value="">Select model</option>
                  {models.map((model) => (
                    <option key={model} value={model}>
                      {model}
                    </option>
                  ))}
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            {/* Custom Brand/Model inputs if "other" is selected */}
            {(formData.brand === "other" || formData.model === "other") && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                {formData.brand === "other" && (
                  <div>
                    <label className="text-xs font-bold text-gray-400 mb-1.5 block uppercase tracking-wider">Enter Brand*</label>
                    <input
                      type="text"
                      name="customBrand"
                      value={formData.customBrand}
                      onChange={handleChange}
                      placeholder="e.g., Tesla"
                      className="w-full px-4 py-2.5 rounded-lg bg-white border border-gray-200 text-[#0E192D] placeholder-gray-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all font-medium text-sm"
                      required
                    />
                  </div>
                )}
                {formData.model === "other" && (
                  <div>
                    <label className="text-xs font-bold text-gray-400 mb-1.5 block uppercase tracking-wider">Enter Model*</label>
                    <input
                      type="text"
                      name="customModel"
                      value={formData.customModel}
                      onChange={handleChange}
                      placeholder="e.g., Model S"
                      className="w-full px-4 py-2.5 rounded-lg bg-white border border-gray-200 text-[#0E192D] placeholder-gray-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all font-medium text-sm"
                      required
                    />
                  </div>
                )}
              </div>
            )}

            <div className="mt-4">
              <label className="text-xs font-bold text-gray-400 mb-1.5 block uppercase tracking-wider">Fuel Type*</label>
              <select
                name="fuelType"
                value={formData.fuelType}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-lg bg-white border border-gray-200 text-[#0E192D] focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all font-medium text-sm"
                required
              >
                <option value="">Select fuel type</option>
                {fuelTypes.map((fuel) => (
                  <option key={fuel} value={fuel}>
                    {fuel}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 mb-6">
            <h3 className="text-lg font-bold text-[#0E192D] flex items-center gap-2 mb-4">
              <MapPin className="w-5 h-5 text-blue-600" />
              Location & Contact
            </h3>

            {/* Contact Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="text-xs font-bold text-[#0E192D]/70 mb-1.5 block uppercase tracking-wider">Full Name*</label>
                <div className="flex items-center border border-gray-200 rounded-lg px-3 py-2.5 bg-white focus-within:border-emerald-500 focus-within:ring-4 focus-within:ring-emerald-500/10 transition-all group">
                  <User className="w-4 h-4 text-gray-400 mr-2 group-focus-within:text-emerald-500 transition-colors" />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter your name"
                    className="flex-1 outline-none bg-transparent text-[#0E192D] placeholder-gray-500 font-medium text-sm"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-[#0E192D]/70 mb-1.5 block uppercase tracking-wider">Phone Number*</label>
                <div className="flex items-center border border-gray-200 rounded-lg px-3 py-2.5 bg-white focus-within:border-emerald-500 focus-within:ring-4 focus-within:ring-emerald-500/10 transition-all group">
                  <Phone className="w-4 h-4 text-gray-400 mr-2 group-focus-within:text-emerald-500 transition-colors" />
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Enter phone number"
                    maxLength={10}
                    className="flex-1 outline-none bg-transparent text-[#0E192D] placeholder-gray-500 font-medium text-sm"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Location Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* State */}
              <div>
                <label className="text-xs font-bold text-gray-400 mb-1.5 block uppercase tracking-wider">State*</label>
                <select
                  name="state"
                  value={formData.state}
                  onChange={(e) => {
                    const newState = e.target.value;
                    setFormData(prev => ({ ...prev, state: newState, city: "" }));
                  }}
                  className="w-full px-4 py-2.5 rounded-lg bg-white border border-gray-200 text-[#0E192D] focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all font-medium text-sm"
                  required
                >
                  <option value="">Select State</option>
                  {states.map((state) => (
                    <option key={state} value={state}>{state}</option>
                  ))}
                </select>
              </div>

              {/* City */}
              <div>
                <label className="text-xs font-bold text-gray-400 mb-1.5 block uppercase tracking-wider">City*</label>
                <select
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  disabled={!formData.state}
                  className="w-full px-4 py-2.5 rounded-lg bg-white border border-gray-200 text-[#0E192D] focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all font-medium text-sm disabled:opacity-50"
                  required
                >
                  <option value="">Select City</option>
                  <option value="other">Other</option>
                  {formData.state && indiaData[formData.state as string]?.map((city) => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Custom City - Conditional */}
            {formData.city === "other" && (
              <div className="mt-4">
                <label className="text-xs font-bold text-gray-400 mb-1.5 block uppercase tracking-wider">Enter City*</label>
                <input
                  type="text"
                  name="customCity"
                  value={formData.customCity}
                  onChange={handleChange}
                  placeholder="Enter city name"
                  className="w-full px-4 py-2.5 rounded-lg bg-white border border-gray-200 text-[#0E192D] placeholder-gray-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all font-medium text-sm"
                  required={formData.city === "other"}
                />
              </div>
            )}

            <div className="mt-4">
              <label className="text-xs font-bold text-gray-400 mb-1.5 block uppercase tracking-wider">Pincode*</label>
              <input
                type="text"
                name="pincode"
                value={formData.pincode}
                onChange={handleChange}
                placeholder="6-digit pincode"
                maxLength={6}
                className="w-full px-4 py-2.5 rounded-lg bg-white border border-gray-200 text-[#0E192D] placeholder-gray-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all font-medium text-sm"
                required
              />
            </div>
          </div>


          {/* Pending Loan */}
          <div>
            <label className="text-xs font-bold text-[#0E192D]/70 mb-1.5 block uppercase tracking-wider">Do you have pending loan?*</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="pendingLoan"
                  value="no"
                  checked={formData.pendingLoan === "no"}
                  onChange={handleChange}
                  className="w-4 h-4 text-emerald-600 focus:ring-emerald-500"
                />
                <span className="text-sm font-medium text-[#0E192D]/80">No</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="pendingLoan"
                  value="yes"
                  checked={formData.pendingLoan === "yes"}
                  onChange={handleChange}
                  className="w-4 h-4 text-emerald-600 focus:ring-emerald-500"
                />
                <span className="text-sm font-medium text-[#0E192D]/80">Yes</span>
              </label>
            </div>
          </div>

          {/* Loan Details - Conditional */}
          {formData.pendingLoan === "yes" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-orange-50/50 p-4 rounded-lg border border-orange-100">
              <div>
                <label className="text-xs font-bold text-[#0E192D]/70 mb-1.5 block uppercase tracking-wider">Loan Amount*</label>
                <input
                  type="text"
                  name="loanAmount"
                  value={formData.loanAmount}
                  onChange={handleChange}
                  placeholder="e.g., 500000"
                  className="w-full px-4 py-2.5 rounded-lg bg-white border border-gray-200 text-[#0E192D] placeholder-gray-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all text-sm"
                  required={formData.pendingLoan === "yes"}
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#0E192D]/70 mb-1.5 block uppercase tracking-wider">Bank Name*</label>
                <input
                  type="text"
                  name="loanBank"
                  value={formData.loanBank}
                  onChange={handleChange}
                  placeholder="e.g., HDFC Bank"
                  className="w-full px-4 py-2.5 rounded-lg bg-white border border-gray-200 text-[#0E192D] placeholder-gray-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all text-sm"
                  required={formData.pendingLoan === "yes"}
                />
              </div>
            </div>
          )}

          {/* Submit Button */}
          <motion.button
            type="submit"
            disabled={loading}
            className="w-full bg-[#0E192D] hover:bg-emerald-600 text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-xl hover:shadow-emerald-500/20 transition-all duration-300 mt-6 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-lg relative overflow-hidden group"
            whileHover={!loading ? { scale: 1.01 } : {}}
            whileTap={!loading ? { scale: 0.99 } : {}}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            {loading && <Loader2 className="w-5 h-5 animate-spin" />}
            {loading ? "Processing..." : "Get Instant Valuation"}
          </motion.button>
        </form>
      </motion.div>

      {/* Intermediate CC Modal */}
      <AnimatePresence>
        {showIntermediateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.8, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-gray-200 p-8 relative"
            >
              <div className="flex justify-center mb-6">
                <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center animate-pulse">
                  <CheckCircle className="w-10 h-10 text-emerald-500" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-center text-[#0E192D] mb-2">Request Submitted!</h2>
              <div className="text-center mb-8">
                <p className="font-bold text-[#0E192D]/80 text-lg mb-1">Our CC will contact you soon</p>
                <p className="text-sm text-gray-500">Please complete the final step to process your request.</p>
              </div>

              <button
                onClick={() => {
                  localStorage.setItem("kycFormData", JSON.stringify(formData))
                  localStorage.setItem("kycValuation", valuation.toString())
                  localStorage.setItem("kycSource", "sell-vehicle")
                  if (valuationId) {
                    localStorage.setItem("kycValuationId", valuationId)
                  }
                  window.location.href = "/ekyc/sell-vehicle"
                }}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 rounded-lg shadow-lg flex items-center justify-center gap-2 transition-all shadow-emerald-600/20"
              >
                Complete eKYC
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>


    </div>
  )
}


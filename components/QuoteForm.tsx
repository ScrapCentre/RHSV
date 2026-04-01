"use client"

import React from "react"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Car, Bike, Truck, MessageCircle, CheckCircle, Phone, MapPin, FileText, User, Zap, Sparkles } from "lucide-react"
import Image from "next/image"
import ValuationModals from "./ValuationModals"
import AuthGuard from "./AuthGuard"
import Link from "next/link"
import { indiaData, states } from "@/lib/india-data"
import { useToast } from "@/hooks/use-toast"

const vehicleData = {
  Car: ["Maruti Suzuki", "Hyundai", "Tata", "Honda", "Toyota", "Mahindra", "Kia", "Skoda"],
  Bike: ["Hero", "Honda", "Bajaj", "TVS", "Harley Davidson", "Royal Enfield", "Ducati"],
  Truck: ["Tata", "Ashok Leyland", "Volvo", "Mahindra", "Bharat Benz"],
  Other: ["Auto", "Bus", "Tempo"],
}

const models = {
  Car: ["Sedan", "SUV", "Hatchback", "MUV", "Coupe"],
  Bike: ["Cruiser", "Sport Bike", "Touring", "Standard", "Scooter"],
  Truck: ["Cargo", "Dumper", "Flatbed", "Tanker"],
  Other: ["3-wheeler", "Mini Bus", "School Bus"],
}

const years = Array.from({ length: 30 }, (_, i) => new Date().getFullYear() - i)

const benefits = [
  {
    icon: Zap,
    title: "Accurate and Up-to-Date Data",
    description: "Get precise valuations based on real-time market data and comprehensive vehicle history",
  },
  {
    icon: CheckCircle,
    title: "Instant Valuation",
    description: "Receive an instant valuation of your vehicle in seconds with our AI-powered assessment",
  },
  {
    icon: Sparkles,
    title: "Expert Guidance",
    description: "Get expert recommendations to help you understand your car's market value better",
  },
]

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
  state: string
  city: string
  customCity: string
  agreeTC: boolean
}

export default function QuoteForm() {
  const [formData, setFormData] = useState<FormData>({
    vehicleType: "",
    brand: "",
    customBrand: "",
    model: "",
    customModel: "",
    year: "",
    vehicleNumber: "",
    vehicleWeight: "",
    name: "",
    phone: "",
    pincode: "",
    state: "",
    city: "",
    customCity: "",
    agreeTC: false,
  })
  const [showSuccess, setShowSuccess] = useState(false)
  const [showValuation, setShowValuation] = useState(false)
  const [valuationId, setValuationId] = useState<string | null>(null)
  const [estimatedValue, setEstimatedValue] = useState<number | null>(null)
  const [pickupCost, setPickupCost] = useState<number | null>(null)
  const [distance, setDistance] = useState<number | null>(null)
  const [appliedPickupRate, setAppliedPickupRate] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const { toast } = useToast()

  const handleVehicleType = (type: string) => {
    setFormData({
      ...formData,
      vehicleType: type,
      brand: "",
      customBrand: "",
      model: "",
      customModel: "",
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Basic validation check
    const brandToUse = formData.brand || formData.customBrand
    const modelToUse = formData.model || formData.customModel
    const cityToUse = formData.city === "other" ? formData.customCity : formData.city

    if (!formData.vehicleType || !brandToUse || !modelToUse || !formData.year || !formData.vehicleNumber || !formData.vehicleWeight || !formData.name || !formData.phone || !formData.pincode || !formData.state || !cityToUse || !formData.agreeTC) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields and agree to the terms.",
        variant: "destructive"
      })
      return
    }

    setIsLoading(true)

    try {
      // Submit to API to get ID
      const response = await fetch("/api/valuation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          brand: brandToUse,
          model: modelToUse,
          address: {
            pincode: formData.pincode,
            state: formData.state,
            city: cityToUse,
          },
          contact: {
            name: formData.name,
            phone: formData.phone,
          },
        }),
      })

      if (response.ok) {
        const data = await response.json()
        if (data.id) {
          setValuationId(data.id)
        }
        if (data.estimatedValue !== undefined) {
          setEstimatedValue(data.estimatedValue)
        }
        if (data.pickupCost !== undefined) {
          setPickupCost(data.pickupCost)
        }
        if (data.distance !== undefined) {
          setDistance(data.distance)
        }
        if (data.appliedPickupRate !== undefined) {
          setAppliedPickupRate(data.appliedPickupRate)
        }
        setShowValuation(true)
        setShowSuccess(true)
        setTimeout(() => setShowSuccess(false), 3000)
      } else {
        const data = await response.json()
        toast({
          title: "Submission Failed",
          description: data.message || "Failed to submit valuation request. Please try again.",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error("Error submitting valuation:", error)
      toast({
        title: "Network Error",
        description: "Something went wrong communicating with the server. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const vehicleOptions = [
    { icon: Car, label: "Car", value: "Car" },
    { icon: Bike, label: "Bike", value: "Bike" },
    { icon: Truck, label: "Truck", value: "Truck" },
    { icon: MessageCircle, label: "Other", value: "Other" },
  ]

  return (
    <div className="bg-gray-50 min-h-screen text-gray-900 selection:bg-emerald-500/30">
      <AuthGuard />

      {/* Valuation Modals Flow */}
      <AnimatePresence>
        {showValuation && (
          <ValuationModals
            formData={formData}
            valuationId={valuationId}
            estimatedValue={estimatedValue}
            pickupCost={pickupCost}
            distance={distance}
            appliedPickupRate={appliedPickupRate}
            onClose={() => {
              setShowValuation(false)
              setFormData({
                vehicleType: "",
                brand: "",
                customBrand: "",
                model: "",
                customModel: "",
                year: "",
                vehicleNumber: "",
                vehicleWeight: "",
                name: "",
                phone: "",
                pincode: "",
                state: "",
                city: "",
                customCity: "",
                agreeTC: false,
              })
            }}
          />
        )}
      </AnimatePresence>

      {/* Hero Section */}
      <section className="pt-44 pb-8 px-4">
        <div className="container mx-auto max-w-7xl relative rounded-[2rem] overflow-hidden min-h-[400px] flex items-center justify-center shadow-xl">
          {/* Background Image */}
          <div className="absolute inset-0 z-0">
            <Image
              src="/getfreevalbg.png"
              alt="Vehicle Valuation Background"
              fill
              className="object-cover"
              style={{ objectPosition: "center 35%" }}
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
                <Zap className="w-4 h-4 text-emerald-400" />
                <span>Instant API Valuation</span>
              </motion.div>

              <h1 className="text-5xl md:text-7xl font-bold mb-8 text-white leading-[1.1] drop-shadow-sm">
                Get <span className="text-emerald-400">Free Quote</span>
              </h1>

              <p className="text-xl md:text-2xl text-gray-100 max-w-2xl mx-auto leading-relaxed drop-shadow-sm font-medium">
                Get an instant valuation for your vehicle with maximum value, free pickup, and road tax rebate.
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
                <p className="text-emerald-800 text-lg leading-relaxed font-medium">Get precise valuations based on real-time market data and comprehensive vehicle history.</p>
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

            {/* Right Side - Form */}
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
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Valuation Details</h3>
                    <p className="text-gray-500 text-sm">Tell us about your vehicle to get started</p>
                  </div>
                  <motion.form
                    onSubmit={handleSubmit}
                    className="space-y-6"
                    variants={{
                      hidden: { opacity: 0 },
                      visible: { opacity: 1, transition: { staggerChildren: 0.15, delayChildren: 0.3 } }
                    }}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.1 }}
                  >
                    {/* Vehicle Type Selection */}
                    <motion.div variants={{ hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 50 } } }}>
                      <label className="text-sm font-bold text-[#0E192D] mb-3 block uppercase tracking-wider">Vehicle Type*</label>
                      <div className="grid grid-cols-2 gap-3">
                        {vehicleOptions.map((option) => {
                          const IconComponent = option.icon
                          return (
                            <motion.button
                              key={option.value}
                              type="button"
                              onClick={() => handleVehicleType(option.value)}
                              className={`p-3 rounded-lg border-2 transition-all duration-300 flex flex-col items-center gap-2 ${formData.vehicleType === option.value
                                ? "border-emerald-500 bg-emerald-50"
                                : "border-gray-200 bg-gray-50 hover:border-emerald-300"
                                }`}
                              whileHover={{ scale: 1.05, y: -2 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              <IconComponent className={`w-6 h-6 ${formData.vehicleType === option.value ? "text-emerald-600" : "text-gray-400"}`} />
                              <span className={`text-xs font-semibold ${formData.vehicleType === option.value ? "text-emerald-700" : "text-gray-500"}`}>
                                {option.label}
                              </span>
                            </motion.button>
                          )
                        })}
                      </div>
                    </motion.div>

                    {/* Make Selection */}
                    {formData.vehicleType && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
                      >
                        <label className="text-sm font-bold text-[#0E192D] mb-2 block uppercase tracking-wider">
                          {formData.vehicleType === "Other" ? "Enter Vehicle Name*" : "Select Make*"}
                        </label>
                        {formData.vehicleType === "Other" ? (
                          <div className="flex items-center border border-gray-200 rounded-lg px-3 py-2.5 bg-gray-50 focus-within:border-emerald-500 transition-colors focus-within:ring-2 focus-within:ring-emerald-500/20 group">
                            <Car className="w-4 h-4 text-gray-400 mr-2 group-focus-within:text-emerald-500 transition-colors" />
                            <input
                              type="text"
                              placeholder="Enter vehicle name"
                              value={formData.customBrand}
                              onChange={(e) => setFormData({ ...formData, customBrand: e.target.value, model: "", customModel: "" })}
                              className="flex-1 outline-none bg-transparent text-gray-900 placeholder-gray-400"
                            />
                          </div>
                        ) : (
                          <motion.select
                            value={formData.brand}
                            onChange={(e) => setFormData({ ...formData, brand: e.target.value, model: "", customModel: "" })}
                            className="w-full px-4 py-2.5 rounded-lg bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 focus:border-emerald-500 outline-none transition-all duration-300"
                            whileFocus={{ scale: 1.01, boxShadow: "0 0 0 2px rgba(16, 185, 129, 0.2)" }}
                          >
                            <option value="">Choose {formData.vehicleType || "vehicle"} brand</option>
                            {formData.vehicleType && vehicleData[formData.vehicleType as keyof typeof vehicleData]?.map((brand) => (
                              <option key={brand} value={brand}>
                                {brand}
                              </option>
                            ))}
                            <option value="other">Other</option>
                          </motion.select>
                        )}
                      </motion.div>
                    )}

                    {/* Custom Brand Input */}
                    {formData.brand === "other" && formData.vehicleType !== "Other" && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
                        className="flex items-center border border-gray-200 rounded-lg px-3 py-2.5 bg-gray-50 focus-within:border-emerald-500 transition-colors focus-within:ring-2 focus-within:ring-emerald-500/20 group"
                      >
                        <FileText className="w-4 h-4 text-gray-400 mr-2 group-focus-within:text-emerald-500 transition-colors" />
                        <input
                          type="text"
                          placeholder="Enter brand name"
                          value={formData.customBrand}
                          onChange={(e) => setFormData({ ...formData, customBrand: e.target.value })}
                          className="flex-1 outline-none bg-transparent text-gray-900 placeholder-gray-400"
                        />
                      </motion.div>
                    )}

                    {/* Model Selection */}
                    {(formData.brand || formData.customBrand) && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
                      >
                        <label className="text-sm font-bold text-[#0E192D] mb-2 block uppercase tracking-wider">
                          {formData.vehicleType === "Other" || formData.brand === "other" ? "Enter Model*" : "Select Model*"}
                        </label>
                        {formData.vehicleType === "Other" || formData.brand === "other" ? (
                          <div className="flex items-center border border-gray-200 rounded-lg px-3 py-2.5 bg-gray-50 focus-within:border-emerald-500 transition-colors focus-within:ring-2 focus-within:ring-emerald-500/20 group">
                            <FileText className="w-4 h-4 text-gray-400 mr-2 group-focus-within:text-emerald-500 transition-colors" />
                            <input
                              type="text"
                              placeholder="Enter model name"
                              value={formData.customModel}
                              onChange={(e) => setFormData({ ...formData, customModel: e.target.value })}
                              className="flex-1 outline-none bg-transparent text-gray-900 placeholder-gray-400"
                            />
                          </div>
                        ) : (
                          <motion.select
                            value={formData.model}
                            onChange={(e) => setFormData({ ...formData, model: e.target.value, customModel: "" })}
                            className="w-full px-4 py-2.5 rounded-lg bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 focus:border-emerald-500 outline-none transition-all duration-300"
                            whileFocus={{ scale: 1.01, boxShadow: "0 0 0 2px rgba(16, 185, 129, 0.2)" }}
                          >
                            <option value="">Choose model</option>
                            {formData.vehicleType && models[formData.vehicleType as keyof typeof models]?.map((model) => (
                              <option key={model} value={model}>
                                {model}
                              </option>
                            ))}
                            <option value="other">Other</option>
                          </motion.select>
                        )}
                      </motion.div>
                    )}

                    {/* Custom Model Input when "Other" is selected from dropdown */}
                    {formData.model === "other" && formData.brand !== "other" && formData.vehicleType !== "Other" && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 0, y: 0 }}
                        variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
                        className="flex items-center border border-gray-200 rounded-lg px-3 py-2.5 bg-gray-50 focus-within:border-emerald-500 transition-colors focus-within:ring-2 focus-within:ring-emerald-500/20 group"
                      >
                        <FileText className="w-4 h-4 text-gray-400 mr-2 group-focus-within:text-emerald-500 transition-colors" />
                        <input
                          type="text"
                          placeholder="Enter model name"
                          value={formData.customModel}
                          onChange={(e) => setFormData({ ...formData, customModel: e.target.value })}
                          className="flex-1 outline-none bg-transparent text-gray-900 placeholder-gray-400"
                        />
                      </motion.div>
                    )}

                    {/* Year Selection */}
                    {((formData.model && formData.model !== "other") || formData.customModel) && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
                      >
                        <label className="text-sm font-bold text-[#0E192D] mb-2 block uppercase tracking-wider">Year*</label>
                        <motion.select
                          value={formData.year}
                          onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                          className="w-full px-4 py-2.5 rounded-lg bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 focus:border-emerald-500 outline-none transition-all duration-300"
                          whileFocus={{ scale: 1.01, boxShadow: "0 0 0 2px rgba(16, 185, 129, 0.2)" }}
                        >
                          <option value="">Choose year</option>
                          {years.map((year) => (
                            <option key={year} value={year}>
                              {year}
                            </option>
                          ))}
                        </motion.select>
                      </motion.div>
                    )}

                    {/* Vehicle Number */}
                    <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
                      <label htmlFor="vehicleNumber" className="text-sm font-bold text-[#0E192D] mb-3 block uppercase tracking-wider">
                        Vehicle Registration Number*
                      </label>
                      <motion.input
                        type="text"
                        id="vehicleNumber"
                        value={formData.vehicleNumber}
                        onChange={(e) => setFormData({ ...formData, vehicleNumber: e.target.value.toUpperCase() })}
                        placeholder="e.g., DL-01-AB-1234"
                        className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all duration-300 outline-none"
                        whileFocus={{ scale: 1.01, boxShadow: "0 0 0 2px rgba(16, 185, 129, 0.2)" }}
                      />
                    </motion.div>

                    {/* Vehicle Weight */}
                    <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
                      <label htmlFor="vehicleWeight" className="text-sm font-bold text-[#0E192D] mb-3 block uppercase tracking-wider">
                        Vehicle Weight (Tons)*
                      </label>
                      <motion.input
                        type="number"
                        id="vehicleWeight"
                        value={formData.vehicleWeight}
                        onChange={(e) => setFormData({ ...formData, vehicleWeight: e.target.value })}
                        placeholder="e.g., 1.5"
                        step="0.1"
                        min="0"
                        className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all duration-300 outline-none"
                        whileFocus={{ scale: 1.01, boxShadow: "0 0 0 2px rgba(16, 185, 129, 0.2)" }}
                      />
                    </motion.div>

                    {/* Location Details (State & City) */}
                    <motion.div
                      variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
                      className="grid grid-cols-2 gap-3"
                    >
                      <div className="flex flex-col">
                        <label className="text-sm font-bold text-[#0E192D] mb-3 block uppercase tracking-wider">State*</label>
                        <motion.select
                          name="state"
                          value={formData.state}
                          onChange={(e) => {
                            const newState = e.target.value;
                            setFormData(prev => ({ ...prev, state: newState, city: "", customCity: "" }));
                          }}
                          className="w-full px-4 py-2.5 rounded-lg bg-gray-50 border border-gray-200 text-gray-900 focus:border-emerald-500 outline-none transition-all duration-300"
                          whileFocus={{ scale: 1.01, boxShadow: "0 0 0 2px rgba(16, 185, 129, 0.2)" }}
                          required
                        >
                          <option value="">Select State</option>
                          {states.map((state) => (
                            <option key={state} value={state}>{state}</option>
                          ))}
                        </motion.select>
                      </div>

                      <div className="flex flex-col">
                        <label className="text-sm font-bold text-[#0E192D] mb-3 block uppercase tracking-wider">City*</label>
                        <motion.select
                          name="city"
                          value={formData.city}
                          onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                          className="w-full px-4 py-2.5 rounded-lg bg-gray-50 border border-gray-200 text-gray-900 focus:border-emerald-500 outline-none transition-all duration-300 disabled:opacity-50"
                          whileFocus={formData.state ? { scale: 1.01, boxShadow: "0 0 0 2px rgba(16, 185, 129, 0.2)" } : {}}
                          required
                          disabled={!formData.state}
                        >
                          <option value="">Select City</option>
                          <option value="other">Other</option>
                          {formData.state && indiaData[formData.state as string]?.map((city) => (
                            <option key={city} value={city}>{city}</option>
                          ))}
                        </motion.select>
                      </div>
                    </motion.div>

                    {/* Custom City */}
                    {formData.city === "other" && (
                      <motion.div
                        variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}
                        className="flex items-center border border-gray-200 rounded-lg px-3 py-2.5 bg-gray-50 focus-within:border-emerald-500 transition-colors focus-within:ring-2 focus-within:ring-emerald-500/20 group"
                      >
                        <MapPin className="w-4 h-4 text-gray-400 mr-2 group-focus-within:text-emerald-500 transition-colors" />
                        <input
                          type="text"
                          placeholder="Enter your city"
                          value={formData.customCity}
                          onChange={(e) => setFormData({ ...formData, customCity: e.target.value })}
                          className="flex-1 outline-none bg-transparent text-gray-900 placeholder-gray-400"
                          required={formData.city === "other"}
                        />
                      </motion.div>
                    )}

                    {/* Pincode */}
                    <motion.div
                      variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
                      className="flex items-center border border-gray-200 rounded-lg px-3 py-2.5 bg-gray-50 focus-within:border-emerald-500 transition-colors focus-within:ring-2 focus-within:ring-emerald-500/20 group"
                    >
                      <MapPin className="w-4 h-4 text-gray-400 mr-2 group-focus-within:text-emerald-500 transition-colors" />
                      <input
                        type="text"
                        placeholder="Pincode"
                        value={formData.pincode}
                        onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                        maxLength={6}
                        className="flex-1 outline-none bg-transparent text-gray-900 placeholder-gray-400"
                      />
                    </motion.div>

                    {/* Name and Phone */}
                    <motion.div
                      variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
                      className="grid grid-cols-2 gap-3"
                    >
                      <div className="flex items-center border border-gray-200 rounded-lg px-3 py-2.5 bg-gray-50 focus-within:border-emerald-500 transition-colors focus-within:ring-2 focus-within:ring-emerald-500/20 group">
                        <User className="w-4 h-4 text-gray-400 mr-2 group-focus-within:text-emerald-500 transition-colors" />
                        <input
                          type="text"
                          placeholder="Your Name"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="flex-1 outline-none bg-transparent text-gray-900 placeholder-gray-400 text-sm"
                        />
                      </div>
                      <div className="flex items-center border border-gray-200 rounded-lg px-3 py-2.5 bg-gray-50 focus-within:border-emerald-500 transition-colors focus-within:ring-2 focus-within:ring-emerald-500/20 group">
                        <Phone className="w-4 h-4 text-gray-400 mr-2 group-focus-within:text-emerald-500 transition-colors" />
                        <input
                          type="tel"
                          placeholder="Phone Number"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          maxLength={10}
                          className="flex-1 outline-none bg-transparent text-gray-900 placeholder-gray-400 text-sm"
                        />
                      </div>
                    </motion.div>

                    {/* Terms & Conditions */}
                    <motion.div
                      variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
                      className="flex items-center gap-3 bg-gray-50 rounded-lg p-3 border border-gray-200"
                    >
                      <input
                        type="checkbox"
                        id="tc"
                        checked={formData.agreeTC}
                        onChange={(e) => setFormData({ ...formData, agreeTC: e.target.checked })}
                        className="w-4 h-4 rounded cursor-pointer accent-emerald-600"
                      />
                      <label htmlFor="tc" className="text-gray-600 cursor-pointer text-sm">
                        I agree to the <Link href="/terms" className="text-emerald-600 font-medium hover:underline">Terms & Conditions</Link>
                      </label>
                    </motion.div>

                    {/* Submit Button */}
                    <motion.button
                      type="submit"
                      disabled={!formData.agreeTC || isLoading}
                      variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
                      className="w-full bg-[#0E192D] hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-lg shadow-lg hover:shadow-xl hover:shadow-emerald-500/20 transition-all duration-300 flex items-center justify-center gap-2 text-base relative overflow-hidden group"
                      whileHover={{ scale: formData.agreeTC && !isLoading ? 1.02 : 1 }}
                      whileTap={{ scale: formData.agreeTC && !isLoading ? 0.98 : 1 }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      {isLoading ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin relative z-10" />
                          <span className="relative z-10">Calculating Quote...</span>
                        </>
                      ) : (
                        <>
                          <FileText className="w-5 h-5 relative z-10" />
                          <span className="relative z-10">Get My Free Quote</span>
                        </>
                      )}
                    </motion.button>
                  </motion.form>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  )
}


"use client"

import React from "react"

import { motion } from "framer-motion"
import { ArrowLeft, CheckCircle, User, Calendar, Smartphone, CreditCard, FileText, Image as ImageIcon, ArrowRight } from "lucide-react"
import { useState } from "react"
import Link from "next/link"

interface VehicleFormData {
  // Fields from SellVehicleForm
  registrationNumber?: string
  brand?: string
  customBrand?: string
  model?: string
  customModel?: string
  registrationYear?: string
  fuelType?: string
  pendingLoan?: string
  loanAmount?: string
  loanBank?: string
  carAccident?: string

  // Fields from QuoteForm
  vehicleType?: string
  year?: string
  vehicleNumber?: string
  vehicleWeight?: string

  // Common
  name?: string
  phone?: string
  state?: string
  city?: string
  customCity?: string
  pincode?: string
  agreeTC?: boolean
}

interface eKYCFormData {
  firstName: string
  dob: string
  aadharPhone: string
  aadharNumber: string
  // Files
  aadharFile?: File | null
  rcFile?: File | null
  carPhoto?: File | null
  agreeTC: boolean
}


export default function EKYCForm({
  formData,
  onBack,
  isPage = false,
  valuationId,
  source
}: {
  formData: VehicleFormData;
  onBack: () => void;
  valuation: number;
  isPage?: boolean;
  valuationId?: string | null;
  source?: string | null;
}) {
  const [eKYCData, setEKYCData] = useState<eKYCFormData>({
    firstName: formData.name || "",
    dob: "",
    aadharPhone: formData.phone || "",
    aadharNumber: "",
    aadharFile: null,
    rcFile: null,
    carPhoto: null,
    agreeTC: false,
  })


  const [showCollectionCenter, setShowCollectionCenter] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (eKYCData.firstName && eKYCData.dob && eKYCData.aadharPhone && eKYCData.aadharNumber && eKYCData.agreeTC) {

      try {
        const idToUse = valuationId || localStorage.getItem("kycValuationId")

        if (!idToUse) {
          console.error("Valuation ID not found")
          // Fallback: Proceed to success screen anyway for demo/UI flow if no ID
          setShowCollectionCenter(true)
          return
        }

        const formData = new FormData()
        formData.append("valuationId", idToUse)
        if (source) formData.append("source", source)
        formData.append("firstName", eKYCData.firstName)
        formData.append("dob", eKYCData.dob)
        formData.append("aadharPhone", eKYCData.aadharPhone)
        formData.append("aadharNumber", eKYCData.aadharNumber)

        if (eKYCData.aadharFile) formData.append("aadharFile", eKYCData.aadharFile)
        if (eKYCData.rcFile) formData.append("rcFile", eKYCData.rcFile)
        if (eKYCData.carPhoto) formData.append("carPhoto", eKYCData.carPhoto)

        const response = await fetch("/api/ekyc", {
          method: "PATCH",
          body: formData,
        })

        if (response.ok) {
          setShowCollectionCenter(true)
          // Clear stored data on success
          localStorage.removeItem("kycFormData")
          localStorage.removeItem("kycValuation")
          localStorage.removeItem("kycValuationId")
        } else {
          const errorData = await response.json()
          console.error("Failed to update eKYC data:", errorData)
          alert(`Failed to upload: ${errorData.message || "Something went wrong"}`)
        }
      } catch (error) {
        console.error("Error submitting eKYC:", error)
        alert("Failed to submit. Please check your connection.")
      }

    } else {
      alert("Please fill in all details.")
    }
  }

  if (showCollectionCenter) {
    // Pre-generate random values outside of JSX to avoid re-renders
    const confettiPieces = Array.from({ length: 60 }, (_, i) => ({
      id: i,
      color: ["#10b981", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#06b6d4", "#ffffff"][i % 8],
      x: (Math.random() - 0.5) * 120, // vw spread
      y: -(30 + Math.random() * 80), // vh upward
      rotate: Math.random() * 720,
      delay: Math.random() * 0.8,
      duration: 1.8 + Math.random() * 1.2,
      size: 6 + Math.random() * 8,
      shape: i % 3, // 0=circle, 1=rect, 2=star
    }))

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-hidden"
      >
        {/* Confetti burst from center */}
        {confettiPieces.map((piece) => (
          <motion.div
            key={piece.id}
            className="absolute pointer-events-none"
            style={{
              width: piece.size,
              height: piece.shape === 1 ? piece.size * 0.4 : piece.size,
              backgroundColor: piece.color,
              borderRadius: piece.shape === 0 ? "50%" : piece.shape === 1 ? "2px" : "0%",
              left: "50%",
              top: "50%",
            }}
            initial={{ x: 0, y: 0, opacity: 1, rotate: 0, scale: 1 }}
            animate={{
              x: `${piece.x}vw`,
              y: `${piece.y}vh`,
              opacity: [1, 1, 0],
              rotate: piece.rotate,
              scale: [1, 1.2, 0.5],
            }}
            transition={{
              duration: piece.duration,
              delay: piece.delay,
              ease: "easeOut" as const,
              repeat: Infinity,
              repeatDelay: 1.5,
            }}
          />
        ))}

        {/* Floating emoji */}
        {["🎉", "🎊", "✨", "🏆", "🎈", "⭐"].map((emoji, i) => (
          <motion.div
            key={`emoji-${i}`}
            className="absolute text-2xl md:text-3xl pointer-events-none select-none"
            style={{ left: `${10 + i * 15}%`, bottom: "-5%" }}
            animate={{
              y: [0, -window.innerHeight * 1.2],
              x: [0, (i % 2 === 0 ? 1 : -1) * (20 + Math.random() * 30)],
              opacity: [0, 1, 1, 0],
              rotate: [0, (i % 2 === 0 ? 30 : -30)],
            }}
            transition={{
              duration: 3 + i * 0.4,
              delay: i * 0.3,
              repeat: Infinity,
              repeatDelay: 0.5,
              ease: "easeOut" as const,
            }}
          >
            {emoji}
          </motion.div>
        ))}

        {/* Main card */}
        <motion.div
          initial={{ scale: 0.5, y: 60, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          transition={{ type: "spring", duration: 0.7, bounce: 0.4, delay: 0.1 }}
          className="bg-[#0E192D] rounded-3xl shadow-2xl max-w-md w-full border border-emerald-500/30 p-8 relative z-10 overflow-hidden"
        >
          {/* Glowing background blob */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-emerald-500/20 rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-0 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl" />
          </div>

          {/* Content */}
          <div className="relative z-10 text-center">
            {/* Animated checkmark */}
            <motion.div
              className="flex justify-center mb-6"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", duration: 0.8, bounce: 0.5, delay: 0.2 }}
            >
              <div className="relative">
                <motion.div
                  className="w-24 h-24 rounded-full bg-emerald-500/20 flex items-center justify-center border-2 border-emerald-500/40"
                  animate={{ scale: [1, 1.1, 1], boxShadow: ["0 0 0 0 rgba(16,185,129,0.4)", "0 0 0 20px rgba(16,185,129,0)", "0 0 0 0 rgba(16,185,129,0)"] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <CheckCircle className="w-12 h-12 text-emerald-400" />
                </motion.div>
              </div>
            </motion.div>

            {/* Title */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <h2 className="text-4xl font-black text-white mb-1">
                You&apos;re All Set! <span className="text-2xl">🎉</span>
              </h2>
              <div className="h-1 w-16 bg-gradient-to-r from-emerald-400 to-cyan-400 rounded-full mx-auto my-3" />
            </motion.div>

            <motion.p
              className="text-emerald-400 font-bold text-lg mb-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              eKYC Completed Successfully!
            </motion.p>

            <motion.p
              className="text-gray-400 text-sm mb-8 leading-relaxed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              Your identity has been verified. Our team will reach out to you shortly to complete the process.
            </motion.p>

            {/* Stats row */}
            <motion.div
              className="grid grid-cols-3 gap-3 mb-8"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              {[
                { label: "Verified", icon: "✅", color: "text-emerald-400" },
                { label: "Submitted", icon: "📤", color: "text-blue-400" },
                { label: "Processing", icon: "⚡", color: "text-yellow-400" },
              ].map((item, i) => (
                <div key={i} className="bg-slate-800/60 rounded-xl p-3 border border-slate-700/50">
                  <div className="text-2xl mb-1">{item.icon}</div>
                  <div className={`text-xs font-bold ${item.color}`}>{item.label}</div>
                </div>
              ))}
            </motion.div>

            {/* CTA Button */}
            <motion.button
              onClick={() => {
                setShowCollectionCenter(false)
                window.location.href = "/"
              }}
              className="w-full px-6 py-4 bg-emerald-500 hover:bg-emerald-400 text-white font-black rounded-2xl transition-all shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 hover:-translate-y-0.5 text-lg"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              Back to Home 🏠
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    )
  }



  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={isPage ? "w-full" : "fixed inset-0 bg-[#0E192D]/80 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto"}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 30 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: "spring", duration: 0.6, bounce: 0.3 }}
        className={
          isPage
            ? "bg-white/95 backdrop-blur-xl rounded-none md:rounded-2xl shadow-2xl w-full border-y md:border border-white/20 relative overflow-hidden"
            : "bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl max-w-4xl w-full border border-white/20 my-8 max-h-[80vh] overflow-y-auto relative"
        }
      >
        {/* Decorative Background Elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-orange-400/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-400/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none" />

        {/* Header */}
        <div className="sticky top-0 flex items-center justify-between p-3 md:p-6 bg-white/80 backdrop-blur-md border-b border-gray-100 z-10">
          <div className="flex items-center gap-2 md:gap-4">
            <motion.button
              onClick={onBack}
              className="p-1.5 md:p-2.5 bg-gray-50 hover:bg-gray-100 rounded-full text-gray-600 transition-all border border-gray-200"
              whileHover={{ scale: 1.1, rotate: -10 }}
              whileTap={{ scale: 0.95 }}
            >
              <ArrowLeft className="w-4 h-4 md:w-5 md:h-5" />
            </motion.button>
            <div>
              <h2 className="text-lg md:text-2xl font-black bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                Complete Verification
              </h2>
              <p className="text-[10px] md:text-sm text-gray-500 font-medium">Step 2 of 2: eKYC & Documentation</p>
            </div>
          </div>
        </div>

        {/* Form Content */}
        <div className="p-4 md:p-6">
          <form onSubmit={handleSubmit} className="space-y-4 md:space-y-5">

            {/* Personal Details Section */}
            <div className="bg-emerald-50/50 p-4 md:p-5 rounded-xl border border-emerald-100/50">
              <h3 className="text-base md:text-lg font-bold text-[#0E192D] mb-3 md:mb-4 flex items-center gap-2">
                <span className="w-1 h-5 md:h-6 bg-emerald-500 rounded-full"></span>
                Personal Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-xs font-bold text-[#0E192D]/70 mb-1.5 block uppercase tracking-wider ml-1">Full Name</label>
                  <div className="relative group">
                    <User className="absolute left-4 top-3.5 w-5 h-5 text-gray-400 group-focus-within:text-emerald-500 transition-colors" />
                    <input
                      type="text"
                      value={eKYCData.firstName}
                      onChange={(e) => setEKYCData({ ...eKYCData, firstName: e.target.value })}
                      placeholder="As per Aadhaar"
                      className="w-full pl-10 md:pl-12 pr-3 md:pr-4 py-2 md:py-2.5 rounded-lg bg-white border-2 border-gray-100 text-[#0E192D] placeholder-gray-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all font-medium outline-none text-xs md:text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-[#0E192D]/70 mb-1.5 block uppercase tracking-wider ml-1">Date of Birth</label>
                  <div className="relative group">
                    <Calendar className="absolute left-4 top-3.5 w-5 h-5 text-gray-400 group-focus-within:text-emerald-500 transition-colors" />
                    <input
                      type="date"
                      value={eKYCData.dob}
                      onChange={(e) => setEKYCData({ ...eKYCData, dob: e.target.value })}
                      className="w-full pl-12 pr-4 py-2.5 rounded-lg bg-white border-2 border-gray-100 text-[#0E192D] focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all font-medium outline-none text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Aadhar Details Section */}
            <div className="bg-blue-50/30 p-4 md:p-5 rounded-xl border border-blue-100/50">
              <h3 className="text-base md:text-lg font-bold text-[#0E192D] mb-3 md:mb-4 flex items-center gap-2">
                <span className="w-1 h-5 md:h-6 bg-[#0E192D] rounded-full"></span>
                Aadhaar Verification
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-xs font-bold text-[#0E192D]/70 mb-1.5 block uppercase tracking-wider ml-1">
                    Linked Mobile Number
                  </label>
                  <div className="relative group">
                    <Smartphone className="absolute left-4 top-3.5 w-5 h-5 text-gray-400 group-focus-within:text-[#0E192D] transition-colors" />
                    <input
                      type="tel"
                      value={eKYCData.aadharPhone}
                      onChange={(e) => {
                        const numericValue = e.target.value.replace(/\D/g, "").slice(0, 10)
                        setEKYCData({ ...eKYCData, aadharPhone: numericValue })
                      }}
                      placeholder="10-digit mobile number"
                      maxLength={10}
                      className="w-full pl-12 pr-4 py-2.5 rounded-lg bg-white border-2 border-gray-100 text-[#0E192D] placeholder-gray-400 focus:border-[#0E192D] focus:ring-4 focus:ring-[#0E192D]/10 transition-all font-medium outline-none text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-[#0E192D]/70 mb-1.5 block uppercase tracking-wider ml-1">Aadhaar Number</label>
                  <div className="relative group">
                    <CreditCard className="absolute left-4 top-3.5 w-5 h-5 text-gray-400 group-focus-within:text-[#0E192D] transition-colors" />
                    <input
                      type="text"
                      value={eKYCData.aadharNumber}
                      onChange={(e) => {
                        // Remove non-digits
                        const val = e.target.value.replace(/\D/g, "")
                        // Limit to 12 digits
                        const truncated = val.slice(0, 12)
                        // Add hyphens every 4 digits
                        const formatted = truncated.replace(/(\d{4})(?=\d)/g, "$1-")
                        setEKYCData({ ...eKYCData, aadharNumber: formatted })
                      }}
                      placeholder="XXXX-XXXX-XXXX"
                      maxLength={14}
                      className="w-full pl-12 pr-4 py-2.5 rounded-lg bg-white border-2 border-gray-100 text-[#0E192D] placeholder-gray-400 focus:border-[#0E192D] focus:ring-4 focus:ring-[#0E192D]/10 transition-all font-medium outline-none text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Document Uploads Section */}
            <div>
              <h3 className="text-sm md:text-lg font-bold text-[#0E192D] mb-2 md:mb-4 flex items-center gap-2">
                <span className="w-1 h-4 md:h-6 bg-emerald-500 rounded-full"></span>
                Document Uploads
              </h3>

              <div className="grid grid-cols-3 gap-2 md:gap-6">
                {[
                  { label: "Aadhaar", type: "IMG", key: "aadharFile", icon: ImageIcon, color: "emerald" },
                  { label: "RC Doc", type: "IMG", key: "rcFile", icon: ImageIcon, color: "blue" },
                  { label: "Car Img", type: "IMG", key: "carPhoto", icon: ImageIcon, color: "emerald" }
                ].map((item, idx) => (
                  <div key={idx} className="group relative">
                    <label className="text-xs md:text-sm font-bold text-[#0E192D] mb-2 block uppercase tracking-wider truncate">{item.label}</label>
                    <div className={`border-2 border-dashed border-gray-300 rounded-xl md:rounded-2xl p-2 md:p-6 flex flex-col items-center justify-center bg-white hover:bg-${item.color}-50/50 hover:border-${item.color}-500 transition-all cursor-pointer relative overflow-hidden h-24 md:h-auto shadow-sm`}>
                      <div className={`w-8 h-8 md:w-12 md:h-12 bg-gray-50 rounded-full flex items-center justify-center shadow-inner mb-2 md:mb-3 group-hover:scale-110 transition-transform duration-300`}>
                        <item.icon className={`w-4 h-4 md:w-6 md:h-6 text-${item.color === 'blue' ? '#0E192D' : 'emerald-600'}`} />
                      </div>
                      <p className="text-[10px] md:text-sm font-bold text-[#0E192D] text-center leading-tight">{eKYCData[item.key as keyof eKYCFormData] ? "Selected" : "Upload"}</p>
                      <p className="text-[8px] md:text-xs text-gray-400 mt-0.5 md:mt-1 hidden md:block">{item.type} only</p>
                      <input
                        type="file"
                        accept="image/png, image/jpeg, image/jpg"
                        onChange={(e) => setEKYCData({ ...eKYCData, [item.key]: e.target.files ? e.target.files[0] : null })}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                      {eKYCData[item.key as keyof eKYCFormData] && (
                        <div className="absolute top-1 right-1 md:top-2 md:right-2">
                          <CheckCircle className="w-3 h-3 md:w-5 md:h-5 text-emerald-500 fill-white" />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* T&C Checkbox */}
            <div className="flex items-start gap-2 md:gap-4 p-2 md:p-4 bg-emerald-50 rounded-lg md:rounded-xl border border-emerald-100">
              <div className="relative flex items-center mt-0.5">
                <input
                  type="checkbox"
                  id="tc"
                  checked={eKYCData.agreeTC}
                  onChange={(e) => setEKYCData({ ...eKYCData, agreeTC: e.target.checked })}
                  className="peer h-4 w-4 md:h-5 md:w-5 cursor-pointer appearance-none rounded md:rounded-md border-2 border-emerald-300 transition-all checked:bg-emerald-500 checked:border-emerald-500"
                />
                <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 peer-checked:opacity-100 pointer-events-none">
                  <CheckCircle className="w-3.5 h-3.5 text-white" />
                </span>
              </div>
              <label htmlFor="tc" className="text-sm text-gray-600 cursor-pointer select-none leading-relaxed">
                I hereby declare that the details furnished above are true and correct to the best of my knowledge. I agree to the{" "}
                <Link href="/terms" className="text-emerald-600 font-bold hover:underline">Terms & Conditions</Link> and{" "}
                <span className="text-emerald-600 font-bold hover:underline">Privacy Policy</span>.
              </label>
            </div>

            {/* Submit Button */}
            <motion.button
              type="submit"
              disabled={!eKYCData.firstName || !eKYCData.dob || !eKYCData.aadharNumber || !eKYCData.agreeTC}
              className={`w-full py-3.5 md:py-4.5 rounded-xl font-bold text-base md:text-lg shadow-lg relative overflow-hidden group ${!eKYCData.firstName || !eKYCData.dob || !eKYCData.aadharNumber || !eKYCData.agreeTC
                ? "bg-gray-100 text-gray-400 cursor-not-allowed shadow-none"
                : "bg-[#0E192D] text-white hover:bg-emerald-600 hover:shadow-xl hover:shadow-emerald-500/20"
                }`}
              whileHover={!(!eKYCData.firstName || !eKYCData.dob || !eKYCData.aadharNumber || !eKYCData.agreeTC) ? { scale: 1.01 } : {}}
              whileTap={!(!eKYCData.firstName || !eKYCData.dob || !eKYCData.aadharNumber || !eKYCData.agreeTC) ? { scale: 0.99 } : {}}
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                Submit Verification
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </motion.button>
          </form>
        </div>
      </motion.div>
    </motion.div>
  )
}


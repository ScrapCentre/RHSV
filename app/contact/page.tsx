"use client"

import React, { useState } from "react"
import { motion } from "framer-motion"
import {
  Phone,
  Mail,
  MapPin,
  Send,
  User,
  ShieldCheck,
  Sparkles,
  Loader2,
  AlertCircle
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Plus_Jakarta_Sans } from "next/font/google"
import LoadingScreen from "@/components/LoadingScreen"

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
})

export default function ContactPage() {
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    message: "",
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    if (!formData.name) newErrors.name = "Full Name is required"
    if (!formData.phone) newErrors.phone = "Phone number is required"
    if (!formData.message) newErrors.message = "Message detail is required"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    setIsSubmitting(true)
    await new Promise((resolve) => setTimeout(resolve, 2000))
    setIsSubmitting(false)
    alert("Message sent successfully!")
    setFormData({ name: "", phone: "", message: "" })
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev }
        delete next[field]
        return next
      })
    }
  }

  if (loading) {
    return <LoadingScreen onComplete={() => setLoading(false)} />
  }

  return (
    <div className={`min-h-screen bg-[#F8FAFC] relative overflow-hidden pt-28 pb-16 ${plusJakartaSans.className}`}>
      {/* Background Decorations */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
        <div className="absolute top-10 left-10 w-64 h-64 bg-red-500/5 rounded-full blur-3xl opacity-60"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-red-500/5 rounded-full blur-3xl opacity-40"></div>

        {/* Dotted Patterns */}
        <div className="absolute top-20 left-20 grid grid-cols-6 gap-2 opacity-5">
          {[...Array(36)].map((_, i) => (
            <div key={i} className="w-1 h-1 bg-slate-400 rounded-full"></div>
          ))}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 relative z-10">
        {/* Header Section */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 bg-white px-3 py-1.5 rounded-full mb-4 shadow-sm border border-slate-100"
          >
            <Sparkles size={12} className="text-[#E31E24]" />
            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-[#E31E24]">Get in Touch</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-3xl sm:text-4xl font-black text-slate-855 tracking-tight mb-4 uppercase leading-tight"
          >
            Let&apos;s Build Something <span className="text-[#E31E24]">Great Together</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-[11px] font-bold uppercase tracking-widest text-slate-400 max-w-md mx-auto leading-relaxed"
          >
            Have a project in mind? Our specialist team is ready to help you with instant vehicle solutions.
          </motion.p>
        </div>

        {/* Main Content: Split Panel */}
        <div className="flex flex-col lg:flex-row gap-6 max-w-4xl mx-auto">
          {/* Left Side: Contact Information Card */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
            className="lg:w-[38%] bg-gradient-to-br from-[#E31E24] to-[#8B0000] rounded-[1.8rem] p-8 text-white relative overflow-hidden shadow-xl"
          >
            <div className="relative z-10 h-full flex flex-col justify-between">
              <div className="mb-6">
                <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center mb-4">
                  <Phone size={20} className="text-white" />
                </div>
                <h2 className="text-2xl font-black uppercase tracking-tight leading-tight mb-3">Contact info</h2>
                <p className="text-red-100 text-[10px] font-semibold uppercase tracking-wider leading-normal">
                  Fill out the form and our team will get back to you within 24 hours.
                </p>
              </div>

              <div className="space-y-4 mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-white rounded-xl flex items-center justify-center shrink-0">
                    <Phone className="w-4 h-4 text-[#E31E24]" />
                  </div>
                  <div>
                    <p className="text-[8px] font-black text-red-200 uppercase tracking-widest">Call Us</p>
                    <p className="text-sm font-black text-white">+91-9839447733</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-white rounded-xl flex items-center justify-center shrink-0">
                    <Mail className="w-4 h-4 text-[#E31E24]" />
                  </div>
                  <div>
                    <p className="text-[8px] font-black text-red-200 uppercase tracking-widest">Email Us</p>
                    <p className="text-sm font-black text-white">contact@scrapcentre.com</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-white rounded-xl flex items-center justify-center shrink-0">
                    <MapPin className="w-4 h-4 text-[#E31E24]" />
                  </div>
                  <div>
                    <p className="text-[8px] font-black text-red-200 uppercase tracking-widest">Office</p>
                    <p className="text-xs font-black text-white leading-normal">21-E, Block Panki, Kanpur</p>
                  </div>
                </div>
              </div>

              {/* Trust Badge */}
              <div className="bg-white/10 border border-white/10 rounded-2xl p-3 flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 text-white shrink-0" />
                <p className="text-[8px] text-red-50 font-semibold leading-relaxed">Your data is safe and encrypted under high privacy standards.</p>
              </div>
            </div>
          </motion.div>

          {/* Right Side: Contact Form Card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
            className="lg:w-[62%] bg-white rounded-[1.8rem] p-6 lg:p-8 shadow-md border border-slate-100"
          >
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Full Name */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-800 uppercase tracking-wider ml-1">Full Name</label>
                <div className="relative group">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#E31E24] transition-colors w-4 h-4" />
                  <Input
                    className={`h-11 pl-10 bg-slate-50/50 border-slate-200/80 focus:bg-white transition-all rounded-xl focus:ring-4 focus:ring-red-500/5 focus:border-[#E31E24] text-xs font-semibold tracking-wide placeholder:text-slate-350 ${errors.name ? "border-red-500 bg-red-50" : ""}`}
                    placeholder="Rohit Sharma"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                  />
                </div>
                {errors.name && <p className="text-[9px] font-black text-red-500 flex items-center gap-1 mt-1 uppercase tracking-wider"><AlertCircle className="w-3 h-3" /> {errors.name}</p>}
              </div>

              {/* Phone Number */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-800 uppercase tracking-wider ml-1">Phone Number</label>
                <div className="relative group">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#E31E24] transition-colors w-4 h-4" />
                  <Input
                    className={`h-11 pl-10 bg-slate-50/50 border-slate-200/80 focus:bg-white transition-all rounded-xl focus:ring-4 focus:ring-red-500/5 focus:border-[#E31E24] text-xs font-semibold tracking-wide placeholder:text-slate-355 ${errors.phone ? "border-red-500 bg-red-50" : ""}`}
                    placeholder="+91 00000 00000"
                    value={formData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                  />
                </div>
                {errors.phone && <p className="text-[9px] font-black text-red-500 flex items-center gap-1 mt-1 uppercase tracking-wider"><AlertCircle className="w-3 h-3" /> {errors.phone}</p>}
              </div>

              {/* Message Detail */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-800 uppercase tracking-wider ml-1">Message Detail</label>
                <div className="relative group">
                  <div className="absolute left-3.5 top-3.5 text-slate-300 group-focus-within:text-[#E31E24] transition-colors">
                    <Send className="w-4 h-4 rotate-45" />
                  </div>
                  <Textarea
                    className={`min-h-[110px] pl-10 pt-3 bg-slate-50/50 border-slate-200/80 focus:bg-white transition-all rounded-xl focus:ring-4 focus:ring-red-500/5 focus:border-[#E31E24] text-xs font-semibold tracking-wide placeholder:text-slate-350 resize-none ${errors.message ? "border-red-500 bg-red-50" : ""}`}
                    placeholder="Tell us about your requirements..."
                    value={formData.message}
                    onChange={(e) => handleInputChange("message", e.target.value)}
                  />
                  <div className="absolute bottom-3 right-4 text-[8px] font-black text-slate-300 uppercase tracking-widest">
                    {formData.message.length} / 1000
                  </div>
                </div>
                {errors.message && <p className="text-[9px] font-black text-red-500 flex items-center gap-1 mt-1 uppercase tracking-wider"><AlertCircle className="w-3 h-3" /> {errors.message}</p>}
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-11 bg-[#E31E24] hover:bg-red-700 text-white font-black uppercase tracking-[0.15em] rounded-xl transition-all text-xs border-none shadow-md"
                >
                  {isSubmitting ? (
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Sending...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-2">
                      <Send className="w-4 h-4" />
                      <span>Send Message</span>
                    </div>
                  )}
                </Button>
                <div className="mt-3.5 flex items-center justify-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-wider">We typically respond within 24 hours</p>
                </div>
              </div>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

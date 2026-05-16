"use client"

import React, { useState } from "react"
import { motion } from "framer-motion"
import {
  Phone,
  Mail,
  MapPin,
  Send,
  User,
  MessageSquare,
  Sparkles,
  ShieldCheck,
  Clock,
  Users,
  Award,
  ExternalLink,
  Loader2,
  AlertCircle
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    subject: "",
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
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000))
    setIsSubmitting(false)
    alert("Message sent successfully!")
    setFormData({ name: "", phone: "", email: "", subject: "", message: "" })
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
    visible: { opacity: 1, y: 0 },
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] relative overflow-hidden pt-24 pb-20">
      {/* Background Decorations */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
        <div className="absolute top-10 left-10 w-64 h-64 bg-red-500/5 rounded-full blur-3xl opacity-60"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-red-500/5 rounded-full blur-3xl opacity-40"></div>

        {/* Dotted Patterns */}
        <div className="absolute top-20 left-20 grid grid-cols-6 gap-2 opacity-10">
          {[...Array(36)].map((_, i) => (
            <div key={i} className="w-1.5 h-1.5 bg-slate-400 rounded-full"></div>
          ))}
        </div>
        <div className="absolute top-20 right-20 grid grid-cols-6 gap-2 opacity-10">
          {[...Array(36)].map((_, i) => (
            <div key={i} className="w-1.5 h-1.5 bg-slate-400 rounded-full"></div>
          ))}
        </div>

        {/* Wave Lines Decoration */}
        <svg className="absolute top-1/3 right-0 w-1/4 opacity-[0.03] text-[#E31E24]" viewBox="0 0 100 100">
          <path d="M0,50 Q25,30 50,50 T100,50" fill="none" stroke="currentColor" strokeWidth="0.5" />
          <path d="M0,60 Q25,40 50,60 T100,60" fill="none" stroke="currentColor" strokeWidth="0.5" />
          <path d="M0,70 Q25,50 50,70 T100,70" fill="none" stroke="currentColor" strokeWidth="0.5" />
        </svg>
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Header Section */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-full mb-6 shadow-sm border border-slate-100"
          >
            <Sparkles size={14} className="text-[#E31E24]" />
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#E31E24]">Get in Touch</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-bebas text-slate-900 tracking-tight mb-6 uppercase leading-tight"
          >
            Let&apos;s Build Something <span className="bg-gradient-to-r from-[#E31E24] to-[#991b1b] bg-clip-text text-transparent">Great Together</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-[11px] sm:text-[12px] font-bold uppercase tracking-widest text-slate-400 max-w-2xl mx-auto leading-relaxed"
          >
            Have a project in mind? Our team is ready to help you with professional industrial solutions tailored to your needs.
          </motion.p>
        </div>

        {/* Main Content: Split Panel */}
        <div className="flex flex-col lg:flex-row gap-8 max-w-6xl mx-auto mb-20">
          {/* Left Side: Contact Information Card */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="lg:w-[35%] bg-gradient-to-br from-[#E31E24] to-[#8B0000] rounded-[2.5rem] p-10 text-white relative overflow-hidden shadow-2xl shadow-red-900/20"
          >
            {/* Geometric Patterns */}
            <div className="absolute top-0 right-0 w-full h-full opacity-[0.07] pointer-events-none">
              <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                <path d="M0,0 L100,0 L100,100 Z" fill="white" />
                <circle cx="20" cy="20" r="10" fill="white" />
                <circle cx="80" cy="80" r="15" fill="white" />
              </svg>
            </div>

            <div className="relative z-10 h-full flex flex-col">
              <div className="mb-10">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mb-6">
                  <Phone size={24} className="text-white" />
                </div>
                <h2 className="text-3xl font-bebas uppercase tracking-tight leading-tight mb-4">Contact <br />Information</h2>
                <p className="text-red-100 text-[10px] font-medium uppercase tracking-wider leading-relaxed max-w-[200px]">
                  Fill out the form and our specialist team will get back to you within 24 business hours.
                </p>
              </div>

              <div className="space-y-6 mb-16">
                <div className="flex items-center gap-5 group cursor-pointer">
                  <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg shadow-black/10">
                    <Phone className="w-5 h-5 text-[#E31E24]" />
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-red-200 uppercase tracking-widest mb-0.5">Call Us</p>
                    <p className="text-white font-bebas text-xl tracking-wide">+91-9839447733</p>
                  </div>
                </div>

                <div className="flex items-center gap-5 group cursor-pointer">
                  <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg shadow-black/10">
                    <Mail className="w-5 h-5 text-[#E31E24]" />
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-red-200 uppercase tracking-widest mb-0.5">Email Us</p>
                    <p className="text-white font-bebas text-xl tracking-wide">contact@scrapcentre.com</p>
                  </div>
                </div>

                <div className="flex items-center gap-5 group cursor-pointer">
                  <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg shadow-black/10">
                    <MapPin className="w-5 h-5 text-[#E31E24]" />
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-red-200 uppercase tracking-widest mb-0.5">Our Office</p>
                    <p className="text-white font-bebas text-xl tracking-wide leading-tight">21-E, Block Panki,<br />Kanpur, 208020</p>
                  </div>
                </div>
              </div>

              {/* Glassmorphism Trust Card */}
              <div className="mt-auto bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-5 flex items-center gap-4 shadow-xl">
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-6 h-6 text-[#E31E24]" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-white uppercase tracking-wider mb-1">We value your trust</p>
                  <p className="text-[8px] text-red-100 font-medium leading-relaxed">Your information is safe with us. We never share your details.</p>
                </div>
              </div>
            </div>

            {/* Industrial Background Decor */}
            <div className="absolute bottom-0 right-0 w-full h-32 opacity-[0.05] pointer-events-none">
              <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                <path d="M0,100 L10,80 L20,90 L30,60 L40,80 L50,50 L60,80 L70,70 L80,90 L90,60 L100,100 Z" fill="white" />
              </svg>
            </div>
          </motion.div>

          {/* Right Side: Contact Form Card */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="lg:w-[65%] bg-white rounded-[2.5rem] p-10 lg:p-12 shadow-[0_20px_70px_rgba(0,0,0,0.04)] border border-slate-100"
          >
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-900 uppercase tracking-widest ml-1">Full Name</label>
                  <div className="relative group">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#E31E24] transition-colors w-4 h-4" />
                    <Input
                      className={`h-12 pl-12 bg-slate-50/50 border-slate-100 focus:bg-white transition-all rounded-xl focus:ring-4 focus:ring-red-500/5 focus:border-[#E31E24] text-sm font-medium tracking-wide placeholder:text-slate-300 ${errors.name ? "border-red-500 bg-red-50" : ""}`}
                      placeholder="Rohit Sharma"
                      value={formData.name}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                    />
                  </div>
                  {errors.name && <p className="text-[9px] font-bold text-red-500 flex items-center gap-1 mt-1 uppercase tracking-wider"><AlertCircle className="w-3 h-3" /> {errors.name}</p>}
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-900 uppercase tracking-widest ml-1">Phone Number</label>
                  <div className="relative group">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#E31E24] transition-colors w-4 h-4" />
                    <Input
                      className={`h-12 pl-12 bg-slate-50/50 border-slate-100 focus:bg-white transition-all rounded-xl focus:ring-4 focus:ring-red-500/5 focus:border-[#E31E24] text-sm font-medium tracking-wide placeholder:text-slate-300 ${errors.phone ? "border-red-500 bg-red-50" : ""}`}
                      placeholder="+91 00000 00000"
                      value={formData.phone}
                      onChange={(e) => handleInputChange("phone", e.target.value)}
                    />
                  </div>
                  {errors.phone && <p className="text-[9px] font-bold text-red-500 flex items-center gap-1 mt-1 uppercase tracking-wider"><AlertCircle className="w-3 h-3" /> {errors.phone}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-900 uppercase tracking-widest ml-1">Email Address</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#E31E24] transition-colors w-4 h-4" />
                  <Input
                    className={`h-12 pl-12 bg-slate-50/50 border-slate-100 focus:bg-white transition-all rounded-xl focus:ring-4 focus:ring-red-500/5 focus:border-[#E31E24] text-sm font-medium tracking-wide placeholder:text-slate-300 ${errors.email ? "border-red-500 bg-red-50" : ""}`}
                    placeholder="email@company.com"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                  />
                </div>
                {errors.email && <p className="text-[9px] font-bold text-red-500 flex items-center gap-1 mt-1 uppercase tracking-wider"><AlertCircle className="w-3 h-3" /> {errors.email}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-900 uppercase tracking-widest ml-1">Subject / Inquiry Type</label>
                <div className="relative group">
                  <MessageSquare className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#E31E24] transition-colors w-4 h-4" />
                  <Input
                    className={`h-12 pl-12 bg-slate-50/50 border-slate-100 focus:bg-white transition-all rounded-xl focus:ring-4 focus:ring-red-500/5 focus:border-[#E31E24] text-sm font-medium tracking-wide placeholder:text-slate-300 ${errors.subject ? "border-red-500 bg-red-50" : ""}`}
                    placeholder="How can we help you today?"
                    value={formData.subject}
                    onChange={(e) => handleInputChange("subject", e.target.value)}
                  />
                </div>
                {errors.subject && <p className="text-[9px] font-bold text-red-500 flex items-center gap-1 mt-1 uppercase tracking-wider"><AlertCircle className="w-3 h-3" /> {errors.subject}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-900 uppercase tracking-widest ml-1">Message Detail</label>
                <div className="relative group">
                  <div className="absolute left-4 top-4 text-slate-300 group-focus-within:text-[#E31E24] transition-colors">
                    <Send className="w-4 h-4 rotate-45" />
                  </div>
                  <Textarea
                    className={`min-h-[140px] pl-12 pt-4 bg-slate-50/50 border-slate-100 focus:bg-white transition-all rounded-xl focus:ring-4 focus:ring-red-500/5 focus:border-[#E31E24] text-sm font-medium tracking-wide placeholder:text-slate-300 resize-none ${errors.message ? "border-red-500 bg-red-50" : ""}`}
                    placeholder="Tell us about your requirements..."
                    value={formData.message}
                    onChange={(e) => handleInputChange("message", e.target.value)}
                  />
                  <div className="absolute bottom-3 right-4 text-[8px] font-black text-slate-300 uppercase tracking-widest">
                    {formData.message.length} / 1000
                  </div>
                </div>
                {errors.message && <p className="text-[9px] font-bold text-red-500 flex items-center gap-1 mt-1 uppercase tracking-wider"><AlertCircle className="w-3 h-3" /> {errors.message}</p>}
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-14 bg-gradient-to-r from-[#E31E24] to-[#c41a1f] hover:shadow-lg hover:shadow-red-500/30 text-white font-bebas tracking-[0.2em] rounded-xl transform hover:-translate-y-1 transition-all text-xl relative overflow-hidden group border-none shadow-xl shadow-red-500/20"
                >
                  <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                  {isSubmitting ? (
                    <div className="flex items-center justify-center gap-3 relative z-10">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Transmitting...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-3 relative z-10">
                      <Send className="w-5 h-5" />
                      <span>Send Message</span>
                    </div>
                  )}
                </Button>
                <div className="mt-4 flex items-center justify-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-slate-400" />
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">We typically respond within 24 hours</p>
                </div>
              </div>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

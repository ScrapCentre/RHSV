"use client"

import type React from "react"
import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  MapPin,
  Phone,
  Mail,
  Send,
  CheckCircle,
  AlertCircle,
  Loader2,
  User,
  MessageSquare,
  Sparkles,
  ExternalLink,
} from "lucide-react"

interface FormData {
  name: string
  email: string
  phone: string
  subject: string
  message: string
}

interface FormErrors {
  name?: string
  email?: string
  phone?: string
  subject?: string
  message?: string
}

export default function ContactPage() {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  })

  const [errors, setErrors] = useState<FormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  // Animation Variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring" as const,
        stiffness: 100,
        damping: 15
      }
    }
  }

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = "Name is required"
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters"
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!formData.email.trim()) {
      newErrors.email = "Email is required"
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = "Please enter a valid email address"
    }

    // Phone validation
    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required"
    }

    // Subject validation
    if (!formData.subject.trim()) {
      newErrors.subject = "Subject is required"
    }

    // Message validation
    if (!formData.message.trim()) {
      newErrors.message = "Message is required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error("Failed to submit form")
      }

      setIsSubmitted(true)
      setFormData({
        name: "",
        email: "",
        phone: "",
        subject: "",
        message: "",
      })
    } catch (error) {
      console.error("Error submitting form:", error)
      // You might want to set a global error state here to show a toast/alert
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-white">
        <div className="pt-24 pb-12 sm:pt-32 min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="text-center w-full max-w-lg"
          >
            <div className="bg-white border border-slate-100 rounded-3xl p-8 sm:p-12 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400"></div>

              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring" }}
                className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6"
              >
                <CheckCircle className="w-10 h-10 text-emerald-500" />
              </motion.div>

              <h2 className="text-3xl font-bold text-slate-900 mb-4">Message Sent!</h2>

              <p className="text-slate-600 mb-8 text-lg">
                Thank you for reaching out. We will get back to you shortly.
              </p>

              <Button
                onClick={() => setIsSubmitted(false)}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 rounded-xl transition-all shadow-lg hover:shadow-emerald-500/30"
              >
                <Send className="w-4 h-4 mr-2" />
                Send Another Message
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0E192D] font-sans text-slate-900 selection:bg-emerald-100 selection:text-emerald-900 flex flex-col">
      {/* Navbar Placeholder */}
      <div className="h-20"></div>

      {/* Decorative Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-emerald-100/40 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-[800px] h-[800px] bg-blue-100/40 rounded-full blur-[120px] translate-y-1/2 -translate-x-1/2"></div>
      </div>

      <div className="flex-grow flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8 relative z-10 space-y-8">

        <div className="text-center max-w-2xl mx-auto mb-4 mt-12">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight mb-4"
          >
            Let's Start a <span className="text-emerald-400">Conversation</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg text-slate-400"
          >
            Have a question or need assistance? We're here to help you every step of the way.
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="bg-white rounded-[32px] shadow-2xl shadow-slate-900/50 overflow-hidden flex flex-col lg:flex-row w-full max-w-6xl border border-white/10"
        >
          {/* Left Panel: Contact Info */}
          <div className="lg:w-2/5 bg-[#0E192D] relative p-10 text-white flex flex-col justify-between overflow-hidden">
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-10">
              <svg className="h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                <path d="M0 100 C 20 0 50 0 100 100 Z" fill="currentColor" />
              </svg>
            </div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>

            <div className="relative z-10">
              <h3 className="text-2xl font-bold mb-6">Contact Information</h3>
              <p className="text-slate-300 mb-10 text-sm leading-relaxed">
                Fill out the form and our team will get back to you within 24 hours.
              </p>

              <div className="space-y-6">
                <a href="tel:+919839447733" className="flex items-start gap-4 p-4 rounded-xl hover:bg-white/5 transition-colors group">
                  <div className="w-10 h-10 bg-emerald-500/10 rounded-full flex items-center justify-center group-hover:bg-emerald-500/20 transition-colors">
                    <Phone className="w-5 h-5 text-emerald-400 py-0.5" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Phone</p>
                    <p className="text-white font-medium">+91-9839447733</p>
                  </div>
                </a>

                <a href="mailto:contact@scrapcentre.com" className="flex items-start gap-4 p-4 rounded-xl hover:bg-white/5 transition-colors group">
                  <div className="w-10 h-10 bg-emerald-500/10 rounded-full flex items-center justify-center group-hover:bg-emerald-500/20 transition-colors">
                    <Mail className="w-5 h-5 text-emerald-400 py-0.5" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Email</p>
                    <p className="text-white font-medium">contact@scrapcentre.com</p>
                  </div>
                </a>

                <div className="flex items-start gap-4 p-4 rounded-xl hover:bg-white/5 transition-colors group">
                  <div className="w-10 h-10 bg-emerald-500/10 rounded-full flex items-center justify-center group-hover:bg-emerald-500/20 transition-colors">
                    <MapPin className="w-5 h-5 text-emerald-400 py-0.5" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Office</p>
                    <p className="text-white font-medium">21-E, Block Panki,<br />Kanpur, 208020</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative z-10 mt-12 flex gap-4">
              {/* Social placeholders or extra info could go here */}
              <div className="text-xs text-slate-500">
                &copy; 2026 ScrapCenter. All rights reserved.
              </div>
            </div>
          </div>

          {/* Right Panel: Form */}
          <div className="lg:w-3/5 bg-white p-8 sm:p-12 lg:p-14">
            <motion.form
              onSubmit={handleSubmit}
              className="space-y-6"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <motion.div variants={itemVariants} className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 ml-1">Full Name</label>
                  <Input
                    className={`h-12 bg-slate-50 border-slate-200 focus:bg-white transition-all rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-base ${errors.name ? "border-red-500 bg-red-50" : ""}`}
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                  />
                  {errors.name && <p className="text-xs text-red-500 flex items-center gap-1 mt-1"><AlertCircle className="w-3 h-3" /> {errors.name}</p>}
                </motion.div>

                <motion.div variants={itemVariants} className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 ml-1">Phone Number</label>
                  <Input
                    className={`h-12 bg-slate-50 border-slate-200 focus:bg-white transition-all rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-base ${errors.phone ? "border-red-500 bg-red-50" : ""}`}
                    placeholder="+91 98765 43210"
                    value={formData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                  />
                  {errors.phone && <p className="text-xs text-red-500 flex items-center gap-1 mt-1"><AlertCircle className="w-3 h-3" /> {errors.phone}</p>}
                </motion.div>
              </div>

              <motion.div variants={itemVariants} className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 ml-1">Email Address</label>
                <Input
                  className={`h-12 bg-slate-50 border-slate-200 focus:bg-white transition-all rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-base ${errors.email ? "border-red-500 bg-red-50" : ""}`}
                  placeholder="john@example.com"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                />
                {errors.email && <p className="text-xs text-red-500 flex items-center gap-1 mt-1"><AlertCircle className="w-3 h-3" /> {errors.email}</p>}
              </motion.div>

              <motion.div variants={itemVariants} className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 ml-1">Subject</label>
                <Input
                  className={`h-12 bg-slate-50 border-slate-200 focus:bg-white transition-all rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-base ${errors.subject ? "border-red-500 bg-red-50" : ""}`}
                  placeholder="How can we help?"
                  value={formData.subject}
                  onChange={(e) => handleInputChange("subject", e.target.value)}
                />
                {errors.subject && <p className="text-xs text-red-500 flex items-center gap-1 mt-1"><AlertCircle className="w-3 h-3" /> {errors.subject}</p>}
              </motion.div>

              <motion.div variants={itemVariants} className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 ml-1">Message</label>
                <Textarea
                  className={`min-h-[120px] bg-slate-50 border-slate-200 focus:bg-white transition-all rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-base resize-none ${errors.message ? "border-red-500 bg-red-50" : ""}`}
                  placeholder="Tell us about your requirements..."
                  value={formData.message}
                  onChange={(e) => handleInputChange("message", e.target.value)}
                />
                {errors.message && <p className="text-xs text-red-500 flex items-center gap-1 mt-1"><AlertCircle className="w-3 h-3" /> {errors.message}</p>}
              </motion.div>

              <motion.div variants={itemVariants} className="pt-2">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-12 bg-[#0E192D] hover:bg-slate-800 text-white font-bold rounded-xl shadow-lg shadow-slate-900/20 transform hover:-translate-y-0.5 transition-all text-base"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin mr-2" />
                      Sending...
                    </>
                  ) : (
                    <>
                      Send Message <Send className="w-5 h-5 ml-2" />
                    </>
                  )}
                </Button>
              </motion.div>
            </motion.form>
          </div>
        </motion.div>

        {/* Map Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          className="w-full max-w-6xl mt-8 bg-[#0E192D] rounded-[32px] p-2 sm:p-4 border border-emerald-500/20 shadow-2xl shadow-emerald-900/20"
        >
          <div className="w-full h-[350px] sm:h-[400px] rounded-[24px] overflow-hidden relative group">
            <iframe
              title="Office Location Map"
              src="https://maps.google.com/maps?q=21-E,%20Block%20Panki,%20Kanpur,%20208020&t=&z=15&ie=UTF8&iwloc=&output=embed"
              width="100%"
              height="100%"
              className="absolute inset-0 grayscale-[15%] group-hover:grayscale-0 transition-all duration-500"
              style={{ border: 0 }}
              allowFullScreen={false}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>
        </motion.div>

      </div>
    </div>
  )
}


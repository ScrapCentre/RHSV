"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { useRouter, useParams } from "next/navigation"
import { ArrowRight, ShieldCheck } from "lucide-react"

export default function FinalCtaSection() {
  const router = useRouter()
  const params = useParams()
  const isHindi = params?.locale === "hi"

  const [regNumber, setRegNumber] = useState("")
  const [mobileNumber, setMobileNumber] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const query = new URLSearchParams()
    if (regNumber) query.set("reg", regNumber)
    if (mobileNumber) query.set("phone", mobileNumber)
    const targetPath = isHindi ? `/hi/know-your-valuation?${query.toString()}` : `/know-your-valuation?${query.toString()}`
    router.push(targetPath)
  }

  return (
    <section className="py-10 sm:py-14 lg:py-16 bg-white text-white overflow-hidden relative">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 35, scale: 0.98 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] as const }}
          className="relative rounded-[2rem] md:rounded-[2.5rem] bg-[#D33D2A] p-8 sm:p-12 lg:p-16 shadow-[0_25px_60px_-15px_rgba(211,61,42,0.35)] overflow-hidden"
        >
          {/* Decorative Subtle Background Accents */}
          <div className="absolute top-0 right-0 -translate-y-12 translate-x-12 w-80 h-80 rounded-full bg-white/10 blur-2xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 translate-y-12 -translate-x-12 w-80 h-80 rounded-full bg-black/10 blur-2xl pointer-events-none" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Content Column */}
            <div className="lg:col-span-7 text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-sm text-white text-[11px] font-extrabold uppercase tracking-widest mb-6 border border-white/20">
                <ShieldCheck size={14} className="text-white" />
                {isHindi ? "तेज और मुफ्त वैल्यूएशन" : "FAST & FREE VALUATION"}
              </div>

              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-[1.15] mb-5">
                {isHindi
                  ? "क्या आप सही तरीके से अपना वाहन स्क्रैप करने के लिए तैयार हैं?"
                  : "Ready to scrap your vehicle the right way?"}
              </h2>

              <p className="text-white/90 text-sm sm:text-base lg:text-lg font-medium leading-relaxed max-w-xl">
                {isHindi
                  ? "मुफ्त वैल्यूएशन, मुफ्त पिकअप, जमा प्रमाणपत्र (COD) — अपने वाहन नंबर से शुरू करें।"
                  : "Free valuation, free pickup, Certificate of Deposit — start with your vehicle number."}
              </p>
            </div>

            {/* Right Form Column */}
            <div className="lg:col-span-5">
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Vehicle Registration Number Input */}
                <div>
                  <input
                    type="text"
                    value={regNumber}
                    onChange={(e) => setRegNumber(e.target.value)}
                    placeholder={isHindi ? "वाहन पंजीकरण संख्या (उदा. DL01AB1234)" : "Vehicle registration number"}
                    className="w-full px-5 py-4 rounded-xl bg-white/15 border border-white/30 text-white placeholder:text-white/70 focus:outline-none focus:ring-2 focus:ring-white font-semibold text-sm sm:text-base transition-all duration-300"
                    required
                  />
                </div>

                {/* Mobile Number Input */}
                <div>
                  <input
                    type="tel"
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(e.target.value)}
                    placeholder={isHindi ? "मोबाइल नंबर" : "Mobile number"}
                    className="w-full px-5 py-4 rounded-xl bg-white/15 border border-white/30 text-white placeholder:text-white/70 focus:outline-none focus:ring-2 focus:ring-white font-semibold text-sm sm:text-base transition-all duration-300"
                    required
                  />
                </div>

                {/* Submit CTA Button */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  className="w-full py-4 px-6 rounded-full bg-white text-[#D33D2A] hover:bg-black hover:text-white text-base font-extrabold transition-all duration-300 shadow-xl flex items-center justify-center gap-2 group cursor-pointer"
                >
                  <span>{isHindi ? "मुफ्त कोट प्राप्त करें" : "Get My Free Quote"}</span>
                  <ArrowRight size={18} className="group-hover:translate-x-1.5 transition-transform duration-300" />
                </motion.button>
              </form>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

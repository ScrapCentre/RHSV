"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { useRouter, useParams } from "next/navigation"
import { ArrowRight, ShieldCheck, CheckCircle2, Car, Loader2 } from "lucide-react"
import { lookupVehicle } from "@/app/actions"

export default function FinalCtaSection() {
  const router = useRouter()
  const params = useParams()
  const isHindi = params?.locale === "hi"

  const [regNumber, setRegNumber] = useState("")
  const [isFetching, setIsFetching] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!regNumber || regNumber.trim().length < 4) return
    const cleanReg = regNumber.replace(/[^a-zA-Z0-9]/g, "").toUpperCase()

    setIsFetching(true)

    try {
      const rawData = await lookupVehicle(cleanReg)
      if (rawData && !rawData.error) {
        const data = rawData?.data?.client_id ? rawData.data : rawData
        const addressString = data.present_address || data.permanent_address || ""
        const pincodeMatch = addressString.match(/\b\d{6}\b/)
        const pincode = pincodeMatch ? pincodeMatch[0] : ""

        const vehicleInfo = {
          regNo: cleanReg,
          brand: data.maker_description || data.maker_name || data.maker || data.rc_maker || "",
          model: data.model_description || data.model_name || data.maker_model || data.model || data.rc_model || data.rc_model_name || "",
          year: data.registration_date ? data.registration_date.split('-')[0] : data.manufacturing_year || "",
          weight: data.vehicle_weight || data.unladen_weight || "",
          fuel: data.fuel_type || "",
          ownerName: data.owner_name || data.owner || "",
          address: addressString,
          pincode: pincode,
        }
        window.dispatchEvent(new CustomEvent("hero-vehicle-data", { detail: vehicleInfo }))
      }
    } catch (err) {
      console.error("Vehicle lookup error in FinalCtaSection:", err)
    } finally {
      setIsFetching(false)
      const targetPath = isHindi
        ? `/hi/know-your-valuation?reg=${encodeURIComponent(cleanReg)}`
        : `/know-your-valuation?reg=${encodeURIComponent(cleanReg)}`
      router.push(targetPath)
    }
  }

  const benefits = [
    {
      en: "Authorised RVSF process",
      hi: "अधिकृत RVSF प्रक्रिया",
    },
    {
      en: "Free doorstep pickup",
      hi: "मुफ्त डोरस्टेप पिकअप",
    },
    {
      en: "Instant payment",
      hi: "तुरंत भुगतान",
    },
  ]

  return (
    <section className="py-10 sm:py-14 lg:py-16 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white overflow-hidden relative border-t border-slate-200/80 dark:border-slate-800">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.98 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] as const }}
          className="relative rounded-3xl md:rounded-[2.5rem] bg-gradient-to-br from-[#E31E24] via-[#CD1B21] to-[#9E1116] p-6 sm:p-10 lg:p-14 shadow-2xl overflow-hidden"
        >
          {/* Decorative Background Elements */}
          <div className="absolute top-0 right-0 -translate-y-12 translate-x-12 w-96 h-96 rounded-full bg-white/10 blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 translate-y-12 -translate-x-12 w-96 h-96 rounded-full bg-black/20 blur-3xl pointer-events-none" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Content Column */}
            <div className="lg:col-span-7 text-left space-y-5">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/15 backdrop-blur-md text-white text-xs font-bold uppercase tracking-wider border border-white/20">
                <ShieldCheck size={16} className="text-white shrink-0" />
                <span>{isHindi ? "फास्ट और फ्री वैल्यूएशन" : "FAST & FREE VALUATION"}</span>
              </div>

              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-[1.15]">
                {isHindi
                  ? "आज ही शुरू करें — स्क्रैपसेंटर के साथ अपना वाहन स्क्रैप करें"
                  : "Get Started — Scrap Your Vehicle with ScrapCentre Today"}
              </h2>

              <p className="text-white/90 text-sm sm:text-base lg:text-lg font-medium leading-relaxed max-w-xl">
                {isHindi
                  ? "एक अधिकृत RVSF के माध्यम से मुफ्त मूल्यांकन, मुफ्त डोरस्टेप पिकअप और जमा प्रमाणपत्र (COD) के साथ सही तरीके से अपने वाहन को स्क्रैप करना शुरू करें।"
                  : "Start scrapping your vehicle the right way with a free valuation, free doorstep pickup and Certificate of Deposit (COD) through an authorised RVSF."}
              </p>

              {/* 3 Key Benefits List */}
              <div className="pt-2 flex flex-wrap gap-3 sm:gap-4">
                {benefits.map((b, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 bg-black/20 backdrop-blur-md px-3.5 py-2 rounded-xl border border-white/15 text-white text-xs sm:text-sm font-semibold"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>{isHindi ? b.hi : b.en}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Form Card */}
            <div className="lg:col-span-5">
              <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-2xl md:rounded-3xl shadow-2xl border border-white/20 dark:border-slate-800 text-slate-900 dark:text-white">
                <h3 className="text-lg sm:text-xl font-bold mb-5 text-slate-900 dark:text-white">
                  {isHindi ? "निःशुल्क वाहन मूल्यांकन प्राप्त करें" : "Get Your Free Vehicle Valuation"}
                </h3>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Vehicle Number Input */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5 text-left">
                      {isHindi ? "वाहन संख्या" : "Vehicle Number"}
                    </label>
                    <div className="relative">
                      <Car className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={regNumber}
                        onChange={(e) => setRegNumber(e.target.value.toUpperCase())}
                        placeholder={
                          isHindi
                            ? "अपनी वाहन पंजीकरण संख्या दर्ज करें"
                            : "Enter your vehicle registration number"
                        }
                        className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-[#E31E24] transition-all"
                        required
                      />
                    </div>
                  </div>

                  {/* Submit CTA Button */}
                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    type="submit"
                    disabled={isFetching}
                    className="w-full mt-2 py-4 px-6 rounded-xl bg-[#E31E24] hover:bg-[#c8191e] text-white text-sm sm:text-base font-bold transition-all duration-200 shadow-lg shadow-red-600/30 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75"
                  >
                    {isFetching ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>{isHindi ? "खोज रहे हैं..." : "Fetching Vehicle Info..."}</span>
                      </>
                    ) : (
                      <>
                        <span>
                          {isHindi
                            ? "निःशुल्क वाहन मूल्यांकन प्राप्त करें"
                            : "Get Your Free Vehicle Valuation"}
                        </span>
                        <ArrowRight size={18} />
                      </>
                    )}
                  </motion.button>
                </form>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

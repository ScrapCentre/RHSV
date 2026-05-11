"use client"

/**
 * HeroSection — ScrapCentre.com
 * NEW component — replaces HomexHero (537L carousel deleted per design-system §6).
 * Calculator-forward hero with brand-red background.
 * Fade-in entrance via Framer Motion (design-system §4.1 — no canvas, no GSAP).
 * Used by: app/page.tsx
 *
 * Props:
 *   onGetValue: (regNumber?: string) => void  — routes to calculator
 */

import { useState } from "react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Car, Bike, Truck, ChevronRight, Search } from "lucide-react"
import TrustBar from "@/components/TrustBar"

const VEHICLE_TYPES = [
  { label: "Car", value: "car", Icon: Car },
  { label: "Bike", value: "bike", Icon: Bike },
  { label: "Truck / Commercial", value: "truck", Icon: Truck },
]

/** Basic Indian registration number regex: XX00AA0000 style */
const REG_REGEX = /^[A-Z]{2}\d{2}[A-Z]{0,3}\d{1,4}$/i

export default function HeroSection() {
  const router = useRouter()
  const [regNumber, setRegNumber] = useState("")
  const [selectedType, setSelectedType] = useState<string | null>(null)
  const [regError, setRegError] = useState("")

  const handleGetValue = () => {
    const cleaned = regNumber.replace(/\s/g, "").toUpperCase()
    if (cleaned && !REG_REGEX.test(cleaned)) {
      setRegError(
        "That doesn't look like a valid Indian registration. Try the format: XX00 AA 0000"
      )
      return
    }
    setRegError("")
    const params = new URLSearchParams()
    params.set("type", "A")
    if (cleaned) params.set("reg", cleaned)
    if (selectedType) params.set("vehicle", selectedType)
    router.push(`/calculator?${params.toString()}`)
  }

  return (
    <section
      className="bg-[var(--brand-red)] text-white py-16 md:py-20"
      aria-label="Calculate your vehicle's scrap value"
    >
      <div className="max-w-6xl mx-auto px-4 md:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">

          {/* ── Left column: headline + entry ── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="space-y-6"
          >
            <h1 className="text-4xl md:text-6xl font-extrabold leading-[1.1] text-white">
              Don&apos;t let the kabadi steal{" "}
              <span className="underline decoration-white/50 underline-offset-4">₹70,000</span>{" "}
              from you.
            </h1>

            <p className="text-lg md:text-xl text-white/90 leading-relaxed">
              Your old vehicle has government-backed value. We calculate the exact number — for free.
            </p>

            {/* Registration input */}
            <div className="space-y-2">
              <label
                htmlFor="reg-input"
                className="block text-sm font-semibold text-white/90"
              >
                Vehicle registration number
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Input
                    id="reg-input"
                    value={regNumber}
                    onChange={(e) => {
                      setRegNumber(e.target.value.toUpperCase())
                      setRegError("")
                    }}
                    placeholder="UP32 AB 1234"
                    className="h-14 text-base bg-white text-[var(--brand-black)] placeholder:text-[var(--brand-gray-500)] border-0 pr-4 font-medium"
                    aria-label="Enter vehicle registration number"
                    aria-describedby={regError ? "reg-error" : "reg-helper"}
                    autoCapitalize="characters"
                    autoCorrect="off"
                    spellCheck={false}
                    inputMode="text"
                    maxLength={11}
                  />
                </div>
                <Button
                  onClick={handleGetValue}
                  className="h-14 px-6 text-base font-semibold bg-[var(--brand-black)] hover:bg-[var(--brand-gray-900)] text-white whitespace-nowrap"
                  aria-label="Get my vehicle's value"
                >
                  <Search className="w-4 h-4 mr-2 md:hidden" aria-hidden="true" />
                  <span className="hidden md:inline">Get My Vehicle&apos;s Value →</span>
                  <span className="md:hidden">Search</span>
                </Button>
              </div>

              {regError ? (
                <p id="reg-error" className="text-xs text-yellow-200 font-medium" role="alert">
                  {regError}
                </p>
              ) : (
                <p id="reg-helper" className="text-xs text-white/70">
                  We look up your vehicle details automatically.
                </p>
              )}
            </div>

            {/* Vehicle type pills (design-system §4.1) */}
            <div className="space-y-2">
              <p className="text-sm font-medium text-white/80">— or select your vehicle type —</p>
              <div className="flex gap-2 flex-wrap">
                {VEHICLE_TYPES.map(({ label, value, Icon }) => (
                  <button
                    key={value}
                    onClick={() => {
                      setSelectedType(selectedType === value ? null : value)
                    }}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border-2 transition-colors ${
                      selectedType === value
                        ? "bg-white text-[var(--brand-red)] border-white"
                        : "bg-transparent text-white border-white/50 hover:border-white hover:bg-white/10"
                    }`}
                    aria-pressed={selectedType === value}
                    aria-label={`Select ${label}`}
                  >
                    <Icon className="w-4 h-4" aria-hidden="true" />
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Fallback link (design-system §4.1) */}
            <button
              onClick={() => router.push("/calculator?type=A")}
              className="text-sm text-white/70 underline hover:text-white transition-colors text-left"
            >
              Don&apos;t have the registration number? Select your vehicle manually →
            </button>
          </motion.div>

          {/* ── Right column: trust signals (desktop) ── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut", delay: 0.1 }}
            className="hidden md:flex flex-col gap-6"
          >
            <div className="bg-white/10 rounded-2xl p-6 space-y-4">
              <p className="text-sm font-semibold text-white/80 uppercase tracking-wider">
                Example: 2010 Honda City
              </p>
              <p className="text-6xl font-extrabold leading-none text-white">
                ₹87,400
              </p>
              <p className="text-sm text-white/70">
                vs. kabadi offer: ~₹12,000. That&apos;s ₹75,400 more.
              </p>
              <div className="text-xs text-white/60 border-t border-white/20 pt-3">
                Scrap value ₹24,500 + CD benefit ₹52,000 + road tax ₹8,400 + dealer est. ₹2,500
              </div>
            </div>

            {/* Mobile CTA button (appears here only on desktop right panel) */}
            <Button
              onClick={handleGetValue}
              className="w-full h-14 text-base font-semibold bg-white text-[var(--brand-red)] hover:bg-[var(--brand-red-xlight)] font-bold shadow-lg"
              aria-label="Get my vehicle's value"
            >
              Get My Vehicle&apos;s Value →
              <ChevronRight className="w-4 h-4 ml-1" aria-hidden="true" />
            </Button>

            {/* [HINDI: कबाड़ी को मत दें। हम ज़्यादा देते हैं।] */}
          </motion.div>
        </div>

        {/* ── Trust bar (below hero on mobile, full-width) ── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="mt-10 pt-8 border-t border-white/20"
        >
          <TrustBar
            items={[
              "Government-authorised RVSF",
              "4,200+ vehicles scrapped",
              "Free pickup within 48 hrs",
            ]}
            className="text-white [&_span]:text-white [&_svg]:text-white"
          />
        </motion.div>
      </div>
    </section>
  )
}

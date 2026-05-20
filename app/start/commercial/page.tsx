"use client"

/**
 * /start/commercial — Commercial / Fleet Enquiry Page — ScrapCentre.com
 * NEW page per engineering-design §13, design-system §4.4.
 * Handles commercial vehicle owners and fleet submissions.
 * POSTs to /api/fleet-enquiry (stub endpoint — shows success toast).
 * TODO[fullstack-dev]: wire POST /api/fleet-enquiry — Backend Dev needs to add this
 *   endpoint (commercial leads go directly to Auraiya team, not the calculator flow).
 */

import { useState } from "react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
import { Loader2, CheckCircle } from "lucide-react"

type FleetSize = "1" | "2-10" | "10+"
type VehicleType = "Truck" | "Bus" | "Auto" | "LCV"

export default function CommercialPage() {
  const { toast } = useToast()

  const [fleetSize, setFleetSize] = useState<FleetSize | null>(null)
  const [vehicleType, setVehicleType] = useState<VehicleType | null>(null)
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [company, setCompany] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!fleetSize || !vehicleType || !name.trim() || !phone.trim()) {
      toast({
        title: "Missing details",
        description: "Please fill in all required fields.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)
    try {
      // TODO[fullstack-dev]: Backend Dev to implement POST /api/fleet-enquiry.
      // Shape: { name, phone, company, fleetSize, vehicleType }
      // For now, simulate a 600ms network call then show success.
      await new Promise((r) => setTimeout(r, 600))
      setSubmitted(true)
      toast({
        title: "Request submitted",
        description: "Our team will call you within 4 hours with a tailored quote.",
      })
    } catch {
      toast({
        title: "Something went wrong",
        description: "Please try again or call 9839447733.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-[var(--brand-bg)] flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center space-y-4">
          <CheckCircle className="w-16 h-16 text-[var(--status-success)] mx-auto" />
          <h1 className="text-2xl font-bold text-[var(--brand-black)]">Done.</h1>
          <p className="text-[var(--brand-gray-700)]">
            Our team will call you within 4 hours with a tailored quote.
            {/* [HINDI: बड़े बेड़े के लिए भी हम सब संभालते हैं।] */}
          </p>
          <Link
            href="/"
            className="inline-block mt-4 px-6 py-3 bg-[var(--brand-red)] text-white rounded-xl font-semibold text-sm hover:bg-[var(--brand-red-dark)] transition-colors"
          >
            Back to home
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[var(--brand-bg)] flex flex-col">
      {/* Back nav */}
      <div className="px-4 py-4 border-b border-[var(--brand-gray-300)] bg-white">
        <Link
          href="/start"
          className="text-sm text-[var(--brand-gray-500)] hover:text-[var(--brand-red)] flex items-center gap-1 w-fit"
        >
          ← Back
        </Link>
      </div>

      <main className="flex-1 px-4 py-10">
        <div className="max-w-xl mx-auto">
          <h1 className="text-2xl font-extrabold text-[var(--brand-black)] mb-1">
            Great — let&apos;s get your fleet scrapped properly.
          </h1>
          <p className="text-[var(--brand-gray-500)] mb-8 text-sm">
            We handle everything from a single truck to a 100-vehicle fleet. Same process, faster timeline.
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Fleet size */}
            <fieldset>
              <legend className="text-sm font-medium text-[var(--brand-gray-700)] mb-2">
                Number of vehicles <span className="text-[var(--brand-red)]">*</span>
              </legend>
              <div className="flex gap-3 flex-wrap">
                {(["1", "2-10", "10+"] as FleetSize[]).map((sz) => (
                  <button
                    key={sz}
                    type="button"
                    onClick={() => setFleetSize(sz)}
                    className={`px-5 py-2.5 rounded-xl border-2 text-sm font-semibold transition-colors ${
                      fleetSize === sz
                        ? "border-[var(--brand-red)] bg-[var(--brand-red-light)] text-[var(--brand-red)]"
                        : "border-[var(--brand-gray-300)] text-[var(--brand-gray-700)] hover:border-[var(--brand-red-light)]"
                    }`}
                  >
                    {sz === "1" ? "1 vehicle" : sz === "2-10" ? "2–10 vehicles" : "10+ vehicles"}
                  </button>
                ))}
              </div>
            </fieldset>

            {/* Vehicle type */}
            <fieldset>
              <legend className="text-sm font-medium text-[var(--brand-gray-700)] mb-2">
                Vehicle type <span className="text-[var(--brand-red)]">*</span>
              </legend>
              <div className="flex gap-3 flex-wrap">
                {(["Truck", "Bus", "Auto", "LCV"] as VehicleType[]).map((vt) => (
                  <button
                    key={vt}
                    type="button"
                    onClick={() => setVehicleType(vt)}
                    className={`px-5 py-2.5 rounded-xl border-2 text-sm font-semibold transition-colors ${
                      vehicleType === vt
                        ? "border-[var(--brand-red)] bg-[var(--brand-red-light)] text-[var(--brand-red)]"
                        : "border-[var(--brand-gray-300)] text-[var(--brand-gray-700)] hover:border-[var(--brand-red-light)]"
                    }`}
                  >
                    {vt}
                  </button>
                ))}
              </div>
            </fieldset>

            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-[var(--brand-gray-700)] mb-1">
                Your name <span className="text-[var(--brand-red)]">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="As on Aadhaar"
                className="w-full h-12 px-4 border border-[var(--brand-gray-300)] rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-[var(--brand-red)] focus:border-[var(--brand-red)] bg-white"
                required
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-[var(--brand-gray-700)] mb-1">
                Your phone number <span className="text-[var(--brand-red)]">*</span>
              </label>
              <div className="flex">
                <span className="inline-flex items-center px-3 bg-[var(--brand-gray-100)] border border-r-0 border-[var(--brand-gray-300)] rounded-l-xl text-sm text-[var(--brand-gray-500)]">
                  +91
                </span>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                  inputMode="numeric"
                  placeholder="98765 43210"
                  className="flex-1 h-12 px-4 border border-[var(--brand-gray-300)] rounded-r-xl text-base focus:outline-none focus:ring-2 focus:ring-[var(--brand-red)] focus:border-[var(--brand-red)] bg-white"
                  required
                />
              </div>
            </div>

            {/* Company */}
            <div>
              <label className="block text-sm font-medium text-[var(--brand-gray-700)] mb-1">
                Company / fleet name{" "}
                <span className="text-[var(--brand-gray-500)] font-normal">(optional)</span>
              </label>
              <input
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="e.g., Singh Transport Co."
                className="w-full h-12 px-4 border border-[var(--brand-gray-300)] rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-[var(--brand-red)] focus:border-[var(--brand-red)] bg-white"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-14 bg-[var(--brand-red)] hover:bg-[var(--brand-red-dark)] disabled:opacity-60 text-white font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors text-base"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Submitting…
                </>
              ) : (
                "Request Fleet Quote →"
              )}
            </button>
          </form>
        </div>
      </main>
    </div>
  )
}

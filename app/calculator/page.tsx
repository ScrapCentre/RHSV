"use client"

/**
 * /calculator — Tier 1 Anonymous Calculator — ScrapCentre.com
 * NEW page per engineering-design §13, design-system §4.5–4.8.
 * Anonymous: no auth required. Calls POST /api/calc/tier1.
 * State:
 *   - leadStateId + anonymousToken stored in sessionStorage (cookie set server-side by API)
 *   - After successful Tier 1 → shows BenefitBreakdown tier=1 with locked rows
 * Transitions to: /calculator/verify (OTP) on "Verify My Number" click
 * Uses: BenefitBreakdown (tier=1 with onUnlockClick), TrustBar
 */

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import BenefitBreakdown from "@/components/BenefitBreakdown"
import TrustBar from "@/components/TrustBar"

/** Map reg prefix → brand/model/year stub (client-side fallback display only).
 * Real data comes from POST /api/calc/tier1 (VAHAN mock). */
function getDisplayLabel(regNumber: string): string {
  if (!regNumber) return "your vehicle"
  return regNumber.toUpperCase()
}

function CalculatorContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()

  // Pre-fill intent from query param (?type=A|B|C) — informational only for now
  const type = searchParams.get("type") ?? "A"
  const prefillReg = searchParams.get("reg") ?? ""

  const [regNumber, setRegNumber] = useState(prefillReg)
  const [isLookingUp, setIsLookingUp] = useState(false)
  const [tier1Data, setTier1Data] = useState<{
    leadStateId: string
    scrapMin: number
    scrapMax: number
    cdValue: number
    pickupCost: number
    vehicleLabel: string
  } | null>(null)

  // Persist leadStateId in sessionStorage so subsequent pages can use it
  useEffect(() => {
    const stored = sessionStorage.getItem("sc_leadStateId")
    if (stored) {
      // If returning to the page with an existing session, could reload — skip for now
    }
  }, [])

  async function handleLookup(e: React.FormEvent) {
    e.preventDefault()
    if (!regNumber.trim()) return

    setIsLookingUp(true)
    try {
      const res = await fetch("/api/calc/tier1", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ regNumber: regNumber.trim().toUpperCase() }),
      })
      const data = await res.json()

      if (!res.ok) {
        toast({
          title: "Lookup failed",
          description: data.error ?? "Something went wrong on our end. Please try again or call 9839447733.",
          variant: "destructive",
        })
        return
      }

      // Store leadStateId for subsequent steps
      sessionStorage.setItem("sc_leadStateId", data.leadStateId)
      sessionStorage.setItem("sc_anonymousToken", data.anonymousToken)

      setTier1Data({
        leadStateId: data.leadStateId,
        scrapMin: data.scrapMin,
        scrapMax: data.scrapMax,
        cdValue: data.cdValue ?? 52000,
        pickupCost: data.pickupCost ?? 0,
        vehicleLabel: data.vehicleLabel ?? getDisplayLabel(regNumber),
      })
    } catch {
      toast({
        title: "Connection error",
        description: "Check your signal and try again.",
        variant: "destructive",
      })
    } finally {
      setIsLookingUp(false)
    }
  }

  function handleUnlockClick() {
    // Navigate to OTP verify step, carrying leadStateId in URL
    const id = tier1Data?.leadStateId ?? sessionStorage.getItem("sc_leadStateId") ?? ""
    router.push(`/calculator/verify?leadStateId=${id}`)
  }

  return (
    <div className="min-h-screen bg-[var(--brand-bg)]">
      {/* Red hero band */}
      <section className="bg-[var(--brand-red)] px-4 py-10">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-2 leading-tight">
            {tier1Data
              ? `Your ${tier1Data.vehicleLabel}'s value: ₹${(tier1Data.scrapMin + tier1Data.cdValue).toLocaleString("en-IN")}+`
              : "Enter your vehicle details to get started"}
          </h1>
          {!tier1Data && (
            <p className="text-white/80 text-sm mb-6">
              Government-authorised RVSF. Free pickup. Real numbers, not guesses.
            </p>
          )}

          {/* Reg number input form */}
          <form onSubmit={handleLookup} className="flex gap-3 mb-4">
            <div className="flex-1 relative">
              <input
                type="text"
                value={regNumber}
                onChange={(e) => setRegNumber(e.target.value.toUpperCase())}
                placeholder="UP32 AB 1234"
                aria-label="Vehicle registration number"
                className="w-full h-14 px-4 pr-10 rounded-xl text-base bg-white text-[var(--brand-black)] border-0 focus:outline-none focus:ring-2 focus:ring-white/50 placeholder:text-[var(--brand-gray-500)]"
                maxLength={15}
              />
              {isLookingUp && (
                <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 animate-spin text-[var(--brand-gray-500)]" />
              )}
            </div>
            <button
              type="submit"
              disabled={isLookingUp || !regNumber.trim()}
              className="h-14 px-6 bg-[var(--brand-black)] hover:bg-[var(--brand-gray-900)] disabled:opacity-50 text-white font-semibold rounded-xl transition-colors text-sm whitespace-nowrap"
            >
              Get Value →
            </button>
          </form>
          <p className="text-white/70 text-xs">
            We look up your vehicle details automatically. — or{" "}
            {/* TODO[fullstack-dev]: manual make/model/year/state picker
                Could be a shadcn Select cascade; pass to POST /api/calc/tier1 as { brand, model, year, state }
                instead of { regNumber }. Skipped for v1 — reg number is sufficient for demo. */}
            <span className="underline underline-offset-2 cursor-pointer opacity-60">
              select vehicle manually (coming soon)
            </span>
          </p>
        </div>
      </section>

      {/* Calculator results */}
      {tier1Data && (
        <section className="px-4 py-8 max-w-2xl mx-auto">
          <BenefitBreakdown
            tier={1}
            scrapValue={Math.round((tier1Data.scrapMin + tier1Data.scrapMax) / 2)}
            cdValue={tier1Data.cdValue}
            onUnlockClick={handleUnlockClick}
          />
          <p className="text-xs text-[var(--brand-gray-500)] mt-4 text-center">
            Estimate ±20%. Final value confirmed at pickup.
          </p>
        </section>
      )}

      {/* Trust bar */}
      <div className="px-4 pb-10 max-w-2xl mx-auto">
        <TrustBar />
      </div>
    </div>
  )
}

export default function CalculatorPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-[var(--brand-red)]" />
        </div>
      }
    >
      <CalculatorContent />
    </Suspense>
  )
}

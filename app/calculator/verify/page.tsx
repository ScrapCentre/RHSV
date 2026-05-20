"use client"

/**
 * /calculator/verify — Tier 2 OTP Gate — ScrapCentre.com
 * NEW page per engineering-design §13, design-system §4.9.
 * Flow:
 *   1. User enters phone → POST /api/otp/issue
 *   2. User enters OTP (OTPInput component) → POST /api/otp/verify
 *   3. On success: calcSessionToken stored in sessionStorage, redirect to /calculator/upload
 * Uses: OTPInput, BenefitBreakdown (tier=2 post-verify)
 * State: calcSessionToken in sessionStorage, leadStateId from URL or sessionStorage
 */

import { useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Loader2, ChevronLeft } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
import OTPInput from "@/components/OTPInput"
import BenefitBreakdown from "@/components/BenefitBreakdown"

function VerifyContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()

  const leadStateId =
    searchParams.get("leadStateId") ?? sessionStorage.getItem("sc_leadStateId") ?? ""

  const [phone, setPhone] = useState("")
  const [otpValue, setOtpValue] = useState("")
  const [otpSent, setOtpSent] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)
  const [tier2Data, setTier2Data] = useState<{
    scrapValue: number
    cdValue: number
    roadTaxSaving: number
    dealerDiscount: number | null
    totalBenefit: number
  } | null>(null)

  async function sendOtp() {
    if (phone.length !== 10) {
      toast({
        title: "Invalid phone",
        description: "Please enter a valid 10-digit mobile number.",
        variant: "destructive",
      })
      return
    }
    setIsSending(true)
    try {
      const res = await fetch("/api/otp/issue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast({
          title: "OTP send failed",
          description: data.error ?? "Please try again.",
          variant: "destructive",
        })
        return
      }
      setOtpSent(true)
      toast({
        title: `OTP sent to +91 ${phone.slice(0, 5)} XXXXX`,
        description: data._demoHint ?? "Check your messages.",
      })
    } catch {
      toast({ title: "Connection error", description: "Try again.", variant: "destructive" })
    } finally {
      setIsSending(false)
    }
  }

  async function verifyOtp() {
    if (otpValue.length !== 6) return
    setIsVerifying(true)
    try {
      const res = await fetch("/api/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, otp: otpValue, leadStateId }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast({
          title: "Wrong code",
          description: data.error ?? "That code doesn't match. Try again, or request a new one.",
          variant: "destructive",
        })
        setOtpValue("")
        return
      }

      // Store calcSessionToken in sessionStorage (NOT localStorage — per engineering-design §6)
      sessionStorage.setItem("sc_calcSessionToken", data.calcSessionToken)

      toast({ title: "Verified. Here's your full breakdown." })

      setTier2Data({
        scrapValue: data.tier2Data?.scrapValue ?? 24500,
        cdValue: data.tier2Data?.cdValue ?? 52000,
        roadTaxSaving: data.tier2Data?.roadTaxSaving ?? 8400,
        dealerDiscount: data.tier2Data?.dealerDiscount ?? null,
        totalBenefit: data.tier2Data?.totalBenefit ?? 84900,
      })
    } catch {
      toast({ title: "Connection error", description: "Try again.", variant: "destructive" })
    } finally {
      setIsVerifying(false)
    }
  }

  function handleProceedToUpload() {
    router.push("/calculator/upload")
  }

  return (
    <div className="min-h-screen bg-[var(--brand-bg)]">
      <div className="max-w-xl mx-auto px-4 py-8">
        {/* Back link */}
        <Link
          href="/calculator"
          className="flex items-center gap-1 text-sm text-[var(--brand-gray-500)] hover:text-[var(--brand-red)] mb-6"
        >
          <ChevronLeft className="w-4 h-4" />
          Back
        </Link>

        {!tier2Data ? (
          <>
            <h1 className="text-2xl font-extrabold text-[var(--brand-black)] mb-1">
              Verify your number
            </h1>
            <p className="text-[var(--brand-gray-500)] text-sm mb-6">
              We send a 6-digit OTP. No spam, no marketing calls without consent.
            </p>

            {/* Phone input */}
            {!otpSent && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-[var(--brand-gray-700)] mb-1">
                  Your mobile number
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
                    className="flex-1 h-12 px-4 border border-[var(--brand-gray-300)] rounded-r-xl text-base focus:outline-none focus:ring-2 focus:ring-[var(--brand-red)] bg-white"
                  />
                </div>
                <button
                  onClick={sendOtp}
                  disabled={isSending || phone.length !== 10}
                  className="mt-4 w-full h-14 bg-[var(--brand-red)] hover:bg-[var(--brand-red-dark)] disabled:opacity-50 text-white font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors"
                >
                  {isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  Send OTP →
                </button>
              </div>
            )}

            {/* OTP input — shown after OTP sent */}
            {otpSent && (
              <div className="mb-6">
                <p className="text-sm text-[var(--brand-gray-700)] mb-4">
                  Enter the 6-digit code we sent to +91 {phone.slice(0, 5)} XXXXX
                </p>
                <OTPInput
                  value={otpValue}
                  onChange={setOtpValue}
                  onComplete={verifyOtp}
                  onResend={sendOtp}
                  phoneDisplay={`+91 ${phone}`}
                  isVerifying={isVerifying}
                />
                <button
                  onClick={verifyOtp}
                  disabled={isVerifying || otpValue.length !== 6}
                  className="mt-4 w-full h-14 bg-[var(--status-success)] hover:brightness-110 disabled:opacity-50 text-white font-semibold rounded-xl flex items-center justify-center gap-2 transition-all"
                >
                  {isVerifying ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  Verify →
                </button>
              </div>
            )}
          </>
        ) : (
          /* Tier 2 — full unlocked breakdown */
          <div className="space-y-6">
            <div className="flex items-center gap-2 mb-2">
              <span className="badge-verified text-base px-3 py-1">Number verified ✓</span>
            </div>
            <h2 className="text-xl font-bold text-[var(--brand-black)]">
              Here&apos;s your full breakdown.
            </h2>

            <BenefitBreakdown
              tier={2}
              scrapValue={tier2Data.scrapValue}
              cdValue={tier2Data.cdValue}
              roadTaxSaving={tier2Data.roadTaxSaving}
              dealerDiscount={tier2Data.dealerDiscount}
            />

            <p className="text-sm text-[var(--brand-gray-500)] text-center">
              The kabadi would give you approximately ₹12,000–₹20,000. You&apos;re entitled to ₹
              {tier2Data.totalBenefit.toLocaleString("en-IN")}.
            </p>

            <button
              onClick={handleProceedToUpload}
              className="w-full h-14 bg-[var(--brand-red)] hover:bg-[var(--brand-red-dark)] text-white font-semibold rounded-xl transition-colors text-base"
            >
              Arrange Free Pickup — I Want This →
            </button>
            <p className="text-xs text-center text-[var(--brand-gray-500)]">
              <button
                type="button"
                onClick={() => document.getElementById("how-next")?.scrollIntoView({ behavior: "smooth" })}
                className="underline underline-offset-2 hover:text-[var(--brand-red)]"
              >
                What happens next? →
              </button>
            </p>

            {/* What happens next */}
            <div id="how-next" className="pt-6 border-t border-[var(--brand-gray-300)]">
              <h3 className="text-base font-bold text-[var(--brand-black)] mb-3">What happens next</h3>
              <ol className="space-y-2 text-sm text-[var(--brand-gray-700)]">
                <li>1. Upload vehicle photos + RC document</li>
                <li>2. AI-verifies in minutes</li>
                <li>3. Our team calls within 24 hours to schedule pickup</li>
                <li>4. Cash paid + CD issued on the same day as pickup</li>
              </ol>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function VerifyPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-[var(--brand-red)]" />
        </div>
      }
    >
      <VerifyContent />
    </Suspense>
  )
}

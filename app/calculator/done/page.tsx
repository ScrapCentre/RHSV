"use client"

/**
 * /calculator/done — Confirmation / Thank-You Screen — ScrapCentre.com
 * NEW page per engineering-design §13, design-system §4.11.
 * Reads qualityScore + verificationStatus from sessionStorage (set by /calculator/upload).
 * Generates a mock reference number (SC-YYYY-XXXXX).
 * Customer can access their chat thread via the calcSessionToken link if a thread is created post-triage.
 */

import { useEffect, useState } from "react"
import Link from "next/link"
import { CheckCircle, Phone } from "lucide-react"

function generateRef(): string {
  const year = new Date().getFullYear()
  const rand = Math.floor(10000 + Math.random() * 90000)
  return `SC-${year}-${rand}`
}

export default function DonePage() {
  const [qualityScore, setQualityScore] = useState("gold")
  const [verificationStatus, setVerificationStatus] = useState("verified")
  const [refNumber] = useState(generateRef)

  useEffect(() => {
    const qs = sessionStorage.getItem("sc_qualityScore")
    const vs = sessionStorage.getItem("sc_verificationStatus")
    if (qs) setQualityScore(qs)
    if (vs) setVerificationStatus(vs)
  }, [])

  const isVerified = verificationStatus === "verified"

  return (
    <div className="min-h-screen bg-[var(--brand-bg)] flex items-start justify-center px-4 py-12">
      <div className="max-w-lg w-full">
        {/* Success icon */}
        <div className="text-center mb-8">
          <CheckCircle
            className="w-20 h-20 mx-auto mb-4"
            style={{ color: isVerified ? "var(--status-success)" : "var(--status-warning)" }}
          />
          <h1 className="text-2xl md:text-3xl font-extrabold text-[var(--brand-black)] mb-1">
            {isVerified
              ? "Your request is confirmed. We'll take it from here."
              : "Your documents are under review."}
          </h1>
          <p className="text-[var(--brand-gray-500)] text-sm mt-2">
            {isVerified
              ? "Our team will call you within 24 hours to confirm pickup."
              : "Our team reviews flagged leads manually. You'll hear from us within 24 hours."}
            {/* [HINDI: आपका अनुरोध पक्का हो गया। अगले 24 घंटों में हम संपर्क करेंगे।] */}
          </p>
        </div>

        {/* Quality badge */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <span
            className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${
              qualityScore === "gold"
                ? "bg-[var(--badge-gold-bg)] text-[var(--badge-gold)] border border-[var(--badge-gold)]"
                : qualityScore === "silver"
                ? "bg-[var(--badge-silver-bg)] text-[var(--badge-silver)] border border-[var(--badge-silver)]"
                : "bg-[var(--badge-bronze-bg)] text-[var(--badge-bronze)] border border-[var(--badge-bronze)]"
            }`}
          >
            {qualityScore === "gold" ? "★★★ Gold Lead" : qualityScore === "silver" ? "★★ Silver Lead" : "★ Bronze Lead"}
          </span>
          <span className="text-xs text-[var(--brand-gray-500)]">— quality verified</span>
        </div>

        {/* Reference number */}
        <div className="bg-white rounded-2xl border border-[var(--brand-gray-300)] p-6 mb-6 text-center">
          <p className="text-xs font-medium text-[var(--brand-gray-500)] mb-1">Your reference number:</p>
          <p className="text-2xl font-bold text-[var(--brand-black)] font-mono tracking-wider">
            {refNumber}
          </p>
          <p className="text-xs text-[var(--brand-gray-500)] mt-2">
            Keep this for your records. Our team will reference it when they call.
          </p>
        </div>

        {/* What happens next */}
        <div className="bg-white rounded-2xl border border-[var(--brand-gray-300)] p-6 mb-6">
          <h2 className="text-base font-bold text-[var(--brand-black)] mb-4">
            What happens in the next 24–48 hours:
          </h2>
          <ol className="space-y-3">
            {[
              "We call you to confirm pickup date and time",
              "Our team comes to your location — free pickup, no cost to you",
              "Vehicle is assessed at our facility — we explain the final price",
              "Cash paid, CD issued, RC deregistration filed on the same day",
            ].map((step, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-[var(--brand-red-light)] text-[var(--brand-red)] flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                  {i + 1}
                </span>
                <span className="text-sm text-[var(--brand-gray-700)]">{step}</span>
              </li>
            ))}
          </ol>
        </div>

        {/* WhatsApp CTA + phone */}
        <div className="text-center space-y-4">
          <a
            href="https://wa.me/919839447733"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full h-12 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-xl transition-colors text-sm"
          >
            Add ScrapCentre to WhatsApp for status updates →
          </a>

          <div className="flex items-center justify-center gap-2">
            <Phone className="w-4 h-4 text-[var(--brand-gray-500)]" />
            <span className="text-sm text-[var(--brand-gray-500)]">Or call us directly:</span>
            <a
              href="tel:9839447733"
              className="text-sm font-bold text-[var(--brand-black)] hover:text-[var(--brand-red)]"
            >
              9839447733
            </a>
          </div>

          <Link
            href="/"
            className="block text-sm text-[var(--brand-gray-500)] hover:text-[var(--brand-red)] underline underline-offset-2"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  )
}

"use client"

/**
 * TrustBar — ScrapCentre.com
 * NEW component per design-system §4.1, §6.
 * Simple horizontal trust signal row below the hero.
 * Shadcn-free — plain flex row per design-system §4.1 note.
 * Used by: HeroSection, homepage
 */

import { CheckCircle } from "lucide-react"

const TRUST_ITEMS = [
  "Government-authorised RVSF",
  "4,200+ vehicles scrapped",
  "Free pickup within 48 hrs",
]

interface TrustBarProps {
  items?: string[]
  className?: string
}

export default function TrustBar({
  items = TRUST_ITEMS,
  className = "",
}: TrustBarProps) {
  return (
    <div
      className={`flex flex-wrap justify-center md:justify-start gap-x-6 gap-y-2 ${className}`}
      aria-label="Trust signals"
    >
      {items.map((item) => (
        <div key={item} className="flex items-center gap-1.5 text-sm text-[var(--brand-gray-700)]">
          <CheckCircle
            className="w-4 h-4 text-[var(--status-success)] shrink-0"
            aria-hidden="true"
          />
          <span>{item}</span>
        </div>
      ))}
    </div>
  )
}

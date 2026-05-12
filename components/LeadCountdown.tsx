"use client"

/**
 * LeadCountdown — ScrapCentre.com
 * NEW component per design-system §2.4, §6.
 * Shows a 2-week countdown with colour states.
 *   > 7 days  → --countdown-ok green
 *   3–7 days  → --countdown-warn amber (bold)
 *   < 3 days  → --countdown-urgent red (bold + pulsing dot)
 *   Expired   → muted italic "Revival queue"
 * Used by: LeadCard, TriageLeadCard
 */

import { Clock } from "lucide-react"

interface LeadCountdownProps {
  expiresAt: Date | string
  className?: string
}

function getDaysRemaining(expiresAt: Date | string): number {
  const expiry = typeof expiresAt === "string" ? new Date(expiresAt) : expiresAt
  const now = new Date()
  const diff = expiry.getTime() - now.getTime()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

export default function LeadCountdown({ expiresAt, className = "" }: LeadCountdownProps) {
  const days = getDaysRemaining(expiresAt)

  if (days <= 0) {
    return (
      <span
        className={`inline-flex items-center gap-1 text-sm italic text-[var(--brand-gray-500)] ${className}`}
        aria-live="polite"
      >
        <Clock className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
        Revival queue
      </span>
    )
  }

  const label = `${days} day${days === 1 ? "" : "s"} left`

  if (days < 3) {
    return (
      <span
        className={`inline-flex items-center gap-1.5 text-sm font-bold text-[var(--countdown-urgent)] ${className}`}
        aria-live="polite"
        aria-label={`Urgent: ${label}`}
      >
        {/* Pulsing dot for < 3 days (design-system §2.4) */}
        <span
          className="w-2 h-2 rounded-full bg-[var(--countdown-urgent)] animate-pulse-dot shrink-0"
          aria-hidden="true"
        />
        {label}
      </span>
    )
  }

  if (days <= 7) {
    return (
      <span
        className={`inline-flex items-center gap-1 text-sm font-bold text-[var(--countdown-warn)] ${className}`}
        aria-live="polite"
        aria-label={label}
      >
        <Clock className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
        {label}
      </span>
    )
  }

  return (
    <span
      className={`inline-flex items-center gap-1 text-sm text-[var(--countdown-ok)] ${className}`}
      aria-label={label}
    >
      <Clock className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
      {label}
    </span>
  )
}

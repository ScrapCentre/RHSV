"use client"

/**
 * QualityBadge — ScrapCentre.com
 * NEW component per design-system §2.4, §6.
 * Renders Bronze / Silver / Gold quality tier badge on lead cards.
 * Used by: LeadCard, TriageLeadCard
 */

import { Star } from "lucide-react"

export type QualityTier = "bronze" | "silver" | "gold"

interface QualityBadgeProps {
  tier: QualityTier
  /** Optional extra className */
  className?: string
}

const TIER_CONFIG: Record<
  QualityTier,
  { label: string; stars: number; className: string }
> = {
  bronze: {
    label: "Bronze",
    stars: 1,
    className: "badge-bronze",
  },
  silver: {
    label: "Silver",
    stars: 2,
    className: "badge-silver",
  },
  gold: {
    label: "Gold",
    stars: 3,
    className: "badge-gold",
  },
}

export default function QualityBadge({ tier, className = "" }: QualityBadgeProps) {
  const { label, stars, className: tierClass } = TIER_CONFIG[tier]

  return (
    <span
      className={`inline-flex items-center gap-1 ${tierClass} ${className}`}
      aria-label={`Lead quality: ${label}`}
    >
      {Array.from({ length: stars }).map((_, i) => (
        <Star key={i} className="w-3 h-3 fill-current" aria-hidden="true" />
      ))}
      {label}
    </span>
  )
}

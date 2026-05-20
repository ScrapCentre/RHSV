"use client"

/**
 * ComingSoonTile — ScrapCentre.com
 * NEW component per design-system §2.4, §4.6, §6.
 * Locked tile for features not yet live (Green Finance, Green Insurance, Dealer Discount).
 * Uses card-locked + badge-coming pattern from design-system §2.4.
 * Used by: BenefitBreakdown (rows), homepage Coming Soon section
 */

interface ComingSoonTileProps {
  /** Feature name, e.g. "Green Finance" */
  featureName: string
  /** Estimated value range to show when live, e.g. "₹12,000–₹28,000" */
  estimatedRange?: string
  /** Additional context line, e.g. "Launching once banking partners are live" */
  launchNote?: string
  className?: string
}

export default function ComingSoonTile({
  featureName,
  estimatedRange,
  launchNote,
  className = "",
}: ComingSoonTileProps) {
  return (
    <div
      className={`card-locked flex flex-col gap-2 p-6 items-start opacity-70 ${className}`}
      aria-label={`${featureName} — coming soon`}
    >
      <span className="badge-coming" aria-hidden="true">Coming Soon</span>
      <p className="text-sm font-medium text-[var(--coming-soon-text)]">{featureName}</p>
      <p className="text-2xl font-bold text-[var(--brand-gray-300)]">₹ — — —</p>
      {estimatedRange && (
        <p className="text-xs text-[var(--brand-gray-500)]">
          Estimated: {estimatedRange}/year once live
        </p>
      )}
      {launchNote && (
        <p className="text-xs text-[var(--brand-gray-500)] italic">{launchNote}</p>
      )}
    </div>
  )
}

"use client"

/**
 * BlurredImage — ScrapCentre.com
 * NEW component per design-system §2.4 blurred-image pattern.
 * Used in marketplace lead cards to obscure vehicle photos pre-purchase.
 * Accessible: alt text describes the locked state per design-system §9.
 * Used by: LeadCard
 */

import { Lock } from "lucide-react"

interface BlurredImageProps {
  src: string
  /** Defaults to accessibility-compliant locked description (design-system §9) */
  alt?: string
  className?: string
}

export default function BlurredImage({
  src,
  alt = "Vehicle photo — purchase lead to unlock full view",
  className = "",
}: BlurredImageProps) {
  return (
    <div
      className={`relative rounded-xl overflow-hidden ${className}`}
      aria-label={alt}
    >
      {/* Blurred image underneath */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt="" /* decorative — label is on wrapper; screen reader reads wrapper aria-label */
        aria-hidden="true"
        className="w-full h-48 object-cover blur-sm scale-105 select-none pointer-events-none"
      />
      {/* Lock overlay (design-system §2.4) */}
      <div className="absolute inset-0 flex items-center justify-center bg-black/30 backdrop-blur-[2px]">
        <div className="flex flex-col items-center gap-1 text-white text-center">
          <Lock className="w-6 h-6" aria-hidden="true" />
          <span className="text-xs font-medium">Buy lead to unlock</span>
        </div>
      </div>
    </div>
  )
}

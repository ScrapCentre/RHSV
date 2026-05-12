"use client"

/**
 * LeadCard — ScrapCentre.com
 * NEW component per design-system §4.16, §6.
 * Partner marketplace card with blurred photos, quality badge, countdown, buy flow.
 * Uses: QualityBadge, LeadCountdown, BlurredImage
 * Used by: app/b2b/marketplace
 *
 * Props:
 *   lead: LeadCardData
 *   onBuy: (leadId: string) => void
 *   onWatch: (leadId: string) => void
 *   isWatched: boolean
 *   isRelisted?: boolean
 */

import { useState } from "react"
import { MapPin, CheckCircle, Star, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import QualityBadge, { QualityTier } from "@/components/QualityBadge"
import LeadCountdown from "@/components/LeadCountdown"
import BlurredImage from "@/components/BlurredImage"

export interface LeadCardData {
  id: string
  tier: QualityTier
  vehicleYear: number
  vehicleMake: string
  vehicleModel: string
  vehicleType: "4W" | "2W" | "HMV"
  location: string
  distanceKm: number
  weightKg: number
  isAadhaarVerified: boolean
  isRCVerified: boolean
  aiConditionScore?: string
  /** Photos shown blurred until purchase */
  photoUrls: string[]
  /** Per-kg lead price */
  pricePerKg: number
  expiresAt: Date | string
  referenceId: string
}

interface LeadCardProps {
  lead: LeadCardData
  onBuy: (leadId: string) => void
  onWatch: (leadId: string) => void
  isWatched?: boolean
  isRelisted?: boolean
}

export default function LeadCard({
  lead,
  onBuy,
  onWatch,
  isWatched = false,
  isRelisted = false,
}: LeadCardProps) {
  const [watched, setWatched] = useState(isWatched)
  const totalPrice = Math.round(lead.weightKg * lead.pricePerKg)

  const handleWatch = () => {
    setWatched((prev) => !prev)
    onWatch(lead.id)
  }

  return (
    <article
      className={`card-lead ${isRelisted ? "border-l-4 border-[var(--status-warning)]" : ""}`}
      aria-label={`Lead: ${lead.vehicleYear} ${lead.vehicleMake} ${lead.vehicleModel}, ${lead.location}`}
    >
      {/* ── Relisted banner ── */}
      {isRelisted && (
        <div className="mb-3 flex items-center gap-1.5">
          <span className="badge-ai-flag text-xs">Re-listed</span>
          <span className="text-xs text-[var(--brand-gray-500)]">
            Previously purchased and returned. Vehicle not yet scrapped.
          </span>
        </div>
      )}

      {/* ── Header row: quality badge + countdown ── */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <QualityBadge tier={lead.tier} />
        <LeadCountdown expiresAt={lead.expiresAt} />
      </div>

      {/* ── Blurred photos (design-system §2.4, §4.16) ── */}
      {lead.photoUrls.length > 0 && (
        <div className="grid grid-cols-3 gap-1.5 mb-4">
          {lead.photoUrls.slice(0, 3).map((url, i) => (
            <BlurredImage
              key={i}
              src={url}
              alt="Vehicle photo — purchase lead to unlock full view"
              className="rounded-lg overflow-hidden"
            />
          ))}
        </div>
      )}

      {/* ── Vehicle info ── */}
      <div className="space-y-1.5 mb-4">
        <p className="text-base font-bold text-[var(--brand-black)]">
          {lead.vehicleType} · {lead.vehicleYear} {lead.vehicleMake} {lead.vehicleModel}
        </p>
        <p className="text-sm text-[var(--brand-gray-500)] flex items-center gap-1">
          <MapPin className="w-3.5 h-3.5 shrink-0 text-[var(--brand-red)]" aria-hidden="true" />
          {lead.location} · ~{lead.weightKg} kg · {lead.distanceKm} km away
        </p>

        {/* Verification badges */}
        <div className="flex flex-wrap gap-2 mt-2">
          {lead.isAadhaarVerified && (
            <span className="badge-verified flex items-center gap-1">
              <CheckCircle className="w-3 h-3" aria-hidden="true" />
              Aadhaar verified
            </span>
          )}
          {lead.isRCVerified && (
            <span className="badge-verified flex items-center gap-1">
              <CheckCircle className="w-3 h-3" aria-hidden="true" />
              RC verified
            </span>
          )}
          {lead.aiConditionScore && (
            <span className="badge-ai-flag">
              AI: Condition {lead.aiConditionScore}
            </span>
          )}
        </div>
      </div>

      {/* ── Pricing ── */}
      <div className="rounded-lg bg-[var(--brand-gray-100)] px-4 py-3 mb-4">
        <p className="text-sm text-[var(--brand-gray-500)]">Lead price:</p>
        <p className="text-lg font-bold text-[var(--brand-black)]">
          ₹{totalPrice.toLocaleString("en-IN")}
        </p>
        <p className="text-xs text-[var(--brand-gray-500)]">
          {lead.weightKg} kg × ₹{lead.pricePerKg}/kg · {lead.vehicleType === "2W" ? "2-wheeler" : "4-wheeler"} rate
        </p>
      </div>

      {/* ── Actions ── */}
      <div className="flex gap-2">
        {/* Watch button */}
        <Button
          variant="outline"
          size="sm"
          onClick={handleWatch}
          className={`gap-1.5 border-[var(--brand-gray-300)] ${
            watched
              ? "text-[var(--badge-gold)] border-[var(--badge-gold)] bg-[var(--badge-gold-bg)]"
              : "text-[var(--brand-gray-700)]"
          }`}
          aria-label={watched ? "Unwatch this lead" : "Watch this lead — get notified if status changes"}
          title="Watch this lead — get notified if status changes"
        >
          <Star className={`w-4 h-4 ${watched ? "fill-current" : ""}`} aria-hidden="true" />
          <span>{watched ? "Watching" : "Watch"}</span>
        </Button>

        {/* Buy button — opens AlertDialog for confirmation (design-system §4.16) */}
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              className="flex-1 h-10 text-sm font-semibold bg-[var(--brand-red)] hover:bg-[var(--brand-red-dark)] text-white"
              aria-label={`Buy this lead for ₹${totalPrice.toLocaleString("en-IN")}`}
            >
              Buy This Lead →
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Buy this lead?</AlertDialogTitle>
              <AlertDialogDescription className="text-sm text-[var(--brand-gray-700)] space-y-2">
                <span className="block">
                  You&apos;ll pay{" "}
                  <strong>₹{totalPrice.toLocaleString("en-IN")}</strong> for this lead. The purchase
                  is non-refundable.
                </span>
                <span className="block">
                  Customer contact, RC, and sharp photos will be unlocked immediately. If the pickup
                  does not complete, the lead returns to the marketplace — no credit issued.
                </span>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Go Back</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => onBuy(lead.id)}
                className="bg-[var(--brand-red)] hover:bg-[var(--brand-red-dark)] text-white font-semibold"
              >
                Confirm Purchase — ₹{totalPrice.toLocaleString("en-IN")} →
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      {/* ── Reference ── */}
      <p className="text-xs text-[var(--brand-gray-300)] mt-3">{lead.referenceId}</p>
    </article>
  )
}

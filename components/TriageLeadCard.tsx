"use client"

/**
 * TriageLeadCard — ScrapCentre.com
 * NEW component per design-system §4.15, §6.
 * Admin triage card with 3 action buttons and AI flag chips.
 * Uses: QualityBadge
 * Used by: app/admin/triage/page.tsx
 *
 * Props:
 *   lead: TriageLeadData
 *   onApproveAuraiya: (id: string) => void
 *   onApproveMarketplace: (id: string) => void
 *   onReject: (id: string) => void
 */

import { CheckCircle, AlertTriangle } from "lucide-react"
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

export interface AIFlag {
  label: string
  detail: string
}

export interface TriageLeadData {
  id: string
  referenceId: string
  tier: QualityTier
  vehicleYear: number
  vehicleMake: string
  vehicleModel: string
  vehicleType: "4W" | "2W" | "HMV"
  location: string
  weightKg: number
  isAadhaarVerified: boolean
  isRCVerified: boolean
  aiConditionScore?: string
  aiFlags: AIFlag[]
}

interface TriageLeadCardProps {
  lead: TriageLeadData
  onApproveAuraiya: (id: string) => void
  onApproveMarketplace: (id: string) => void
  onReject: (id: string) => void
}

export default function TriageLeadCard({
  lead,
  onApproveAuraiya,
  onApproveMarketplace,
  onReject,
}: TriageLeadCardProps) {
  return (
    <article
      className="card-base"
      aria-label={`Triage lead: ${lead.vehicleYear} ${lead.vehicleMake} ${lead.vehicleModel}`}
    >
      {/* ── Header ── */}
      <div className="flex items-start justify-between gap-2 mb-4">
        <QualityBadge tier={lead.tier} />
        <span className="text-xs text-[var(--brand-gray-500)]">{lead.referenceId}</span>
      </div>

      {/* ── Vehicle info ── */}
      <p className="text-base font-bold text-[var(--brand-black)]">
        {lead.vehicleYear} {lead.vehicleMake} {lead.vehicleModel}
      </p>
      <p className="text-sm text-[var(--brand-gray-500)] mt-0.5">
        {lead.location} · ~{lead.weightKg} kg
      </p>

      {/* ── Verification status ── */}
      <div className="flex flex-wrap gap-2 mt-3">
        {lead.isAadhaarVerified && (
          <span className="badge-verified flex items-center gap-1">
            <CheckCircle className="w-3 h-3" aria-hidden="true" />
            Aadhaar ✓
          </span>
        )}
        {lead.isRCVerified && (
          <span className="badge-verified flex items-center gap-1">
            <CheckCircle className="w-3 h-3" aria-hidden="true" />
            RC ✓
          </span>
        )}
        {lead.aiConditionScore && (
          <span className="badge-verified">
            AI: Condition {lead.aiConditionScore}
          </span>
        )}
      </div>

      {/* ── AI flags (design-system §4.15) ── */}
      {lead.aiFlags.length > 0 && (
        <div className="mt-4 space-y-2">
          {lead.aiFlags.map((flag, i) => (
            <div
              key={i}
              className="badge-ai-flag inline-flex items-start gap-1.5 w-full rounded-lg px-3 py-2"
              role="alert"
              aria-label={`AI flag: ${flag.label} — ${flag.detail}`}
            >
              <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" aria-hidden="true" />
              <span className="text-xs">
                <strong>AI flag:</strong> {flag.label} — {flag.detail}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* ── Action buttons (design-system §4.15) ── */}
      <div className="mt-5 flex flex-col gap-2">
        {/* Approve Auraiya — primary brand CTA */}
        <Button
          onClick={() => onApproveAuraiya(lead.id)}
          className="w-full h-11 font-semibold bg-[var(--brand-red)] hover:bg-[var(--brand-red-dark)] text-white"
          aria-label={`Route lead ${lead.referenceId} to Auraiya facility`}
        >
          Route to Auraiya →
        </Button>

        {/* Approve Marketplace — outline */}
        <Button
          onClick={() => onApproveMarketplace(lead.id)}
          variant="outline"
          className="w-full h-11 font-semibold border-2 border-[var(--brand-red)] text-[var(--brand-red)] hover:bg-[var(--brand-red-light)]"
          aria-label={`List lead ${lead.referenceId} on marketplace`}
        >
          List on Marketplace →
        </Button>

        {/* Reject — ghost + AlertDialog confirm (design-system §4.15) */}
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="ghost"
              className="w-full h-11 font-medium text-[var(--brand-red)] hover:bg-[var(--brand-red-light)]"
              aria-label={`Reject lead ${lead.referenceId}`}
            >
              Reject Lead
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Reject this lead?</AlertDialogTitle>
              <AlertDialogDescription className="text-sm text-[var(--brand-gray-700)]">
                The customer will be notified and offered a re-submission option.
                This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => onReject(lead.id)}
                className="bg-[var(--brand-red)] hover:bg-[var(--brand-red-dark)] text-white font-semibold"
              >
                Confirm Rejection
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </article>
  )
}

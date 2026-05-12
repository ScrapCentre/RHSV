"use client"

/**
 * BenefitBreakdown — ScrapCentre.com
 * NEW component — the hero of the calculator (design-system §4.8, §10 note).
 * Renders the tier-aware benefit rows with lock/unlock state.
 * Locked rows use the blur overlay from design-system §2.4.
 * Used by: app/calculator (Tier 1, Tier 2), BenefitRow, ComingSoonTile
 *
 * Props:
 *   tier: 1 | 2 | 3  — how many rows are unlocked
 *   scrapValue: number | null
 *   cdValue: number | null
 *   roadTaxSaving: number | null
 *   dealerDiscount: number | null
 *   onUnlockClick: () => void  — fires when user clicks "Verify My Number"
 */

import { Lock, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import ComingSoonTile from "@/components/ComingSoonTile"

export interface BenefitBreakdownProps {
  tier: 1 | 2 | 3
  scrapValue?: number | null
  cdValue?: number | null
  roadTaxSaving?: number | null
  dealerDiscount?: number | null
  onUnlockClick?: () => void
  className?: string
}

function formatRupee(n: number): string {
  return "₹" + n.toLocaleString("en-IN")
}

interface BenefitRowProps {
  label: string
  subtext?: string
  value: string | null
  locked: boolean
  isComingSoon?: boolean
  comingSoonProps?: {
    featureName: string
    estimatedRange?: string
  }
}

function BenefitRow({ label, subtext, value, locked, isComingSoon, comingSoonProps }: BenefitRowProps) {
  if (isComingSoon && comingSoonProps) {
    return (
      <div className="flex items-center gap-3 py-3 border-b border-[var(--brand-gray-100)]">
        <span className="w-5 h-5 rounded-full bg-[var(--brand-gray-100)] flex items-center justify-center shrink-0">
          <span className="w-2 h-2 rounded-full bg-[var(--brand-gray-300)]" aria-hidden="true" />
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-[var(--brand-gray-500)]">{label}</p>
        </div>
        <span className="badge-coming shrink-0">Coming Soon</span>
      </div>
    )
  }

  if (locked) {
    return (
      <div
        className="flex items-center gap-3 py-3 border-b border-[var(--brand-gray-100)] relative"
        aria-label={`${label} — verify your number to unlock`}
      >
        <span className="w-5 h-5 rounded-full bg-[var(--brand-gray-100)] flex items-center justify-center shrink-0" aria-hidden="true">
          <Lock className="w-3 h-3 text-[var(--tier-locked)]" />
        </span>
        <div className="flex-1 min-w-0">
          {/* Actual text is rendered but visually blurred (design-system §2.4 unlock overlay) */}
          <div
            className="blur-[3px] select-none pointer-events-none"
            aria-hidden="true"
          >
            <p className="text-sm font-medium text-[var(--brand-gray-700)]">{label}</p>
            {subtext && <p className="text-xs text-[var(--brand-gray-500)]">{subtext}</p>}
          </div>
        </div>
        <div
          className="blur-[3px] select-none pointer-events-none text-base font-bold text-[var(--brand-gray-700)] shrink-0"
          aria-hidden="true"
        >
          {value ?? "₹—"}
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-3 py-3 border-b border-[var(--brand-gray-100)]">
      <CheckCircle className="w-5 h-5 text-[var(--status-success)] shrink-0" aria-hidden="true" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-[var(--brand-gray-700)]">{label}</p>
        {subtext && <p className="text-xs text-[var(--brand-gray-500)]">{subtext}</p>}
      </div>
      <span className="text-base font-bold text-[var(--brand-black)] shrink-0">
        {value ?? "—"}
      </span>
    </div>
  )
}

export default function BenefitBreakdown({
  tier,
  scrapValue,
  cdValue,
  roadTaxSaving,
  dealerDiscount,
  onUnlockClick,
  className = "",
}: BenefitBreakdownProps) {
  const scrapDisplay = scrapValue != null ? formatRupee(scrapValue) : "₹22,000–₹28,000 ±20%"
  const cdDisplay = cdValue != null ? formatRupee(cdValue) : "₹52,000"
  const roadTaxDisplay = roadTaxSaving != null ? formatRupee(roadTaxSaving) : "₹8,400"
  const dealerDisplay = dealerDiscount != null ? formatRupee(dealerDiscount) : "₹5,000 est."

  // Partial total visible at Tier 1 (scrap + CD only)
  const partialTotal =
    scrapValue != null && cdValue != null
      ? scrapValue + cdValue
      : null

  const fullTotal =
    scrapValue != null &&
    cdValue != null &&
    roadTaxSaving != null &&
    dealerDiscount != null
      ? scrapValue + cdValue + roadTaxSaving + dealerDiscount
      : null

  return (
    <div className={`bg-white rounded-2xl shadow-md border border-[var(--brand-gray-300)] p-6 ${className}`}>
      <h2 className="text-lg font-bold text-[var(--brand-black)] mb-1">
        Your benefit breakdown
      </h2>
      <p className="text-xs text-[var(--brand-gray-500)] mb-4">
        Estimate ±20%. Final value confirmed at pickup.
      </p>

      {/* ── Benefit rows ── */}
      <div className="space-y-0">
        <BenefitRow
          label="Scrap value of your vehicle"
          subtext="Based on current scrap metal rates. Pickup cost already deducted."
          value={scrapDisplay}
          locked={false}
        />
        <BenefitRow
          label="Certificate of Deposit value"
          subtext="Government-issued. Transferable to any new vehicle purchase."
          value={cdDisplay}
          locked={false}
        />
        <BenefitRow
          label="Road tax concession"
          subtext={tier >= 2 ? "Your state's exact amount" : "Verify to see your state's exact amount"}
          value={roadTaxDisplay}
          locked={tier < 2}
        />
        <BenefitRow
          label="Dealer discount"
          subtext="Estimated based on CD resale market"
          value={dealerDisplay}
          locked={tier < 2}
        />
        {/* Coming soon rows (design-system §4.6) */}
        <BenefitRow
          label="Green Finance rate reduction"
          locked={false}
          value={null}
          isComingSoon
          comingSoonProps={{
            featureName: "Green Finance",
            estimatedRange: "₹12,000–₹28,000",
          }}
        />
        <BenefitRow
          label="Green Insurance discount"
          locked={false}
          value={null}
          isComingSoon
          comingSoonProps={{
            featureName: "Green Insurance",
            estimatedRange: "₹3,000–₹8,000",
          }}
        />
      </div>

      {/* ── Total row ── */}
      <div className="mt-4 pt-4 border-t-2 border-[var(--brand-gray-300)]">
        {tier >= 2 && fullTotal != null ? (
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-[var(--brand-gray-700)]">
                Your total benefit from the government scheme:
              </p>
              <p className="text-xs text-[var(--brand-gray-500)] mt-0.5">
                vs. kabadi: ~₹12,000–₹20,000
              </p>
            </div>
            <span className="text-3xl font-extrabold text-[var(--brand-red)]">
              {formatRupee(fullTotal)}
            </span>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-[var(--brand-gray-700)]">
                Total benefit (partial, 2 of 6 lines):
              </p>
              <p className="text-xs text-[var(--brand-gray-500)] mt-0.5">
                Unlock all 6 lines by verifying your number
              </p>
            </div>
            <span className="text-3xl font-extrabold text-[var(--brand-red)]">
              {partialTotal != null ? formatRupee(partialTotal) + "+" : "₹74,000+"}
            </span>
          </div>
        )}
      </div>

      {/* ── Unlock banner (Tier 1 only) — design-system §4.8 ── */}
      {tier < 2 && onUnlockClick && (
        <div className="mt-5 rounded-xl border border-[var(--brand-gray-300)] bg-[var(--brand-red-xlight)] p-4">
          <div className="flex items-start gap-3">
            <Lock className="w-5 h-5 text-[var(--brand-red)] mt-0.5 shrink-0" aria-hidden="true" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-[var(--brand-black)]">
                You're seeing 2 of 6 benefit lines.
              </p>
              <p className="text-xs text-[var(--brand-gray-700)] mt-1">
                Verify your mobile number to unlock your full breakdown — including road tax, dealer
                discount, and total.
              </p>
              {/* [HINDI: पूरा फायदा देखने के लिए अपना नंबर वेरिफाई करें।] */}
            </div>
          </div>
          <Button
            onClick={onUnlockClick}
            className="mt-4 w-full h-14 text-base font-semibold bg-[var(--status-success)] hover:bg-emerald-600 text-white"
            aria-label="Verify your mobile number to unlock the full benefit breakdown"
          >
            Verify My Number — It&apos;s Free →
          </Button>
        </div>
      )}
    </div>
  )
}

"use client"

/**
 * TriageClientSection — ScrapCentre.com
 * Client-side section embedded in the admin triage RSC page.
 * Handles the three action buttons (Auraiya / Marketplace / Reject) via client-side fetch.
 * Per engineering-design §19: "action buttons must be client-side fetches (not server actions)".
 * Uses: TriageLeadCard
 */

import { useState } from "react"
import { useToast } from "@/hooks/use-toast"
import TriageLeadCard, { TriageLeadData } from "@/components/TriageLeadCard"
import type { QualityTier } from "@/components/QualityBadge"
import { Loader2, RefreshCw } from "lucide-react"

interface Props {
  initialLeads: any[]
}

/** Map API lead record to TriageLeadCard props */
function mapToTriageLead(raw: any): TriageLeadData {
  return {
    id: raw.leadStateId ?? raw._id ?? raw.id,
    referenceId: `SC-${String(raw.leadStateId ?? raw._id ?? "").slice(-5).toUpperCase()}`,
    tier: (raw.qualityScore ?? "bronze") as QualityTier,
    vehicleYear: raw.vehicleInfo?.year ? parseInt(raw.vehicleInfo.year, 10) : 2010,
    vehicleMake: raw.vehicleInfo?.brand ?? raw.brand ?? "Unknown",
    vehicleModel: raw.vehicleInfo?.model ?? raw.model ?? "Vehicle",
    vehicleType: raw.vehicleInfo?.vehicleType === "2W" ? "2W" : raw.vehicleInfo?.vehicleType === "truck" ? "HMV" : "4W",
    location: raw.vehicleInfo?.state ?? "UP",
    weightKg: raw.vehicleInfo?.estimatedWeightKg ?? 800,
    isAadhaarVerified: raw.aadhaarConsent === true,
    isRCVerified: !!(raw.rcUrl),
    aiConditionScore: raw.confidence ? `${raw.confidence}%` : undefined,
    aiFlags: (raw.flags ?? []).map((f: string) => ({ label: f, detail: f })),
  }
}

export default function TriageClientSection({ initialLeads }: Props) {
  const { toast } = useToast()
  const [leads, setLeads] = useState<any[]>(initialLeads)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [actingOn, setActingOn] = useState<string | null>(null)

  async function refreshLeads() {
    setIsRefreshing(true)
    try {
      const res = await fetch("/api/triage/queue")
      if (res.ok) {
        const data = await res.json()
        setLeads(data.leads ?? data ?? [])
      }
    } catch {
      toast({ title: "Failed to refresh", variant: "destructive" })
    } finally {
      setIsRefreshing(false)
    }
  }

  async function decide(leadStateId: string, decision: "auraiya" | "marketplace" | "rejected") {
    setActingOn(leadStateId)
    try {
      const res = await fetch("/api/triage/decide", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leadStateId, decision }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? "Decision failed")

      const dest = decision === "auraiya" ? "Auraiya" : decision === "marketplace" ? "Marketplace" : "Rejected"
      toast({ title: `Lead routed to ${dest}.` })

      // Remove from queue optimistically
      setLeads((prev) => prev.filter((l) => (l.leadStateId ?? l._id ?? l.id) !== leadStateId))
    } catch (err: any) {
      toast({ title: err.message, variant: "destructive" })
    } finally {
      setActingOn(null)
    }
  }

  if (leads.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-[var(--brand-gray-500)] text-base">No leads pending triage. You&apos;re up to date.</p>
        <button
          onClick={refreshLeads}
          className="mt-4 flex items-center gap-2 mx-auto text-sm text-[var(--brand-red)] hover:underline"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh queue
        </button>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-[var(--brand-gray-500)]">
          {leads.length} lead{leads.length !== 1 ? "s" : ""} awaiting decision
        </p>
        <button
          onClick={refreshLeads}
          disabled={isRefreshing}
          className="flex items-center gap-1.5 text-sm text-[var(--brand-gray-500)] hover:text-[var(--brand-red)] transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      <div className="space-y-4">
        {leads.map((raw) => {
          const lead = mapToTriageLead(raw)
          const isActing = actingOn === lead.id

          return (
            <div key={lead.id} className="relative">
              {isActing && (
                <div className="absolute inset-0 bg-white/70 rounded-2xl flex items-center justify-center z-10">
                  <Loader2 className="w-8 h-8 animate-spin text-[var(--brand-red)]" />
                </div>
              )}
              <TriageLeadCard
                lead={lead}
                onApproveAuraiya={(id) => decide(id, "auraiya")}
                onApproveMarketplace={(id) => decide(id, "marketplace")}
                onReject={(id) => decide(id, "rejected")}
              />
            </div>
          )
        })}
      </div>
    </div>
  )
}

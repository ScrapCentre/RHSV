"use client"

/**
 * /b2b/marketplace — Partner Marketplace Page — ScrapCentre.com
 * MODIFIED: refactored to use new MarketplaceLead API and LeadCard component.
 * Previous: called /api/valuations/marketplace (old B2B pickup flow).
 * Now: calls /api/marketplace/leads (new authenticated partner feed).
 * Auth: role === "partner" required.
 * Uses: LeadCard, QualityBadge, LeadCountdown, BlurredImage (via LeadCard)
 * Per engineering-design §13 (MODIFY), design-system §4.16.
 */

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { AlertCircle, Loader2, RefreshCw, Filter } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import LeadCard, { LeadCardData } from "@/components/LeadCard"
import type { QualityTier } from "@/components/QualityBadge"

/** Map MarketplaceLead API record to LeadCard props */
function mapToLeadCard(raw: any): LeadCardData {
  return {
    id: raw._id,
    tier: (raw.qualityScore ?? "bronze") as QualityTier,
    vehicleYear: raw.year ? parseInt(raw.year, 10) : 2010,
    vehicleMake: raw.brand ?? "Unknown",
    vehicleModel: raw.model ?? "Vehicle",
    vehicleType: raw.vehicleType === "2W" ? "2W" : raw.vehicleType === "truck" ? "HMV" : "4W",
    location: raw.cityMasked ?? "UP",
    distanceKm: raw.distanceKm ?? 0,
    weightKg: raw.estimatedWeightKg ?? 800,
    isAadhaarVerified: raw.aadhaarVerified ?? false,
    isRCVerified: true, // All marketplace leads have gone through triage
    photoUrls: raw.photoUrlsBlurred ?? [],
    leadPriceInr: raw.leadPriceInr ?? 0,
    expiresAt: raw.expiresAt ? new Date(raw.expiresAt) : new Date(Date.now() + 14 * 86400000),
    isRelisted: raw.isRelisted ?? false,
  }
}

type VehicleFilter = "all" | "4W" | "2W" | "HMV"

export default function B2BMarketplace() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { toast } = useToast()

  const [leads, setLeads] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [vehicleFilter, setVehicleFilter] = useState<VehicleFilter>("all")
  const [watchedIds, setWatchedIds] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (status === "authenticated" && (session?.user as any)?.role === "partner") {
      fetchLeads()
    }
  }, [status, session])

  async function fetchLeads() {
    setIsLoading(true)
    setError(null)
    try {
      const params = vehicleFilter !== "all" ? `?vehicleType=${vehicleFilter}` : ""
      const res = await fetch(`/api/marketplace/leads${params}`)
      if (!res.ok) {
        const d = await res.json()
        throw new Error(d.error ?? `Error ${res.status}`)
      }
      const data = await res.json()
      setLeads(data.leads ?? data ?? [])
    } catch (err: any) {
      setError(err.message)
      toast({ title: "Failed to load marketplace", description: err.message, variant: "destructive" })
    } finally {
      setIsLoading(false)
    }
  }

  async function handleBuy(leadId: string) {
    try {
      const res = await fetch(`/api/marketplace/leads/${leadId}/buy`, { method: "POST" })
      const data = await res.json()
      if (res.status === 409) {
        toast({ title: "Lead no longer available — already sold.", variant: "destructive" })
        fetchLeads()
        return
      }
      if (!res.ok) throw new Error(data.error ?? "Purchase failed")

      toast({ title: "Lead purchased. Customer details are now unlocked." })
      // Navigate to chat thread
      if (data.threadId) {
        router.push(`/b2b/chat/${data.threadId}`)
      } else {
        fetchLeads()
      }
    } catch (err: any) {
      toast({ title: err.message, variant: "destructive" })
    }
  }

  async function handleWatch(leadId: string) {
    try {
      const res = await fetch(`/api/marketplace/leads/${leadId}/watch`, { method: "POST" })
      if (!res.ok) return
      setWatchedIds((prev) => {
        const next = new Set(prev)
        if (next.has(leadId)) next.delete(leadId)
        else next.add(leadId)
        return next
      })
    } catch {
      // Watch is non-critical — fail silently
    }
  }

  // Auth check
  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--brand-red)]" />
      </div>
    )
  }

  if (status === "unauthenticated" || (session?.user as any)?.role !== "partner") {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center space-y-4 bg-white p-8 rounded-2xl shadow-md border border-[var(--brand-gray-300)]">
          <AlertCircle className="w-12 h-12 text-[var(--brand-red)] mx-auto" />
          <h1 className="text-xl font-bold text-[var(--brand-black)]">Partner login required</h1>
          <p className="text-[var(--brand-gray-500)] text-sm">
            Only verified RVSF partners can access the marketplace.
          </p>
          <button
            onClick={() => router.push("/b2b")}
            className="w-full h-12 bg-[var(--brand-red)] hover:bg-[var(--brand-red-dark)] text-white font-semibold rounded-xl transition-colors"
          >
            Go to Partner Login
          </button>
        </div>
      </div>
    )
  }

  const filteredLeads =
    vehicleFilter === "all"
      ? leads
      : leads.filter((l) => {
          const vt = l.vehicleType
          if (vehicleFilter === "4W") return vt === "4W"
          if (vehicleFilter === "2W") return vt === "2W"
          if (vehicleFilter === "HMV") return vt === "truck"
          return true
        })

  return (
    <div className="min-h-screen bg-[var(--brand-bg)] px-4 py-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-extrabold text-[var(--brand-black)]">
              Available leads in your area
            </h1>
            <p className="text-sm text-[var(--brand-gray-500)] mt-0.5">
              {filteredLeads.length} lead{filteredLeads.length !== 1 ? "s" : ""} — first come, first served
            </p>
          </div>
          <button
            onClick={fetchLeads}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 border border-[var(--brand-gray-300)] rounded-xl text-sm font-medium text-[var(--brand-gray-700)] hover:bg-white transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>

        {/* Filter bar */}
        <div className="flex items-center gap-2 mb-6 flex-wrap">
          <Filter className="w-4 h-4 text-[var(--brand-gray-500)]" />
          {(["all", "4W", "2W", "HMV"] as VehicleFilter[]).map((f) => (
            <button
              key={f}
              onClick={() => setVehicleFilter(f)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                vehicleFilter === f
                  ? "bg-[var(--brand-red)] text-white border-[var(--brand-red)]"
                  : "bg-white text-[var(--brand-gray-700)] border-[var(--brand-gray-300)] hover:border-[var(--brand-red-light)]"
              }`}
            >
              {f === "all" ? "All" : f === "HMV" ? "Truck / Commercial" : f}
            </button>
          ))}
        </div>

        {/* Error state */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {error}
            <button
              onClick={fetchLeads}
              className="ml-auto text-[var(--brand-red)] font-semibold hover:underline"
            >
              Retry
            </button>
          </div>
        )}

        {/* Loading state */}
        {isLoading && (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-[var(--brand-red)]" />
          </div>
        )}

        {/* Empty state */}
        {!isLoading && !error && filteredLeads.length === 0 && (
          <div className="text-center py-16 bg-white rounded-2xl border border-[var(--brand-gray-300)]">
            <p className="text-[var(--brand-gray-500)]">
              No leads available in your filter area right now. Adjust your filters, or check back
              tomorrow — we post new leads daily.
            </p>
          </div>
        )}

        {/* Lead cards grid */}
        {!isLoading && filteredLeads.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredLeads.map((raw) => (
              <LeadCard
                key={raw._id}
                lead={mapToLeadCard(raw)}
                onBuy={handleBuy}
                onWatch={handleWatch}
                isWatched={watchedIds.has(raw._id)}
                isRelisted={raw.isRelisted}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

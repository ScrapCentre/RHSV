// M11 — RVSF marketplace list. Distance-from-nearest-CC + radius slider.
"use client"

import { useEffect, useState } from "react"
import LeadCard, { LeadCardData } from "@/components/marketplace/LeadCard"

export default function MarketplacePage() {
  const [leads, setLeads] = useState<LeadCardData[]>([])
  const [radiusKm, setRadiusKm] = useState(200)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  async function load(r: number) {
    setLoading(true)
    setError(null)
    setMessage(null)
    try {
      const res = await fetch(`/api/marketplace/leads?radiusKm=${r}`)
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? "Failed to load marketplace")
        return
      }
      setLeads(data.leads ?? [])
      if (data.message) setMessage(data.message)
    } catch (e: any) {
      setError(e?.message ?? "Network error")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load(radiusKm) }, [])  // initial load with default

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold">Marketplace</h1>
          <p className="text-brand-gray-700">
            Leads in your service area. First to unlock wins.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <label htmlFor="radius" className="text-sm font-medium">
            Radius <span className="font-mono">{radiusKm}</span> km
          </label>
          <input
            id="radius"
            type="range"
            min={50}
            max={1000}
            step={50}
            value={radiusKm}
            onChange={(e) => setRadiusKm(Number(e.target.value))}
            onMouseUp={() => load(radiusKm)}
            onTouchEnd={() => load(radiusKm)}
            className="w-48"
          />
        </div>
      </div>

      {loading && <p className="text-brand-gray-500">Loading leads…</p>}
      {error && <p className="text-status-error">{error}</p>}
      {message && (
        <div className="card-base mb-4 bg-brand-red-light border-brand-red">
          <p className="text-brand-gray-700">{message}</p>
        </div>
      )}
      {!loading && !error && leads.length === 0 && !message && (
        <div className="card-base text-center py-12">
          <p className="text-brand-gray-700 mb-2">No leads in your radius right now.</p>
          <p className="text-sm text-brand-gray-500">Try widening the radius slider above.</p>
        </div>
      )}
      {!loading && leads.length > 0 && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {leads.map((lead) => <LeadCard key={lead._id} lead={lead} />)}
        </div>
      )}
    </div>
  )
}

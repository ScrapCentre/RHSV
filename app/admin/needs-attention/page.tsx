// M16 — Admin "needs attention" queue (ping-pong + stale leads).
"use client"

import { useEffect, useState } from "react"

type Row = {
  _id: string
  vehicleReg: string
  makeModelYear: string
  rejectionCount: number
  customerPhone: string
  customerName: string
  state: string
  pickupCity?: string
  pickupState?: string
  marketplaceVisibleAt?: string
}

export default function NeedsAttentionPage() {
  const [rows, setRows] = useState<Row[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/admin/needs-attention")
      .then((r) => r.json())
      .then((d) => setRows(d.leads ?? []))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-2">Needs attention</h1>
      <p className="text-brand-gray-700 mb-6">
        Leads flagged by the ping-pong watch (3+ rejections) or other
        signals. Admin should contact the customer, fix lead metadata, or
        withdraw the lead.
      </p>

      {loading && <p>Loading…</p>}
      {!loading && rows.length === 0 && (
        <div className="card-base text-center py-12">No leads need attention. Marketplace is healthy.</div>
      )}

      {!loading && rows.length > 0 && (
        <div className="space-y-3">
          {rows.map((r) => (
            <div key={r._id} className="card-feature">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <span className="text-xs font-mono">{r.vehicleReg}</span>
                  <h3 className="font-bold">{r.makeModelYear}</h3>
                </div>
                <span className="text-xs px-2 py-0.5 rounded bg-status-error text-white">
                  {r.rejectionCount}× rejected
                </span>
              </div>
              <div className="text-sm text-brand-gray-700 space-y-1">
                <p>Customer: <strong>{r.customerName ?? "—"}</strong> · <a href={`tel:${r.customerPhone}`} className="text-brand-red underline">{r.customerPhone}</a></p>
                <p>Pickup: {r.pickupCity ?? "—"}, {r.pickupState ?? "—"}</p>
                <p>State: {r.state}</p>
                <p>Marketplace-visible since: {r.marketplaceVisibleAt ? new Date(r.marketplaceVisibleAt).toLocaleString() : "—"}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

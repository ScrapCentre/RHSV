// M10 — RVSF admin: list of this RVSF's Collection Centers.
"use client"

import { useEffect, useState } from "react"
import Link from "next/link"

type CC = {
  _id: string
  displayName: string
  city: string
  state: string
  catchment?: { radiusKm: number }
  status: string
  isPrimaryYard?: boolean
  publicVisible?: boolean
}

export default function RvsfCcListPage() {
  const [ccs, setCcs] = useState<CC[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch("/api/rvsf/ccs")
      .then((r) => r.json())
      .then((d) => {
        if (d.error) setError(d.error)
        else setCcs(d.ccs ?? [])
      })
      .catch((e) => setError(e?.message ?? "Network error"))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Collection Centers</h1>
          <p className="text-brand-gray-700 mt-1">
            Add and manage the CCs that serve different cities under your RVSF.
          </p>
        </div>
        <Link href="/rvsf/ccs/new" className="btn-brand px-5 py-2.5">+ Add new CC</Link>
      </div>

      {loading && <p className="text-brand-gray-500">Loading…</p>}
      {error && <p className="text-status-error">{error}</p>}
      {!loading && !error && ccs.length === 0 && (
        <div className="card-base text-center py-12">
          <p className="text-brand-gray-700 mb-4">You don't have any Collection Centers yet.</p>
          <Link href="/rvsf/ccs/new" className="btn-brand px-5 py-2.5 inline-block">Add your first CC</Link>
        </div>
      )}
      {!loading && ccs.length > 0 && (
        <div className="grid gap-4">
          {ccs.map((cc) => (
            <div key={cc._id} className="card-feature">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-lg">
                    {cc.displayName}
                    {cc.isPrimaryYard && (
                      <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-brand-red-light text-brand-red">PRIMARY YARD</span>
                    )}
                  </h3>
                  <p className="text-sm text-brand-gray-700">{cc.city}, {cc.state}</p>
                  <p className="text-xs text-brand-gray-500 mt-1">
                    Catchment {cc.catchment?.radiusKm ?? 50} km · {cc.publicVisible ? "Public" : "Hidden"} · {cc.status}
                  </p>
                </div>
                <Link href={`/rvsf/ccs/${cc._id}`} className="text-sm text-brand-red hover:underline">Manage →</Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

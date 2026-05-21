// v2 admin RVSF directory — read-only listing.
// Filter by status (client-side dropdown). No edit/approve flow here yet
// (that lives in the KYC review queue elsewhere).
"use client"

import { useEffect, useState } from "react"
import Link from "next/link"

type Row = {
  _id: string
  legalName: string
  displayName: string
  slug: string
  gstNumber: string
  status: string
  city?: string
  state?: string
  createdAt: string
}

const STATUS_OPTIONS = [
  { value: "", label: "All" },
  { value: "applied", label: "Applied" },
  { value: "kyc_pending", label: "KYC pending" },
  { value: "kyc_review", label: "KYC review" },
  { value: "active", label: "Active" },
  { value: "suspended", label: "Suspended" },
  { value: "rejected", label: "Rejected" },
]

function statusBadgeClass(status: string): string {
  if (status === "active") return "bg-green-100 text-green-800"
  if (status === "rejected" || status === "suspended") return "bg-red-100 text-red-800"
  if (status === "kyc_review" || status === "kyc_pending") return "bg-yellow-100 text-yellow-800"
  return "bg-brand-gray-100 text-brand-gray-700"
}

export default function AdminRVSFsPage() {
  const [rows, setRows] = useState<Row[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState("")

  useEffect(() => {
    setLoading(true)
    const url = statusFilter ? `/api/admin/rvsfs?status=${statusFilter}` : "/api/admin/rvsfs"
    fetch(url)
      .then((r) => r.json())
      .then((d) => setRows(d.rvsfs ?? []))
      .finally(() => setLoading(false))
  }, [statusFilter])

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      <div className="flex items-start justify-between mb-2">
        <h1 className="text-3xl font-bold">RVSFs</h1>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border border-brand-gray-300 rounded px-3 py-2 text-sm"
        >
          {STATUS_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>
      <p className="text-brand-gray-700 mb-6">
        Every Registered Vehicle Scrapping Facility on the platform.
      </p>

      {loading && <p>Loading...</p>}
      {!loading && rows.length === 0 && (
        <div className="card-base text-center py-12">No RVSFs match this filter.</div>
      )}

      {!loading && rows.length > 0 && (
        <div className="card-base overflow-x-auto p-0">
          <table className="w-full text-sm">
            <thead className="bg-brand-gray-100 text-left">
              <tr>
                <th className="px-4 py-3">Display name</th>
                <th className="px-4 py-3">Legal name</th>
                <th className="px-4 py-3">Slug</th>
                <th className="px-4 py-3">GST</th>
                <th className="px-4 py-3">Location</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Joined</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r._id} className="border-t border-brand-gray-300">
                  <td className="px-4 py-3 font-medium">
                    <Link href={`/rvsf/${r.slug}`} className="text-brand-red hover:underline">
                      {r.displayName}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-brand-gray-700">{r.legalName}</td>
                  <td className="px-4 py-3 font-mono text-xs">{r.slug}</td>
                  <td className="px-4 py-3 font-mono text-xs">{r.gstNumber}</td>
                  <td className="px-4 py-3">{r.city ?? "—"}, {r.state ?? "—"}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded ${statusBadgeClass(r.status)}`}>
                      {r.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-brand-gray-500">
                    {new Date(r.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

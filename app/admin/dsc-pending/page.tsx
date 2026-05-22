// v2 admin DSC-pending queue — DigiELV concierge worklist.
// Lists COD DocumentRecord rows still unsigned >24h after upload.
// Empty state is the happy-path for green builds.
"use client"

import { useEffect, useState } from "react"

type Row = {
  _id: string
  cdNumber: string
  leadId: string | null
  vehicleReg: string
  rvsfName: string
  uploadedAt: string
  dscPendingSince: string
  hoursPending: number
  cloudinaryUrl: string
}

function severityClass(hours: number): string {
  if (hours >= 72) return "bg-red-100 text-red-800"
  if (hours >= 48) return "bg-yellow-100 text-yellow-800"
  return "bg-brand-gray-100 text-brand-gray-700"
}

export default function AdminDscPendingPage() {
  const [rows, setRows] = useState<Row[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/admin/dsc-pending")
      .then((r) => r.json())
      .then((d) => setRows(d.rows ?? []))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-2">DSC pending</h1>
      <p className="text-brand-gray-700 mb-6">
        COD documents the DigiELV concierge still needs to sign with the operator&apos;s DSC token.
        Anything past 24 hours appears here; past 72 hours is flagged red.
      </p>

      {loading && <p>Loading...</p>}
      {!loading && rows.length === 0 && (
        <div className="card-base text-center py-12">
          No pending DSC signatures. The concierge queue is empty.
        </div>
      )}

      {!loading && rows.length > 0 && (
        <div className="card-base overflow-x-auto p-0">
          <table className="w-full text-sm">
            <thead className="bg-brand-gray-100 text-left">
              <tr>
                <th className="px-4 py-3">CD #</th>
                <th className="px-4 py-3">Vehicle</th>
                <th className="px-4 py-3">RVSF</th>
                <th className="px-4 py-3">Pending</th>
                <th className="px-4 py-3">Uploaded</th>
                <th className="px-4 py-3">PDF</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r._id} className="border-t border-brand-gray-300">
                  <td className="px-4 py-3 font-mono text-xs">{r.cdNumber}</td>
                  <td className="px-4 py-3 font-mono">{r.vehicleReg}</td>
                  <td className="px-4 py-3">{r.rvsfName}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded ${severityClass(r.hoursPending)}`}>
                      {r.hoursPending}h
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-brand-gray-500">
                    {new Date(r.uploadedAt).toLocaleString()}
                  </td>
                  <td className="px-4 py-3">
                    <a
                      href={r.cloudinaryUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-brand-red hover:underline text-xs"
                    >
                      Open
                    </a>
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

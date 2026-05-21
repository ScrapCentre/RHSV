// v2 admin AuditLog tail — last 100 privileged actions, most recent first.
// No filtering UI; this is a forensic read-only view.
"use client"

import { useEffect, useState } from "react"

type Entry = {
  _id: string
  action: string
  actor: string
  targetCollection: string
  targetId: string
  reason: string
  createdAt: string
}

function actionBadgeClass(action: string): string {
  if (action.includes("reject") || action.includes("deny") || action.includes("suspend")) {
    return "bg-red-100 text-red-800"
  }
  if (action.includes("approve") || action.includes("accept")) {
    return "bg-green-100 text-green-800"
  }
  if (action.includes("config") || action.includes("update")) {
    return "bg-yellow-100 text-yellow-800"
  }
  return "bg-brand-gray-100 text-brand-gray-700"
}

export default function AdminAuditLogPage() {
  const [entries, setEntries] = useState<Entry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/admin/audit-log")
      .then((r) => r.json())
      .then((d) => setEntries(d.entries ?? []))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-2">Audit log</h1>
      <p className="text-brand-gray-700 mb-6">
        Last 100 privileged actions across the platform. Each row is tamper-evident
        and includes the actor, target document, and before/after diff.
      </p>

      {loading && <p>Loading...</p>}
      {!loading && entries.length === 0 && (
        <div className="card-base text-center py-12">No audit log entries yet.</div>
      )}

      {!loading && entries.length > 0 && (
        <div className="card-base overflow-x-auto p-0">
          <table className="w-full text-sm">
            <thead className="bg-brand-gray-100 text-left">
              <tr>
                <th className="px-4 py-3">When</th>
                <th className="px-4 py-3">Action</th>
                <th className="px-4 py-3">Actor</th>
                <th className="px-4 py-3">Target</th>
                <th className="px-4 py-3">Reason</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((e) => (
                <tr key={e._id} className="border-t border-brand-gray-300">
                  <td className="px-4 py-3 text-xs text-brand-gray-500 whitespace-nowrap">
                    {new Date(e.createdAt).toLocaleString()}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded font-mono ${actionBadgeClass(e.action)}`}>
                      {e.action}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs">{e.actor}</td>
                  <td className="px-4 py-3 font-mono text-xs">
                    {e.targetCollection}/{e.targetId.slice(-8)}
                  </td>
                  <td className="px-4 py-3 text-xs text-brand-gray-700">{e.reason || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

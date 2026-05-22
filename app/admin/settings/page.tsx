// v2 admin ConfigSetting editor — minimum-viable inline-edit table.
// Lists every row from ConfigSetting (₹/kg, default radius, refund grace, etc.)
// and lets the admin patch values one at a time. Booleans get a checkbox,
// numbers/strings get a text input, objects/arrays get a JSON textarea.
"use client"

import { useEffect, useState } from "react"
import { apiFetch } from "@/lib/fetch"

type Setting = {
  _id: string
  key: string
  value: any
  description: string
  version: number
  updatedAt: string
}

function formatValueForInput(value: any): string {
  if (value === null || value === undefined) return ""
  if (typeof value === "object") return JSON.stringify(value, null, 2)
  return String(value)
}

function inputKindFor(value: any): "boolean" | "json" | "text" {
  if (typeof value === "boolean") return "boolean"
  if (typeof value === "object" && value !== null) return "json"
  return "text"
}

export default function AdminSettingsPage() {
  const [rows, setRows] = useState<Setting[]>([])
  const [drafts, setDrafts] = useState<Record<string, string>>({})
  const [boolDrafts, setBoolDrafts] = useState<Record<string, boolean>>({})
  const [loading, setLoading] = useState(true)
  const [savingKey, setSavingKey] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [flash, setFlash] = useState<string | null>(null)

  function load() {
    setLoading(true)
    setError(null)
    fetch("/api/admin/settings")
      .then((r) => r.json())
      .then((d) => {
        if (d.error) throw new Error(d.error)
        setRows(d.settings ?? [])
        const td: Record<string, string> = {}
        const bd: Record<string, boolean> = {}
        for (const s of d.settings ?? []) {
          if (typeof s.value === "boolean") bd[s.key] = s.value
          else td[s.key] = formatValueForInput(s.value)
        }
        setDrafts(td)
        setBoolDrafts(bd)
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }
  useEffect(() => { load() }, [])

  async function save(key: string, value: any) {
    setSavingKey(key)
    setError(null)
    try {
      const res = await apiFetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, value }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? `HTTP ${res.status}`)
      setFlash(`Saved ${key}`)
      setTimeout(() => setFlash(null), 2000)
      load()
    } catch (e: any) {
      setError(`${key}: ${e.message}`)
    } finally {
      setSavingKey(null)
    }
  }

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-2">Settings</h1>
      <p className="text-brand-gray-700 mb-6">
        Tune platform-wide ConfigSetting rows: pricing, marketplace radius, SLAs, refund policy, etc.
        Every save is recorded in the audit log.
      </p>

      {flash && <div className="mb-4 p-3 rounded bg-green-50 border border-green-300 text-green-800 text-sm">{flash}</div>}
      {error && <div className="mb-4 p-3 rounded bg-red-50 border border-red-300 text-red-800 text-sm">{error}</div>}
      {loading && <p>Loading...</p>}

      {!loading && rows.length === 0 && (
        <div className="card-base text-center py-12">
          No ConfigSetting rows yet. Run <code>scripts/seed-settings-v2.ts</code> to seed canonical keys.
        </div>
      )}

      {!loading && rows.length > 0 && (
        <div className="space-y-3">
          {rows.map((s) => {
            const kind = inputKindFor(s.value)
            return (
              <div key={s._id} className="card-feature">
                <div className="flex items-start justify-between gap-4 mb-2">
                  <div className="flex-1">
                    <code className="text-sm font-mono font-bold text-brand-black">{s.key}</code>
                    {s.description && (
                      <p className="text-xs text-brand-gray-500 mt-1">{s.description}</p>
                    )}
                    <p className="text-xs text-brand-gray-500 mt-1">
                      v{s.version} · updated {new Date(s.updatedAt).toLocaleString()}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      const v = kind === "boolean" ? boolDrafts[s.key] : drafts[s.key]
                      save(s.key, v)
                    }}
                    disabled={savingKey === s.key}
                    className="btn-brand px-4 py-2 text-sm"
                  >
                    {savingKey === s.key ? "Saving..." : "Save"}
                  </button>
                </div>

                {kind === "boolean" && (
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={boolDrafts[s.key] ?? false}
                      onChange={(e) => setBoolDrafts({ ...boolDrafts, [s.key]: e.target.checked })}
                    />
                    <span>{boolDrafts[s.key] ? "true" : "false"}</span>
                  </label>
                )}

                {kind === "text" && (
                  <input
                    type="text"
                    value={drafts[s.key] ?? ""}
                    onChange={(e) => setDrafts({ ...drafts, [s.key]: e.target.value })}
                    className="w-full border border-brand-gray-300 rounded px-3 py-2 font-mono text-sm"
                  />
                )}

                {kind === "json" && (
                  <textarea
                    value={drafts[s.key] ?? ""}
                    onChange={(e) => setDrafts({ ...drafts, [s.key]: e.target.value })}
                    rows={6}
                    className="w-full border border-brand-gray-300 rounded px-3 py-2 font-mono text-xs"
                  />
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

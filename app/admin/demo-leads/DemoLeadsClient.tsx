// Client island for the admin /admin/demo-leads page.
//
// SECURITY (2026-05-22): This file deliberately contains NO secrets — the
// shared test password is rendered by the parent server component
// (page.tsx) directly into HTML on this admin-gated route. The reseed
// button posts the canonical confirm string required by the hardened
// /api/admin/reseed-demo endpoint (see RHSV-docs/v2-fix-reseed-footgun-
// 2026-05-22.md). Anything beyond UI state + clipboard helpers belongs
// server-side.
"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import {
  AlertTriangle,
  CheckCircle2,
  Database,
  ExternalLink,
  RefreshCcw,
} from "lucide-react"

// Verbatim string the /api/admin/reseed-demo handler requires in the body.
// Keep in sync with RESEED_CONFIRM_STRING in
// app/api/admin/reseed-demo/route.ts.
const RESEED_CONFIRM_STRING =
  "I understand this destroys leads matching /^Demo Customer / pattern"

type DemoRow = {
  leadId: string
  customerName: string
  vehicleLabel: string
  state: string
  links: { label: string; href: string; visibleToRoles: string[] }[]
  notes?: string
}

type DemoLeadsResponse = {
  count: number
  rows: DemoRow[]
  sideCounters: { activeThreadCount: number; pendingRefundCount: number }
}

export default function DemoLeadsClient() {
  const [data, setData] = useState<DemoLeadsResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [reseeding, setReseeding] = useState(false)
  const [reseedMsg, setReseedMsg] = useState<{ kind: "ok" | "err"; text: string } | null>(null)
  const [copied, setCopied] = useState<string | null>(null)

  async function refresh() {
    setLoading(true)
    try {
      const r = await fetch("/api/admin/demo-leads", { cache: "no-store" })
      if (!r.ok) {
        const d = await r.json().catch(() => ({}))
        setReseedMsg({ kind: "err", text: d.error ?? `GET failed (${r.status})` })
        setData({ count: 0, rows: [], sideCounters: { activeThreadCount: 0, pendingRefundCount: 0 } })
      } else {
        setData(await r.json())
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { refresh() }, [])

  async function reseed() {
    if (reseeding) return
    if (!confirm(
      "Re-seed demo data?\n\n" +
      "This will DELETE any existing 'Demo Customer A/B/C' leads (and their " +
      "chats / unlocks / refund events) and re-create the 3 canonical demo rows.\n\n" +
      "The server-side handler also requires ALLOW_PROD_SEED=1 on the VM env " +
      "in production (returns 503 otherwise) and rejects without the verbatim " +
      "confirm string this button always sends.",
    )) return
    setReseeding(true)
    setReseedMsg(null)
    try {
      const r = await fetch("/api/admin/reseed-demo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // P0: the API rejects 400 without this exact confirm token. Don't
        // change the string here without updating the API constant too.
        body: JSON.stringify({ confirm: RESEED_CONFIRM_STRING }),
      })
      const d = await r.json()
      if (!r.ok) {
        setReseedMsg({
          kind: "err",
          text: d.error ?? `Re-seed failed (${r.status})`,
        })
      } else {
        setReseedMsg({
          kind: "ok",
          text: `Re-seeded. Cleaned up ${d.cleanedUp} prior demo leads. New IDs: A=${d.leadAId.slice(-6)} B=${d.leadBId.slice(-6)} C=${d.leadCId.slice(-6)}.`,
        })
        await refresh()
      }
    } catch (e: any) {
      setReseedMsg({ kind: "err", text: e?.message ?? "Re-seed failed" })
    } finally {
      setReseeding(false)
    }
  }

  function copy(text: string) {
    navigator.clipboard?.writeText(text).then(() => {
      setCopied(text)
      setTimeout(() => setCopied(null), 1500)
    })
  }

  return (
    <>
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-black text-gray-900 dark:text-white flex items-center gap-3 tracking-tight">
            <Database className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
            Demo data
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2 font-medium max-w-2xl">
            Click-through links into the seeded demo leads (Customers A / B / C) and the shared test logins.
            Useful for walking Novalytix through the v2 flows end-to-end.
          </p>
        </div>
        <button
          onClick={reseed}
          disabled={reseeding}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-600/50 text-white font-semibold text-sm transition-colors"
        >
          <RefreshCcw className={`w-4 h-4 ${reseeding ? "animate-spin" : ""}`} />
          {reseeding ? "Re-seeding…" : "Re-seed demo data"}
        </button>
      </div>

      {reseedMsg && (
        <div
          className={`rounded-xl border px-4 py-3 text-sm font-medium flex items-start gap-2 ${
            reseedMsg.kind === "ok"
              ? "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800/50 text-emerald-800 dark:text-emerald-300"
              : "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800/50 text-red-800 dark:text-red-300"
          }`}
        >
          {reseedMsg.kind === "ok" ? <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" /> : <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />}
          <span>{reseedMsg.text}</span>
        </div>
      )}

      {/* Side counters */}
      {data && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-[#0E192D] p-4 rounded-xl border border-gray-100 dark:border-slate-800">
            <p className="text-xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider">Demo leads</p>
            <p className="text-2xl font-black text-gray-900 dark:text-white mt-1">{data.count}</p>
          </div>
          <div className="bg-white dark:bg-[#0E192D] p-4 rounded-xl border border-gray-100 dark:border-slate-800">
            <p className="text-xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider">Active chat threads</p>
            <p className="text-2xl font-black text-gray-900 dark:text-white mt-1">{data.sideCounters.activeThreadCount}</p>
          </div>
          <div className="bg-white dark:bg-[#0E192D] p-4 rounded-xl border border-gray-100 dark:border-slate-800">
            <p className="text-xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider">Pending refunds</p>
            <p className="text-2xl font-black text-gray-900 dark:text-white mt-1">{data.sideCounters.pendingRefundCount}</p>
          </div>
        </div>
      )}

      {/* Demo leads list */}
      <section className="space-y-3">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Database className="w-5 h-5 text-emerald-500" />
          Seeded leads
        </h2>

        {loading && (
          <div className="bg-white dark:bg-[#0E192D] rounded-xl border border-gray-100 dark:border-slate-800 p-6 text-center text-sm text-gray-500 dark:text-slate-400">
            Loading…
          </div>
        )}

        {!loading && data && data.rows.length === 0 && (
          <div className="bg-white dark:bg-[#0E192D] rounded-xl border border-gray-100 dark:border-slate-800 p-6 text-center">
            <p className="text-sm text-gray-500 dark:text-slate-400 mb-3">
              No demo leads found in the database yet.
            </p>
            <p className="text-xs text-gray-400 dark:text-slate-500">
              Click <strong>Re-seed demo data</strong> above to create them.
            </p>
          </div>
        )}

        {!loading && data && data.rows.length > 0 && (
          <div className="space-y-3">
            {data.rows.map((r) => (
              <div key={r.leadId} className="bg-white dark:bg-[#0E192D] rounded-xl border border-gray-100 dark:border-slate-800 p-5">
                <div className="flex items-start justify-between gap-3 flex-wrap mb-3">
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white">{r.customerName}</h3>
                    <p className="text-sm text-gray-500 dark:text-slate-400 mt-0.5">{r.vehicleLabel}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400">
                      {r.state}
                    </span>
                    <button
                      onClick={() => copy(r.leadId)}
                      className="text-[10px] font-mono px-2 py-1 rounded bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-400 hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors"
                      title="Copy leadId"
                    >
                      {copied === r.leadId ? "copied!" : r.leadId.slice(-8)}
                    </button>
                  </div>
                </div>

                {r.notes && (
                  <p className="text-xs text-gray-500 dark:text-slate-400 mb-3 italic">{r.notes}</p>
                )}

                <div className="space-y-2">
                  {r.links.map((lnk) => (
                    <div key={lnk.href} className="flex items-center justify-between gap-3 flex-wrap">
                      <Link
                        href={lnk.href}
                        className="inline-flex items-center gap-2 text-sm text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 font-medium hover:underline"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        {lnk.label}
                      </Link>
                      <div className="flex items-center gap-1 flex-wrap">
                        <span className="text-[10px] text-gray-400 dark:text-slate-500 uppercase tracking-wider">Visible to:</span>
                        {lnk.visibleToRoles.map((role) => (
                          <span
                            key={role}
                            className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-400"
                          >
                            {role}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </>
  )
}

// Admin-only Demo Data hub.
//
// Purpose: surface the IDs the seed script (scripts/seed-demo-leads.ts) writes
// to terminal as clickable rows in the browser, so the founder can walk through
// the v2 demo without SSHing to VM 221.
//
// Also exposes the 5 shared test logins (private staging, founder-only) and a
// re-seed button that POSTs to /api/admin/reseed-demo.
"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ExternalLink, RefreshCcw, Database, Key, Users, AlertTriangle, CheckCircle2 } from "lucide-react"

// Mirror of lib/services/demo/seed.ts TEST_PASSWORD. We don't pull it through
// the API on purpose — keeping it as a constant in this client bundle (a) makes
// the value obvious to the founder and (b) avoids leaking it through any other
// admin endpoint by accident.
const TEST_PASSWORD = "NovalytixTest2026!"

const TEST_USERS: { email: string; role: string; note: string }[] = [
  { email: "admin.test@scrapcentre.online",   role: "admin",          note: "ScrapCentre admin (this account, probably)" },
  { email: "client.test@scrapcentre.online",  role: "client",         note: "Use for customer-side demo (e.g. /me/chat)" },
  { email: "exec.test@scrapcentre.online",    role: "executive",      note: "Internal executive role" },
  { email: "centre.test@scrapcentre.online",  role: "cc_operator",    note: "Collection-centre operator (Auraiya)" },
  { email: "partner.test@scrapcentre.online", role: "rvsf_admin",     note: "Use for RVSF-side demo (unlock + chat)" },
]

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

export default function DemoLeadsPage() {
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
    if (!confirm("Re-seed demo data?\n\nThis will DELETE any existing 'Demo Customer *' leads (and their chats / unlocks / refund events) and re-create the 3 canonical demo rows.")) return
    setReseeding(true)
    setReseedMsg(null)
    try {
      const r = await fetch("/api/admin/reseed-demo", { method: "POST" })
      const d = await r.json()
      if (!r.ok) {
        setReseedMsg({ kind: "err", text: d.error ?? `Re-seed failed (${r.status})` })
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
    <div className="max-w-5xl mx-auto py-6 space-y-8">
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

      {/* Test logins */}
      <section className="space-y-3">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Users className="w-5 h-5 text-emerald-500" />
          Shared test logins
        </h2>

        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50 rounded-xl p-3 text-xs text-amber-800 dark:text-amber-300 flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
          <span>
            These accounts only exist in the staging Atlas DB. The shared password is hard-coded into the seed script and is safe to share with the Novalytix team for the demo.
          </span>
        </div>

        <div className="bg-white dark:bg-[#0E192D] rounded-xl border border-gray-100 dark:border-slate-800 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 dark:border-slate-800 bg-gray-50 dark:bg-slate-900/50 flex items-center gap-3 flex-wrap">
            <Key className="w-4 h-4 text-emerald-500" />
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-slate-400">Shared password</span>
            <code className="font-mono text-sm bg-white dark:bg-slate-800 px-2 py-1 rounded border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white">
              {TEST_PASSWORD}
            </code>
            <button
              onClick={() => copy(TEST_PASSWORD)}
              className="ml-auto text-xs font-medium text-emerald-600 dark:text-emerald-400 hover:underline"
            >
              {copied === TEST_PASSWORD ? "Copied!" : "Copy"}
            </button>
          </div>

          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-slate-900/30 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-slate-500">
              <tr>
                <th className="px-4 py-2 text-left">Email</th>
                <th className="px-4 py-2 text-left">Role</th>
                <th className="px-4 py-2 text-left">Notes</th>
                <th className="px-4 py-2 text-right">Copy</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
              {TEST_USERS.map((u) => (
                <tr key={u.email} className="hover:bg-gray-50 dark:hover:bg-slate-900/30 transition-colors">
                  <td className="px-4 py-2 font-mono text-xs text-gray-900 dark:text-white">{u.email}</td>
                  <td className="px-4 py-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300">
                      {u.role}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-xs text-gray-500 dark:text-slate-400">{u.note}</td>
                  <td className="px-4 py-2 text-right">
                    <button
                      onClick={() => copy(u.email)}
                      className="text-xs font-medium text-emerald-600 dark:text-emerald-400 hover:underline"
                    >
                      {copied === u.email ? "Copied!" : "Copy email"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <p className="text-xs text-gray-400 dark:text-slate-500 text-center pt-4">
        This page is admin-only. Source: <code className="font-mono">app/admin/demo-leads/page.tsx</code> ·
        Backed by <code className="font-mono">lib/services/demo/seed.ts</code>.
      </p>
    </div>
  )
}

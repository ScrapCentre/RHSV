// /admin/notifications — Dispatched notification queue viewer.
//
// Founder-demo concern (M15): the dispatcher writes Notification rows and
// fires the mock channel adapters; this page is where the founder shows the
// audience "see, the customer got a WhatsApp here at 14:32, here's the body
// preview". Each row exposes per-channel send status + the appended
// channelDeliveryLog so you can drill down into what would have been sent.
"use client"

import { Fragment, useEffect, useState } from "react"

type DeliveryEntry = {
  channel: "email" | "inapp" | "whatsapp" | "sms"
  at: string
  to: string
  adapter: "mock" | "real"
  preview: string
  providerMessageId: string | null
  error: string | null
}

type NotificationRow = {
  _id: string
  kind: string
  subject: string
  bodyPreview: string
  channels: string[]
  channelStatus: {
    email: string
    inapp: string
    whatsapp: string
  }
  whatsappTemplateName: string | null
  channelDeliveryLog: DeliveryEntry[]
  recipientUserId: string | null
  recipientRvsfId: string | null
  recipientCcId: string | null
  leadId: string | null
  correlationId: string | null
  dispatchedAt: string | null
  createdAt: string
}

function statusBadgeClass(status: string): string {
  switch (status) {
    case "sent":    return "bg-emerald-100 text-emerald-800"
    case "failed":  return "bg-red-100 text-red-800"
    case "pending": return "bg-amber-100 text-amber-800"
    case "skipped": return "bg-slate-100 text-slate-600"
    default:        return "bg-slate-100 text-slate-600"
  }
}

function channelBadgeClass(channel: string): string {
  switch (channel) {
    case "whatsapp": return "bg-green-100 text-green-800"
    case "email":    return "bg-blue-100 text-blue-800"
    case "inapp":    return "bg-purple-100 text-purple-800"
    case "sms":      return "bg-yellow-100 text-yellow-800"
    default:         return "bg-slate-100 text-slate-700"
  }
}

function recipientLabel(r: NotificationRow): string {
  if (r.recipientUserId) return `user:${r.recipientUserId.slice(-6)}`
  if (r.recipientRvsfId) return `rvsf:${r.recipientRvsfId.slice(-6)}`
  if (r.recipientCcId)   return `cc:${r.recipientCcId.slice(-6)}`
  return "—"
}

export default function AdminNotificationsPage() {
  const [entries, setEntries] = useState<NotificationRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const load = () => {
    setLoading(true)
    setError(null)
    fetch("/api/admin/notifications/queue")
      .then(async (r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        return r.json()
      })
      .then((d) => setEntries(d.entries ?? []))
      .catch((e) => setError(e.message ?? "Failed to load"))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  return (
    <div className="max-w-7xl mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-3xl font-bold text-white">Notification queue</h1>
        <button
          onClick={load}
          className="text-xs font-semibold px-4 py-2 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition"
        >
          Refresh
        </button>
      </div>
      <p className="text-slate-400 mb-6 text-sm">
        Last 100 dispatched notifications across all triggers. Each row records the per-channel
        send status (email / in-app / WhatsApp) plus a delivery-log evidence trail. Mock adapters
        log to <code className="bg-slate-800 px-1.5 py-0.5 rounded text-xs text-emerald-300">journalctl -u rhsv</code>;
        the entries below are the durable proof.
      </p>

      {loading && <p className="text-slate-500">Loading…</p>}
      {error && <p className="text-red-400">Failed to load: {error}</p>}
      {!loading && !error && entries.length === 0 && (
        <div className="rounded-xl bg-slate-900 border border-slate-800 text-center py-12 text-slate-500">
          No dispatched notifications yet. Trigger one by accepting/rejecting a lead.
        </div>
      )}

      {!loading && !error && entries.length > 0 && (
        <div className="rounded-xl bg-slate-900 border border-slate-800 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-800/60 text-left text-slate-300">
              <tr>
                <th className="px-4 py-3 font-semibold">When</th>
                <th className="px-4 py-3 font-semibold">Kind</th>
                <th className="px-4 py-3 font-semibold">Recipient</th>
                <th className="px-4 py-3 font-semibold">Subject</th>
                <th className="px-4 py-3 font-semibold">Channels</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold w-12"></th>
              </tr>
            </thead>
            <tbody>
              {entries.map((e) => {
                const isOpen = expandedId === e._id
                return (
                  <Fragment key={e._id}>
                    <tr className="border-t border-slate-800 text-slate-200 hover:bg-slate-800/30 transition">
                      <td className="px-4 py-3 text-xs text-slate-400 whitespace-nowrap">
                        {new Date(e.createdAt).toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-xs font-mono text-slate-300">{e.kind}</td>
                      <td className="px-4 py-3 text-xs font-mono">{recipientLabel(e)}</td>
                      <td className="px-4 py-3 text-xs max-w-md truncate">{e.subject}</td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {e.channels.map((c) => (
                            <span key={c} className={`text-[10px] px-2 py-0.5 rounded font-mono ${channelBadgeClass(c)}`}>
                              {c}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {(["email", "inapp", "whatsapp"] as const).map((ch) => {
                            const st = e.channelStatus[ch]
                            if (st === "skipped") return null
                            return (
                              <span key={ch} className={`text-[10px] px-2 py-0.5 rounded font-mono ${statusBadgeClass(st)}`}>
                                {ch}:{st}
                              </span>
                            )
                          })}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => setExpandedId(isOpen ? null : e._id)}
                          className="text-xs text-emerald-400 hover:text-emerald-300"
                        >
                          {isOpen ? "Hide" : "View"}
                        </button>
                      </td>
                    </tr>
                    {isOpen && (
                      <tr className="border-t border-slate-800 bg-slate-950">
                        <td colSpan={7} className="px-6 py-4">
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 text-xs">
                            <div>
                              <div className="text-slate-500 uppercase tracking-wider font-bold mb-1">Body preview</div>
                              <pre className="whitespace-pre-wrap text-slate-300 bg-slate-900 rounded p-3 max-h-48 overflow-y-auto">{e.bodyPreview || "(empty)"}</pre>
                              <div className="mt-3 text-slate-500 uppercase tracking-wider font-bold mb-1">Metadata</div>
                              <dl className="grid grid-cols-2 gap-x-3 gap-y-1 text-slate-300">
                                <dt className="text-slate-500">Notification id</dt><dd className="font-mono break-all">{e._id}</dd>
                                <dt className="text-slate-500">Lead id</dt><dd className="font-mono break-all">{e.leadId ?? "—"}</dd>
                                <dt className="text-slate-500">Correlation</dt><dd className="font-mono break-all">{e.correlationId ?? "—"}</dd>
                                <dt className="text-slate-500">WA template</dt><dd className="font-mono">{e.whatsappTemplateName ?? "—"}</dd>
                                <dt className="text-slate-500">Dispatched at</dt><dd>{e.dispatchedAt ? new Date(e.dispatchedAt).toLocaleString() : "—"}</dd>
                              </dl>
                            </div>
                            <div>
                              <div className="text-slate-500 uppercase tracking-wider font-bold mb-1">Delivery log ({e.channelDeliveryLog.length})</div>
                              {e.channelDeliveryLog.length === 0 ? (
                                <p className="text-slate-500 italic">No delivery attempts recorded yet.</p>
                              ) : (
                                <ul className="space-y-2">
                                  {e.channelDeliveryLog.map((d, i) => (
                                    <li key={i} className="bg-slate-900 rounded p-3">
                                      <div className="flex items-center gap-2 mb-1">
                                        <span className={`text-[10px] px-2 py-0.5 rounded font-mono ${channelBadgeClass(d.channel)}`}>{d.channel}</span>
                                        <span className="text-[10px] text-slate-500">
                                          {d.adapter} · {new Date(d.at).toLocaleTimeString()}
                                        </span>
                                        {d.error && <span className="text-[10px] text-red-400">FAILED</span>}
                                      </div>
                                      <div className="text-slate-400">
                                        <span className="text-slate-500">to:</span> {d.to}
                                      </div>
                                      {d.providerMessageId && (
                                        <div className="text-slate-500 font-mono text-[10px]">id: {d.providerMessageId}</div>
                                      )}
                                      {d.preview && (
                                        <div className="text-slate-300 mt-1 break-words">{d.preview}</div>
                                      )}
                                      {d.error && (
                                        <div className="text-red-400 mt-1 break-words">err: {d.error}</div>
                                      )}
                                    </li>
                                  ))}
                                </ul>
                              )}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

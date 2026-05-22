// /rvsf/chat — RVSF chat thread inbox
"use client"

import { useEffect, useState } from "react"
import Link from "next/link"

type Thread = {
  _id: string
  leadId: string
  status: "active" | "archived"
  lastMessageAt?: string
  pinnedOfferAmountPaise?: number
  messageCount?: number
}

export default function RvsfChatInbox() {
  const [threads, setThreads] = useState<Thread[]>([])
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    fetch("/api/chat/my-threads")
      .then((r) => r.ok ? r.json() : { threads: [] })
      .then((d) => setThreads(d.threads ?? []))
      .finally(() => setLoading(false))
  }, [])

  const active = threads.filter((t) => t.status === "active")
  const archived = threads.filter((t) => t.status === "archived")

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <Link href="/rvsf/marketplace" className="text-sm text-brand-gray-500 hover:text-brand-red">← Marketplace</Link>
      <h1 className="text-2xl font-bold mt-3 mb-6">Lead conversations</h1>

      {loading && <p className="text-brand-gray-500">Loading…</p>}
      {!loading && threads.length === 0 && (
        <div className="card-base text-center py-12">
          <p className="text-brand-gray-700 mb-2">No conversations yet.</p>
          <p className="text-sm text-brand-gray-500">A chat opens automatically when you unlock a lead in the marketplace.</p>
        </div>
      )}
      {!loading && active.length > 0 && (
        <>
          <h2 className="font-bold mb-2 mt-6">Active ({active.length})</h2>
          <div className="space-y-3">
            {active.map((t) => (
              <Link key={t._id} href={`/rvsf/chat/${t.leadId}`} className="card-feature block">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold">Lead {t.leadId.slice(-6)}</p>
                    <p className="text-xs text-brand-gray-500">
                      {t.messageCount ?? 0} messages
                      {t.lastMessageAt && ` · last activity ${new Date(t.lastMessageAt).toLocaleString()}`}
                    </p>
                  </div>
                  {t.pinnedOfferAmountPaise && (
                    <span className="text-sm font-bold text-status-success">
                      ✓ Agreed ₹{(t.pinnedOfferAmountPaise / 100).toLocaleString("en-IN")}
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </>
      )}
      {!loading && archived.length > 0 && (
        <>
          <h2 className="font-bold mb-2 mt-8 text-brand-gray-700">Archived ({archived.length})</h2>
          <div className="space-y-3 opacity-70">
            {archived.map((t) => (
              <Link key={t._id} href={`/rvsf/chat/${t.leadId}`} className="card-base block">
                <p className="font-bold">Lead {t.leadId.slice(-6)}</p>
                <p className="text-xs text-brand-gray-500">
                  Returned to marketplace
                  {t.lastMessageAt && ` · ${new Date(t.lastMessageAt).toLocaleString()}`}
                </p>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

// /me/chat — customer's chat thread inbox
"use client"

import { useEffect, useState } from "react"
import Link from "next/link"

type Thread = {
  _id: string
  leadId: string
  status: "active" | "archived"
  lastMessageAt?: string
  pinnedOfferAmountPaise?: number
}

export default function CustomerChatInbox() {
  const [threads, setThreads] = useState<Thread[]>([])
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    fetch("/api/chat/my-threads")
      .then((r) => r.ok ? r.json() : { threads: [] })
      .then((d) => setThreads(d.threads ?? []))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <Link href="/me" className="text-sm text-brand-gray-500 hover:text-brand-red">← Dashboard</Link>
      <h1 className="text-2xl font-bold mt-3 mb-6">My conversations</h1>

      {loading && <p className="text-brand-gray-500">Loading…</p>}
      {!loading && threads.length === 0 && (
        <div className="card-base text-center py-12">
          <p className="text-brand-gray-700 mb-2">No conversations yet.</p>
          <p className="text-sm text-brand-gray-500">A chat opens automatically when an RVSF unlocks your lead.</p>
        </div>
      )}
      {!loading && threads.length > 0 && (
        <div className="space-y-3">
          {threads.map((t) => (
            <Link key={t._id} href={`/me/chat/${t.leadId}`} className="card-feature block">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold">Lead {t.leadId.slice(-6)}</p>
                  <p className="text-xs text-brand-gray-500">
                    {t.status === "archived" ? "Archived — RVSF returned to marketplace" : "Active"}
                    {t.lastMessageAt && ` · last activity ${new Date(t.lastMessageAt).toLocaleString()}`}
                  </p>
                </div>
                {t.pinnedOfferAmountPaise && (
                  <span className="text-sm font-bold text-status-success">
                    ✓ ₹{(t.pinnedOfferAmountPaise / 100).toLocaleString("en-IN")}
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

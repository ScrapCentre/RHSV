// Customer dashboard — lands here after OTP / login.
"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import Link from "next/link"

type Lead = {
  _id: string
  vehicle?: { registrationNumber?: string; make?: string; model?: string; year?: number }
  state: string
  createdAt?: string
  unlock?: { unlockedByRvsfId?: string }
}

type Thread = {
  _id: string
  leadId: string
  status: "active" | "archived"
  lastMessageAt?: string
}

export default function CustomerDashboard() {
  const { data: session, status } = useSession()
  const [leads, setLeads] = useState<Lead[]>([])
  const [threads, setThreads] = useState<Thread[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status !== "authenticated") return
    Promise.all([
      fetch("/api/leads/mine").then((r) => r.ok ? r.json() : { leads: [] }).catch(() => ({ leads: [] })),
      fetch("/api/chat/my-threads").then((r) => r.ok ? r.json() : { threads: [] }).catch(() => ({ threads: [] })),
    ]).then(([leadsRes, threadsRes]) => {
      setLeads(leadsRes.leads ?? [])
      setThreads(threadsRes.threads ?? [])
    }).finally(() => setLoading(false))
  }, [status])

  if (status === "loading") return <p className="p-6 text-brand-gray-500">Loading…</p>
  if (status !== "authenticated") {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4">
        <p>Please <Link href="/login" className="text-brand-red underline">log in</Link> to see your dashboard.</p>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-2">Hi {(session.user as any).name ?? "there"}</h1>
      <p className="text-brand-gray-700 mb-8">Welcome to your ScrapCentre.com dashboard.</p>

      <div className="grid md:grid-cols-2 gap-4 mb-8">
        <Link href="/calculator" className="card-feature block">
          <h3 className="font-bold mb-1">Get a new quote</h3>
          <p className="text-sm text-brand-gray-700">Use the 3-tier calculator to value your vehicle.</p>
        </Link>
        <Link href="/me/chat" className="card-feature block">
          <h3 className="font-bold mb-1">My conversations</h3>
          <p className="text-sm text-brand-gray-700">
            {threads.length > 0 ? `${threads.length} active thread${threads.length !== 1 ? "s" : ""}` : "No threads yet."}
          </p>
        </Link>
      </div>

      <h2 className="text-xl font-bold mb-3">My scrap requests</h2>
      {loading && <p className="text-brand-gray-500">Loading…</p>}
      {!loading && leads.length === 0 && (
        <div className="card-base text-center py-12">
          <p className="text-brand-gray-700 mb-4">You haven't submitted any scrap requests yet.</p>
          <Link href="/calculator" className="btn-brand inline-block px-5 py-2.5">Start the calculator →</Link>
        </div>
      )}
      {!loading && leads.length > 0 && (
        <div className="space-y-3">
          {leads.map((l) => (
            <div key={l._id} className="card-base">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-mono text-brand-gray-500">{l.vehicle?.registrationNumber ?? "—"}</p>
                  <p className="font-bold">{l.vehicle?.year ?? ""} {l.vehicle?.make ?? ""} {l.vehicle?.model ?? ""}</p>
                  <p className="text-xs text-brand-gray-500 mt-1">State: {l.state}</p>
                </div>
                {(l.state === "unlocked" || l.state === "negotiating" || l.state === "assigned_to_cc") && (
                  <Link href={`/me/chat/${l._id}`} className="text-sm text-brand-red hover:underline">
                    Open chat →
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

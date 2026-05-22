// M09 — admin RVSF KYC review screen.
//
// /admin/rvsfs/[id]
//
// Renders full applicant data + an embedded preview of each KYC doc (image
// inline, PDF as <embed>) so the admin can verify and act without opening
// separate tabs. Three action buttons gated on status:
//   - Approve              → POST /api/admin/rvsfs/[id]/approve
//   - Reject with notes    → POST /api/admin/rvsfs/[id]/reject  { notes }
//   - Request more info    → POST /api/admin/rvsfs/[id]/request-info { question }
"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter, useParams } from "next/navigation"
import { apiFetch } from "@/lib/fetch"

type Rvsf = {
  _id: string
  legalName: string; displayName: string; slug: string
  gstNumber: string; panNumber: string; cpcbAuthNumber: string
  contactEmail?: string; contactPhone?: string
  address: { line1: string; line2?: string; city: string; state: string; pincode: string }
  primaryYardCoordinates: { type: string; coordinates: [number, number] }
  bankAccount: { accountName: string; accountNumber: string; ifsc: string; bankName: string; cancelledChequeUrl: string }
  kycDocs: Record<string, any>
  status: string
  submittedAt?: string; reviewedAt?: string
  rejectionNotes?: string; moreInfoQuestion?: string
  createdAt: string
}

const KYC_DOC_KEYS = [
  ["panCardUrl",         "PAN card"],
  ["gstCertUrl",         "GST certificate"],
  ["cpcbAuthUrl",        "CPCB authorisation"],
  ["morthAuthLetterUrl", "MoRTH authorisation"],
  ["addressProofUrl",    "Address proof"],
  ["signatoryIdUrl",     "Signatory ID"],
  ["cancelledChequeUrl", "Cancelled cheque (RVSF)"],
] as const

function DocPreview({ url }: { url: string }) {
  if (!url) return <p className="text-xs text-slate-500">Not uploaded</p>
  const isPdf = /\.pdf(\?|$)/i.test(url)
  const isMock = url.startsWith("https://mock.")
  if (isMock) {
    return <p className="text-xs text-amber-600 break-all">Mock placeholder: <span className="font-mono">{url}</span></p>
  }
  return (
    <div>
      {isPdf ? (
        <embed src={url} type="application/pdf" className="w-full h-64 border border-slate-700 rounded" />
      ) : (
        // images
        // eslint-disable-next-line @next/next/no-img-element
        <img src={url} alt="kyc" className="max-h-64 border border-slate-700 rounded object-contain" />
      )}
      <a href={url} target="_blank" rel="noopener noreferrer" className="text-xs text-emerald-400 hover:underline mt-1 inline-block">
        Open in new tab &rarr;
      </a>
    </div>
  )
}

export default function AdminRvsfDetailPage() {
  const router = useRouter()
  const params = useParams<{ id: string }>()
  const id = params?.id as string

  const [rvsf, setRvsf] = useState<Rvsf | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [acting, setActing] = useState<"approve" | "reject" | "request" | null>(null)
  const [rejectNotes, setRejectNotes] = useState("")
  const [moreInfoQuestion, setMoreInfoQuestion] = useState("")
  const [actionMsg, setActionMsg] = useState<string | null>(null)

  async function load() {
    setLoading(true); setError(null)
    try {
      const res = await fetch(`/api/admin/rvsfs/${id}`)
      const data = await res.json()
      if (!res.ok) { setError(data?.error || "Load failed"); return }
      setRvsf(data.rvsf)
    } catch (e: any) {
      setError(e?.message || "Network error")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { if (id) load() }, [id])

  async function doAction(kind: "approve" | "reject" | "request", body?: any) {
    setActing(kind); setActionMsg(null)
    try {
      const path = kind === "approve" ? "approve" : kind === "reject" ? "reject" : "request-info"
      const res = await apiFetch(`/api/admin/rvsfs/${id}/${path}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: body ? JSON.stringify(body) : undefined,
      })
      const data = await res.json()
      if (!res.ok) { setActionMsg(`Failed: ${data?.error || res.statusText}`); return }
      setActionMsg(data?.message || "Done.")
      await load()
    } catch (e: any) {
      setActionMsg(`Network error: ${e?.message}`)
    } finally {
      setActing(null)
    }
  }

  if (loading) return <p className="text-slate-300">Loading…</p>
  if (error)   return <p className="text-red-400">{error}</p>
  if (!rvsf)   return <p className="text-slate-300">Not found.</p>

  const canAct = rvsf.status !== "active" && rvsf.status !== "suspended"

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/admin/rvsfs" className="text-emerald-400 text-sm hover:underline">&larr; All RVSFs</Link>
          <h1 className="text-3xl font-bold text-white mt-1">{rvsf.displayName}</h1>
          <p className="text-slate-400">{rvsf.legalName} &middot; <span className="font-mono text-xs">{rvsf.slug}</span></p>
        </div>
        <span className={`px-3 py-1 rounded text-sm font-semibold ${
          rvsf.status === "active" ? "bg-green-500/20 text-green-300" :
          rvsf.status === "kyc_review" || rvsf.status === "kyc_pending" || rvsf.status === "applied" ? "bg-amber-500/20 text-amber-300" :
          rvsf.status === "pending_more_info" ? "bg-orange-500/20 text-orange-300" :
          "bg-red-500/20 text-red-300"
        }`}>{rvsf.status}</span>
      </div>

      {actionMsg && (
        <div className="border border-emerald-500/30 bg-emerald-500/10 text-emerald-200 rounded p-3 text-sm">{actionMsg}</div>
      )}

      <section className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <h2 className="text-lg font-semibold text-white mb-3">Organisation</h2>
        <div className="grid grid-cols-2 gap-3 text-sm text-slate-300">
          <div><span className="text-slate-500">GST:</span> <span className="font-mono">{rvsf.gstNumber}</span></div>
          <div><span className="text-slate-500">PAN:</span> <span className="font-mono">{rvsf.panNumber}</span></div>
          <div><span className="text-slate-500">CPCB#:</span> <span className="font-mono">{rvsf.cpcbAuthNumber}</span></div>
          <div><span className="text-slate-500">Contact:</span> {rvsf.contactEmail} / {rvsf.contactPhone}</div>
          <div className="col-span-2"><span className="text-slate-500">Address:</span> {rvsf.address.line1}, {rvsf.address.line2 ? rvsf.address.line2 + ", " : ""}{rvsf.address.city}, {rvsf.address.state} {rvsf.address.pincode}</div>
          <div><span className="text-slate-500">Coordinates:</span> [lng, lat] = [{rvsf.primaryYardCoordinates?.coordinates?.[0]}, {rvsf.primaryYardCoordinates?.coordinates?.[1]}]</div>
          <div><span className="text-slate-500">Signatory:</span> {rvsf.kycDocs?.signatoryName} ({rvsf.kycDocs?.signatoryDesignation})</div>
        </div>
      </section>

      <section className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <h2 className="text-lg font-semibold text-white mb-3">Bank account</h2>
        <div className="grid grid-cols-2 gap-3 text-sm text-slate-300">
          <div><span className="text-slate-500">Holder:</span> {rvsf.bankAccount?.accountName}</div>
          <div><span className="text-slate-500">Bank:</span> {rvsf.bankAccount?.bankName}</div>
          <div><span className="text-slate-500">A/c:</span> <span className="font-mono">{rvsf.bankAccount?.accountNumber}</span></div>
          <div><span className="text-slate-500">IFSC:</span> <span className="font-mono">{rvsf.bankAccount?.ifsc}</span></div>
        </div>
        <div className="mt-3">
          <p className="text-xs text-slate-500 mb-1">Cancelled cheque (bank-tied)</p>
          <DocPreview url={rvsf.bankAccount?.cancelledChequeUrl} />
        </div>
      </section>

      <section className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <h2 className="text-lg font-semibold text-white mb-3">KYC documents</h2>
        <div className="grid grid-cols-2 gap-4">
          {KYC_DOC_KEYS.map(([k, label]) => (
            <div key={k} className="space-y-1">
              <p className="text-sm font-medium text-slate-200">{label}</p>
              <DocPreview url={rvsf.kycDocs?.[k]} />
            </div>
          ))}
        </div>
      </section>

      {canAct && (
        <section className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <h2 className="text-lg font-semibold text-white">Decision</h2>
          <div className="flex gap-3">
            <button
              onClick={() => doAction("approve")}
              disabled={!!acting}
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded font-semibold disabled:opacity-50"
            >
              {acting === "approve" ? "Approving…" : "Approve"}
            </button>
          </div>

          <div className="border-t border-slate-800 pt-4">
            <label className="block text-sm font-medium text-slate-300 mb-1">Rejection notes (applicant will see)</label>
            <textarea
              value={rejectNotes} onChange={(e) => setRejectNotes(e.target.value)}
              rows={3} className="w-full bg-slate-800 border border-slate-700 text-slate-200 rounded px-3 py-2 text-sm"
              placeholder="e.g. CPCB letter expired on 2024-08-01 — please upload current version."
            />
            <button
              onClick={() => doAction("reject", { notes: rejectNotes })}
              disabled={!!acting || !rejectNotes.trim()}
              className="mt-2 px-5 py-2 bg-red-600 hover:bg-red-500 text-white rounded font-semibold disabled:opacity-50"
            >
              {acting === "reject" ? "Rejecting…" : "Reject with notes"}
            </button>
          </div>

          <div className="border-t border-slate-800 pt-4">
            <label className="block text-sm font-medium text-slate-300 mb-1">Request more info (applicant will see)</label>
            <textarea
              value={moreInfoQuestion} onChange={(e) => setMoreInfoQuestion(e.target.value)}
              rows={3} className="w-full bg-slate-800 border border-slate-700 text-slate-200 rounded px-3 py-2 text-sm"
              placeholder="e.g. Please confirm the trade name on your GST registration matches your display name."
            />
            <button
              onClick={() => doAction("request", { question: moreInfoQuestion })}
              disabled={!!acting || !moreInfoQuestion.trim()}
              className="mt-2 px-5 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded font-semibold disabled:opacity-50"
            >
              {acting === "request" ? "Sending…" : "Request more info"}
            </button>
          </div>
        </section>
      )}

      {!canAct && (
        <p className="text-slate-400 text-sm">
          This RVSF is in status <span className="font-semibold">{rvsf.status}</span>. No KYC actions available.
        </p>
      )}
    </div>
  )
}

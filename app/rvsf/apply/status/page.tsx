// M09 — public RVSF application-status lookup.
//
// /rvsf/apply/status?email=...
//
// No auth: applicant hasn't been granted a login yet. We look up by email
// via /api/rvsf/apply/status which returns a minimal projection (no KYC
// URLs, no bank details — see the API route comment for why).
"use client"

import { useEffect, useState, Suspense } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"

type StatusKind =
  | "applied" | "kyc_pending" | "kyc_review" | "pending_more_info"
  | "active" | "suspended" | "rejected" | "rejected_with_notes"

type StatusResponse = {
  status: StatusKind
  displayName?: string
  slug?: string
  submittedAt?: string
  reviewedAt?: string | null
  rejectionNotes?: string | null
  moreInfoQuestion?: string | null
}

function fmtDate(s?: string | null): string {
  if (!s) return "—"
  try { return new Date(s).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }) } catch { return s }
}

const STATUS_COPY: Record<StatusKind, { label: string; color: string; tone: string; help: string }> = {
  applied:             { label: "Submitted",          color: "bg-blue-100 text-blue-900",     tone: "blue",   help: "We've received your application. Our team will review within 2 business hours." },
  kyc_pending:         { label: "Awaiting review",    color: "bg-amber-100 text-amber-900",   tone: "amber",  help: "Your documents are queued for review." },
  kyc_review:          { label: "Under review",       color: "bg-amber-100 text-amber-900",   tone: "amber",  help: "Our team is verifying your KYC documents right now." },
  pending_more_info:   { label: "More info needed",   color: "bg-orange-100 text-orange-900", tone: "orange", help: "We have a question. Please re-submit the wizard with the requested information." },
  active:              { label: "Active",             color: "bg-green-100 text-green-900",   tone: "green",  help: "Your RVSF is approved and live. Check your email for login credentials." },
  suspended:           { label: "Suspended",          color: "bg-red-100 text-red-900",       tone: "red",    help: "Your RVSF account is currently suspended. Contact ops@scrapcentre.online." },
  rejected:            { label: "Rejected",           color: "bg-red-100 text-red-900",       tone: "red",    help: "Your application was rejected. You may re-apply with corrected details." },
  rejected_with_notes: { label: "Needs changes",      color: "bg-red-100 text-red-900",       tone: "red",    help: "Your application was rejected with specific notes — see below." },
}

export default function ApplyStatusPage() {
  // useSearchParams() requires a Suspense boundary in Next 15 for static export.
  return (
    <Suspense fallback={<div className="max-w-2xl mx-auto py-12 px-4 text-brand-gray-500">Loading…</div>}>
      <ApplyStatusInner />
    </Suspense>
  )
}

function ApplyStatusInner() {
  const params = useSearchParams()
  const emailFromUrl = params.get("email") || ""
  const [email, setEmail] = useState(emailFromUrl)
  const [data, setData] = useState<StatusResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function lookup(targetEmail: string) {
    if (!targetEmail) return
    setLoading(true); setError(null); setData(null)
    try {
      const res = await fetch(`/api/rvsf/apply/status?email=${encodeURIComponent(targetEmail)}`)
      const body = await res.json()
      if (!res.ok) { setError(body?.error || "Lookup failed"); return }
      setData(body)
    } catch (e: any) {
      setError(e?.message || "Network error")
    } finally {
      setLoading(false)
    }
  }

  // Auto-lookup if email came in via querystring
  useEffect(() => {
    if (emailFromUrl) lookup(emailFromUrl)
  }, [emailFromUrl])

  const meta = data ? STATUS_COPY[data.status] : null

  return (
    <div className="max-w-2xl mx-auto py-12 px-4">
      <Link href="/" className="text-sm text-brand-gray-500 hover:text-brand-red">&larr; Back</Link>
      <h1 className="text-3xl font-bold mt-4 mb-2">Track your RVSF application</h1>
      <p className="text-brand-gray-700 mb-8">
        Enter the contact email you used when applying. We&apos;ll show the latest status.
      </p>

      <form
        onSubmit={(e) => { e.preventDefault(); lookup(email) }}
        className="card-feature mb-6 flex gap-3 items-end"
      >
        <div className="flex-1">
          <label className="block text-sm font-medium mb-1">Contact email</label>
          <input
            type="email" value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-brand-gray-300 rounded px-3 py-2"
            placeholder="you@example.com"
          />
        </div>
        <button type="submit" disabled={loading || !email} className="btn-brand px-5 py-2">
          {loading ? "Checking…" : "Check"}
        </button>
      </form>

      {error && (
        <div className="card-feature">
          <p className="text-status-error font-medium">{error}</p>
          <p className="text-sm text-brand-gray-700 mt-2">
            Haven&apos;t applied yet?{" "}
            <Link href="/rvsf/apply" className="text-brand-red hover:underline">Start an application &rarr;</Link>
          </p>
        </div>
      )}

      {data && meta && (
        <div className="card-feature space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h2 className="text-2xl font-bold">{data.displayName || "Your application"}</h2>
            <span className={`text-sm font-semibold px-3 py-1 rounded ${meta.color}`}>{meta.label}</span>
          </div>
          <p className="text-brand-gray-700">{meta.help}</p>

          <div className="grid grid-cols-2 gap-3 text-sm pt-2 border-t border-brand-gray-100">
            <div>
              <p className="text-brand-gray-500">Submitted</p>
              <p className="font-medium">{fmtDate(data.submittedAt)}</p>
            </div>
            <div>
              <p className="text-brand-gray-500">Last reviewed</p>
              <p className="font-medium">{fmtDate(data.reviewedAt)}</p>
            </div>
          </div>

          {data.status === "pending_more_info" && data.moreInfoQuestion && (
            <div className="border-l-4 border-orange-400 bg-orange-50 p-3 rounded">
              <p className="text-sm font-semibold text-orange-900 mb-1">Question from the review team:</p>
              <p className="text-sm text-orange-900 whitespace-pre-wrap">{data.moreInfoQuestion}</p>
              <Link href="/rvsf/apply" className="inline-block mt-2 text-sm text-brand-red hover:underline">
                Re-submit your application with the answer &rarr;
              </Link>
            </div>
          )}

          {data.status === "rejected_with_notes" && data.rejectionNotes && (
            <div className="border-l-4 border-red-400 bg-red-50 p-3 rounded">
              <p className="text-sm font-semibold text-red-900 mb-1">Review notes:</p>
              <p className="text-sm text-red-900 whitespace-pre-wrap">{data.rejectionNotes}</p>
              <Link href="/rvsf/apply" className="inline-block mt-2 text-sm text-brand-red hover:underline">
                Apply again &rarr;
              </Link>
            </div>
          )}

          {data.status === "active" && (
            <div className="border-l-4 border-green-400 bg-green-50 p-3 rounded">
              <p className="text-sm text-green-900">
                Your RVSF is live. Log in at{" "}
                <Link href="/login" className="font-semibold hover:underline">/login</Link>{" "}
                to access your dashboard.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

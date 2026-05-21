// v2 CC operator first-login interstitial — forced new-password flow.
//
// When does a user reach this page?
//   - Their User.mustChangePassword is `true` (set when an RVSF admin creates
//     the CC under /api/rvsf/ccs — auto-generated password is shown once).
//   - The server-side guards in /cc/dashboard and /cc/leads redirect here.
//
// On success the API clears mustChangePassword and the user can navigate to
// /cc/dashboard from the success state below.

"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Lock, Loader2, ShieldCheck, ArrowRight, Eye, EyeOff, CheckCircle2 } from "lucide-react"

export default function CcFirstLoginPage() {
  const { data: session, status, update } = useSession()
  const router = useRouter()

  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)

  // If they ever land here unauthenticated (e.g. session expired mid-form),
  // bounce to /login so they can re-auth before trying again.
  useEffect(() => {
    if (status === "unauthenticated") router.replace("/login?callbackUrl=/cc/first-login")
  }, [status, router])

  // If a user with mustChangePassword=false somehow lands here (already done it),
  // route to their dashboard rather than show a "redundant" form.
  useEffect(() => {
    if (status !== "authenticated") return
    const u = session?.user as any
    if (u?.role !== "cc_operator") {
      router.replace("/post-login")
      return
    }
    if (u?.mustChangePassword === false) router.replace("/cc/dashboard")
  }, [status, session, router])

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (newPassword.length < 10) {
      setError("New password must be at least 10 characters.")
      return
    }
    if (newPassword !== confirmPassword) {
      setError("New password and confirmation do not match.")
      return
    }
    if (newPassword === currentPassword) {
      setError("New password must differ from the temporary one.")
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch("/api/cc/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(data?.error ?? `Failed (${res.status})`)
        return
      }
      // Refresh the JWT so subsequent server guards see mustChangePassword=false.
      try { await update?.() } catch { /* non-fatal */ }
      setDone(true)
    } catch (e: any) {
      setError(e?.message ?? "Network error")
    } finally {
      setSubmitting(false)
    }
  }

  if (status === "loading") {
    return (
      <div className="h-screen w-full flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-brand-red" />
      </div>
    )
  }

  if (done) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-brand-bg">
        <div className="card-base max-w-md w-full text-center">
          <div className="mx-auto mb-3 w-12 h-12 rounded-full bg-status-success/10 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6 text-status-success" />
          </div>
          <h1 className="text-xl font-bold mb-1">Password updated</h1>
          <p className="text-sm text-brand-gray-700 mb-6">
            Your new password is in effect. You'll use it for every future sign-in.
          </p>
          <button
            type="button"
            onClick={() => router.replace("/cc/dashboard")}
            className="btn-brand inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm"
          >
            Go to dashboard <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-brand-bg">
      <div className="card-base max-w-md w-full">
        <div className="flex items-center gap-2 mb-2">
          <ShieldCheck className="w-5 h-5 text-brand-red" />
          <h1 className="text-xl font-bold">Set a new password</h1>
        </div>
        <p className="text-sm text-brand-gray-700 mb-6">
          Your account is using the temporary password issued by your RVSF.
          Choose a new one before continuing.
        </p>

        <form onSubmit={onSubmit} className="space-y-4">
          <label className="block">
            <span className="block text-xs font-bold text-brand-gray-700 uppercase tracking-wider mb-1">
              Temporary password
            </span>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-gray-500" />
              <input
                type={showCurrent ? "text" : "password"}
                required
                autoComplete="current-password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full pl-9 pr-9 py-2.5 rounded-lg border border-brand-gray-300 bg-white focus:border-brand-red focus:ring-2 focus:ring-brand-red/10 outline-none text-sm"
              />
              <button
                type="button"
                onClick={() => setShowCurrent((s) => !s)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-brand-gray-500 hover:text-brand-gray-700 p-1"
                aria-label={showCurrent ? "Hide password" : "Show password"}
              >
                {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </label>

          <label className="block">
            <span className="block text-xs font-bold text-brand-gray-700 uppercase tracking-wider mb-1">
              New password
            </span>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-gray-500" />
              <input
                type={showNew ? "text" : "password"}
                required
                minLength={10}
                autoComplete="new-password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full pl-9 pr-9 py-2.5 rounded-lg border border-brand-gray-300 bg-white focus:border-brand-red focus:ring-2 focus:ring-brand-red/10 outline-none text-sm"
              />
              <button
                type="button"
                onClick={() => setShowNew((s) => !s)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-brand-gray-500 hover:text-brand-gray-700 p-1"
                aria-label={showNew ? "Hide password" : "Show password"}
              >
                {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="mt-1 text-[11px] text-brand-gray-500">Minimum 10 characters.</p>
          </label>

          <label className="block">
            <span className="block text-xs font-bold text-brand-gray-700 uppercase tracking-wider mb-1">
              Confirm new password
            </span>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-gray-500" />
              <input
                type={showNew ? "text" : "password"}
                required
                minLength={10}
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-brand-gray-300 bg-white focus:border-brand-red focus:ring-2 focus:ring-brand-red/10 outline-none text-sm"
              />
            </div>
          </label>

          {error && (
            <p className="text-sm text-status-error bg-brand-red-light border border-brand-red/20 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full btn-brand py-2.5 text-sm inline-flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            {submitting ? "Updating…" : "Set new password"}
          </button>
        </form>
      </div>
    </div>
  )
}

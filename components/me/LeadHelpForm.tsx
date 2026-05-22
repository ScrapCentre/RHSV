// "I need to change something" — opens a small contact-form drawer that
// POSTs to the existing /api/contact endpoint (Contact model) so an admin
// can pick it up from the existing /admin/contact queue. Prefilled with
// the user's name + email + the lead vehicle so the customer doesn't have
// to retype.
"use client"

import { useState } from "react"

type Props = {
  leadId: string
  defaultName?: string
  defaultEmail?: string
  defaultPhone?: string
  vehicleSummary: string  // e.g. "DL01CD5678 — Honda City"
}

export default function LeadHelpForm({
  leadId,
  defaultName,
  defaultEmail,
  defaultPhone,
  vehicleSummary,
}: Props) {
  const [open, setOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState("")
  const [name, setName] = useState(defaultName ?? "")
  const [email, setEmail] = useState(defaultEmail ?? "")
  const [phone, setPhone] = useState(defaultPhone ?? "")

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (!message.trim()) {
      setError("Please tell us what needs to change.")
      return
    }
    if (!name.trim() || !email.trim() || !phone.trim()) {
      setError("Name, email, and phone are required.")
      return
    }
    setSubmitting(true)
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          phone,
          subject: `Lead support — ${vehicleSummary} (#${leadId.slice(-6)})`,
          // Include the leadId in the body so an admin can jump straight to
          // the lead detail page when triaging the queue.
          message: `${message}\n\n---\nLead ID: ${leadId}\nVehicle: ${vehicleSummary}`,
        }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error ?? `Submission failed (${res.status})`)
      }
      setDone(true)
      setMessage("")
    } catch (e: any) {
      setError(e.message ?? "Couldn't send. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="text-sm text-brand-red hover:underline"
      >
        I need to change something →
      </button>
    )
  }

  if (done) {
    return (
      <div className="card-base bg-brand-red-xlight border-brand-red-light">
        <p className="font-bold text-brand-red mb-1">Got it — we'll be in touch.</p>
        <p className="text-sm text-brand-gray-700">
          Our team has been notified. We'll reach out on {phone || "your phone"} or {email || "your email"} shortly.
        </p>
        <button
          onClick={() => { setDone(false); setOpen(false) }}
          className="text-sm text-brand-red hover:underline mt-3"
        >
          Close
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={submit} className="card-base space-y-3">
      <div className="flex items-center justify-between">
        <p className="font-bold">Tell us what needs to change</p>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="text-sm text-brand-gray-500 hover:text-brand-red"
          aria-label="Close"
        >
          ✕
        </button>
      </div>

      {error && (
        <div className="text-sm text-status-error bg-brand-red-xlight border border-brand-red-light rounded-md px-3 py-2">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        <input
          type="text"
          placeholder="Your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="px-3 py-2 border border-brand-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-brand-red"
          required
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="px-3 py-2 border border-brand-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-brand-red"
          required
        />
        <input
          type="tel"
          placeholder="Phone"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="px-3 py-2 border border-brand-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-brand-red"
          required
        />
      </div>

      <textarea
        placeholder="e.g. Pickup address has changed — please update"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        rows={4}
        className="w-full px-3 py-2 border border-brand-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-brand-red"
        required
      />

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={submitting}
          className="btn-brand px-4 py-2 text-sm disabled:opacity-50"
        >
          {submitting ? "Sending…" : "Send to support"}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          disabled={submitting}
          className="px-4 py-2 text-sm text-brand-gray-700 hover:text-brand-red"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}

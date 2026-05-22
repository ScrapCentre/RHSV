// M10 — RVSF admin: create a new Collection Center.
// On success, displays the auto-generated CC operator credentials ONCE
// per L25 (RVSF admin copies + shares out-of-band; operator force-changes
// on first login).
"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { apiFetch } from "@/lib/fetch"

export default function NewCcPage() {
  const router = useRouter()
  const [form, setForm] = useState({
    city: "",
    state: "",
    address: { line1: "", line2: "", city: "", state: "", pincode: "" },
    catchment: { center: { lng: "", lat: "" }, radiusKm: 50 },
    contact: { name: "", phone: "", email: "" },
  })
  const [creds, setCreds] = useState<{ loginEmail: string; loginPassword: string; note: string } | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function update(path: string, value: any) {
    const parts = path.split(".")
    setForm((f: any) => {
      const copy = { ...f }
      let cur = copy
      for (let i = 0; i < parts.length - 1; i++) {
        cur[parts[i]] = { ...cur[parts[i]] }
        cur = cur[parts[i]]
      }
      cur[parts[parts.length - 1]] = value
      return copy
    })
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      const res = await apiFetch("/api/rvsf/ccs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          city: form.city,
          state: form.state,
          address: { ...form.address, city: form.address.city || form.city, state: form.address.state || form.state },
          catchment: {
            center: { lng: Number(form.catchment.center.lng), lat: Number(form.catchment.center.lat) },
            radiusKm: Number(form.catchment.radiusKm),
          },
          contact: form.contact,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? "Failed to create CC")
        return
      }
      setCreds(data.operatorCredentials)
    } catch (e: any) {
      setError(e?.message ?? "Network error")
    } finally {
      setSubmitting(false)
    }
  }

  if (creds) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4">
        <div className="card-base">
          <h1 className="text-2xl font-bold mb-2">CC created ✓</h1>
          <p className="text-brand-gray-700 mb-6">
            Share these credentials with the CC operator out of band (e.g. via WhatsApp).
            <strong> This page will not show the password again.</strong>
          </p>
          <div className="bg-brand-red-light border border-brand-red rounded p-4 mb-6">
            <p className="font-medium mb-2">Login email</p>
            <code className="block bg-white px-3 py-2 rounded font-mono text-sm">{creds.loginEmail}</code>
            <p className="font-medium mt-4 mb-2">One-time password</p>
            <code className="block bg-white px-3 py-2 rounded font-mono text-sm">{creds.loginPassword}</code>
            <p className="text-xs text-brand-gray-700 mt-3">{creds.note}</p>
          </div>
          <Link href="/rvsf/ccs" className="btn-brand px-5 py-2.5 inline-block">
            Done — back to CC list
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto py-10 px-4">
      <Link href="/rvsf/ccs" className="text-sm text-brand-gray-500 hover:text-brand-red">← Back to CC list</Link>
      <h1 className="text-3xl font-bold mt-4 mb-2">Add a new Collection Center</h1>
      <p className="text-brand-gray-700 mb-8">
        Your CC will be visible on the public find-your-nearest widget once approved.
      </p>

      <form onSubmit={submit} className="card-base space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium mb-1">City</label>
            <input
              value={form.city}
              onChange={(e) => update("city", e.target.value)}
              required
              className="w-full border border-brand-gray-300 rounded px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">State</label>
            <input
              value={form.state}
              onChange={(e) => update("state", e.target.value)}
              required
              className="w-full border border-brand-gray-300 rounded px-3 py-2"
            />
          </div>
        </div>

        <h2 className="font-bold pt-4">Address</h2>
        {([
          ["address.line1", "Line 1"],
          ["address.line2", "Line 2 (optional)"],
          ["address.pincode", "Pincode"],
        ] as const).map(([k, label]) => (
          <div key={k}>
            <label className="block text-sm font-medium mb-1">{label}</label>
            <input
              value={(form.address as any)[k.split(".")[1]]}
              onChange={(e) => update(k, e.target.value)}
              className="w-full border border-brand-gray-300 rounded px-3 py-2"
            />
          </div>
        ))}

        <h2 className="font-bold pt-4">Catchment</h2>
        <p className="text-xs text-brand-gray-500">
          Per the locked decision, each CC has its own circular catchment.
          Set the centre coordinates of your yard and the radius (km) within
          which leads will be visible to this CC.
        </p>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-sm font-medium mb-1">Center latitude</label>
            <input
              value={form.catchment.center.lat}
              onChange={(e) => update("catchment.center.lat", e.target.value)}
              placeholder="26.45"
              required
              className="w-full border border-brand-gray-300 rounded px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Center longitude</label>
            <input
              value={form.catchment.center.lng}
              onChange={(e) => update("catchment.center.lng", e.target.value)}
              placeholder="79.51"
              required
              className="w-full border border-brand-gray-300 rounded px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Radius (km)</label>
            <input
              type="number"
              min={5}
              max={500}
              value={form.catchment.radiusKm}
              onChange={(e) => update("catchment.radiusKm", Number(e.target.value))}
              className="w-full border border-brand-gray-300 rounded px-3 py-2"
            />
          </div>
        </div>

        <h2 className="font-bold pt-4">CC operator contact (will become the first login)</h2>
        {([
          ["contact.name", "Operator name"],
          ["contact.phone", "Phone (+91...)"],
          ["contact.email", "Email (login id)"],
        ] as const).map(([k, label]) => (
          <div key={k}>
            <label className="block text-sm font-medium mb-1">{label}</label>
            <input
              value={(form.contact as any)[k.split(".")[1]]}
              onChange={(e) => update(k, e.target.value)}
              required
              className="w-full border border-brand-gray-300 rounded px-3 py-2"
            />
          </div>
        ))}

        {error && <p className="text-status-error font-medium">{error}</p>}

        <div className="flex justify-end pt-4">
          <button type="submit" disabled={submitting} className="btn-brand px-6 py-3">
            {submitting ? "Creating…" : "Create CC + generate operator login"}
          </button>
        </div>
      </form>
    </div>
  )
}

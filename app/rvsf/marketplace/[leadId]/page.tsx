// M11 — Marketplace lead detail page with Unlock CTA.
"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { apiFetch } from "@/lib/fetch"

type LeadDetail = {
  _id: string
  vehicle: any
  pickupCity?: string
  pickupState?: string
  quality: string
  calc: { scrapValueLow: number; scrapValueHigh: number }
  state: string
}

type UnlockPreview = {
  amountPaise: number
  amountDisplay: string
  basisWeightKg: number
  pricePerKg: number
}

export default function MarketplaceLeadDetailPage() {
  const params = useParams<{ leadId: string }>()
  const router = useRouter()
  const [lead, setLead] = useState<LeadDetail | null>(null)
  const [preview, setPreview] = useState<UnlockPreview | null>(null)
  const [loading, setLoading] = useState(true)
  const [unlocking, setUnlocking] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [order, setOrder] = useState<any>(null)

  useEffect(() => {
    fetch(`/api/marketplace/leads/${params.leadId}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.error) setError(d.error)
        else { setLead(d.lead); setPreview(d.unlockPreview) }
      })
      .catch((e) => setError(e?.message ?? "Network error"))
      .finally(() => setLoading(false))
  }, [params.leadId])

  async function handleUnlock() {
    if (!lead) return
    setUnlocking(true)
    setError(null)
    try {
      const res = await apiFetch(`/api/leads/${lead._id}/unlock`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? "Unlock failed")
        return
      }
      setOrder(data)
      // In M13 the real flow opens the Razorpay checkout modal:
      //   const rzp = new (window as any).Razorpay({
      //     key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      //     order_id: data.orderId,
      //     amount: data.amountPaise,
      //     handler: (resp: any) => POST /api/payments/razorpay/verify
      //   })
      //   rzp.open()
    } catch (e: any) {
      setError(e?.message ?? "Network error")
    } finally {
      setUnlocking(false)
    }
  }

  if (loading) return <p className="text-brand-gray-500 max-w-3xl mx-auto py-8 px-4">Loading…</p>
  if (error && !lead) return <p className="text-status-error max-w-3xl mx-auto py-8 px-4">{error}</p>
  if (!lead) return null

  if (order) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4">
        <div className="card-base text-center">
          <div className="text-4xl mb-4">💳</div>
          <h2 className="text-2xl font-bold mb-2">Order created</h2>
          <p className="text-brand-gray-700 mb-4">
            Razorpay order ID: <code className="font-mono">{order.orderId}</code>
          </p>
          <p className="text-brand-gray-700 mb-6">
            Amount: <strong>₹{(order.amountPaise / 100).toFixed(2)}</strong>
            <br />
            <span className="text-sm text-brand-gray-500">
              ({order.basisWeightKg} kg × ₹{order.pricePerKg}/kg)
            </span>
          </p>
          <p className="text-sm text-brand-gray-500">
            Razorpay checkout integration lands in M13. For now this is a
            mock order; the chat thread + lead unlock will fire when the
            webhook handler is wired.
          </p>
          <Link href="/rvsf/marketplace" className="btn-brand mt-6 inline-block px-5 py-2.5">
            Back to marketplace
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <Link href="/rvsf/marketplace" className="text-sm text-brand-gray-500 hover:text-brand-red">← Back to marketplace</Link>

      <div className="card-base mt-4">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-xs font-mono text-brand-gray-500">{lead.vehicle.registrationNumber}</p>
            <h1 className="text-2xl font-bold">{lead.vehicle.year} {lead.vehicle.make} {lead.vehicle.model}</h1>
            <p className="text-brand-gray-700">{lead.vehicle.class} · {lead.vehicle.fuelType}</p>
          </div>
          <span className={`badge-${lead.quality}`}>{lead.quality.toUpperCase()}</span>
        </div>

        <div className="grid grid-cols-2 gap-4 my-6">
          <div>
            <p className="text-xs text-brand-gray-500 uppercase font-bold">Charge basis weight</p>
            <p className="text-xl font-bold">{lead.vehicle.chargeBasisWeightKg} kg</p>
          </div>
          <div>
            <p className="text-xs text-brand-gray-500 uppercase font-bold">Est. scrap value</p>
            <p className="text-xl font-bold">
              ₹{lead.calc.scrapValueLow.toLocaleString("en-IN")}–{lead.calc.scrapValueHigh.toLocaleString("en-IN")}
            </p>
          </div>
        </div>

        {/* Blurred photos — pre-unlock teaser */}
        <div>
          <p className="text-xs text-brand-gray-500 uppercase font-bold mb-2">Photos (unlocked after purchase)</p>
          <div className="grid grid-cols-4 gap-2">
            {(lead.vehicle.photos ?? []).slice(0, 4).map((p: any, i: number) => (
              <div key={i} className="aspect-square bg-brand-gray-100 rounded relative overflow-hidden">
                {p.blurredUrl && <img src={p.blurredUrl} alt="" className="w-full h-full object-cover blur-md" />}
                <span className="absolute inset-0 flex items-center justify-center text-brand-gray-500 text-xs">🔒</span>
              </div>
            ))}
            {(lead.vehicle.photos ?? []).length === 0 && (
              <div className="col-span-4 text-center py-6 text-brand-gray-500 text-sm">No photos uploaded yet</div>
            )}
          </div>
        </div>

        {preview && (
          <div className="border-t border-brand-gray-300 mt-6 pt-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
              <div>
                <p className="text-sm text-brand-gray-700">Unlock fee</p>
                <p className="text-2xl sm:text-3xl font-bold">{preview.amountDisplay}</p>
                <p className="text-xs text-brand-gray-500">
                  {preview.basisWeightKg} kg × ₹{preview.pricePerKg}/kg
                </p>
              </div>
              <button
                onClick={handleUnlock}
                disabled={unlocking}
                className="btn-brand px-6 py-3 text-base sm:text-lg w-full sm:w-auto"
              >
                {unlocking ? "Creating order…" : `Unlock for ${preview.amountDisplay}`}
              </button>
            </div>
            <p className="text-xs text-brand-gray-500">
              First RVSF to complete payment wins the lead. Chat opens
              automatically; customer is notified by Email + WhatsApp + in-app.
            </p>
          </div>
        )}

        {error && <p className="text-status-error mt-4 font-medium">{error}</p>}
      </div>
    </div>
  )
}

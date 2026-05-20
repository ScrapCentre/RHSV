// M19 — DigiELV concierge checklist (customer + RVSF variants).
// Consumes GET /api/digielv/checklist/[leadId].
"use client"

import { useEffect, useState } from "react"

type Step = {
  num: number
  audience: "customer" | "rvsf"
  title: string
  body: string
  outboundUrl?: string
  inputPrompt?: string
  status: "pending" | "done"
  warningBanner?: string
}

export type DigiElvProps = {
  leadId: string
  audience: "customer" | "rvsf"
}

export default function DigiElvChecklist({ leadId, audience }: DigiElvProps) {
  const [steps, setSteps] = useState<Step[]>([])
  const [appId, setAppId] = useState("")
  const [cdNumber, setCdNumber] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  async function load() {
    setLoading(true)
    try {
      const res = await fetch(`/api/digielv/checklist/${leadId}`)
      const data = await res.json()
      if (!res.ok) { setError(data.error); return }
      setSteps(audience === "customer" ? data.customer : data.rvsf)
      if (data.lead?.digiElvAppId) setAppId(data.lead.digiElvAppId)
      if (data.lead?.digiElvCdNumber) setCdNumber(data.lead.digiElvCdNumber)
    } catch (e: any) {
      setError(e?.message ?? "Network error")
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => { load() }, [leadId])

  async function postBack(field: "digiElvAppId" | "digiElvCdNumber", value: string) {
    await fetch(`/api/digielv/checklist/${leadId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [field]: value }),
    })
    await load()
  }

  if (loading) return <p className="text-brand-gray-500 text-sm">Loading checklist…</p>
  if (error) return <p className="text-status-error text-sm">{error}</p>

  return (
    <div className="space-y-3">
      <h3 className="font-bold text-lg">
        {audience === "customer" ? "Your scrap & sell journey" : "DigiELV operator checklist"}
      </h3>
      {steps.map((s) => (
        <div key={s.num} className={`p-3 rounded border ${s.status === "done" ? "bg-status-success/5 border-status-success/30" : "bg-white border-brand-gray-300"}`}>
          <div className="flex items-start gap-2">
            <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${s.status === "done" ? "bg-status-success text-white" : "bg-brand-gray-100 text-brand-gray-700"}`}>
              {s.status === "done" ? "✓" : s.num}
            </span>
            <div className="flex-1">
              <p className="font-medium">{s.title}</p>
              <p className="text-sm text-brand-gray-700 mt-1 whitespace-pre-wrap">{s.body}</p>
              {s.warningBanner && (
                <div className="mt-2 p-2 bg-status-warning/10 border border-status-warning rounded text-xs">
                  {s.warningBanner}
                </div>
              )}
              {s.outboundUrl && (
                <a
                  href={s.outboundUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block mt-2 text-sm text-brand-red underline"
                >Open {s.outboundUrl.replace(/https?:\/\//, "").split("/")[0]} ↗</a>
              )}
              {/* Paste-back inputs (customer-side only) */}
              {audience === "customer" && s.inputPrompt && s.num === 1 && (
                <div className="mt-2 flex gap-2">
                  <input
                    value={appId}
                    onChange={(e) => setAppId(e.target.value)}
                    placeholder={s.inputPrompt}
                    className="flex-1 border border-brand-gray-300 rounded px-2 py-1 text-sm"
                  />
                  <button
                    onClick={() => postBack("digiElvAppId", appId)}
                    disabled={!appId}
                    className="btn-brand px-3 py-1 text-sm"
                  >Save</button>
                </div>
              )}
              {audience === "customer" && s.inputPrompt && s.num === 4 && (
                <div className="mt-2 flex gap-2">
                  <input
                    value={cdNumber}
                    onChange={(e) => setCdNumber(e.target.value)}
                    placeholder={s.inputPrompt}
                    className="flex-1 border border-brand-gray-300 rounded px-2 py-1 text-sm"
                  />
                  <button
                    onClick={() => postBack("digiElvCdNumber", cdNumber)}
                    disabled={!cdNumber}
                    className="btn-brand px-3 py-1 text-sm"
                  >Save</button>
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

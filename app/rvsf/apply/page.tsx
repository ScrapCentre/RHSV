// M09 — public RVSF self-serve apply page.
// Single long form. Cloudinary upload pattern is "client uploads via signed
// URL → posts the returned URL back as part of the form". v2 wires this
// via the existing app/api/cloudinary-upload pattern Novalytix has.
"use client"

import { useState } from "react"
import Link from "next/link"

type Step = "intro" | "details" | "kyc" | "review" | "done"

export default function RvsfApplyPage() {
  const [step, setStep] = useState<Step>("intro")
  const [form, setForm] = useState<any>({
    legalName: "",
    displayName: "",
    slug: "",
    gstNumber: "",
    panNumber: "",
    cpcbAuthNumber: "",
    address: { line1: "", line2: "", city: "", state: "", pincode: "" },
    primaryYardCoordinates: { lng: "", lat: "" },
    bankAccount: { accountName: "", accountNumber: "", ifsc: "", bankName: "", cancelledChequeUrl: "" },
    kycDocs: {
      panCardUrl: "", gstCertUrl: "", cpcbAuthUrl: "", morthAuthLetterUrl: "",
      addressProofUrl: "", signatoryIdUrl: "", cancelledChequeUrl: "",
    },
    signatoryName: "",
    signatoryDesignation: "",
    signatoryAadhaarLast4: "",
  })
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

  async function submit() {
    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch("/api/rvsf/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          primaryYardCoordinates: {
            lng: Number(form.primaryYardCoordinates.lng),
            lat: Number(form.primaryYardCoordinates.lat),
          },
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? "Application failed")
        return
      }
      setStep("done")
    } catch (e: any) {
      setError(e?.message ?? "Network error")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto py-12 px-4">
      <Link href="/" className="text-sm text-brand-gray-500 hover:text-brand-red">← Back</Link>
      <h1 className="text-3xl font-bold mt-4 mb-2">Apply to become an RVSF partner</h1>
      <p className="text-brand-gray-700 mb-8">
        Browse leads in your service area for free — your KYC review takes 2 business hours.
        Once approved, you can unlock leads at ₹0.75 per kg.
      </p>

      {step === "intro" && (
        <div className="card-base">
          <h2 className="text-xl font-bold mb-4">What you'll need</h2>
          <ul className="space-y-2 list-disc pl-6 text-brand-gray-700">
            <li>PAN card (PDF or image)</li>
            <li>GST registration certificate</li>
            <li>CPCB authorisation letter</li>
            <li>MoRTH RVSF authorisation letter</li>
            <li>Address proof (utility bill or lease deed)</li>
            <li>Authorised signatory's ID proof</li>
            <li>Cancelled cheque (for refund/settlement)</li>
          </ul>
          <button
            onClick={() => setStep("details")}
            className="btn-brand mt-6 px-6 py-3"
          >Start application →</button>
        </div>
      )}

      {step === "details" && (
        <div className="card-base space-y-4">
          <h2 className="text-xl font-bold">Step 1 · Identity</h2>
          {([
            ["legalName", "Legal name (as on PAN/GST)"],
            ["displayName", "Display name (as customers see you)"],
            ["slug", "URL slug (e.g. auraiya-rvsf)"],
            ["gstNumber", "GST number"],
            ["panNumber", "PAN number"],
            ["cpcbAuthNumber", "CPCB authorisation number"],
          ] as const).map(([k, label]) => (
            <div key={k}>
              <label className="block text-sm font-medium mb-1">{label}</label>
              <input
                value={form[k]}
                onChange={(e) => update(k, e.target.value)}
                className="w-full border border-brand-gray-300 rounded px-3 py-2"
              />
            </div>
          ))}
          <h3 className="text-lg font-bold pt-4">Primary yard address</h3>
          {([
            ["address.line1", "Line 1"],
            ["address.line2", "Line 2 (optional)"],
            ["address.city", "City"],
            ["address.state", "State"],
            ["address.pincode", "Pincode"],
          ] as const).map(([k, label]) => (
            <div key={k}>
              <label className="block text-sm font-medium mb-1">{label}</label>
              <input
                value={form.address[k.split(".")[1]]}
                onChange={(e) => update(k, e.target.value)}
                className="w-full border border-brand-gray-300 rounded px-3 py-2"
              />
            </div>
          ))}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">Yard latitude</label>
              <input
                value={form.primaryYardCoordinates.lat}
                onChange={(e) => update("primaryYardCoordinates.lat", e.target.value)}
                placeholder="e.g. 26.45"
                className="w-full border border-brand-gray-300 rounded px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Yard longitude</label>
              <input
                value={form.primaryYardCoordinates.lng}
                onChange={(e) => update("primaryYardCoordinates.lng", e.target.value)}
                placeholder="e.g. 79.51"
                className="w-full border border-brand-gray-300 rounded px-3 py-2"
              />
            </div>
          </div>
          <div className="flex justify-end">
            <button onClick={() => setStep("kyc")} className="btn-brand px-6 py-3">Next →</button>
          </div>
        </div>
      )}

      {step === "kyc" && (
        <div className="card-base space-y-4">
          <h2 className="text-xl font-bold">Step 2 · KYC docs + bank</h2>
          <p className="text-sm text-brand-gray-500">
            Upload each document and paste the URL here. (Real upload integration via Cloudinary
            signed-upload is wired in M19; for now, paste a placeholder URL to test the flow.)
          </p>
          {(Object.entries(form.kycDocs) as [string, string][]).map(([k, _v]) => (
            <div key={k}>
              <label className="block text-sm font-medium mb-1">{k}</label>
              <input
                value={form.kycDocs[k]}
                onChange={(e) => update(`kycDocs.${k}`, e.target.value)}
                placeholder="https://res.cloudinary.com/..."
                className="w-full border border-brand-gray-300 rounded px-3 py-2"
              />
            </div>
          ))}
          {(["signatoryName", "signatoryDesignation", "signatoryAadhaarLast4"] as const).map((k) => (
            <div key={k}>
              <label className="block text-sm font-medium mb-1">{k}</label>
              <input
                value={form[k]}
                onChange={(e) => update(k, e.target.value)}
                className="w-full border border-brand-gray-300 rounded px-3 py-2"
              />
            </div>
          ))}
          <h3 className="text-lg font-bold pt-4">Bank account</h3>
          {(["accountName", "accountNumber", "ifsc", "bankName", "cancelledChequeUrl"] as const).map((k) => (
            <div key={k}>
              <label className="block text-sm font-medium mb-1">bankAccount.{k}</label>
              <input
                value={form.bankAccount[k]}
                onChange={(e) => update(`bankAccount.${k}`, e.target.value)}
                className="w-full border border-brand-gray-300 rounded px-3 py-2"
              />
            </div>
          ))}
          <div className="flex justify-between">
            <button onClick={() => setStep("details")} className="text-brand-gray-500">← Back</button>
            <button onClick={() => setStep("review")} className="btn-brand px-6 py-3">Review →</button>
          </div>
        </div>
      )}

      {step === "review" && (
        <div className="card-base space-y-4">
          <h2 className="text-xl font-bold">Step 3 · Review + submit</h2>
          <pre className="text-xs bg-brand-gray-100 p-4 rounded overflow-x-auto max-h-96">
            {JSON.stringify(form, null, 2)}
          </pre>
          {error && (
            <p className="text-status-error font-medium">{error}</p>
          )}
          <div className="flex justify-between">
            <button onClick={() => setStep("kyc")} className="text-brand-gray-500">← Back</button>
            <button onClick={submit} disabled={submitting} className="btn-brand px-6 py-3">
              {submitting ? "Submitting…" : "Submit application"}
            </button>
          </div>
        </div>
      )}

      {step === "done" && (
        <div className="card-base text-center py-12">
          <div className="text-4xl mb-4">✓</div>
          <h2 className="text-2xl font-bold mb-2">Application received</h2>
          <p className="text-brand-gray-700">
            Our team will schedule a KYC video call within 2 business hours.
            You'll receive an email with login credentials once approved.
          </p>
        </div>
      )}
    </div>
  )
}

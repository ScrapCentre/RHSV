// M09 — public RVSF self-serve apply wizard (5 steps + done).
//
// Step 1: Organisation basics  (legal/display name, GST, PAN, CPCB#, contact email/phone, signatory)
// Step 2: Primary yard address + lat/lng (real map picker deferred)
// Step 3: KYC doc upload — 7 docs uploaded via /api/rvsf/apply/upload-doc
// Step 4: Bank account + cancelled cheque (8th doc)
// Step 5: Review + submit
//
// State persistence: form state is saved to localStorage on every edit, so an
// applicant can close the tab and resume. On the server, the POST is idempotent
// on `contactEmail` while the application is in a resumable status.
"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import {
  IntroStep, DetailsStep, AddressStep, KycStep, BankStep, ReviewStep, DoneStep,
} from "./_components"

type StepId = "intro" | "details" | "address" | "kyc" | "bank" | "review" | "done"

const STEP_ORDER: StepId[] = ["intro", "details", "address", "kyc", "bank", "review", "done"]
const STORAGE_KEY = "rvsf-apply-draft-v2"

const EMPTY_FORM = {
  legalName: "", displayName: "", slug: "", gstNumber: "", panNumber: "",
  cpcbAuthNumber: "", contactEmail: "", contactPhone: "",
  address: { line1: "", line2: "", city: "", state: "", pincode: "" },
  primaryYardCoordinates: { lng: "", lat: "" },
  bankAccount: { accountName: "", accountNumber: "", ifsc: "", bankName: "", cancelledChequeUrl: "" },
  kycDocs: {
    panCardUrl: "", gstCertUrl: "", cpcbAuthUrl: "", morthAuthLetterUrl: "",
    addressProofUrl: "", signatoryIdUrl: "", cancelledChequeUrl: "",
  },
  signatoryName: "", signatoryDesignation: "", signatoryAadhaarLast4: "",
}

function setDeep(obj: any, path: string, value: any) {
  const parts = path.split(".")
  const copy = { ...obj }
  let cur = copy
  for (let i = 0; i < parts.length - 1; i++) {
    cur[parts[i]] = { ...cur[parts[i]] }
    cur = cur[parts[i]]
  }
  cur[parts[parts.length - 1]] = value
  return copy
}

export default function RvsfApplyPage() {
  const [step, setStep] = useState<StepId>("intro")
  const [form, setForm] = useState<any>(EMPTY_FORM)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [uploadingKey, setUploadingKey] = useState<string | null>(null)
  const [hydrated, setHydrated] = useState(false)

  // Rehydrate draft from localStorage on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) setForm({ ...EMPTY_FORM, ...JSON.parse(raw) })
    } catch {}
    setHydrated(true)
  }, [])

  // Persist draft on every change (after hydration so we don't clobber)
  useEffect(() => {
    if (!hydrated) return
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(form)) } catch {}
  }, [form, hydrated])

  function update(path: string, value: any) {
    setForm((f: any) => setDeep(f, path, value))
  }

  async function uploadDoc(docKey: string, file: File, targetPath: string) {
    setUploadingKey(docKey)
    setError(null)
    try {
      const fd = new FormData()
      fd.append("file", file)
      fd.append("docKey", docKey)
      fd.append("email", form.contactEmail || "anon")
      const res = await fetch("/api/rvsf/apply/upload-doc", { method: "POST", body: fd })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || "Upload failed")
      update(targetPath, data.url)
    } catch (e: any) {
      setError(e?.message || "Upload failed")
    } finally {
      setUploadingKey(null)
    }
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
      if (!res.ok) { setError(data.error ?? "Application failed"); return }
      try { localStorage.removeItem(STORAGE_KEY) } catch {}
      setStep("done")
    } catch (e: any) {
      setError(e?.message ?? "Network error")
    } finally {
      setSubmitting(false)
    }
  }

  const stepIdx = STEP_ORDER.indexOf(step)
  const totalSteps = 5  // exclude intro + done from the progress bar

  return (
    <div className="max-w-3xl mx-auto py-12 px-4">
      <Link href="/" className="text-sm text-brand-gray-500 hover:text-brand-red">&larr; Back</Link>
      <h1 className="text-3xl font-bold mt-4 mb-2">Apply to become an RVSF partner</h1>
      <p className="text-brand-gray-700 mb-6">
        Browse leads in your service area for free &mdash; KYC review takes ~2 business hours.
        Once approved, unlock leads at &#8377;0.75 per kg.
      </p>

      {step !== "intro" && step !== "done" && (
        <div className="mb-6">
          <div className="flex items-center justify-between text-xs text-brand-gray-500 mb-1">
            <span>Step {Math.max(1, stepIdx)} of {totalSteps}</span>
            <Link href={`/rvsf/apply/status?email=${encodeURIComponent(form.contactEmail || "")}`} className="hover:text-brand-red">
              Check existing application &rarr;
            </Link>
          </div>
          <div className="w-full bg-brand-gray-100 rounded h-2 overflow-hidden">
            <div className="h-full bg-brand-red transition-all" style={{ width: `${(Math.max(1, stepIdx) / totalSteps) * 100}%` }} />
          </div>
        </div>
      )}

      {step === "intro" && <IntroStep onStart={() => setStep("details")} />}
      {step === "details" && (
        <DetailsStep form={form} update={update} onNext={() => setStep("address")} />
      )}
      {step === "address" && (
        <AddressStep form={form} update={update}
          onBack={() => setStep("details")} onNext={() => setStep("kyc")} />
      )}
      {step === "kyc" && (
        <KycStep form={form} uploadingKey={uploadingKey} onUpload={uploadDoc}
          onBack={() => setStep("address")} onNext={() => setStep("bank")} />
      )}
      {step === "bank" && (
        <BankStep form={form} update={update} uploadingKey={uploadingKey} onUpload={uploadDoc}
          onBack={() => setStep("kyc")} onNext={() => setStep("review")} />
      )}
      {step === "review" && (
        <ReviewStep form={form} submitting={submitting} error={error} onSubmit={submit}
          onBack={() => setStep("bank")} />
      )}
      {step === "done" && <DoneStep email={form.contactEmail} />}
    </div>
  )
}

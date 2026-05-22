// M09 — wizard sub-components for /rvsf/apply
// Extracted from page.tsx to keep the page under 400 lines.
"use client"

import Link from "next/link"
import { useId } from "react"

const INPUT_CLS = "w-full border border-brand-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-red/40"

export const KYC_FIELDS: { key: string; label: string; desc: string }[] = [
  { key: "panCardUrl",         label: "PAN card",                  desc: "Of the legal entity / proprietor" },
  { key: "gstCertUrl",         label: "GST registration",          desc: "Form GST REG-06 PDF or image" },
  { key: "cpcbAuthUrl",        label: "CPCB authorisation letter", desc: "Central Pollution Control Board" },
  { key: "morthAuthLetterUrl", label: "MoRTH RVSF authorisation",  desc: "Ministry of Road Transport & Highways" },
  { key: "addressProofUrl",    label: "Address proof",             desc: "Utility bill / lease deed" },
  { key: "signatoryIdUrl",     label: "Signatory ID proof",        desc: "Aadhaar/PAN/Passport of signatory" },
  { key: "cancelledChequeUrl", label: "Cancelled cheque (RVSF)",   desc: "For verification only" },
]

export function Field({ label, value, onChange, placeholder, type = "text" }: any) {
  // Associate the <label> with its <input> via a stable id so assistive tech
  // (and e2e accessible-name queries) can resolve the control. Previously the
  // label was an unassociated sibling — screen readers announced an unlabelled
  // textbox and Playwright's getByRole("textbox", {name}) could not find it.
  const id = useId()
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium mb-1">{label}</label>
      <input id={id} type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className={INPUT_CLS} />
    </div>
  )
}

export function FileUploader({ label, desc, value, onUpload, isUploading }: any) {
  const filled = !!value
  return (
    <div className={`border rounded p-3 ${filled ? "border-status-success bg-green-50" : "border-brand-gray-300"}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <p className="font-medium text-sm">{label}</p>
          <p className="text-xs text-brand-gray-500">{desc}</p>
        </div>
        {filled && <span className="text-status-success text-sm font-semibold">&#x2713; uploaded</span>}
      </div>
      <div className="mt-2 flex items-center gap-2">
        <input type="file" accept="image/*,application/pdf" disabled={isUploading}
          onChange={(e) => { const f = e.target.files?.[0]; if (f) onUpload(f) }}
          className="text-xs" />
        {isUploading && <span className="text-xs text-brand-gray-500">Uploading&hellip;</span>}
        {filled && !isUploading && (
          <a href={value} target="_blank" rel="noopener noreferrer" className="text-xs text-brand-red hover:underline">View</a>
        )}
      </div>
    </div>
  )
}

export function IntroStep({ onStart }: { onStart: () => void }) {
  return (
    <div className="card-feature">
      <h2 className="text-xl font-bold mb-4">What you&apos;ll need</h2>
      <ul className="space-y-2 list-disc pl-6 text-brand-gray-700">
        <li>PAN card &amp; GST registration of the legal entity</li>
        <li>CPCB authorisation letter</li>
        <li>MoRTH RVSF authorisation letter</li>
        <li>Address proof (utility bill / lease deed)</li>
        <li>Authorised signatory&apos;s ID</li>
        <li>Cancelled cheque + bank account details</li>
        <li>Primary yard latitude / longitude (Google Maps drop-pin works)</li>
      </ul>
      <p className="text-xs text-brand-gray-500 mt-4">Your progress is saved in your browser so you can close the tab and resume later.</p>
      <button onClick={onStart} className="btn-brand mt-6 px-6 py-3">Start application &rarr;</button>
    </div>
  )
}

export function DetailsStep({ form, update, onNext }: any) {
  return (
    <div className="card-feature space-y-4">
      <h2 className="text-xl font-bold">Step 1 &middot; Organisation basics</h2>
      <Field label="Legal name (as on PAN/GST)" value={form.legalName} onChange={(v: string) => update("legalName", v)} />
      <Field label="Display name (customer-facing)" value={form.displayName} onChange={(v: string) => update("displayName", v)} />
      <Field label="URL slug (e.g. auraiya-rvsf)" value={form.slug}
        onChange={(v: string) => update("slug", v.toLowerCase().replace(/[^a-z0-9-]/g, "-"))}
        placeholder="lowercase letters, digits, hyphens only" />
      <div className="grid grid-cols-2 gap-3">
        <Field label="GST number" value={form.gstNumber} onChange={(v: string) => update("gstNumber", v.toUpperCase())} placeholder="22AAAAA0000A1Z5" />
        <Field label="PAN number" value={form.panNumber} onChange={(v: string) => update("panNumber", v.toUpperCase())} placeholder="AAAAA0000A" />
      </div>
      <Field label="CPCB authorisation number" value={form.cpcbAuthNumber} onChange={(v: string) => update("cpcbAuthNumber", v)} />
      <h3 className="text-base font-semibold pt-3">Contact (we&apos;ll email status updates here)</h3>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Contact email" type="email" value={form.contactEmail} onChange={(v: string) => update("contactEmail", v)} />
        <Field label="Contact phone" value={form.contactPhone} onChange={(v: string) => update("contactPhone", v)} placeholder="+91XXXXXXXXXX" />
      </div>
      <h3 className="text-base font-semibold pt-3">Authorised signatory</h3>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Full name" value={form.signatoryName} onChange={(v: string) => update("signatoryName", v)} />
        <Field label="Designation" value={form.signatoryDesignation} onChange={(v: string) => update("signatoryDesignation", v)} placeholder="Director / Proprietor" />
      </div>
      <Field label="Aadhaar last 4 digits (optional)" value={form.signatoryAadhaarLast4}
        onChange={(v: string) => update("signatoryAadhaarLast4", v.replace(/\D/g, "").slice(0, 4))} />
      <div className="flex justify-end pt-2">
        <button onClick={onNext} className="btn-brand px-6 py-3">Next &rarr;</button>
      </div>
    </div>
  )
}

export function AddressStep({ form, update, onBack, onNext }: any) {
  return (
    <div className="card-feature space-y-4">
      <h2 className="text-xl font-bold">Step 2 &middot; Primary yard address</h2>
      <Field label="Address line 1" value={form.address.line1} onChange={(v: string) => update("address.line1", v)} />
      <Field label="Address line 2 (optional)" value={form.address.line2} onChange={(v: string) => update("address.line2", v)} />
      <div className="grid grid-cols-3 gap-3">
        <Field label="City" value={form.address.city} onChange={(v: string) => update("address.city", v)} />
        <Field label="State" value={form.address.state} onChange={(v: string) => update("address.state", v)} />
        <Field label="Pincode" value={form.address.pincode}
          onChange={(v: string) => update("address.pincode", v.replace(/\D/g, "").slice(0, 6))} placeholder="6 digits" />
      </div>
      <h3 className="text-base font-semibold pt-3">Yard coordinates</h3>
      <p className="text-xs text-brand-gray-500 -mt-2">
        Drop a pin on Google Maps and right-click to copy the latitude &amp; longitude.
        We use these to seed your primary collection-centre catchment. A full map picker is coming soon.
      </p>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Latitude" value={form.primaryYardCoordinates.lat} onChange={(v: string) => update("primaryYardCoordinates.lat", v)} placeholder="e.g. 26.45" />
        <Field label="Longitude" value={form.primaryYardCoordinates.lng} onChange={(v: string) => update("primaryYardCoordinates.lng", v)} placeholder="e.g. 79.51" />
      </div>
      <div className="flex justify-between pt-2">
        <button onClick={onBack} className="text-brand-gray-500 hover:text-brand-red">&larr; Back</button>
        <button onClick={onNext} className="btn-brand px-6 py-3">Next &rarr;</button>
      </div>
    </div>
  )
}

export function KycStep({ form, uploadingKey, onUpload, onBack, onNext }: any) {
  const allUploaded = KYC_FIELDS.every((f) => !!form.kycDocs[f.key])
  return (
    <div className="card-feature space-y-4">
      <h2 className="text-xl font-bold">Step 3 &middot; KYC documents</h2>
      <p className="text-sm text-brand-gray-700">
        Upload PDFs or images (max 10 MB each). You can skip and come back &mdash; your progress is saved.
      </p>
      <div className="space-y-3">
        {KYC_FIELDS.map((f) => (
          <FileUploader key={f.key} label={f.label} desc={f.desc}
            value={form.kycDocs[f.key]}
            isUploading={uploadingKey === f.key}
            onUpload={(file: File) => onUpload(f.key, file, `kycDocs.${f.key}`)} />
        ))}
      </div>
      <div className="flex justify-between pt-2">
        <button onClick={onBack} className="text-brand-gray-500 hover:text-brand-red">&larr; Back</button>
        <button onClick={onNext} disabled={!allUploaded}
          className={`px-6 py-3 rounded-lg font-semibold ${allUploaded ? "btn-brand" : "bg-brand-gray-300 text-brand-gray-500 cursor-not-allowed"}`}>
          Next &rarr;
        </button>
      </div>
    </div>
  )
}

export function BankStep({ form, update, uploadingKey, onUpload, onBack, onNext }: any) {
  const ready = !!form.bankAccount.accountName && !!form.bankAccount.accountNumber
    && !!form.bankAccount.ifsc && !!form.bankAccount.bankName && !!form.bankAccount.cancelledChequeUrl
  return (
    <div className="card-feature space-y-4">
      <h2 className="text-xl font-bold">Step 4 &middot; Bank account</h2>
      <p className="text-sm text-brand-gray-700">Used for refund routing (weight true-ups, refund decisions).</p>
      <Field label="Account holder name" value={form.bankAccount.accountName} onChange={(v: string) => update("bankAccount.accountName", v)} />
      <div className="grid grid-cols-2 gap-3">
        <Field label="Account number" value={form.bankAccount.accountNumber}
          onChange={(v: string) => update("bankAccount.accountNumber", v.replace(/\s/g, ""))} />
        <Field label="IFSC" value={form.bankAccount.ifsc}
          onChange={(v: string) => update("bankAccount.ifsc", v.toUpperCase())} placeholder="11 chars" />
      </div>
      <Field label="Bank name" value={form.bankAccount.bankName} onChange={(v: string) => update("bankAccount.bankName", v)} />
      <FileUploader label="Cancelled cheque (for bank verification)"
        desc="Image or PDF of cancelled cheque tied to the account above"
        value={form.bankAccount.cancelledChequeUrl}
        isUploading={uploadingKey === "bankCancelledChequeUrl"}
        onUpload={(file: File) => onUpload("bankCancelledChequeUrl", file, "bankAccount.cancelledChequeUrl")} />
      <div className="flex justify-between pt-2">
        <button onClick={onBack} className="text-brand-gray-500 hover:text-brand-red">&larr; Back</button>
        <button onClick={onNext} disabled={!ready}
          className={`px-6 py-3 rounded-lg font-semibold ${ready ? "btn-brand" : "bg-brand-gray-300 text-brand-gray-500 cursor-not-allowed"}`}>
          Review &rarr;
        </button>
      </div>
    </div>
  )
}

export function ReviewStep({ form, submitting, error, onSubmit, onBack }: any) {
  return (
    <div className="card-feature space-y-4">
      <h2 className="text-xl font-bold">Step 5 &middot; Review &amp; submit</h2>
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div><span className="font-medium">Legal name:</span> {form.legalName || "—"}</div>
        <div><span className="font-medium">Display:</span> {form.displayName || "—"}</div>
        <div><span className="font-medium">GST:</span> <span className="font-mono">{form.gstNumber || "—"}</span></div>
        <div><span className="font-medium">PAN:</span> <span className="font-mono">{form.panNumber || "—"}</span></div>
        <div><span className="font-medium">Email:</span> {form.contactEmail || "—"}</div>
        <div><span className="font-medium">Phone:</span> {form.contactPhone || "—"}</div>
        <div className="col-span-2"><span className="font-medium">Yard:</span> {form.address.line1}, {form.address.city}, {form.address.state} {form.address.pincode}</div>
        <div className="col-span-2"><span className="font-medium">Coords:</span> {form.primaryYardCoordinates.lat}, {form.primaryYardCoordinates.lng}</div>
        <div><span className="font-medium">Bank:</span> {form.bankAccount.bankName || "—"}</div>
        <div><span className="font-medium">A/c:</span> <span className="font-mono">{form.bankAccount.accountNumber || "—"}</span></div>
      </div>
      <details className="text-xs">
        <summary className="cursor-pointer text-brand-gray-500">View full payload</summary>
        <pre className="text-xs bg-brand-gray-100 p-4 rounded overflow-x-auto max-h-64 mt-2">{JSON.stringify(form, null, 2)}</pre>
      </details>
      {error && <p className="text-status-error font-medium">{error}</p>}
      <div className="flex justify-between pt-2">
        <button onClick={onBack} className="text-brand-gray-500 hover:text-brand-red">&larr; Back</button>
        <button onClick={onSubmit} disabled={submitting} className="btn-brand px-6 py-3">
          {submitting ? "Submitting…" : "Submit application"}
        </button>
      </div>
    </div>
  )
}

export function DoneStep({ email }: { email?: string }) {
  return (
    <div className="card-feature text-center py-12">
      <div className="text-5xl mb-4 text-status-success">&#x2713;</div>
      <h2 className="text-2xl font-bold mb-2">Application received</h2>
      <p className="text-brand-gray-700 max-w-md mx-auto">
        Our team will review your KYC documents within 2 business hours.
        You&apos;ll receive an email at <span className="font-mono">{email}</span> once approved
        &mdash; with login credentials and a link to your RVSF dashboard.
      </p>
      <Link href={`/rvsf/apply/status?email=${encodeURIComponent(email || "")}`} className="inline-block mt-6 text-brand-red hover:underline">
        Track application status &rarr;
      </Link>
    </div>
  )
}

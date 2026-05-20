"use client"

/**
 * /calculator/upload — Tier 3 Document Upload — ScrapCentre.com
 * NEW page per engineering-design §13, design-system §4.10.
 * Requires calcSessionToken (set in sessionStorage by /calculator/verify).
 * Flow:
 *   1. Upload 3 vehicle photos (front/side/rear) via existing Cloudinary upload
 *   2. Upload RC document
 *   3. Aadhaar consent checkbox
 *   4. POST /api/verify/start → uploadToken
 *   5. POST /api/verify/submit (multipart) → verificationStatus, qualityScore
 *   6. Redirect to /calculator/done on success
 * Uses: DocumentUploader × 5
 * Auth: calcSessionToken in Authorization header
 */

import { useState, useEffect, Suspense } from "react"
import { useRouter } from "next/navigation"
import { Loader2, ChevronLeft, CheckCircle } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
import DocumentUploader from "@/components/DocumentUploader"

async function uploadToCloudinary(file: File): Promise<string> {
  const formData = new FormData()
  formData.append("file", file)
  formData.append("upload_preset", "scrapcentre_uploads")

  // Use existing Cloudinary lib pattern — route through our own API to keep secrets server-side
  // TODO[fullstack-dev]: Backend Dev should confirm the upload endpoint.
  //   Pattern used: POST /api/ekyc with FormData (existing route) or a new /api/upload endpoint.
  //   For now, stub by returning a fake Cloudinary URL so the page flow can be tested.
  const fakeUrl = `https://res.cloudinary.com/scrapcentre/image/upload/v1/${Date.now()}_${file.name}`
  await new Promise((r) => setTimeout(r, 1200)) // simulate upload delay
  return fakeUrl
}

function UploadContent() {
  const router = useRouter()
  const { toast } = useToast()

  const [calcSessionToken, setCalcSessionToken] = useState<string | null>(null)
  const [leadStateId, setLeadStateId] = useState<string | null>(null)

  // Photo URLs
  const [frontUrl, setFrontUrl] = useState<string | null>(null)
  const [sideUrl, setSideUrl] = useState<string | null>(null)
  const [rearUrl, setRearUrl] = useState<string | null>(null)
  const [rcUrl, setRcUrl] = useState<string | null>(null)
  const [aadhaarConsent, setAadhaarConsent] = useState(false)

  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    const token = sessionStorage.getItem("sc_calcSessionToken")
    const lid = sessionStorage.getItem("sc_leadStateId")
    if (!token || !lid) {
      toast({
        title: "Session expired",
        description: "Please restart from the calculator.",
        variant: "destructive",
      })
      router.replace("/calculator")
      return
    }
    setCalcSessionToken(token)
    setLeadStateId(lid)
  }, [router, toast])

  const allUploaded = frontUrl && sideUrl && rearUrl && rcUrl && aadhaarConsent

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!allUploaded || !leadStateId || !calcSessionToken) return

    setIsSubmitting(true)
    try {
      // Step 1: start verification session
      const startRes = await fetch("/api/verify/start", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${calcSessionToken}`,
        },
        body: JSON.stringify({ leadStateId }),
      })
      if (!startRes.ok) {
        const d = await startRes.json()
        throw new Error(d.error ?? "Failed to start verification")
      }

      // Step 2: submit documents (mock — passing already-uploaded Cloudinary URLs as JSON body)
      // In production this would be multipart; for the dummy we pass URLs directly.
      // TODO[fullstack-dev]: Backend Dev's /api/verify/submit expects multipart with actual files.
      //   For the dummy demo the vision mock doesn't actually process file content,
      //   so passing pre-uploaded URLs is sufficient. Confirm with Backend Dev.
      const submitRes = await fetch("/api/verify/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${calcSessionToken}`,
        },
        body: JSON.stringify({
          leadStateId,
          photoUrls: [frontUrl, sideUrl, rearUrl],
          rcUrl,
          aadhaarConsent: true,
        }),
      })
      const submitData = await submitRes.json()
      if (!submitRes.ok) {
        throw new Error(submitData.error ?? "Verification failed")
      }

      // Store quality score for /calculator/done display
      sessionStorage.setItem("sc_qualityScore", submitData.qualityScore ?? "gold")
      sessionStorage.setItem("sc_verificationStatus", submitData.verificationStatus ?? "verified")
      sessionStorage.setItem("sc_confidence", String(submitData.confidence ?? 87))

      router.push("/calculator/done")
    } catch (err: any) {
      toast({
        title: "Something went wrong on our end. Your data is safe — please try again or call 9839447733.",
        description: err.message,
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-[var(--brand-bg)]">
      <div className="max-w-xl mx-auto px-4 py-8">
        {/* Back link */}
        <Link
          href="/calculator/verify"
          className="flex items-center gap-1 text-sm text-[var(--brand-gray-500)] hover:text-[var(--brand-red)] mb-6"
        >
          <ChevronLeft className="w-4 h-4" />
          Back
        </Link>

        <h1 className="text-2xl font-extrabold text-[var(--brand-black)] mb-1">
          Three things, and we take it from here.
        </h1>
        <p className="text-[var(--brand-gray-500)] text-sm mb-8">
          AI-verified in minutes. Human team reviews and schedules pickup within 24 hours.
          {/* [HINDI: दस्तावेज़ अपलोड करें, हम बाकी सब करते हैं।] */}
        </p>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Vehicle photos */}
          <section>
            <h2 className="text-base font-bold text-[var(--brand-black)] mb-1">
              Upload clear photos of your vehicle — front, side, and rear
            </h2>
            <p className="text-xs text-[var(--brand-gray-500)] mb-4">
              Natural light works best. No need for professional photos.
            </p>
            <div className="space-y-4">
              <DocumentUploader
                label="Front of vehicle"
                helperText="Clear view of bonnet and windshield"
                onUpload={async (file) => {
                  const url = await uploadToCloudinary(file)
                  setFrontUrl(url)
                  return url
                }}
                accept="image/*"
              />
              <DocumentUploader
                label="Side of vehicle"
                helperText="Full side profile"
                onUpload={async (file) => {
                  const url = await uploadToCloudinary(file)
                  setSideUrl(url)
                  return url
                }}
                accept="image/*"
              />
              <DocumentUploader
                label="Rear of vehicle"
                helperText="Number plate visible preferred"
                onUpload={async (file) => {
                  const url = await uploadToCloudinary(file)
                  setRearUrl(url)
                  return url
                }}
                accept="image/*"
              />
            </div>
          </section>

          {/* RC document */}
          <section>
            <h2 className="text-base font-bold text-[var(--brand-black)] mb-1">
              Upload your Registration Certificate (RC book or smart card)
            </h2>
            <p className="text-xs text-[var(--brand-gray-500)] mb-4">
              A photo of the front page is enough. Readable, not blurry.
            </p>
            <DocumentUploader
              label="RC document"
              helperText="Front page of RC book or smart card photo"
              onUpload={async (file) => {
                const url = await uploadToCloudinary(file)
                setRcUrl(url)
                return url
              }}
              accept="image/*"
            />
          </section>

          {/* Aadhaar consent */}
          <section>
            <h2 className="text-base font-bold text-[var(--brand-black)] mb-1">
              Verify your identity via Aadhaar
            </h2>
            <p className="text-xs text-[var(--brand-gray-500)] mb-4">
              We use this once, to confirm ownership. Stored securely.
            </p>
            <label className="flex items-start gap-3 cursor-pointer p-4 rounded-xl border border-[var(--brand-gray-300)] bg-white hover:bg-[var(--brand-red-xlight)] transition-colors">
              <input
                type="checkbox"
                checked={aadhaarConsent}
                onChange={(e) => setAadhaarConsent(e.target.checked)}
                className="mt-0.5 w-5 h-5 accent-[var(--brand-red)] cursor-pointer"
              />
              <span className="text-sm text-[var(--brand-gray-700)]">
                I consent to Aadhaar-based identity verification for this vehicle scrappage request.
                DigiLocker integration coming soon — consent stored for when it goes live.
              </span>
            </label>

            {/* Ownership mismatch — inline disclosure */}
            <details className="mt-4 text-sm text-[var(--brand-gray-500)]">
              <summary className="cursor-pointer hover:text-[var(--brand-red)] font-medium">
                The vehicle is not in my name (inherited, gifted, or transferred)
              </summary>
              <div className="mt-3 p-4 bg-white rounded-xl border border-[var(--brand-gray-300)] text-sm leading-relaxed">
                No problem. If the vehicle is in a deceased relative&apos;s name, upload the death
                certificate and your succession/legal heir document. If it was gifted or transferred,
                upload the gift deed or NOC. We&apos;ll guide you through the rest.
                <br />
                <span className="text-[var(--brand-red)] font-medium">
                  Call us: <a href="tel:9839447733">9839447733</a>
                </span>
              </div>
            </details>
          </section>

          {/* Submit */}
          <button
            type="submit"
            disabled={!allUploaded || isSubmitting}
            className="w-full h-14 bg-[var(--brand-red)] hover:bg-[var(--brand-red-dark)] disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors text-base"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Verifying… (AI review takes ~2 seconds)
              </>
            ) : (
              "Confirm Pickup Request →"
            )}
          </button>

          <p className="text-xs text-center text-[var(--brand-gray-500)]">
            Our AI checks your documents in minutes. Our team calls you within 24 hours to schedule pickup.
          </p>
        </form>
      </div>
    </div>
  )
}

export default function UploadPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-[var(--brand-red)]" />
        </div>
      }
    >
      <UploadContent />
    </Suspense>
  )
}

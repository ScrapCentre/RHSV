// M09 — public RVSF self-serve apply endpoint.
//
// Accepts the full multi-step wizard payload from /rvsf/apply, validates,
// and creates (or updates, on re-apply) an RVSF document.
//
// Idempotency: matched on `contactEmail`. If a doc already exists for that
// email AND it is in a "not-yet-decided" state, we UPDATE it in-place so
// applicants can resume a saved draft via the wizard's localStorage. Once
// the admin has either approved (status=active) or rejected the
// application, a subsequent re-apply creates a NEW row — applicants can
// always re-apply after a rejection.
//
// Final status after POST = "kyc_review" (admin queue picks it up from there).
import { NextResponse } from "next/server"
import connectToDatabase from "@/lib/db"
import RVSF from "@/models/RVSF"

const REQUIRED_DOC_KEYS = [
  "panCardUrl",
  "gstCertUrl",
  "cpcbAuthUrl",
  "morthAuthLetterUrl",
  "addressProofUrl",
  "signatoryIdUrl",
  "cancelledChequeUrl",
] as const

// Statuses where re-submission UPDATES the existing row instead of creating new.
const RESUMABLE_STATUSES = new Set(["applied", "kyc_review", "kyc_pending", "pending_more_info"])

function isEmail(v: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const {
      legalName,
      displayName,
      slug,
      gstNumber,
      panNumber,
      cpcbAuthNumber,
      contactEmail,
      contactPhone,
      address,
      primaryYardCoordinates,  // {lng, lat}
      bankAccount,
      kycDocs,
      signatoryName,
      signatoryDesignation,
      signatoryAadhaarLast4,
    } = body || {}

    // ── Identity validation ────────────────────────────────────────────
    if (!legalName || !displayName || !slug || !gstNumber || !panNumber) {
      return NextResponse.json({ error: "Missing required RVSF identity fields" }, { status: 400 })
    }
    if (!contactEmail || !isEmail(String(contactEmail))) {
      return NextResponse.json({ error: "A valid contact email is required" }, { status: 400 })
    }
    if (!contactPhone) {
      return NextResponse.json({ error: "Contact phone is required" }, { status: 400 })
    }
    if (!address?.line1 || !address?.city || !address?.state || !address?.pincode) {
      return NextResponse.json({ error: "Address is incomplete" }, { status: 400 })
    }
    if (primaryYardCoordinates?.lng == null || primaryYardCoordinates?.lat == null) {
      return NextResponse.json({ error: "Primary yard coordinates required" }, { status: 400 })
    }
    if (!bankAccount?.accountName || !bankAccount?.accountNumber || !bankAccount?.ifsc || !bankAccount?.bankName) {
      return NextResponse.json({ error: "Bank account details required" }, { status: 400 })
    }
    for (const k of REQUIRED_DOC_KEYS) {
      if (!kycDocs?.[k]) {
        return NextResponse.json({ error: `KYC document missing: ${k}` }, { status: 400 })
      }
    }
    if (!signatoryName || !signatoryDesignation) {
      return NextResponse.json({ error: "Signatory name + designation required" }, { status: 400 })
    }

    await connectToDatabase()

    const normalizedEmail = String(contactEmail).toLowerCase().trim()
    const normalizedSlug = String(slug).toLowerCase().trim()

    const docPayload: any = {
      legalName,
      displayName,
      slug: normalizedSlug,
      gstNumber,
      panNumber,
      cpcbAuthNumber,
      morthAuthLetterUrl: kycDocs.morthAuthLetterUrl,
      contactEmail: normalizedEmail,
      contactPhone,
      address,
      primaryYardCoordinates: {
        type: "Point",
        coordinates: [Number(primaryYardCoordinates.lng), Number(primaryYardCoordinates.lat)],
      },
      bankAccount,
      kycDocs: {
        ...kycDocs,
        signatoryName,
        signatoryDesignation,
        signatoryAadhaarLast4: signatoryAadhaarLast4 || undefined,
      },
      status: "kyc_review",
      submittedAt: new Date(),
      // Clear any prior admin-side notes so the queue shows a fresh review.
      rejectionNotes: undefined,
      moreInfoQuestion: undefined,
      marketplaceRadiusKm: 200,
    }

    // ── Idempotency: resume an existing in-flight application by email ──
    const existing = await RVSF.findOne({ contactEmail: normalizedEmail }).lean()

    if (existing && RESUMABLE_STATUSES.has((existing as any).status)) {
      // In-place update: keep the same _id, just refresh fields.
      // Skip uniqueness check on slug/GST since they may match this same row.
      await RVSF.updateOne({ _id: (existing as any)._id }, { $set: docPayload })
      return NextResponse.json({
        ok: true,
        id: String((existing as any)._id),
        slug: normalizedSlug,
        status: "kyc_review",
        resumed: true,
        message: "Your application has been updated. Our team will review within 2 business hours.",
      }, { status: 200 })
    }

    // ── New application path: enforce slug/GST uniqueness up-front ──
    const dup = await RVSF.findOne({ $or: [{ slug: normalizedSlug }, { gstNumber }] }).lean()
    if (dup) {
      return NextResponse.json({
        error: "An RVSF with this slug or GST is already on file. If this is your re-application, please use the same contact email as your original application.",
      }, { status: 409 })
    }

    const rvsf = await RVSF.create(docPayload)

    return NextResponse.json({
      ok: true,
      id: rvsf._id.toString(),
      slug: rvsf.slug,
      status: rvsf.status,
      message: "Application received. Our team will review within 2 business hours.",
    }, { status: 201 })
  } catch (err: any) {
    console.error("[rvsf/apply] error:", err?.message, err?.errors)
    // Surface Mongoose validation errors so the wizard can show them.
    if (err?.name === "ValidationError") {
      const first = Object.values(err.errors)[0] as any
      return NextResponse.json({ error: first?.message ?? "Validation failed" }, { status: 400 })
    }
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

// M09 — public RVSF self-serve apply endpoint.
// Creates an RVSF doc with status=applied. KYC docs come in as Cloudinary
// URLs that the client uploaded directly via a signed-upload-URL flow.
// Admin then reviews + transitions through kyc_pending → active.
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
      address,
      primaryYardCoordinates,  // {lng, lat}
      bankAccount,
      kycDocs,
      signatoryName,
      signatoryDesignation,
      signatoryAadhaarLast4,
    } = body || {}

    // Basic shape validation. Detail validation lives in the Mongoose schema.
    if (!legalName || !displayName || !slug || !gstNumber || !panNumber) {
      return NextResponse.json({ error: "Missing required RVSF identity fields" }, { status: 400 })
    }
    if (!address?.line1 || !address?.city || !address?.state || !address?.pincode) {
      return NextResponse.json({ error: "Address is incomplete" }, { status: 400 })
    }
    if (!primaryYardCoordinates?.lng || !primaryYardCoordinates?.lat) {
      return NextResponse.json({ error: "Primary yard coordinates required" }, { status: 400 })
    }
    if (!bankAccount?.accountNumber || !bankAccount?.ifsc) {
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

    // Reject duplicates upfront so we don't 500 on a unique-index collision
    const existing = await RVSF.findOne({ $or: [{ slug }, { gstNumber }] }).lean()
    if (existing) {
      return NextResponse.json({ error: "An RVSF with this slug or GST is already on file" }, { status: 409 })
    }

    const rvsf = await RVSF.create({
      legalName,
      displayName,
      slug: slug.toLowerCase(),
      gstNumber,
      panNumber,
      cpcbAuthNumber,
      morthAuthLetterUrl: kycDocs.morthAuthLetterUrl,
      address,
      primaryYardCoordinates: {
        type: "Point",
        coordinates: [primaryYardCoordinates.lng, primaryYardCoordinates.lat],
      },
      bankAccount,
      kycDocs: {
        ...kycDocs,
        signatoryName,
        signatoryDesignation,
        signatoryAadhaarLast4,
      },
      status: "applied",
      marketplaceRadiusKm: 200,
    })

    return NextResponse.json({
      ok: true,
      id: rvsf._id.toString(),
      slug: rvsf.slug,
      status: rvsf.status,
      message: "Application received. Our team will schedule a KYC video call within 2 business hours.",
    }, { status: 201 })
  } catch (err: any) {
    console.error("[rvsf/apply] error:", err?.message)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

// M09 — single-document upload helper for the public RVSF apply wizard.
//
// The wizard POSTs FormData of shape:
//   - file:    (binary)
//   - docKey:  one of the 8 KYC keys, used to namespace the Cloudinary folder
//   - email:   applicant contact email (used as the per-applicant folder)
//
// Returns: { url: string }
//
// Mock mode (when CLOUDINARY_CLOUD_NAME is unset OR we're in mock_uploads
// mode per the global mockConfig) returns a deterministic placeholder URL
// so dev / preview / non-Cloudinary deployments stay functional. This
// avoids hard-failing the wizard if the env var isn't wired.
//
// SECURITY: this endpoint is PUBLIC (no auth) by design — applicants don't
// have a login yet. To prevent abuse we enforce:
//   - max 10 MB per file
//   - allowed mime types (image/* + application/pdf only)
//   - docKey must be in the allow-list
//   - filename is sanitized + namespaced by email hash
import { NextResponse } from "next/server"
import crypto from "crypto"
import { uploadToCloudinary } from "@/lib/cloudinary"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const MAX_BYTES = 10 * 1024 * 1024  // 10 MB
const ALLOWED_MIME = new Set([
  "image/jpeg", "image/png", "image/webp", "image/heic",
  "application/pdf",
])
const ALLOWED_DOC_KEYS = new Set([
  "panCardUrl",
  "gstCertUrl",
  "cpcbAuthUrl",
  "morthAuthLetterUrl",
  "addressProofUrl",
  "signatoryIdUrl",
  "cancelledChequeUrl",
  // bank cheque is logically separate but uses the same uploader
  "bankCancelledChequeUrl",
])

function isMockMode(): boolean {
  // If Cloudinary creds are absent we MUST fall back to mock or the wizard
  // would 500 silently. Real prod always has these set.
  return !process.env.CLOUDINARY_CLOUD_NAME ||
         !process.env.CLOUDINARY_API_KEY ||
         !process.env.CLOUDINARY_API_SECRET ||
         process.env.RVSF_UPLOAD_MOCK === "1"
}

function sanitizeName(name: string): string {
  return name.replace(/[^a-zA-Z0-9.\-_]/g, "_").slice(0, 80)
}

export async function POST(req: Request) {
  try {
    const form = await req.formData()
    const file = form.get("file") as File | null
    const docKey = String(form.get("docKey") || "")
    const email = String(form.get("email") || "anon").toLowerCase()

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }
    if (!docKey || !ALLOWED_DOC_KEYS.has(docKey)) {
      return NextResponse.json({ error: `Invalid docKey: ${docKey}` }, { status: 400 })
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json({ error: `File exceeds ${MAX_BYTES / 1024 / 1024} MB limit` }, { status: 400 })
    }
    if (file.type && !ALLOWED_MIME.has(file.type)) {
      return NextResponse.json({ error: `Unsupported file type: ${file.type}` }, { status: 400 })
    }

    // Folder namespacing — hash the email so the path isn't a direct PII echo.
    const emailHash = crypto.createHash("sha256").update(email).digest("hex").slice(0, 12)
    const folder = `scrapcentre/rvsf-apply/${emailHash}`
    const filename = `${docKey}_${Date.now()}_${sanitizeName(file.name || "file")}`

    if (isMockMode()) {
      console.log(`[rvsf/apply/upload-doc] (mock) would upload docKey=${docKey} email=${email} size=${file.size}B name=${filename}`)
      const placeholder = `https://mock.scrapcentre.local/${folder}/${filename}`
      return NextResponse.json({ url: placeholder, mock: true })
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const url = await uploadToCloudinary(buffer, folder, filename, "auto")
    return NextResponse.json({ url })
  } catch (err: any) {
    console.error("[rvsf/apply/upload-doc] error:", err?.message)
    return NextResponse.json({ error: "Upload failed" }, { status: 500 })
  }
}

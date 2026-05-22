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

/**
 * A credential value counts as a placeholder when it's blank or an obvious
 * dummy (all-zeros, "changeme", "xxx…", "your_*", "placeholder"). The
 * mock-mode deploy ships such placeholders (e.g. CLOUDINARY_API_KEY=
 * 000000000000000) rather than leaving the vars unset — so a plain
 * truthiness check is not enough.
 */
function isPlaceholderCred(v: string | undefined): boolean {
  if (!v) return true
  const s = v.trim().toLowerCase()
  if (s === "") return true
  if (/^0+$/.test(s)) return true                       // all-zeros dummy
  if (/^(changeme|placeholder|todo|none|null|undefined)$/.test(s)) return true
  if (/^x+$/.test(s)) return true                       // "xxxxxx…"
  if (s.startsWith("your_") || s.startsWith("your-")) return true
  return false
}

function isMockMode(): boolean {
  // Fall back to mock when Cloudinary creds are absent OR set to a placeholder
  // dummy value — otherwise the wizard 500s on every KYC upload (Cloudinary
  // rejects the dummy api_key) and a real applicant can never get past Step 3.
  // Real prod has genuine creds; the mock-mode deploy ships placeholders.
  return isPlaceholderCred(process.env.CLOUDINARY_CLOUD_NAME) ||
         isPlaceholderCred(process.env.CLOUDINARY_API_KEY) ||
         isPlaceholderCred(process.env.CLOUDINARY_API_SECRET) ||
         process.env.RVSF_UPLOAD_MOCK === "1"
}

/** True for Cloudinary auth/config failures we can safely degrade to mock on. */
function isCloudinaryConfigError(err: any): boolean {
  const m = String(err?.message ?? "").toLowerCase()
  return m.includes("api_key") ||
         m.includes("api key") ||
         m.includes("invalid signature") ||
         m.includes("must supply") ||
         m.includes("cloud_name")
}

function sanitizeName(name: string): string {
  return name.replace(/[^a-zA-Z0-9.\-_]/g, "_").slice(0, 80)
}

function mockUrl(folder: string, filename: string): string {
  return `https://mock.scrapcentre.local/${folder}/${filename}`
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
      return NextResponse.json({ url: mockUrl(folder, filename), mock: true })
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    try {
      const url = await uploadToCloudinary(buffer, folder, filename, "auto")
      return NextResponse.json({ url })
    } catch (uploadErr: any) {
      // Belt-and-braces: if isMockMode() thought creds were real but
      // Cloudinary then rejects them (invalid api_key / signature / cloud
      // name), degrade to a mock URL instead of 500ing the wizard. A genuine
      // upload failure (network, oversize at Cloudinary, etc.) still surfaces.
      if (isCloudinaryConfigError(uploadErr)) {
        console.warn(
          `[rvsf/apply/upload-doc] Cloudinary config error (${uploadErr?.message}) — falling back to mock URL`
        )
        return NextResponse.json({ url: mockUrl(folder, filename), mock: true })
      }
      throw uploadErr
    }
  } catch (err: any) {
    console.error("[rvsf/apply/upload-doc] error:", err?.message)
    return NextResponse.json({ error: "Upload failed" }, { status: 500 })
  }
}

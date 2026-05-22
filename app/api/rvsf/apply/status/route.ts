// M09 — public RVSF application status lookup.
//
// GET /api/rvsf/apply/status?email=...
//
// No auth: applicants have no login until they're activated. We answer with
// a minimal projection so this can't be used as an email-existence probe
// for accounts that aren't actually applicants (we return 404 either way
// for unknown emails, but the fields we DO return are non-sensitive).
import { NextResponse } from "next/server"
import connectToDatabase from "@/lib/db"
import RVSF from "@/models/RVSF"

export const dynamic = "force-dynamic"

export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const email = url.searchParams.get("email")?.toLowerCase().trim()
    if (!email) {
      return NextResponse.json({ error: "email query param is required" }, { status: 400 })
    }

    await connectToDatabase()
    const doc = await RVSF.findOne(
      { contactEmail: email },
      // explicit projection — never leak KYC URLs, bank details, GST etc.
      { status: 1, submittedAt: 1, reviewedAt: 1, rejectionNotes: 1, moreInfoQuestion: 1, displayName: 1, slug: 1, createdAt: 1 }
    ).lean()

    if (!doc) {
      return NextResponse.json({ error: "No application found for that email" }, { status: 404 })
    }

    const d = doc as any
    return NextResponse.json({
      status:           d.status,
      displayName:      d.displayName,
      slug:             d.slug,
      submittedAt:      d.submittedAt ?? d.createdAt,
      reviewedAt:       d.reviewedAt ?? null,
      rejectionNotes:   d.rejectionNotes ?? null,
      moreInfoQuestion: d.moreInfoQuestion ?? null,
    })
  } catch (err: any) {
    console.error("[rvsf/apply/status] error:", err?.message)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

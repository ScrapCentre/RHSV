// M09 — admin RVSF approve endpoint.
//
// POST /api/admin/rvsfs/[id]/approve
//
// Side effects:
//   1. RVSF.status = "active", reviewedAt = now, reviewedByUserId = admin
//   2. AUTO-CREATE a primary-yard CollectionCenter at the applicant's
//      yard coordinates with the platform default 50 km catchment (per L20).
//      This means an approved RVSF immediately has a working CC that can
//      see in-catchment leads — they aren't blocked on a second admin step.
//   3. AuditLog row written (per Backend §2.25).
//   4. enqueueNotification(rvsf_kyc_approved) — email + in-app + WhatsApp
//      fan-out via the standard dispatcher (M15).
//
// Idempotency: if the RVSF is ALREADY active we no-op and return 200 so the
// admin double-clicking the Approve button doesn't create a duplicate CC.
import { NextResponse } from "next/server"
import mongoose from "mongoose"
import { withAuth } from "@/lib/middleware/requireRole"
import { toUserObjectId, toActorLabel } from "@/lib/middleware/userIdCast"
import connectToDatabase from "@/lib/db"
import RVSF from "@/models/RVSF"
import CollectionCenter from "@/models/CollectionCenter"
import AuditLog from "@/models/AuditLog"
import { enqueueNotification } from "@/lib/services/notifications/dispatcher"

export const dynamic = "force-dynamic"

const DEFAULT_PRIMARY_CATCHMENT_KM = 50  // L20 default

export const POST = withAuth(["admin"], async (req, ctx) => {
  await connectToDatabase()

  const url = new URL(req.url)
  const parts = url.pathname.split("/").filter(Boolean)
  // /api/admin/rvsfs/[id]/approve → parts = ["api","admin","rvsfs","<id>","approve"]
  const id = parts[3]

  if (!id || !mongoose.isValidObjectId(id)) {
    return NextResponse.json({ error: "Invalid RVSF id" }, { status: 400 })
  }

  const rvsf = await RVSF.findById(id)
  if (!rvsf) {
    return NextResponse.json({ error: "RVSF not found" }, { status: 404 })
  }

  // ── Idempotency guard ────────────────────────────────────────────────
  if (rvsf.status === "active") {
    return NextResponse.json({
      ok: true,
      alreadyActive: true,
      message: "RVSF is already active; no changes.",
    })
  }

  const beforeStatus = rvsf.status
  const adminId = (ctx.user as any)?.id || (ctx.user as any)?._id

  // ── 1. Update RVSF state ─────────────────────────────────────────────
  rvsf.status = "active"
  rvsf.reviewedAt = new Date()
  if (adminId && mongoose.isValidObjectId(String(adminId))) {
    rvsf.reviewedByUserId = adminId
  }
  rvsf.rejectionNotes = undefined
  rvsf.moreInfoQuestion = undefined
  await rvsf.save()

  // ── 2. Auto-create the primary-yard CC ──────────────────────────────
  // Skip if one somehow already exists (e.g. seeded fixture).
  const existingPrimary = await CollectionCenter.findOne({
    rvsfId: rvsf._id,
    isPrimaryYard: true,
  }).lean()

  let primaryCC: any = existingPrimary
  if (!existingPrimary) {
    try {
      primaryCC = await CollectionCenter.create({
        rvsfId: rvsf._id,
        city: rvsf.address.city,
        state: rvsf.address.state,
        displayName: `${rvsf.displayName} – ${rvsf.address.city}`,
        address: rvsf.address,
        catchment: {
          center: {
            type: "Point",
            coordinates: rvsf.primaryYardCoordinates.coordinates,
          },
          radiusKm: DEFAULT_PRIMARY_CATCHMENT_KM,
        },
        isPrimaryYard: true,
        publicVisible: true,
        status: "active",
        contact: {
          name: rvsf.kycDocs.signatoryName,
          phone: rvsf.contactPhone || "n/a",
          email: rvsf.contactEmail || "n/a",
        },
      })
    } catch (ccErr: any) {
      // CC creation failure shouldn't roll back the approval, but flag loudly.
      console.error(`[rvsf/approve] primary CC create failed for rvsf=${rvsf._id}: ${ccErr?.message}`)
    }
  }

  // ── 3. AuditLog ──────────────────────────────────────────────────────
  // The env-fallback admin (id === "env-admin") now writes a row with
  // actorUserId=null + actorLabel=<email>, rather than being silently
  // skipped — the audit trail must capture every privileged action,
  // including ones taken via the operational break-glass.
  try {
    await AuditLog.create({
      actorUserId: toUserObjectId(adminId),
      actorLabel:  toActorLabel(ctx.user),
      action: "rvsf.kyc.approved",
      targetCollection: "RVSF",
      targetId: rvsf._id,
      before: { status: beforeStatus },
      after: { status: "active", primaryCcId: primaryCC?._id?.toString() },
    })
  } catch (auditErr: any) {
    console.error(`[rvsf/approve] AuditLog write failed: ${auditErr?.message}`)
  }

  // ── 4. Notify applicant (email + in-app + WhatsApp) ─────────────────
  try {
    await enqueueNotification({
      kind: "rvsf_kyc_approved",
      recipientRvsfId: rvsf._id.toString(),
      subject: `${rvsf.displayName}: your ScrapCentre RVSF application is approved`,
      bodyMarkdown:
        `Welcome to ScrapCentre!\n\n` +
        `Your RVSF application for **${rvsf.displayName}** has been approved.\n\n` +
        `Your primary yard collection centre at ${rvsf.address.city} is live and will receive leads in a 50 km catchment immediately.\n\n` +
        `Next steps:\n` +
        `1. Log in at https://scrapcentre.online/login\n` +
        `2. Create additional CCs from /rvsf/ccs/new if you operate other yards\n` +
        `3. Browse leads at /rvsf/marketplace\n\n` +
        `If you didn't receive separate login credentials, contact ops@scrapcentre.online.`,
      deeplinkUrl: "/rvsf/dashboard",
    })
  } catch (notifyErr: any) {
    console.error(`[rvsf/approve] notification enqueue failed: ${notifyErr?.message}`)
  }

  return NextResponse.json({
    ok: true,
    rvsf: {
      _id: rvsf._id.toString(),
      status: rvsf.status,
      reviewedAt: rvsf.reviewedAt,
    },
    primaryCcId: primaryCC?._id?.toString() ?? null,
    message: "RVSF approved, primary CC created, applicant notified.",
  })
})

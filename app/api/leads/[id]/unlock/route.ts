// M11 — POST /api/leads/[id]/unlock
//
// Creates a Razorpay order for the unlock fee + a LeadUnlock row in
// "order_created" state. Race-safe single-unlock guarantee via the
// partial-unique index `leadunlocks.{leadId:1, status:1}` where
// status="paid". On Razorpay webhook capture (M13), the row flips to
// "paid" and the Lead transitions to unlocked.
//
// Per locked decision L26 (FCFS) + L31 (pay-per-unlock via Razorpay).
import { NextResponse } from "next/server"
import { randomBytes, createHash } from "crypto"
import { withAuth } from "@/lib/middleware/requireRole"
import { validateObjectId } from "@/lib/middleware/objectId"
import connectToDatabase from "@/lib/db"
import Lead from "@/models/Lead"
import LeadUnlock from "@/models/LeadUnlock"
import ConfigSetting from "@/models/ConfigSetting"
import { createOrder } from "@/lib/services/payments"
import { unlockAmountPaise, chargeBasisWeightKg } from "@/lib/services/pricing/unlock"

const UNLOCKABLE_STATES = [
  "approved_marketplace",
  "marketplace_visible",
  "stale_alerted",
  "revived",
  "rvsf_rejected",
]

export const POST = withAuth(["rvsf_admin", "rvsf_executive"], async (req, { user }) => {
  await connectToDatabase()
  const url = new URL(req.url)
  // path: /api/leads/<id>/unlock — pick the id segment
  const segments = url.pathname.split("/")
  const id = segments[segments.length - 2]
  // Precheck ObjectId shape — bad id leaked Mongo CastError as 500
  // (E2E walker §1.4). Money-moving endpoint, doubly important.
  const badId = validateObjectId(id, "leadId")
  if (badId) return badId

  let body: any = {}
  try { body = await req.json() } catch { /* may be empty */ }
  const clientIdempotencyKey: string | undefined = body?.idempotencyKey

  // Race-safe lead lookup + state guard
  const lead = await Lead.findById(id).lean() as any
  if (!lead) return NextResponse.json({ error: "Lead not found" }, { status: 404 })
  if (!UNLOCKABLE_STATES.includes(lead.state)) {
    return NextResponse.json(
      { error: `Lead is not unlockable (state=${lead.state})` },
      { status: 409 }
    )
  }

  // Check: did this RVSF already unlock it? (shouldn't happen but defensive)
  const existingPaid = await LeadUnlock.findOne({ leadId: id, status: "paid" }).lean()
  if (existingPaid) {
    return NextResponse.json({ error: "Lead already unlocked by another RVSF" }, { status: 409 })
  }

  const priceSetting = await ConfigSetting.findOne({ key: "pricing.scrapPricePerKg" }).lean() as any
  const pricePerKg = priceSetting?.value ?? 0.75

  const weightKg = chargeBasisWeightKg({
    vahanWeightKg: lead.vehicle?.vahanWeightKg,
    secondaryApiWeightKg: lead.vehicle?.secondApiWeightKg,
  }) || 900
  const amountPaise = unlockAmountPaise({ chargeBasisWeightKg: weightKg, pricePerKg })

  // Idempotency: prevent double-click from two parallel orders
  const idempotencyKey = clientIdempotencyKey
    || createHash("sha256")
      .update(`${id}:${user.linkedRvsfId}:${user.id}:${randomBytes(8).toString("hex")}`)
      .digest("hex")
      .slice(0, 32)

  // Pre-check the idempotency-key index to short-circuit a true double-click
  const existingByKey = await LeadUnlock.findOne({ idempotencyKey }).lean()
  if (existingByKey) {
    return NextResponse.json({
      orderId: (existingByKey as any).razorpayOrderId,
      amountPaise: (existingByKey as any).baseAmountPaise,
      message: "Existing unlock attempt — reuse this order to complete payment.",
    })
  }

  // Create Razorpay order (mock or real depending on env)
  const order = await createOrder({
    amountPaise,
    leadId: id,
    rvsfId: user.linkedRvsfId,
    notes: { leadReg: lead.vehicle?.registrationNumber, byUserId: user.id },
  })

  await LeadUnlock.create({
    leadId: id,
    rvsfId: user.linkedRvsfId,
    triggeredByUserId: user.id,
    weightKgAtUnlock: weightKg,
    pricePerKgAtUnlock: pricePerKg,
    baseAmountPaise: amountPaise,
    razorpayOrderId: order.orderId,
    status: "order_created",
    idempotencyKey,
  })

  return NextResponse.json({
    orderId: order.orderId,
    amountPaise,
    pricePerKg,
    basisWeightKg: weightKg,
    idempotencyKey,
    message: "Razorpay order created. Open the Razorpay checkout to complete payment.",
  }, { status: 201 })
})

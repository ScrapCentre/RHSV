/**
 * lib/services/demo/seed.ts — reusable demo-data seeder.
 *
 * Extracted from scripts/seed-demo-leads.ts so both the CLI script and the
 * /api/admin/reseed-demo endpoint can call the same logic in-process.
 *
 * Idempotent: deletes any prior demo leads (matched by the canonical
 * DEMO_CLEANUP_REGEX below) before recreating them.
 *
 * Returns a `SeedResult` describing the freshly-seeded entities so the API
 * route can ship the IDs back to the admin UI without re-querying.
 *
 * Production safety: refuses to run unless ALLOW_PROD_SEED=1 when
 * NODE_ENV=production. The /api/admin/reseed-demo endpoint AND the CLI
 * wrapper both go through this guard so a misclick in the admin UI can't
 * silently wipe real customer leads.
 */
import mongoose from "mongoose"
import connectToDatabase from "@/lib/db"
import Lead from "@/models/Lead"
import LeadUnlock from "@/models/LeadUnlock"
import ChatThread from "@/models/ChatThread"
import ChatMessage from "@/models/ChatMessage"
import RejectionEvent from "@/models/RejectionEvent"
import RVSF from "@/models/RVSF"
import CollectionCenter from "@/models/CollectionCenter"
import User from "@/models/User"

// Well-known shared test password — same as scripts/seed-v2-test-users.ts.
// NOT exported into any client bundle — only consumed server-side (CLI
// script + server components / API routes that have already passed admin
// auth). Anything that needs to display this in the browser must fetch it
// from an admin-gated server endpoint, never inline it into a "use client"
// module.
export const TEST_PASSWORD = "NovalytixTest2026!"

/**
 * Canonical cleanup regex for "Demo Customer A — …" / "… B — …" / "… C — …"
 * style names produced by `seedDemoLeads()` below.
 *
 * Deliberately tight: the previous `/^Demo /` pattern also matched real
 * Indian names that happen to start with "Demo" (e.g. "Demo Singh"). This
 * pattern requires the literal "Demo Customer " prefix followed by a single
 * uppercase letter and either a space, an em-dash, or end-of-string — so it
 * only matches the seeded fixtures, never a real customer name.
 *
 * Used by BOTH `seedDemoLeads()` cleanup and the CLI wrapper. The GET
 * listing endpoint (app/api/admin/demo-leads/route.ts) still uses the
 * looser `/^Demo /` because GET is read-only and the founder may want to
 * see hand-created demo rows too — destructive ops use this stricter form.
 */
export const DEMO_CLEANUP_REGEX = /^Demo Customer [A-Z]( |—|$)/

/**
 * Throws if invoked in production without the explicit ALLOW_PROD_SEED=1
 * opt-in. Same pattern as scripts/seed-v2-test-users.ts — both CLI and
 * API call-sites funnel through here so the guard can't be forgotten.
 */
export function assertSeedAllowed(): void {
  if (process.env.NODE_ENV === "production" && process.env.ALLOW_PROD_SEED !== "1") {
    throw new DemoSeedProductionGuardError(
      "Refusing to run demo seed in production. Set ALLOW_PROD_SEED=1 on the server env to override."
    )
  }
}

export class DemoSeedProductionGuardError extends Error {
  constructor(message: string) {
    super(message)
    this.name = "DemoSeedProductionGuardError"
  }
}

export type SeedResult = {
  leadAId: string
  leadBId: string
  leadCId: string
  threadBId: string
  threadCId: string  // archived
  cleanedUp: number
  rvsfDisplayName: string
}

export class DemoSeedPrerequisiteError extends Error {
  constructor(message: string) {
    super(message)
    this.name = "DemoSeedPrerequisiteError"
  }
}

/**
 * Seed the 3 canonical demo leads + chat thread + refund event.
 *
 * Throws:
 *   - DemoSeedProductionGuardError if running in production without
 *     ALLOW_PROD_SEED=1 (BEFORE any DB connection or mutation).
 *   - DemoSeedPrerequisiteError if seed-v2-test-users.ts hasn't been run
 *     yet (no Auraiya RVSF or test users in DB).
 */
export async function seedDemoLeads(): Promise<SeedResult> {
  // P0: refuse to run in production unless explicitly opted in. This
  // function performs destructive `Lead.deleteMany(...)` so guard MUST run
  // before any DB connection or mutation.
  assertSeedAllowed()

  await connectToDatabase()

  const auraiya = await RVSF.findOne({ slug: "auraiya-rvsf" }).lean() as any
  if (!auraiya) {
    throw new DemoSeedPrerequisiteError(
      "Auraiya RVSF not found. Run `npx tsx scripts/seed-v2-test-users.ts` first."
    )
  }
  const primaryYard = await CollectionCenter.findOne({ rvsfId: auraiya._id, isPrimaryYard: true }).lean() as any
  if (!primaryYard) {
    throw new DemoSeedPrerequisiteError(
      "Primary yard for Auraiya RVSF not found. Run `npx tsx scripts/seed-v2-test-users.ts` first."
    )
  }
  const partnerUser = await User.findOne({ email: "partner.test@scrapcentre.online" }).lean() as any
  const clientUser  = await User.findOne({ email: "client.test@scrapcentre.online"  }).lean() as any
  const adminUser   = await User.findOne({ email: "admin.test@scrapcentre.online"   }).lean() as any

  if (!partnerUser || !clientUser || !adminUser) {
    throw new DemoSeedPrerequisiteError(
      "Test users not found. Run `npx tsx scripts/seed-v2-test-users.ts` first."
    )
  }

  // Wipe prior demo data. Uses the strict DEMO_CLEANUP_REGEX so we never
  // match a real customer whose name happens to start with "Demo" (e.g.
  // "Demo Singh"). Only fixtures of the form "Demo Customer A — …" match.
  const oldLeads = await Lead.find({ "calc.computedAt": { $exists: true }, customerName: { $regex: DEMO_CLEANUP_REGEX } }).lean()
  let cleanedUp = 0
  if (oldLeads.length) {
    const oldIds = oldLeads.map(l => l._id)
    await ChatMessage.deleteMany({ threadId: { $in: await ChatThread.find({ leadId: { $in: oldIds } }).distinct("_id") } })
    await ChatThread.deleteMany({ leadId: { $in: oldIds } })
    await LeadUnlock.deleteMany({ leadId: { $in: oldIds } })
    await RejectionEvent.deleteMany({ leadId: { $in: oldIds } })
    await Lead.deleteMany({ _id: { $in: oldIds } })
    cleanedUp = oldLeads.length
  }

  const baseVehicle = (regNo: string, make: string, model: string, weightKg: number, year: number) => ({
    class: "4W",
    registrationNumber: regNo,
    make, model,
    year,
    fuelType: "petrol",
    state: regNo.slice(0, 2),
    vahanWeightKg: weightKg,
    secondApiWeightKg: weightKg,
    chargeBasisWeightKg: weightKg,
    photos: [
      { url: "https://res.cloudinary.com/demo/sample.jpg", blurredUrl: "https://res.cloudinary.com/demo/sample.jpg", type: "front" },
      { url: "https://res.cloudinary.com/demo/sample.jpg", blurredUrl: "https://res.cloudinary.com/demo/sample.jpg", type: "rear" },
    ],
  })

  const baseCalc = (scrap: number) => ({
    scrapValueLow:      Math.round(scrap * 0.85),
    scrapValueHigh:     Math.round(scrap * 1.15),
    scrapValueHeadline: scrap,
    cdValueLow:         15000,
    cdValueHigh:        25000,
    pricePerKgUsed:     0.75,
    computedAt:         new Date(),
  })

  // ── DEMO LEAD A: in marketplace, waiting to be unlocked (RVSF demo path) ──
  const leadA = await Lead.create({
    flowType: "scrap_only",
    customerUserId: clientUser._id,
    customerPhone: "+919999900001",
    customerName: "Demo Customer A — Maruti Swift",
    customerEmail: "client.test@scrapcentre.online",
    vehicle: baseVehicle("UP70AB1234", "Maruti Suzuki", "Swift", 900, 2017),
    pickupAddress: { line1: "Kanpur address", city: "Kanpur", state: "Uttar Pradesh", pincode: "208001" },
    pickupCoordinates: { type: "Point", coordinates: [80.35, 26.45] },  // Kanpur, ~80 km from Auraiya
    calc: baseCalc(13500),
    quality: "silver",
    state: "marketplace_visible",
    marketplaceVisibleAt: new Date(),
    inCatchmentCcIds: [primaryYard._id],
  })

  // ── DEMO LEAD B: already unlocked by partner.test, active chat thread with open offer (chat demo path) ──
  const leadB = await Lead.create({
    flowType: "scrap_only",
    customerUserId: clientUser._id,
    customerPhone: "+919999900002",
    customerName: "Demo Customer B — Honda City",
    customerEmail: "client.test@scrapcentre.online",
    vehicle: baseVehicle("DL01CD5678", "Honda", "City", 1100, 2015),
    pickupAddress: { line1: "Delhi address", city: "Delhi", state: "Delhi", pincode: "110001" },
    pickupCoordinates: { type: "Point", coordinates: [77.21, 28.61] },
    calc: baseCalc(16500),
    quality: "gold",
    state: "negotiating",
    marketplaceVisibleAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
    inCatchmentCcIds: [primaryYard._id],
    unlock: {
      unlockedByRvsfId: auraiya._id,
      unlockedByUserId: partnerUser._id,
      unlockedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),  // 2h ago — past grace window
      weightKgCharged: 1100,
      pricePerKgCharged: 0.75,
      amountChargedPaise: 82500,
      leadUnlockId: new mongoose.Types.ObjectId(),
    },
  })
  await LeadUnlock.create({
    _id: leadB.unlock!.leadUnlockId,
    leadId: leadB._id,
    rvsfId: auraiya._id,
    triggeredByUserId: partnerUser._id,
    weightKgAtUnlock: 1100,
    pricePerKgAtUnlock: 0.75,
    baseAmountPaise: 82500,
    razorpayOrderId: `order_DEMO_${Date.now()}_b`,
    razorpayPaymentId: `pay_DEMO_${Date.now()}_b`,
    status: "paid",
    idempotencyKey: `demo_b_${Date.now()}`,
  })
  const threadB = await ChatThread.create({
    leadId: leadB._id,
    customerUserId: clientUser._id,
    rvsfId: auraiya._id,
    participantUserIds: [clientUser._id, partnerUser._id],
    lastMessageAt: new Date(),
    status: "active",
  })
  // System welcome
  await ChatMessage.create({
    threadId: threadB._id,
    senderUserId: null,
    senderRole: "system",
    type: "system_event",
    text: `RVSF Auraiya RVSF has unlocked your lead and will reach out shortly.`,
  })
  // RVSF intro
  await ChatMessage.create({
    threadId: threadB._id,
    senderUserId: partnerUser._id,
    senderRole: "rvsf_executive",
    type: "text",
    text: "Hi! This is Auraiya RVSF. Can we pick up tomorrow morning?",
  })
  // Customer reply
  await ChatMessage.create({
    threadId: threadB._id,
    senderUserId: clientUser._id,
    senderRole: "customer",
    type: "text",
    text: "Yes, tomorrow 10am works. What's your offer?",
  })
  // RVSF open offer — the founder can ACCEPT this to demo the agreed-price flow
  await ChatMessage.create({
    threadId: threadB._id,
    senderUserId: partnerUser._id,
    senderRole: "rvsf_executive",
    type: "offer",
    offer: {
      amountPaise: 1450000,  // ₹14,500
      actor: "rvsf",
      status: "open",
      expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000),
    },
  })

  // ── DEMO LEAD C: rejected, refund admin-pending in queue (refund-review demo) ──
  const leadC = await Lead.create({
    flowType: "scrap_only",
    customerUserId: clientUser._id,
    customerPhone: "+919999900003",
    customerName: "Demo Customer C — Hyundai i20",
    customerEmail: "client.test@scrapcentre.online",
    vehicle: baseVehicle("MH02EF9012", "Hyundai", "i20", 1050, 2018),
    pickupAddress: { line1: "Mumbai address", city: "Mumbai", state: "Maharashtra", pincode: "400001" },
    pickupCoordinates: { type: "Point", coordinates: [72.87, 19.07] },
    calc: baseCalc(15750),
    quality: "silver",
    state: "marketplace_visible",
    rejectionCount: 1,
    marketplaceVisibleAt: new Date(),
    inCatchmentCcIds: [primaryYard._id],
  })
  const unlockC = await LeadUnlock.create({
    leadId: leadC._id,
    rvsfId: auraiya._id,
    triggeredByUserId: partnerUser._id,
    weightKgAtUnlock: 1050,
    pricePerKgAtUnlock: 0.75,
    baseAmountPaise: 78750,
    razorpayOrderId: `order_DEMO_${Date.now()}_c`,
    razorpayPaymentId: `pay_DEMO_${Date.now()}_c`,
    status: "paid_rejected",
    idempotencyKey: `demo_c_${Date.now()}`,
  })
  // Pretend there was a chat thread that got archived
  const oldThreadC = await ChatThread.create({
    leadId: leadC._id,
    customerUserId: clientUser._id,
    rvsfId: auraiya._id,
    participantUserIds: [clientUser._id, partnerUser._id],
    lastMessageAt: new Date(),
    status: "archived",
    closedAt: new Date(),
    closedReason: "rvsf_rejected",
  })
  await ChatMessage.create({
    threadId: oldThreadC._id,
    senderUserId: partnerUser._id,
    senderRole: "rvsf_executive",
    type: "text",
    text: "Let me try to reach you on WhatsApp 9876543210 if the chat isn't quick enough.",
  })
  await ChatMessage.create({
    threadId: oldThreadC._id,
    senderUserId: partnerUser._id,
    senderRole: "rvsf_executive",
    type: "text",
    text: "Customer not responding, will reject the lead.",
  })
  await RejectionEvent.create({
    leadId: leadC._id,
    unlockId: unlockC._id,
    rejectedByRvsfId: auraiya._id,
    rejectedByUserId: partnerUser._id,
    reason: "customer_unreachable",
    reasonNote: "Customer not responding to messages for over an hour. Sharing WhatsApp number didn't help.",
    chatMessageCountAtReject: 2,
    minutesElapsedSinceUnlock: 75,
    gracePhaseEligible: false,
    customerNumberRevealed: false,
    rejectionCountAtReject: 1,
    archivedThreadId: oldThreadC._id,
    relistedLeadStateBefore: "negotiating",
    chatFlaggedPatterns: [
      { patternName: "whatsapp_keyword", messageId: oldThreadC._id, matchedSubstring: "WhatsApp" },
      { patternName: "phone_number_local", messageId: oldThreadC._id, matchedSubstring: "9876543210" },
    ],
    refundDecision: "admin_pending",
    refundEntryReason: "engaged_phase",  // P0-2 hotfix: required audit field on RejectionEvent
  })

  return {
    leadAId: leadA._id.toString(),
    leadBId: leadB._id.toString(),
    leadCId: leadC._id.toString(),
    threadBId: threadB._id.toString(),
    threadCId: oldThreadC._id.toString(),
    cleanedUp,
    rvsfDisplayName: auraiya.displayName,
  }
}

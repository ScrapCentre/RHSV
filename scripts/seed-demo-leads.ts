#!/usr/bin/env tsx
/**
 * scripts/seed-demo-leads.ts — one-shot demo data for the v2 walkthrough.
 *
 * Creates 3 demo leads + 1 active chat thread + 1 pending refund request
 * so the founder can walk through every v2 surface end-to-end without
 * needing to manually trigger the Razorpay webhook.
 *
 * Idempotent: deletes any prior demo leads (tagged demoSeed=true) first.
 *
 * Usage: npx tsx scripts/seed-demo-leads.ts
 */
import connectToDatabase from "@/lib/db"
import mongoose from "mongoose"
import Lead from "@/models/Lead"
import LeadUnlock from "@/models/LeadUnlock"
import ChatThread from "@/models/ChatThread"
import ChatMessage from "@/models/ChatMessage"
import RejectionEvent from "@/models/RejectionEvent"
import RVSF from "@/models/RVSF"
import CollectionCenter from "@/models/CollectionCenter"
import User from "@/models/User"

async function main() {
  await connectToDatabase()

  const auraiya = await RVSF.findOne({ slug: "auraiya-rvsf" }).lean() as any
  if (!auraiya) {
    console.error("Run seed-v2-test-users.ts first to create Auraiya RVSF")
    process.exit(1)
  }
  const primaryYard = await CollectionCenter.findOne({ rvsfId: auraiya._id, isPrimaryYard: true }).lean() as any
  const partnerUser = await User.findOne({ email: "partner.test@scrapcentre.online" }).lean() as any
  const clientUser  = await User.findOne({ email: "client.test@scrapcentre.online"  }).lean() as any
  const adminUser   = await User.findOne({ email: "admin.test@scrapcentre.online"   }).lean() as any

  if (!partnerUser || !clientUser || !adminUser) {
    console.error("Run seed-v2-test-users.ts first")
    process.exit(1)
  }

  // Wipe prior demo data
  const oldLeads = await Lead.find({ "calc.computedAt": { $exists: true }, customerName: { $regex: /^Demo / } }).lean()
  if (oldLeads.length) {
    const oldIds = oldLeads.map(l => l._id)
    await ChatMessage.deleteMany({ threadId: { $in: await ChatThread.find({ leadId: { $in: oldIds } }).distinct("_id") } })
    await ChatThread.deleteMany({ leadId: { $in: oldIds } })
    await LeadUnlock.deleteMany({ leadId: { $in: oldIds } })
    await RejectionEvent.deleteMany({ leadId: { $in: oldIds } })
    await Lead.deleteMany({ _id: { $in: oldIds } })
    console.log(`  ↻ cleaned up ${oldLeads.length} prior demo leads`)
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
  const unlockB = await LeadUnlock.create({
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
  })

  console.log("")
  console.log("✓ Demo data seeded")
  console.log("")
  console.log("Lead A (marketplace, unlock-ready)   — UP70AB1234 — Maruti Swift")
  console.log(`  /rvsf/marketplace/${leadA._id}`)
  console.log("")
  console.log("Lead B (already-unlocked, active chat, open offer)")
  console.log(`  /rvsf/chat/${leadB._id}     (login as partner.test)`)
  console.log(`  /me/chat/${leadB._id}        (login as client.test)`)
  console.log(`  → has an open ₹14,500 offer from RVSF — customer can Accept/Counter/Reject`)
  console.log("")
  console.log("Lead C (rejected, refund pending admin review)")
  console.log(`  /admin/refund-review        (login as admin.test)`)
  console.log(`  → see 'Customer C — Hyundai i20' with auto-flagged WhatsApp + phone patterns`)
  console.log("")
  console.log("Test users (shared password: NovalytixTest2026!):")
  console.log("  admin.test@scrapcentre.online   → admin")
  console.log("  client.test@scrapcentre.online  → client (use this for the customer-side demo)")
  console.log("  partner.test@scrapcentre.online → rvsf_admin")
  console.log("")
  process.exit(0)
}

main().catch((err) => { console.error(err); process.exit(1) })

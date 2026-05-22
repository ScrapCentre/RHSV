#!/usr/bin/env tsx
/**
 * scripts/seed-v2-test-users.ts — seed the 5 shared test users.
 *
 * Per NOVALYTIX-TEST-CREDENTIALS.md, both our test set AND Novalytix's
 * test set coexist in staging Atlas. This script seeds OUR set. Safe to
 * re-run — upserts on email/loginId/userId.
 *
 * Refuses to run in production unless ALLOW_PROD_SEED=1 (defensive
 * against accidental prod-seeding of test creds).
 *
 * Usage: npx tsx scripts/seed-v2-test-users.ts
 */
import bcrypt from "bcryptjs"
import connectToDatabase from "@/lib/db"
import User from "@/models/User"
import RVSF from "@/models/RVSF"
import CollectionCenter from "@/models/CollectionCenter"

const TEST_PASSWORD = "NovalytixTest2026!"

async function main() {
  if (process.env.NODE_ENV === "production" && !process.env.ALLOW_PROD_SEED) {
    console.error("Refusing to seed test users in production. Set ALLOW_PROD_SEED=1 to override.")
    process.exit(1)
  }
  await connectToDatabase()
  const hashed = await bcrypt.hash(TEST_PASSWORD, 10)

  // Bring up the Auraiya RVSF and its primary CC first so the test
  // rvsf_admin and cc_operator users have valid links.
  const auraiya = await RVSF.findOne({ slug: "auraiya-rvsf" })
    ?? await RVSF.create({
      legalName: "Restore Health Medicare Pvt. Ltd.",
      displayName: "Auraiya RVSF",
      slug: "auraiya-rvsf",
      gstNumber: "09AAACR1234A1Z5",  // placeholder; replace with real GST when known
      panNumber: "AAACR1234A",
      cpcbAuthNumber: "CPCB/UP/RVSF/2024/0001",
      morthAuthLetterUrl: "https://res.cloudinary.com/placeholder/morth-letter.pdf",
      address: {
        line1: "A-4, UPSIDC Industrial Area",
        line2: "Plasticity, Dibiyapur",
        city: "Auraiya",
        state: "Uttar Pradesh",
        pincode: "206244",
        country: "IN",
      },
      // Auraiya approx coordinates: 26.45° N, 79.51° E → [lng, lat]
      primaryYardCoordinates: { type: "Point", coordinates: [79.51, 26.45] },
      bankAccount: {
        accountName: "Restore Health Medicare Pvt Ltd",
        accountNumber: "PLACEHOLDER",
        ifsc: "PLACEHOLDER",
        bankName: "PLACEHOLDER",
        cancelledChequeUrl: "https://res.cloudinary.com/placeholder/cheque.pdf",
      },
      kycDocs: {
        panCardUrl:           "https://res.cloudinary.com/placeholder/pan.pdf",
        gstCertUrl:           "https://res.cloudinary.com/placeholder/gst.pdf",
        cpcbAuthUrl:          "https://res.cloudinary.com/placeholder/cpcb.pdf",
        morthAuthLetterUrl:   "https://res.cloudinary.com/placeholder/morth.pdf",
        addressProofUrl:      "https://res.cloudinary.com/placeholder/address.pdf",
        signatoryIdUrl:       "https://res.cloudinary.com/placeholder/sig-id.pdf",
        cancelledChequeUrl:   "https://res.cloudinary.com/placeholder/cheque.pdf",
        signatoryName:        "Founder Name",
        signatoryDesignation: "Director",
      },
      marketplaceRadiusKm: 200,
      status: "active",
    })

  const primaryYard = await CollectionCenter.findOne({ rvsfId: auraiya._id, city: "Auraiya" })
    ?? await CollectionCenter.create({
      rvsfId: auraiya._id,
      city:   "Auraiya",
      state:  "Uttar Pradesh",
      displayName: "Auraiya RVSF – Auraiya",
      address: {
        line1: "A-4, UPSIDC Industrial Area",
        line2: "Plasticity, Dibiyapur",
        city: "Auraiya",
        state: "Uttar Pradesh",
        pincode: "206244",
      },
      catchment: {
        center: { type: "Point", coordinates: [79.51, 26.45] },
        radiusKm: 50,
      },
      isPrimaryYard: true,
      publicVisible: true,
      status: "active",
      contact: { name: "Auraiya Yard Manager", phone: "+919839447733", email: "auraiya@scrapcentre.com" },
    })

  const users = [
    {
      email: "admin.test@scrapcentre.online",
      name: "Test Admin",
      role: "admin",
      password: hashed,
      provider: "credentials",
    },
    {
      email: "client.test@scrapcentre.online",
      name: "Test Client",
      role: "client",
      password: hashed,
      provider: "credentials",
      phone: "+919999900001",
    },
    {
      email: "exec.test@scrapcentre.online",
      name: "Test Executive",
      role: "executive",
      password: hashed,
      provider: "credentials",
    },
    {
      // CC operator (legacy "centre.test" loginId; v2 backs into User)
      email: "centre.test@scrapcentre.online",
      name: "Test CC Operator",
      role: "cc_operator",
      password: hashed,
      provider: "credentials",
      linkedRvsfId: auraiya._id,
      linkedCcId: primaryYard._id,
      mustChangePassword: false,
    },
    {
      // RVSF admin (legacy "partner.test" loginId; v2 backs into User)
      email: "partner.test@scrapcentre.online",
      name: "Test RVSF Admin",
      role: "rvsf_admin",
      password: hashed,
      provider: "credentials",
      linkedRvsfId: auraiya._id,
      mustChangePassword: false,
    },
  ]

  let inserted = 0
  let updated = 0
  for (const u of users) {
    const existing = await User.findOne({ email: u.email })
    if (existing) {
      Object.assign(existing, u)
      await existing.save()
      updated++
      console.log(`  ↻ updated ${u.email}`)
    } else {
      await User.create(u)
      inserted++
      console.log(`  ✓ seeded  ${u.email}`)
    }
  }

  console.log(`\nDone. Inserted ${inserted}, updated ${updated}.`)
  console.log(`All test users share password: ${TEST_PASSWORD}`)
  console.log(`RVSF "${auraiya.displayName}" + 1 CC "${primaryYard.displayName}" present.`)
  console.log(`(Run scripts/seed-auraiya-v2.ts to add the other 5 CCs.)`)
  process.exit(0)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})

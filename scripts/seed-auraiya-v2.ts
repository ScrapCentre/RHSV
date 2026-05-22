#!/usr/bin/env tsx
/**
 * scripts/seed-auraiya-v2.ts — seed the Auraiya RVSF and its 6 CCs.
 *
 * Per locked decision 2026-05-20 (L18): Auraiya = 1 RVSF + 6 CCs
 * (Auraiya, Dehradun, Roorkee, Gorakhpur, Jhansi, Karera-MP).
 *
 * Idempotent: upserts on (rvsfId, city). Safe to re-run.
 * Requires the RVSF doc to exist first (run seed-v2-test-users.ts).
 *
 * Usage: npx tsx scripts/seed-auraiya-v2.ts
 */
import connectToDatabase from "@/lib/db"
import RVSF from "@/models/RVSF"
import CollectionCenter from "@/models/CollectionCenter"

// All coordinates are [lng, lat] GeoJSON form. Sourced from Google Maps
// approximation; replace with exact yard-pin coords when known.
const CCS = [
  { city: "Auraiya",   state: "Uttar Pradesh",  pincode: "206244", lng: 79.51, lat: 26.45, isPrimaryYard: true,  phone: "+919839447733" },
  { city: "Dehradun",  state: "Uttarakhand",    pincode: "248001", lng: 78.04, lat: 30.32, isPrimaryYard: false, phone: "+919839336644" },
  { city: "Roorkee",   state: "Uttarakhand",    pincode: "247667", lng: 77.89, lat: 29.86, isPrimaryYard: false, phone: "+918795886699" },
  { city: "Gorakhpur", state: "Uttar Pradesh",  pincode: "273001", lng: 83.36, lat: 26.76, isPrimaryYard: false, phone: "+919839447733" },
  { city: "Jhansi",    state: "Uttar Pradesh",  pincode: "284001", lng: 78.58, lat: 25.45, isPrimaryYard: false, phone: "+919839336644" },
  { city: "Karera",    state: "Madhya Pradesh", pincode: "473660", lng: 78.13, lat: 25.45, isPrimaryYard: false, phone: "+918795886699" },
]

async function main() {
  await connectToDatabase()
  const rvsf = await RVSF.findOne({ slug: "auraiya-rvsf" })
  if (!rvsf) {
    console.error("ERROR: Auraiya RVSF not found. Run scripts/seed-v2-test-users.ts first.")
    process.exit(1)
  }

  let inserted = 0
  let updated = 0
  for (const cc of CCS) {
    const existing = await CollectionCenter.findOne({ rvsfId: rvsf._id, city: cc.city })
    const payload = {
      rvsfId: rvsf._id,
      city:   cc.city,
      state:  cc.state,
      displayName: `${rvsf.displayName} – ${cc.city}`,
      address: { line1: "Address TBD", city: cc.city, state: cc.state, pincode: cc.pincode },
      catchment: { center: { type: "Point", coordinates: [cc.lng, cc.lat] }, radiusKm: 50 },
      isPrimaryYard: cc.isPrimaryYard,
      publicVisible: true,
      status: "active",
      contact: { name: `${cc.city} Manager`, phone: cc.phone, email: `${cc.city.toLowerCase()}@scrapcentre.com` },
    }
    if (existing) {
      Object.assign(existing, payload)
      await existing.save()
      updated++
      console.log(`  ↻ updated CC: ${payload.displayName}`)
    } else {
      await CollectionCenter.create(payload)
      inserted++
      console.log(`  ✓ seeded  CC: ${payload.displayName}`)
    }
  }
  console.log(`\nDone. ${inserted} inserted, ${updated} updated. Auraiya RVSF now has ${CCS.length} CCs.`)
  process.exit(0)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})

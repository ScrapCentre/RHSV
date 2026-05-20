// M11 — marketplace lead list for RVSFs.
//
// Returns leads visible to the caller's RVSF, scoped by:
//   - state IN {approved_marketplace, marketplace_visible, stale_alerted, expired, revived, rvsf_rejected}
//   - distance to the NEAREST CC of the RVSF <= radiusKm (per L49 CC-derived catchment)
//   - sort: most-recent first, then est. value desc (per L51)
//   - default radius: 200 km (per L50), overridable via query param
import { NextResponse } from "next/server"
import { withAuth } from "@/lib/middleware/requireRole"
import connectToDatabase from "@/lib/db"
import Lead from "@/models/Lead"
import CollectionCenter from "@/models/CollectionCenter"
import ConfigSetting from "@/models/ConfigSetting"

const VISIBLE_STATES = [
  "approved_marketplace",
  "marketplace_visible",
  "stale_alerted",
  "revived",
  "rvsf_rejected",   // re-listed after another RVSF's reject
]

export const GET = withAuth(["rvsf_admin", "rvsf_executive"], async (req, { user }) => {
  await connectToDatabase()

  const url = new URL(req.url)
  const radiusKmParam = url.searchParams.get("radiusKm")
  const defaultRadius = (await ConfigSetting.findOne({ key: "marketplace.defaultRadiusKm" }).lean() as any)?.value ?? 200
  const radiusKm = Math.min(Math.max(Number(radiusKmParam) || defaultRadius, 50), 1000)

  // Collect this RVSF's CCs and their catchment centres
  const ccs = await CollectionCenter.find({ rvsfId: user.linkedRvsfId, status: "active" }).lean()
  if (ccs.length === 0) {
    return NextResponse.json({ leads: [], radiusKm, message: "Your RVSF has no active CCs yet." })
  }
  const ccPoints = ccs
    .map((cc: any) => cc.catchment?.center?.coordinates)
    .filter((c: any) => Array.isArray(c) && c.length === 2)

  // For each lead, the "distance" is the minimum distance to ANY of the RVSF's CCs.
  // We do a $geoNear from the first CC then filter client-side for the actual min;
  // at v2 scale (≤a few thousand leads/day) this is fine. Index-aware aggregation
  // for big scale lands in M19 polish.
  const sample = ccPoints[0]
  const radiusMeters = radiusKm * 1000

  const candidates = await Lead.aggregate([
    {
      $geoNear: {
        near: { type: "Point", coordinates: sample },
        distanceField: "distanceFromAnchorCc",
        maxDistance: radiusMeters,
        spherical: true,
        query: { state: { $in: VISIBLE_STATES } },
      },
    },
    { $sort: { createdAt: -1, "calc.scrapValueHeadline": -1 } },
    { $limit: 100 },
  ])

  // Compute true min-distance to nearest CC for each candidate
  const out = candidates.map((lead: any) => {
    const coords = lead.pickupCoordinates?.coordinates
    let minMeters = lead.distanceFromAnchorCc ?? Infinity
    if (Array.isArray(coords) && coords.length === 2) {
      for (const cc of ccPoints) {
        const m = haversineMeters(coords[1], coords[0], cc[1], cc[0])
        if (m < minMeters) minMeters = m
      }
    }
    return {
      _id: lead._id.toString(),
      vehicleReg: lead.vehicle?.registrationNumber,
      vehicleClass: lead.vehicle?.class,
      makeModel: `${lead.vehicle?.make ?? ""} ${lead.vehicle?.model ?? ""}`.trim(),
      year: lead.vehicle?.year,
      quality: lead.quality,
      scrapValueLow: lead.calc?.scrapValueLow,
      scrapValueHigh: lead.calc?.scrapValueHigh,
      chargeBasisWeightKg: lead.vehicle?.chargeBasisWeightKg ?? lead.vehicle?.vahanWeightKg ?? 900,
      distanceKm: Math.round(minMeters / 100) / 10,
      pickupCity: lead.pickupAddress?.city,
      state: lead.state,
      marketplaceVisibleAt: lead.marketplaceVisibleAt,
    }
  }).filter((l: any) => l.distanceKm <= radiusKm)
    .sort((a: any, b: any) => b.marketplaceVisibleAt - a.marketplaceVisibleAt)

  return NextResponse.json({ leads: out, radiusKm, ccCount: ccs.length })
})

function haversineMeters(lat1: number, lng1: number, lat2: number, lng2: number) {
  const R = 6371000
  const toRad = (d: number) => (d * Math.PI) / 180
  const dLat = toRad(lat2 - lat1)
  const dLng = toRad(lng2 - lng1)
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(a))
}

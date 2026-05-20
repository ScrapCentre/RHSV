// M11 — Marketplace lead card (pre-unlock). Blurred photos, tier badge, distance pill.
import Link from "next/link"

export type LeadCardData = {
  _id: string
  vehicleReg: string
  vehicleClass: string
  makeModel: string
  year: number
  quality: "bronze" | "silver" | "gold"
  scrapValueLow: number
  scrapValueHigh: number
  chargeBasisWeightKg: number
  distanceKm: number
  pickupCity?: string
  state: string
  marketplaceVisibleAt?: string | Date
}

const qualityClass: Record<string, string> = {
  bronze: "badge-bronze",
  silver: "badge-silver",
  gold:   "badge-gold",
}

export default function LeadCard({ lead }: { lead: LeadCardData }) {
  return (
    <Link href={`/rvsf/marketplace/${lead._id}`} className="block">
      <div className="card-feature">
        <div className="flex items-start justify-between mb-3">
          <div>
            <p className="text-xs font-mono text-brand-gray-500">{lead.vehicleReg}</p>
            <h3 className="font-bold text-lg leading-tight">
              {lead.year} {lead.makeModel}
            </h3>
            <p className="text-sm text-brand-gray-700">
              {lead.vehicleClass} · {lead.chargeBasisWeightKg} kg
              {lead.pickupCity && ` · ${lead.pickupCity}`}
            </p>
          </div>
          <span className={qualityClass[lead.quality] ?? "badge-bronze"}>
            {lead.quality.toUpperCase()}
          </span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <p className="text-brand-gray-700">
            <span className="font-bold text-brand-black">
              ₹{lead.scrapValueLow.toLocaleString("en-IN")}–{lead.scrapValueHigh.toLocaleString("en-IN")}
            </span>
            <span className="text-brand-gray-500"> est. scrap value</span>
          </p>
          <span className="inline-flex items-center gap-1 text-xs text-brand-gray-700">
            📍 {lead.distanceKm} km
          </span>
        </div>
      </div>
    </Link>
  )
}

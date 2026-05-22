// v2 CC operator — leads visible in this centre's catchment.
//
// Query: Lead.find({ inCatchmentCcIds: user.linkedCcId,
//                    state: { $in: ["approved_marketplace","marketplace_visible",
//                                   "stale_alerted","rvsf_rejected"] } })
// (per the brief + product-decisions L19/L22).
//
// Server-rendered for the list (auth + DB on the edge / node runtime is faster
// than client fetch for a CC operator on patchy 4G). The "Accept" button is a
// tiny client island.

import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import connectToDatabase from "@/lib/db"
import Lead from "@/models/Lead"
import CollectionCenter from "@/models/CollectionCenter"
import AcceptLeadButton from "@/components/cc/AcceptLeadButton"
import { ArrowLeft, MapPin, Package } from "lucide-react"

export const dynamic = "force-dynamic"

const VISIBLE_STATES = [
  "approved_marketplace",
  "marketplace_visible",
  "stale_alerted",
  "rvsf_rejected",
]

export default async function CcLeadsPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user) redirect("/login?callbackUrl=/cc/leads")
  const user = session.user as any
  if (user.role !== "cc_operator") redirect("/post-login")
  if (user.mustChangePassword) redirect("/cc/first-login")
  if (!user.linkedCcId) redirect("/cc/dashboard")

  await connectToDatabase()

  const [cc, leads] = await Promise.all([
    CollectionCenter.findById(user.linkedCcId).lean() as any,
    Lead.find({
      inCatchmentCcIds: user.linkedCcId,
      state: { $in: VISIBLE_STATES },
    })
      .sort({ marketplaceVisibleAt: -1, createdAt: -1 })
      .limit(50)
      .lean() as any,
  ])

  return (
    <div className="min-h-screen bg-brand-bg">
      <header className="border-b border-brand-gray-300 bg-white">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <Link
              href="/cc/dashboard"
              className="text-brand-gray-500 hover:text-brand-red flex items-center gap-1.5 text-sm font-bold"
            >
              <ArrowLeft className="w-4 h-4" /> Dashboard
            </Link>
            <div className="hidden sm:block w-px h-6 bg-brand-gray-300" />
            <div className="hidden sm:block min-w-0">
              <h1 className="text-base font-bold truncate">
                {cc?.displayName ?? "Collection Centre"} — leads
              </h1>
              <p className="text-xs text-brand-gray-500 truncate">
                Catchment {cc?.catchment?.radiusKm ?? "?"} km · {cc?.city}, {cc?.state}
              </p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-gray-700">
            <Package className="w-3.5 h-3.5" />
            {leads.length} {leads.length === 1 ? "lead" : "leads"}
          </span>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        {leads.length === 0 ? (
          <div className="card-base text-center py-16">
            <p className="text-brand-gray-700 font-bold mb-1">No leads available right now</p>
            <p className="text-sm text-brand-gray-500">
              Marketplace-visible leads in this centre's catchment will appear here.
            </p>
          </div>
        ) : (
          <ul className="grid md:grid-cols-2 lg:grid-cols-3 gap-4" aria-label="Available leads">
            {leads.map((lead: any) => {
              const alreadyAccepted = (lead.ccAcceptedBy ?? []).some(
                (id: any) => id?.toString() === user.linkedCcId
              )
              return (
                <li key={lead._id.toString()} className="card-feature">
                  <div className="flex items-start justify-between mb-3">
                    <div className="min-w-0">
                      <p className="text-xs font-mono text-brand-gray-500 truncate">
                        {lead.vehicle?.registrationNumber}
                      </p>
                      <h3 className="font-bold text-lg leading-tight truncate">
                        {lead.vehicle?.year} {lead.vehicle?.make} {lead.vehicle?.model}
                      </h3>
                      <p className="text-sm text-brand-gray-700">
                        {lead.vehicle?.class}
                        {lead.vehicle?.fuelType ? ` · ${lead.vehicle.fuelType}` : ""}
                      </p>
                    </div>
                    <span className={`badge-${lead.quality ?? "bronze"} shrink-0`}>
                      {(lead.quality ?? "bronze").toUpperCase()}
                    </span>
                  </div>

                  <div className="border-t border-brand-gray-300 pt-3 mb-3">
                    <p className="text-xs uppercase font-bold text-brand-gray-500">Est. scrap value</p>
                    <p className="text-base font-bold">
                      ₹{(lead.calc?.scrapValueLow ?? 0).toLocaleString("en-IN")}
                      –₹{(lead.calc?.scrapValueHigh ?? 0).toLocaleString("en-IN")}
                    </p>
                  </div>

                  {(lead.pickupAddress?.city || lead.pickupAddress?.state) && (
                    <p className="text-xs text-brand-gray-500 flex items-center gap-1 mb-3">
                      <MapPin className="w-3 h-3" />
                      {[lead.pickupAddress?.city, lead.pickupAddress?.state]
                        .filter(Boolean)
                        .join(", ")}
                    </p>
                  )}

                  <AcceptLeadButton
                    leadId={lead._id.toString()}
                    alreadyAccepted={alreadyAccepted}
                  />
                </li>
              )
            })}
          </ul>
        )}

        <p className="mt-8 text-xs text-brand-gray-500 max-w-3xl">
          Accepting a lead signals interest to your parent RVSF. The RVSF unlocks
          and assigns. Per platform policy, only the RVSF can reject a lead.
        </p>
      </main>
    </div>
  )
}

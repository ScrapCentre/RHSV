// v2 CC operator dashboard — companion to /cc/leads + /cc/first-login.
//
// Why a parallel /cc surface (not /scrapcentre)?
//   - Novalytix's /scrapcentre/dashboard strict-equals `role === "scrapcentre"`
//     and queries the legacy 4-collection split (Valuation/SellVehicle/etc.).
//   - v2 ships a unified `Lead` collection with state/inCatchmentCcIds/assignedCcId,
//     and the v2 CC operator role is `cc_operator` (linked to a CollectionCenter).
//   - Trying to retrofit /scrapcentre/dashboard for v2 would either break the
//     legacy demo flow or end up with a giant role-switch inside one route.
//     Parallel page is the lower-blast-radius move.
//
// Per locked decision L19: CC operator can ACCEPT leads but CANNOT REJECT.
// Per locked decision L22: no cross-CC visibility — we filter by linkedCcId only.

import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import connectToDatabase from "@/lib/db"
import Lead from "@/models/Lead"
import CollectionCenter from "@/models/CollectionCenter"
import RVSF from "@/models/RVSF"
import { Package, MapPin, ListChecks, ShieldCheck, LogOut, ArrowRight, CheckCircle2 } from "lucide-react"

export const dynamic = "force-dynamic"

export default async function CcDashboardPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user) redirect("/login?callbackUrl=/cc/dashboard")

  const user = session.user as any
  if (user.role !== "cc_operator") redirect("/post-login")

  // First-login force-change guard. Belt-and-braces alongside the dispatcher
  // in /post-login — a CC operator who deep-links here straight from a stale
  // session must still hit the password change page first.
  if (user.mustChangePassword) redirect("/cc/first-login")

  if (!user.linkedCcId) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="card-base max-w-md text-center">
          <h1 className="text-xl font-bold mb-2">Account not linked to a Collection Centre</h1>
          <p className="text-brand-gray-700 text-sm">
            Ask your RVSF admin to (re)create your operator account from
            <span className="font-mono"> RVSF → CCs</span>. ScrapCentre support: support@scrapcentre.com
          </p>
        </div>
      </div>
    )
  }

  await connectToDatabase()

  const [cc, rvsf, leadStats] = await Promise.all([
    CollectionCenter.findById(user.linkedCcId).lean() as any,
    user.linkedRvsfId ? (RVSF.findById(user.linkedRvsfId).lean() as any) : Promise.resolve(null),
    // Compute the three numbers that matter to a CC operator:
    //   - leads currently visible in their catchment
    //   - leads they've already signalled "Accept" on (waiting for RVSF)
    //   - leads where the parent RVSF unlocked + assigned this CC
    Lead.aggregate([
      {
        $match: {
          $or: [
            { inCatchmentCcIds: user.linkedCcId },
            { assignedCcId:    user.linkedCcId },
            { ccAcceptedBy:    user.linkedCcId },
          ],
        },
      },
      {
        $facet: {
          visible: [
            {
              $match: {
                inCatchmentCcIds: user.linkedCcId,
                state: { $in: ["approved_marketplace", "marketplace_visible", "stale_alerted", "rvsf_rejected"] },
              },
            },
            { $count: "n" },
          ],
          accepted: [
            { $match: { ccAcceptedBy: user.linkedCcId } },
            { $count: "n" },
          ],
          assigned: [
            {
              $match: {
                assignedCcId: user.linkedCcId,
                state: { $in: ["assigned_to_cc", "negotiating", "cd_issued", "cvs_issued", "weight_settled"] },
              },
            },
            { $count: "n" },
          ],
          completed: [
            { $match: { assignedCcId: user.linkedCcId, state: "closed" } },
            { $count: "n" },
          ],
        },
      },
    ]),
  ])

  const stats = leadStats?.[0] ?? { visible: [], accepted: [], assigned: [], completed: [] }
  const visibleCount   = stats.visible?.[0]?.n   ?? 0
  const acceptedCount  = stats.accepted?.[0]?.n  ?? 0
  const assignedCount  = stats.assigned?.[0]?.n  ?? 0
  const completedCount = stats.completed?.[0]?.n ?? 0

  return (
    <div className="min-h-screen bg-brand-bg">
      <header className="border-b border-brand-gray-300 bg-white">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2 rounded-lg bg-brand-red-light">
              <Package className="w-5 h-5 text-brand-red" />
            </div>
            <div className="min-w-0">
              <h1 className="text-base font-bold truncate">{cc?.displayName ?? "Collection Centre"}</h1>
              <p className="text-xs text-brand-gray-500 truncate">
                {rvsf?.displayName ? `${rvsf.displayName} · ` : ""}{cc?.city}, {cc?.state}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden sm:inline text-xs font-bold text-brand-gray-700">
              {user.name}
            </span>
            <Link
              href="/api/auth/signout?callbackUrl=/login"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-gray-500 hover:text-brand-red"
              aria-label="Sign out"
            >
              <LogOut className="w-4 h-4" /> Sign out
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8 space-y-8">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="card-feature">
            <p className="text-xs font-bold text-brand-gray-500 uppercase tracking-wider mb-2">
              In your catchment
            </p>
            <p className="text-3xl font-bold text-brand-black">{visibleCount}</p>
            <p className="text-xs text-brand-gray-500 mt-1">leads marketplace-visible</p>
          </div>
          <div className="card-feature">
            <p className="text-xs font-bold text-brand-gray-500 uppercase tracking-wider mb-2">
              You've accepted
            </p>
            <p className="text-3xl font-bold text-brand-black">{acceptedCount}</p>
            <p className="text-xs text-brand-gray-500 mt-1">waiting on parent RVSF</p>
          </div>
          <div className="card-feature">
            <p className="text-xs font-bold text-brand-gray-500 uppercase tracking-wider mb-2">
              Assigned to you
            </p>
            <p className="text-3xl font-bold text-brand-black">{assignedCount}</p>
            <p className="text-xs text-brand-gray-500 mt-1">active pickup + processing</p>
          </div>
          <div className="card-feature">
            <p className="text-xs font-bold text-brand-gray-500 uppercase tracking-wider mb-2">
              Completed
            </p>
            <p className="text-3xl font-bold text-brand-black">{completedCount}</p>
            <p className="text-xs text-brand-gray-500 mt-1">scrapped + closed</p>
          </div>
        </div>

        {/* Quick actions */}
        <div className="grid md:grid-cols-2 gap-4">
          <Link href="/cc/leads" className="card-feature group block">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <ListChecks className="w-5 h-5 text-brand-red" />
                  <h2 className="font-bold text-lg">Available leads in your catchment</h2>
                </div>
                <p className="text-sm text-brand-gray-700">
                  Vehicles visible in the marketplace that fall inside this centre's
                  catchment. Tap <span className="font-semibold">Accept</span> to
                  signal interest to your parent RVSF.
                </p>
              </div>
              <ArrowRight className="w-4 h-4 text-brand-gray-500 group-hover:text-brand-red transition-colors" />
            </div>
          </Link>

          <div className="card-feature">
            <div className="flex items-center gap-2 mb-2">
              <ShieldCheck className="w-5 h-5 text-brand-red" />
              <h2 className="font-bold text-lg">What you can do here</h2>
            </div>
            <ul className="text-sm text-brand-gray-700 space-y-1.5 list-disc pl-4">
              <li>See every lead in your CC's catchment radius.</li>
              <li>Accept leads — your parent RVSF gets the signal and unlocks.</li>
              <li>
                <span className="text-brand-gray-500">Rejection is reserved for RVSF admins (per platform policy).</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Footer note for the demo */}
        <div className="card-base bg-brand-red-xlight">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-brand-red mt-0.5 shrink-0" />
            <div className="text-sm text-brand-gray-700">
              <p className="font-bold mb-1">v2 CC operator surface — live.</p>
              <p>
                You're seeing the new v2 dashboard. The older
                <span className="font-mono"> /scrapcentre/dashboard </span>
                (Novalytix) remains live for the legacy "scrapcentre" role; v2
                CC operators land here automatically.
              </p>
            </div>
          </div>
        </div>

        <div className="text-xs text-brand-gray-500 flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5" />
          Catchment radius: <span className="font-mono">{cc?.catchment?.radiusKm ?? "?"} km</span>
        </div>
      </main>
    </div>
  )
}

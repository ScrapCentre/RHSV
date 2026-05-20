/**
 * /admin/triage — Admin Triage Queue Page — ScrapCentre.com
 * NEW page per engineering-design §10, §13, design-system §4.15.
 * SERVER COMPONENT for initial data load (RSC).
 * Action buttons (Approve Auraiya / Marketplace / Reject) call backend client-side
 * via the embedded TriageActions client component — not server actions, per §19.
 * Auth: admin role required. Redirects to /admin if not admin.
 * API: GET /api/triage/queue → TriageLeadCard data
 */

import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import TriageClientSection from "./TriageClientSection"

export const dynamic = "force-dynamic"

export default async function TriagePage() {
  const session = await getServerSession(authOptions)

  if (!session || (session.user as any)?.role !== "admin") {
    redirect("/admin")
  }

  // Fetch triage queue server-side
  let leads: any[] = []
  let fetchError: string | null = null

  try {
    // Use absolute URL for server-side fetch (same process, localhost)
    const baseUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3000"
    const res = await fetch(`${baseUrl}/api/triage/queue`, {
      headers: {
        // Pass session cookie through for auth (getServerSession handles this,
        // but the API also accepts it via the session object)
        Cookie: `next-auth.session-token=${(session as any)?.sessionToken ?? ""}`,
      },
      cache: "no-store",
    })

    if (res.ok) {
      const data = await res.json()
      leads = data.leads ?? data ?? []
    } else {
      fetchError = `API returned ${res.status}`
    }
  } catch (err: any) {
    fetchError = err.message ?? "Failed to fetch triage queue"
  }

  return (
    <div className="min-h-screen bg-[var(--brand-bg)] px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Page header */}
        <div className="mb-8">
          <h1 className="text-2xl font-extrabold text-[var(--brand-black)]">
            Triage Queue — Quality Leads
          </h1>
          <p className="text-[var(--brand-gray-500)] text-sm mt-1">
            These leads have completed Tier-3 verification. Route each to Auraiya, the marketplace, or reject.
          </p>
        </div>

        {fetchError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
            Failed to load triage queue: {fetchError}. The API may need authentication setup.
          </div>
        )}

        {/* Client section handles actions and re-fetch */}
        <TriageClientSection initialLeads={leads} />
      </div>
    </div>
  )
}

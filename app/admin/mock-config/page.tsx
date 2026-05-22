/**
 * /admin/mock-config — Mock Service Toggle Page — ScrapCentre.com
 * NEW page per engineering-design §5 + dashboard quick-link at app/admin/page.tsx:318.
 *
 * SERVER COMPONENT — handles auth guard. Redirects to /admin if not admin.
 * The interactive form lives in MockConfigClientSection (client component) which
 * loads the current mockConfig via GET /api/admin/mock-config and POSTs updates.
 *
 * Backend API: app/api/admin/mock-config/route.ts (GET / POST)
 *   GET  → { mode: "success"|"failure"|"random", services: { vahan, otp, digilocker, vision, maps } }
 *   POST → same shape (partial update; per-service value omitted = "use global")
 *
 * Auth: admin role required (matches /admin/triage pattern).
 */

import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import MockConfigClientSection from "./MockConfigClientSection"

export const dynamic = "force-dynamic"

export default async function MockConfigPage() {
  // QA-fix (Wave 4): explicit page-level admin guard — even though admin/layout.tsx
  // also redirects non-admins, having the server-component guard here means a
  // direct GET to /admin/mock-config never even renders the client shell for
  // unauthenticated requests. Same pattern as /admin/triage.
  const session = await getServerSession(authOptions)

  if (!session || (session.user as any)?.role !== "admin") {
    redirect("/admin")
  }

  return (
    <div className="min-h-screen bg-[var(--brand-bg)] px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Page header */}
        <div className="mb-8">
          <h1 className="text-2xl font-extrabold text-[var(--brand-black)]">
            Mock Service Configuration
          </h1>
          <p className="text-[var(--brand-gray-500)] text-sm mt-1">
            Flip mock external services between <strong>success</strong> /{" "}
            <strong>failure</strong> / <strong>random</strong> for testing the dummy flow.
            Per-service overrides take precedence over the global default. Changes take
            effect within ~10 seconds (server-side cache TTL).
          </p>
        </div>

        <MockConfigClientSection />
      </div>
    </div>
  )
}

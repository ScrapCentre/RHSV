// Admin-only Demo Data hub.
//
// Purpose: surface the IDs the seed script (scripts/seed-demo-leads.ts) writes
// to terminal as clickable rows in the browser, so the founder can walk through
// the v2 demo without SSHing to VM 221.
//
// Also exposes the 5 shared test logins (private staging, founder-only) and a
// re-seed button that POSTs to /api/admin/reseed-demo.
//
// SECURITY (2026-05-22): This is now a SERVER component. The shared test
// password (`TEST_PASSWORD` in lib/services/demo/seed.ts) is rendered directly
// into the HTML on this admin-gated route — it never enters the client JS
// bundle that any visitor to /admin/demo-leads could otherwise download. The
// previous "use client" version inlined the password as a module constant
// which compiled into the per-route JS chunk, leaking it to unauthenticated
// network inspectors. See /Users/pranjalpatel/Documents/RHSV-docs/
// v2-fix-reseed-footgun-2026-05-22.md for the post-mortem.
//
// The interactive bits (re-seed button + copy buttons + leads list refresh)
// live in the sibling `DemoLeadsClient` client island, which receives the
// pre-fetched data + a non-secret display label as props but never the raw
// password value.
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { AlertTriangle, Database, Key, Users } from "lucide-react"
import { TEST_PASSWORD } from "@/lib/services/demo/seed"
import DemoLeadsClient from "./DemoLeadsClient"

// Force dynamic render so the admin check + session read are evaluated on
// every request — never cached / never sent to non-admin sessions.
export const dynamic = "force-dynamic"

const TEST_USERS: { email: string; role: string; note: string }[] = [
  { email: "admin.test@scrapcentre.online",   role: "admin",          note: "ScrapCentre admin (this account, probably)" },
  { email: "client.test@scrapcentre.online",  role: "client",         note: "Use for customer-side demo (e.g. /me/chat)" },
  { email: "exec.test@scrapcentre.online",    role: "executive",      note: "Internal executive role" },
  { email: "centre.test@scrapcentre.online",  role: "cc_operator",    note: "Collection-centre operator (Auraiya)" },
  { email: "partner.test@scrapcentre.online", role: "rvsf_admin",     note: "Use for RVSF-side demo (unlock + chat)" },
]

export default async function DemoLeadsPage() {
  // Server-side admin gate. Even though the parent layout also gates
  // client-side, the page-level check is what prevents the password (rendered
  // into HTML below) from leaving the server for a non-admin caller.
  const session = await getServerSession(authOptions)
  if (!session || (session.user as any).role !== "admin") {
    redirect("/login")
  }

  return (
    <div className="max-w-5xl mx-auto py-6 space-y-8">
      {/* Header + interactive re-seed button (client island) */}
      <DemoLeadsClient />

      {/* Test logins — fully server-rendered. The password lives only in HTML
          delivered to this admin-gated page, never in any JS chunk. */}
      <section className="space-y-3">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Users className="w-5 h-5 text-emerald-500" />
          Shared test logins
        </h2>

        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50 rounded-xl p-3 text-xs text-amber-800 dark:text-amber-300 flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
          <span>
            These accounts only exist in the staging Atlas DB. The shared password below is rendered server-side on this admin-only route and is safe to share with the Novalytix team for the demo. It is NOT shipped in any browser JS bundle.
          </span>
        </div>

        <div className="bg-white dark:bg-[#0E192D] rounded-xl border border-gray-100 dark:border-slate-800 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 dark:border-slate-800 bg-gray-50 dark:bg-slate-900/50 flex items-center gap-3 flex-wrap">
            <Key className="w-4 h-4 text-emerald-500" />
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-slate-400">Shared password</span>
            <code className="font-mono text-sm bg-white dark:bg-slate-800 px-2 py-1 rounded border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white">
              {TEST_PASSWORD}
            </code>
            <span className="ml-auto text-[10px] font-medium text-emerald-600 dark:text-emerald-400">
              Server-rendered · not in JS bundle
            </span>
          </div>

          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-slate-900/30 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-slate-500">
              <tr>
                <th className="px-4 py-2 text-left">Email</th>
                <th className="px-4 py-2 text-left">Role</th>
                <th className="px-4 py-2 text-left">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
              {TEST_USERS.map((u) => (
                <tr key={u.email} className="hover:bg-gray-50 dark:hover:bg-slate-900/30 transition-colors">
                  <td className="px-4 py-2 font-mono text-xs text-gray-900 dark:text-white">{u.email}</td>
                  <td className="px-4 py-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300">
                      {u.role}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-xs text-gray-500 dark:text-slate-400">{u.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <p className="text-xs text-gray-400 dark:text-slate-500 text-center pt-4 flex items-center justify-center gap-2 flex-wrap">
        <Database className="w-3.5 h-3.5" />
        Admin-only · Source: <code className="font-mono">app/admin/demo-leads/page.tsx</code>{" "}
        + <code className="font-mono">DemoLeadsClient.tsx</code> · Backed by{" "}
        <code className="font-mono">lib/services/demo/seed.ts</code>.
      </p>
    </div>
  )
}

// v2 admin entry-point nav — drop-in tile grid for the /admin landing page.
// Lives above Novalytix's existing DashboardOverview so the founder can jump
// to every v2 admin page from a single shell without losing the v1 analytics.
import Link from "next/link"

const TILES: { href: string; title: string; subtitle: string }[] = [
  { href: "/admin/triage",         title: "Triage",         subtitle: "Route quality leads" },
  { href: "/admin/mock-config",    title: "Mock Config",    subtitle: "Flip mock external services" },
  { href: "/admin/refund-review",  title: "Refund Review",  subtitle: "Adjudicate rejection refunds" },
  { href: "/admin/needs-attention",title: "Needs Attention",subtitle: "Ping-pong + stale leads" },
  { href: "/admin/demo-leads",     title: "Demo Leads",     subtitle: "Seed / inspect demo data" },
  { href: "/admin/settings",       title: "Settings",       subtitle: "Edit ConfigSetting values" },
  { href: "/admin/rvsfs",          title: "RVSFs",          subtitle: "Browse all scrap facilities" },
  { href: "/admin/dsc-pending",    title: "DSC Pending",    subtitle: "DigiELV concierge queue" },
  { href: "/admin/audit-log",      title: "Audit Log",      subtitle: "Recent admin actions" },
]

export default function AdminV2Nav() {
  return (
    <section className="max-w-7xl mx-auto px-4 pt-6">
      <h2 className="text-sm font-bold uppercase tracking-wider text-brand-gray-500 mb-3">
        Admin v2
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {TILES.map((t) => (
          <Link
            key={t.href}
            href={t.href}
            className="card-feature hover:border-brand-red transition-colors block p-3 sm:p-4"
          >
            <div className="font-bold text-brand-black text-sm sm:text-base">{t.title}</div>
            <div className="text-[11px] sm:text-xs text-brand-gray-500 mt-1 leading-snug">{t.subtitle}</div>
          </Link>
        ))}
      </div>
    </section>
  )
}

"use client"

/**
 * Footer — ScrapCentre.com
 * Rewritten per design-system §4.12 and §6.
 * Changes: removed raining-icons animation (bandwidth cost),
 *          3-office grid from brand-guide §5,
 *          all phone numbers as tappable tel: links,
 *          brand-red accents, correct domain references.
 */

import Link from "next/link"
import { Phone, Mail, MapPin, ArrowUp } from "lucide-react"

const OFFICES = [
  {
    label: "Head Office",
    address: "26-A & B, Block-E, Panki, Kalpi Road, Kanpur — 208020",
  },
  {
    label: "RVSF Facility",
    address: "A-4, UPSIDC Industrial Area, Plasticity, Dibiyapur, Auraiya (UP)",
  },
  {
    label: "Branch Office (Kanpur)",
    address: "Ratanzone, 118/54, 55, 2nd Floor, Kaushalpuri, Kanpur",
  },
]

const PHONES = [
  { number: "9839447733", display: "+91-9839447733" },
  { number: "9839336644", display: "+91-9839336644" },
  { number: "8795886699", display: "+91-8795886699" },
]

const EMAILS = [
  { address: "info@restorehealthmedicare.com", label: "Corporate" },
  { address: "scrapcentre.com@gmail.com", label: "Customer support" },
]

const LINKS = [
  { label: "About Us", href: "/about" },
  { label: "How It Works", href: "/about#how-it-works" },
  { label: "Sell My Vehicle", href: "/calculator?type=A" },
  { label: "Buy a CD", href: "/calculator?type=C" },
  { label: "For RVSF Partners", href: "/contact" }, // TODO[frontend-dev]: update to /rvsf once partner landing is built
  { label: "Terms & Conditions", href: "/terms" },
  { label: "Contact Us", href: "/contact" },
]

export default function Footer() {
  return (
    <footer className="bg-white border-t border-[var(--brand-gray-300)]">
      {/* Back-to-top strip */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        className="w-full bg-[var(--brand-gray-900)] hover:bg-[var(--brand-black)] text-white py-3 text-sm font-semibold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors duration-200"
        aria-label="Back to top"
      >
        Back to top <ArrowUp className="w-4 h-4" aria-hidden="true" />
      </button>

      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">

          {/* ── Brand column ── */}
          <div className="lg:col-span-1 space-y-4">
            {/* Inline logo at 52px (design-system §3.3 footer spec) */}
            <Link href="/" className="flex items-center gap-3 select-none" aria-label="ScrapCentre.com — home">
              {/* Real ScrapCentre logo PNG at public/brand/logo.png (1536x545 source) */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/brand/logo.png"
                alt="ScrapCentre"
                width={147}
                height={52}
                className="h-13 w-auto"
              />
              <span className="text-2xl font-bold leading-none" style={{ color: "var(--brand-red)" }}>
                ScrapCentre<span className="text-lg font-semibold">.com</span>
              </span>
            </Link>

            <p className="text-sm text-[var(--brand-gray-500)] leading-relaxed">
              A Unit of RestoreHealth Medicare Pvt. Ltd.
            </p>
            <p className="text-sm text-[var(--brand-gray-500)] leading-relaxed">
              Government-authorised Registered Vehicle Scrapping Facility (RVSF).
            </p>

            {/* Social handles placeholder (design-system §4.12) */}
            <p className="text-xs text-[var(--brand-gray-500)] italic">
              {/* TODO[frontend-dev]: add social icons once founder confirms handles */}
              Social links coming soon
            </p>
          </div>

          {/* ── Offices ── */}
          <div>
            <h3 className="text-sm font-semibold text-[var(--brand-gray-900)] uppercase tracking-wider mb-4">
              Offices
            </h3>
            <ul className="space-y-4">
              {OFFICES.map((office) => (
                <li key={office.label} className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-[var(--brand-red)] mt-0.5 shrink-0" aria-hidden="true" />
                  <div>
                    <p className="text-xs font-semibold text-[var(--brand-gray-700)]">{office.label}</p>
                    <p className="text-xs text-[var(--brand-gray-500)] leading-relaxed">{office.address}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* ── Contact ── */}
          <div>
            <h3 className="text-sm font-semibold text-[var(--brand-gray-900)] uppercase tracking-wider mb-4">
              Contact
            </h3>
            {/* Phone numbers — tappable, large, prominent for P2 (design-system §4.12) */}
            <ul className="space-y-2 mb-5">
              {PHONES.map((p) => (
                <li key={p.number}>
                  <a
                    href={`tel:${p.number}`}
                    className="flex items-center gap-2 text-sm font-semibold text-[var(--brand-gray-700)] hover:text-[var(--brand-red)] transition-colors"
                    aria-label={`Call ${p.display}`}
                  >
                    <Phone className="w-3.5 h-3.5 text-[var(--brand-red)] shrink-0" aria-hidden="true" />
                    {p.display}
                  </a>
                </li>
              ))}
            </ul>
            <ul className="space-y-2">
              {EMAILS.map((e) => (
                <li key={e.address}>
                  <a
                    href={`mailto:${e.address}`}
                    className="flex items-start gap-2 text-xs text-[var(--brand-gray-500)] hover:text-[var(--brand-red)] transition-colors break-all"
                    aria-label={`Email: ${e.address} (${e.label})`}
                  >
                    <Mail className="w-3.5 h-3.5 text-[var(--brand-red)] shrink-0 mt-0.5" aria-hidden="true" />
                    <span>{e.address}<br /><span className="text-[var(--brand-gray-300)]">{e.label}</span></span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* ── Quick links ── */}
          <div>
            <h3 className="text-sm font-semibold text-[var(--brand-gray-900)] uppercase tracking-wider mb-4">
              Quick Links
            </h3>
            <ul className="space-y-2">
              {LINKS.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-[var(--brand-gray-500)] hover:text-[var(--brand-red)] transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* ── Bottom bar ── */}
      <div className="border-t border-[var(--brand-gray-300)] bg-[var(--brand-gray-900)]">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-4 flex flex-col md:flex-row justify-between items-center gap-2 text-xs text-[var(--brand-gray-300)]">
          <p>© {new Date().getFullYear()} ScrapCentre.com · Government-authorised RVSF</p>
          <p>Registered: RestoreHealth Medicare Pvt. Ltd.</p>
        </div>
      </div>
    </footer>
  )
}

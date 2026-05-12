"use client"

/**
 * Navbar — ScrapCentre.com
 * Rewritten from 686L → ~200L per design-system §4.13 and §6.
 * Changes: removed GSAP ScrollTrigger, removed mega-dropdowns,
 *          new link structure (Sell / Buy CD / Partners / About),
 *          brand-red logo + wordmark, sticky blur on scroll,
 *          Sheet drawer for mobile, tappable phone number.
 */

import { useState, useEffect } from "react"
import Link from "next/link"
import { useSession, signOut } from "next-auth/react"
import { usePathname } from "next/navigation"
import { Menu, Phone, User, LogOut, LayoutDashboard, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const NAV_LINKS = [
  { label: "Sell My Vehicle", href: "/calculator?type=A" },
  { label: "Buy a CD", href: "/calculator?type=C" },
  { label: "RVSF Partners", href: "/contact" }, // TODO[frontend-dev]: update to /rvsf once partner landing is built
  { label: "About", href: "/about" },
]

const PHONE = "9839447733"

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [sheetOpen, setSheetOpen] = useState(false)
  const { data: session } = useSession()
  const pathname = usePathname()

  // Close drawer on route change
  useEffect(() => { setSheetOpen(false) }, [pathname])

  // Sticky shadow on scroll
  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 8)
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  const dashboardHref =
    session?.user && (session.user as any).role === "admin"
      ? "/admin"
      : session?.user && (session.user as any).role === "partner"
      ? "/b2b/marketplace"
      : "/profile"

  const displayName =
    session?.user?.name === "Novalytix Admin" ? "Admin" : session?.user?.name

  return (
    <header
      className={`sticky top-0 z-50 w-full bg-white/95 backdrop-blur-sm transition-shadow duration-200 ${
        isScrolled ? "shadow-sm border-b border-brand-gray-300" : ""
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 flex items-center justify-between h-16">

        {/* ── Logo + Wordmark ── */}
        <Link href="/" className="flex items-center gap-3 select-none shrink-0" aria-label="ScrapCentre.com — home">
          {/* Real ScrapCentre logo PNG at public/brand/logo.png (1536x545 source) */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/brand/logo.png"
            alt="ScrapCentre"
            width={113}
            height={40}
            className="h-10 w-auto"
          />
          {/* Wordmark: "ScrapCentre" bold + ".com" semibold smaller (design-system §3.3) */}
          <span className="text-xl font-bold leading-none" style={{ color: "var(--brand-red)" }}>
            ScrapCentre<span className="text-base font-semibold">.com</span>
          </span>
        </Link>

        {/* ── Desktop nav ── */}
        <nav className="hidden md:flex items-center gap-1" aria-label="Main navigation">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`px-3 py-2 text-sm font-medium rounded-md transition-colors min-h-0 min-w-0 ${
                pathname === link.href
                  ? "text-[var(--brand-red)] bg-[var(--brand-red-light)]"
                  : "text-[var(--brand-gray-700)] hover:text-[var(--brand-red)] hover:bg-[var(--brand-gray-100)]"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* ── Desktop right actions ── */}
        <div className="hidden md:flex items-center gap-2">
          {/* Tappable phone — P2 trust signal (design-system §4.13) */}
          <a
            href={`tel:${PHONE}`}
            className="flex items-center gap-1.5 text-sm font-medium text-[var(--brand-gray-700)] hover:text-[var(--brand-red)] transition-colors px-2 py-1.5 min-h-0 min-w-0"
            aria-label={`Call us: ${PHONE}`}
          >
            <Phone className="w-4 h-4 shrink-0" />
            <span>{PHONE}</span>
          </a>

          {session ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-1.5 border-[var(--brand-gray-300)]">
                  <User className="w-4 h-4" />
                  <span className="max-w-24 truncate">{displayName ?? "Account"}</span>
                  <ChevronDown className="w-3 h-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem asChild>
                  <Link href={dashboardHref} className="flex items-center gap-2 min-h-0 min-w-0">
                    <LayoutDashboard className="w-4 h-4" /> Dashboard
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-[var(--brand-red)] focus:text-[var(--brand-red)] cursor-pointer"
                  onClick={() => signOut({ callbackUrl: "/" })}
                >
                  <LogOut className="w-4 h-4 mr-2" /> Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button
              asChild
              size="sm"
              className="bg-[var(--brand-red)] hover:bg-[var(--brand-red-dark)] text-white font-semibold"
            >
              <Link href="/login">Login / Sign up</Link>
            </Button>
          )}
        </div>

        {/* ── Mobile hamburger ── */}
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden text-[var(--brand-gray-700)]"
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5" />
            </Button>
          </SheetTrigger>

          <SheetContent side="right" className="w-72 pt-8">
            <nav className="flex flex-col gap-1" aria-label="Mobile navigation">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="px-4 py-3 text-base font-medium rounded-md text-[var(--brand-gray-700)] hover:text-[var(--brand-red)] hover:bg-[var(--brand-red-xlight)] transition-colors min-h-0 min-w-0"
                >
                  {link.label}
                </Link>
              ))}

              <hr className="my-3 border-[var(--brand-gray-300)]" />

              {session ? (
                <>
                  <Link
                    href={dashboardHref}
                    className="px-4 py-3 text-base font-medium rounded-md text-[var(--brand-gray-700)] hover:bg-[var(--brand-gray-100)] flex items-center gap-2 min-h-0 min-w-0"
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    {displayName ? `Hi, ${displayName}` : "My Account"}
                  </Link>
                  <button
                    onClick={() => signOut({ callbackUrl: "/" })}
                    className="px-4 py-3 text-base font-medium rounded-md text-[var(--brand-red)] hover:bg-[var(--brand-red-light)] text-left flex items-center gap-2"
                  >
                    <LogOut className="w-4 h-4" /> Sign out
                  </button>
                </>
              ) : (
                <Link
                  href="/login"
                  className="mx-4 mt-2 flex items-center justify-center gap-2 h-12 rounded-md bg-[var(--brand-red)] text-white font-semibold text-base hover:bg-[var(--brand-red-dark)] transition-colors min-w-0"
                >
                  Login / Sign up
                </Link>
              )}

              {/* Phone — always visible in mobile drawer (design-system §4.13) */}
              <a
                href={`tel:${PHONE}`}
                className="mt-4 mx-4 flex items-center justify-center gap-2 h-12 rounded-md border border-[var(--brand-gray-300)] text-[var(--brand-gray-700)] font-medium hover:border-[var(--brand-red)] hover:text-[var(--brand-red)] transition-colors"
                aria-label={`Call us: ${PHONE}`}
              >
                <Phone className="w-4 h-4" />
                Call Now: {PHONE}
              </a>
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  )
}

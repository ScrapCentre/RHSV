"use client"

/**
 * LanguageToggle — locale switcher for the public Navbar.
 *
 * Design decisions:
 * ─────────────────
 * • Uses `useParams()` from next/navigation (always available, no provider
 *   needed) to read the current locale from the [locale] URL segment.
 * • Returns null on non-localized routes (/login, /partner-register, /admin…)
 *   where `params.locale` is undefined — no Error Boundary required.
 * • Switches locale by manually rewriting the URL:
 *     /about      (en, as-needed → no prefix)  →  /hi/about
 *     /hi/about   (hi)                          →  /about
 *   This matches the `localePrefix: "as-needed"` config in i18n/routing.ts.
 * • NEXT_LOCALE cookie: with `localeDetection: false` in routing.ts,
 *   next-intl does NOT consult a cookie for auto-detection. Locale is
 *   purely URL-driven, so no cookie needs to be set manually.
 */

import { useParams, usePathname, useRouter } from "next/navigation"
import { useTransition } from "react"
import { Check, ChevronDown, Globe } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

// ─── Config ───────────────────────────────────────────────────────────────────

const LOCALES = [
  { code: "en", nativeLabel: "English" },
  { code: "hi", nativeLabel: "हिन्दी"  },
] as const

type LocaleCode = (typeof LOCALES)[number]["code"]

const SUPPORTED = LOCALES.map((l) => l.code)

// ─── Component ────────────────────────────────────────────────────────────────

export default function LanguageToggle() {
  // `params.locale` is only present on routes inside app/[locale]/.
  // On /login, /partner-register, /admin, etc. it is undefined → we hide.
  const params   = useParams()
  const locale   = SUPPORTED.includes(params?.locale as LocaleCode)
    ? (params.locale as LocaleCode)
    : null

  const pathname         = usePathname()   // full URL path e.g. /hi/about
  const router           = useRouter()
  const [isPending, startTransition] = useTransition()

  // Hide on all non-localized routes
  if (!locale) return null

  function switchLocale(next: LocaleCode) {
    if (next === locale) return

    // Strip any existing locale prefix from the pathname, then
    // add the new prefix only if it's not the default (en, as-needed).
    //   /about      → strip nothing → /about    (en: no prefix)
    //   /hi/about   → strip /hi    → /about    (en: no prefix)
    //   /about      → add /hi      → /hi/about (hi: with prefix)
    const stripPattern = new RegExp(`^\\/(${SUPPORTED.join("|")})(?=\\/|$)`)
    const pagePath = pathname.replace(stripPattern, "") || "/"

    const targetPath = next === "en"
      ? pagePath                 // as-needed: English has no prefix
      : `/${next}${pagePath}`    // e.g. /hi/about

    // Fire GA4 & GTM custom event for language switch
    if (typeof window !== "undefined") {
      // @ts-expect-error - gtag is added globally
      if (typeof window.gtag === "function") {
        // @ts-expect-error - gtag is added globally
        window.gtag("event", "language_switch", {
          from_language: locale,
          to_language: next,
          target_path: targetPath,
        })
      }
      if (Array.isArray((window as any).dataLayer)) {
        (window as any).dataLayer.push({
          event: "language_switch",
          from_language: locale,
          to_language: next,
          target_path: targetPath,
        })
      }
    }

    startTransition(() => {
      router.push(targetPath)
    })
  }

  const active = LOCALES.find((l) => l.code === locale) ?? LOCALES[0]

  return (
    <DropdownMenu>
      {/* ── Trigger ─────────────────────────────────────────────────────── */}
      <DropdownMenuTrigger asChild>
        <button
          aria-label="Switch language"
          aria-haspopup="listbox"
          disabled={isPending}
          className="
            group flex items-center gap-1.5
            px-3 py-1.5 rounded-xl
            border border-slate-200 bg-white
            text-slate-700 text-xs font-bold uppercase tracking-wide
            transition-all duration-200
            hover:border-[#E31E24] hover:text-[#E31E24]
            data-[state=open]:border-[#E31E24] data-[state=open]:text-[#E31E24]
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E31E24]/30
            disabled:opacity-50 disabled:cursor-not-allowed select-none
          "
        >
          <Globe
            className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#E31E24] group-data-[state=open]:text-[#E31E24] transition-colors shrink-0"
            aria-hidden
          />
          {/* Native label on sm+; globe-only on xs */}
          <span className="hidden sm:inline leading-none">{active.nativeLabel}</span>
          <ChevronDown
            className="w-3 h-3 text-slate-400 group-hover:text-[#E31E24] group-data-[state=open]:rotate-180 transition-all duration-200 shrink-0"
            aria-hidden
          />
        </button>
      </DropdownMenuTrigger>

      {/* ── Dropdown ────────────────────────────────────────────────────── */}
      <DropdownMenuContent
        align="end"
        sideOffset={8}
        className="min-w-[148px] rounded-xl border border-slate-100 shadow-xl p-1 z-[200]"
      >
        {LOCALES.map((loc) => {
          const isActive = loc.code === locale
          return (
            <DropdownMenuItem
              key={loc.code}
              role="option"
              aria-selected={isActive}
              onClick={() => switchLocale(loc.code)}
              className={`
                flex items-center justify-between gap-3
                px-3 py-2.5 rounded-lg
                text-sm font-semibold cursor-pointer
                transition-colors duration-150
                focus:outline-none
                ${isActive
                  ? "text-[#E31E24] bg-red-50"
                  : "text-slate-700 hover:text-[#E31E24] hover:bg-red-50 focus:text-[#E31E24] focus:bg-red-50"
                }
              `}
            >
              <span>{loc.nativeLabel}</span>
              {isActive && (
                <Check
                  className="w-3.5 h-3.5 text-[#E31E24] shrink-0"
                  aria-hidden
                />
              )}
            </DropdownMenuItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

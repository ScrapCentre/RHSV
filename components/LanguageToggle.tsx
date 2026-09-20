"use client"

/**
 * LanguageToggle — interactive locale toggle switch for the navbar.
 * Features:
 * - Whole button is clickable to toggle (click anywhere on pill to switch)
 * - Segmented pill switch with Framer Motion sliding indicator
 * - Optimistic animation (slides BEFORE route transition)
 * - Tactile micro-interactions (hover, tap, spring physics)
 * - Direct toggle between English (EN) & Hindi (हिन्दी)
 */

import { useParams, usePathname, useRouter } from "next/navigation"
import { useTransition, useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Loader2 } from "lucide-react"

// ─── Config ───────────────────────────────────────────────────────────────────

const LOCALES = [
  { code: "en", label: "EN", fullLabel: "English" },
  { code: "hi", label: "हिन्दी", fullLabel: "हिन्दी" },
] as const

type LocaleCode = (typeof LOCALES)[number]["code"]

const SUPPORTED = LOCALES.map((l) => l.code)

// ─── Component ────────────────────────────────────────────────────────────────

export default function LanguageToggle() {
  const params = useParams()
  const currentLocale = SUPPORTED.includes(params?.locale as LocaleCode)
    ? (params.locale as LocaleCode)
    : null

  const pathname = usePathname()
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [activeLocale, setActiveLocale] = useState<LocaleCode | null>(currentLocale)

  // Sync state if currentLocale changes from URL param
  useEffect(() => {
    setActiveLocale(currentLocale)
  }, [currentLocale])

  if (!currentLocale) return null

  const displayLocale = activeLocale ?? currentLocale

  function switchLocale(next: LocaleCode) {
    if (next === displayLocale || isPending) return

    // 1. Instantly slide the pill visually so user sees the animation FIRST
    setActiveLocale(next)

    const stripPattern = new RegExp(`^\\/(${SUPPORTED.join("|")})(?=\\/|$)`)
    const pagePath = pathname.replace(stripPattern, "") || "/"
    const targetPath = next === "en" ? pagePath : `/${next}${pagePath}`

    // Fire GA4 & GTM custom event for language switch
    if (typeof window !== "undefined") {
      // @ts-expect-error - gtag is added globally
      if (typeof window.gtag === "function") {
        // @ts-expect-error - gtag is added globally
        window.gtag("event", "language_switch", {
          from_language: displayLocale,
          to_language: next,
          target_path: targetPath,
        })
      }
      if (Array.isArray((window as any).dataLayer)) {
        ;(window as any).dataLayer.push({
          event: "language_switch",
          from_language: displayLocale,
          to_language: next,
          target_path: targetPath,
        })
      }
    }

    // 2. Wait 220ms so user watches the smooth toggle animation complete, then trigger route refresh
    setTimeout(() => {
      startTransition(() => {
        router.push(targetPath)
      })
    }, 220)
  }

  function handleToggle() {
    const nextLocale = displayLocale === "en" ? "hi" : "en"
    switchLocale(nextLocale)
  }

  return (
    <div className="relative inline-flex items-center">
      <motion.button
        type="button"
        role="switch"
        aria-checked={displayLocale === "hi"}
        aria-label="Toggle language between English and Hindi"
        disabled={isPending}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleToggle}
        className={`
          relative flex items-center gap-0.5 p-1
          bg-slate-100/90 dark:bg-slate-800/90
          backdrop-blur-md rounded-xl
          border border-slate-200/90 dark:border-slate-700/90
          shadow-inner select-none transition-all duration-300
          cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E31E24]/50
          ${isPending ? "cursor-wait opacity-90" : "cursor-pointer"}
        `}
      >
        {LOCALES.map((loc) => {
          const isActive = loc.code === displayLocale

          return (
            <span
              key={loc.code}
              className={`
                relative z-10 flex items-center justify-center
                px-3.5 py-1 rounded-lg
                text-xs font-bold tracking-wide transition-colors duration-200
                ${
                  isActive
                    ? "text-white"
                    : "text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
                }
              `}
            >
              {isActive && (
                <motion.div
                  layoutId="activeLanguagePill"
                  className="
                    absolute inset-0
                    bg-gradient-to-r from-[#E31E24] to-[#C1121F]
                    rounded-lg
                    shadow-[0_2px_10px_rgba(227,30,36,0.35)]
                    -z-10
                  "
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
              <span className={loc.code === "hi" ? "font-semibold text-[13px]" : "font-extrabold uppercase text-xs"}>
                {loc.label}
              </span>
            </span>
          )
        })}
      </motion.button>

      {isPending && (
        <span className="absolute -right-5 top-1/2 -translate-y-1/2 flex items-center pointer-events-none">
          <Loader2 className="w-3.5 h-3.5 animate-spin text-[#E31E24]" />
        </span>
      )}
    </div>
  )
}




import type React from "react"
import type { Metadata } from "next"
import { NextIntlClientProvider } from "next-intl"
import { getMessages, setRequestLocale } from "next-intl/server"
import { routing } from "@/i18n/routing"
import { notFound } from "next/navigation"

// generateStaticParams — pre-build /en and /hi shells at build time
export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

// generateMetadata — sets locale-specific SEO metadata.
// Next.js merges this with root layout metadata; closest layout wins on conflicts.
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  return {
    // Tell crawlers the canonical locale for this URL variant
    openGraph: { locale: locale === "hi" ? "hi_IN" : "en_IN" },
  }
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params

  // Reject any unknown locale segment (e.g. /fr/about → 404)
  if (!routing.locales.includes(locale as "en" | "hi")) {
    notFound()
  }

  // Required for next-intl static rendering — must be called before
  // any async work that reads locale.
  setRequestLocale(locale)

  // Load the message catalogue for this locale (en.json / hi.json).
  // getMessages() reads from the request context set by setRequestLocale
  // above — it does NOT call headers() and does NOT make this route dynamic.
  const messages = await getMessages()

  // ── What this layout intentionally does NOT do ──────────────────────
  // • No <html>, <head>, <body>   → root app/layout.tsx owns those
  // • No AuthProvider             → root app/layout.tsx owns it
  // • No ThemeProvider            → root app/layout.tsx owns it
  // • No GoogleAnalytics/Tag/GTM  → root app/layout.tsx owns them
  // • No AdminAwareLayout         → root app/layout.tsx owns it
  // • No Toaster                  → root app/layout.tsx owns it
  // • No fonts / CSS import       → root app/layout.tsx owns them
  // • No NextIntlClientProvider   → root app/layout.tsx now owns it
  //   (lifted so Navbar can use useTranslations on ALL routes)
  // Duplicating any of the above would cause nested <html> tags and
  // double-mounting of providers, breaking hydration.
  // ────────────────────────────────────────────────────────────────────

  return (
    <NextIntlClientProvider messages={messages}>
      <div className={locale === "hi" ? "lang-hi" : ""}>
        {children}
      </div>
    </NextIntlClientProvider>
  )
}

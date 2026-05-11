import type React from "react"
import type { Metadata } from "next"
import { Inter, Noto_Sans_Devanagari } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import AuthProvider from "@/components/AuthProvider"
import AdminAwareLayout from "@/components/AdminAwareLayout"
import GoogleAnalytics from "@/components/GoogleAnalytics"

/* ── Primary font: Inter Variable (design-system §2.2) ── */
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
})

/* ── Secondary font: Noto Sans Devanagari (design-system §2.2) ──
   Hindi copy will use .font-devanagari utility class.
   Translations are deferred; font is loaded ready for Wave 2. */
const notoDevanagari = Noto_Sans_Devanagari({
  subsets: ["devanagari"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-noto-devanagari",
  display: "swap",
})

export const metadata: Metadata = {
  title: "ScrapCentre.com — Sell Your Old Vehicle the Right Way",
  description:
    "Government-authorised RVSF in Auraiya, UP. Get the exact scrap value + Certificate of Deposit benefit for your old car or bike — free pickup, full paperwork, same-day cash.",
  keywords:
    "scrap centre, vehicle scrapping, RVSF, scrap car India, certificate of deposit vehicle, CD benefit, Kanpur scrap, Auraiya RVSF, authorised vehicle scrapping",
  authors: [{ name: "ScrapCentre.com" }],
  creator: "ScrapCentre.com",
  publisher: "RestoreHealth Medicare Pvt. Ltd.",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://scrapcentre.com"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "ScrapCentre.com — Sell Your Old Vehicle the Right Way",
    description:
      "Government-authorised RVSF. Get your vehicle's exact scrap value + Certificate of Deposit benefit. Free pickup, full paperwork, same-day cash.",
    url: "https://scrapcentre.com",
    siteName: "ScrapCentre.com",
    images: [
      {
        url: "/brand/logo.png",
        width: 1200,
        height: 630,
        alt: "ScrapCentre.com — Government-authorised RVSF",
      },
    ],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ScrapCentre.com — Sell Your Old Vehicle the Right Way",
    description:
      "Government-authorised RVSF. Get your vehicle's exact scrap value + Certificate of Deposit benefit.",
    images: ["/brand/logo.png"],
    /* TODO[frontend-dev]: update @scrapcenter_in to real Twitter handle once founder registers */
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  /* Removed placeholder google verification code — add real token when Search Console is set up */
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <meta name="theme-color" content="#D92027" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <GoogleAnalytics />
      </head>
      <body className={`${inter.variable} ${notoDevanagari.variable} ${inter.className} antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false} disableTransitionOnChange>
          <AuthProvider>
            <AdminAwareLayout>
              {children}
            </AdminAwareLayout>
            <Toaster />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}

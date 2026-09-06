import type React from "react"
import type { Metadata } from "next"
import { Inter, Bebas_Neue, Noto_Sans_Devanagari } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import AuthProvider from "@/components/AuthProvider"
import AdminAwareLayout from "@/components/AdminAwareLayout"
import GoogleAnalytics from "@/components/GoogleAnalytics"
import GoogleTag from "@/components/GoogleTag"
import GoogleTagManager from "@/components/GoogleTagManager"


const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-latin"
})
const notoSansDevanagari = Noto_Sans_Devanagari({
  subsets: ["devanagari"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-devanagari",
})
const bebasNeue = Bebas_Neue({ 
  weight: "400", 
  subsets: ["latin"], 
  variable: "--font-bebas" 
})

export const metadata: Metadata = {
  title: "ScrapCenter India - Vehicle Scrapping Services",
  description:
    "Official authorized vehicle scrapping center in India. We specialize in environmentally friendly disposal of end-of-life vehicles (ELVs) in compliance with current regulations.",
  keywords:
    "scrap center, vehicle scrapping, car scrap, authorized scrapper, rto scrap, scrap car india",
  authors: [{ name: "ScrapCenter India" }],
  creator: "ScrapCenter India",
  publisher: "ScrapCenter India",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://www.scrapcentre.com"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "ScrapCenter India - Vehicle Scrapping Services",
    description:
      "Official authorized vehicle scrapping center in India. Get best price for your old car, bike or vehicle.",
    url: "https://www.scrapcentre.com",
    siteName: "ScrapCenter India",
    images: [
      {
        url: "/logo.png",
        width: 1200,
        height: 630,
        alt: "ScrapCenter India Logo",
      },
    ],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ScrapCenter India - Vehicle Scrapping Services",
    description:
      "Official authorized vehicle scrapping center in India. Get best price for your old car, bike or vehicle.",
    images: ["/logo.png"],
    creator: "@scrapcenter_in",
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
  verification: {
    google: "your-google-verification-code",
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
}

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": ["AutomotiveBusiness", "LocalBusiness"],
  "@id": "https://www.scrapcentre.com/#organization",
  "name": "ScrapCentre",
  "alternateName": "ScrapCenter India",
  "url": "https://www.scrapcentre.com/",
  "slogan": "India's Largest Capacity RVSF",
  "logo": {
    "@type": "ImageObject",
    "@id": "https://www.scrapcentre.com/#logo",
    "url": "https://www.scrapcentre.com/logo.png",
    "caption": "ScrapCentre",
  },
  "image": { "@id": "https://www.scrapcentre.com/#logo" },
  "telephone": "+91-9839447733",
  "email": "contact@scrapcentre.com",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "21-E, Block Panki",
    "addressLocality": "Kanpur",
    "postalCode": "208020",
    "addressCountry": "IN",
  },
  "areaServed": { "@type": "Country", "name": "India" },
  "sameAs": [
    "https://www.facebook.com/ScrapCentreOfficial",
    "https://www.linkedin.com/company/scrapcentre/",
    "https://www.instagram.com/scrapcentre_official/",
  ],
  "knowsAbout": [
    "Registered Vehicle Scrapping Facility (RVSF)",
    "End-of-life vehicle (ELV) scrapping",
    "Certificate of Deposit (COD) issuance",
    "RTO vehicle deregistration",
    "Eco-friendly vehicle recycling",
  ],
}

const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": "https://www.scrapcentre.com/#website",
  "url": "https://www.scrapcentre.com/",
  "name": "ScrapCentre",
  "publisher": { "@id": "https://www.scrapcentre.com/#organization" },
  "inLanguage": ["en-IN", "hi-IN"],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    // lang defaults to "en". On Hindi pages, next-intl's middleware sets
    // the locale in the request context, and [locale]/layout.tsx calls
    // setRequestLocale(locale). The html lang attribute is supplemented
    // by the metadata system and suppressHydrationWarning handles
    // any client-side locale mismatch gracefully.
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <meta name="theme-color" content="#000000" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
      </head>
      <body className={`${inter.className} ${inter.variable} ${notoSansDevanagari.variable} ${bebasNeue.variable} font-sans antialiased`}>
        <GoogleTagManager />
        <GoogleAnalytics />
        <GoogleTag />
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


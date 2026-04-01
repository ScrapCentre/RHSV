import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import AuthProvider from "@/components/AuthProvider"
import AdminAwareLayout from "@/components/AdminAwareLayout"
import GoogleAnalytics from "@/components/GoogleAnalytics"

const inter = Inter({ subsets: ["latin"] })

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
  metadataBase: new URL("https://scrapcenter.in"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "ScrapCenter India - Vehicle Scrapping Services",
    description:
      "Official authorized vehicle scrapping center in India. Get best price for your old car, bike or vehicle.",
    url: "https://scrapcenter.in",
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
        <meta name="theme-color" content="#000000" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <GoogleAnalytics />
      </head>
      <body className={`${inter.className} antialiased`}>
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


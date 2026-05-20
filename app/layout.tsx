import type React from "react"
import type { Metadata } from "next"
import { Inter, Bebas_Neue } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import AuthProvider from "@/components/AuthProvider"
import AdminAwareLayout from "@/components/AdminAwareLayout"
import GoogleAnalytics from "@/components/GoogleAnalytics"

const inter = Inter({ subsets: ["latin"] })
const bebasNeue = Bebas_Neue({ 
  weight: "400", 
  subsets: ["latin"], 
  variable: "--font-bebas" 
})

export const metadata: Metadata = {
  title: "ScrapCentre.com - Vehicle Scrapping Services",
  description:
    "Official authorized vehicle scrapping centre in India. We specialize in environmentally friendly disposal of end-of-life vehicles (ELVs) in compliance with current regulations.",
  keywords:
    "scrap centre, vehicle scrapping, car scrap, authorized scrapper, rto scrap, scrap car india, rvsf",
  authors: [{ name: "ScrapCentre.com" }],
  creator: "ScrapCentre.com",
  publisher: "ScrapCentre.com",
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
    title: "ScrapCentre.com - Vehicle Scrapping Services",
    description:
      "Official authorized vehicle scrapping centre in India. Get best price for your old car, bike or vehicle.",
    url: "https://scrapcentre.com",
    siteName: "ScrapCentre.com",
    images: [
      {
        url: "/logo.png",
        width: 1200,
        height: 630,
        alt: "ScrapCentre.com Logo",
      },
    ],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ScrapCentre.com - Vehicle Scrapping Services",
    description:
      "Official authorized vehicle scrapping centre in India. Get best price for your old car, bike or vehicle.",
    images: ["/logo.png"],
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
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.jpeg",
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
      <body className={`${inter.className} ${bebasNeue.variable} antialiased`}>
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


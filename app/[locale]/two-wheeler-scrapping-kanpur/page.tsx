import type { Metadata } from "next"
import { setRequestLocale } from "next-intl/server"
import { getAlternates } from "@/lib/seo/getAlternates"
import TwoWheelerKanpurComingSoonClient from "@/components/TwoWheelerKanpurComingSoonClient"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const typedLocale = locale === "hi" ? "hi" : "en"
  const isHindi = typedLocale === "hi"
  const alternates = getAlternates(typedLocale, "/two-wheeler-scrapping-kanpur")

  const title = isHindi
    ? "कानपुर में टू-व्हीलर स्क्रैपिंग सेवाएं — बाइक और स्कूटर स्क्रैप (जल्द आ रहा है) | ScrapCentre"
    : "Two-Wheeler Scrapping in Kanpur — Bike & Scooter Scrapping (Coming Soon) | ScrapCentre"
  const description = isHindi
    ? "कानपुर में अधिकृत टू-व्हीलर और बाइक स्क्रैपिंग सेवाएं। अधिकृत RVSF प्रक्रिया, मुफ्त पिकअप और आरसी रद्दीकरण सहायता के साथ जल्द शुरू हो रही हैं।"
    : "Authorised two-wheeler and bike scrapping services in Kanpur. Launching soon through government-approved RVSF process with doorstep pickup, instant COD, and RC cancellation."

  return {
    title,
    description,
    alternates,
    openGraph: {
      title,
      description,
      url: alternates.canonical,
      locale: isHindi ? "hi_IN" : "en_IN",
      siteName: "ScrapCentre",
      type: "website",
      images: [
        {
          url: "/logo.png",
          width: 1200,
          height: 630,
          alt: "ScrapCentre Kanpur Two-Wheeler Scrapping",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/logo.png"],
    },
  }
}

export default async function TwoWheelerScrappingKanpurPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const typedLocale = locale === "hi" ? "hi" : "en"
  setRequestLocale(typedLocale)

  const isHindi = typedLocale === "hi"

  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": isHindi ? "कानपुर में टू-व्हीलर स्क्रैपिंग सेवाएं" : "Two-Wheeler Scrapping in Kanpur",
    "serviceType": "Two Wheeler & Bike Scrapping",
    "provider": {
      "@type": "AutomotiveBusiness",
      "name": "ScrapCentre",
      "url": "https://www.scrapcentre.com",
    },
    "areaServed": {
      "@type": "City",
      "name": "Kanpur",
    },
    "description": isHindi
      ? "कानपुर में अधिकृत टू-व्हीलर और बाइक स्क्रैपिंग सेवाएं। अधिकृत RVSF प्रक्रिया, मुफ्त पिकअप और आरसी रद्दीकरण।"
      : "Authorised two-wheeler and motorcycle scrapping services in Kanpur with free doorstep pickup and instant COD.",
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
      />
      <TwoWheelerKanpurComingSoonClient isHindi={isHindi} />
    </>
  )
}

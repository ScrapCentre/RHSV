import type { Metadata } from "next"
import { setRequestLocale } from "next-intl/server"
import { getAlternates } from "@/lib/seo/getAlternates"
import TwoWheelerKanpurClient from "@/components/TwoWheelerKanpurClient"

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
    ? "कानपुर में टू-व्हीलर स्क्रैपिंग — बाइक और स्कूटर, मुफ्त डोरस्टेप पिकअप | ScrapCentre"
    : "Two-Wheeler Scrapping in Kanpur — Bike & Scooter, Free Doorstep Pickup | ScrapCentre"
  const description = isHindi
    ? "कानपुर में अधिकृत टू-व्हीलर और बाइक स्क्रैपिंग सेवाएं। अधिकृत RVSF प्रक्रिया, मुफ्त पिकअप, तुरंत जमा प्रमाणपत्र (COD) और आरसी रद्दीकरण सहायता।"
    : "Authorised two-wheeler and motorcycle scrapping services in Kanpur. Instant Certificate of Deposit (COD) via Parivahan, free doorstep pickup across all Kanpur areas, and top scrap value."

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
  const pageUrl = `https://www.scrapcentre.com${isHindi ? "/hi" : ""}/two-wheeler-scrapping-kanpur`
  const homeUrl = `https://www.scrapcentre.com${isHindi ? "/hi" : "/"}`

  // 1. WebPage Schema
  const webPageSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${pageUrl}#webpage`,
    "url": pageUrl,
    "name": isHindi
      ? "कानपुर में टू-व्हीलर स्क्रैपिंग सेवाएं | ScrapCentre"
      : "Two-Wheeler Scrapping in Kanpur | ScrapCentre",
    "description": isHindi
      ? "कानपुर में अधिकृत टू-व्हीलर और बाइक स्क्रैपिंग सेवाएं। तुरंत COD और मुफ्त डोरस्टेप पिकअप।"
      : "Authorised two-wheeler and bike scrapping services in Kanpur with free doorstep pickup and instant Certificate of Deposit.",
    "isPartOf": { "@id": "https://www.scrapcentre.com/#website" },
    "about": { "@id": `${pageUrl}#service` },
    "publisher": { "@id": "https://www.scrapcentre.com/#organization" },
    "inLanguage": isHindi ? "hi-IN" : "en-IN",
  }

  // 2. BreadcrumbList Schema
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "@id": `${pageUrl}#breadcrumb`,
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": isHindi ? "मुख्य पृष्ठ" : "Home",
        "item": homeUrl,
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": isHindi ? "वाहन स्क्रैपिंग सेवाएं" : "Vehicle Scrapping Services",
        "item": `https://www.scrapcentre.com${isHindi ? "/hi" : ""}/vehicle-scrapping-services-kanpur`,
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": isHindi ? "कानपुर" : "Kanpur",
        "item": `https://www.scrapcentre.com${isHindi ? "/hi" : ""}/vehicle-scrapping-services-kanpur`,
      },
      {
        "@type": "ListItem",
        "position": 4,
        "name": isHindi ? "टू-व्हीलर स्क्रैपिंग" : "Two-Wheeler Scrapping",
        "item": pageUrl,
      },
    ],
  }

  // 3. Service Schema
  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": `${pageUrl}#service`,
    "name": isHindi
      ? "कानपुर में टू-व्हीलर और बाइक स्क्रैपिंग सेवाएं"
      : "Two-Wheeler & Bike Scrapping in Kanpur",
    "serviceType": "Two Wheeler Scrapping, Motorcycle Scrapping, Scooter Scrapping",
    "provider": {
      "@type": "AutomotiveBusiness",
      "name": "ScrapCentre",
      "url": "https://www.scrapcentre.com",
      "telephone": "+91-9839447733",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "26-A & B, Block-E, Panki, Kalpi Road",
        "addressLocality": "Kanpur",
        "addressRegion": "Uttar Pradesh",
        "postalCode": "208020",
        "addressCountry": "IN",
      },
    },
    "areaServed": {
      "@type": "City",
      "name": "Kanpur",
    },
    "description": isHindi
      ? "कानपुर में अधिकृत टू-व्हीलर और बाइक स्क्रैपिंग सेवाएं। अधिकृत RVSF प्रक्रिया, मुफ्त पिकअप और आरसी रद्दीकरण।"
      : "Authorised two-wheeler and motorcycle scrapping services in Kanpur with free doorstep pickup, legal RTO RC cancellation, and instant COD.",
  }

  // 4. FAQ Schema
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "Can I scrap a bike without an RC in Kanpur?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes. If your two-wheeler's RC is lost, we help you file an online police non-cognizable report (NCR) and obtain vehicle verification from Kanpur RTO to process scrapping legally.",
        },
      },
      {
        "@type": "Question",
        "name": "How much scrap money will I get for an old bike or scooter in Kanpur?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Scrap payout typically ranges from ₹2,500 to ₹7,000+ depending on the bike's kerb weight, presence of battery/alloys, and overall condition.",
        },
      },
      {
        "@type": "Question",
        "name": "How long does the two-wheeler scrapping and RC cancellation take?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Pickup is usually scheduled within 24 hours. The chassis is cut at our Panki facility and the Certificate of Deposit (COD) is generated on Parivahan within 48 to 72 hours.",
        },
      },
      {
        "@type": "Question",
        "name": "Is doorstep bike pickup really free across Kanpur?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes! We provide 100% free doorstep pickup across all Kanpur areas including Panki, Kakadeo, Kidwai Nagar, Govind Nagar, Kalyanpur, Jajmau, and Barra with zero towing charges.",
        },
      },
      {
        "@type": "Question",
        "name": "What is the Certificate of Deposit (COD) and how can I use it?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "A Certificate of Deposit (COD) is official proof that your bike was scrapped at a licensed RVSF. You can use it to get up to 25% road tax rebate and manufacturer discounts on your new vehicle purchase.",
        },
      },
      {
        "@type": "Question",
        "name": "Can I scrap an electric scooter or e-bike in Kanpur?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, we scrap electric two-wheelers following strict environmental norms for safe battery disposal and recycling.",
        },
      },
      {
        "@type": "Question",
        "name": "Do I need to visit the Kanpur RTO (UP-78) myself?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "No. You do not need to visit Kanpur RTO. Our authorized RVSF team handles the online application and digital de-registration on the central Parivahan Vahan portal.",
        },
      },
      {
        "@type": "Question",
        "name": "How is the bike's chassis number destroyed during scrapping?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Under MoRTH RVSF rules, the chassis section bearing the embossed VIN is digitally photographed, physically cut and destroyed, ensuring your bike cannot be misused or cloned.",
        },
      },
    ],
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <TwoWheelerKanpurClient isHindi={isHindi} />
    </>
  )
}

import type { Metadata } from "next"
import { setRequestLocale } from "next-intl/server"
import { getAlternates } from "@/lib/seo/getAlternates"
import FourWheelerKanpurClient from "@/components/FourWheelerKanpurClient"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const typedLocale = locale === "hi" ? "hi" : "en"
  const isHindi = typedLocale === "hi"
  const alternates = getAlternates(typedLocale, "/four-wheeler-scrapping-kanpur")

  const title = isHindi
    ? "कानपुर में कार स्क्रैपिंग — फोर-व्हीलर स्क्रैपिंग, मुफ्त डोरस्टेप पिकअप | ScrapCentre"
    : "Car Scrapping in Kanpur — Four-Wheeler Scrapping, Free Doorstep Pickup | ScrapCentre"
  const description = isHindi
    ? "कानपुर में एक अधिकृत RVSF के माध्यम से पुरानी, क्षतिग्रस्त या जीवन-समाप्त कार, एसयूवी या हैचबैक को स्क्रैप करें; मुफ्त मूल्यांकन; मुफ्त डोरस्टेप पिकअप; जमा प्रमाणपत्र (COD); आरसी रद्दीकरण और कागजी कार्रवाई सहायता।"
    : "Scrap an old, damaged or end-of-life car, SUV or hatchback in Kanpur through an authorised RVSF; free valuation; free doorstep pickup; Certificate of Deposit; RC cancellation and paperwork support."

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
          alt: "ScrapCentre Kanpur Four-Wheeler Scrapping",
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

export default async function FourWheelerScrappingKanpurPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const typedLocale = locale === "hi" ? "hi" : "en"
  setRequestLocale(typedLocale)

  const isHindi = typedLocale === "hi"
  const pageUrl = `https://www.scrapcentre.com${isHindi ? "/hi" : ""}/four-wheeler-scrapping-kanpur`
  const homeUrl = `https://www.scrapcentre.com${isHindi ? "/hi" : "/"}`

  // 1. WebPage Schema
  const webPageSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${pageUrl}#webpage`,
    "url": pageUrl,
    "name": isHindi
      ? "कानपुर में कार स्क्रैपिंग — फोर-व्हीलर स्क्रैपिंग, मुफ्त डोरस्टेप पिकअप | ScrapCentre"
      : "Car Scrapping in Kanpur — Four-Wheeler Scrapping, Free Doorstep Pickup | ScrapCentre",
    "description": isHindi
      ? "कानपुर में एक अधिकृत RVSF के माध्यम से पुरानी, क्षतिग्रस्त या जीवन-समाप्त कार, एसयूवी या हैचबैक को स्क्रैप करें; मुफ्त मूल्यांकन; मुफ्त डोरस्टेप पिकअप; जमा प्रमाणपत्र (COD); आरसी रद्दीकरण और कागजी कार्रवाई सहायता।"
      : "Scrap an old, damaged or end-of-life car, SUV or hatchback in Kanpur through an authorised RVSF; free valuation; free doorstep pickup; Certificate of Deposit; RC cancellation and paperwork support.",
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
        "name": isHindi ? "फोर-व्हीलर स्क्रैपिंग" : "Four-Wheeler Scrapping",
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
      ? "कानपुर में फोर-व्हीलर और कार स्क्रैपिंग सेवाएं"
      : "Four-Wheeler & Car Scrapping in Kanpur",
    "serviceType": "Car Scrapping, Four Wheeler Scrapping, SUV Scrapping",
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
      ? "कानपुर में अधिकृत फोर-व्हीलर और कार स्क्रैपिंग सेवाएं। अधिकृत RVSF प्रक्रिया, मुफ्त पिकअप और आरसी रद्दीकरण।"
      : "Authorised four-wheeler and car scrapping services in Kanpur with free doorstep towing, legal RTO RC cancellation, and instant COD.",
  }

  // 4. FAQ Schema
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "Where can I scrap my car in Kanpur?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "If you are wondering where to scrap a car in Kanpur, our authorised RVSF facility is located in Panki on Kalpi Road. We provide car scrapping Kanpur with free doorstep pickup from your home or housing society. Simply share your car number online or on WhatsApp to begin.",
        },
      },
      {
        "@type": "Question",
        "name": "Which documents are needed to scrap a car in Kanpur?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Essential car scrapping documents Kanpur include the original Registration Certificate (RC), owner ID proof, plus insurance copy and PUC if available. If hypothecated, a Financier NOC is required. Our team assists with car rc cancellation Kanpur, and additional paperwork may be requested depending on vehicle ownership status.",
        },
      },
      {
        "@type": "Question",
        "name": "Can I scrap a car that still has a bank loan?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, but for hypothecated car scrapping Kanpur, a formal Financier NOC (No Objection Certificate) from your lending bank is mandatory before scrapping can proceed. Once the loan is cleared, our team offers step-by-step guidance on the next steps, document submission, and completing the official vehicle deregistration.",
        },
      },
      {
        "@type": "Question",
        "name": "Can you pick up a non-running or accident-damaged car in Kanpur?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, we provide non running car pickup Kanpur and specialized car towing for scrapping Kanpur if your vehicle cannot be driven due to mechanical failure or accident damage. Please share your car's location and condition details with our team to check towing support eligibility across Kanpur.",
        },
      },
      {
        "@type": "Question",
        "name": "How much will I get for scrapping my car in Kanpur?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Your car scrap price Kanpur depends on several key factors, including vehicle type, unladen weight, age, condition, completeness of major components, and prevailing scrap metal rates. We offer a transparent free car valuation Kanpur—simply share your registration details online or on WhatsApp to receive your individualized quote.",
        },
      },
      {
        "@type": "Question",
        "name": "Does the model or size of my car change its scrap value?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, it can. The make, model, kerb weight, and manufacturing year play a substantial role in determining your car scrap value Kanpur. Larger vehicles naturally have more recoverable metal, while vehicle condition and the completeness of internal assemblies also directly influence the final scrap valuation. No flat rates apply.",
        },
      },
      {
        "@type": "Question",
        "name": "Can I scrap a popular model such as a Dzire, Creta or Wagon R?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, any car model can be scrapped. Scrapping eligibility does not depend on the model name itself, but on the vehicle’s age, fitness status, and registration records. Whether you own a Dzire, Creta, Wagon R or another car, share your car number to receive a free valuation.",
        },
      },
      {
        "@type": "Question",
        "name": "Can I scrap an electric car in Kanpur?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, electric car scrapping Kanpur is supported through the appropriate authorised scrapping and recycling route. Battery disposal and high-voltage components require strict environmental protocols managed under RVSF standards. Share your electric vehicle details and location with our Kanpur team to learn more and arrange compliant processing.",
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
      <FourWheelerKanpurClient isHindi={isHindi} />
    </>
  )
}

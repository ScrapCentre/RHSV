import type { Metadata } from "next"
import { setRequestLocale } from "next-intl/server"
import { getAlternates } from "@/lib/seo/getAlternates"
import KanpurScrappingClient from "@/components/KanpurScrappingClient"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const typedLocale = locale === "hi" ? "hi" : "en"
  const isHindi = typedLocale === "hi"
  const alternates = getAlternates(typedLocale, "/vehicle-scrapping-services-kanpur")

  const title = isHindi
    ? "कानपुर में वाहन स्क्रैपिंग सेवाएं — अधिकृत RVSF, मुफ्त डोरस्टेप पिकअप | ScrapCentre"
    : "Vehicle Scrapping Services in Kanpur — Authorised RVSF, Free Doorstep Pickup | ScrapCentre"
  const description = isHindi
    ? "कानपुर में आधिकारिक अधिकृत वाहन स्क्रैपिंग सेवाएं। परिवहन पोर्टल से तुरंत जमा प्रमाणपत्र (COD), पूरे कानपुर में मुफ्त पिकअप और सर्वोत्तम स्क्रैप मूल्य।"
    : "Official authorized vehicle scrapping services in Kanpur. Instant Certificate of Deposit (COD) via Parivahan, free doorstep pickup across all Kanpur pin codes, and best scrap value."

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
          alt: "ScrapCentre Kanpur Vehicle Scrapping",
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

export default async function VehicleScrappingServicesKanpurPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const typedLocale = locale === "hi" ? "hi" : "en"
  setRequestLocale(typedLocale)

  const isHindi = typedLocale === "hi"
  const pageUrl = `https://www.scrapcentre.com${isHindi ? "/hi" : ""}/vehicle-scrapping-services-kanpur`
  const homeUrl = `https://www.scrapcentre.com${isHindi ? "/hi" : "/"}`

  // 1. WebPage Schema
  const webPageSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${pageUrl}#webpage`,
    "url": pageUrl,
    "name": isHindi
      ? "कानपुर में वाहन स्क्रैपिंग सेवाएं | ScrapCentre"
      : "Vehicle Scrapping Services in Kanpur | ScrapCentre",
    "description": isHindi
      ? "कानपुर में आधिकारिक अधिकृत वाहन स्क्रैपिंग सेवाएं। परिवहन पोर्टल से तुरंत जमा प्रमाणपत्र (COD) और मुफ्त पिकअप।"
      : "Official authorized vehicle scrapping services in Kanpur. Instant Certificate of Deposit (COD) via Parivahan and free doorstep pickup.",
    "isPartOf": { "@id": "https://www.scrapcentre.com/#website" },
    "about": { "@id": `${pageUrl}#service` },
    "publisher": { "@id": "https://www.scrapcentre.com/#organization" },
    "inLanguage": isHindi ? "hi-IN" : "en-IN",
    "primaryImageOfPage": {
      "@type": "ImageObject",
      "url": "https://www.scrapcentre.com/logo.png",
    },
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
        "name": isHindi ? "कानपुर वाहन स्क्रैपिंग" : "Vehicle Scrapping Services Kanpur",
        "item": pageUrl,
      },
    ],
  }

  // 3. LocalBusiness / AutomotiveBusiness Schema for Kanpur Facility
  const localBusinessSchema = {
    "@context": "https://schema.org",
    "@type": ["AutomotiveBusiness", "LocalBusiness"],
    "@id": `${pageUrl}#localbusiness`,
    "name": "ScrapCentre - Registered Vehicle Scrapping Facility Kanpur",
    "url": pageUrl,
    "telephone": "+91-9839447733",
    "email": "contact@scrapcentre.com",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "26-A & B, Block-E, Panki, Kalpi Road",
      "addressLocality": "Kanpur",
      "addressRegion": "Uttar Pradesh",
      "postalCode": "208020",
      "addressCountry": "IN",
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": "26.4716",
      "longitude": "80.2444",
    },
    "openingHoursSpecification": [
      {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
        "opens": "09:00",
        "closes": "19:00",
      },
    ],
    "priceRange": "₹₹",
  }

  // 4. Service Schema
  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": `${pageUrl}#service`,
    "name": isHindi
      ? "कानपुर में वाहन स्क्रैपिंग सेवाएं | ScrapCentre"
      : "Vehicle Scrapping Services in Kanpur by ScrapCentre",
    "serviceType": isHindi
      ? "वाहन स्क्रैपिंग, RVSF जमा प्रमाणपत्र (COD) और UP-78 RC डी-रजिस्ट्रेशन"
      : "Vehicle scrapping, RVSF Certificate of Deposit (COD) issuance and UP-78 RC cancellation support",
    "description": isHindi
      ? "कानपुर में अधिकृत RVSF पर अपनी गाड़ी को कानूनी रूप से स्क्रैप करें और सर्वोत्तम मूल्य, मुफ्त डोरस्टेप पिकअप और सरकारी COD प्राप्त करें।"
      : "Scrap your vehicle legally at an authorised RVSF in Kanpur and get the best value, free doorstep pickup and official Certificate of Deposit (COD).",
    "url": pageUrl,
    "provider": { "@id": `${pageUrl}#localbusiness` },
    "areaServed": [
      { "@type": "City", "name": "Kanpur" },
      { "@type": "AdministrativeArea", "name": "Kanpur Nagar" },
      { "@type": "AdministrativeArea", "name": "Kanpur Dehat" },
    ],
  }

  // 5. FAQ Schema
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "@id": `${pageUrl}#faq`,
    "mainEntity": [
      {
        "@type": "Question",
        "name": isHindi
          ? "क्या स्क्रैपसेंटर कानपुर में सरकार द्वारा अधिकृत RVSF है?"
          : "Is ScrapCentre an authorised RVSF facility in Kanpur?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": isHindi
            ? "हाँ, स्क्रैपसेंटर सड़क परिवहन और राजमार्ग मंत्रालय (MoRTH) द्वारा पंजीकृत वाहन स्क्रैपिंग सुविधा (RVSF) संचालित करता है जो पनकी, कालपी रोड, कानपुर में स्थित है।"
            : "Yes, ScrapCentre operates an official Ministry of Road Transport & Highways (MoRTH) registered vehicle scrapping facility (RVSF) located at Panki, Kalpi Road, Kanpur.",
        },
      },
      {
        "@type": "Question",
        "name": isHindi
          ? "कानपुर आरटीओ (UP-78) में आरसी रद्दीकरण कैसे होता है?"
          : "How does RC cancellation happen at the Kanpur RTO (UP-78)?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": isHindi
            ? "वाहन हमारे पनकी केंद्र पर जमा होने के बाद, हम डिजिटल रूप से परिवहन पोर्टल पर विवरण अपलोड करते हैं और कानपुर आरटीओ द्वारा आरसी रद्द कर दी जाती है।"
            : "Once your vehicle is deposited at our Panki facility, we submit the vehicle details on the MoRTH Parivahan portal. The Kanpur RTO (UP-78) is notified, and your RC is officially cancelled in the national database.",
        },
      },
      {
        "@type": "Question",
        "name": isHindi
          ? "क्या कानपुर भर में डोरस्टेप पिकअप और टोइंग वास्तव में मुफ्त है?"
          : "Is doorstep pickup and towing completely free across Kanpur?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": isHindi
            ? "हाँ, हम कानपुर के सभी इलाकों—पनकी, कल्याणपुर, जाजमऊ, सिविल लाइंस, गोविन्द नगर, आदि में 100% मुफ्त डोरस्टेप टोइंग प्रदान करते हैं।"
            : "Yes, we provide 100% free doorstep towing and pickup across all Kanpur localities, including Panki, Kalyanpur, Jajmau, Civil Lines, and Govind Nagar.",
        },
      },
      {
        "@type": "Question",
        "name": isHindi
          ? "जमा प्रमाणपत्र (COD) क्या है और उत्तर प्रदेश में इसका क्या लाभ है?"
          : "What is a Certificate of Deposit (COD) and how does it help in UP?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": isHindi
            ? "COD परिवहन पोर्टल द्वारा जारी किया जाने वाला आधिकारिक दस्तावेज है। उत्तर प्रदेश में नया वाहन खरीदने पर रोड टैक्स पर 25% तक की छूट और OEM डिस्काउंट मिलता है।"
            : "The Certificate of Deposit (COD) gives you up to 25% rebate on Motor Vehicle Tax (road tax) for new personal vehicles and up to 15% for commercial vehicles in Uttar Pradesh.",
        },
      },
    ],
  }

  // 6. HowTo Schema
  const howToSchema = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    "@id": `${pageUrl}#howto`,
    "name": isHindi
      ? "कानपुर में वाहन स्क्रैपिंग कैसे काम करता है"
      : "How Vehicle Scrapping Works in Kanpur",
    "description": isHindi
      ? "कानपुर में अपने वाहन को स्क्रैप करने की 4-चरणीय सरल एवं पारदर्शी प्रक्रिया।"
      : "Simple 4-step process to scrap an end-of-life vehicle in Kanpur and receive your Certificate of Deposit.",
    "step": [
      {
        "@type": "HowToStep",
        "position": 1,
        "name": isHindi ? "वाहन विवरण साझा करें" : "Share Vehicle Details",
        "text": isHindi
          ? "अपना वाहन नंबर और बुनियादी विवरण दर्ज करके अनुमान प्राप्त करें।"
          : "Provide vehicle number and basic details for instant valuation.",
      },
      {
        "@type": "HowToStep",
        "position": 2,
        "name": isHindi ? "मुफ्त डोरस्टेप पिकअप" : "Free Doorstep Pickup",
        "text": isHindi
          ? "हमारी कानपुर टीम आपके पते पर वाहन निरीक्षण और मुफ्त टोइंग के लिए पहुंचती है।"
          : "Free inspection, document verification, and towing anywhere in Kanpur.",
      },
      {
        "@type": "HowToStep",
        "position": 3,
        "name": isHindi ? "पनकी RVSF में वैज्ञानिक स्क्रैपिंग" : "Eco-Friendly Scrapping at Panki RVSF",
        "text": isHindi
          ? "पनकी केंद्र में सीएमवीआर नियमों के तहत सुरक्षित व वैज्ञानिक स्क्रैपिंग।"
          : "Scientific dismantling and depollution at our authorized Panki facility.",
      },
      {
        "@type": "HowToStep",
        "position": 4,
        "name": isHindi ? "भुगतान और जमा प्रमाणपत्र (COD)" : "Payment & Certificate of Deposit (COD)",
        "text": isHindi
          ? "बैंक खाते में तुरंत भुगतान और परिवहन पोर्टल द्वारा डिजिटल COD प्राप्त करें।"
          : "Immediate bank transfer payment and official government Certificate of Deposit via Parivahan.",
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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }}
      />
      <KanpurScrappingClient />
    </>
  )
}

import type { Metadata } from "next"
import { getTranslations, setRequestLocale } from "next-intl/server"
import { getAlternates } from "@/lib/seo/getAlternates"
import HomeClient from "./HomeClient"
import enMessages from "@/messages/en.json"
import hiMessages from "@/messages/hi.json"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const typedLocale = locale === "hi" ? "hi" : "en"
  const t = await getTranslations({ locale: typedLocale, namespace: "HomePage.meta" })
  const alternates = getAlternates(typedLocale, "")

  const title = t("title")
  const description = t("description")

  return {
    title,
    description,
    alternates,
    openGraph: {
      title,
      description,
      url: alternates.canonical,
      locale: typedLocale === "hi" ? "hi_IN" : "en_IN",
      siteName: "ScrapCentre",
      type: "website",
      images: [
        {
          url: "/logo.png",
          width: 1200,
          height: 630,
          alt: "ScrapCentre Logo",
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

export default async function Home({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)

  const isHindi = locale === "hi"
  const msg = isHindi ? hiMessages : enMessages

  // ── Schema 3: WebPage ───────────────────────────────────────────────────────
  // Server-rendered so Googlebot sees it in the initial HTML (no JS needed).
  // url, name, description, inLanguage are locale-aware (approved deviations).
  // All other fields are fixed regardless of locale.
  const webPageSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": isHindi ? "https://www.scrapcentre.com/hi#webpage" : "https://www.scrapcentre.com/#webpage",
    "url": isHindi
      ? "https://www.scrapcentre.com/hi"
      : "https://www.scrapcentre.com/",
    "name": msg.HomePage.meta.title,
    "description": msg.HomePage.meta.description,
    "isPartOf": { "@id": "https://www.scrapcentre.com/#website" },
    "about": { "@id": "https://www.scrapcentre.com/#organization" },
    "publisher": { "@id": "https://www.scrapcentre.com/#organization" },
    "inLanguage": isHindi ? "hi-IN" : "en-IN",
    "primaryImageOfPage": {
      "@type": "ImageObject",
      "url": "https://www.scrapcentre.com/logo.png",
    },
  }

  // ── Schema 4: FAQPage ───────────────────────────────────────────────────────
  // All 6 questions/answers pulled from messages JSON (approved deviation).
  // @id and overall structure are fixed; only Q&A text changes by locale.
  const faqQuestions = msg.HomePage.faq.questions
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "@id": isHindi ? "https://www.scrapcentre.com/hi#faq" : "https://www.scrapcentre.com/#faq",
    "mainEntity": ([1, 2, 3, 4, 5, 6] as const).map((n) => ({
      "@type": "Question",
      "name": faqQuestions[String(n) as keyof typeof faqQuestions].question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faqQuestions[String(n) as keyof typeof faqQuestions].answer,
      },
    })),
  }

  // ── Schema 5: Service ───────────────────────────────────────────────────────
  // url is locale-aware (approved deviation).
  // name, serviceType, description, offer text stay fixed English —
  // no Hindi equivalent exists in messages; per spec rule, not invented.
  const svcMsg = msg.HomePage.schema.service
  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": isHindi ? "https://www.scrapcentre.com/hi#service" : "https://www.scrapcentre.com/#service",
    "name": svcMsg.name,
    "serviceType": svcMsg.serviceType,
    "description": svcMsg.description,
    "provider": { "@id": "https://www.scrapcentre.com/#organization" },
    "areaServed": { "@type": "Country", "name": "India" },
    "url": isHindi
      ? "https://www.scrapcentre.com/hi"
      : "https://www.scrapcentre.com/",
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": svcMsg.catalogName,
      "itemListElement": [
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": svcMsg.offer1.name,
            "description": svcMsg.offer1.description,
          },
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": svcMsg.offer2.name,
            "description": svcMsg.offer2.description,
          },
        },
      ],
    },
  }

  return (
    <>
      {/* Homepage-only JSON-LD schemas — server-rendered for guaranteed
          Googlebot visibility. Root app/layout.tsx owns site-wide schemas
          (Organization + WebSite). */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
      />
      <HomeClient />
    </>
  )
}

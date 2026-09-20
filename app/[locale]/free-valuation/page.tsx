import type { Metadata } from "next"
import { setRequestLocale } from "next-intl/server"
import FreeValuationClient from "@/components/FreeValuationClient"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const isHindi = locale === "hi"
  const title = isHindi
    ? "मुफ्त वाहन वैल्यूएशन एवं स्क्रैप कैलकुलेटर | ScrapCentre India"
    : "Free Vehicle Valuation & Scrap Calculator | ScrapCentre India"
  const description = isHindi
    ? "अपने पुराने वाहन का तुरंत RTO विवरण और सर्वोत्तम स्क्रैप मूल्य जांचें। स्क्रैपिंग और एक्सचेंज पर पाएं आकर्षक ऑफर।"
    : "Get instant RTO details, best scrap value, and CD certificate benefits for your vehicle in 60 seconds with ScrapCentre."

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `https://www.scrapcentre.com${isHindi ? "/hi" : ""}/free-valuation`,
      siteName: "ScrapCentre",
      type: "website",
    },
  }
}

export default async function FreeValuationLocalePage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)

  return <FreeValuationClient />
}

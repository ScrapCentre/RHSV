import type { Metadata } from "next"
import { setRequestLocale } from "next-intl/server"
import VehicleScrappingServicesClient from "@/components/VehicleScrappingServicesClient"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const isHindi = locale === "hi"
  const title = isHindi
    ? "भारत में वाहन स्क्रैपिंग सेवाएं | ScrapCentre"
    : "Vehicle Scrapping Services in India | ScrapCentre"
  const description = isHindi
    ? "RVSF-प्रमाणित जमा, मुफ्त डोरस्टेप पिकअप और सर्वोत्तम स्क्रैप मूल्य के साथ पेशेवर वाहन स्क्रैपिंग सेवाएं। आज ही स्क्रैपसेंटर के साथ अपनी वाहन स्क्रैपिंग बुक करें!"
    : "Professional vehicle scrapping services with RVSF-certified deposit, free doorstep pickup, and best scrap value. Book your vehicle scrapping with ScrapCentre today!"

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `https://www.scrapcentre.com${isHindi ? "/hi" : ""}/vehicle-scrapping-services`,
      siteName: "ScrapCentre",
      type: "website",
    },
  }
}

export default async function VehicleScrappingServicesLocalePage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)

  return <VehicleScrappingServicesClient />
}

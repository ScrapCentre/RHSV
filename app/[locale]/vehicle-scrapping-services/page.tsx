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
    ? "वाहन स्क्रैपिंग सेवाएं | ScrapCentre India"
    : "Vehicle Scrapping Services | ScrapCentre India"
  const description = isHindi
    ? "ScrapCentre द्वारा सुरक्षित, कानूनी और पर्यावरण के अनुकूल वाहन स्क्रैपिंग सेवाएं। तुरंत मूल्य, मुफ्त पिकअप और परेशानी मुक्त RTO दस्तावेज।"
    : "Safe, legal and eco-friendly vehicle scrapping services by ScrapCentre. Get instant valuation, free doorstep pickup and hassle-free RTO documentation."

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

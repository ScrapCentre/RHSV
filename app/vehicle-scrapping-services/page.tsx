import type { Metadata } from "next"
import { NextIntlClientProvider } from "next-intl"
import VehicleScrappingServicesClient from "@/components/VehicleScrappingServicesClient"
import enMessages from "@/messages/en.json"

export const metadata: Metadata = {
  title: "Vehicle Scrapping Services in India | ScrapCentre",
  description:
    "Professional vehicle scrapping services with RVSF-certified deposit, free doorstep pickup, and best scrap value. Book your vehicle scrapping with ScrapCentre today!",
}

export default function VehicleScrappingServicesPage() {
  return (
    <NextIntlClientProvider locale="en" messages={enMessages}>
      <VehicleScrappingServicesClient />
    </NextIntlClientProvider>
  )
}

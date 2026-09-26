import type { Metadata } from "next"
import { NextIntlClientProvider } from "next-intl"
import VehicleScrappingServicesClient from "@/components/VehicleScrappingServicesClient"
import enMessages from "@/messages/en.json"

export const metadata: Metadata = {
  title: "Vehicle Scrapping Services | ScrapCentre India",
  description:
    "Safe, legal and eco-friendly vehicle scrapping services by ScrapCentre. Get instant valuation, free doorstep pickup and hassle-free RTO documentation.",
}

export default function VehicleScrappingServicesPage() {
  return (
    <NextIntlClientProvider locale="en" messages={enMessages}>
      <VehicleScrappingServicesClient />
    </NextIntlClientProvider>
  )
}

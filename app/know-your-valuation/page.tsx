import type { Metadata } from "next"
import { NextIntlClientProvider } from "next-intl"
import FreeValuationClient from "@/components/FreeValuationClient"
import enMessages from "@/messages/en.json"

export const metadata: Metadata = {
  title: "Free Vehicle Valuation & Scrap Calculator | ScrapCentre India",
  description:
    "Get instant RTO details, best scrap value, and CD certificate benefits for your vehicle in 60 seconds with ScrapCentre.",
}

export default function KnowYourValuationPage() {
  return (
    <NextIntlClientProvider locale="en" messages={enMessages}>
      <FreeValuationClient />
    </NextIntlClientProvider>
  )
}

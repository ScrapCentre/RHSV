import type { Metadata } from "next"
import { NextIntlClientProvider } from "next-intl"
import HomexClient from "./HomexClient"
import enMessages from "@/messages/en.json"

export const metadata: Metadata = {
  title: "Homex - ScrapCentre India",
  description: "Official authorized vehicle scrapping center in India.",
}

export default function HomexPage() {
  return (
    <NextIntlClientProvider messages={enMessages}>
      <HomexClient />
    </NextIntlClientProvider>
  )
}

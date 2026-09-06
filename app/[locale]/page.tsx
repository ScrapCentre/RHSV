import type { Metadata } from "next"
import { getTranslations, setRequestLocale } from "next-intl/server"
import { getAlternates } from "@/lib/seo/getAlternates"
import HomeClient from "./HomeClient"

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

  return <HomeClient />
}

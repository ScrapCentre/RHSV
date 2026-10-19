import type { Metadata } from "next"
import { setRequestLocale } from "next-intl/server"
import { getAlternates } from "@/lib/seo/getAlternates"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const typedLocale = locale === "hi" ? "hi" : "en"
  const alternates = getAlternates(typedLocale, "/four-wheeler-scrapping-kanpur")

  const title =
    typedLocale === "hi"
      ? "फोर-व्हीलर स्क्रैपिंग कानपुर | जल्द आ रहा है - ScrapCentre"
      : "Four-Wheeler Scrapping Kanpur | Coming Soon - ScrapCentre"
  const description =
    typedLocale === "hi"
      ? "कानपुर में फोर-व्हीलर स्क्रैपिंग सेवाएं। जल्द आ रहा है।"
      : "Four-Wheeler Scrapping Services in Kanpur. Coming Soon."

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
    },
  }
}

export default async function FourWheelerScrappingKanpurPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 py-20 text-center">
      <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight mb-3">
        Coming Soon
      </h1>
      <p className="text-slate-500 text-base md:text-lg">
        Four-Wheeler Scrapping in Kanpur
      </p>
    </div>
  )
}

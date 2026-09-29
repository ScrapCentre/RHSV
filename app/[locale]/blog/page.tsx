import type { Metadata } from "next"
import { setRequestLocale } from "next-intl/server"
import { getAlternates } from "@/lib/seo/getAlternates"
import BlogClient from "./BlogClient"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const typedLocale = locale === "hi" ? "hi" : "en"
  const isHindi = typedLocale === "hi"
  const alternates = getAlternates(typedLocale, "/blog")

  const title = isHindi
    ? "ब्लॉग — जल्द आ रहा है | ScrapCentre"
    : "Blog — Coming Soon | ScrapCentre Vehicle Scrapping News"
  const description = isHindi
    ? "भारत में वाहन स्क्रैपिंग और RVSF जमा प्रमाणपत्र (COD) लाभों पर नवीनतम समाचार, गाइड और नीति अपडेट के लिए बने रहें।"
    : "Stay tuned for the latest news, guides, policy updates, and insights on vehicle scrapping and RVSF Certificate of Deposit benefits in India."

  return {
    title,
    description,
    alternates,
    openGraph: {
      title,
      description,
      url: alternates.canonical,
      locale: isHindi ? "hi_IN" : "en_IN",
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

export default async function BlogPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const typedLocale = locale === "hi" ? "hi" : "en"
  setRequestLocale(typedLocale)

  return <BlogClient />
}

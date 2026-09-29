import type { Metadata } from "next"
import { setRequestLocale } from "next-intl/server"
import { getAlternates } from "@/lib/seo/getAlternates"
import { BLOG_POSTS } from "@/lib/blogData"
import BlogDetailClient from "./BlogDetailClient"

export async function generateStaticParams() {
  return BLOG_POSTS.map((post) => ({
    slug: post.slug,
  }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}): Promise<Metadata> {
  const { locale, slug } = await params
  const typedLocale = locale === "hi" ? "hi" : "en"
  const post = BLOG_POSTS.find((p) => p.slug === slug) || BLOG_POSTS[0]
  const alternates = getAlternates(typedLocale, `/blog/${post.slug}`)

  const title = `${post.title} | ScrapCentre`
  const description = post.excerpt

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
      type: "article",
      images: [
        {
          url: post.image,
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [post.image],
    },
  }
}

export default async function BlogDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}) {
  const { locale, slug } = await params
  const typedLocale = locale === "hi" ? "hi" : "en"
  setRequestLocale(typedLocale)

  const post = BLOG_POSTS.find((p) => p.slug === slug) || BLOG_POSTS[0]
  const pageUrl = `https://www.scrapcentre.com${typedLocale === "hi" ? "/hi" : ""}/blog/${post.slug}`

  // Article JSON-LD Schema
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "@id": `${pageUrl}#article`,
    "headline": post.title,
    "description": post.excerpt,
    "image": `https://www.scrapcentre.com${post.image}`,
    "datePublished": "2026-09-30",
    "dateModified": "2026-09-30",
    "author": {
      "@type": "Organization",
      "name": "ScrapCentre",
      "url": "https://www.scrapcentre.com",
    },
    "publisher": {
      "@id": "https://www.scrapcentre.com/#organization",
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": pageUrl,
    },
  }

  // FAQPage JSON-LD Schema for the blog post FAQs
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "@id": `${pageUrl}#faq`,
    "mainEntity": post.content.faqs.english.map((faq) => ({
      "@type": "Question",
      "name": faq.q,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.a,
      },
    })),
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <BlogDetailClient slug={slug} />
    </>
  )
}

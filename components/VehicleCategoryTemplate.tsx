"use client"

import React, { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Caveat } from "next/font/google"
import Link from "next/link"
import LoadingScreen from "@/components/LoadingScreen"
import {
  Check,
  CheckCircle2,
  ArrowRight,
  Phone,
  MessageCircle,
  MapPin,
  Clock,
  Mail,
  ShieldCheck,
  FileText,
  Truck,
  Car,
  Bike,
  Star,
  Calendar,
  Key,
  Link2,
  IndianRupee,
  ChevronDown,
  LucideIcon
} from "lucide-react"

const caveat = Caveat({
  subsets: ["latin"],
  weight: ["600", "700"],
})

export function WireframeGuideBox({
  tag,
  title,
  sub,
}: {
  tag: string
  title: string
  sub?: string | React.ReactNode
}) {
  return (
    <div className="bg-[#FEFCE8] border border-dashed border-[#CA8A04] rounded-xl sm:rounded-2xl p-3 sm:p-3.5 text-left my-2.5 shadow-2xs">
      <div className="flex items-center gap-2 flex-wrap">
        <span className="inline-block px-2 py-0.5 rounded-md bg-[#A16207] text-white text-[10.5px] font-black uppercase tracking-wider shrink-0">
          {tag}
        </span>
        <span className="text-xs sm:text-[13px] font-bold text-[#713F12]">
          {title}
        </span>
      </div>
      {sub && (
        <div className="text-[11px] sm:text-xs font-medium text-[#854D0E] mt-1 leading-snug">
          {sub}
        </div>
      )}
    </div>
  )
}

export interface BreadcrumbItem {
  name: string
  nameHi?: string
  href: string
}

export interface PopularModelItem {
  name: string
  type: string
  typeHi?: string
}

export interface ModelQuestionItem {
  qEn: string
  qHi: string
  aEn?: string
  aHi?: string
  tag?: string
  title?: string
}

export interface ProcessStepItem {
  num: string
  icon: LucideIcon
  badge: { en: string; hi: string }
  title: { en: string; hi: string }
  desc?: { en: string; hi?: string }
  guideTag?: string
  guideTitle?: string
  guideKeywords?: string
  footerStep: string
}

export interface ValueFactorItem {
  factor: { en: string; hi: string }
  icon: LucideIcon
  check: { en: string; hi: string }
  impact: { en: string; hi: string }
}

export interface RelatedPageCard {
  icon: LucideIcon
  title: { en: string; hi: string }
  desc?: { en: string; hi?: string }
  guideTag?: string
  guideTitle?: string
  linkText: { en: string; hi: string }
  href: string
}

export interface GeneralFaqItem {
  qEn: string
  qHi: string
  aEn?: string
  aHi?: string
  guideTag?: string
  guideTitle?: string
  guideKeywords?: string
}

export interface VehicleCategoryPageConfig {
  breadcrumbs?: BreadcrumbItem[]
  hero: {
    bgImage?: string
    categoryBadge?: { en: string; hi: string }
    h1Line1: { en: string; hi: string }
    h1Line2: { en: string; hi: string }
    supportingText?: { en: string; hi?: string }
    guideTag?: string
    guideTitle?: string
    guideKeywords?: string
    trustBadges: Array<{ en: string; hi: string }>
    primaryCtaText: { en: string; hi: string }
    secondaryCtaText: { en: string; hi: string }
    valuationLink: string
    rightHighlight?: {
      headlinePart1: { en: string; hi: string }
      headlinePart2: { en: string; hi: string }
      cityHighlight: { en: string; hi: string }
      floatingBadges: Array<{
        icon: LucideIcon
        title: { en: string; hi: string }
      }>
    }
    advantageCards: Array<{
      num: string
      icon: LucideIcon
      title: { en: string; hi: string }
      desc: { en: string; hi: string }
    }>
  }
  intro: {
    overline: { en: string; hi: string }
    h2Part1: { en: string; hi: string }
    h2Highlight: { en: string; hi: string }
    paragraphs?: Array<{
      en: React.ReactNode
      hi?: React.ReactNode
    }>
    guide1?: {
      tag: string
      title: string
      keywords: string
    }
    guide2?: {
      tag: string
      title: string
      links: string
    }
    rating?: {
      score: string
      reviewsText: { en: string; hi: string }
    }
    atAGlance: {
      headerBadge: { en: string; hi: string }
      liveStatus: { en: string; hi: string }
      subtitle: { en: string; hi: string }
      weScrap: {
        label: { en: string; hi: string }
        value: { en: string; hi: string }
      }
      pickup: {
        label: { en: string; hi: string }
        value: { en: string; hi: string }
        freeBadge: { en: string; hi: string }
      }
      contact: {
        label: { en: string; hi: string }
        phoneDisplay: string
        phoneTel: string
        whatsappUrl: string
      }
      facility: {
        label: { en: string; hi: string }
        address: string
      }
    }
  }
  popularModels: {
    badge: { en: string; hi: string }
    h2Part1: { en: string; hi: string }
    h2Highlight: { en: string; hi: string }
    introText?: { en: string; hi?: string }
    guide?: {
      tag: string
      title: string
      keywords: string
    }
    tableHeaders: {
      col1: { en: string; hi: string }
      col2: { en: string; hi: string }
    }
    models: PopularModelItem[]
    disclaimer: { en: string; hi: string }
    questionsTitle: { en: string; hi: string }
    questions: ModelQuestionItem[]
  }
  redBanner: {
    title: { en: string; hi: string }
    subtitle: { en: string; hi: string }
    ctaText: { en: string; hi: string }
    ctaUrl: string
  }
  process: {
    badge: { en: string; hi: string }
    h2Part1: { en: string; hi: string }
    h2Highlight: { en: string; hi: string }
    introText?: {
      en: React.ReactNode
      hi?: React.ReactNode
    }
    guide?: {
      tag: string
      title: string
      links: string
    }
    steps: ProcessStepItem[]
  }
  documents: {
    overline: { en: string; hi: string }
    h2Part1: { en: string; hi: string }
    h2Highlight: { en: string; hi: string }
    introText?: { en: string; hi?: string }
    guide?: {
      tag: string
      title: string
      keywords: string
    }
    leftCard1: {
      title: { en: string; hi: string }
      text?: { en: string; hi?: string }
      guideTag?: string
      guideTitle?: string
    }
    leftCard2: {
      title: { en: string; hi: string }
      guideText: string
      linkText: string
      linkHref: string
    }
    helpCard: {
      badge: { en: string; hi: string }
      title: { en: string; hi: string }
      points: Array<{ en: string; hi: string }>
      ctaText: { en: string; hi: string }
      whatsappUrl: string
    }
  }
  scrapValue: {
    badge: { en: string; hi: string }
    h2Part1: { en: string; hi: string }
    h2Highlight: { en: string; hi: string }
    introText?: { en: string; hi?: string }
    guide?: {
      tag: string
      title: string
      keywords: string
    }
    tableHeaders: {
      factor: { en: string; hi: string }
      check: { en: string; hi: string }
      impact: { en: string; hi: string }
    }
    factors: ValueFactorItem[]
    note: { en: string; hi: string }
  }
  relatedPages: {
    badge: { en: string; hi: string }
    h2Part1: { en: string; hi: string }
    h2Highlight: { en: string; hi: string }
    cards: RelatedPageCard[]
  }
  faqs: {
    overline: { en: string; hi: string }
    h2Part1: { en: string; hi: string }
    h2Highlight: { en: string; hi: string }
    subtitle: {
      textBeforeLink: { en: string; hi: string }
      linkText: { en: string; hi: string }
      linkHref: string
    }
    items: GeneralFaqItem[]
    helpCard: {
      title: { en: string; hi: string }
      subtitle: { en: string; hi: string }
      phoneDisplay: string
      phoneTel: string
      whatsappUrl: string
    }
  }
  bottomCta: {
    badge: { en: string; hi: string }
    h2: { en: string; hi: string }
    supportingIntro: { en: string; hi: string }
    supportingDesc: { en: string; hi: string }
    trustBadges: Array<{ icon: LucideIcon; text: { en: string; hi: string } }>
    formBadge: { en: string; hi: string }
    formTitle: { en: string; hi: string }
    formSubtitle: { en: string; hi: string }
    hideVehicleInput?: boolean
    inputPlaceholder?: { en: string; hi: string }
    ctaButtonText: { en: string; hi: string }
    whatsappButtonText: { en: string; hi: string }
    guaranteeText: { en: string; hi: string }
  }
  phoneConfig: {
    phoneDisplay: string
    phoneTel: string
    whatsappUrl: string
    facilityAddress: string
  }
}

interface VehicleCategoryTemplateProps {
  isHindi: boolean
  config: VehicleCategoryPageConfig
}

export default function VehicleCategoryTemplate({ isHindi, config }: VehicleCategoryTemplateProps) {
  const [loading, setLoading] = useState(true)
  const [showTeamModal, setShowTeamModal] = useState(false)
  const [vehicleNoInput, setVehicleNoInput] = useState("")

  // Auto-rotating highlight for 3 Key Advantage cards
  const [activeAdvantageIndex, setActiveAdvantageIndex] = useState(0)
  const [isAdvantageHovered, setIsAdvantageHovered] = useState(false)

  // Sub-accordions for popular model questions (by default only the first one is open)
  const [openModelQuestion, setOpenModelQuestion] = useState<number | null>(0)
  const toggleModelQuestion = (idx: number) => {
    setOpenModelQuestion((prev) => (prev === idx ? null : idx))
  }

  // General FAQs accordion (by default only the first one is open)
  const [openFaq, setOpenFaq] = useState<number | null>(0)
  const toggleFaq = (idx: number) => {
    setOpenFaq((prev) => (prev === idx ? null : idx))
  }

  useEffect(() => {
    if (isAdvantageHovered) return
    const timer = setInterval(() => {
      setActiveAdvantageIndex((prev) => (prev + 1) % 3)
    }, 2800)
    return () => clearInterval(timer)
  }, [isAdvantageHovered])

  const sectionVariants = {
    hidden: { opacity: 0, y: 35 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.65,
        ease: [0.22, 1, 0.36, 1] as const,
      },
    },
  }

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.05,
      },
    },
  }

  const cardFadeIn = {
    hidden: { opacity: 0, y: 22 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: [0.22, 1, 0.36, 1] as const,
      },
    },
  }

  if (loading) {
    return <LoadingScreen onComplete={() => setLoading(false)} />
  }

  const {
    breadcrumbs,
    hero,
    intro,
    popularModels,
    redBanner,
    process,
    documents,
    scrapValue,
    relatedPages,
    faqs,
    bottomCta,
    phoneConfig,
  } = config

  const handleBottomFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const targetUrl = vehicleNoInput.trim()
      ? `/know-your-valuation?vehicle=${encodeURIComponent(vehicleNoInput.trim())}&type=two-wheeler`
      : `/know-your-valuation?type=two-wheeler`
    window.location.href = targetUrl
  }

  return (
    <div className="min-h-screen bg-white">
      {/* ─────────────────────────────────────────────────────────────
          SECTION 1: HERO SECTION (Image 2)
      ───────────────────────────────────────────────────────────── */}
      <section className="relative w-full pt-28 sm:pt-32 lg:pt-24 xl:pt-28 pb-8 sm:pb-10 lg:pb-10 xl:pb-12 bg-white overflow-hidden border-b border-slate-100">
        <div className="absolute -left-24 top-8 w-96 h-96 bg-red-100/30 rounded-full blur-3xl pointer-events-none -z-0" />
        <div className="absolute -right-24 top-16 w-96 h-96 bg-red-50/40 rounded-full blur-3xl pointer-events-none -z-0" />
        <div className="absolute top-0 left-1/3 w-96 h-64 bg-slate-50/60 rounded-full blur-3xl pointer-events-none -z-0" />

        {/* Hero Background Vehicle Image (from hero.bgImage) */}
        {hero.bgImage && (
          <div
            className="absolute inset-0 pointer-events-none bg-no-repeat bg-right-top bg-contain z-0 hidden sm:block"
            style={{ backgroundImage: `url('${hero.bgImage}')` }}
          />
        )}

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl relative z-10">
          {/* Breadcrumbs (Optional) */}
          {breadcrumbs && breadcrumbs.length > 0 && (
            <nav aria-label="Breadcrumb" className="mb-4 sm:mb-5 pt-2">
              <ol className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-xs sm:text-[13px] text-slate-500 font-medium">
                {breadcrumbs.map((item, idx) => (
                  <li key={idx} className="flex items-center gap-1.5 sm:gap-2">
                    {idx > 0 && <span className="text-slate-300">/</span>}
                    {idx === breadcrumbs.length - 1 ? (
                      <span className="text-slate-900 font-semibold">{isHindi ? (item.nameHi || item.name) : item.name}</span>
                    ) : (
                      <Link
                        href={item.href}
                        className="hover:text-[#E31E24] transition-colors"
                      >
                        {isHindi ? (item.nameHi || item.name) : item.name}
                      </Link>
                    )}
                  </li>
                ))}
              </ol>
            </nav>
          )}

          <div className={`grid grid-cols-1 ${hero.rightHighlight ? "lg:grid-cols-12" : ""} gap-8 lg:gap-8 xl:gap-10 items-center mb-8 sm:mb-10`}>
            {/* Left Content Area */}
            <div className={`${hero.rightHighlight ? "lg:col-span-7 xl:col-span-8" : hero.bgImage ? "max-w-2xl sm:max-w-3xl lg:max-w-4xl" : "w-full max-w-4xl"} text-left`}>
              {/* Category Pill Badge (Optional) */}
              {hero.categoryBadge && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                  className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-50 border border-red-200/80 text-[#E31E24] text-xs font-black uppercase tracking-wider mb-4 shadow-2xs"
                >
                  <MapPin className="w-3.5 h-3.5 text-[#E31E24]" />
                  <span>{isHindi ? hero.categoryBadge.hi : hero.categoryBadge.en}</span>
                </motion.div>
              )}

              {/* Main Headline (H1) */}
              <motion.h1
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="text-2xl sm:text-3xl lg:text-[2rem] xl:text-[2.35rem] 2xl:text-[2.5rem] font-black text-slate-900 tracking-tight leading-[1.2] mb-3.5 sm:mb-4 text-left"
              >
                <span className="block">{isHindi ? hero.h1Line1.hi : hero.h1Line1.en}</span>
                <span className="block text-[#E31E24] mt-1.5 sm:mt-2">
                  {isHindi ? hero.h1Line2.hi : hero.h1Line2.en}
                </span>
              </motion.h1>

              {/* Hero Supporting Text or Guide Box */}
              {hero.supportingText ? (
                <motion.p
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.15 }}
                  className={`text-slate-600 text-sm sm:text-base lg:text-[15px] xl:text-[17px] font-normal leading-relaxed my-4 ${hero.bgImage ? "max-w-xl sm:max-w-2xl lg:max-w-2xl" : "max-w-3xl"} text-left`}
                >
                  {isHindi && hero.supportingText.hi ? hero.supportingText.hi : hero.supportingText.en}
                </motion.p>
              ) : (
                hero.guideTag && (
                  <WireframeGuideBox
                    tag={hero.guideTag}
                    title={hero.guideTitle || ""}
                    sub={hero.guideKeywords}
                  />
                )
              )}

              {/* 4 Trust Badges in Left-Aligned Row */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="flex flex-wrap items-center justify-start gap-2 sm:gap-2.5 my-5 sm:my-6"
              >
                {hero.trustBadges.map((badge, i) => (
                  <div
                    key={i}
                    className="inline-flex items-center gap-1.5 sm:gap-2 bg-white border border-red-200/80 hover:border-red-300 px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full text-[11px] sm:text-xs font-semibold text-slate-700 shadow-2xs transition-colors"
                  >
                    <span className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-red-100 text-[#E31E24] flex items-center justify-center text-[9px] sm:text-[10px] font-black shrink-0">
                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                    </span>
                    <span>{isHindi ? badge.hi : badge.en}</span>
                  </div>
                ))}
              </motion.div>

              {/* Dual Primary CTA Action Row */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.25 }}
                className="flex flex-col sm:flex-row items-stretch sm:items-center justify-start gap-3 sm:gap-3.5"
              >
                <Link
                  href={hero.valuationLink}
                  className="c-button--gooey inline-flex items-center justify-center gap-2 px-6 sm:px-7 py-3 sm:py-3.5 rounded-xl bg-[#E31E24] text-white border-2 border-[#E31E24] font-extrabold text-xs sm:text-sm lg:text-[13px] xl:text-base tracking-wide shadow-md shadow-red-500/20 relative overflow-hidden cursor-pointer w-full sm:w-auto min-w-[180px] xl:min-w-[190px]"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    <span>{isHindi ? hero.primaryCtaText.hi : hero.primaryCtaText.en}</span>
                    <ArrowRight className="w-4 h-4" />
                  </span>
                  <div className="c-button__blobs">
                    <div />
                    <div />
                    <div />
                  </div>
                </Link>

                <button
                  type="button"
                  onClick={() => setShowTeamModal(true)}
                  className="inline-flex items-center justify-center gap-2 px-6 sm:px-7 py-3 sm:py-3.5 rounded-xl bg-white border-2 border-red-200 hover:border-[#E31E24] hover:bg-red-50/50 text-[#E31E24] font-bold text-xs sm:text-sm lg:text-[13px] xl:text-base tracking-wide shadow-2xs hover:shadow-xs hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer w-full sm:w-auto min-w-[180px] xl:min-w-[190px]"
                >
                  <Phone className="w-4 h-4 text-[#E31E24]" />
                  <span>{isHindi ? hero.secondaryCtaText.hi : hero.secondaryCtaText.en}</span>
                </button>
              </motion.div>
            </div>

            {/* Right Hero Graphic / Badge Stack (Optional) */}
            {hero.rightHighlight && (
              <div className="hidden lg:flex lg:col-span-5 xl:col-span-4 flex-col items-center lg:items-end justify-center pt-2 lg:pt-0">
                <div className="w-full max-w-sm bg-gradient-to-br from-slate-50 via-white to-red-50/40 p-5 sm:p-6 lg:p-5 xl:p-6 rounded-3xl border border-red-100/80 shadow-lg shadow-red-500/5 relative text-left">
                  <div className="mb-5 sm:mb-6">
                    <div className={`text-2xl sm:text-3xl lg:text-2xl xl:text-3xl font-black text-slate-900 leading-tight ${caveat.className} tracking-wide`}>
                      {isHindi ? hero.rightHighlight.headlinePart1.hi : hero.rightHighlight.headlinePart1.en}
                    </div>
                    <div className="text-xl sm:text-2xl lg:text-lg xl:text-2xl font-black text-slate-800 leading-tight">
                      {isHindi ? hero.rightHighlight.headlinePart2.hi : hero.rightHighlight.headlinePart2.en}{" "}
                      <span className="text-[#E31E24]">{isHindi ? hero.rightHighlight.cityHighlight.hi : hero.rightHighlight.cityHighlight.en}</span>
                    </div>
                  </div>

                  <div className="space-y-2.5 sm:space-y-3">
                    {hero.rightHighlight.floatingBadges.map((badge, idx) => {
                      const IconComp = badge.icon
                      return (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.4, delay: 0.15 + idx * 0.1 }}
                          className="flex items-center gap-3 bg-white p-2.5 sm:p-3 lg:p-2.5 xl:p-3.5 rounded-2xl border border-slate-200/80 shadow-xs hover:border-[#E31E24]/60 hover:shadow-md transition-all group"
                        >
                          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-red-50 group-hover:bg-[#E31E24] text-[#E31E24] group-hover:text-white flex items-center justify-center shrink-0 transition-colors shadow-2xs">
                            <IconComp className="w-4 h-4" />
                          </div>
                          <span className="text-xs sm:text-sm lg:text-xs xl:text-sm font-black text-slate-800 group-hover:text-[#E31E24] transition-colors">
                            {isHindi ? badge.title.hi : badge.title.en}
                          </span>
                        </motion.div>
                      )
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="w-full border-t border-slate-100 mb-5 sm:mb-6 lg:mb-7" />

          {/* 3 Key Advantage Cards */}
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ duration: 0.6, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 sm:gap-4 lg:gap-4 xl:gap-5 w-full"
            onMouseEnter={() => setIsAdvantageHovered(true)}
            onMouseLeave={() => setIsAdvantageHovered(false)}
          >
            {hero.advantageCards.map((card, idx) => {
              const isActive = activeAdvantageIndex === idx
              const IconComp = card.icon
              return (
                <div
                  key={idx}
                  onMouseEnter={() => setActiveAdvantageIndex(idx)}
                  className={`relative bg-white rounded-2xl p-4 sm:p-5 lg:p-4.5 xl:p-6 text-left transition-all duration-500 ease-out cursor-pointer overflow-hidden ${
                    isActive
                      ? "border border-[#E31E24] shadow-xl shadow-red-500/10 -translate-y-1 sm:-translate-y-1.5 ring-1 ring-[#E31E24]/20"
                      : "border border-slate-200/80 shadow-xs hover:border-[#E31E24]/60 translate-y-0"
                  }`}
                >
                  <div
                    className={`absolute top-0 left-0 right-0 h-[2.5px] bg-gradient-to-r from-transparent via-[#E31E24] to-transparent transition-opacity duration-500 ${
                      isActive ? "opacity-100" : "opacity-0"
                    }`}
                  />

                  <div className="flex items-start justify-between mb-3 sm:mb-4">
                    <div
                      className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center font-bold transition-all duration-500 ${
                        isActive
                          ? "bg-[#E31E24] text-white shadow-md shadow-red-500/25 scale-105"
                          : "bg-red-50 text-[#E31E24]"
                      }`}
                    >
                      <IconComp className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                    <span
                      className={`font-black text-lg sm:text-xl transition-colors duration-500 select-none ${
                        isActive ? "text-red-300" : "text-slate-300"
                      }`}
                    >
                      {card.num}
                    </span>
                  </div>
                  <h3 className="text-base sm:text-lg lg:text-[16px] xl:text-lg font-black text-slate-900 leading-tight mb-1.5">
                    {isHindi ? card.title.hi : card.title.en}
                  </h3>
                  <p className="text-xs sm:text-[13px] lg:text-xs xl:text-sm text-slate-500 leading-relaxed">
                    {isHindi ? card.desc.hi : card.desc.en}
                  </p>
                </div>
              )
            })}
          </motion.div>
        </div>

        {/* Team Contact Modal */}
        <AnimatePresence>
          {showTeamModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4"
              onClick={() => setShowTeamModal(false)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0, y: 10 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 10 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-red-100 text-left relative"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-xl bg-red-50 text-[#E31E24] flex items-center justify-center font-bold">
                      <Phone className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-slate-900">
                        {isHindi ? "हमारी टीम से संपर्क करें" : "Talk to Our Team"}
                      </h3>
                      <p className="text-xs text-slate-500 font-medium">Direct dispatch & paperwork support</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowTeamModal(false)}
                    className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center cursor-pointer transition-colors"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-3 mb-6">
                  <a
                    href={`tel:${phoneConfig.phoneTel}`}
                    className="flex items-center justify-between p-3.5 rounded-2xl bg-red-50/60 hover:bg-red-50 border border-red-100 text-slate-900 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-[#E31E24] text-white flex items-center justify-center shrink-0">
                        <Phone className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Direct Hotline</div>
                        <div className="text-sm font-black text-slate-900">{phoneConfig.phoneDisplay}</div>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-[#E31E24]">Call Now →</span>
                  </a>

                  <a
                    href={phoneConfig.whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 hover:bg-red-50/40 border border-slate-200 hover:border-red-200 text-slate-900 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center shrink-0">
                        <MessageCircle className="w-4 h-4 text-[#25D366]" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">WhatsApp Dispatch</div>
                        <div className="text-sm font-black text-slate-900">Chat with Scrapping Specialist</div>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-slate-700">Open Chat →</span>
                  </a>

                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
                    <div className="font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-[#E31E24]" />
                      <span>Authorised RVSF Location</span>
                    </div>
                    <div className="font-semibold text-slate-800 leading-snug">
                      {phoneConfig.facilityAddress}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowTeamModal(false)}
                  className="w-full py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors cursor-pointer"
                >
                  Close
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          SECTION 2: INTRODUCTION & AT A GLANCE (Image 3)
      ───────────────────────────────────────────────────────────── */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.12 }}
        variants={sectionVariants}
        className="py-12 sm:py-16 lg:py-14 xl:py-20 bg-gradient-to-b from-white via-slate-50/40 to-white text-slate-900 border-b border-slate-100 relative overflow-hidden"
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-8 xl:gap-14 items-start">
            <div className="lg:col-span-7 space-y-5 text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-50 border border-red-100 text-[#E31E24] text-xs font-black uppercase tracking-wider">
                <span className="w-2 h-2 rounded-full bg-[#E31E24] animate-pulse" />
                <span>{isHindi ? intro.overline.hi : intro.overline.en}</span>
              </div>

              <h2 className="text-2xl sm:text-3xl lg:text-[26px] xl:text-[32px] font-black text-slate-900 tracking-tight leading-[1.25]">
                {isHindi ? intro.h2Part1.hi : intro.h2Part1.en}{" "}
                <span className="text-[#E31E24]">{isHindi ? intro.h2Highlight.hi : intro.h2Highlight.en}</span>
              </h2>

              {/* Paragraphs or Wireframe Guide Boxes */}
              {intro.paragraphs && intro.paragraphs.length > 0 ? (
                <div className="space-y-4 text-slate-600 text-[14px] sm:text-base leading-relaxed">
                  {intro.paragraphs.map((p, idx) => (
                    <p key={idx} className="text-slate-600 font-normal">
                      {isHindi && p.hi ? p.hi : p.en}
                    </p>
                  ))}
                </div>
              ) : (
                <>
                  {intro.guide1 && (
                    <WireframeGuideBox
                      tag={intro.guide1.tag}
                      title={intro.guide1.title}
                      sub={intro.guide1.keywords}
                    />
                  )}
                  {intro.guide2 && (
                    <WireframeGuideBox
                      tag={intro.guide2.tag}
                      title={intro.guide2.title}
                      sub={intro.guide2.links}
                    />
                  )}
                </>
              )}

              {/* Google Rating Card (Image 3 - Optional) */}
              {intro.rating && (
                <div className="inline-flex items-center gap-4 p-3.5 sm:p-4 rounded-2xl bg-white border border-slate-200/90 shadow-sm mt-3">
                  <div className="flex items-center gap-1 text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 sm:w-5 sm:h-5 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <div className="border-l border-slate-200 pl-3.5 sm:pl-4">
                    <div className="text-sm sm:text-base font-black text-slate-900 leading-tight">
                      {intro.rating.score}
                    </div>
                    <div className="text-xs text-slate-500 font-medium">
                      {isHindi ? intro.rating.reviewsText.hi : intro.rating.reviewsText.en}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Right Card: TWO-WHEELERS AT A GLANCE (Image 3) */}
            <div className="lg:col-span-5 pt-2 lg:pt-0">
              <div className="bg-white border border-slate-200 rounded-3xl shadow-xl shadow-slate-200/60 overflow-hidden relative transition-all duration-300 hover:shadow-2xl hover:border-slate-300">
                <div className="h-1.5 w-full bg-gradient-to-r from-[#E31E24] via-rose-500 to-[#E31E24]" />

                <div className="bg-slate-950 text-white p-4 sm:p-5 lg:p-4.5 xl:p-6 relative overflow-hidden text-left">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-red-600/15 rounded-full blur-2xl pointer-events-none" />
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="relative flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#E31E24]"></span>
                      </span>
                      <span className="text-xs font-black uppercase tracking-[0.16em] text-white">
                        {isHindi ? intro.atAGlance.headerBadge.hi : intro.atAGlance.headerBadge.en}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="divide-y divide-slate-100 p-2 sm:p-3 lg:p-2.5 xl:p-4 text-left">
                  <div className="p-3 sm:p-3.5 hover:bg-slate-50/70 rounded-2xl transition-colors">
                    <div className="flex items-start gap-3.5">
                      <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-red-50 text-[#E31E24] flex items-center justify-center shrink-0 mt-0.5">
                        <Bike className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="mb-1">
                          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                            {isHindi ? intro.atAGlance.weScrap.label.hi : intro.atAGlance.weScrap.label.en}
                          </span>
                        </div>
                        <div className="text-xs font-bold text-slate-900 leading-relaxed">
                          {isHindi ? intro.atAGlance.weScrap.value.hi : intro.atAGlance.weScrap.value.en}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 sm:p-3.5 hover:bg-slate-50/70 rounded-2xl transition-colors">
                    <div className="flex items-start gap-3.5">
                      <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-red-50 text-[#E31E24] flex items-center justify-center shrink-0 mt-0.5">
                        <Truck className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                            {isHindi ? intro.atAGlance.pickup.label.hi : intro.atAGlance.pickup.label.en}
                          </span>
                        </div>
                        <div className="text-xs font-bold text-slate-900 leading-snug">
                          {isHindi ? intro.atAGlance.pickup.value.hi : intro.atAGlance.pickup.value.en}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 sm:p-3.5 hover:bg-slate-50/70 rounded-2xl transition-colors">
                    <div className="flex items-start gap-3.5">
                      <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-red-50 text-[#E31E24] flex items-center justify-center shrink-0 mt-0.5">
                        <Phone className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">
                          {isHindi ? intro.atAGlance.contact.label.hi : intro.atAGlance.contact.label.en}
                        </div>
                        <div className="text-sm font-black text-slate-900">
                          {intro.atAGlance.contact.phoneDisplay}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 sm:p-3.5 hover:bg-slate-50/70 rounded-2xl transition-colors">
                    <div className="flex items-start gap-3.5">
                      <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-red-50 text-[#E31E24] flex items-center justify-center shrink-0 mt-0.5">
                        <MapPin className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="mb-1">
                          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                            {isHindi ? intro.atAGlance.facility.label.hi : intro.atAGlance.facility.label.en}
                          </span>
                        </div>
                        <div className="text-xs font-bold text-slate-900 leading-relaxed">
                          {intro.atAGlance.facility.address}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* ─────────────────────────────────────────────────────────────
          SECTION 3: POPULAR TWO-WHEELERS IN INDIA + QUESTIONS (Images 4 & 5)
      ───────────────────────────────────────────────────────────── */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.08 }}
        variants={sectionVariants}
        className="py-12 sm:py-16 lg:py-14 xl:py-20 bg-slate-50/60 text-slate-900 border-b border-slate-100 relative"
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <div className="text-left mb-6 sm:mb-8 max-w-4xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-black text-white text-[11px] font-black uppercase tracking-wider mb-3">
              <span className="w-2 h-2 rounded-full bg-[#E31E24]" />
              <span>{isHindi ? popularModels.badge.hi : popularModels.badge.en}</span>
            </div>

            <h2 className="text-2xl sm:text-3xl lg:text-[30px] xl:text-[34px] font-black text-slate-900 tracking-tight leading-[1.25] mb-3">
              {isHindi ? popularModels.h2Part1.hi : popularModels.h2Part1.en}{" "}
              <span className="text-[#E31E24]">
                {isHindi ? popularModels.h2Highlight.hi : popularModels.h2Highlight.en}
              </span>
            </h2>

            {/* PM-0 Intro Paragraph or Wireframe Box */}
            {popularModels.introText ? (
              <p className="text-slate-600 text-[14px] sm:text-base leading-relaxed text-left mb-6 font-normal">
                {isHindi && popularModels.introText.hi ? popularModels.introText.hi : popularModels.introText.en}
              </p>
            ) : (
              popularModels.guide && (
                <WireframeGuideBox
                  tag={popularModels.guide.tag}
                  title={popularModels.guide.title}
                  sub={popularModels.guide.keywords}
                />
              )
            )}
          </div>

          {/* Table Container (Image 4) */}
          <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden mb-4">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[340px] sm:min-w-0 text-left border-collapse">
                <thead>
                  <tr className="bg-slate-100/70 border-b border-slate-200/80 text-slate-700 font-black text-[11px] sm:text-xs uppercase tracking-wider">
                    <th className="py-3 px-3.5 sm:py-4 sm:px-6 w-3/5 sm:w-2/3">
                      {isHindi ? popularModels.tableHeaders.col1.hi : popularModels.tableHeaders.col1.en}
                    </th>
                    <th className="py-3 px-3.5 sm:py-4 sm:px-6 w-2/5 sm:w-1/3">
                      {isHindi ? popularModels.tableHeaders.col2.hi : popularModels.tableHeaders.col2.en}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {popularModels.models.map((item, idx) => (
                    <tr key={idx} className="hover:bg-red-50/30 transition-colors">
                      <td className="py-3 px-3.5 sm:py-4 sm:px-6">
                        <div className="flex items-center gap-2.5 sm:gap-3">
                          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-red-50 text-[#E31E24] flex items-center justify-center shrink-0">
                            <Bike className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                          </div>
                          <span className="font-bold text-slate-900 text-xs sm:text-sm md:text-base">
                            {idx + 1}. {item.name}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-3.5 sm:py-4 sm:px-6 text-slate-600 text-xs sm:text-sm font-medium">
                        {isHindi && item.typeHi ? item.typeHi : item.type}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <p className="text-left text-xs text-slate-500 mb-8 sm:mb-10 lg:mb-12">
            {isHindi ? popularModels.disclaimer.hi : popularModels.disclaimer.en}
          </p>

          <div className="text-left mb-5 sm:mb-6">
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              {isHindi ? popularModels.questionsTitle.hi : popularModels.questionsTitle.en}
            </h3>
          </div>

          {/* 5 Accordion Cards with Red Square Numbers (Image 5) */}
          <div className="space-y-3 sm:space-y-3.5 max-w-5xl">
            {popularModels.questions.map((qItem, idx) => {
              const isOpen = openModelQuestion === idx
              return (
                <div
                  key={idx}
                  className="rounded-2xl transition-all duration-300 relative overflow-hidden bg-white border border-red-300/80 shadow-2xs"
                >
                  <button
                    type="button"
                    onClick={() => toggleModelQuestion(idx)}
                    className="w-full p-3.5 sm:p-4 lg:p-5 flex items-center justify-between gap-3 sm:gap-4 text-left cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-3 sm:gap-3.5">
                      <span className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-[#E31E24] text-white flex items-center justify-center text-xs sm:text-sm font-black shrink-0 shadow-xs">
                        {idx + 1}
                      </span>
                      <span className="text-xs sm:text-sm md:text-base font-bold text-slate-900 leading-snug">
                        {isHindi ? qItem.qHi : qItem.qEn}
                      </span>
                    </div>
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-transform duration-300 ${
                        isOpen ? "rotate-180 text-[#E31E24]" : "text-slate-400"
                      }`}
                    >
                      <ChevronDown className="w-4 h-4 stroke-[2.5]" />
                    </div>
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: "easeInOut" }}
                        className="overflow-hidden"
                      >
                        <div className="px-3.5 pb-3.5 sm:px-5 sm:pb-5 pt-0 pl-3.5 sm:pl-14 lg:pl-16">
                          {qItem.aEn ? (
                            <p className="text-slate-600 text-xs sm:text-sm md:text-[15px] font-normal leading-relaxed text-left">
                              {isHindi && qItem.aHi ? qItem.aHi : qItem.aEn}
                            </p>
                          ) : (
                            qItem.tag && (
                              <WireframeGuideBox
                                tag={qItem.tag}
                                title={qItem.title || ""}
                              />
                            )
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )
            })}
          </div>
        </div>
      </motion.section>

      {/* ─────────────────────────────────────────────────────────────
          SECTION 4: RED NOTIFICATION BAR (Image 1 from prompt 2)
      ───────────────────────────────────────────────────────────── */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={sectionVariants}
        className="bg-[#C53030] text-white py-5 sm:py-6"
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
            <div>
              <h3 className="text-xl sm:text-2xl font-black tracking-tight mb-1 text-white">
                {isHindi ? redBanner.title.hi : redBanner.title.en}
              </h3>
              <p className="text-xs sm:text-sm text-red-100 font-normal">
                {isHindi ? redBanner.subtitle.hi : redBanner.subtitle.en}
              </p>
            </div>

            <a
              href={redBanner.ctaUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-black hover:bg-slate-900 text-white text-xs sm:text-sm font-bold px-6 py-2.5 rounded-full shadow-md active:scale-95 transition-all shrink-0 cursor-pointer"
            >
              <span>{isHindi ? redBanner.ctaText.hi : redBanner.ctaText.en}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </motion.section>

      {/* ─────────────────────────────────────────────────────────────
          SECTION 5: 4-STEP PROCESS (Image 1 from prompt 2)
      ───────────────────────────────────────────────────────────── */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.12 }}
        variants={sectionVariants}
        className="py-14 sm:py-20 bg-white text-slate-900 border-b border-slate-100 relative"
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <div className="text-left mb-6 sm:mb-8 max-w-4xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-red-300 text-[#E31E24] text-xs font-bold uppercase tracking-wider mb-3">
              <span>{isHindi ? process.badge.hi : process.badge.en}</span>
            </div>

            <h2 className="text-2xl sm:text-3xl lg:text-[34px] font-black text-slate-900 tracking-tight leading-[1.25] mb-3">
              {isHindi ? process.h2Part1.hi : process.h2Part1.en}{" "}
              <span className="text-[#E31E24]">
                {isHindi ? process.h2Highlight.hi : process.h2Highlight.en}
              </span>
            </h2>

            {/* P-0 Intro Paragraph or Wireframe Box */}
            {process.introText ? (
              <p className="text-slate-600 text-[15px] sm:text-base leading-relaxed text-left mb-6 font-normal">
                {isHindi && process.introText.hi ? process.introText.hi : process.introText.en}
              </p>
            ) : (
              process.guide && (
                <WireframeGuideBox
                  tag={process.guide.tag}
                  title={process.guide.title}
                  sub={
                    <span>
                      Links: &quot;vehicle scrapping guide&quot; &rarr;{" "}
                      <Link href="/vehicle-scrapping-services" className="text-[#E31E24] underline font-bold">
                        /vehicle-scrapping-services
                      </Link>
                    </span>
                  }
                />
              )
            )}
          </div>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.08 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4 lg:gap-3.5 xl:gap-4.5"
          >
            {process.steps.map((step, idx) => {
              const StepIcon = step.icon
              return (
                <motion.div
                  key={idx}
                  variants={cardFadeIn}
                  className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 lg:p-4 xl:p-5 flex flex-col justify-between h-full shadow-xs hover:border-[#E31E24] transition-all duration-300 text-left"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xl sm:text-2xl font-black text-[#E31E24] tracking-tight">
                        {step.num}
                      </span>
                      <div className="w-8 h-8 rounded-lg bg-black text-white flex items-center justify-center">
                        <StepIcon className="w-4 h-4" />
                      </div>
                    </div>

                    <div className="inline-block px-2.5 py-0.5 rounded-md bg-red-50 text-[#E31E24] text-[10px] font-black uppercase tracking-wider mb-2.5">
                      {isHindi ? step.badge.hi : step.badge.en}
                    </div>

                    <h3 className="text-sm sm:text-[15px] font-black text-slate-900 leading-snug mb-2">
                      {isHindi ? step.title.hi : step.title.en}
                    </h3>

                    {step.desc ? (
                      <p className="text-slate-600 text-xs sm:text-[13px] font-normal leading-relaxed mb-4">
                        {isHindi && step.desc.hi ? step.desc.hi : step.desc.en}
                      </p>
                    ) : (
                      step.guideTag && (
                        <WireframeGuideBox
                          tag={step.guideTag}
                          title={step.guideTitle || ""}
                          sub={step.guideKeywords}
                        />
                      )
                    )}
                  </div>

                  <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between text-[10px] font-black uppercase tracking-wider text-slate-400">
                    <span>{step.footerStep}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                </motion.div>
              )
            })}
          </motion.div>
        </div>
      </motion.section>

      {/* ─────────────────────────────────────────────────────────────
          SECTION 6: DOCUMENTS REQUIRED (Image 2 from prompt 2)
      ───────────────────────────────────────────────────────────── */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
        variants={sectionVariants}
        className="py-14 sm:py-20 bg-slate-50/60 text-slate-900 border-b border-slate-100 relative"
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <div className="text-left mb-6 sm:mb-8 max-w-4xl">
            <div className="text-xs font-black uppercase tracking-wider text-[#E31E24] mb-2">
              {isHindi ? documents.overline.hi : documents.overline.en}
            </div>

            <h2 className="text-2xl sm:text-3xl lg:text-[34px] font-black text-slate-900 tracking-tight leading-[1.25] mb-3">
              {isHindi ? documents.h2Part1.hi : documents.h2Part1.en}{" "}
              <span className="text-[#E31E24]">
                {isHindi ? documents.h2Highlight.hi : documents.h2Highlight.en}
              </span>
            </h2>

            {/* D-0 Intro Paragraph or Wireframe Box */}
            {documents.introText ? (
              <p className="text-slate-600 text-[15px] sm:text-base leading-relaxed text-left mb-6 font-normal">
                {isHindi && documents.introText.hi ? documents.introText.hi : documents.introText.en}
              </p>
            ) : (
              documents.guide && (
                <WireframeGuideBox
                  tag={documents.guide.tag}
                  title={documents.guide.title}
                  sub={documents.guide.keywords}
                />
              )
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
            {/* Left Column: 2 Cards (Image 2) */}
            <div className="lg:col-span-7 space-y-4 text-left">
              {/* Card 1: Not sure which papers apply? */}
              <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs">
                <div className="flex items-start gap-4">
                  <div className="w-9 h-9 rounded-lg bg-black text-white flex items-center justify-center shrink-0">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-base font-black text-slate-900 mb-2">
                      {isHindi ? documents.leftCard1.title.hi : documents.leftCard1.title.en}
                    </h3>
                    {documents.leftCard1.text ? (
                      <p className="text-xs sm:text-[13px] text-slate-600 leading-relaxed font-normal">
                        {isHindi && documents.leftCard1.text.hi ? documents.leftCard1.text.hi : documents.leftCard1.text.en}
                      </p>
                    ) : (
                      documents.leftCard1.guideTag && (
                        <WireframeGuideBox
                          tag={documents.leftCard1.guideTag}
                          title={documents.leftCard1.guideTitle || ""}
                        />
                      )
                    )}
                  </div>
                </div>
              </div>

              {/* Card 2: Need the full list? */}
              <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs">
                <div className="flex items-start gap-4">
                  <div className="w-9 h-9 rounded-lg bg-black text-white flex items-center justify-center shrink-0">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-base font-black text-slate-900 mb-1.5">
                      {isHindi ? documents.leftCard2.title.hi : documents.leftCard2.title.en}
                    </h3>
                    <p className="text-xs sm:text-[13px] text-slate-600 leading-relaxed">
                      {documents.leftCard2.guideText}{" "}
                      <Link
                        href={documents.leftCard2.linkHref}
                        className="text-[#E31E24] hover:underline font-bold"
                      >
                        {documents.leftCard2.linkText}
                      </Link>
                      .
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Dark Checklist Card (Image 2) */}
            <div className="lg:col-span-5 text-left">
              <div className="bg-gradient-to-br from-[#1a1e29] to-[#0f121a] border border-slate-800 text-white rounded-3xl p-5 sm:p-7 lg:p-5 xl:p-8 shadow-2xl relative overflow-hidden">
                <div className="inline-block px-3 py-1 rounded-full bg-[#E31E24] text-white text-[10px] font-black uppercase tracking-wider mb-4">
                  {isHindi ? documents.helpCard.badge.hi : documents.helpCard.badge.en}
                </div>

                <h3 className="text-xl sm:text-2xl lg:text-xl xl:text-2xl font-black text-white mb-5 sm:mb-6 tracking-tight">
                  {isHindi ? documents.helpCard.title.hi : documents.helpCard.title.en}
                </h3>

                <ul className="space-y-3 sm:space-y-3.5 mb-6 sm:mb-8">
                  {documents.helpCard.points.map((point, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <div className="text-[#E31E24] shrink-0 mt-0.5">
                        <Check className="w-4 h-4 stroke-[3]" />
                      </div>
                      <span className="text-xs sm:text-sm text-slate-200 font-medium leading-relaxed">
                        {isHindi ? point.hi : point.en}
                      </span>
                    </li>
                  ))}
                </ul>

                <a
                  href={documents.helpCard.whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 bg-[#E31E24] hover:bg-[#c9181e] text-white font-bold text-xs sm:text-sm py-3.5 px-6 rounded-full shadow-lg transition-all w-full cursor-pointer"
                >
                  <span>{isHindi ? documents.helpCard.ctaText.hi : documents.helpCard.ctaText.en}</span>
                  <ArrowRight className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* ─────────────────────────────────────────────────────────────
          SECTION 7: SCRAP VALUE (Image 3 from prompt 2)
      ───────────────────────────────────────────────────────────── */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
        variants={sectionVariants}
        className="py-12 sm:py-16 lg:py-14 xl:py-20 bg-white text-slate-900 border-b border-slate-100 relative"
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <div className="text-left mb-6 sm:mb-8 max-w-4xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-red-300 text-[#E31E24] text-xs font-bold uppercase tracking-wider mb-3">
              <span>{isHindi ? scrapValue.badge.hi : scrapValue.badge.en}</span>
            </div>

            <h2 className="text-2xl sm:text-3xl lg:text-[30px] xl:text-[34px] font-black text-slate-900 tracking-tight leading-[1.25] mb-3">
              {isHindi ? scrapValue.h2Part1.hi : scrapValue.h2Part1.en}{" "}
              <span className="text-[#E31E24]">
                {isHindi ? scrapValue.h2Highlight.hi : scrapValue.h2Highlight.en}
              </span>
            </h2>

            {/* S-0 Intro Paragraph or Wireframe Box */}
            {scrapValue.introText ? (
              <p className="text-slate-600 text-[14px] sm:text-base leading-relaxed text-left mb-6 font-normal">
                {isHindi && scrapValue.introText.hi ? scrapValue.introText.hi : scrapValue.introText.en}
              </p>
            ) : (
              scrapValue.guide && (
                <WireframeGuideBox
                  tag={scrapValue.guide.tag}
                  title={scrapValue.guide.title}
                  sub={scrapValue.guide.keywords}
                />
              )
            )}
          </div>

          {/* 3-Column Valuation Factors Table (Image 3) */}
          <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden mb-4">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[480px] sm:min-w-full text-left border-collapse text-xs sm:text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200/80 text-slate-700 font-black text-[10px] sm:text-xs uppercase tracking-wider">
                    <th className="py-3 px-4 sm:py-4 sm:px-6 w-[28%] sm:w-[25%]">
                      {isHindi ? scrapValue.tableHeaders.factor.hi : scrapValue.tableHeaders.factor.en}
                    </th>
                    <th className="py-3 px-3 sm:py-4 sm:px-6 w-[34%] sm:w-[35%]">
                      {isHindi ? scrapValue.tableHeaders.check.hi : scrapValue.tableHeaders.check.en}
                    </th>
                    <th className="py-3 px-3 sm:py-4 sm:px-6 w-[38%] sm:w-[40%]">
                      {isHindi ? scrapValue.tableHeaders.impact.hi : scrapValue.tableHeaders.impact.en}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {scrapValue.factors.map((row, idx) => {
                    const FactorIcon = row.icon
                    return (
                      <tr key={idx} className="hover:bg-red-50/30 transition-colors">
                        <td className="py-3.5 px-4 sm:py-4 sm:px-6 font-bold text-slate-900 align-middle">
                          <div className="flex items-center gap-2.5 sm:gap-3">
                            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-red-50 text-[#E31E24] flex items-center justify-center shrink-0">
                              <FactorIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            </div>
                            <span className="text-xs sm:text-sm font-bold text-slate-900">
                              {isHindi ? row.factor.hi : row.factor.en}
                            </span>
                          </div>
                        </td>
                        <td className="py-3.5 px-3 sm:py-4 sm:px-6 text-slate-600 text-[11px] sm:text-[13px] leading-snug sm:leading-relaxed align-middle">
                          {isHindi ? row.check.hi : row.check.en}
                        </td>
                        <td className="py-3.5 px-3 sm:py-4 sm:px-6 text-slate-600 text-[11px] sm:text-[13px] leading-snug sm:leading-relaxed align-middle">
                          {isHindi ? row.impact.hi : row.impact.en}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex items-center gap-2 text-slate-500 text-xs text-left">
            <span>{isHindi ? scrapValue.note.hi : scrapValue.note.en}</span>
          </div>
        </div>
      </motion.section>

      {/* ─────────────────────────────────────────────────────────────
          SECTION 8: MORE IN KANPUR (Image 4 from prompt 2)
      ───────────────────────────────────────────────────────────── */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
        variants={sectionVariants}
        className="py-14 sm:py-20 bg-slate-50/60 text-slate-900 border-b border-slate-100 relative"
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <div className="text-left mb-8 sm:mb-10 max-w-4xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-black text-white text-[11px] font-black uppercase tracking-wider mb-3">
              <span className="w-2 h-2 rounded-full bg-[#E31E24]" />
              <span>{isHindi ? relatedPages.badge.hi : relatedPages.badge.en}</span>
            </div>

            <h2 className="text-2xl sm:text-3xl lg:text-[34px] font-black text-slate-900 tracking-tight leading-[1.25]">
              {isHindi ? relatedPages.h2Part1.hi : relatedPages.h2Part1.en}{" "}
              <span className="text-[#E31E24]">
                {isHindi ? relatedPages.h2Highlight.hi : relatedPages.h2Highlight.en}
              </span>
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {relatedPages.cards.map((card, idx) => {
              const CardIcon = card.icon
              return (
                <div
                  key={idx}
                  className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs flex flex-col justify-between text-left"
                >
                  <div>
                    <div className="w-10 h-10 rounded-lg bg-black text-white flex items-center justify-center mb-4">
                      <CardIcon className="w-5 h-5" />
                    </div>

                    <h3 className="text-lg font-black text-slate-900 mb-2">
                      {isHindi ? card.title.hi : card.title.en}
                    </h3>

                    {card.desc ? (
                      <p className="text-slate-600 text-xs sm:text-[13px] font-normal leading-relaxed mb-4">
                        {isHindi && card.desc.hi ? card.desc.hi : card.desc.en}
                      </p>
                    ) : (
                      card.guideTag && (
                        <WireframeGuideBox
                          tag={card.guideTag}
                          title={card.guideTitle || ""}
                        />
                      )
                    )}
                  </div>

                  <Link
                    href={card.href}
                    className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-black text-slate-900 hover:text-[#E31E24] transition-colors"
                  >
                    <span>{isHindi ? card.linkText.hi : card.linkText.en}</span>
                    <ArrowRight className="w-3.5 h-3.5 shrink-0" />
                  </Link>
                </div>
              )
            })}
          </div>
        </div>
      </motion.section>

      {/* ─────────────────────────────────────────────────────────────
          SECTION 9: GENERAL FAQs (Image 5 from prompt 2)
      ───────────────────────────────────────────────────────────── */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
        variants={sectionVariants}
        className="py-14 sm:py-20 bg-white text-slate-900 border-b border-slate-100 relative overflow-hidden"
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl relative z-10">
          <div className="text-left mb-6 sm:mb-8 max-w-4xl">
            <div className="text-xs font-black uppercase tracking-wider text-[#E31E24] mb-2">
              {isHindi ? faqs.overline.hi : faqs.overline.en}
            </div>

            <h2 className="text-2xl sm:text-3xl lg:text-[34px] font-black text-slate-900 tracking-tight leading-[1.25] mb-3">
              {isHindi ? faqs.h2Part1.hi : faqs.h2Part1.en}{" "}
              <span className="text-[#E31E24]">
                {isHindi ? faqs.h2Highlight.hi : faqs.h2Highlight.en}
              </span>
            </h2>

            <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
              {isHindi ? faqs.subtitle.textBeforeLink.hi : faqs.subtitle.textBeforeLink.en}{" "}
              <Link
                href={faqs.subtitle.linkHref}
                className="text-[#E31E24] hover:underline font-bold"
              >
                {isHindi ? faqs.subtitle.linkText.hi : faqs.subtitle.linkText.en}
              </Link>
              .
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: 8 Accordion Items (Image 5) */}
            <div className="lg:col-span-8 space-y-3">
              {faqs.items.map((faq, idx) => {
                const isOpen = openFaq === idx
                return (
                  <div
                    key={idx}
                    className="rounded-2xl transition-all duration-300 relative overflow-hidden bg-white border border-red-300/80 shadow-2xs"
                  >
                    <button
                      type="button"
                      onClick={() => toggleFaq(idx)}
                      className="w-full p-4 sm:p-5 flex items-center justify-between gap-3 sm:gap-4 text-left cursor-pointer transition-colors"
                    >
                      <div className="flex items-center gap-3 sm:gap-3.5">
                        <span className="w-8 h-8 rounded-xl bg-[#E31E24] text-white flex items-center justify-center text-xs sm:text-sm font-black shrink-0">
                          {idx + 1}
                        </span>
                        <span className="text-sm sm:text-[15px] font-bold text-slate-900 leading-snug">
                          {isHindi ? faq.qHi : faq.qEn}
                        </span>
                      </div>

                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-transform duration-300 ${
                          isOpen ? "rotate-180 text-[#E31E24]" : "text-slate-400"
                        }`}
                      >
                        <ChevronDown className="w-4 h-4 stroke-[2.5]" />
                      </div>
                    </button>

                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.25, ease: "easeInOut" }}
                          className="overflow-hidden"
                        >
                          <div className="px-4 pb-4 sm:px-5 sm:pb-5 pt-0 pl-4 sm:pl-16">
                            {faq.aEn ? (
                              <p className="text-slate-600 text-sm sm:text-[15px] font-normal leading-relaxed text-left">
                                {isHindi && faq.aHi ? faq.aHi : faq.aEn}
                              </p>
                            ) : (
                              faq.guideTag && (
                                <WireframeGuideBox
                                  tag={faq.guideTag}
                                  title={faq.guideTitle || ""}
                                  sub={faq.guideKeywords}
                                />
                              )
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )
              })}
            </div>

            {/* Right Column: Sticky Help Card (Image 5) */}
            <div className="lg:col-span-4 lg:sticky lg:top-24">
              <div className="bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-6 lg:p-5 xl:p-7 shadow-lg text-center relative overflow-hidden">
                {/* Soft Placeholder Art (Image 5) */}
                <div className="w-full h-24 sm:h-32 lg:h-24 xl:h-36 bg-gradient-to-br from-red-50 via-rose-50 to-orange-50/60 rounded-2xl mb-4 sm:mb-5 flex items-center justify-center">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white shadow-sm flex items-center justify-center text-[#E31E24]">
                    <Phone className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                </div>

                <h3 className="text-lg sm:text-xl font-black text-slate-900 mb-1.5">
                  {isHindi ? faqs.helpCard.title.hi : faqs.helpCard.title.en}
                </h3>

                <p className="text-slate-500 text-xs sm:text-[13px] leading-relaxed mb-5 sm:mb-6">
                  {isHindi ? faqs.helpCard.subtitle.hi : faqs.helpCard.subtitle.en}
                </p>

                <div className="space-y-2.5 sm:space-y-3">
                  <a
                    href={`tel:${faqs.helpCard.phoneTel}`}
                    className="w-full inline-flex items-center justify-center gap-2 bg-[#C53030] hover:bg-[#b02828] text-white text-xs sm:text-sm font-bold py-3 sm:py-3.5 px-4 rounded-full shadow-md active:scale-95 transition-all cursor-pointer"
                  >
                    <Phone className="w-4 h-4" />
                    <span>Call {faqs.helpCard.phoneDisplay}</span>
                  </a>

                  <a
                    href={faqs.helpCard.whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full inline-flex items-center justify-center gap-2 bg-white hover:bg-red-50 border border-red-300 text-[#C53030] text-xs sm:text-sm font-bold py-2.5 sm:py-3 px-4 rounded-full transition-all active:scale-95 cursor-pointer"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>WhatsApp Us</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* ─────────────────────────────────────────────────────────────
          SECTION 10: BOTTOM CTA BANNER (Image 1 from prompt 1)
      ───────────────────────────────────────────────────────────── */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.15 }}
        variants={sectionVariants}
        className="py-10 sm:py-14 lg:py-14 xl:py-16 bg-white text-slate-900"
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <div className="bg-[#E31E24] text-white rounded-3xl p-5 sm:p-8 lg:p-7 xl:p-12 shadow-xl relative overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-6 xl:gap-8 items-center relative z-10">
              <div className="lg:col-span-7 space-y-4 text-left">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-white text-[10px] sm:text-xs font-bold uppercase tracking-wider">
                  <span>{isHindi ? bottomCta.badge.hi : bottomCta.badge.en}</span>
                </div>

                <h2 className="text-2xl sm:text-3xl lg:text-[28px] xl:text-[38px] 2xl:text-5xl font-black text-white tracking-tight leading-tight">
                  {isHindi ? bottomCta.h2.hi : bottomCta.h2.en}
                </h2>

                <div className="space-y-1 text-white/90 text-sm sm:text-base leading-relaxed max-w-xl">
                  <p className="font-bold text-white">
                    {isHindi ? bottomCta.supportingIntro.hi : bottomCta.supportingIntro.en}
                  </p>
                  <p>
                    {isHindi ? bottomCta.supportingDesc.hi : bottomCta.supportingDesc.en}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2.5 pt-2">
                  {bottomCta.trustBadges.map((badge, idx) => {
                    const BadgeIcon = badge.icon
                    return (
                      <div
                        key={idx}
                        className="bg-black/25 border border-white/10 px-3 py-1.5 rounded-full text-[11px] sm:text-xs font-semibold flex items-center gap-1.5 text-white"
                      >
                        <BadgeIcon className="w-3.5 h-3.5 text-white" />
                        <span>{isHindi ? badge.text.hi : badge.text.en}</span>
                      </div>
                    )
                  })}
                </div>
              </div>

              <div className="lg:col-span-5">
                <div className="bg-white text-slate-900 rounded-3xl p-5 sm:p-7 lg:p-5 xl:p-8 shadow-2xl text-left">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 border border-red-100 text-[#E31E24] text-[10px] font-black uppercase tracking-wider mb-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#E31E24] animate-pulse" />
                    <span>{isHindi ? bottomCta.formBadge.hi : bottomCta.formBadge.en}</span>
                  </div>

                  <h3 className="text-xl sm:text-2xl font-black text-slate-900 mb-2 tracking-tight">
                    {isHindi ? bottomCta.formTitle.hi : bottomCta.formTitle.en}
                  </h3>
                  <p className="text-slate-500 text-xs sm:text-sm leading-relaxed mb-6">
                    {isHindi ? bottomCta.formSubtitle.hi : bottomCta.formSubtitle.en}
                  </p>

                  <div className="space-y-3">
                    {!bottomCta.hideVehicleInput && bottomCta.inputPlaceholder ? (
                      <form onSubmit={handleBottomFormSubmit} className="space-y-3">
                        <div>
                          <input
                            type="text"
                            value={vehicleNoInput}
                            onChange={(e) => setVehicleNoInput(e.target.value)}
                            placeholder={isHindi ? bottomCta.inputPlaceholder.hi : bottomCta.inputPlaceholder.en}
                            className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:border-[#E31E24] text-sm text-slate-800 placeholder-slate-400 font-medium tracking-wide uppercase"
                          />
                        </div>

                        <button
                          type="submit"
                          className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-6 bg-[#E31E24] hover:bg-[#C5161C] text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-lg shadow-red-500/25 transition-all active:scale-95 text-center cursor-pointer"
                        >
                          <span>{isHindi ? bottomCta.ctaButtonText.hi : bottomCta.ctaButtonText.en}</span>
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </form>
                    ) : (
                      <Link
                        href={hero.valuationLink || "/know-your-valuation?type=two-wheeler"}
                        className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-6 bg-[#E31E24] hover:bg-[#C5161C] text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-lg shadow-red-500/25 transition-all active:scale-95 text-center cursor-pointer"
                      >
                        <span>{isHindi ? bottomCta.ctaButtonText.hi : bottomCta.ctaButtonText.en}</span>
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    )}

                    <a
                      href={phoneConfig.whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full inline-flex items-center justify-center gap-2 py-3 px-6 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-800 font-bold text-xs sm:text-sm rounded-xl transition-all active:scale-95 text-center cursor-pointer"
                    >
                      <MessageCircle className="w-4 h-4 text-[#25D366]" />
                      <span>{isHindi ? bottomCta.whatsappButtonText.hi : bottomCta.whatsappButtonText.en}</span>
                    </a>
                  </div>

                  <p className="text-center text-[11px] text-slate-400 font-medium mt-4">
                    {isHindi ? bottomCta.guaranteeText.hi : bottomCta.guaranteeText.en}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.section>
    </div>
  )
}

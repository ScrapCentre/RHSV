"use client"

import { useEffect, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { useParams } from "next/navigation"
import Link from "next/link"
import { BLOG_POSTS, BlogPost } from "@/lib/blogData"
import {
  Calendar,
  CheckCircle2,
  HelpCircle,
  PhoneCall,
  Award,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
} from "lucide-react"

function renderFormattedText(text: string, linkClassName?: string) {
  const regex = /\[([^\]]+)\]\(([^)]+)\)/g
  const parts: (string | React.ReactNode)[] = []
  let lastIndex = 0
  let match: RegExpExecArray | null

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index))
    }
    const label = match[1]
    const url = match[2]

    parts.push(
      <Link
        key={match.index}
        href={url}
        target={url.startsWith("http") && !url.includes("scrapcentre.com") ? "_blank" : undefined}
        rel={url.startsWith("http") && !url.includes("scrapcentre.com") ? "noopener noreferrer" : undefined}
        className={linkClassName || "text-blue-600 hover:text-blue-800 underline font-semibold transition-colors"}
      >
        {label}
      </Link>
    )
    lastIndex = regex.lastIndex
  }

  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex))
  }

  return parts.length > 0 ? parts : text
}

export default function BlogDetailClient({ slug }: { slug: string }) {
  const params = useParams()
  const locale = (params?.locale as string) || "en"
  const isHindi = locale === "hi"

  const post: BlogPost | undefined =
    BLOG_POSTS.find((p) => p.slug === slug) || BLOG_POSTS[0]

  const [activeFaqTab, setActiveFaqTab] = useState<"english" | "hinglish">("english")
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0)
  const [showLoader, setShowLoader] = useState(true)

  useEffect(() => {
    const loaderTimeout = setTimeout(() => setShowLoader(false), 1200)
    return () => clearTimeout(loaderTimeout)
  }, [])

  if (!post) return null

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index)
  }

  const sectionVariants = {
    hidden: { opacity: 0, y: 25 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" as const },
    },
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
        delayChildren: 0.05,
      },
    },
  }

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.45, ease: "easeOut" as const },
    },
  }

  return (
    <div className="bg-[#F8FAFC] min-h-screen text-slate-900 overflow-x-hidden">
      {/* Brand Loading Screen Animation */}
      <AnimatePresence>
        {showLoader && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeInOut" as const }}
            className="fixed inset-0 bg-[#FFFFFF] flex items-center justify-center z-50 px-4"
          >
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6, ease: "backOut" as const }}
              className="text-center max-w-sm sm:max-w-md mx-auto"
            >
              <motion.img
                src="/logo.png"
                alt="ScrapCentre Logo"
                className="h-24 sm:h-36 md:h-52 mx-auto mb-6 object-contain"
                initial={{ rotate: -180, opacity: 0, scale: 0.5 }}
                animate={{ rotate: 0, opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, ease: "backOut" as const }}
              />
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="text-xl sm:text-3xl md:text-4xl font-bold tracking-tight"
              >
                <span className="text-[#E31E24]">Scrap</span>
                <span className="text-black">Centre.com</span>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {!showLoader && (
        <article className="pt-20 sm:pt-16 lg:pt-24 pb-12 sm:pb-20">
          <div className="container mx-auto px-3 xs:px-4 sm:px-6 lg:px-8 xl:px-12 max-w-7xl">
            
            {/* Blog Main Card Header */}
            <motion.header
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-white rounded-2xl p-5 sm:p-8 lg:p-10 border border-slate-200/90 shadow-sm mb-6 sm:mb-8 mt-4 sm:mt-0"
            >
              {/* Category & Metadata */}
              <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs font-bold text-slate-500 mb-3 sm:mb-4">
                <span className="bg-red-50 text-[#E31E24] px-2.5 py-1 rounded-full uppercase tracking-wider text-[10px] sm:text-xs font-black">
                  {post.category}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1 text-[11px] sm:text-xs">
                  <Calendar size={13} />
                  {post.date}
                </span>
              </div>

              {/* Title */}
              <h1 className="text-xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight leading-snug sm:leading-tight mb-3 sm:mb-4">
                {post.title}
              </h1>

              <p className="text-slate-600 text-xs sm:text-base lg:text-lg font-medium leading-relaxed">
                {post.subtitle}
              </p>
            </motion.header>

            {/* Featured Image */}
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="relative rounded-2xl overflow-hidden bg-white border border-slate-200 shadow-sm mb-6 sm:mb-10"
            >
              <img
                src={post.image}
                alt={post.title}
                className="w-full h-auto max-h-[460px] object-cover"
              />
            </motion.div>

            {/* Key Highlights Box */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.1 }}
              transition={{ duration: 0.5 }}
              className="bg-gradient-to-r from-red-50 via-white to-red-50 border-2 border-red-200/80 rounded-2xl p-5 sm:p-8 mb-6 sm:mb-10 shadow-sm"
            >
              <div className="text-[#E31E24] font-black text-sm sm:text-lg mb-3 sm:mb-4 uppercase tracking-wider">
                <span>Key Highlights</span>
              </div>
              <ul className="space-y-2.5 sm:space-y-3 text-slate-800 text-xs sm:text-base font-semibold">
                {post.keyHighlights.map((highlight, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 sm:gap-3">
                    <CheckCircle2 size={18} className="text-[#E31E24] shrink-0 mt-0.5" />
                    <span className="leading-relaxed sm:leading-snug">{highlight}</span>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Article Body Content */}
            <div className="bg-white rounded-2xl p-4 xs:p-5 sm:p-8 lg:p-10 border border-slate-200/90 shadow-sm space-y-8 sm:space-y-10 text-slate-800 font-normal text-xs sm:text-base">
              
              {/* Introduction */}
              <motion.div
                variants={sectionVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.1 }}
                className="space-y-3 sm:space-y-4"
              >
                {post.content.intro.map((para, idx) => (
                  <p key={idx} className="text-slate-700 leading-relaxed font-medium">
                    {renderFormattedText(para)}
                  </p>
                ))}
              </motion.div>

              <hr className="border-slate-100" />

              {/* What Is CoD */}
              <motion.section
                variants={sectionVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.1 }}
                className="space-y-3 sm:space-y-4"
              >
                <h2 className="text-lg sm:text-2xl font-black text-slate-900 tracking-tight">
                  {post.content.whatIsCod.title}
                </h2>
                {post.content.whatIsCod.paragraphs.map((p, idx) => (
                  <p key={idx} className="text-slate-700 leading-relaxed">
                    {renderFormattedText(p)}
                  </p>
                ))}
              </motion.section>

              <hr className="border-slate-100" />

              {/* How to Get CoD */}
              <motion.section
                variants={sectionVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.1 }}
                className="space-y-5 sm:space-y-6"
              >
                <h2 className="text-lg sm:text-2xl font-black text-slate-900 tracking-tight">
                  {post.content.howToGet.title}
                </h2>
                <p className="text-slate-700 font-medium leading-relaxed">
                  {post.content.howToGet.intro}
                </p>

                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, amount: 0.1 }}
                  className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4"
                >
                  {post.content.howToGet.steps.map((step) => (
                    <motion.div
                      key={step.number}
                      variants={cardVariants}
                      whileHover={{ y: -3 }}
                      className="bg-slate-50 border border-slate-200 rounded-xl p-4 sm:p-5 hover:border-[#E31E24] transition-all"
                    >
                      <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-[#E31E24] text-white font-black text-xs sm:text-sm flex items-center justify-center mb-2.5 sm:mb-3">
                        0{step.number}
                      </div>
                      <h3 className="font-bold text-slate-900 text-sm sm:text-base mb-1">
                        {step.title}
                      </h3>
                      <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                        {step.desc}
                      </p>
                    </motion.div>
                  ))}
                </motion.div>

                <p className="text-slate-700 italic bg-amber-50 border border-amber-200/80 p-3.5 sm:p-4 rounded-xl text-xs sm:text-sm leading-relaxed">
                  {post.content.howToGet.summaryNote}
                </p>
              </motion.section>

              <hr className="border-slate-100" />

              {/* Validity */}
              <motion.section
                variants={sectionVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.1 }}
                className="space-y-3 sm:space-y-4"
              >
                <h2 className="text-lg sm:text-2xl font-black text-slate-900 tracking-tight">
                  {post.content.validity.title}
                </h2>
                <p className="text-slate-700 font-medium leading-relaxed">
                  {post.content.validity.intro}
                </p>

                <div className="space-y-2.5 sm:space-y-3 bg-slate-50 border border-slate-200 rounded-xl p-4 sm:p-5">
                  {post.content.validity.points.map((pt, idx) => (
                    <div key={idx} className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                      <span className="font-black text-slate-900 text-xs sm:text-sm min-w-28 uppercase tracking-wider text-[#E31E24]">
                        • {pt.label}:
                      </span>
                      <span className="text-slate-700 text-xs sm:text-sm font-medium leading-relaxed">
                        {pt.text}
                      </span>
                    </div>
                  ))}
                </div>
              </motion.section>

              <hr className="border-slate-100" />

              {/* Road Tax Rebate & Table */}
              <motion.section
                variants={sectionVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.1 }}
                className="space-y-3 sm:space-y-4"
              >
                <h2 className="text-lg sm:text-2xl font-black text-slate-900 tracking-tight">
                  {post.content.roadTaxRebate.title}
                </h2>
                {post.content.roadTaxRebate.paragraphs.map((p, idx) => (
                  <p key={idx} className="text-slate-700 leading-relaxed">
                    {renderFormattedText(p)}
                  </p>
                ))}

                {/* Table with horizontal scroll on mobile */}
                <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-xs my-3 sm:my-4">
                  <table className="w-full min-w-[320px] text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-900 text-white text-[11px] sm:text-xs font-bold uppercase tracking-wider">
                        <th className="p-3 sm:p-4">Vehicle Type</th>
                        <th className="p-3 sm:p-4">Maximum Concession</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 text-xs sm:text-sm font-medium">
                      {post.content.roadTaxRebate.nationalTable.map((row, idx) => (
                        <tr key={idx} className={idx % 2 === 0 ? "bg-white" : "bg-slate-50"}>
                          <td className="p-3 sm:p-4 font-bold text-slate-900">{row.category}</td>
                          <td className="p-3 sm:p-4 text-[#E31E24] font-extrabold">{row.concession}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {post.content.roadTaxRebate.details.map((d, idx) => (
                  <p key={idx} className="text-slate-700 text-xs sm:text-sm leading-relaxed">
                    {d}
                  </p>
                ))}
              </motion.section>

              <hr className="border-slate-100" />

              {/* UP Concession & Hyundai Creta Example */}
              <motion.section
                variants={sectionVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.1 }}
                className="space-y-5 sm:space-y-6"
              >
                <h2 className="text-lg sm:text-2xl font-black text-slate-900 tracking-tight">
                  {post.content.upConcession.title}
                </h2>
                {post.content.upConcession.paragraphs.map((p, idx) => {
                  if (p.includes("(Source)")) {
                    const parts = p.split("(Source)")
                    return (
                      <p key={idx} className="text-slate-700 leading-relaxed">
                        {parts[0]}
                        <a
                          href="https://www.abplive.com/auto/uttar-pradesh-1-lakh-95-thousand-old-vehicles-scrap-policy-till-30-june-2026-know-details-3163217?utm_source=chatgpt.com"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#E31E24] hover:underline font-bold"
                        >
                          (Source)
                        </a>
                        {parts[1]}
                      </p>
                    )
                  }
                  return (
                    <p key={idx} className="text-slate-700 leading-relaxed">
                      {p}
                    </p>
                  )
                })}

                {/* Creta Example Box */}
                <div className="bg-slate-900 text-white rounded-2xl p-4 sm:p-8 space-y-4 sm:space-y-5 shadow-lg">
                  <h3 className="text-base sm:text-xl font-black text-emerald-400">
                    {post.content.upConcession.cretaExample.title}
                  </h3>
                  <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
                    {post.content.upConcession.cretaExample.intro}
                  </p>

                  {/* Creta Breakdown Table with Mobile Overflow Scroll */}
                  <div className="overflow-x-auto rounded-xl border border-slate-700 bg-slate-800">
                    <table className="w-full min-w-[400px] text-left border-collapse text-xs sm:text-sm">
                      <thead>
                        <tr className="bg-slate-950 text-slate-300 font-bold uppercase tracking-wider border-b border-slate-700 text-[10px] sm:text-xs">
                          <th className="p-2.5 sm:p-4">Benefit or Payment</th>
                          <th className="p-2.5 sm:p-4 text-right">Estimated Amount</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-700 font-medium">
                        {post.content.upConcession.cretaExample.table.map((row, idx) => {
                          const isTotal = idx === post.content.upConcession.cretaExample.table.length - 1
                          return (
                            <tr
                              key={idx}
                              className={isTotal ? "bg-emerald-950/80 font-black text-emerald-400 text-xs sm:text-sm" : "hover:bg-slate-800/80"}
                            >
                              <td className="p-2.5 sm:p-4">{row.item}</td>
                              <td className="p-2.5 sm:p-4 text-right whitespace-nowrap">{row.amount}</td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>

                  <div className="space-y-1.5 text-[11px] sm:text-xs text-slate-400 leading-relaxed border-t border-slate-800 pt-3 sm:pt-4">
                    {post.content.upConcession.cretaExample.notes.map((n, idx) => (
                      <p key={idx}>* {n}</p>
                    ))}
                  </div>
                </div>
              </motion.section>

              <hr className="border-slate-100" />

              {/* Other Benefits */}
              <motion.section
                variants={sectionVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.1 }}
                className="space-y-3 sm:space-y-4"
              >
                <h2 className="text-lg sm:text-2xl font-black text-slate-900 tracking-tight">
                  {post.content.otherBenefits.title}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  {post.content.otherBenefits.points.map((item, idx) => (
                    <div key={idx} className="bg-slate-50 border border-slate-200 p-3.5 sm:p-4 rounded-xl">
                      <h3 className="font-bold text-slate-900 text-xs sm:text-sm mb-1 flex items-center gap-2">
                        <Award size={16} className="text-[#E31E24] shrink-0" />
                        {item.name}
                      </h3>
                      <p className="text-slate-600 text-xs leading-relaxed">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </motion.section>

              <hr className="border-slate-100" />

              {/* Comparison Table */}
              <motion.section
                variants={sectionVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.1 }}
                className="space-y-3 sm:space-y-4"
              >
                <h2 className="text-lg sm:text-2xl font-black text-slate-900 tracking-tight">
                  {post.content.comparison.title}
                </h2>
                <p className="text-slate-700 font-medium leading-relaxed">
                  {post.content.comparison.intro}
                </p>

                <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-xs my-3 sm:my-4">
                  <table className="w-full min-w-[340px] text-left border-collapse text-xs sm:text-sm">
                    <thead>
                      <tr className="bg-slate-900 text-white font-bold uppercase tracking-wider text-[10px] sm:text-xs">
                        <th className="p-3 sm:p-4 w-5/12 sm:w-1/3">Certificate</th>
                        <th className="p-3 sm:p-4">Purpose</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {post.content.comparison.table.map((row, idx) => (
                        <tr key={idx} className={idx % 2 === 0 ? "bg-white" : "bg-slate-50"}>
                          <td className="p-3 sm:p-4 font-bold text-slate-900">{row.type}</td>
                          <td className="p-3 sm:p-4 text-slate-700 leading-relaxed">{row.purpose}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {post.content.comparison.explanation.map((e, idx) => (
                  <p key={idx} className="text-slate-700 text-xs sm:text-sm leading-relaxed">
                    {e}
                  </p>
                ))}
              </motion.section>

              <hr className="border-slate-100" />

              {/* RVSF vs Kabadi */}
              <motion.section
                variants={sectionVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.1 }}
                className="space-y-3 sm:space-y-4"
              >
                <h2 className="text-lg sm:text-2xl font-black text-slate-900 tracking-tight">
                  {post.content.rvsfVsKabadi.title}
                </h2>
                {post.content.rvsfVsKabadi.paragraphs.map((p, idx) => (
                  <p key={idx} className="text-slate-700 leading-relaxed">
                    {renderFormattedText(p)}
                  </p>
                ))}
              </motion.section>

              <hr className="border-slate-100" />

              {/* CTA Banner Section */}
              <motion.section
                initial={{ opacity: 0, scale: 0.97 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, amount: 0.1 }}
                transition={{ duration: 0.5 }}
                className="bg-gradient-to-r from-red-600 via-[#E31E24] to-red-700 text-white rounded-2xl p-5 sm:p-8 space-y-4 shadow-xl"
              >
                <div className="flex items-center gap-2.5 sm:gap-3">
                  <ShieldCheck size={26} className="text-white shrink-0" />
                  <h2 className="text-lg sm:text-2xl font-black tracking-tight">
                    {post.content.callToAction.title}
                  </h2>
                </div>
                {post.content.callToAction.paragraphs.map((p, idx) => (
                  <p key={idx} className="text-red-50 text-xs sm:text-sm leading-relaxed">
                    {renderFormattedText(p, "text-green-300 hover:text-green-100 underline font-bold transition-colors")}
                  </p>
                ))}

                <div className="pt-3 sm:pt-4 flex flex-col sm:flex-row gap-3 sm:gap-4 items-stretch sm:items-center">
                  <Link
                    href={isHindi ? "/hi/free-valuation" : "/free-valuation"}
                    className="bg-white hover:bg-slate-100 text-[#E31E24] font-black text-xs sm:text-sm px-5 sm:px-6 py-3 sm:py-3.5 rounded-xl text-center shadow-md transition-all active:scale-95"
                  >
                    Check Your Vehicle Value with ScrapCentre
                  </Link>
                  <a
                    href={`https://wa.me/919839447733?text=${encodeURIComponent(
                      "Hello ScrapCentre, I want to inquire about Certificate of Deposit (CoD) and scrapping my vehicle."
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs sm:text-sm px-5 sm:px-6 py-3 sm:py-3.5 rounded-xl text-center shadow-md transition-all active:scale-95 flex items-center justify-center gap-2"
                  >
                    <PhoneCall size={16} />
                    <span>WhatsApp: {post.content.callToAction.whatsapp}</span>
                  </a>
                </div>
              </motion.section>

              {/* FAQs Accordion */}
              <motion.section
                variants={sectionVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.1 }}
                className="space-y-5 sm:space-y-6 pt-2 sm:pt-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 border-b border-slate-200 pb-4">
                  <div className="flex items-center gap-2">
                    <HelpCircle size={20} className="text-[#E31E24] shrink-0" />
                    <h2 className="text-lg sm:text-2xl font-black text-slate-900 tracking-tight">
                      Frequently Asked Questions (FAQs)
                    </h2>
                  </div>
                  
                  {/* Tab Switcher */}
                  <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl self-start sm:self-auto text-xs font-bold">
                    <button
                      onClick={() => {
                        setActiveFaqTab("english")
                        setOpenFaqIndex(0)
                      }}
                      className={`px-3 py-1.5 rounded-lg transition-all ${
                        activeFaqTab === "english"
                          ? "bg-white text-slate-900 shadow-xs"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      English FAQs
                    </button>
                    <button
                      onClick={() => {
                        setActiveFaqTab("hinglish")
                        setOpenFaqIndex(0)
                      }}
                      className={`px-3 py-1.5 rounded-lg transition-all ${
                        activeFaqTab === "hinglish"
                          ? "bg-white text-slate-900 shadow-xs"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      Hinglish FAQs
                    </button>
                  </div>
                </div>

                {/* FAQ List */}
                <div className="space-y-2.5 sm:space-y-3">
                  {(activeFaqTab === "english"
                    ? post.content.faqs.english
                    : post.content.faqs.hinglish
                  ).map((faq, idx) => {
                    const isOpen = openFaqIndex === idx
                    return (
                      <div
                        key={idx}
                        className="border border-slate-200 rounded-xl overflow-hidden bg-slate-50/50 transition-all"
                      >
                        <button
                          onClick={() => toggleFaq(idx)}
                          className="w-full text-left p-3.5 sm:p-4 flex items-center justify-between gap-3 font-bold text-slate-900 text-xs sm:text-base hover:text-[#E31E24] transition-colors leading-snug"
                        >
                          <span>{faq.q}</span>
                          {isOpen ? (
                            <ChevronUp size={18} className="shrink-0 text-[#E31E24]" />
                          ) : (
                            <ChevronDown size={18} className="shrink-0 text-slate-400" />
                          )}
                        </button>
                        {isOpen && (
                          <div className="px-3.5 sm:px-4 pb-3.5 sm:pb-4 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-200/60 pt-3 bg-white">
                            {faq.a}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </motion.section>

            </div>
          </div>
        </article>
      )}
    </div>
  )
}

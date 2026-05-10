"use client"
import { motion, useInView, AnimatePresence } from "framer-motion"
import { useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { Car, ShoppingCart, Calculator, ArrowRight, CheckCircle, Star, Zap, Shield } from "lucide-react"
import Image from "next/image"
import ValuationWizardCard from "./ValuationWizardCard"
import BuyNewWizardCard from "./BuyNewWizardCard"
import SellOldWizardCard from "./SellOldWizardCard"

// ─── Tab configuration ───────────────────────────────────────────────────────

type TabKey = "sell" | "buy" | "valuation"

interface ServiceTab {
  key: TabKey
  label: string
  icon: React.ReactNode
  accent: string
  accentBg: string
  accentBorder: string
  tagColor: string
}

const TABS: ServiceTab[] = [
  {
    key: "sell",
    label: "Sell Old Vehicle",
    icon: <Car className="w-4 h-4" />,
    accent: "text-emerald-400",
    accentBg: "bg-emerald-500/10",
    accentBorder: "border-emerald-500/30",
    tagColor: "text-emerald-400 border-emerald-500/30 bg-[#0E192D]",
  },
  {
    key: "valuation",
    label: "Get Free Valuation",
    icon: <Calculator className="w-4 h-4" />,
    accent: "text-violet-400",
    accentBg: "bg-violet-500/10",
    accentBorder: "border-violet-500/30",
    tagColor: "text-violet-400 border-violet-500/30 bg-[#0E192D]",
  },
  {
    key: "buy",
    label: "Buy New Vehicle",
    icon: <ShoppingCart className="w-4 h-4" />,
    accent: "text-blue-400",
    accentBg: "bg-blue-500/10",
    accentBorder: "border-blue-500/30",
    tagColor: "text-blue-400 border-blue-500/30 bg-[#0E192D]",
  },
]

// ─── Service card data per tab ────────────────────────────────────────────────

interface ServiceCard {
  title: string
  description: string
  image: string
  tag: string
  features: string[]
  ctaLabel: string
  route: string
}

const CARDS: Record<TabKey, ServiceCard[]> = {
  sell: [
    {
      title: "Sell Old Vehicle",
      description: "Get the best scrap value for your end-of-life vehicle instantly with our transparent pricing. Quick inspection, zero paperwork hassle, and same-day payment guaranteed.",
      image: "/frontpage/selloldvehicle.jpg",
      tag: "Best Value",
      features: ["Instant Quote", "Free Pickup", "Same-day Payment", "200+ Point Check", "Legal Clearance", "Certificate of Deposit"],
      ctaLabel: "Sell Now",
      route: "/services/sell-vehicle",
    },
  ],
  buy: [
    {
      title: "Buy New Vehicle",
      description: "Purchase a brand new vehicle with exclusive facility benefits and scrap trade-in offers. Benefit from partner discounts and easy financing options.",
      image: "/frontpage/buynewvehicle.jpg",
      tag: "Exclusive Deal",
      features: ["Partner Discounts", "Easy Financing", "Trade-in Bonus", "B2B Discounts", "Multi-vehicle Deals", "Priority Processing"],
      ctaLabel: "Explore Vehicles",
      route: "/services/buy-vehicle",
    },
  ],
  valuation: [
    {
      title: "Get Free Valuation",
      description: "Get an instant, accurate estimate for your vehicle using our AI-driven pricing engine. Or book a free doorstep inspection for a certified professional valuation.",
      image: "/frontpage/selloldvehicle.jpg",
      tag: "Instant & Free",
      features: ["Live Market Rates", "No Obligation", "Results in 60 seconds", "200+ Checkpoints", "Doorstep Visit", "Certified Report"],
      ctaLabel: "Check My Car Value",
      route: "/quote",
    },
  ],
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function TabToggle({ active, onChange }: { active: TabKey; onChange: (k: TabKey) => void }) {
  return (
    <div className="inline-flex items-center bg-[#0b1628] border border-slate-700/60 rounded-2xl p-1.5 gap-1 shadow-[0_0_40px_rgba(0,0,0,0.4)] backdrop-blur-xl">
      {TABS.map((tab) => {
        const isActive = active === tab.key
        return (
          <button
            key={tab.key}
            onClick={() => onChange(tab.key)}
            className={`
              relative flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold
              transition-all duration-300 outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50
              ${isActive
                ? "text-white shadow-md"
                : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
              }
            `}
          >
            {/* Active pill */}
            {isActive && (
              <motion.span
                layoutId="active-tab-pill"
                className={`absolute inset-0 rounded-xl ${tab.accentBg} border ${tab.accentBorder}`}
                transition={{ type: "spring", stiffness: 380, damping: 32 }}
              />
            )}
            <span className={`relative z-10 ${isActive ? tab.accent : ""}`}>{tab.icon}</span>
            <span className="relative z-10 hidden sm:inline">{tab.label}</span>
            {/* Mobile short label */}
            <span className="relative z-10 sm:hidden">
              {tab.key === "sell" ? "Sell" : tab.key === "buy" ? "Buy" : "Value"}
            </span>
          </button>
        )
      })}
    </div>
  )
}

function FeatureChip({ label, accent }: { label: string; accent: string }) {
  return (
    <span className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full bg-white/5 border border-white/10 ${accent}`}>
      <CheckCircle className="w-3 h-3" />
      {label}
    </span>
  )
}

function Card({
  card,
  index,
  tab,
}: {
  card: ServiceCard
  index: number
  tab: ServiceTab
}) {
  const router = useRouter()

  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.45, delay: index * 0.12, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="group relative w-full"
    >
      <div
        onClick={() => router.push(card.route)}
        className={`
          relative w-full bg-[#0b1628] border border-slate-800
          hover:border-opacity-60 rounded-[24px] overflow-hidden cursor-pointer
          transition-all duration-500 hover:-translate-y-2
          hover:shadow-[0_24px_64px_rgba(0,0,0,0.5)]
          flex flex-col
        `}
        style={{ boxShadow: "10px 10px 30px rgba(0,0,0,0.3)" }}
      >
        {/* Glow accent on hover */}
        <div className={`absolute inset-0 rounded-[24px] opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none ${tab.accentBg}`} style={{ filter: "blur(40px)", transform: "scale(0.85)" }} />

        {/* Image */}
        <div className="relative w-full h-[150px] overflow-hidden rounded-t-[24px] bg-slate-800">
          <Image
            src={card.image || "/placeholder.svg"}
            alt={card.title}
            fill
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
          />
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0b1628]/80 via-transparent to-transparent" />

          {/* Tag badge */}
          <div className={`absolute top-4 left-4 flex items-center gap-1.5 px-3 py-1.5 rounded-full border shadow-md text-[11px] font-bold uppercase tracking-wider ${tab.tagColor}`}>
            <Star className="w-3 h-3 fill-current" />
            {card.tag}
          </div>
        </div>

        {/* Body */}
        <div className="p-5 flex flex-col gap-4 relative z-10 flex-1">
          <div>
            <h3 className="text-lg font-bold text-white group-hover:text-white/95 tracking-tight leading-snug mb-1.5">
              {card.title}
            </h3>
            <p className="text-sm text-slate-400 leading-relaxed line-clamp-2">{card.description}</p>
          </div>

          {/* Feature chips */}
          <div className="flex flex-wrap gap-2">
            {card.features.map((f) => (
              <FeatureChip key={f} label={f} accent={tab.accent} />
            ))}
          </div>

          {/* CTA row */}
          <div className="flex items-center justify-between pt-3 mt-auto border-t border-slate-800/80">
            <span className={`text-xs font-bold uppercase tracking-widest ${tab.accent}`}>{card.ctaLabel}</span>
            <div className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:rotate-[-45deg] shadow-sm ${tab.accentBg} border ${tab.accentBorder}`}>
              <ArrowRight className={`w-4 h-4 ${tab.accent}`} />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

// ─── Main section ─────────────────────────────────────────────────────────────

export default function ServicesSection() {
  const [activeTab, setActiveTab] = useState<TabKey>("sell")
  const containerRef = useRef<HTMLDivElement>(null)
  const isInView = useInView(containerRef, { once: false, amount: 0.1 })

  const currentTab = TABS.find((t) => t.key === activeTab)!
  const currentCards = CARDS[activeTab]

  // Key stat badges that update per tab
  const statMap: Record<TabKey, { icon: React.ReactNode; label: string }[]> = {
    sell: [
      { icon: <Zap className="w-3.5 h-3.5 text-emerald-400" />, label: "Instant Payment" },
      { icon: <Shield className="w-3.5 h-3.5 text-emerald-400" />, label: "Seller Protection" },
      { icon: <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />, label: "Free Pickup" },
    ],
    buy: [
      { icon: <Zap className="w-3.5 h-3.5 text-blue-400" />, label: "Exclusive Offers" },
      { icon: <Shield className="w-3.5 h-3.5 text-blue-400" />, label: "Verified Dealers" },
      { icon: <CheckCircle className="w-3.5 h-3.5 text-blue-400" />, label: "Easy Financing" },
    ],
    valuation: [
      { icon: <Zap className="w-3.5 h-3.5 text-violet-400" />, label: "60-Second Result" },
      { icon: <Shield className="w-3.5 h-3.5 text-violet-400" />, label: "AI-Powered" },
      { icon: <CheckCircle className="w-3.5 h-3.5 text-violet-400" />, label: "Completely Free" },
    ],
  }

  return (
    <section id="services" className="bg-[#162236] py-8 md:py-12 relative overflow-hidden" ref={containerRef}>
      {/* Background glows */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[120px] -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-blue-900/8 rounded-full blur-[120px] translate-x-1/3 translate-y-1/3 pointer-events-none" />

      <div className="container mx-auto px-4 md:px-6 relative z-10">

        {/* ── Section Header ── */}
        <div className="text-center mb-6">
          <motion.h2
            className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-3"
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.6 }}
          >
            Explore{" "}
            <span className="bg-gradient-to-r from-emerald-400 to-teal-500 bg-clip-text text-transparent">
              Services
            </span>
          </motion.h2>
          <motion.p
            className="text-slate-400 text-base md:text-lg max-w-xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.6, delay: 0.15 }}
          >
            Choose the perfect service option for your needs
          </motion.p>
        </div>

        {/* ── Toggle ── */}
        <motion.div
          className="flex justify-center mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6, delay: 0.25 }}
        >
          <TabToggle active={activeTab} onChange={setActiveTab} />
        </motion.div>


        {/* ── Card (single, centered) ── */}
        <div className="max-w-2xl mx-auto">
          <AnimatePresence mode="wait">
            {activeTab === "sell" ? (
              <motion.div
                key="sell-wizard"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
              >
                <SellOldWizardCard />
              </motion.div>
            ) : activeTab === "valuation" ? (
              <motion.div
                key="valuation-wizard"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
              >
                <ValuationWizardCard />
              </motion.div>
            ) : activeTab === "buy" ? (
              <motion.div
                key="buy-wizard"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
              >
                <BuyNewWizardCard />
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>

        {/* ── Bottom CTA link ── */}
        <motion.div
          className="text-center mt-12"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <p className="text-slate-500 text-sm">
            Not sure which service to choose?{" "}
            <a href="/contact" className={`font-semibold underline underline-offset-2 ${currentTab.accent} hover:opacity-80 transition-opacity`}>
              Talk to an expert →
            </a>
          </p>
        </motion.div>

      </div>
    </section>
  )
}

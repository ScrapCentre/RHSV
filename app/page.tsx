"use client"

/**
 * Homepage — ScrapCentre.com
 * MODIFIED: replaced 800ms loader + old components with new design-system §4.1 landing.
 * Removes: HomexHero, ServicesSection, WelcomePopup, 800ms artificial loader.
 * Adds: HeroSection, EntryQuestionnaire, FounderVideoBlock, HowItWorksSection, ComingSoonTile,
 *       GrowWithUs (restyled), FAQSection, ReviewSection.
 * Routing: EntryQuestionnaire → /calculator?type=A|B|C
 */

import { useRouter } from "next/navigation"
import HeroSection from "@/components/HeroSection"
import EntryQuestionnaire from "@/components/EntryQuestionnaire"
import FeaturesSection from "@/components/FeaturesSection"
import ValuationCTA from "@/components/ValuationCTA"
import FAQSection from "@/components/FAQSection"
import ReviewSection from "@/components/ReviewSection"
import GrowWithUs from "@/components/GrowWithUs"

// FounderVideoBlock — inline, no component created by FE
function FounderVideoBlock() {
  return (
    <section className="py-16 px-4 bg-white">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl md:text-3xl font-bold text-[var(--brand-black)] mb-4">
          Why I started ScrapCentre.com
        </h2>
        <p className="text-[var(--brand-gray-700)] mb-6 text-base leading-relaxed max-w-2xl">
          The kabadi offered my neighbour ₹12,000 for his 2007 Honda City. The government scheme
          was worth ₹84,000. Nobody told him. That changes now.
        </p>
        <div className="rounded-2xl overflow-hidden bg-[var(--brand-gray-100)] flex items-center justify-center h-64 border border-[var(--brand-gray-300)]">
          {/* TODO[fullstack-dev]: replace with real YouTube embed once founder supplies video URL.
              For now show placeholder with dialog trigger. */}
          <div className="text-center px-6">
            <div className="w-16 h-16 bg-[var(--brand-red)] rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
            <p className="text-sm font-medium text-[var(--brand-gray-500)]">
              Video coming soon — Dr. Pranjal explains the full picture
            </p>
            <p className="text-xs text-[var(--brand-gray-500)] mt-1">Watch the 45-second explanation →</p>
          </div>
        </div>
      </div>
    </section>
  )
}

// HowItWorksSection — three steps inline
function HowItWorksSection() {
  const steps = [
    {
      num: "1",
      title: "Enter your vehicle details",
      desc: "Registration number or make/model/year. We look up the rest automatically.",
    },
    {
      num: "2",
      title: "Get your exact value",
      desc: "Scrap value, Certificate of Deposit, road tax saving — shown with real numbers.",
    },
    {
      num: "3",
      title: "Free pickup, cash + CD",
      desc: "Our team comes to you. Cash paid on the day. CD issued for your next vehicle.",
    },
  ]
  return (
    <section className="py-16 px-4 bg-[var(--brand-red-xlight)]">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-2xl md:text-3xl font-bold text-[var(--brand-black)] mb-10 text-center">
          How it works
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {steps.map((step) => (
            <div key={step.num} className="card-base text-center">
              <div className="w-10 h-10 rounded-full bg-[var(--brand-red)] text-white font-extrabold flex items-center justify-center mx-auto mb-4 text-lg">
                {step.num}
              </div>
              <h3 className="text-lg font-bold text-[var(--brand-black)] mb-2">{step.title}</h3>
              <p className="text-sm text-[var(--brand-gray-700)]">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ComingSoonTilesSection — Green Finance, Green Insurance, Dealer Discount
function ComingSoonTilesSection() {
  const tiles = [
    {
      name: "Green Finance",
      range: "₹12,000–₹28,000 over 5 years",
      note: "Banking partner conversations in progress.",
    },
    {
      name: "Green Insurance",
      range: "₹3,000–₹8,000",
      note: "Insurance partner tie-ups underway.",
    },
    {
      name: "Dealer Discount (3–5%)",
      range: "₹18,000–₹45,000",
      note: "Expected once SIAM partnership lands.",
    },
  ]
  return (
    <section className="py-16 px-4 bg-white">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-2xl font-bold text-[var(--brand-black)] mb-2">Coming soon</h2>
        <p className="text-[var(--brand-gray-500)] mb-8 text-sm">
          These benefits are being activated one by one. Customers who register now get notified first.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {tiles.map((tile) => (
            <div key={tile.name} className="card-locked p-6">
              <span className="badge-coming">Coming Soon</span>
              <p className="text-sm font-medium text-[var(--brand-gray-500)] mt-2">{tile.name}</p>
              <p className="text-2xl font-bold text-[var(--brand-gray-300)] mt-1">{tile.range}</p>
              <p className="text-xs text-[var(--brand-gray-500)] mt-2">{tile.note}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default function Home() {
  const router = useRouter()

  return (
    <div className="bg-[var(--brand-bg)] min-h-screen text-[var(--brand-gray-700)]">
      {/* Hero — calculator-forward, red background */}
      <HeroSection />

      {/* Entry questionnaire — routes to /calculator?type=A|B|C */}
      <section className="py-10 px-4 bg-white border-t border-[var(--brand-gray-300)]">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-xl font-bold text-[var(--brand-black)] mb-6 text-center">
            Tell us about your situation
          </h2>
          <EntryQuestionnaire
            onRoute={(href) => router.push(href)}
          />
        </div>
      </section>

      {/* Founder video / trust block */}
      <FounderVideoBlock />

      {/* How it works */}
      <HowItWorksSection />

      {/* Review carousel */}
      <ReviewSection />

      {/* Coming soon tiles */}
      <ComingSoonTilesSection />

      {/* Features */}
      <FeaturesSection />

      {/* Partner RVSF CTA */}
      <GrowWithUs />

      {/* Calculator hook CTA */}
      <ValuationCTA />

      {/* FAQ */}
      <FAQSection variant="red" />
    </div>
  )
}

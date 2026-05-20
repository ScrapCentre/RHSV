"use client"

/**
 * EntryQuestionnaire — ScrapCentre.com
 * NEW component per design-system §4.2, §4.3, §4.1, §6.
 * Two-question routing widget embedded in the homepage and as a standalone page.
 * Derives customer type (A/B/C/browse) and calls onRoute with the result.
 * Used by: app/page.tsx (homepage, inline below hero)
 *
 * Routing logic (design-system §4.3):
 *   Scrap Yes + Buy Yes → Type B (/calculator?type=B)
 *   Scrap Yes + Buy No  → Type A (/calculator?type=A)
 *   Scrap No  + Buy Yes → Type C (/calculator?type=C)
 *   Scrap No  + Buy No  → browse (homepage)
 *
 * Props:
 *   onRoute: (href: string) => void  — called when user clicks final CTA
 */

import { useState } from "react"
import { Button } from "@/components/ui/button"
import QuestionCard from "@/components/QuestionCard"
import { ChevronRight } from "lucide-react"

interface EntryQuestionnaireProps {
  onRoute: (href: string) => void
  className?: string
}

type YesNo = "yes" | "no" | ""

export default function EntryQuestionnaire({
  onRoute,
  className = "",
}: EntryQuestionnaireProps) {
  const [scrapping, setScrapping] = useState<YesNo>("")
  const [buying, setBuying] = useState<YesNo>("")

  const isComplete = scrapping !== "" && buying !== ""

  const handleSubmit = () => {
    let href = "/"
    if (scrapping === "yes" && buying === "yes") href = "/calculator?type=B"
    else if (scrapping === "yes" && buying === "no") href = "/calculator?type=A"
    else if (scrapping === "no" && buying === "yes") href = "/calculator?type=C"
    else href = "/"
    onRoute(href)
  }

  return (
    <section
      className={`bg-white rounded-2xl shadow-md border border-[var(--brand-gray-300)] p-6 space-y-6 ${className}`}
      aria-label="Tell us about your situation"
    >
      <div>
        <h2 className="text-lg font-bold text-[var(--brand-black)]">
          Tell us about your situation
        </h2>
        <p className="text-sm text-[var(--brand-gray-500)] mt-1">
          Your answers shape what we show you next.
        </p>
      </div>

      {/* Q1 */}
      <QuestionCard
        question="Are you scrapping an old vehicle?"
        step="Step 1 of 2"
        value={scrapping}
        onChange={(v) => setScrapping(v as YesNo)}
        options={[
          {
            value: "yes",
            label: "Yes — I have an old vehicle I want to scrap",
            description: "Car, bike, truck, or any registered vehicle",
          },
          {
            value: "no",
            label: "No — I'm just researching or buying",
          },
        ]}
      />

      {/* Q2 — always visible so user can fill in any order */}
      <QuestionCard
        question="And are you planning to buy a new vehicle?"
        step="Step 2 of 2"
        value={buying}
        onChange={(v) => setBuying(v as YesNo)}
        options={[
          {
            value: "yes",
            label: "Yes — I want to buy a new vehicle (car or bike)",
            description:
              "Your CD benefit is highest when combined with a new vehicle purchase.",
          },
          {
            value: "no",
            label: "No — I just want to scrap my old one",
          },
        ]}
      />

      {/* Helper copy (design-system §4.3) */}
      <p className="text-xs text-[var(--brand-gray-500)]">
        Your answer affects your total savings. Scrapping + buying gives you the highest combined
        benefit through the Certificate of Deposit.
      </p>

      <Button
        onClick={handleSubmit}
        disabled={!isComplete}
        className="w-full h-14 text-base font-semibold bg-[var(--brand-red)] hover:bg-[var(--brand-red-dark)] text-white disabled:opacity-50"
        aria-label="Show me what I get"
      >
        Show Me What I Get →
        <ChevronRight className="w-4 h-4 ml-1" aria-hidden="true" />
      </Button>
    </section>
  )
}

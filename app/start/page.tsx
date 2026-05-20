"use client"

/**
 * /start — Entry Questionnaire Page — ScrapCentre.com
 * NEW page per engineering-design §13, design-system §4.2–4.3.
 * Full-screen modal variant of the two-question routing questionnaire.
 * Uses: EntryQuestionnaire, QuestionCard (via EntryQuestionnaire)
 * Routes to: /calculator?type=A|B|C, /start/commercial
 */

import { useRouter, useSearchParams } from "next/navigation"
import { Suspense } from "react"
import Link from "next/link"
import EntryQuestionnaire from "@/components/EntryQuestionnaire"

function StartPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const intent = searchParams.get("intent") // sell | buy | both — from redirect

  return (
    <div className="min-h-screen bg-[var(--brand-bg)] flex flex-col">
      {/* Back nav */}
      <div className="px-4 py-4 border-b border-[var(--brand-gray-300)] bg-white">
        <Link
          href="/"
          className="text-sm text-[var(--brand-gray-500)] hover:text-[var(--brand-red)] flex items-center gap-1 w-fit"
        >
          ← Back to home
        </Link>
      </div>

      {/* Content */}
      <main className="flex-1 flex items-start justify-center px-4 py-10">
        <div className="w-full max-w-xl">
          <h1 className="text-2xl md:text-3xl font-extrabold text-[var(--brand-black)] mb-2">
            Let&apos;s figure out your best options.
          </h1>
          <p className="text-[var(--brand-gray-500)] mb-8 text-sm">
            Two quick questions — then we show you exactly what you stand to gain.
          </p>

          <EntryQuestionnaire onRoute={(href) => router.push(href)} />

          {/* Commercial / fleet sub-option */}
          <div className="mt-6 pt-6 border-t border-[var(--brand-gray-300)]">
            <p className="text-sm text-[var(--brand-gray-500)] mb-2">Other situations:</p>
            <Link
              href="/start/commercial"
              className="text-sm text-[var(--brand-red)] hover:underline font-medium"
            >
              Commercial vehicle or fleet? Request a tailored quote →
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}

export default function StartPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-[var(--brand-red)]" />
        </div>
      }
    >
      <StartPageContent />
    </Suspense>
  )
}

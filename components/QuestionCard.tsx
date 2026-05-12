"use client"

/**
 * QuestionCard — ScrapCentre.com
 * NEW component per design-system §4.2, §4.3.
 * Single-question card used inside EntryQuestionnaire.
 * Renders a heading, optional icon, and a RadioGroup of options.
 * Used by: EntryQuestionnaire
 *
 * Props:
 *   question: string
 *   options: Array<{ value: string; label: string; description?: string }>
 *   value: string  — selected value
 *   onChange: (value: string) => void
 *   step?: string  — e.g. "Step 1 of 2"
 */

import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { CheckCircle } from "lucide-react"

interface QuestionOption {
  value: string
  label: string
  description?: string
}

interface QuestionCardProps {
  question: string
  options: QuestionOption[]
  value: string
  onChange: (value: string) => void
  step?: string
  className?: string
}

export default function QuestionCard({
  question,
  options,
  value,
  onChange,
  step,
  className = "",
}: QuestionCardProps) {
  return (
    <div className={`space-y-4 ${className}`}>
      {step && (
        <p className="text-xs font-medium text-[var(--brand-gray-500)] uppercase tracking-wider">
          {step}
        </p>
      )}
      <h3 className="text-xl font-bold text-[var(--brand-black)] leading-snug">
        {question}
      </h3>

      <RadioGroup
        value={value}
        onValueChange={onChange}
        className="space-y-3"
        aria-label={question}
      >
        {options.map((opt) => {
          const isSelected = value === opt.value
          return (
            <Label
              key={opt.value}
              htmlFor={`opt-${opt.value}`}
              className={`flex items-center gap-3 rounded-xl border-2 p-4 cursor-pointer transition-colors ${
                isSelected
                  ? "border-[var(--brand-red)] bg-[var(--brand-red-light)]"
                  : "border-[var(--brand-gray-300)] hover:border-[var(--brand-red-light)] hover:bg-[var(--brand-red-xlight)]"
              }`}
            >
              <RadioGroupItem
                value={opt.value}
                id={`opt-${opt.value}`}
                className="border-[var(--brand-red)] text-[var(--brand-red)] shrink-0"
              />
              <div className="flex-1">
                <span className="text-sm font-semibold text-[var(--brand-black)]">
                  {opt.label}
                </span>
                {opt.description && (
                  <p className="text-xs text-[var(--brand-gray-500)] mt-0.5">
                    {opt.description}
                  </p>
                )}
              </div>
              {isSelected && (
                <CheckCircle
                  className="w-5 h-5 text-[var(--brand-red)] shrink-0"
                  aria-hidden="true"
                />
              )}
            </Label>
          )
        })}
      </RadioGroup>
    </div>
  )
}

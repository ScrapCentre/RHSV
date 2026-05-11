"use client"

/**
 * OTPInput — ScrapCentre.com
 * NEW component per design-system §4.9, §8, §10.
 * Wraps shadcn input-otp with:
 *   - autocomplete="one-time-code" for Android SMS autofill / iOS suggestions
 *   - inputmode="numeric"
 *   - auto-submit on 6th digit entry
 *   - Resend OTP countdown (45-second cooldown)
 * Used by: calculator Tier 2 OTP flow, login page
 *
 * Props:
 *   value: string (6 chars)
 *   onChange: (val: string) => void
 *   onComplete: () => void  — fires when all 6 digits entered
 *   onResend: () => void
 *   phoneDisplay: string  — "+91 98765 43210" for the label
 *   isVerifying: boolean
 */

import { useState, useEffect } from "react"
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp"
import { Button } from "@/components/ui/button"

interface OTPInputProps {
  value: string
  onChange: (val: string) => void
  onComplete: () => void
  onResend: () => void
  phoneDisplay?: string
  isVerifying?: boolean
}

const RESEND_COOLDOWN_SECONDS = 45

export default function OTPInput({
  value,
  onChange,
  onComplete,
  onResend,
  phoneDisplay,
  isVerifying = false,
}: OTPInputProps) {
  const [secondsLeft, setSecondsLeft] = useState(RESEND_COOLDOWN_SECONDS)
  const [canResend, setCanResend] = useState(false)

  // Countdown for resend link
  useEffect(() => {
    if (canResend) return
    const interval = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          setCanResend(true)
          clearInterval(interval)
          return 0
        }
        return s - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [canResend])

  const handleResend = () => {
    onResend()
    setSecondsLeft(RESEND_COOLDOWN_SECONDS)
    setCanResend(false)
  }

  return (
    <div className="flex flex-col items-center gap-5">
      <div className="text-center">
        <p className="text-sm font-medium text-[var(--brand-gray-700)]">
          Enter the 6-digit code we sent to{" "}
          {phoneDisplay ? (
            <span className="font-semibold text-[var(--brand-black)]">{phoneDisplay}</span>
          ) : (
            "your number"
          )}
        </p>
        <p className="text-xs text-[var(--brand-gray-500)] mt-1">
          Didn&apos;t receive it? Check spam, or resend below.
        </p>
      </div>

      {/* shadcn input-otp — 6 digits (design-system §4.9, §8) */}
      <InputOTP
        maxLength={6}
        value={value}
        onChange={(val) => {
          onChange(val)
          if (val.length === 6) onComplete()
        }}
        /* SMS autofill on Android; iOS suggestions bar */
        autoComplete="one-time-code"
        inputMode="numeric"
        aria-label="6-digit OTP"
      >
        <InputOTPGroup>
          <InputOTPSlot index={0} />
          <InputOTPSlot index={1} />
          <InputOTPSlot index={2} />
          <InputOTPSlot index={3} />
          <InputOTPSlot index={4} />
          <InputOTPSlot index={5} />
        </InputOTPGroup>
      </InputOTP>

      {/* Verify button — enabled when 6 digits entered */}
      <Button
        className="w-full h-14 text-base font-semibold bg-[var(--brand-red)] hover:bg-[var(--brand-red-dark)] text-white disabled:opacity-50"
        disabled={value.length < 6 || isVerifying}
        aria-label="Verify OTP code"
      >
        {isVerifying ? "Verifying…" : "Verify →"}
      </Button>

      {/* Resend link (design-system §4.9) */}
      <div className="text-center text-sm">
        {canResend ? (
          <button
            onClick={handleResend}
            className="text-[var(--brand-red)] font-medium underline hover:no-underline"
          >
            Resend OTP
          </button>
        ) : (
          <p className="text-[var(--brand-gray-500)]">
            Resend OTP in{" "}
            <span className="font-semibold text-[var(--brand-gray-700)]">0:{String(secondsLeft).padStart(2, "0")}</span>
          </p>
        )}
      </div>
    </div>
  )
}

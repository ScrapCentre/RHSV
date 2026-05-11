"use client"

/**
 * /login — Login Page — ScrapCentre.com
 * MODIFIED: reduced from 647L → ~200L per design-system §4.14.
 * Keeps multi-portal (Customer OTP / Customer Email / RVSF Partner) but makes it sane.
 * Removed: "Use demo OTP 1234" label from visible UI.
 * Auth: NextAuth signIn with "credentials" and "phone-otp" providers.
 * Uses: OTPInput, shadcn Tabs
 */

import React, { useState, useEffect, Suspense } from "react"
import { signIn, getSession } from "next-auth/react"
import { Loader2, Eye, EyeOff } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
import { useSearchParams, useRouter } from "next/navigation"
import OTPInput from "@/components/OTPInput"
import Image from "next/image"

function LoginContent() {
  const { toast } = useToast()
  const searchParams = useSearchParams()
  const router = useRouter()

  const [tab, setTab] = useState<"customer" | "partner">(
    searchParams.get("tab") === "b2b" ? "partner" : "customer"
  )
  const [loginMethod, setLoginMethod] = useState<"phone" | "email">("phone")

  // Phone OTP state
  const [phone, setPhone] = useState("")
  const [otp, setOtp] = useState("")
  const [otpSent, setOtpSent] = useState(false)
  const [isSendingOtp, setIsSendingOtp] = useState(false)

  // Email state
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPw, setShowPw] = useState(false)

  // B2B state
  const [b2bUserId, setB2bUserId] = useState("")
  const [b2bPassword, setB2bPassword] = useState("")
  const [showB2bPw, setShowB2bPw] = useState(false)

  const [isLoading, setIsLoading] = useState(false)

  // Handle NextAuth URL errors
  useEffect(() => {
    const error = searchParams.get("error")
    if (!error) return
    const msgs: Record<string, string> = {
      CredentialsSignin: "Invalid credentials provided.",
      OAuthAccountNotLinked: "Email already in use with a different login method.",
      AccessDenied: "Access denied.",
    }
    toast({
      title: "Authentication Error",
      description: msgs[error] ?? "An unexpected error occurred during login.",
      variant: "destructive",
    })
  }, [searchParams, toast])

  async function postSignInRedirect() {
    const session = await getSession()
    const role = (session?.user as any)?.role
    const callbackUrl = searchParams.get("callbackUrl")
    if (callbackUrl) { window.location.href = callbackUrl; return }
    if (role === "admin") window.location.href = "/admin"
    else if (role === "partner") window.location.href = "/b2b/marketplace"
    else if (role === "executive") window.location.href = "/executive"
    else window.location.href = "/"
  }

  async function handleSendOtp() {
    if (phone.length !== 10) {
      toast({ title: "Invalid number", description: "Enter a valid 10-digit mobile number.", variant: "destructive" })
      return
    }
    setIsSendingOtp(true)
    try {
      const res = await fetch("/api/otp/issue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      })
      const d = await res.json()
      if (!res.ok) throw new Error(d.error ?? "OTP send failed")
      setOtpSent(true)
      toast({ title: `OTP sent to +91 ${phone.slice(0, 5)} XXXXX`, description: d._demoHint ?? "Check your messages." })
    } catch (err: any) {
      toast({ title: err.message, variant: "destructive" })
    } finally {
      setIsSendingOtp(false)
    }
  }

  async function handlePhoneVerify() {
    if (otp.length !== 6) return
    setIsLoading(true)
    try {
      const result = await signIn("phone-otp", { phone, otp, redirect: false })
      if (result?.error) {
        toast({ title: "Wrong code", description: "That code doesn't match. Try again, or request a new one.", variant: "destructive" })
        setOtp("")
      } else {
        toast({ title: "Signed in successfully." })
        await postSignInRedirect()
      }
    } finally {
      setIsLoading(false)
    }
  }

  async function handleEmailSignIn(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)
    try {
      const result = await signIn("credentials", { email, password, redirect: false })
      if (result?.error) {
        toast({ title: "Invalid credentials provided.", variant: "destructive" })
      } else {
        await postSignInRedirect()
      }
    } finally {
      setIsLoading(false)
    }
  }

  async function handlePartnerSignIn(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)
    try {
      const result = await signIn("b2b-credentials", { userId: b2bUserId, password: b2bPassword, redirect: false })
      if (result?.error) {
        toast({ title: "Invalid partner credentials.", variant: "destructive" })
      } else {
        window.location.href = "/b2b/marketplace"
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[var(--brand-bg)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-md border border-[var(--brand-gray-300)] p-8">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <Link href="/">
            <Image src="/brand/logo.png" alt="ScrapCentre.com" width={160} height={50} className="h-10 w-auto object-contain" />
          </Link>
        </div>

        <h1 className="text-xl font-bold text-center text-[var(--brand-black)] mb-1">
          Sign in to ScrapCentre.com
        </h1>
        <p className="text-sm text-center text-[var(--brand-gray-500)] mb-6">
          New customer?{" "}
          <Link href="/calculator" className="text-[var(--brand-red)] hover:underline">
            Start by getting your vehicle&apos;s value →
          </Link>
        </p>

        {/* Tab bar */}
        <div className="flex rounded-xl border border-[var(--brand-gray-300)] overflow-hidden mb-6">
          {(["customer", "partner"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-2.5 text-sm font-semibold transition-colors ${
                tab === t
                  ? "bg-[var(--brand-red)] text-white"
                  : "bg-white text-[var(--brand-gray-700)] hover:bg-[var(--brand-gray-100)]"
              }`}
            >
              {t === "customer" ? "Customer" : "RVSF Partner"}
            </button>
          ))}
        </div>

        {/* Customer tab */}
        {tab === "customer" && (
          <div className="space-y-4">
            {/* Method toggle */}
            <div className="flex gap-2 text-sm">
              <button onClick={() => setLoginMethod("phone")} className={`flex-1 py-2 rounded-lg border font-medium transition-colors ${loginMethod === "phone" ? "border-[var(--brand-red)] text-[var(--brand-red)] bg-[var(--brand-red-xlight)]" : "border-[var(--brand-gray-300)] text-[var(--brand-gray-500)] hover:bg-[var(--brand-gray-100)]"}`}>
                Mobile OTP
              </button>
              <button onClick={() => setLoginMethod("email")} className={`flex-1 py-2 rounded-lg border font-medium transition-colors ${loginMethod === "email" ? "border-[var(--brand-red)] text-[var(--brand-red)] bg-[var(--brand-red-xlight)]" : "border-[var(--brand-gray-300)] text-[var(--brand-gray-500)] hover:bg-[var(--brand-gray-100)]"}`}>
                Email
              </button>
            </div>

            {loginMethod === "phone" && !otpSent && (
              <div>
                <label className="block text-sm font-medium text-[var(--brand-gray-700)] mb-1">Your mobile number</label>
                <div className="flex mb-3">
                  <span className="inline-flex items-center px-3 bg-[var(--brand-gray-100)] border border-r-0 border-[var(--brand-gray-300)] rounded-l-xl text-sm text-[var(--brand-gray-500)]">+91</span>
                  <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))} inputMode="numeric" placeholder="98765 43210" className="flex-1 h-11 px-3 border border-[var(--brand-gray-300)] rounded-r-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand-red)] bg-white" />
                </div>
                <button onClick={handleSendOtp} disabled={isSendingOtp || phone.length !== 10} className="w-full h-11 bg-[var(--brand-red)] hover:bg-[var(--brand-red-dark)] disabled:opacity-50 text-white font-semibold rounded-xl flex items-center justify-center gap-2 text-sm transition-colors">
                  {isSendingOtp ? <Loader2 className="w-4 h-4 animate-spin" /> : null} Send OTP →
                </button>
              </div>
            )}

            {loginMethod === "phone" && otpSent && (
              <div>
                <p className="text-sm text-[var(--brand-gray-700)] mb-3">Enter the 6-digit code we sent to +91 {phone.slice(0, 5)} XXXXX</p>
                <OTPInput value={otp} onChange={setOtp} onComplete={handlePhoneVerify} onResend={handleSendOtp} phoneDisplay={`+91 ${phone}`} isVerifying={isLoading} />
                <button onClick={handlePhoneVerify} disabled={isLoading || otp.length !== 6} className="mt-3 w-full h-11 bg-[var(--status-success)] hover:brightness-105 disabled:opacity-50 text-white font-semibold rounded-xl flex items-center justify-center gap-2 text-sm transition-colors">
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : null} Verify →
                </button>
              </div>
            )}

            {loginMethod === "email" && (
              <form onSubmit={handleEmailSignIn} className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-[var(--brand-gray-700)] mb-1">Email</label>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="w-full h-11 px-3 border border-[var(--brand-gray-300)] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand-red)] bg-white" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--brand-gray-700)] mb-1">Password</label>
                  <div className="relative">
                    <input type={showPw ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="w-full h-11 px-3 pr-10 border border-[var(--brand-gray-300)] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand-red)] bg-white" />
                    <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--brand-gray-500)]">{showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
                  </div>
                </div>
                <button type="submit" disabled={isLoading} className="w-full h-11 bg-[var(--brand-red)] hover:bg-[var(--brand-red-dark)] disabled:opacity-50 text-white font-semibold rounded-xl flex items-center justify-center gap-2 text-sm transition-colors">
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : null} Sign In
                </button>
              </form>
            )}

            <div className="relative my-4">
              <div className="border-t border-[var(--brand-gray-300)]" />
              <span className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-center"><span className="bg-white px-2 text-xs text-[var(--brand-gray-500)]">or</span></span>
            </div>

            <button onClick={() => signIn("google", { callbackUrl: "/" })} className="w-full h-11 border border-[var(--brand-gray-300)] rounded-xl text-sm font-medium text-[var(--brand-gray-700)] hover:bg-[var(--brand-gray-100)] flex items-center justify-center gap-2 transition-colors">
              <svg className="w-4 h-4" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
              Continue with Google
            </button>
          </div>
        )}

        {/* Partner tab */}
        {tab === "partner" && (
          <form onSubmit={handlePartnerSignIn} className="space-y-4">
            <p className="text-sm text-[var(--brand-gray-500)]">RVSF Partner Login</p>
            <div>
              <label className="block text-sm font-medium text-[var(--brand-gray-700)] mb-1">Your partner ID (e.g., B2X001)</label>
              <input type="text" value={b2bUserId} onChange={(e) => setB2bUserId(e.target.value)} placeholder="B2X001" className="w-full h-11 px-3 border border-[var(--brand-gray-300)] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand-red)] bg-white" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--brand-gray-700)] mb-1">Password</label>
              <div className="relative">
                <input type={showB2bPw ? "text" : "password"} value={b2bPassword} onChange={(e) => setB2bPassword(e.target.value)} placeholder="••••••••" className="w-full h-11 px-3 pr-10 border border-[var(--brand-gray-300)] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand-red)] bg-white" />
                <button type="button" onClick={() => setShowB2bPw(!showB2bPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--brand-gray-500)]">{showB2bPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
              </div>
            </div>
            <button type="submit" disabled={isLoading} className="w-full h-11 bg-[var(--brand-red)] hover:bg-[var(--brand-red-dark)] disabled:opacity-50 text-white font-semibold rounded-xl flex items-center justify-center gap-2 text-sm transition-colors">
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : null} Sign In as Partner
            </button>
            <p className="text-xs text-center text-[var(--brand-gray-500)]">
              Not a partner yet?{" "}
              <Link href="/partner-register" className="text-[var(--brand-red)] hover:underline">Register here</Link>
            </p>
          </form>
        )}
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-[var(--brand-red)]" /></div>}>
      <LoginContent />
    </Suspense>
  )
}

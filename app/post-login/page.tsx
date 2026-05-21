// Post-login dispatcher: looks at session.user.role and forwards to the
// role-appropriate landing page. Replaces the previous default of landing
// every role on the homepage after login.
"use client"

import { useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { landingForRole } from "@/lib/landing-by-role"

export default function PostLogin() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === "loading") return
    if (status === "unauthenticated") {
      router.replace("/login")
      return
    }
    const role = (session?.user as any)?.role
    router.replace(landingForRole(role))
  }, [status, session, router])

  return (
    <div className="h-screen w-full flex items-center justify-center">
      <p className="text-brand-gray-500">Signing you in…</p>
    </div>
  )
}

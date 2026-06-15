"use client"

import { SessionProvider, useSession } from "next-auth/react"
import { useRouter, usePathname } from "next/navigation"
import { useEffect } from "react"

function PasswordGuard({ children }: { children: React.ReactNode }) {
    const { data: session, status } = useSession()
    const router = useRouter()
    const pathname = usePathname()

    useEffect(() => {
        if (status === "loading") return

        if (session?.user && (session.user as any).mustChangePassword) {
            if (pathname !== "/recreate-password" && !pathname.startsWith("/api/")) {
                router.replace("/recreate-password")
            }
        }
    }, [session, status, pathname, router])

    const isMustChange = session?.user && (session.user as any).mustChangePassword
    if (status === "authenticated" && isMustChange && pathname !== "/recreate-password") {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#0E192D]">
                <div className="flex flex-col items-center space-y-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
                    <p className="text-white font-semibold">Redirecting to password reset...</p>
                </div>
            </div>
        )
    }

    return <>{children}</>
}

export default function AuthProvider({ children }: { children: React.ReactNode }) {
    return (
        <SessionProvider>
            <PasswordGuard>{children}</PasswordGuard>
        </SessionProvider>
    )
}


"use client"

import { usePathname } from "next/navigation"
import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"
import LoginPopup from "@/components/LoginPopup"
import WhatsAppFloatingButton from "@/components/WhatsAppFloatingButton"

export default function AdminAwareLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname()
    const isAdmin = pathname?.startsWith("/admin") || pathname?.startsWith("/b2b")

    return (
        <div className="min-h-screen bg-background text-foreground">
            {!isAdmin && <Navbar />}
            <main className="relative">
                {children}
            </main>
            {!isAdmin && pathname !== "/login" && <Footer />}

            {!isAdmin && <LoginPopup />}
            {!isAdmin && <WhatsAppFloatingButton />}
        </div>
    )
}


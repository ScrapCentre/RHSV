"use client"

import { usePathname } from "next/navigation"
import Script from "next/script"
import { useEffect } from "react"

/**
 * Google Analytics 4 tracking component.
 * Excludes tracking on /admin/* and /partner/* routes.
 * Tracks route changes automatically.
 */
export default function GoogleAnalytics() {
    const pathname = usePathname()

    // Google Analytics Measurement ID
    const GA_MEASUREMENT_ID = "G-CWNMVTX4QR"

    useEffect(() => {
        if (!pathname || pathname.startsWith("/admin") || pathname.startsWith("/partner")) {
            return
        }

        // @ts-ignore
        if (typeof window.gtag === "function") {
            // @ts-ignore
            window.gtag("config", GA_MEASUREMENT_ID, {
                page_path: pathname,
            })
        }
    }, [pathname])

    // Check if current route should be excluded from tracking
    const isExcludedRoute =
        pathname?.startsWith("/admin") || pathname?.startsWith("/partner")

    // Return null if on an excluded route to prevent script loading
    if (isExcludedRoute) return null

    return (
        <>
            {/* Global site tag (gtag.js) - Google Analytics */}
            <Script
                strategy="afterInteractive"
                src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
            />
            <Script
                id="google-analytics"
                strategy="afterInteractive"
                dangerouslySetInnerHTML={{
                    __html: `
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());

          gtag('config', '${GA_MEASUREMENT_ID}', {
            page_path: window.location.pathname,
          });
        `,
                }}
            />
        </>
    )
}

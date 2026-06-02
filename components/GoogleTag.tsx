"use client"

import { usePathname } from "next/navigation"
import Script from "next/script"
import { useEffect } from "react"

/**
 * Google Tag (gtag.js) tracking component.
 * Excludes tracking on admin, executive, rvsf, cc, and b2b portals.
 * Tracks route changes automatically.
 */
export default function GoogleTag() {
    const pathname = usePathname()

    // Google Tag Measurement ID
    const GA_MEASUREMENT_ID = "G-5ZE8NH9VJZ"

    useEffect(() => {
        if (
            !pathname ||
            pathname.startsWith("/admin") ||
            pathname.startsWith("/executive") ||
            pathname.startsWith("/rvsf") ||
            pathname.startsWith("/cc") ||
            pathname.startsWith("/b2b")
        ) {
            return
        }

        // @ts-expect-error - gtag is added globally by the Google Tag script
        if (typeof window.gtag === "function") {
            // @ts-expect-error - gtag is added globally by the Google Tag script
            window.gtag("config", GA_MEASUREMENT_ID, {
                page_path: pathname,
            })
        }
    }, [pathname])

    // Check if current route should be excluded from tracking
    const isExcludedRoute =
        !pathname ||
        pathname.startsWith("/admin") ||
        pathname.startsWith("/executive") ||
        pathname.startsWith("/rvsf") ||
        pathname.startsWith("/cc") ||
        pathname.startsWith("/b2b")

    // Return null if on an excluded route to prevent script loading
    if (isExcludedRoute) return null

    return (
        <>
            {/* Global site tag (gtag.js) - Google Tag */}
            <Script
                strategy="afterInteractive"
                src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
            />
            <Script
                id="google-tag-gtag"
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

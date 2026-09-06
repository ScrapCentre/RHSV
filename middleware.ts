/**
 * middleware.ts — Next.js Edge Middleware
 *
 * Execution order (two-layer pipeline):
 *
 * ┌─────────────────────────────────────────────────────────────────┐
 * │ LAYER 1 — Burst Rate Limiter (runs on EVERY matched request)    │
 * │                                                                 │
 * │  • In-memory sliding window: > 120 req/min per IP → 429        │
 * │  • NextAuth internal routes (/api/auth/session|csrf|providers)  │
 * │    are whitelisted and pass straight through.                   │
 * │  • If blocked → return 429 immediately. Locale logic never runs.│
 * └───────────────────────────┬─────────────────────────────────────┘
 *                             │ allowed
 *                             ▼
 * ┌─────────────────────────────────────────────────────────────────┐
 * │ LAYER 2 — next-intl Locale Middleware (runs on PAGE routes only)│
 * │                                                                 │
 * │  • Applies ONLY when the pathname is NOT one of the excluded    │
 * │    prefixes (/api, /admin, /executive, /cc, /personal, /ekyc,  │
 * │    /register, /login, /partner-register, /recreate-password,   │
 * │    /_next, /rvsf, /rvsf_leads, /scrapcentre, /benefits,       │
 * │    /career, /terms, /services, or a static file extension).    │
 * │  • /profile IS intentionally included (it is now a localized   │
 * │    route). Its own server-side auth guard still runs separately.│
 * │  • localeDetection: false → never auto-redirects based on the  │
 * │    browser Accept-Language header (protects SEO).              │
 * └─────────────────────────────────────────────────────────────────┘
 *
 * Per-endpoint precise limits (Layer 2.5) are still enforced inside
 * individual route handlers via the MongoDB-backed rateLimit() helper
 * in lib/rate-limit.ts — that layer is unaffected by this file.
 */

import { NextRequest, NextResponse } from "next/server";
import createMiddleware from "next-intl/middleware";
import { routing } from "@/i18n/routing";

// ─── next-intl locale middleware instance ────────────────────────────────────
const intlMiddleware = createMiddleware(routing);

// ─── Paths that should NEVER be processed by locale middleware ────────────────
// These are all non-localized routes that live outside app/[locale]/.
const LOCALE_EXCLUDED_PREFIXES = [
    "/api/",
    "/admin",
    "/executive",
    "/cc",
    "/personal",
    "/ekyc",
    "/register",
    "/login",
    "/partner-register",
    "/recreate-password",
    "/rvsf",
    "/rvsf_leads",
    "/scrapcentre",
    "/benefits",
    "/career",
    "/terms",
    "/services",
    "/_next",
    "/favicon",
    "/logo",
    "/apple-touch",
    "/site.webmanifest",
];

// Static file extensions — skip locale logic for these too
const STATIC_EXT_RE = /\.(?:ico|png|jpg|jpeg|gif|svg|webp|avif|js|css|woff2?|ttf|otf|map)$/i;

/** Returns true if the pathname should bypass locale middleware. */
function isLocaleExcluded(pathname: string): boolean {
    if (STATIC_EXT_RE.test(pathname)) return true;
    return LOCALE_EXCLUDED_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

// ─── In-memory sliding window store ──────────────────────────────────────────
// Keyed by IP. Each entry: { count, windowStart }
// This is per-instance (Edge Runtime), so it protects against bursts
// within a single instance. Cross-instance protection is handled by MongoDB.
const BURST_WINDOW_MS = 60_000;     // 1 minute
const BURST_MAX = 120;              // requests per window per IP

interface WindowEntry {
    count: number;
    windowStart: number;
}

const ipWindows = new Map<string, WindowEntry>();

// Cleanup stale entries every 5 minutes to prevent memory growth
let lastCleanup = Date.now();
function cleanupStaleEntries() {
    const now = Date.now();
    if (now - lastCleanup < 5 * 60_000) return;
    lastCleanup = now;
    for (const [key, entry] of ipWindows.entries()) {
        if (now - entry.windowStart > BURST_WINDOW_MS) {
            ipWindows.delete(key);
        }
    }
}

function getClientIpFromMiddleware(req: NextRequest): string {
    return (
        req.headers.get("cf-connecting-ip") ||
        req.headers.get("x-real-ip") ||
        req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
        "unknown"
    );
}

function checkBurstLimit(ip: string): boolean {
    const now = Date.now();
    cleanupStaleEntries();

    const entry = ipWindows.get(ip);

    if (!entry || now - entry.windowStart > BURST_WINDOW_MS) {
        // New window
        ipWindows.set(ip, { count: 1, windowStart: now });
        return true; // allowed
    }

    entry.count += 1;

    if (entry.count > BURST_MAX) {
        return false; // blocked
    }

    return true; // allowed
}

// ─── Middleware ───────────────────────────────────────────────────────────────

export function middleware(req: NextRequest) {
    const { pathname } = req.nextUrl;

    // ── LAYER 1: Burst Rate Limiter ──────────────────────────────────────────
    // Whitelist NextAuth internal routes — these must never be throttled
    // (session polling, CSRF token fetches hit these on every page load).
    const isNextAuthInternal =
        pathname.startsWith("/api/auth/session") ||
        pathname.startsWith("/api/auth/csrf") ||
        pathname.startsWith("/api/auth/providers");

    if (!isNextAuthInternal) {
        const ip = getClientIpFromMiddleware(req);
        const allowed = checkBurstLimit(ip);

        if (!allowed) {
            return NextResponse.json(
                {
                    error: "Too many requests",
                    message: "You are sending too many requests. Please slow down and try again in a minute.",
                    retryAfter: 60,
                },
                {
                    status: 429,
                    headers: {
                        "Retry-After": "60",
                        "X-RateLimit-Limit": String(BURST_MAX),
                        "X-RateLimit-Remaining": "0",
                    },
                }
            );
        }
    }

    // ── LAYER 2: next-intl Locale Middleware ─────────────────────────────────
    // Only run on page routes that belong to the [locale] segment.
    // All excluded prefixes (API, admin, non-localized pages) pass through.
    if (!isLocaleExcluded(pathname)) {
        return intlMiddleware(req);
    }

    return NextResponse.next();
}

// ─── Matcher ─────────────────────────────────────────────────────────────────
// Covers:
//   • All API routes (for rate limiting)
//   • All localized page routes: /, /about, /contact, /profile (and /hi/*)
//   • All other non-API pages (admin, login, etc.) — rate limiter still
//     protects these; locale middleware skips them via isLocaleExcluded().
// Excludes Next.js internals (_next/static, _next/image) for performance.
export const config = {
    matcher: [
        /*
         * Match all request paths EXCEPT:
         *   - _next/static  (static assets)
         *   - _next/image   (image optimization)
         *   - _next/webpack-hmr (HMR websocket)
         */
        "/((?!_next/static|_next/image|_next/webpack-hmr).*)",
    ],
};

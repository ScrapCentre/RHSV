/**
 * middleware.ts — Next.js Edge Middleware
 *
 * Layer 1: Fast in-memory burst protection (no DB call).
 * Blocks IPs making > 120 requests/minute to any /api/* route.
 *
 * Layer 2: Per-endpoint precise limits are enforced inside individual
 * route handlers using the MongoDB-backed rateLimit() from lib/rate-limit.ts.
 */

import { NextRequest, NextResponse } from "next/server";

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

    // Only apply to API routes
    if (!pathname.startsWith("/api/")) {
        return NextResponse.next();
    }

    // Skip NextAuth internal routes (session checks, CSRF tokens)
    if (pathname.startsWith("/api/auth/session") ||
        pathname.startsWith("/api/auth/csrf") ||
        pathname.startsWith("/api/auth/providers")) {
        return NextResponse.next();
    }

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

    return NextResponse.next();
}

export const config = {
    matcher: ["/api/:path*"],
};

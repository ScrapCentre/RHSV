/**
 * lib/rate-limit.ts
 * MongoDB-backed sliding window rate limiter.
 * Works across all serverless instances. Auto-purges via MongoDB TTL index.
 *
 * Usage inside any API route:
 *   const limited = await rateLimit(req, { endpoint: "register", max: 5, windowMs: 60 * 60_000 })
 *   if (limited) return limited
 */

import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import RateLimit from "@/models/RateLimit";

export interface RateLimitOptions {
    /** Unique name for this endpoint bucket (e.g. "register", "login", "contact") */
    endpoint: string;
    /** Maximum requests allowed in the window */
    max: number;
    /** Window duration in milliseconds */
    windowMs: number;
    /** Optional: override the identifier (default: IP address) */
    identifier?: string;
}

/**
 * Extract the real client IP from the request headers.
 * Handles Cloudflare, Vercel, and direct connections.
 */
export function getClientIp(req: NextRequest): string {
    return (
        req.headers.get("cf-connecting-ip") ||       // Cloudflare
        req.headers.get("x-real-ip") ||               // Nginx/Vercel
        req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
        "unknown"
    );
}

/**
 * Check and increment the rate limit counter for a request.
 * Returns a 429 NextResponse if the limit is exceeded, or null if allowed.
 */
export async function rateLimit(
    req: NextRequest,
    options: RateLimitOptions
): Promise<NextResponse | null> {
    const { endpoint, max, windowMs, identifier } = options;

    const ip = identifier ?? getClientIp(req);
    const key = `${ip}:${endpoint}`;

    try {
        await connectToDatabase();

        const now = new Date();
        const resetAt = new Date(now.getTime() + windowMs);

        // Atomically increment counter, create if not exists
        const record = await RateLimit.findOneAndUpdate(
            { key },
            {
                $inc: { count: 1 },
                $setOnInsert: { resetAt },
            },
            {
                upsert: true,
                new: true,
                // Only set resetAt on insert (don't overwrite the window on each hit)
                setDefaultsOnInsert: true,
            }
        );

        const count = record?.count ?? 1;
        const windowReset = record?.resetAt ?? resetAt;
        const retryAfterSecs = Math.ceil((windowReset.getTime() - now.getTime()) / 1000);

        if (count > max) {
            return NextResponse.json(
                {
                    error: "Too many requests",
                    message: `Rate limit exceeded. Please try again in ${Math.ceil(retryAfterSecs / 60)} minute(s).`,
                    retryAfter: retryAfterSecs,
                },
                {
                    status: 429,
                    headers: {
                        "Retry-After": String(retryAfterSecs),
                        "X-RateLimit-Limit": String(max),
                        "X-RateLimit-Remaining": "0",
                        "X-RateLimit-Reset": String(Math.ceil(windowReset.getTime() / 1000)),
                    },
                }
            );
        }

        return null; // Request is allowed

    } catch (err) {
        // On DB error, fail open (don't block legitimate traffic)
        console.error("[RateLimit] DB error — failing open:", err);
        return null;
    }
}

// ─── Pre-configured limiters ──────────────────────────────────────────────────
// Import these directly in route files for convenience.

export const rateLimiters = {
    /** 5 registrations per IP per hour */
    register: (req: NextRequest) =>
        rateLimit(req, { endpoint: "register", max: 5, windowMs: 60 * 60_000 }),

    /** 10 contact form submissions per IP per hour */
    contact: (req: NextRequest) =>
        rateLimit(req, { endpoint: "contact", max: 10, windowMs: 60 * 60_000 }),

    /** 30 file uploads per IP per hour */
    upload: (req: NextRequest) =>
        rateLimit(req, { endpoint: "upload", max: 30, windowMs: 60 * 60_000 }),

    /** 30 chat uploads per IP per hour */
    chatUpload: (req: NextRequest) =>
        rateLimit(req, { endpoint: "chat-upload", max: 30, windowMs: 60 * 60_000 }),

    /** 20 eKYC submissions per IP per hour */
    ekyc: (req: NextRequest) =>
        rateLimit(req, { endpoint: "ekyc", max: 20, windowMs: 60 * 60_000 }),

    /** 30 wizard leads per IP per hour */
    wizardLead: (req: NextRequest) =>
        rateLimit(req, { endpoint: "wizard-lead", max: 30, windowMs: 60 * 60_000 }),

    /** 3 RVSF applications per IP per 24 hours */
    rvsfApply: (req: NextRequest) =>
        rateLimit(req, { endpoint: "rvsf-apply", max: 3, windowMs: 24 * 60 * 60_000 }),

    /** 20 payment orders per IP per hour */
    paymentOrder: (req: NextRequest) =>
        rateLimit(req, { endpoint: "payment-order", max: 20, windowMs: 60 * 60_000 }),

    /**
     * Login rate limit — keyed by email, not IP (prevents IP spoofing on auth).
     * 10 attempts per email per 15 minutes.
     */
    login: (req: NextRequest, email: string) =>
        rateLimit(req, {
            endpoint: "login",
            max: 10,
            windowMs: 15 * 60_000,
            identifier: `email:${email.toLowerCase()}`,
        }),
} as const;

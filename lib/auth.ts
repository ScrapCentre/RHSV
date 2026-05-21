// v2 NextAuth configuration — M06 refactor.
//
// Cleanups vs Novalytix's main:
//   - Removed hardcoded `debug@test.com / debug123` admin backdoor
//     (security audit §1.1, P0). Also removes the phone-otp provider
//     with hardcoded `"000000"` and the msg91 provider with no shared
//     secret check — both replaced by the firebase-otp provider.
//   - Removed `sc01 / verifya` hardcoded password fallback in the
//     scrapcentre-credentials and universal providers (security audit
//     P1 — kept loadable via the seeded DB row, just not as a constant
//     in source).
//   - Removed leaky `console.log("[Auth] Login Attempt for:", email)`
//     and similar.
//
// New in v2:
//   - 6-role taxonomy on User: client / admin / executive / rvsf_admin
//     / rvsf_executive / cc_operator. Legacy enum values (b2b, partner,
//     rvsf, scrapcentre) still allowed for backward compat during
//     migration.
//   - Session callback populates linkedRvsfId + linkedCcId from User
//     so route handlers can scope queries via session.user.linkedRvsfId
//     without re-querying User on every request.
//   - All seven providers consolidated into a single `lib/auth.ts`;
//     each backed by the User collection (plus legacy collections for
//     backward compat with unmigrated Novalytix seed data).
//
// Refs: security-audit-for-novalytix.md §1.1 + §2.5,
//       v2-build-plan.md §11 + §22 Conflict 1,
//       v2-plan-backend.md §6, product-decisions.md L34 + L41.

import { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import connectToDatabase from "@/lib/db"

// Static imports to prevent model re-registration errors
import User from "@/models/User"
import ScrapCentreUser from "@/models/ScrapCentreUser"
import B2BPartner from "@/models/B2BPartner"
import Executive from "@/models/Executive"
import RVSFUser from "@/models/RVSFUser"

import { adminAuth } from "@/lib/firebase-admin"

export const authOptions: NextAuthOptions = {
    providers: [
        // ── 1) Universal credentials (admin, executive, client by email/password) ──
        CredentialsProvider({
            id: "credentials",
            name: "Universal Credentials",
            credentials: {
                email:    { label: "Identifier", type: "text" },
                password: { label: "Password",   type: "password" },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) return null
                try {
                    await connectToDatabase()
                    const identifier = credentials.email.toLowerCase()
                    const password   = credentials.password

                    // 1. Env-fallback admin (operational break-glass; never logged)
                    const envEmail = process.env.ADMIN_EMAIL
                    const envPw    = process.env.ADMIN_PASSWORD
                    if (envEmail && envPw && identifier === envEmail.toLowerCase() && password === envPw) {
                        return { id: "env-admin", name: "System Admin", email: envEmail, role: "admin" }
                    }

                    // 2. Standard User DB lookup (unified v2 + legacy User docs)
                    const dbUser = await User.findOne({ email: identifier }).select("+password").lean() as any
                    if (dbUser?.password) {
                        const isMatch = await bcrypt.compare(password, dbUser.password)
                        if (isMatch) {
                            return {
                                id: dbUser._id.toString(),
                                name: dbUser.name,
                                email: dbUser.email,
                                role: dbUser.role || "client",
                            }
                        }
                    }

                    // 3. Legacy ScrapCentreUser fallback (kept readable during migration)
                    const scrapUser = await ScrapCentreUser.findOne({
                        $or: [{ email: identifier }, { loginId: identifier }],
                    }).select("+password").lean() as any
                    if (scrapUser?.password) {
                        const stored = scrapUser.password
                        const isMatch = stored.startsWith("$2")
                            ? await bcrypt.compare(password, stored)
                            : stored === password  // legacy plaintext rows kept readable
                        if (isMatch) {
                            return {
                                id: scrapUser._id.toString(),
                                name: scrapUser.name,
                                email: scrapUser.email,
                                role: "cc_operator",
                            }
                        }
                    }

                    // 4. Legacy B2BPartner fallback
                    const partner = await B2BPartner.findOne({ userId: identifier }).select("+password").lean() as any
                    if (partner?.password) {
                        const isMatch = partner.password.startsWith("$2")
                            ? await bcrypt.compare(password, partner.password)
                            : partner.password === password
                        if (isMatch) {
                            return {
                                id: partner._id.toString(),
                                name: partner.businessName,
                                email: partner.email,
                                role: "rvsf_admin",
                            }
                        }
                    }

                    // 5. Legacy RVSFUser fallback
                    // Preserve the role stored on the RVSFUser doc — Novalytix's
                    // /rvsf_leads buy-flow seeds `role: "rvsf"`, and the legacy
                    // /rvsf_leads/dashboard + /api/rvsf/leads handlers still
                    // guard strictly on `role === "rvsf"`. Hardcoding
                    // "rvsf_executive" here breaks that flow end-to-end (founder
                    // walkthrough 2026-05-21).
                    const rvsf = await RVSFUser.findOne({
                        $or: [{ rvsfId: identifier }, { email: identifier }],
                    }).select("+password").lean() as any
                    if (rvsf?.password) {
                        const isMatch = await bcrypt.compare(password, rvsf.password)
                        if (isMatch) {
                            return {
                                id: rvsf._id.toString(),
                                name: rvsf.name,
                                email: rvsf.email,
                                role: rvsf.role || "rvsf_executive",
                            }
                        }
                    }
                } catch (err: any) {
                    console.error("[Auth] DB error during authorize:", err?.message)
                    if (
                        err?.code === "EREFUSED" ||
                        err?.name === "MongooseServerSelectionError" ||
                        /timeout|connect|selection/i.test(err?.message ?? "")
                    ) {
                        throw new Error("DATABASE_CONNECTION_ERROR")
                    }
                    // Generic — do NOT leak raw error message to client
                    throw new Error("AUTHENTICATION_FAILED")
                }
                return null
            },
        }),

        // ── 2) ScrapCentre portal (CC operator login by email/loginId) ──
        CredentialsProvider({
            id: "scrapcentre-credentials",
            name: "ScrapCentre Portal",
            credentials: {
                email:    { label: "ID/Email", type: "text" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) return null
                try {
                    await connectToDatabase()
                    const identifier = credentials.email.toLowerCase()

                    // Try v2 unified User first (role=cc_operator)
                    const dbUser = await User.findOne({
                        email: identifier,
                        role: { $in: ["cc_operator", "scrapcentre"] },
                    }).select("+password").lean() as any
                    if (dbUser?.password) {
                        const isMatch = await bcrypt.compare(credentials.password, dbUser.password)
                        if (isMatch) {
                            return {
                                id: dbUser._id.toString(),
                                name: dbUser.name,
                                email: dbUser.email,
                                role: "cc_operator",
                            }
                        }
                    }

                    // Fall back to legacy ScrapCentreUser
                    const scrap = await ScrapCentreUser.findOne({
                        $or: [{ email: identifier }, { loginId: identifier }],
                    }).select("+password").lean() as any
                    if (!scrap?.password) return null
                    const stored = scrap.password
                    const isMatch = stored.startsWith("$2")
                        ? await bcrypt.compare(credentials.password, stored)
                        : stored === credentials.password
                    if (!isMatch) return null
                    return {
                        id: scrap._id.toString(),
                        name: scrap.name,
                        email: scrap.email,
                        role: "cc_operator",
                    }
                } catch (err: any) {
                    console.error("[ScrapCentre Auth] DB error:", err?.message)
                    if (
                        err?.code === "EREFUSED" ||
                        err?.name === "MongooseServerSelectionError" ||
                        /timeout|connect|selection/i.test(err?.message ?? "")
                    ) {
                        throw new Error("DATABASE_CONNECTION_ERROR")
                    }
                    throw new Error("AUTHENTICATION_FAILED")
                }
            },
        }),

        // ── 3) B2B partner portal (legacy; v2 prefers rvsf-credentials) ──
        CredentialsProvider({
            id: "b2b-credentials",
            name: "Partner Portal",
            credentials: {
                userId:   { label: "Partner ID", type: "text" },
                password: { label: "Password",   type: "password" },
            },
            async authorize(credentials) {
                if (!credentials?.userId || !credentials?.password) return null
                try {
                    await connectToDatabase()
                    const partner = await B2BPartner.findOne({ userId: credentials.userId }).select("+password").lean() as any
                    if (!partner?.password) return null
                    const stored = partner.password
                    const isMatch = stored.startsWith("$2")
                        ? await bcrypt.compare(credentials.password, stored)
                        : stored === credentials.password
                    if (!isMatch) return null
                    return {
                        id: partner._id.toString(),
                        name: partner.businessName,
                        email: partner.email,
                        role: "rvsf_admin",
                    }
                } catch (err: any) {
                    console.error("[B2B Auth] DB error:", err?.message)
                    return null
                }
            },
        }),

        // ── 4) Executive portal ──
        CredentialsProvider({
            id: "executive-credentials",
            name: "Executive Portal",
            credentials: {
                email:    { label: "Email",    type: "email" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) return null
                try {
                    await connectToDatabase()
                    const identifier = credentials.email.toLowerCase()

                    // v2 unified User first
                    const dbUser = await User.findOne({ email: identifier, role: "executive" }).select("+password").lean() as any
                    if (dbUser?.password) {
                        const isMatch = await bcrypt.compare(credentials.password, dbUser.password)
                        if (isMatch) {
                            return { id: dbUser._id.toString(), name: dbUser.name, email: dbUser.email, role: "executive" }
                        }
                    }

                    // Legacy Executive
                    const exec = await Executive.findOne({ email: identifier }).select("+password").lean() as any
                    if (!exec?.password) return null
                    const isMatch = await bcrypt.compare(credentials.password, exec.password)
                    if (!isMatch) return null
                    return { id: exec._id.toString(), name: exec.name, email: exec.email, role: "executive" }
                } catch (err: any) {
                    console.error("[Executive Auth] DB error:", err?.message)
                    return null
                }
            },
        }),

        // ── 5) RVSF portal (legacy RVSFUser; v2 prefers unified User{rvsf_*}) ──
        CredentialsProvider({
            id: "rvsf-credentials",
            name: "RVSF Portal",
            credentials: {
                rvsfId:   { label: "RVSF ID",  type: "text" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                if (!credentials?.rvsfId || !credentials?.password) return null
                try {
                    await connectToDatabase()
                    const identifier = credentials.rvsfId.toLowerCase()

                    // v2 unified User first
                    const dbUser = await User.findOne({
                        email: identifier,
                        role: { $in: ["rvsf_admin", "rvsf_executive", "rvsf"] },
                    }).select("+password").lean() as any
                    if (dbUser?.password) {
                        const isMatch = await bcrypt.compare(credentials.password, dbUser.password)
                        if (isMatch) {
                            return { id: dbUser._id.toString(), name: dbUser.name, email: dbUser.email, role: dbUser.role }
                        }
                    }

                    // Legacy RVSFUser
                    // Preserve the role stored on the doc. Novalytix's
                    // /rvsf_leads buy-flow seeds `role: "rvsf"`, and the
                    // legacy /rvsf_leads/dashboard + /api/rvsf/leads handlers
                    // strictly check `role === "rvsf"`; hardcoding "rvsf_executive"
                    // here previously bounced legitimate buyers to "/" after a
                    // successful login (founder walkthrough 2026-05-21).
                    const rvsf = await RVSFUser.findOne({
                        $or: [{ rvsfId: credentials.rvsfId }, { email: identifier }],
                    }).select("+password").lean() as any
                    if (!rvsf?.password) return null
                    const isMatch = await bcrypt.compare(credentials.password, rvsf.password)
                    if (!isMatch) return null
                    return {
                        id: rvsf._id.toString(),
                        name: rvsf.name,
                        email: rvsf.email,
                        role: rvsf.role || "rvsf_executive",
                    }
                } catch (err: any) {
                    console.error("[RVSF Auth] DB error:", err?.message)
                    throw new Error("AUTHENTICATION_FAILED")
                }
            },
        }),

        // ── 6) Firebase phone OTP (locked 2026-05-20 L34 — replaces MSG91 + phone-otp) ──
        CredentialsProvider({
            id: "firebase-otp",
            name: "Firebase OTP",
            credentials: {
                idToken: { label: "ID Token", type: "text" },
                name:    { label: "Name",     type: "text" },
            },
            async authorize(credentials) {
                if (!credentials?.idToken) return null
                try {
                    const decoded = await adminAuth.verifyIdToken(credentials.idToken)
                    const phoneNumber = decoded.phone_number
                    if (!phoneNumber) return null

                    await connectToDatabase()
                    const displayName = credentials.name?.trim() || `User ${phoneNumber.slice(-4)}`
                    const dummyEmail  = `${phoneNumber.replace("+", "")}@otp.com`

                    let user = await User.findOne({ phone: phoneNumber })
                    if (!user) {
                        user = await User.create({
                            name: displayName,
                            email: dummyEmail,
                            phone: phoneNumber,
                            firebaseUid: decoded.uid,
                            role: "client",
                            provider: "firebase_otp",
                        })
                    } else if (!user.name || user.name.startsWith("User ")) {
                        user.name = displayName
                        if (!user.firebaseUid) user.firebaseUid = decoded.uid
                        await user.save()
                    }
                    return {
                        id: user._id.toString(),
                        name: user.name,
                        email: user.email ?? null,
                        role: user.role || "client",
                    }
                } catch (err: any) {
                    console.error("[Firebase Auth] verify failed:", err?.message)
                    return null
                }
            },
        }),

        // ── 7) Google OAuth (kept; button hidden in v2 UI per audit §4.5 unless re-enabled) ──
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        }),
    ],
    callbacks: {
        async signIn({ user, account }) {
            if (account?.provider === "google") {
                try {
                    await connectToDatabase()
                    const existingUser = await User.findOne({ email: user.email })
                    if (!existingUser) {
                        await User.create({
                            name: user.name,
                            email: user.email,
                            image: user.image,
                            role: "client",
                            provider: "google",
                        })
                    }
                    return true
                } catch (err: any) {
                    console.error("[Google Sign In] DB error:", err?.message)
                    return false
                }
            }
            return true
        },
        async jwt({ token, user, account, trigger }) {
            try {
                if (user) {
                    if (account?.provider === "google") {
                        await connectToDatabase()
                        const dbUser = await User.findOne({ email: (user as any).email }).lean() as any
                        if (dbUser) {
                            token.role = typeof dbUser.role === "string" ? dbUser.role : "client"
                            token.id   = dbUser._id ? String(dbUser._id) : undefined
                            if (dbUser.linkedRvsfId) token.linkedRvsfId = String(dbUser.linkedRvsfId)
                            if (dbUser.linkedCcId)   token.linkedCcId   = String(dbUser.linkedCcId)
                            token.mustChangePassword = !!dbUser.mustChangePassword
                        }
                    } else {
                        const u = user as any
                        token.role = typeof u.role === "string" ? u.role : "client"
                        token.id   = u.id != null ? String(u.id) : undefined
                        if (token.role === "rvsf_admin" || token.role === "rvsf_executive" || token.role === "cc_operator") {
                            try {
                                // Only attempt the lookup with a real ObjectId-shaped id.
                                // The env-admin path produces id === "env-admin" which
                                // would CastError; same for any non-Mongo id source.
                                if (typeof token.id === "string" && /^[a-f0-9]{24}$/i.test(token.id)) {
                                    await connectToDatabase()
                                    const dbUser = await User.findById(token.id).lean() as any
                                    if (dbUser) {
                                        if (dbUser.linkedRvsfId) token.linkedRvsfId = String(dbUser.linkedRvsfId)
                                        if (dbUser.linkedCcId)   token.linkedCcId   = String(dbUser.linkedCcId)
                                        token.mustChangePassword = !!dbUser.mustChangePassword
                                    }
                                }
                            } catch (lookupErr: any) {
                                console.error("[Auth] linkedRvsfId/CcId lookup failed:", lookupErr?.message)
                            }
                        }
                    }
                }
                // Re-read mustChangePassword on explicit session refresh — fired
                // from the client after POST /api/cc/change-password so the next
                // server-rendered page sees the flipped flag without a full
                // sign-out/sign-in round-trip. Cheap (one indexed _id lookup)
                // and only runs when the client explicitly calls update().
                if (trigger === "update" && typeof token.id === "string" && /^[a-f0-9]{24}$/i.test(token.id)) {
                    try {
                        await connectToDatabase()
                        const dbUser = await User.findById(token.id).lean() as any
                        if (dbUser) {
                            token.mustChangePassword = !!dbUser.mustChangePassword
                            // Also refresh links — RVSF admin may have moved this
                            // CC operator to a different centre in the interim.
                            if (dbUser.linkedRvsfId) token.linkedRvsfId = String(dbUser.linkedRvsfId)
                            if (dbUser.linkedCcId)   token.linkedCcId   = String(dbUser.linkedCcId)
                        }
                    } catch (refreshErr: any) {
                        console.error("[Auth] session refresh lookup failed:", refreshErr?.message)
                    }
                }
            } catch (err: any) {
                console.error("[Auth] jwt callback error:", err?.message)
            }
            return token
        },
        async session({ session, token }) {
            try {
                if (session && session.user && token) {
                    const sUser = session.user as any
                    sUser.role         = typeof token.role         === "string" ? token.role         : "client"
                    sUser.id           = typeof token.id           === "string" ? token.id           : undefined
                    sUser.linkedRvsfId = typeof token.linkedRvsfId === "string" ? token.linkedRvsfId : undefined
                    sUser.linkedCcId   = typeof token.linkedCcId   === "string" ? token.linkedCcId   : undefined
                    sUser.mustChangePassword = token.mustChangePassword === true
                }
            } catch (err: any) {
                console.error("[Auth] session callback error:", err?.message)
            }
            return session
        },
        // Role-based post-login redirect.
        // Honors an explicit ?callbackUrl=… if it's same-origin, otherwise routes
        // to the role-appropriate landing page. Without this every role lands on /.
        async redirect({ url, baseUrl }) {
            // Same-origin redirects (e.g. callbackUrl=/some/page) → honor
            try {
                const parsed = new URL(url, baseUrl)
                if (parsed.origin === baseUrl) {
                    // If callbackUrl is literally "/" or "/login", treat as no callback set
                    if (parsed.pathname !== "/" && parsed.pathname !== "/login") {
                        return parsed.toString()
                    }
                }
            } catch { /* fall through */ }
            // Otherwise role-based default — but at this point in the NextAuth
            // flow we don't have the session, so we can't branch on role. We
            // route everyone to /post-login, a tiny dispatcher page that looks
            // at the session and forwards to the right place.
            return `${baseUrl}/post-login`
        },
    },
    pages: { signIn: "/login" },
    session: { strategy: "jwt" },
}

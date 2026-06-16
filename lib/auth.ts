import mongoose from "mongoose"
import { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials"
import connectToDatabase from "@/lib/db"
import bcrypt from "bcryptjs"
import RateLimit from "@/models/RateLimit"

// Static imports to prevent model re-registration errors
import User from "@/models/User"
import ScrapCentreUser from "@/models/ScrapCentreUser"
import B2BPartner from "@/models/B2BPartner"
import Executive from "@/models/Executive"
import RVSFUser from "@/models/RVSFUser"
import CCOperator from "@/models/CCOperator"
import PersonalCCOperator from "@/models/PersonalCCOperator"

import { adminAuth } from "@/lib/firebase-admin"

/**
 * Check login rate limit: 10 attempts per identifier per 15 minutes.
 * Returns true if blocked, false if allowed.
 * Keyed by identifier (email/id) — immune to IP rotation.
 */
async function isLoginRateLimited(identifier: string): Promise<boolean> {
    try {
        const key = `login:${identifier.toLowerCase()}`
        const windowMs = 15 * 60_000 // 15 minutes
        const max = 10
        const now = new Date()
        const resetAt = new Date(now.getTime() + windowMs)

        const record = await RateLimit.findOneAndUpdate(
            { key },
            { $inc: { count: 1 }, $setOnInsert: { resetAt } },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        )

        return (record?.count ?? 1) > max
    } catch {
        return false // fail open
    }
}

async function sendAdminLockoutEmail(adminEmail: string) {
    const RESEND_API_KEY = process.env.RESEND_API_KEY;
    if (!RESEND_API_KEY) {
        console.error("[Email] RESEND_API_KEY not configured, cannot send alert email");
        return;
    }
    try {
        const subject = "⚠️ Security Alert: Admin Account Lockout Triggered";
        const emailHtml = `
            <!DOCTYPE html>
            <html>
            <body style="margin:0;padding:0;background:#f4f4f5;font-family:Arial,sans-serif;">
                <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:40px 0;">
                    <tr><td align="center">
                        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);border-top:4px solid #E31E24;">
                            <tr>
                                <td style="background:#0E192D;padding:24px 40px;">
                                    <p style="margin:0;font-size:22px;font-weight:800;color:#ffffff;">
                                        Scrap<span style="color:#E31E24;">Centre</span> Security
                                    </p>
                                </td>
                            </tr>
                            <tr>
                                <td style="padding:40px;">
                                    <h2 style="color:#D32F2F;margin:0 0 16px;">Admin Account Temporarily Locked</h2>
                                    <p style="color:#333;font-size:15px;line-height:1.6;margin-bottom:24px;">
                                        Hello Security Team,
                                    </p>
                                    <p style="color:#555;font-size:14px;line-height:1.6;margin-bottom:20px;">
                                        This is a security notification from the ScrapCentre admin panel. Multiple failed login attempts were detected for the following administrator account:
                                    </p>
                                    <div style="background:#f9fafb;border-left:4px solid #D32F2F;padding:16px;margin-bottom:24px;border-radius:4px;">
                                        <p style="margin:0 0 8px;font-size:14px;color:#555;"><strong>Admin Email:</strong> ${adminEmail}</p>
                                        <p style="margin:0;font-size:14px;color:#555;"><strong>Reason:</strong> 2 consecutive incorrect password attempts</p>
                                    </div>
                                    <p style="color:#555;font-size:14px;line-height:1.6;margin-bottom:20px;">
                                        To protect the account from brute-force access, **the account has been locked out for 10 minutes**. No login attempts for this email will be processed during this period.
                                    </p>
                                    <p style="color:#555;font-size:14px;line-height:1.6;margin-bottom:20px;">
                                        If this attempt was not made by an authorized administrator, please review the server logs and verify security configurations immediately.
                                    </p>
                                    <p style="color:#999;font-size:12px;margin-top:30px;border-top:1px solid #eee;padding-top:20px;">
                                        Please do not reply directly to this email. For assistance, contact security administration.
                                    </p>
                                </td>
                            </tr>
                            <tr>
                                <td style="background:#f9fafb;padding:20px 40px;text-align:center;">
                                    <p style="margin:0;color:#aaa;font-size:12px;">© ${new Date().getFullYear()} ScrapCentre Security. All rights reserved.</p>
                                </td>
                            </tr>
                        </table>
                    </td></tr>
                </table>
            </body>
            </html>
        `;

        const res = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${RESEND_API_KEY}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                from: "ScrapCentre Security <noreply@scrapcentre.com>",
                to: ["scrapcentre69@gmail.com"],
                subject,
                html: emailHtml,
            }),
        });

        const data = await res.json();
        if (!res.ok) {
            console.error("[Email] Failed to send alert email:", data);
        } else {
            console.log("[Email] Alert email sent successfully to scrapcentre69@gmail.com");
        }
    } catch (err) {
        console.error("[Email] Error sending alert email:", err);
    }
}

async function handleFailedAdminAttempt(identifier: string) {
    const attemptsKey = `admin-attempts:${identifier}`;
    const lockoutKey = `admin-lockout:${identifier}`;
    const now = new Date();
    const resetAt = new Date(now.getTime() + 15 * 60_000); // 15 mins window for attempts

    const attemptsRecord = await RateLimit.findOneAndUpdate(
        { key: attemptsKey },
        { $inc: { count: 1 }, $setOnInsert: { resetAt } },
        { upsert: true, new: true }
    );

    const failedCount = attemptsRecord?.count || 1;
    if (failedCount >= 2) {
        // Trigger 10-minute lockout
        const lockoutResetAt = new Date(now.getTime() + 10 * 60_000);
        await RateLimit.findOneAndUpdate(
            { key: lockoutKey },
            { count: 1, resetAt: lockoutResetAt },
            { upsert: true }
        );

        // Delete attempts record so they start fresh after lockout expires
        await RateLimit.deleteOne({ key: attemptsKey });

        // Send alert email to scrapcentre69@gmail.com
        await sendAdminLockoutEmail(identifier);

        // Throw lockout error immediately to trigger UI lockdown on the 2nd attempt
        throw new Error("LOCKOUT:10");
    }
}

export const authOptions: NextAuthOptions = {
    secret: process.env.NEXTAUTH_SECRET,
    providers: [
        CredentialsProvider({
            id: "credentials",
            name: "Universal Credentials",
            credentials: {
                email: { label: "Identifier", type: "text" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                console.log("[Auth] Login Attempt for:", credentials?.email);
                if (!credentials?.email || !credentials?.password) return null;

                // Rate limit: 10 attempts per email per 15 minutes
                await connectToDatabase();
                if (await isLoginRateLimited(credentials.email)) {
                    console.warn("[Auth] Rate limit hit for:", credentials.email);
                    throw new Error("TOO_MANY_ATTEMPTS");
                }

                try {
                    const identifier = credentials.email.trim().toLowerCase();
                    const password = credentials.password;

                    // 1. Check if they are trying to log in as admin
                    const envAdminEmail = process.env.ADMIN_EMAIL;
                    const isEnvAdmin = envAdminEmail && identifier === envAdminEmail.toLowerCase();
                    let isAdmin = isEnvAdmin;

                    if (!isAdmin) {
                        const dbUser = await User.findOne({ email: identifier }).select("role").lean();
                        if (dbUser && dbUser.role === "admin") {
                            isAdmin = true;
                        }
                    }

                    // 2. Lockout Check for Admin (or bypass token verify)
                    if (isAdmin) {
                        // Check if it's a bypass token first
                        if (password.startsWith("BYPASS_TOKEN_")) {
                            const escapedIdentifier = identifier.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
                            const regex = new RegExp(`^admin-bypass-token:${escapedIdentifier}:[^:]+:${password}$`);
                            const storedTokenRecord = await RateLimit.findOne({ key: { $regex: regex } });
                            if (storedTokenRecord && storedTokenRecord.resetAt > new Date()) {
                                // Valid bypass token! Clear attempts, lockout and token
                                await Promise.all([
                                    RateLimit.deleteMany({ key: { $regex: regex } }),
                                    RateLimit.deleteOne({ key: `admin-lockout:${identifier}` }),
                                    RateLimit.deleteOne({ key: `admin-attempts:${identifier}` })
                                ]);
                                
                                console.log("[Auth] Admin login bypass successful via one-time token");
                                if (isEnvAdmin) {
                                    return { id: "env-admin", name: "System Admin", email: envAdminEmail, role: "admin" }
                                } else {
                                    const dbUser = await User.findOne({ email: identifier }).lean();
                                    return { id: (dbUser as any)._id.toString(), name: (dbUser as any).name, email: (dbUser as any).email, role: "admin" }
                                }
                            } else {
                                throw new Error("Invalid or expired bypass verification.");
                            }
                        }

                        // Otherwise check regular lockout
                        const lockoutKey = `admin-lockout:${identifier}`;
                        const lockoutRecord = await RateLimit.findOne({ key: lockoutKey });
                        if (lockoutRecord && lockoutRecord.resetAt > new Date()) {
                            const remainingMs = lockoutRecord.resetAt.getTime() - Date.now();
                            const remainingMins = Math.ceil(remainingMs / 60_000);
                            throw new Error(`LOCKOUT:${remainingMins}`);
                        }
                    }

                    // 3. Env Fallback (Admin)
                    const rawEnvAdminPassword = process.env.ADMIN_PASSWORD;
                    const envAdminPassword = rawEnvAdminPassword ? rawEnvAdminPassword.replace(/\\/g, '') : undefined;
                    
                    if (envAdminEmail && envAdminPassword && 
                        identifier === envAdminEmail.toLowerCase()) {
                        const isHashed = envAdminPassword.startsWith("$2a$") || 
                                         envAdminPassword.startsWith("$2b$") || 
                                         envAdminPassword.startsWith("$2y$");
                        
                        const isMatch = isHashed 
                            ? await bcrypt.compare(password, envAdminPassword)
                            : await bcrypt.compare(password, await bcrypt.hash(envAdminPassword, 10));

                        if (!isHashed && process.env.NODE_ENV !== "production") {
                            console.warn("[Auth] WARNING: ADMIN_PASSWORD is set as plaintext in your environment. Please use a bcrypt hash instead for production security.");
                        }

                        if (isMatch) {
                            console.log("[Auth] Env Admin Match");
                            await RateLimit.deleteOne({ key: `admin-attempts:${identifier}` });
                            return { id: "env-admin", name: "System Admin", email: envAdminEmail, role: "admin" }
                        } else {
                            await handleFailedAdminAttempt(identifier);
                            return null;
                        }
                    }

                    // 4. Standard User Database
                    const dbUser = await User.findOne({ email: identifier }).select("+password +role +mustChangePassword").lean();
                    if (dbUser) {
                        const isMatch = await bcrypt.compare(password, (dbUser as any).password);
                        if (isMatch) {
                            if ((dbUser as any).role === "admin") {
                                await RateLimit.deleteOne({ key: `admin-attempts:${identifier}` });
                            }
                            return { id: (dbUser as any)._id.toString(), name: (dbUser as any).name, email: (dbUser as any).email, role: (dbUser as any).role || "client", mustChangePassword: (dbUser as any).mustChangePassword === true }
                        } else {
                            if ((dbUser as any).role === "admin") {
                                await handleFailedAdminAttempt(identifier);
                            }
                        }
                    }

                    const escapedIdentifier = identifier.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
                    const caseInsensitiveQuery = { $regex: new RegExp("^" + escapedIdentifier + "$", "i") };

                    // 5. ScrapCentre Database
                    const scrapUser = await ScrapCentreUser.findOne({ $or: [{ email: caseInsensitiveQuery }, { loginId: caseInsensitiveQuery }] }).select("+password +mustChangePassword").lean();
                    if (scrapUser) {
                        const storedPw = (scrapUser as any).password;
                        const isHashed = storedPw?.startsWith("$2");
                        const isMatch = isHashed ? await bcrypt.compare(password, storedPw) : storedPw === password;
                        if (isMatch) return { id: (scrapUser as any)._id.toString(), name: (scrapUser as any).name, email: (scrapUser as any).email, role: "scrapcentre", mustChangePassword: (scrapUser as any).mustChangePassword === true }
                    }

                    // 6. B2B Database
                    const partner = await B2BPartner.findOne({ $or: [{ userId: caseInsensitiveQuery }, { email: caseInsensitiveQuery }] }).select("+password +mustChangePassword").lean();
                    if (partner) {
                        const storedPw = (partner as any).password;
                        const isHashed = storedPw?.startsWith("$2");
                        const isMatch = isHashed ? await bcrypt.compare(password, storedPw) : storedPw === password;
                        if (isMatch) return { id: (partner as any)._id.toString(), name: (partner as any).businessName, email: (partner as any).email, role: "partner", mustChangePassword: (partner as any).mustChangePassword === true }
                    }

                    // 7. RVSF Database
                    const rvsf = await RVSFUser.findOne({ $or: [{ rvsfId: caseInsensitiveQuery }, { email: caseInsensitiveQuery }] }).select("+password +mustChangePassword").lean();
                    if (rvsf) {
                        const storedPw = (rvsf as any).password;
                        const isHashed = storedPw?.startsWith("$2");
                        const isMatch = isHashed ? await bcrypt.compare(password, storedPw) : storedPw === password;
                        if (isMatch) return { id: (rvsf as any)._id.toString(), name: (rvsf as any).name, email: (rvsf as any).email, role: "rvsf", mustChangePassword: (rvsf as any).mustChangePassword === true }
                    }

                    // If we reached here, login has failed.
                    // If the email entered contains "admin", track it as a failed admin attempt.
                    if (identifier.includes("admin")) {
                        await handleFailedAdminAttempt(identifier);
                    }

                } catch (err: any) {
                    console.error("[Auth] Database error during authorize:", err);
                    if (err.message?.startsWith("LOCKOUT:")) {
                        throw err;
                    }
                    if (err.code === 'EREFUSED' || err.name === 'MongooseServerSelectionError' || err.message?.includes('timeout') || err.message?.includes('connect') || err.message?.includes('selection')) {
                        throw new Error("DATABASE_CONNECTION_ERROR");
                    }
                    throw new Error(`AUTH_ERROR: ${err.message || "Unknown error"}`);
                }
                return null;
            }
        }),
        CredentialsProvider({
            id: "scrapcentre-credentials",
            name: "ScrapCentre Portal",
            credentials: {
                email: { label: "ID/Email", type: "text" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) return null;
                await connectToDatabase();
                if (await isLoginRateLimited(credentials.email)) {
                    throw new Error("TOO_MANY_ATTEMPTS");
                }
                try {
                    const identifier = credentials.email.trim().toLowerCase();
                    const escapedIdentifier = identifier.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
                    const caseInsensitiveQuery = { $regex: new RegExp("^" + escapedIdentifier + "$", "i") };
                    console.log(`[ScrapCentre Auth] Searching for identifier: "${identifier}"`);
                    const user = await ScrapCentreUser.findOne({ $or: [{ email: caseInsensitiveQuery }, { loginId: caseInsensitiveQuery }] }).select("+password +mustChangePassword").lean();
                    
                    if (!user) {
                        console.warn(`[ScrapCentre Auth] User not found for identifier: "${identifier}"`);
                        return null;
                    }
                    const storedPw = (user as any).password;
                    const isHashed = storedPw?.startsWith("$2");
                    const isMatch = isHashed ? await bcrypt.compare(credentials.password, storedPw) : storedPw === credentials.password;
                    if (!isMatch) {
                        console.warn(`[ScrapCentre Auth] Password mismatch for identifier: "${identifier}". Input password length: ${credentials.password.length}`);
                        return null;
                    }
                    console.log(`[ScrapCentre Auth] Login successful for: "${identifier}"`);
                    return { id: (user as any)._id.toString(), name: (user as any).name, email: (user as any).email, role: "scrapcentre", mustChangePassword: (user as any).mustChangePassword === true }
                } catch (err: any) {
                    console.error("[ScrapCentre Auth] Database error:", err);
                    if (err.code === 'EREFUSED' || err.name === 'MongooseServerSelectionError' || err.message?.includes('timeout') || err.message?.includes('connect') || err.message?.includes('selection')) {
                        throw new Error("DATABASE_CONNECTION_ERROR");
                    }
                    throw new Error("AUTHENTICATION_FAILED");
                }
            }
        }),
        CredentialsProvider({
            id: "b2b-credentials",
            name: "Partner Portal",
            credentials: {
                userId: { label: "Partner ID", type: "text" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                if (!credentials?.userId || !credentials?.password) return null;
                await connectToDatabase();
                if (await isLoginRateLimited(credentials.userId)) {
                    throw new Error("TOO_MANY_ATTEMPTS");
                }
                try {
                    const trimmedUserId = credentials.userId.trim();
                    const escapedUserId = trimmedUserId.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
                    console.log(`[B2B Auth] Searching for partner ID: "${trimmedUserId}"`);
                    const partner = await B2BPartner.findOne({ $or: [{ userId: { $regex: new RegExp("^" + escapedUserId + "$", "i") } }, { email: { $regex: new RegExp("^" + escapedUserId + "$", "i") } }] }).select("+password +mustChangePassword").lean();
                    if (!partner) {
                        console.warn(`[B2B Auth] Partner not found for ID/Email: "${trimmedUserId}"`);
                        return null;
                    }
 
                    const storedPw = (partner as any).password;
                    const isHashed = storedPw?.startsWith("$2");
                    const isMatch = isHashed ? await bcrypt.compare(credentials.password, storedPw) : storedPw === credentials.password;
                    if (!isMatch) {
                        console.warn(`[B2B Auth] Password mismatch for partner ID: "${trimmedUserId}". Input password length: ${credentials.password.length}`);
                        return null;
                    }
                    console.log(`[B2B Auth] Login successful for partner ID: "${trimmedUserId}"`);
                    return { id: (partner as any)._id.toString(), name: (partner as any).businessName, email: (partner as any).email, role: "partner", partnerId: (partner as any).userId, mustChangePassword: (partner as any).mustChangePassword === true }
                } catch (err: any) {
                    console.error("[B2B Auth] Error:", err);
                    if (err.code === 'EREFUSED' || err.name === 'MongooseServerSelectionError' || err.message?.includes('timeout') || err.message?.includes('connect') || err.message?.includes('selection')) {
                        throw new Error("DATABASE_CONNECTION_ERROR");
                    }
                    return null;
                }
            }
        }),
        CredentialsProvider({
            id: "executive-credentials",
            name: "Executive Portal",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) return null;
                await connectToDatabase();
                if (await isLoginRateLimited(credentials.email)) {
                    throw new Error("TOO_MANY_ATTEMPTS");
                }
                try {
                    const emailTrimmed = credentials.email.trim().toLowerCase();
                    console.log(`[Executive Auth] Searching for email: "${emailTrimmed}"`);
                    const user = await Executive.findOne({ email: emailTrimmed }).select("+password +mustChangePassword").lean();
                    if (!user) {
                        console.warn(`[Executive Auth] Executive not found for email: "${emailTrimmed}"`);
                        return null;
                    }
 
                    const storedPw = (user as any).password;
                    const isHashed = storedPw?.startsWith("$2");
                    const isMatch = isHashed ? await bcrypt.compare(credentials.password, storedPw) : storedPw === credentials.password;
                    if (!isMatch) {
                        console.warn(`[Executive Auth] Password mismatch for email: "${emailTrimmed}". Input password length: ${credentials.password.length}`);
                        return null;
                    }
                    console.log(`[Executive Auth] Login successful for email: "${emailTrimmed}"`);
                    return { id: (user as any)._id.toString(), name: (user as any).name, email: (user as any).email, role: "executive", mustChangePassword: (user as any).mustChangePassword === true }
                } catch (err: any) {
                    console.error("[Executive Auth] Error:", err);
                    if (err.code === 'EREFUSED' || err.name === 'MongooseServerSelectionError' || err.message?.includes('timeout') || err.message?.includes('connect') || err.message?.includes('selection')) {
                        throw new Error("DATABASE_CONNECTION_ERROR");
                    }
                    return null;
                }
            }
        }),
        CredentialsProvider({
            id: "rvsf-credentials",
            name: "RVSF Portal",
            credentials: {
                rvsfId: { label: "RVSF ID", type: "text" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                if (!credentials?.rvsfId || !credentials?.password) return null;
                await connectToDatabase();
                if (await isLoginRateLimited(credentials.rvsfId)) {
                    throw new Error("TOO_MANY_ATTEMPTS");
                }
                try {
                    const identifier = credentials.rvsfId.trim();
                    const emailIdentifier = identifier.toLowerCase();
                    const escapedIdentifier = identifier.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
                    const caseInsensitiveQuery = { $regex: new RegExp("^" + escapedIdentifier + "$", "i") };
                    console.log(`[RVSF Auth] Searching for identifier: "${identifier}"`);
                    const rvsf = await RVSFUser.findOne({ $or: [{ rvsfId: caseInsensitiveQuery }, { email: caseInsensitiveQuery }] }).select("+password +mustChangePassword").lean();
                    if (!rvsf) {
                        console.warn(`[RVSF Auth] RVSF user not found for identifier: "${identifier}"`);
                        return null;
                    }
 
                    const storedPw = (rvsf as any).password;
                    const isHashed = storedPw?.startsWith("$2");
                    const isMatch = isHashed ? await bcrypt.compare(credentials.password, storedPw) : storedPw === credentials.password;
                    if (!isMatch) {
                        console.warn(`[RVSF Auth] Password mismatch for identifier: "${identifier}". Input password length: ${credentials.password.length}`);
                        return null;
                    }
                    console.log(`[RVSF Auth] Login successful for identifier: "${identifier}"`);
                    return { 
                        id: (rvsf as any)._id.toString(), 
                        name: (rvsf as any).name, 
                        email: (rvsf as any).email, 
                        role: "rvsf",
                        rvsfId: (rvsf as any).rvsfId,
                        mustChangePassword: (rvsf as any).mustChangePassword === true
                    }
                } catch (err: any) {
                    console.error("[RVSF Auth] Error:", err);
                    if (err.code === 'EREFUSED' || err.name === 'MongooseServerSelectionError' || err.message?.includes('timeout') || err.message?.includes('connect') || err.message?.includes('selection')) {
                        throw new Error("DATABASE_CONNECTION_ERROR");
                    }
                    throw new Error("AUTHENTICATION_FAILED");
                }
            }
        }),
        CredentialsProvider({
            id: "cc-operator-credentials",
            name: "CC Operator Portal",
            credentials: {
                email: { label: "Email", type: "text" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) return null;
                try {
                    await connectToDatabase();
                    const bcrypt = (await import("bcryptjs")).default;
                    const emailTrimmed = credentials.email.trim().toLowerCase();
                    console.log(`[CC Operator Auth] Searching for email: "${emailTrimmed}"`);
                    let op = await CCOperator.findOne({ email: emailTrimmed }).select("+password +mustChangePassword").lean();
                    let isPersonal = false;
                    if (!op) {
                        op = await PersonalCCOperator.findOne({ email: emailTrimmed }).select("+password +mustChangePassword").lean();
                        isPersonal = true;
                    }
                    
                    if (!op) {
                        console.warn(`[CC Operator Auth] CC Operator not found for email: "${emailTrimmed}"`);
                        return null;
                    }
                    const storedPw = (op as any).password;
                    const isMatch = await bcrypt.compare(credentials.password, storedPw);
                    
                    if (!isMatch) {
                        console.warn(`[CC Operator Auth] Password mismatch for: "${emailTrimmed}". Input password length: ${credentials.password.length}`);
                        return null;
                    }
                    console.log(`[CC Operator Auth] Login successful for email: "${emailTrimmed}"`);
                    return {
                        id: (op as any)._id.toString(),
                        name: (op as any).name,
                        email: (op as any).email,
                        role: "cc_operator",
                        ccId: (op as any).ccId,
                        mustChangePassword: (op as any).mustChangePassword === true,
                        ...(isPersonal ? { partnerId: (op as any).partnerId } : { rvsfId: (op as any).rvsfId })
                    }
                } catch (err: any) {
                    console.error("[CC Operator Auth] Error:", err);
                    if (err.code === 'EREFUSED' || err.name === 'MongooseServerSelectionError' || err.message?.includes('timeout') || err.message?.includes('connect') || err.message?.includes('selection')) {
                        throw new Error("DATABASE_CONNECTION_ERROR");
                    }
                    throw new Error("AUTHENTICATION_FAILED");
                }
            }
        }),
        CredentialsProvider({
            id: "phone-otp",
            name: "Phone Number",
            credentials: {
                phone: { label: "Phone", type: "text" },
                otp: { label: "OTP", type: "text" },
                name: { label: "Name", type: "text" },
            },
            async authorize(credentials) {
                if (!credentials?.phone || credentials?.otp !== "000000" || process.env.NODE_ENV === "production") return null;
                try {
                    await connectToDatabase();
                    let user = await User.findOne({ phone: credentials.phone });
                    const displayName = credentials.name?.trim() || `User ${credentials.phone.slice(-4)}`;
                    const dummyEmail = `${credentials.phone.replace('+', '')}@otp.com`;

                    if (!user) {
                        user = await User.create({
                            name: displayName,
                            email: dummyEmail,
                            phone: credentials.phone,
                            role: "client",
                            provider: "phone-otp"
                        });
                        console.log(`[Master Auth] New user created: ${displayName} (${credentials.phone})`);
                    } else {
                        if (!user.name || user.name.startsWith("User ")) {
                            user.name = displayName;
                            await user.save();
                        }
                    }
                    return { 
                        id: user._id.toString(), 
                        name: user.name, 
                        email: user.email ?? null, 
                        role: user.role || "client" 
                    }
                } catch (err: any) {
                    console.error("Master OTP Error:", err);
                    if (err.code === 'EREFUSED' || err.name === 'MongooseServerSelectionError' || err.message?.includes('timeout') || err.message?.includes('connect') || err.message?.includes('selection')) {
                        throw new Error("DATABASE_CONNECTION_ERROR");
                    }
                    throw new Error(`AUTH_ERROR: ${err.message || "Unknown error during phone sign-in"}`);
                }
            }
        }),
        CredentialsProvider({
            id: "msg91",
            name: "MSG91 OTP",
            credentials: {
                data: { label: "Data", type: "text" },
            },
            async authorize(credentials) {
                if (!credentials?.data) return null;
                try {
                    const parsed = JSON.parse(credentials.data);
                    // MSG91 verification response usually contains the mobile number in 'mobile'
                    const mobile = parsed.mobile; 
                    if (!mobile) {
                        console.error("MSG91 Error: Mobile number not found in response", parsed);
                        return null;
                    }

                    await connectToDatabase();
                    const dummyEmail = `${mobile}@otp.com`;
                    let user = await User.findOne({ email: dummyEmail });
                    if (!user) {
                        user = await User.create({
                           name: `User ${mobile.slice(-4)}`,
                           email: dummyEmail,
                           role: "client",
                           provider: "msg91"
                        });
                    }
                    return { id: user._id.toString(), name: user.name, email: user.email, role: "client" }
                } catch (err) {
                    console.error("MSG91 Auth Error:", err);
                    return null;
                }
            }
        }),
        CredentialsProvider({
            id: "firebase-otp",
            name: "Firebase OTP",
            credentials: {
                idToken: { label: "ID Token", type: "text" },
                name: { label: "Name", type: "text" },
            },
            async authorize(credentials) {
                if (!credentials?.idToken) return null;
                try {
                    // 1. Verify Firebase ID Token
                    const decodedToken = await adminAuth.verifyIdToken(credentials.idToken);
                    const phoneNumber = decodedToken.phone_number;

                    if (!phoneNumber) {
                        console.error("[Firebase Auth] No phone number in token");
                        return null;
                    }

                    // 2. Connect to Database
                    await connectToDatabase();

                    // 3. Find or Create User by phone
                    let user = await User.findOne({ phone: phoneNumber });
                    const displayName = credentials.name?.trim() || `User ${phoneNumber.slice(-4)}`;
                    const dummyEmail = `${phoneNumber.replace('+', '')}@otp.com`;

                    if (!user) {
                        user = await User.create({
                            name: displayName,
                            email: dummyEmail,
                            phone: phoneNumber,
                            role: "client",
                            provider: "firebase-otp",
                        });
                        console.log(`[Firebase Auth] New user created: ${displayName} (${phoneNumber})`);
                    } else {
                        // Update name if it's still the default
                        if (!user.name || user.name.startsWith("User ")) {
                            user.name = displayName;
                            await user.save();
                        }
                    }

                    return { 
                        id: user._id.toString(), 
                        name: user.name, 
                        email: user.email ?? null,
                        role: user.role || "client" 
                    };
                } catch (err) {
                    console.error("[Firebase Auth] Error verifying token:", err);
                    return null;
                }
            }
        }),
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        }),
    ],
    callbacks: {
        async signIn({ user, account }) {
            if (account?.provider === "google") {
                try {
                    await connectToDatabase();
                    const existingUser = await User.findOne({ email: user.email });
                    if (!existingUser) {
                        await User.create({ name: user.name, email: user.email, image: user.image, role: "client", provider: "google" });
                    }
                    return true;
                } catch (error) {
                    console.error("Error in Google Sign In:", error);
                    return false;
                }
            }
            return true;
        },
        async jwt({ token, user, account, trigger, session }) {
            if (trigger === "update" && session) {
                if (session.mustChangePassword !== undefined) {
                    token.mustChangePassword = session.mustChangePassword;
                }
            }
            if (user) {
                if (account?.provider === "google") {
                    await connectToDatabase();
                    const dbUser = await User.findOne({ email: user.email });
                    if (dbUser) {
                        token.role = dbUser.role;
                        token.id = dbUser._id.toString();
                        token.mustChangePassword = dbUser.mustChangePassword === true;
                    }
                } else {
                    token.role = (user as any).role || "client";
                    token.id = user.id;
                    token.mustChangePassword = (user as any).mustChangePassword === true;
                    if ((user as any).rvsfId) token.rvsfId = (user as any).rvsfId;
                    if ((user as any).ccId) token.ccId = (user as any).ccId;
                    if ((user as any).partnerId) token.partnerId = (user as any).partnerId;
                }
            }
            return token
        },
        async session({ session, token }) {
            if (session.user) {
                (session.user as any).role = token.role;
                (session.user as any).id = token.id;
                (session.user as any).mustChangePassword = token.mustChangePassword;
                if (token.rvsfId) (session.user as any).rvsfId = token.rvsfId;
                if (token.ccId) (session.user as any).ccId = token.ccId;
                if (token.partnerId) (session.user as any).partnerId = token.partnerId;
            }
            return session
        },
    },
    pages: { signIn: "/login" },
    session: { strategy: "jwt" },
}

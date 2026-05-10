import { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials"
import connectToDatabase from "@/lib/db"
import bcrypt from "bcryptjs"

// Static imports to prevent model re-registration errors
import User from "@/models/User"
import ScrapCentreUser from "@/models/ScrapCentreUser"
import B2BPartner from "@/models/B2BPartner"
import Executive from "@/models/Executive"

export const authOptions: NextAuthOptions = {
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
                
                // 1. DEBUG BYPASS
                if (credentials.email === "debug@test.com" && credentials.password === "debug123") {
                    console.log("[Auth] DEBUG LOGIN SUCCESS");
                    return { id: "debug-id", name: "Debug User", email: "debug@test.com", role: "admin" }
                }

                try {
                    await connectToDatabase();
                    const identifier = credentials.email.toLowerCase();
                    const password = credentials.password;

                    // 2. Env Fallback (Admin)
                    const envAdminEmail = process.env.ADMIN_EMAIL;
                    const envAdminPassword = process.env.ADMIN_PASSWORD;
                    console.log(`[Auth] Env Admin Loaded: ${!!envAdminEmail}, Email starts with: ${envAdminEmail?.substring(0, 3)}`);

                    if (envAdminEmail && envAdminPassword && 
                        identifier === envAdminEmail.toLowerCase() && 
                        password === envAdminPassword) {
                        console.log("[Auth] Env Admin Match");
                        return { id: "env-admin", name: "System Admin", email: envAdminEmail, role: "admin" }
                    }

                    // 3. Standard User Database
                    const dbUser = await User.findOne({ email: identifier }).select("+password").lean();
                    if (dbUser) {
                        const isMatch = await bcrypt.compare(password, (dbUser as any).password);
                        console.log(`[Auth] User DB Match: ${identifier}, Match: ${isMatch}`);
                        if (isMatch) return { id: (dbUser as any)._id.toString(), name: (dbUser as any).name, email: (dbUser as any).email, role: (dbUser as any).role || "client" }
                    }

                    // 4. ScrapCentre Database
                    const scrapUser = await ScrapCentreUser.findOne({ $or: [{ email: identifier }, { loginId: identifier }] }).select("+password").lean();
                    if (scrapUser) {
                        const isMatch = await bcrypt.compare(password, (scrapUser as any).password);
                        console.log(`[Auth] ScrapCentre DB Match: ${identifier}, Match: ${isMatch}`);
                        if (isMatch) return { id: (scrapUser as any)._id.toString(), name: (scrapUser as any).name, email: (scrapUser as any).email, role: "scrapcentre" }
                    }

                    // 5. B2B Database
                    const partner = await B2BPartner.findOne({ userId: identifier }).select("+password").lean();
                    if (partner) {
                        const storedPw = (partner as any).password;
                        const isHashed = storedPw?.startsWith("$2");
                        const isMatch = isHashed ? await bcrypt.compare(password, storedPw) : storedPw === password;
                        console.log(`[Auth] B2B Partner Match: ${identifier}, Match: ${isMatch}`);
                        if (isMatch) return { id: (partner as any)._id.toString(), name: (partner as any).businessName, email: (partner as any).email, role: "partner" }
                    }

                } catch (err: any) {
                    console.error("[Auth] Database error during authorize:", err);
                    // Temporarily pass the raw error for debugging
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
                try {
                    await connectToDatabase();
                    const identifier = credentials.email.toLowerCase();
                    const user = await ScrapCentreUser.findOne({ $or: [{ email: identifier }, { loginId: identifier }] }).select("+password").lean();
                    
                    if (!user) return null;
                    const isMatch = await bcrypt.compare(credentials.password, (user as any).password);
                    console.log(`[ScrapCentre Auth] ID: ${identifier}, Match: ${isMatch}`);
                    if (!isMatch) return null;
                    
                    return { id: (user as any)._id.toString(), name: (user as any).name, email: (user as any).email, role: "scrapcentre" }
                } catch (err: any) {
                    console.error("[ScrapCentre Auth] Database error:", err);
                    if (err.code === 'EREFUSED' || err.name === 'MongooseServerSelectionError') {
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
                try {
                    await connectToDatabase();
                    const partner = await B2BPartner.findOne({ userId: credentials.userId }).select("+password").lean();
                    if (!partner) return null;

                    const storedPw = (partner as any).password;
                    const isHashed = storedPw?.startsWith("$2");
                    const isMatch = isHashed ? await bcrypt.compare(credentials.password, storedPw) : storedPw === credentials.password;
                    
                    console.log(`[B2B Auth] ID: ${credentials.userId}, Match: ${isMatch}`);
                    if (!isMatch) return null;

                    return { id: (partner as any)._id.toString(), name: (partner as any).businessName, email: (partner as any).email, role: "partner" }
                } catch (err) {
                    console.error("[B2B Auth] Error:", err);
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
                try {
                    await connectToDatabase();
                    const user = await Executive.findOne({ email: credentials.email.toLowerCase() }).select("+password").lean();
                    if (!user) return null;
                    const isMatch = await bcrypt.compare(credentials.password, (user as any).password);
                    if (!isMatch) return null;
                    return { id: (user as any)._id.toString(), name: (user as any).name, email: (user as any).email, role: "executive" }
                } catch (err) {
                    return null;
                }
            }
        }),
        CredentialsProvider({
            id: "phone-otp",
            name: "Phone Number",
            credentials: {
                phone: { label: "Phone", type: "text" },
                otp: { label: "OTP", type: "text" },
            },
            async authorize(credentials) {
                if (!credentials?.phone || credentials?.otp !== "1234") return null;
                try {
                    await connectToDatabase();
                    const dummyEmail = `${credentials.phone}@otp.com`;
                    let user = await User.findOne({ email: dummyEmail });
                    if (!user) {
                        user = await User.create({
                           name: `User ${credentials.phone.slice(-4)}`,
                           email: dummyEmail,
                           role: "client",
                           provider: "phone"
                        });
                    }
                    return { id: user._id.toString(), name: user.name, email: user.email, role: "client" }
                } catch (err) {
                    console.error(err);
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
        async jwt({ token, user, account }) {
            if (user) {
                if (account?.provider === "google") {
                    await connectToDatabase();
                    const dbUser = await User.findOne({ email: user.email });
                    if (dbUser) {
                        token.role = dbUser.role;
                        token.id = dbUser._id.toString();
                    }
                } else {
                    token.role = (user as any).role || "client";
                    token.id = user.id;
                }
            }
            return token
        },
        async session({ session, token }) {
            if (session.user) {
                (session.user as any).role = token.role;
                (session.user as any).id = token.id;
            }
            return session
        },
    },
    pages: { signIn: "/login" },
    session: { strategy: "jwt" },
}

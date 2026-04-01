import { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"

import CredentialsProvider from "next-auth/providers/credentials"
import connectToDatabase from "@/lib/db"
import User from "@/models/User"
import B2BPartner from "@/models/B2BPartner"
import bcrypt from "bcryptjs"

export const authOptions: NextAuthOptions = {
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        }),

        CredentialsProvider({
            id: "credentials",
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    return null;
                }

                await connectToDatabase();

                const user = await User.findOne({ email: credentials.email.toLowerCase() }).select("+password");

                if (!user) {
                    return null;
                }

                // Check password
                const isMatch = await bcrypt.compare(credentials.password, user.password);

                if (!isMatch) {
                    return null;
                }

                return {
                    id: user._id.toString(),
                    name: user.name,
                    email: user.email,
                    role: user.role,
                }
            },
        }),
        CredentialsProvider({
            id: "b2b-credentials",
            name: "Partner Login",
            credentials: {
                userId: { label: "User ID", type: "text" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                if (!credentials?.userId || !credentials?.password) {
                    return null;
                }

                await connectToDatabase();

                const partner = await B2BPartner.findOne({ userId: credentials.userId });

                if (!partner) {
                    return null;
                }

                // Check password (Plain text for now as per legacy implementation, should be hashed later)
                // If the stored password doesn't match
                if (partner.password !== credentials.password) {
                    return null;
                }

                return {
                    id: partner._id.toString(),
                    name: partner.businessName,
                    email: partner.email,
                    role: "partner", // specialized role
                }
            },
        }),
    ],
    callbacks: {
        async signIn({ user, account, profile }) {
            if (account?.provider === "google") {
                try {
                    await connectToDatabase();
                    const existingUser = await User.findOne({ email: user.email });

                    if (!existingUser) {
                        try {
                            await User.create({
                                name: user.name,
                                email: user.email,
                                image: user.image,
                                role: "client",
                                provider: "google"
                            });
                        } catch (createError) {
                            console.error("Error creating user:", createError);
                            return false;
                        }
                    } else {
                        // Optional: Update existing user's image or provider if needed
                        // But per requirements, just link (which happens automatically by email match logic mostly)
                        // If implementing explicit provider linking logic if not supported by default:
                        // existingUser.provider = "google" (or handle merge logic)
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
            if (user) { // On initial sign in
                if (account?.provider === "google") {
                    // Fetch user from DB to get role because the `user` object from OAuth might not have it set correctly yet if we just created it
                    await connectToDatabase();
                    const dbUser = await User.findOne({ email: user.email });
                    if (dbUser) {
                        token.role = dbUser.role;
                        token.id = dbUser._id.toString();
                    }
                } else {
                    token.role = (user as any).role || "client"
                    token.id = (user as any).id;
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
    pages: {
        signIn: "/login",
    },
    session: {
        strategy: "jwt",
    },
}



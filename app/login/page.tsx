"use client"

import React, { useState, useEffect } from "react"
import { signIn, getSession, useSession } from "next-auth/react"
import { motion, AnimatePresence } from "framer-motion"
import { Mail, Lock, ArrowRight, Loader2, Building2, User, Eye, EyeOff, Phone, ShieldCheck } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
import { useRouter, useSearchParams } from "next/navigation"
import { auth } from "@/lib/firebase"
import { RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult } from "firebase/auth"
import { landingForRole } from "@/lib/landing-by-role"

export default function LoginPage() {
    return (
        <React.Suspense fallback={
            <div className="h-screen w-full flex items-center justify-center bg-gray-50">
                <Loader2 className="w-10 h-10 animate-spin text-orange-600" />
            </div>
        }>
            <LoginContent />
        </React.Suspense>
    )
}

function LoginContent() {
    const [activeTab, setActiveTab] = useState<"standard" | "b2b">("standard")
    const [isLogin, setIsLogin] = useState(true)
    const { toast } = useToast()
    const router = useRouter()
    const searchParams = useSearchParams()
    const { data: existingSession, status: sessionStatus } = useSession()

    // If a user is already authenticated, skip the form and send them to
    // their role-appropriate landing page. Honors ?callbackUrl=… if present.
    // Anonymous users (status === "unauthenticated") fall through and see
    // the normal login surface.
    useEffect(() => {
        if (sessionStatus !== "authenticated") return
        const role = (existingSession?.user as any)?.role
        const cb = searchParams.get("callbackUrl")
        router.replace(cb || landingForRole(role))
    }, [sessionStatus, existingSession, router, searchParams])

    // Auto-select B2B tab if redirected from partner-register
    useEffect(() => {
        if (searchParams.get("tab") === "b2b") {
            setActiveTab("b2b")
        }

        // Handle NextAuth URL errors
        const error = searchParams.get("error")
        if (error) {
            let errorMessage = "An unexpected error occurred during login."
            if (error === "CredentialsSignin") {
                errorMessage = "Invalid credentials provided."
            } else if (error === "OAuthAccountNotLinked") {
                errorMessage = "Email already in use with a different login method."
            } else if (error === "AccessDenied") {
                errorMessage = "Access denied. You do not have permission to log in."
            } else if (error === "OAuthSignin" || error === "OAuthCallback") {
                errorMessage = "Failed to communicate with Google authentication."
            } else if (error === "Configuration") {
                errorMessage = "Server authentication configuration error."
            } else if (error.includes("DATABASE_CONNECTION_ERROR")) {
                errorMessage = "Database connection failed. Please ensure your IP is whitelisted in MongoDB Atlas."
            }

            // Using setTimeout to ensure toast fires correctly post-render mounting
            setTimeout(() => {
                toast({
                    title: "Authentication Error",
                    description: errorMessage,
                    variant: "destructive",
                })
            }, 100)
        }
    }, [searchParams, toast])

    // Firebase Phone Auth Integration
    const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null)
    const [recaptchaVerifier, setRecaptchaVerifier] = useState<RecaptchaVerifier | null>(null)

    useEffect(() => {
        if (!recaptchaVerifier) {
            const verifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
                size: 'invisible',
                callback: () => {
                    console.log("Recaptcha verified");
                },
                'expired-callback': () => {
                    toast({
                        title: "Recaptcha Expired",
                        description: "Please try again.",
                        variant: "destructive"
                    });
                }
            });
            setRecaptchaVerifier(verifier);
        }

        return () => {
            if (recaptchaVerifier) {
                recaptchaVerifier.clear();
            }
        };
    }, [recaptchaVerifier]);

    const handleFirebaseLoginSuccess = async (idToken: string) => {
        setIsLoading(true);
        try {
            const result = await signIn("firebase-otp", {
                idToken,
                redirect: false,
            });

            if (result?.error) {
                toast({
                    title: "Login Failed",
                    description: result.error || "Could not complete authentication",
                    variant: "destructive"
                });
            } else {
                toast({ title: "Welcome!", description: "Successfully logged in." });
                const callbackUrl = searchParams.get("callbackUrl") || "/";
                window.location.href = callbackUrl;
            }
        } catch (error) {
            console.error("Auth Error:", error);
            toast({ title: "Error", description: "Internal server error during authentication", variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    };

    // Standard (User/Admin) State
    const [name, setName] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)

    // Phone Auth State
    const [loginMethod, setLoginMethod] = useState<"phone" | "email">("phone")
    const [phone, setPhone] = useState("")
    const [otp, setOtp] = useState("")
    const [otpSent, setOtpSent] = useState(false)
    const [isSandboxMode, setIsSandboxMode] = useState(false)

    // B2B State
    const [b2bUserId, setB2BUserId] = useState("")
    const [b2bPassword, setB2BPassword] = useState("")
    const [showB2BPassword, setShowB2BPassword] = useState(false)

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            if (!isLogin) {
                // Registration Flow
                const res = await fetch("/api/register", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ name, email, password }),
                })

                if (!res.ok) {
                    const data = await res.json()
                    toast({
                        title: "Registration Failed",
                        description: data.message || "Something went wrong. Please try again.",
                        variant: "destructive"
                    })
                    setIsLoading(false)
                    return
                }
                toast({
                    title: "Account Created",
                    description: "You've successfully registered. Signing you in...",
                })
            }

            // Login Flow
            const result = await signIn("credentials", {
                email,
                password,
                redirect: false,
            })

            if (result?.error) {
                setIsLoading(false)
                let errorMsg = "Access denied. Please check your credentials."
                
                if (result.error.includes("AUTH_ERROR:")) {
                    errorMsg = result.error.split("AUTH_ERROR:")[1]
                } else if (result.error.includes("DATABASE_CONNECTION_ERROR")) {
                    errorMsg = "Database connection failed. Please ensure your IP is whitelisted in MongoDB Atlas."
                } else if (result.error !== "CredentialsSignin") {
                    errorMsg = result.error
                }

                toast({
                    title: "Authentication Error",
                    description: errorMsg,
                    variant: "destructive"
                })
            } else {
                const session = await getSession()
                const role = (session?.user as any)?.role

                toast({
                    title: "Authentication Successful",
                    description: `Welcome back, ${session?.user?.name || 'User'}!`,
                })

                const callbackUrl = searchParams.get("callbackUrl")
                if (callbackUrl) {
                    window.location.href = callbackUrl
                } else if (!isLogin) {
                    // If they just registered, take them to their profile
                    window.location.href = "/profile"
                } else {
                    // Use the shared LANDING_BY_ROLE map (single source of
                    // truth, also consumed by /post-login and /rvsf) so that
                    // every login surface routes consistently. Unknown roles
                    // fall back to "/" via landingForRole().
                    window.location.href = landingForRole(role)
                }
            }
        } catch (error) {
            console.error(error)
            setIsLoading(false)
            toast({
                title: "Error",
                description: "An unexpected error occurred. Please try again.",
                variant: "destructive"
            })
        }
    }

    const handlePhoneAuth = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!otpSent) {
            if (phone.length !== 10) {
                toast({ title: "Invalid Phone", description: "Enter a valid 10-digit number.", variant: "destructive" })
                return
            }
            setIsLoading(true)

            
            try {
                if (!recaptchaVerifier) throw new Error("Recaptcha not initialized");
                
                const formattedPhone = `+91${phone}`;
                const confirmation = await signInWithPhoneNumber(auth, formattedPhone, recaptchaVerifier);
                setConfirmationResult(confirmation);
                setIsSandboxMode(false);
                setOtpSent(true);
                toast({ title: "OTP Sent", description: "Please check your phone for the verification code." });
            } catch (error: any) {
                console.warn("Firebase SMS failed, falling back to Local Sandbox:", error);
                setIsSandboxMode(true);
                setOtpSent(true);
                toast({
                    title: "Sandbox Mode Activated",
                    description: "Firebase credentials invalid. Use verification code '000000' to sign in.",
                });
            } finally {
                setIsLoading(false);
            }
            return
        }

        setIsLoading(true)
        try {
            if (isSandboxMode) {
                if (otp !== "000000") {
                    throw new Error("Invalid sandbox verification code. Use '000000'.");
                }
                const result = await signIn("phone-otp", {
                    phone: `+91${phone}`,
                    otp: "000000",
                    name: name || `User ${phone.slice(-4)}`,
                    redirect: false,
                });

                if (result?.error) {
                    throw new Error(result.error);
                } else {
                    toast({ title: "Welcome!", description: "Successfully logged in via Sandbox Mode." });
                    const callbackUrl = searchParams.get("callbackUrl") || "/";
                    window.location.href = callbackUrl;
                }
            } else {
                if (!confirmationResult) throw new Error("No confirmation result found");
                
                const userCredential = await confirmationResult.confirm(otp);
                const idToken = await userCredential.user.getIdToken();
                
                await handleFirebaseLoginSuccess(idToken);
            }
        } catch (error: any) {
            console.error("OTP Verification Error:", error);
            setIsLoading(false)
            toast({
                title: "Verification Failed",
                description: error.message || "Invalid OTP entered.",
                variant: "destructive"
            })
        }
    }

    const handleB2BLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            const result = await signIn("b2b-credentials", {
                userId: b2bUserId,
                password: b2bPassword,
                redirect: false,
            })

            if (result?.error) {
                setIsLoading(false)
                let errorMsg = "Invalid Partner ID or Password. Please check your credentials."
                if (result.error.includes("DATABASE_CONNECTION_ERROR")) {
                    errorMsg = "Database connection failed. Please ensure your IP is whitelisted in MongoDB Atlas."
                }
                toast({
                    title: "B2B Login Failed",
                    description: errorMsg,
                    variant: "destructive"
                })
            } else {
                toast({
                    title: "Welcome Partner",
                    description: "Redirecting to your marketplace...",
                })
                // b2b-credentials provider returns role=rvsf_admin in v2, so
                // the right landing is the RVSF marketplace. Route through the
                // shared dispatcher so any role drift is handled in one place.
                const callbackUrl = searchParams.get("callbackUrl")
                window.location.href = callbackUrl || "/post-login"
            }
        } catch (error) {
            console.error(error)
            setIsLoading(false)
            toast({
                title: "Error",
                description: "An unexpected error occurred. Please try again.",
                variant: "destructive"
            })
        }
    }



    const handleGoogleLogin = (callbackUrl = "/") => {
        setIsLoading(true)
        signIn("google", { callbackUrl })
    }

    return (
        <div className="relative h-screen overflow-hidden flex items-center justify-center font-sans">
            {/* Full Background Image - fixed so it covers the whole viewport incl. behind navbar */}
            <div className="fixed inset-0 z-0">
                <img 
                    src="/login.png" 
                    alt="Background" 
                    className="w-full h-full object-fill"
                />
            </div>

            {/* Login Card - aligned right, clear background */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="relative z-10 w-full max-w-sm mx-4 lg:ml-auto lg:mr-64" style={{ marginTop: '72px' }}
            >
                <div className="bg-white/95 backdrop-blur-xl border border-gray-200 p-5 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] overflow-hidden relative group">
                    {/* Glass Glow Effects */}
                    <div className="absolute -top-16 -left-16 w-32 h-32 bg-[#E31E24]/20 rounded-full blur-3xl opacity-50 group-hover:opacity-70 transition-opacity duration-700" />
                    <div className="absolute -bottom-16 -right-16 w-32 h-32 bg-[#E31E24]/20 rounded-full blur-3xl opacity-50 group-hover:opacity-70 transition-opacity duration-700" />

                    <div className="relative z-10 space-y-3">
                        {/* Header */}
                        <div className="text-center space-y-0.5">
                            <h2 className="text-3xl font-sans font-semibold text-slate-900 tracking-tight">
                                {activeTab === "standard" ? (loginMethod === "phone" ? "Welcome" : isLogin ? "Welcome Back" : "Create Account") : "Partner Portal"}
                            </h2>
                            <p className="text-gray-600 text-sm font-medium">
                                {activeTab === "standard"
                                    ? (loginMethod === "phone" ? "Sign in with your phone number" : isLogin ? "Please enter your details to sign in" : "Join us to get the best value for your scrap")
                                    : "Access for registered corporate partners"}
                            </p>
                        </div>

                        {/* Custom Tabs */}
                        <div className="flex p-1 bg-gray-100 border border-gray-200 rounded-xl">
                            <button
                                onClick={() => setActiveTab("standard")}
                                className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all duration-300 ${activeTab === "standard"
                                    ? "bg-white text-[#E31E24] shadow-md"
                                    : "text-gray-500 hover:text-gray-900 hover:bg-white/50"
                                    }`}
                            >
                                <User className="w-3.5 h-3.5" />
                                User
                            </button>
                            <button
                                onClick={() => setActiveTab("b2b")}
                                className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all duration-300 ${activeTab === "b2b"
                                    ? "bg-white text-[#E31E24] shadow-md"
                                    : "text-gray-500 hover:text-gray-900 hover:bg-white/50"
                                    }`}
                            >
                                <Building2 className="w-3.5 h-3.5" />
                                B2B Partner
                            </button>
                        </div>

                        <AnimatePresence mode="wait">
                            {activeTab === "standard" ? (
                                <motion.div
                                    key={isLogin ? "login" : "register"}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={{ duration: 0.2 }}
                                    className="space-y-3"
                                >
                                    {/* Login Method Toggle */}
                                    <div className="flex gap-1.5 p-1 bg-gray-100 border border-gray-200 rounded-lg">
                                        <button
                                            onClick={() => { setLoginMethod("phone"); setOtpSent(false); setOtp(""); }}
                                            className={`flex-1 py-1.5 text-[9px] font-bold rounded-md transition-all uppercase tracking-wider ${loginMethod === "phone" ? "bg-[#E31E24] text-white" : "text-gray-500 hover:text-gray-900 hover:bg-white/50"}`}
                                        >
                                            Phone OTP
                                        </button>
                                        <button
                                            onClick={() => setLoginMethod("email")}
                                            className={`flex-1 py-1.5 text-[9px] font-bold rounded-md transition-all uppercase tracking-wider ${loginMethod === "email" ? "bg-[#E31E24] text-white" : "text-gray-500 hover:text-gray-900 hover:bg-white/50"}`}
                                        >
                                            Email / Pass
                                        </button>
                                    </div>

                                    {loginMethod === "phone" ? (
                                        <div className="space-y-2">
                                            <div id="recaptcha-container"></div>
                                            <form onSubmit={handlePhoneAuth} className="space-y-2">
                                                <div className="space-y-1.5">
                                                    <label className="text-xs font-bold text-gray-800 ml-1 uppercase tracking-wider">Phone Number</label>
                                                    <div className="relative group">
                                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                            <Phone className="h-4 w-4 text-gray-400 group-focus-within:text-[#E31E24] transition-colors" />
                                                        </div>
                                                        <input
                                                            type="tel"
                                                            required
                                                            disabled={otpSent}
                                                            value={phone}
                                                            onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                                                            placeholder="Enter 10-digit number"
                                                            className="block w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:bg-white focus:border-[#E31E24] focus:ring-2 focus:ring-[#E31E24]/10 outline-none transition-all duration-300 disabled:opacity-50 font-bold"
                                                        />
                                                    </div>
                                                </div>

                                                {otpSent && (
                                                    <motion.div 
                                                        initial={{ opacity: 0, height: 0 }}
                                                        animate={{ opacity: 1, height: "auto" }}
                                                        className="space-y-2"
                                                    >
                                                        {/* Name field for account creation */}
                                                        <div className="space-y-1.5">
                                                            <label className="text-xs font-bold text-gray-800 ml-1 uppercase tracking-wider">Your Name</label>
                                                            <div className="relative group">
                                                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                                    <User className="h-4 w-4 text-gray-400 group-focus-within:text-[#E31E24] transition-colors" />
                                                                </div>
                                                                <input
                                                                    type="text"
                                                                    value={name}
                                                                    onChange={(e) => setName(e.target.value)}
                                                                    placeholder="Enter your full name"
                                                                    className="block w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:bg-white focus:border-[#E31E24] focus:ring-2 focus:ring-[#E31E24]/10 outline-none transition-all duration-300 font-bold"
                                                                />
                                                            </div>
                                                        </div>

                                                        <div className="space-y-1.5">
                                                            <label className="text-xs font-bold text-gray-800 ml-1 uppercase tracking-wider">Verification Code</label>
                                                            <div className="relative group">
                                                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                                    <ShieldCheck className="h-4 w-4 text-gray-400 group-focus-within:text-[#E31E24] transition-colors" />
                                                                </div>
                                                                <input
                                                                    type="text"
                                                                    required
                                                                    value={otp}
                                                                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                                                    placeholder={isSandboxMode ? "Use: 000000" : "Enter 6-digit OTP"}
                                                                    className="block w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-[#E31E24]/30 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:bg-white focus:border-[#E31E24] focus:ring-2 focus:ring-[#E31E24]/10 outline-none transition-all duration-300 font-bold tracking-[0.3em]"
                                                                />
                                                            </div>
                                                        </div>
                                                        <div className="flex justify-between items-center px-1 pt-1">
                                                            <p className="text-[10px] text-emerald-600 font-bold italic">
                                                                {isSandboxMode ? "⚡ Sandbox — use code 000000" : `Code sent to +91 ${phone}`}
                                                            </p>
                                                            <button 
                                                                type="button" 
                                                                onClick={() => { setOtpSent(false); setOtp(""); setName(""); }}
                                                                className="text-[10px] text-gray-600 hover:text-gray-900 underline font-bold uppercase tracking-wider"
                                                            >
                                                                Change Number
                                                            </button>
                                                        </div>
                                                    </motion.div>
                                                )}

                                                <button
                                                    type="submit"
                                                    disabled={isLoading}
                                                className="w-full bg-[#E31E24] hover:bg-[#c1191e] text-white font-black py-2.5 rounded-xl shadow-lg shadow-red-950/40 transform transition-all active:scale-[0.98] flex items-center justify-center gap-2 text-xs uppercase tracking-widest mt-1"
                                                >
                                                    {isLoading ? (
                                                        <Loader2 className="w-5 h-5 animate-spin" />
                                                    ) : (
                                                        <>
                                                            {otpSent ? "Verify & Sign In" : "Get OTP"}
                                                            <ArrowRight className="w-4 h-4" />
                                                        </>
                                                    )}
                                                </button>
                                            </form>
                                        </div>
                                    ) : (
                                        <form onSubmit={handleAuth} className="space-y-2">
                                            {!isLogin && (
                                                <div className="space-y-1.5">
                                                    <label className="text-xs font-bold text-gray-800 ml-1 uppercase tracking-wider">Full Name</label>
                                                    <div className="relative group">
                                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                            <User className="h-4 w-4 text-gray-400 group-focus-within:text-[#E31E24] transition-colors" />
                                                        </div>
                                                        <input
                                                            type="text"
                                                            required
                                                            value={name}
                                                            onChange={(e) => setName(e.target.value)}
                                                            placeholder="John Doe"
                                                            className="block w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:bg-white focus:border-[#E31E24] focus:ring-2 focus:ring-[#E31E24]/10 outline-none transition-all duration-300 font-bold"
                                                        />
                                                    </div>
                                                </div>
                                            )}

                                            <div className="space-y-1.5">
                                                <label className="text-xs font-bold text-gray-800 ml-1 uppercase tracking-wider">Email or ID</label>
                                                <div className="relative group">
                                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                        <Mail className="h-4 w-4 text-gray-400 group-focus-within:text-[#E31E24] transition-colors" />
                                                    </div>
                                                    <input
                                                        type="text"
                                                        required
                                                        value={email}
                                                        onChange={(e) => setEmail(e.target.value)}
                                                        placeholder="email@example.com"
                                                        className="block w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:bg-white focus:border-[#E31E24] focus:ring-2 focus:ring-[#E31E24]/10 outline-none transition-all duration-300 font-bold"
                                                    />
                                                </div>
                                            </div>

                                            <div className="space-y-1.5">
                                                <label className="text-xs font-bold text-gray-800 ml-1 uppercase tracking-wider">Password</label>
                                                <div className="relative group">
                                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                        <Lock className="h-4 w-4 text-gray-400 group-focus-within:text-[#E31E24] transition-colors" />
                                                    </div>
                                                    <input
                                                        type={showPassword ? "text" : "password"}
                                                        required
                                                        value={password}
                                                        onChange={(e) => setPassword(e.target.value)}
                                                        placeholder="••••••••"
                                                        className="block w-full pl-10 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:bg-white focus:border-[#E31E24] focus:ring-2 focus:ring-[#E31E24]/10 outline-none transition-all duration-300 font-bold"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowPassword(!showPassword)}
                                                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-500 hover:text-[#E31E24] transition-colors"
                                                    >
                                                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                                    </button>
                                                </div>
                                            </div>

                                            <button
                                                type="submit"
                                                disabled={isLoading}
                                                className="w-full bg-[#E31E24] hover:bg-[#c1191e] text-white font-black py-2.5 rounded-xl shadow-lg shadow-red-950/40 transform transition-all active:scale-[0.98] flex items-center justify-center gap-2 text-xs uppercase tracking-widest mt-1"
                                            >
                                                {isLoading ? (
                                                    <Loader2 className="w-5 h-5 animate-spin" />
                                                ) : (
                                                    <>
                                                        {isLogin ? "Sign In" : "Create Account"}
                                                        <ArrowRight className="w-4 h-4" />
                                                    </>
                                                )}
                                            </button>
                                        </form>
                                    )}

                                    {isLogin && (
                                        <div className="space-y-2">
                                            <div className="relative py-1">
                                                <div className="absolute inset-0 flex items-center">
                                                    <div className="w-full border-t border-gray-200"></div>
                                                </div>
                                                <div className="relative flex justify-center text-xs">
                                                    <span className="px-3 bg-white text-gray-500 font-bold uppercase tracking-widest text-[9px]">Or</span>
                                                </div>
                                            </div>

                                            <button
                                                onClick={() => handleGoogleLogin(searchParams.get("callbackUrl") || "/")}
                                                className="w-full bg-gray-50 border border-gray-200 hover:bg-gray-100 text-gray-800 font-bold uppercase tracking-wider py-2.5 rounded-xl transition-all duration-300 flex items-center justify-center gap-3 group"
                                            >
                                                <img
                                                    src="https://www.svgrepo.com/show/475656/google-color.svg"
                                                    alt="Google"
                                                    className="w-4 h-4 group-hover:scale-110 transition-transform"
                                                />
                                                <span className="text-xs">Continue with Google</span>
                                            </button>
                                        </div>
                                    )}

                                    <p className="text-center text-[10px] text-gray-600 font-bold uppercase tracking-wider">
                                        {isLogin ? "New to ScrapCenter?" : "Already have an account?"}
                                        <button
                                            onClick={() => setIsLogin(!isLogin)}
                                            className="font-bold text-[#E31E24] hover:text-red-700 ml-1.5 underline transition-colors"
                                        >
                                            {isLogin ? "Create account" : "Sign in"}
                                        </button>
                                    </p>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="b2b"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={{ duration: 0.2 }}
                                    className="space-y-5"
                                >
                                    <form onSubmit={handleB2BLogin} className="space-y-2">
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-gray-800 ml-1 uppercase tracking-wider">Partner ID</label>
                                            <div className="relative group">
                                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                    <Building2 className="h-4 w-4 text-gray-400 group-focus-within:text-[#E31E24] transition-colors" />
                                                </div>
                                                <input
                                                    type="text"
                                                    required
                                                    value={b2bUserId}
                                                    onChange={(e) => setB2BUserId(e.target.value)}
                                                    placeholder="Enter your ID"
                                                    className="block w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:bg-white focus:border-[#E31E24] focus:ring-2 focus:ring-[#E31E24]/10 outline-none transition-all duration-300 font-bold"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-gray-800 ml-1 uppercase tracking-wider">Password</label>
                                            <div className="relative group">
                                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                    <Lock className="h-4 w-4 text-gray-400 group-focus-within:text-[#E31E24] transition-colors" />
                                                </div>
                                                <input
                                                    type={showB2BPassword ? "text" : "password"}
                                                    required
                                                    value={b2bPassword}
                                                    onChange={(e) => setB2BPassword(e.target.value)}
                                                    placeholder="••••••••"
                                                    className="block w-full pl-10 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:bg-white focus:border-[#E31E24] focus:ring-2 focus:ring-[#E31E24]/10 outline-none transition-all duration-300 font-bold"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowB2BPassword(!showB2BPassword)}
                                                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-500 hover:text-[#E31E24] transition-colors"
                                                >
                                                    {showB2BPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                                </button>
                                            </div>
                                        </div>

                                        <button
                                            type="submit"
                                            disabled={isLoading}
                                            className="w-full bg-[#E31E24] hover:bg-[#c1191e] text-white font-black py-2.5 rounded-xl shadow-lg shadow-red-950/40 transform transition-all active:scale-[0.98] flex items-center justify-center gap-2 text-xs uppercase tracking-widest mt-1"
                                        >
                                            {isLoading ? (
                                                <Loader2 className="w-5 h-5 animate-spin" />
                                            ) : (
                                                <>
                                                    Partner Sign In
                                                    <ArrowRight className="w-4 h-4" />
                                                </>
                                            )}
                                        </button>
                                    </form>

                                    <div className="relative py-2">
                                        <div className="absolute inset-0 flex items-center">
                                            <div className="w-full border-t border-gray-200"></div>
                                        </div>
                                        <div className="relative flex justify-center text-xs">
                                            <span className="px-4 bg-white text-gray-500 font-bold uppercase tracking-widest">New Partner?</span>
                                        </div>
                                    </div>

                                    <Link href="/partner-register" className="block">
                                        <button
                                            type="button"
                                            className="w-full bg-white border-2 border-[#E31E24] text-[#E31E24] font-black py-2.5 rounded-xl hover:bg-red-50 transition-all duration-300 flex items-center justify-center gap-2 text-xs uppercase tracking-widest"
                                        >
                                            Become a Partner
                                        </button>
                                    </Link>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </motion.div>
        </div>
    )
}


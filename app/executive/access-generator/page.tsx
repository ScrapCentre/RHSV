"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { 
    Shield, Key, Users, Building2, UserCheck, Plus, Loader2, 
    Check, Copy, RefreshCcw, Mail, Phone, MapPin, ChevronDown,
    Search, Trash2, ShieldAlert, X
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Plus_Jakarta_Sans } from "next/font/google"
import { motion, AnimatePresence } from "framer-motion"

const plusJakartaSans = Plus_Jakarta_Sans({
    subsets: ["latin"],
    weight: ["400", "500", "600", "700", "800"],
})

type UserType = "b2b" | "executive" | "scrapcentre" | "rvsf"

interface B2BPartner {
    _id: string
    userId: string
    businessName: string
    email: string
    contactNumber: string
    address: string
    city: string
    state: string
    pincode: string
    createdAt: string
}

interface Executive {
    _id: string
    name: string
    email: string
    createdAt: string
}

interface ScrapCentreUser {
    _id: string
    name: string
    loginId: string
    email: string
    createdAt: string
}

interface RVSFUser {
    _id: string
    rvsfId: string
    name: string
    email: string
    createdAt: string
}

function AccessGeneratorContent() {
    const searchParams = useSearchParams()
    const { toast } = useToast()

    // Tab & Loading states
    const [activeTab, setActiveTab] = useState<"provision" | "b2b_list" | "exec_list" | "sc_list" | "rvsf_list">("provision")
    const [selectedUserType, setSelectedUserType] = useState<UserType>("b2b")
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isLoadingProfiles, setIsLoadingProfiles] = useState(false)
    const [copiedId, setCopiedId] = useState<string | null>(null)
    const [searchQuery, setSearchQuery] = useState("")

    // Deletion states
    const [deletingProfile, setDeletingProfile] = useState<{ id: string; name: string; type: UserType } | null>(null)
    const [isDeleting, setIsDeleting] = useState(false)

    // Profiles data states
    const [b2bPartners, setB2bPartners] = useState<B2BPartner[]>([])
    const [executives, setExecutives] = useState<Executive[]>([])
    const [scrapCentreUsers, setScrapCentreUsers] = useState<ScrapCentreUser[]>([])
    const [rvsfUsers, setRVSFUsers] = useState<RVSFUser[]>([])

    // Provision Form Data State
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        userId: "",
        contactNumber: "",
        address: "",
        city: "",
        state: "",
        pincode: "",
        registrationId: "",
        originalUserId: ""
    })

    // Load initial query parameters if redirected from verified registration
    useEffect(() => {
        const registrationId = searchParams.get("registrationId")
        if (registrationId) {
            setSelectedUserType("b2b")
            setFormData(prev => ({
                ...prev,
                name: searchParams.get("name") || "",
                email: searchParams.get("email") || "",
                contactNumber: searchParams.get("contactNumber") || "",
                address: searchParams.get("address") || "",
                city: searchParams.get("city") || "",
                state: searchParams.get("state") || "",
                pincode: searchParams.get("pincode") || "",
                registrationId: registrationId,
                originalUserId: searchParams.get("originalUserId") || "",
            }))
        }
    }, [searchParams])

    // Fetch Profile data when lists are loaded
    const fetchProfiles = async () => {
        setIsLoadingProfiles(true)
        try {
            const [b2bRes, execRes, scRes, rvsfRes] = await Promise.all([
                fetch("/api/b2b-partner"),
                fetch("/api/admin/executives"),
                fetch("/api/admin/scrap-center-users"),
                fetch("/api/admin/rvsf-generator")
            ])

            if (b2bRes.ok) {
                const b2bData = await b2bRes.json()
                setB2bPartners(b2bData.data || b2bData || [])
            }
            if (execRes.ok) {
                const execData = await execRes.json()
                setExecutives(execData.data || execData || [])
            }
            if (scRes.ok) {
                const scData = await scRes.json()
                setScrapCentreUsers(scData.data || scData || [])
            }
            if (rvsfRes.ok) {
                const rvsfData = await rvsfRes.json()
                setRVSFUsers(rvsfData.data || rvsfData || [])
            }
        } catch (error) {
            console.error("Failed to load user profiles:", error)
            toast({
                title: "Loading Failure",
                description: "Failed to query one or more profile lists.",
                variant: "destructive"
            })
        } finally {
            setIsLoadingProfiles(false)
        }
    }

    // Load profiles on mount and tab changes
    useEffect(() => {
        fetchProfiles()
        setSearchQuery("") // Clear search on tab transition
    }, [activeTab])

    // Generate random credentials
    const generateCredentials = () => {
        const pass = Math.random().toString(36).slice(-8) + Math.floor(10 + Math.random() * 90)
        let generatedId = ""

        if (selectedUserType === "b2b") {
            generatedId = `B2B${Math.floor(10000 + Math.random() * 90000)}`
        } else if (selectedUserType === "scrapcentre") {
            generatedId = `SC${Math.floor(10000 + Math.random() * 90000)}`
        } else if (selectedUserType === "rvsf") {
            generatedId = `RVSF${Math.floor(10000 + Math.random() * 90000)}`
        }

        setFormData(prev => ({
            ...prev,
            userId: generatedId,
            password: pass
        }))
    }

    // Auto-generate credentials on User Type change
    useEffect(() => {
        generateCredentials()
    }, [selectedUserType])

    // Copy to clipboard helper
    const handleCopy = (text: string, id: string) => {
        navigator.clipboard.writeText(text)
        setCopiedId(id)
        setTimeout(() => setCopiedId(null), 1500)
        toast({
            title: "Copied!",
            description: "Value copied to clipboard successfully."
        })
    }

    // Revoke Access handler
    const handleRevokeAccess = async () => {
        if (!deletingProfile) return
        setIsDeleting(true)
        try {
            let apiEndpoint = ""
            if (deletingProfile.type === "b2b") apiEndpoint = `/api/b2b-partner?id=${deletingProfile.id}`
            else if (deletingProfile.type === "executive") apiEndpoint = `/api/admin/executives?id=${deletingProfile.id}`
            else if (deletingProfile.type === "scrapcentre") apiEndpoint = `/api/admin/scrap-center-users?id=${deletingProfile.id}`
            else if (deletingProfile.type === "rvsf") apiEndpoint = `/api/admin/rvsf-generator?id=${deletingProfile.id}`

            const res = await fetch(apiEndpoint, { method: "DELETE" })
            const data = await res.json()

            if (res.ok) {
                toast({
                    title: "Access Revoked!",
                    description: `Credentials for ${deletingProfile.name} were successfully deleted from database.`
                })
                fetchProfiles()
            } else {
                throw new Error(data.message || "Failed to delete account.")
            }
        } catch (error: any) {
            toast({
                title: "Revocation Failed",
                description: error.message || "Access could not be removed.",
                variant: "destructive"
            })
        } finally {
            setIsDeleting(false)
            setDeletingProfile(null)
        }
    }

    // Provision Access Submission Handler
    const handleProvisionAccess = async (e: React.FormEvent) => {
        e.preventDefault()
        
        // Validation check
        if (!formData.name || !formData.email || !formData.password) {
            toast({
                title: "Required Fields Missing",
                description: "Please complete name, email, and password.",
                variant: "destructive"
            })
            return
        }

        setIsSubmitting(true)
        try {
            let apiEndpoint = ""
            let payload: any = {}

            if (selectedUserType === "b2b") {
                apiEndpoint = "/api/b2b-partner"
                payload = {
                    businessName: formData.name,
                    email: formData.email,
                    contactNumber: formData.contactNumber,
                    address: formData.address,
                    city: formData.city,
                    state: formData.state,
                    pincode: formData.pincode,
                    userId: formData.userId,
                    password: formData.password,
                    registrationId: formData.registrationId,
                    originalUserId: formData.originalUserId
                }
            } else if (selectedUserType === "executive") {
                apiEndpoint = "/api/admin/executives"
                payload = {
                    name: formData.name,
                    email: formData.email,
                    password: formData.password
                }
            } else if (selectedUserType === "scrapcentre") {
                apiEndpoint = "/api/admin/scrap-center-users"
                payload = {
                    name: formData.name,
                    email: formData.email,
                    loginId: formData.userId,
                    password: formData.password
                }
            } else if (selectedUserType === "rvsf") {
                apiEndpoint = "/api/admin/rvsf-generator"
                payload = {
                    name: formData.name,
                    email: formData.email,
                    rvsfId: formData.userId,
                    password: formData.password
                }
            }

            const res = await fetch(apiEndpoint, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            })

            const responseData = await res.json()

            if (res.ok) {
                toast({
                    title: "Access Provisioned!",
                    description: `Successfully created ${selectedUserType.toUpperCase()} account for ${formData.name}.`
                })

                // Reset form values, generate new credentials
                setFormData({
                    name: "",
                    email: "",
                    password: "",
                    userId: "",
                    contactNumber: "",
                    address: "",
                    city: "",
                    state: "",
                    pincode: "",
                    registrationId: "",
                    originalUserId: ""
                })
                generateCredentials()

                // Route to list
                if (selectedUserType === "b2b") setActiveTab("b2b_list")
                else if (selectedUserType === "executive") setActiveTab("exec_list")
                else if (selectedUserType === "scrapcentre") setActiveTab("sc_list")
                else if (selectedUserType === "rvsf") setActiveTab("rvsf_list")
            } else {
                throw new Error(responseData.message || "Failed to provision portal credentials.")
            }
        } catch (error: any) {
            toast({
                title: "Provisioning Error",
                description: error.message || "Access request could not be handled.",
                variant: "destructive"
            })
        } finally {
            setIsSubmitting(false)
        }
    }

    // Filter listings based on Search Query
    const filteredB2b = b2bPartners.filter(p => 
        p.businessName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.userId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.city?.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const filteredExecs = executives.filter(e => 
        e.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.email?.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const filteredScUsers = scrapCentreUsers.filter(u => 
        u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.loginId?.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const filteredRvsfUsers = rvsfUsers.filter(r => 
        r.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.rvsfId?.toLowerCase().includes(searchQuery.toLowerCase())
    )

    return (
        <div className={`${plusJakartaSans.className} space-y-6 max-w-7xl mx-auto text-slate-800 dark:text-slate-100`}>
            
            {/* Page Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 p-5 rounded-2xl shadow-sm">
                <div>
                    <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2.5 tracking-tight">
                        <div className="p-2 bg-[#E31E24]/10 rounded-xl">
                            <Key className="w-5 h-5 text-[#E31E24]" />
                        </div>
                        Access Control &amp; Provisioning Hub
                    </h1>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 font-medium max-w-2xl leading-relaxed">
                        Securely configure systems, provision cryptographic authorization tokens, generate operational credentials and audit database identities for all active system participants.
                    </p>
                </div>

                {/* Quick tab totals counter */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 w-full md:w-auto">
                    {[
                        { label: "B2B Partners", count: b2bPartners.length, icon: Building2 },
                        { label: "Staff", count: executives.length, icon: Users },
                        { label: "Operators", count: scrapCentreUsers.length, icon: UserCheck },
                        { label: "RVSF Centers", count: rvsfUsers.length, icon: Shield }
                    ].map((stat, i) => (
                        <div key={i} className="bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-xl px-3 py-2 flex flex-col items-center justify-center text-center">
                            <div className="flex items-center gap-1 text-[10px] font-bold text-slate-450 dark:text-slate-500 uppercase tracking-widest leading-none mb-1">
                                <stat.icon className="w-3 h-3 text-[#E31E24]" />
                                {stat.label.split(" ")[0]}
                            </div>
                            <span className="text-sm font-black text-slate-800 dark:text-white leading-none">{stat.count}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex flex-wrap gap-1.5 p-1 bg-slate-150/80 dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 rounded-xl w-fit">
                <button
                    onClick={() => setActiveTab("provision")}
                    className={`px-4 py-2.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
                        activeTab === "provision"
                            ? "bg-[#E31E24] text-white shadow-md shadow-red-500/10"
                            : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
                    }`}
                >
                    <Plus className="w-3.5 h-3.5" />
                    Provision Access
                </button>
                <button
                    onClick={() => setActiveTab("b2b_list")}
                    className={`px-4 py-2.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
                        activeTab === "b2b_list"
                            ? "bg-[#E31E24] text-white shadow-md shadow-red-500/10"
                            : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
                    }`}
                >
                    <Building2 className="w-3.5 h-3.5" />
                    B2B Partners ({b2bPartners.length})
                </button>
                <button
                    onClick={() => setActiveTab("exec_list")}
                    className={`px-4 py-2.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
                        activeTab === "exec_list"
                            ? "bg-[#E31E24] text-white shadow-md shadow-red-500/10"
                            : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
                    }`}
                >
                    <Users className="w-3.5 h-3.5" />
                    Executives ({executives.length})
                </button>
                <button
                    onClick={() => setActiveTab("sc_list")}
                    className={`px-4 py-2.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
                        activeTab === "sc_list"
                            ? "bg-[#E31E24] text-white shadow-md shadow-red-500/10"
                            : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
                    }`}
                >
                    <UserCheck className="w-3.5 h-3.5" />
                    ScrapCentre ({scrapCentreUsers.length})
                </button>
                <button
                    onClick={() => setActiveTab("rvsf_list")}
                    className={`px-4 py-2.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
                        activeTab === "rvsf_list"
                            ? "bg-[#E31E24] text-white shadow-md shadow-red-500/10"
                            : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
                    }`}
                >
                    <Shield className="w-3.5 h-3.5" />
                    RVSF Partners ({rvsfUsers.length})
                </button>
            </div>

            {/* SEARCH BAR (For lists) */}
            {activeTab !== "provision" && (
                <div className="relative max-w-md w-full bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden flex items-center">
                    <Search className="w-4 h-4 text-slate-400 absolute left-4" />
                    <input
                        type="text"
                        placeholder="Real-time filter by name, email or access ID..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-11 pr-4 py-2.5 w-full bg-transparent text-xs text-slate-800 dark:text-slate-100 font-semibold focus:outline-none focus:ring-1 focus:ring-[#E31E24] transition-all placeholder:text-slate-400"
                    />
                    {searchQuery && (
                        <button onClick={() => setSearchQuery("")} className="absolute right-3.5 p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md text-slate-400">
                            <X className="w-3 h-3" />
                        </button>
                    )}
                </div>
            )}

            {/* TAB CONTENTS */}
            <AnimatePresence mode="wait">
                {activeTab === "provision" && (
                    <motion.div
                        key="provision"
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        className="grid grid-cols-1 lg:grid-cols-12 gap-6"
                    >
                        {/* LEFT FORM */}
                        <form onSubmit={handleProvisionAccess} className="lg:col-span-8 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 p-5 rounded-2xl shadow-sm space-y-4">
                            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                                <h2 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-1.5">
                                    <Shield className="w-4.5 h-4.5 text-[#E31E24]" />
                                    Access Identity Details
                                </h2>
                                
                                {/* User Type Select */}
                                <div className="relative">
                                    <select
                                        value={selectedUserType}
                                        onChange={(e) => setSelectedUserType(e.target.value as UserType)}
                                        className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 pr-8 text-xs font-bold text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-[#E31E24] cursor-pointer appearance-none"
                                    >
                                        <option value="b2b">B2B Partner</option>
                                        <option value="executive">Staff Executive</option>
                                        <option value="scrapcentre">ScrapCentre Operator</option>
                                        <option value="rvsf">RVSF Partner</option>
                                    </select>
                                    <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Name Input */}
                                <div className="space-y-1.5">
                                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">
                                        {selectedUserType === "b2b" ? "Business Name" : "User Display Name"}
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        placeholder={selectedUserType === "b2b" ? "Scrap Services Ltd." : "Shubham Shukla"}
                                        value={formData.name}
                                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                        className="w-full bg-slate-50 dark:bg-slate-850/50 border border-slate-200 dark:border-slate-750 focus:border-[#E31E24] focus:bg-white dark:focus:bg-slate-900 rounded-lg px-3 py-2 text-xs text-slate-800 dark:text-slate-100 focus:outline-none transition-all placeholder:text-slate-400 font-semibold"
                                    />
                                </div>

                                {/* Email Input */}
                                <div className="space-y-1.5">
                                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Email Address</label>
                                    <input
                                        type="email"
                                        required
                                        placeholder="partner@scrap.com"
                                        value={formData.email}
                                        onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                                        className="w-full bg-slate-50 dark:bg-slate-850/50 border border-slate-200 dark:border-slate-750 focus:border-[#E31E24] focus:bg-white dark:focus:bg-slate-900 rounded-lg px-3 py-2 text-xs text-slate-800 dark:text-slate-100 focus:outline-none transition-all placeholder:text-slate-400 font-semibold"
                                    />
                                </div>
                            </div>

                            {/* B2B Partner Specific Fields */}
                            {selectedUserType === "b2b" && (
                                <div className="space-y-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {/* Contact Number */}
                                        <div className="space-y-1.5">
                                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none flex items-center gap-1">
                                                <Phone className="w-3 h-3 text-slate-400" />
                                                Contact Phone Number
                                            </label>
                                            <input
                                                type="text"
                                                required={selectedUserType === "b2b"}
                                                placeholder="9876543210"
                                                value={formData.contactNumber}
                                                onChange={(e) => setFormData(prev => ({ ...prev, contactNumber: e.target.value }))}
                                                className="w-full bg-slate-50 dark:bg-slate-850/50 border border-slate-200 dark:border-slate-750 focus:border-[#E31E24] focus:bg-white dark:focus:bg-slate-900 rounded-lg px-3 py-2 text-xs text-slate-800 dark:text-slate-100 focus:outline-none transition-all font-semibold"
                                            />
                                        </div>

                                        {/* Physical Address */}
                                        <div className="space-y-1.5">
                                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none flex items-center gap-1">
                                                <MapPin className="w-3 h-3 text-slate-400" />
                                                Facility Address
                                            </label>
                                            <input
                                                type="text"
                                                required={selectedUserType === "b2b"}
                                                placeholder="104, Okhla Phase 3"
                                                value={formData.address}
                                                onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                                                className="w-full bg-slate-50 dark:bg-slate-850/50 border border-slate-200 dark:border-slate-750 focus:border-[#E31E24] focus:bg-white dark:focus:bg-slate-900 rounded-lg px-3 py-2 text-xs text-slate-800 dark:text-slate-100 focus:outline-none transition-all font-semibold"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-3 gap-3">
                                        <div className="space-y-1.5">
                                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">City</label>
                                            <input
                                                type="text"
                                                required={selectedUserType === "b2b"}
                                                placeholder="New Delhi"
                                                value={formData.city}
                                                onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                                                className="w-full bg-slate-50 dark:bg-slate-850/50 border border-slate-200 dark:border-slate-750 focus:border-[#E31E24] focus:bg-white dark:focus:bg-slate-900 rounded-lg px-3 py-2 text-xs text-slate-800 dark:text-slate-100 focus:outline-none transition-all font-semibold"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">State</label>
                                            <input
                                                type="text"
                                                required={selectedUserType === "b2b"}
                                                placeholder="Delhi"
                                                value={formData.state}
                                                onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value }))}
                                                className="w-full bg-slate-50 dark:bg-slate-850/50 border border-slate-200 dark:border-slate-750 focus:border-[#E31E24] focus:bg-white dark:focus:bg-slate-900 rounded-lg px-3 py-2 text-xs text-slate-800 dark:text-slate-100 focus:outline-none transition-all font-semibold"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Pincode</label>
                                            <input
                                                type="text"
                                                required={selectedUserType === "b2b"}
                                                placeholder="110020"
                                                value={formData.pincode}
                                                onChange={(e) => setFormData(prev => ({ ...prev, pincode: e.target.value }))}
                                                className="w-full bg-slate-50 dark:bg-slate-850/50 border border-slate-200 dark:border-slate-750 focus:border-[#E31E24] focus:bg-white dark:focus:bg-slate-900 rounded-lg px-3 py-2 text-xs text-slate-800 dark:text-slate-100 focus:outline-none transition-all font-semibold"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Provision Submit Buttons */}
                            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="bg-[#E31E24] hover:bg-[#c9181d] disabled:opacity-50 text-white font-bold text-xs py-2.5 px-6 rounded-lg transition-all flex items-center justify-center gap-1.5 shadow-sm active:scale-[0.98]"
                                >
                                    {isSubmitting ? (
                                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                    ) : (
                                        <Plus className="w-3.5 h-3.5" />
                                    )}
                                    {isSubmitting ? "Provisioning Access..." : "Generate and Grant Access"}
                                </button>
                            </div>
                        </form>

                        {/* RIGHT CREDENTIALS PREVIEW CARD */}
                        <div className="lg:col-span-4 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 p-5 rounded-2xl shadow-sm space-y-4 h-fit sticky top-24">
                            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                                <h3 className="text-xs font-bold text-slate-800 dark:text-white flex items-center gap-1.5">
                                    <Key className="w-3.5 h-3.5 text-[#E31E24]" />
                                    Autogen Authorization
                                </h3>
                                <button
                                    type="button"
                                    onClick={generateCredentials}
                                    className="flex items-center gap-1 text-[9px] font-bold text-[#E31E24] bg-[#E31E24]/5 border border-[#E31E24]/10 dark:border-[#E31E24]/20 px-2.5 py-1 rounded hover:bg-[#E31E24]/10 transition-colors"
                                >
                                    <RefreshCcw className="w-2.5 h-2.5" />
                                    Randomize
                                </button>
                            </div>

                            <div className="space-y-3.5">
                                {/* Auto-Generated ID Field */}
                                {selectedUserType !== "executive" && (
                                    <div className="space-y-1.5">
                                        <label className="block text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none">
                                            {selectedUserType === "b2b" ? "B2B Partner ID" : selectedUserType === "scrapcentre" ? "Operator Login ID" : "RVSF ID"}
                                        </label>
                                        <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2">
                                            <span className="text-xs font-mono font-bold text-slate-700 dark:text-slate-200 select-all">{formData.userId}</span>
                                            <button
                                                type="button"
                                                onClick={() => handleCopy(formData.userId, "userId")}
                                                className="p-1 hover:bg-slate-200 dark:hover:bg-slate-850 rounded text-slate-450 hover:text-slate-750 dark:hover:text-slate-200 transition-all shrink-0"
                                            >
                                                {copiedId === "userId" ? <Check className="w-3 h-3 text-emerald-600 animate-pulse" /> : <Copy className="w-3 h-3" />}
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* Auto-Generated Password Field */}
                                <div className="space-y-1.5">
                                    <label className="block text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none">Access Secret Key (Password)</label>
                                    <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2">
                                        <span className="text-xs font-mono font-bold text-slate-700 dark:text-slate-200 select-all">{formData.password}</span>
                                        <button
                                            type="button"
                                            onClick={() => handleCopy(formData.password, "password")}
                                            className="p-1 hover:bg-slate-200 dark:hover:bg-slate-850 rounded text-slate-450 hover:text-slate-750 dark:hover:text-slate-200 transition-all shrink-0"
                                        >
                                            {copiedId === "password" ? <Check className="w-3 h-3 text-emerald-600 animate-pulse" /> : <Copy className="w-3 h-3" />}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-slate-50/70 dark:bg-slate-800/20 border border-slate-100 dark:border-slate-800/70 rounded-xl p-3.5 text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed font-semibold">
                                * ID and passwords are automatically generated under AES compliance algorithms for maximum system security. 
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* B2B PARTNERS PROFILE TABLE */}
                {activeTab === "b2b_list" && (
                    <motion.div
                        key="b2b_list"
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden"
                    >
                        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
                            <h2 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-1.5">
                                <Building2 className="w-4 h-4 text-[#E31E24]" />
                                Active B2B Partners ({filteredB2b.length})
                            </h2>
                        </div>

                        {isLoadingProfiles ? (
                            <div className="flex justify-center py-16">
                                <Loader2 className="w-6 h-6 animate-spin text-[#E31E24]" />
                            </div>
                        ) : filteredB2b.length === 0 ? (
                            <div className="text-center py-16 text-slate-400 dark:text-slate-500 text-xs font-semibold">No B2B partners match search query.</div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-xs border-collapse">
                                    <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">
                                        <tr>
                                            <th className="px-5 py-3">Partner ID</th>
                                            <th className="px-5 py-3">Business Name</th>
                                            <th className="px-5 py-3">Contact</th>
                                            <th className="px-5 py-3">Email Address</th>
                                            <th className="px-5 py-3">Location</th>
                                            <th className="px-5 py-3 text-center">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                        {filteredB2b.map(partner => (
                                            <tr key={partner._id} className="hover:bg-slate-50/30 dark:hover:bg-slate-850/10">
                                                <td className="px-5 py-3.5 font-mono font-bold text-slate-900 dark:text-slate-200">{partner.userId}</td>
                                                <td className="px-5 py-3.5 font-bold text-slate-800 dark:text-slate-100">{partner.businessName}</td>
                                                <td className="px-5 py-3.5 font-mono text-slate-600 dark:text-slate-350">{partner.contactNumber}</td>
                                                <td className="px-5 py-3.5 font-semibold text-slate-660 dark:text-slate-350">{partner.email}</td>
                                                <td className="px-5 py-3.5 font-semibold text-slate-500 dark:text-slate-400">{partner.city}, {partner.state}</td>
                                                <td className="px-5 py-3.5 text-center">
                                                    <button 
                                                        type="button"
                                                        onClick={() => setDeletingProfile({ id: partner._id, name: partner.businessName, type: "b2b" })}
                                                        className="p-1.5 hover:bg-red-50 dark:hover:bg-red-950/20 text-slate-400 hover:text-[#E31E24] rounded-lg transition-colors"
                                                        title="Revoke Portal Access"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </motion.div>
                )}

                {/* EXECUTIVES PROFILE TABLE */}
                {activeTab === "exec_list" && (
                    <motion.div
                        key="exec_list"
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden"
                    >
                        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
                            <h2 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-1.5">
                                <Users className="w-4 h-4 text-[#E31E24]" />
                                Executive Staff Profiles ({filteredExecs.length})
                            </h2>
                        </div>

                        {isLoadingProfiles ? (
                            <div className="flex justify-center py-16">
                                <Loader2 className="w-6 h-6 animate-spin text-[#E31E24]" />
                            </div>
                        ) : filteredExecs.length === 0 ? (
                            <div className="text-center py-16 text-slate-400 dark:text-slate-500 text-xs font-semibold">No executive staff found.</div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-xs border-collapse">
                                    <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">
                                        <tr>
                                            <th className="px-5 py-3">Profile Database ID</th>
                                            <th className="px-5 py-3">Executive Name</th>
                                            <th className="px-5 py-3">Registered Email</th>
                                            <th className="px-5 py-3 text-center">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                        {filteredExecs.map(exec => (
                                            <tr key={exec._id} className="hover:bg-slate-50/30 dark:hover:bg-slate-850/10">
                                                <td className="px-5 py-3.5 font-mono font-bold text-slate-900 dark:text-slate-200">{exec._id}</td>
                                                <td className="px-5 py-3.5 font-bold text-slate-800 dark:text-slate-100">{exec.name}</td>
                                                <td className="px-5 py-3.5 font-semibold text-slate-650 dark:text-slate-300">{exec.email}</td>
                                                <td className="px-5 py-3.5 text-center">
                                                    <button 
                                                        type="button"
                                                        onClick={() => setDeletingProfile({ id: exec._id, name: exec.name, type: "executive" })}
                                                        className="p-1.5 hover:bg-red-50 dark:hover:bg-red-950/20 text-slate-400 hover:text-[#E31E24] rounded-lg transition-colors"
                                                        title="Revoke Executive Access"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </motion.div>
                )}

                {/* SCRAPCENTRE USERS PROFILE TABLE */}
                {activeTab === "sc_list" && (
                    <motion.div
                        key="sc_list"
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden"
                    >
                        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
                            <h2 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-1.5">
                                <UserCheck className="w-4 h-4 text-[#E31E24]" />
                                ScrapCentre Operator Profiles ({filteredScUsers.length})
                            </h2>
                        </div>

                        {isLoadingProfiles ? (
                            <div className="flex justify-center py-16">
                                <Loader2 className="w-6 h-6 animate-spin text-[#E31E24]" />
                            </div>
                        ) : filteredScUsers.length === 0 ? (
                            <div className="text-center py-16 text-slate-400 dark:text-slate-500 text-xs font-semibold">No operators match search query.</div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-xs border-collapse">
                                    <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">
                                        <tr>
                                            <th className="px-5 py-3">Operator / Login ID</th>
                                            <th className="px-5 py-3">Operator Name</th>
                                            <th className="px-5 py-3">Email Address</th>
                                            <th className="px-5 py-3">Created Date</th>
                                            <th className="px-5 py-3 text-center">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                        {filteredScUsers.map(user => (
                                            <tr key={user._id} className="hover:bg-slate-50/30 dark:hover:bg-slate-850/10">
                                                <td className="px-5 py-3.5 font-mono font-bold text-slate-900 dark:text-slate-200">{user.loginId}</td>
                                                <td className="px-5 py-3.5 font-bold text-slate-800 dark:text-slate-100">{user.name}</td>
                                                <td className="px-5 py-3.5 font-semibold text-slate-650 dark:text-slate-300">{user.email}</td>
                                                <td className="px-5 py-3.5 text-slate-450 dark:text-slate-400">{new Date(user.createdAt).toLocaleDateString()}</td>
                                                <td className="px-5 py-3.5 text-center">
                                                    <button 
                                                        type="button"
                                                        onClick={() => setDeletingProfile({ id: user._id, name: user.name, type: "scrapcentre" })}
                                                        className="p-1.5 hover:bg-red-50 dark:hover:bg-red-950/20 text-slate-400 hover:text-[#E31E24] rounded-lg transition-colors"
                                                        title="Revoke Operator Access"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </motion.div>
                )}

                {/* RVSF PARTNERS PROFILE TABLE */}
                {activeTab === "rvsf_list" && (
                    <motion.div
                        key="rvsf_list"
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden"
                    >
                        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
                            <h2 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-1.5">
                                <Shield className="w-4 h-4 text-[#E31E24]" />
                                RVSF Partner Profiles ({filteredRvsfUsers.length})
                            </h2>
                        </div>

                        {isLoadingProfiles ? (
                            <div className="flex justify-center py-16">
                                <Loader2 className="w-6 h-6 animate-spin text-[#E31E24]" />
                            </div>
                        ) : filteredRvsfUsers.length === 0 ? (
                            <div className="text-center py-16 text-slate-400 dark:text-slate-500 text-xs font-semibold">No RVSF partners match search query.</div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-xs border-collapse">
                                    <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">
                                        <tr>
                                            <th className="px-5 py-3">RVSF ID</th>
                                            <th className="px-5 py-3">Partner Facility Name</th>
                                            <th className="px-5 py-3">Registered Email</th>
                                            <th className="px-5 py-3">Created Date</th>
                                            <th className="px-5 py-3 text-center">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                        {filteredRvsfUsers.map(rvsf => (
                                            <tr key={rvsf._id} className="hover:bg-slate-50/30 dark:hover:bg-slate-850/10">
                                                <td className="px-5 py-3.5 font-mono font-bold text-slate-900 dark:text-slate-200">{rvsf.rvsfId}</td>
                                                <td className="px-5 py-3.5 font-bold text-slate-800 dark:text-slate-100">{rvsf.name}</td>
                                                <td className="px-5 py-3.5 font-semibold text-slate-650 dark:text-slate-300">{rvsf.email}</td>
                                                <td className="px-5 py-3.5 text-slate-450 dark:text-slate-400">{new Date(rvsf.createdAt).toLocaleDateString()}</td>
                                                <td className="px-5 py-3.5 text-center">
                                                    <button 
                                                        type="button"
                                                        onClick={() => setDeletingProfile({ id: rvsf._id, name: rvsf.name, type: "rvsf" })}
                                                        className="p-1.5 hover:bg-red-50 dark:hover:bg-red-950/20 text-slate-400 hover:text-[#E31E24] rounded-lg transition-colors"
                                                        title="Revoke RVSF Partner Access"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* CONFIRMATION OVERLAY MODAL */}
            <AnimatePresence>
                {deletingProfile && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                    >
                        <motion.div
                            initial={{ scale: 0.95, y: 10 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.95, y: 10 }}
                            className="bg-white dark:bg-slate-900 max-w-md w-full rounded-2xl border border-slate-200/50 dark:border-slate-800 p-6 shadow-xl space-y-4"
                        >
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-red-100 dark:bg-red-950/20 text-[#E31E24] rounded-xl">
                                    <ShieldAlert className="w-6 h-6" />
                                </div>
                                <div>
                                    <h4 className="text-base font-bold text-slate-800 dark:text-white">Revoke Portal Access?</h4>
                                    <span className="text-[10px] font-bold text-slate-450 dark:text-slate-500 uppercase tracking-widest">Database Deletion Event</span>
                                </div>
                            </div>

                            <p className="text-xs text-slate-500 dark:text-slate-455 leading-relaxed font-semibold">
                                Are you sure you want to permanently revoke portal access for <strong className="text-slate-800 dark:text-white font-bold">{deletingProfile.name}</strong>? All operational credentials and sessions associated with this account will be deleted instantly. This action cannot be undone.
                            </p>

                            <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
                                <button
                                    type="button"
                                    onClick={() => setDeletingProfile(null)}
                                    disabled={isDeleting}
                                    className="px-4 py-2 text-xs font-bold text-slate-500 dark:text-slate-450 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={handleRevokeAccess}
                                    disabled={isDeleting}
                                    className="bg-[#E31E24] hover:bg-[#c9181d] disabled:opacity-50 text-white font-bold text-xs py-2 px-5 rounded-lg transition-all flex items-center justify-center gap-1.5"
                                >
                                    {isDeleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                                    Revoke Access
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

export default function AccessGeneratorPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-[#E31E24]" />
            </div>
        }>
            <AccessGeneratorContent />
        </Suspense>
    )
}

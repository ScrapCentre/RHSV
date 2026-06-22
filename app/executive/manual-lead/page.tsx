"use client"

import React, { useState, useEffect } from "react"
import { 
    Plus, 
    Trash2, 
    User as UserIcon, 
    Mail, 
    Phone, 
    MapPin, 
    Calendar, 
    Car, 
    Fuel, 
    Scale, 
    MessageCircle, 
    CheckCircle, 
    ShieldAlert, 
    X, 
    Search,
    Loader2,
    ShieldCheck,
    RefreshCcw,
    Users,
    UserPlus,
    CheckCircle2,
    ArrowLeftRight,
    Compass,
    Sparkles,
    Check,
    Send
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useToast } from "@/hooks/use-toast"
import { Plus_Jakarta_Sans } from "next/font/google"
import Link from "next/link"

const plusJakartaSans = Plus_Jakarta_Sans({
    subsets: ["latin"],
    weight: ["400", "500", "600", "700", "800"],
})

interface ManualLead {
    _id: string
    serviceType: "scrap" | "buy"
    category: "scrap_only" | "buy_only" | "scrap_and_buy"
    status: string
    name: string
    phone: string
    pincode?: string
    city?: string
    state?: string
    brand?: string
    model?: string
    year?: string
    regNo?: string
    fuel?: string[]
    kms?: string
    weight?: string
    desiredCompany?: string
    desiredModel?: string
    carPhoto?: string
    createdAt: string
}

export default function ManualLeadsExecutivePage() {
    const [leads, setLeads] = useState<ManualLead[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isCreating, setIsCreating] = useState(false)
    const [showForm, setShowForm] = useState(false)
    const [selectedLead, setSelectedLead] = useState<ManualLead | null>(null)
    const [searchTerm, setSearchTerm] = useState("")
    const [formError, setFormError] = useState("")
    const [formSuccess, setFormSuccess] = useState("")

    // Form states
    const [category, setCategory] = useState<"scrap_only" | "buy_only" | "scrap_and_buy">("scrap_only")
    const [name, setName] = useState("")
    const [phone, setPhone] = useState("")
    const [pincode, setPincode] = useState("")
    const [city, setCity] = useState("")
    const [state, setState] = useState("")
    
    // Scrap vehicle details
    const [brand, setBrand] = useState("")
    const [model, setModel] = useState("")
    const [year, setYear] = useState("")
    const [regNo, setRegNo] = useState("")
    const [fuel, setFuel] = useState("Petrol")
    const [kms, setKms] = useState("")
    const [weight, setWeight] = useState("")
    const [carPhoto, setCarPhoto] = useState("")
    const [isUploadingPhoto, setIsUploadingPhoto] = useState(false)

    // Buy preferences
    const [desiredCompany, setDesiredCompany] = useState("")
    const [desiredModel, setDesiredModel] = useState("")

    const { toast } = useToast()

    const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        setIsUploadingPhoto(true)
        setFormError("")
        
        try {
            const formData = new FormData()
            formData.append("file", file)

            const res = await fetch("/api/upload", {
                method: "POST",
                body: formData
            })

            const data = await res.json()
            if (res.ok && data.success) {
                setCarPhoto(data.url)
                toast({
                    title: "Image Uploaded",
                    description: "Vehicle photo successfully uploaded to Cloudinary."
                })
            } else {
                setFormError(data.message || "Failed to upload image to Cloudinary.")
            }
        } catch (error: any) {
            console.error("Photo upload error:", error)
            setFormError("Photo upload failed: " + (error?.message || ""))
        } finally {
            setIsUploadingPhoto(false)
        }
    }

    useEffect(() => {
        fetchLeads()
    }, [])

    const fetchLeads = async () => {
        setIsLoading(true)
        try {
            const res = await fetch("/api/admin/manual-lead")
            if (!res.ok) throw new Error("Failed to load manual leads")
            const data = await res.json()
            if (Array.isArray(data)) setLeads(data)
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message || "Failed to load leads list.",
                variant: "destructive"
            })
        } finally {
            setIsLoading(false)
        }
    }

    const handleCreateLead = async (e?: React.FormEvent) => {
        if (e) e.preventDefault()
        console.log("handleCreateLead called", { category, name, phone })
        setFormError("")
        setFormSuccess("")
        
        // Basic validations
        if (!name.trim()) {
            setFormError("Customer Name is required.")
            return
        }
        if (!phone.trim()) {
            setFormError("Customer Phone number is required.")
            return
        }
        if (!/^[6-9]\d{9}$/.test(phone)) {
            setFormError("Must be a valid 10-digit Indian mobile number (starts with 6-9, exactly 10 digits).")
            return
        }
        if (pincode && !/^\d{6}$/.test(pincode)) {
            setFormError("Pincode must be exactly 6 digits.")
            return
        }

        // Category-specific validation
        if (category === "scrap_only" || category === "scrap_and_buy") {
            if (!brand.trim()) {
                setFormError("Vehicle Brand is required for scrap requests.")
                return
            }
            if (!model.trim()) {
                setFormError("Vehicle Model is required for scrap requests.")
                return
            }
        }
        if (category === "buy_only" || category === "scrap_and_buy") {
            if (!desiredCompany.trim()) {
                setFormError("Desired Brand/Company is required.")
                return
            }
            if (!desiredModel.trim()) {
                setFormError("Desired Model is required.")
                return
            }
        }

        setIsCreating(true)
        try {
            const payload = {
                category,
                name,
                phone,
                pincode,
                city,
                state,
                // scrap info
                brand: (category === "scrap_only" || category === "scrap_and_buy") ? brand : undefined,
                model: (category === "scrap_only" || category === "scrap_and_buy") ? model : undefined,
                year: (category === "scrap_only" || category === "scrap_and_buy") ? year : undefined,
                regNo: (category === "scrap_only" || category === "scrap_and_buy") ? regNo : undefined,
                fuel: (category === "scrap_only" || category === "scrap_and_buy") ? [fuel] : undefined,
                kms: (category === "scrap_only" || category === "scrap_and_buy") ? kms : undefined,
                weight: (category === "scrap_only" || category === "scrap_and_buy") ? weight : undefined,
                // buy info
                desiredCompany: (category === "buy_only" || category === "scrap_and_buy") ? desiredCompany : undefined,
                desiredModel: (category === "buy_only" || category === "scrap_and_buy") ? desiredModel : undefined,
                carPhoto: (category === "scrap_only" || category === "scrap_and_buy") ? carPhoto : undefined,
            }

            console.log("Sending payload:", payload)
            const res = await fetch("/api/admin/manual-lead", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            })

            const data = await res.json()
            console.log("API response:", res.status, data)
            if (res.ok) {
                setFormSuccess("Lead manually registered successfully!")
                toast({
                    title: "Success",
                    description: "Lead manually registered successfully!"
                })
                setTimeout(() => {
                    setShowForm(false)
                    resetForm()
                    fetchLeads()
                }, 1500)
            } else {
                setFormError(data.message || "Something went wrong.")
            }
        } catch (error: any) {
            console.error("Manual lead creation error:", error)
            setFormError("Unable to reach database server: " + (error?.message || ""))
        } finally {
            setIsCreating(false)
        }
    }

    const resetForm = () => {
        setName("")
        setPhone("")
        setPincode("")
        setCity("")
        setState("")
        setBrand("")
        setModel("")
        setYear("")
        setRegNo("")
        setFuel("Petrol")
        setKms("")
        setWeight("")
        setDesiredCompany("")
        setDesiredModel("")
        setCarPhoto("")
    }

    // Action updates on the selected lead
    const handleStatusUpdate = async (leadId: string, leadCategory: string, newStatus: string) => {
        if (!confirm(`Confirm status transition to ${newStatus.toUpperCase()}?`)) return

        // Map category to type parameter for API
        let type = "quote"
        if (leadCategory === "buy_only") type = "buy"
        if (leadCategory === "scrap_and_buy") type = "scrap-buy"

        try {
            const res = await fetch("/api/admin/requests/approve", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id: leadId, type, status: newStatus })
            })

            if (res.ok) {
                toast({
                    title: "Status Transitioned",
                    description: `Status updated successfully to ${newStatus}.`
                })
                // Refresh list and selected details
                fetchLeads()
                if (selectedLead && selectedLead._id === leadId) {
                    setSelectedLead({ ...selectedLead, status: newStatus })
                }
            } else {
                toast({
                    title: "Error",
                    description: "Failed to update lead status.",
                    variant: "destructive"
                })
            }
        } catch (error) {
            toast({
                title: "Error",
                description: "Network failure during status update.",
                variant: "destructive"
            })
        }
    }

    const handleDeleteLead = async (leadId: string, leadCategory: string) => {
        if (!confirm("Are you sure you want to delete this lead? This action cannot be undone.")) return

        let type = "quote"
        if (leadCategory === "buy_only") type = "buy"
        if (leadCategory === "scrap_and_buy") type = "scrap-buy"

        try {
            const res = await fetch(`/api/admin/requests/delete?id=${leadId}&type=${type}`, {
                method: "DELETE"
            })

            if (res.ok) {
                toast({
                    title: "Deleted",
                    description: "Lead purges successfully."
                })
                setSelectedLead(null)
                fetchLeads()
            } else {
                toast({
                    title: "Error",
                    description: "Failed to delete lead.",
                    variant: "destructive"
                })
            }
        } catch (error) {
            toast({
                title: "Error",
                description: "Network failure during deletion.",
                variant: "destructive"
            })
        }
    }

    const filteredLeads = leads.filter(l => 
        l.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        l.phone.includes(searchTerm) ||
        (l.brand && l.brand.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (l.desiredCompany && l.desiredCompany.toLowerCase().includes(searchTerm.toLowerCase()))
    )

    const getCategoryBadge = (cat: string) => {
        switch (cat) {
            case "scrap_only":
                return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black bg-emerald-50 text-emerald-700 border border-emerald-100 uppercase tracking-wider">Scrap Only</span>
            case "buy_only":
                return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black bg-orange-50 text-orange-700 border border-orange-100 uppercase tracking-wider">Buy New</span>
            case "scrap_and_buy":
                return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black bg-purple-50 text-purple-700 border border-purple-100 uppercase tracking-wider">Scrap &amp; Buy</span>
            default:
                return <span className="px-2 py-1 rounded bg-gray-50 text-xs text-gray-700 font-bold uppercase">{cat}</span>
        }
    }

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "pending":
                return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-yellow-50 text-yellow-750 border border-yellow-100 uppercase tracking-wider">Pending</span>
            case "approved":
                return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-150 uppercase tracking-wider">Personal Lead</span>
            case "approved_to_rvsf":
                return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-150 uppercase tracking-wider">Approved to RVSF</span>
            case "completed":
                return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-green-50 text-green-700 border border-green-150 uppercase tracking-wider">Completed</span>
            default:
                return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-gray-50 text-gray-750 border border-gray-150 uppercase tracking-wider">{status}</span>
        }
    }

    return (
        <div className={`min-h-screen bg-[#FBFBFE] dark:bg-slate-950 p-4 sm:p-6 lg:p-8 ${plusJakartaSans.className}`}>
            <div className="max-w-7xl mx-auto space-y-6">
                
                {/* Header Area */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-100 dark:border-slate-800 pb-6">
                    <div className="space-y-1">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-[#E31E24]/10 rounded-2xl text-[#E31E24]">
                                <Users className="w-7 h-7" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">Manual Leads Hub</h1>
                                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Manually register, audit, and coordinate offline customer requests.</p>
                            </div>
                        </div>
                    </div>

                    <button 
                        onClick={() => {
                            setShowForm(!showForm)
                            if (!showForm) resetForm()
                        }}
                        className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm transition-all shadow-md active:scale-95 ${
                            showForm 
                            ? "bg-slate-100 dark:bg-slate-800 text-slate-650 dark:text-slate-400 hover:bg-slate-200" 
                            : "bg-[#E31E24] hover:bg-[#E31E24]/90 text-white shadow-red-500/10"
                        }`}
                    >
                        {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                        {showForm ? "Cancel Entry" : "Create Manual Lead"}
                    </button>
                </div>

                {/* Segmented Entry Form */}
                <AnimatePresence>
                    {showForm && (
                        <motion.div
                            initial={{ opacity: 0, height: 0, y: -20 }}
                            animate={{ opacity: 1, height: "auto", y: 0 }}
                            exit={{ opacity: 0, height: 0, y: -20 }}
                            className="overflow-hidden"
                        >
                            <div className="bg-white dark:bg-[#0E192D] rounded-[2rem] p-6 sm:p-8 shadow-sm border border-slate-100 dark:border-slate-800/80 space-y-6">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-50 dark:border-slate-800 pb-4">
                                    <div className="flex items-center gap-2.5">
                                        <Sparkles className="w-5 h-5 text-amber-550" />
                                        <h2 className="text-base font-extrabold text-slate-800 dark:text-white">New Lead Registration</h2>
                                    </div>
                                    
                                    {/* Lead Type Tabs */}
                                    <div className="flex bg-slate-50 dark:bg-slate-900 p-1 rounded-xl border border-slate-100 dark:border-slate-800 self-start">
                                        {[
                                            { id: "scrap_only", label: "Scrap Only" },
                                            { id: "buy_only", label: "Buy New Only" },
                                            { id: "scrap_and_buy", label: "Scrap & Buy" }
                                        ].map((tab) => (
                                            <button
                                                key={tab.id}
                                                type="button"
                                                onClick={() => setCategory(tab.id as any)}
                                                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                                    category === tab.id 
                                                    ? "bg-white dark:bg-slate-800 text-[#E31E24] shadow-sm" 
                                                    : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-350"
                                                }`}
                                            >
                                                {tab.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    {/* Card 1: Customer Details */}
                                    <div className="space-y-4 bg-slate-50/55 dark:bg-slate-900/40 border border-slate-100/50 dark:border-slate-800/50 p-5 rounded-2xl">
                                        <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-extrabold text-xs uppercase tracking-wider">
                                            <UserIcon className="w-4 h-4 text-slate-500" />
                                            <span>Customer Contacts</span>
                                        </div>
                                        <div className="space-y-3">
                                            <div className="space-y-1">
                                                <label className="text-[10px] font-black text-slate-450 dark:text-slate-500 uppercase tracking-widest ml-0.5">Name</label>
                                                <input 
                                                    type="text" 
                                                    placeholder="Enter customer name"
                                                    value={name}
                                                    onChange={(e) => setName(e.target.value)}
                                                    className="w-full text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-[#E31E24]/20 focus:border-[#E31E24] dark:text-white"
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[10px] font-black text-slate-450 dark:text-slate-500 uppercase tracking-widest ml-0.5">Phone Number</label>
                                                <input 
                                                    type="tel" 
                                                    placeholder="10-digit mobile number"
                                                    value={phone}
                                                    onChange={(e) => setPhone(e.target.value)}
                                                    className="w-full text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-[#E31E24]/20 focus:border-[#E31E24] dark:text-white"
                                                />
                                            </div>
                                            <div className="grid grid-cols-2 gap-2">
                                                <div className="space-y-1">
                                                    <label className="text-[10px] font-black text-slate-450 dark:text-slate-500 uppercase tracking-widest ml-0.5">Pincode</label>
                                                    <input 
                                                        type="text" 
                                                        placeholder="6 digits"
                                                        value={pincode}
                                                        onChange={(e) => setPincode(e.target.value)}
                                                        className="w-full text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-[#E31E24]/20 focus:border-[#E31E24] dark:text-white"
                                                    />
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="text-[10px] font-black text-slate-450 dark:text-slate-500 uppercase tracking-widest ml-0.5">City</label>
                                                    <input 
                                                        type="text" 
                                                        placeholder="City"
                                                        value={city}
                                                        onChange={(e) => setCity(e.target.value)}
                                                        className="w-full text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-[#E31E24]/20 focus:border-[#E31E24] dark:text-white"
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[10px] font-black text-slate-450 dark:text-slate-500 uppercase tracking-widest ml-0.5">State</label>
                                                <input 
                                                    type="text" 
                                                    placeholder="State"
                                                    value={state}
                                                    onChange={(e) => setState(e.target.value)}
                                                    className="w-full text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-[#E31E24]/20 focus:border-[#E31E24] dark:text-white"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Card 2: Scrap Vehicle details (only show if category has scrap) */}
                                    <div className={`space-y-4 bg-slate-50/55 dark:bg-slate-900/40 border border-slate-100/50 dark:border-slate-800/50 p-5 rounded-2xl transition-opacity duration-300 ${
                                        category === "buy_only" ? "opacity-30 pointer-events-none select-none" : "opacity-100"
                                    }`}>
                                        <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-extrabold text-xs uppercase tracking-wider">
                                            <Car className="w-4 h-4 text-slate-500" />
                                            <span>Scrap Vehicle Info</span>
                                        </div>
                                        <div className="space-y-3">
                                            <div className="grid grid-cols-2 gap-2">
                                                <div className="space-y-1">
                                                    <label className="text-[10px] font-black text-slate-450 dark:text-slate-500 uppercase tracking-widest ml-0.5">Brand / Make</label>
                                                    <input 
                                                        type="text" 
                                                        placeholder="e.g. Maruti Suzuki"
                                                        value={brand}
                                                        onChange={(e) => setBrand(e.target.value)}
                                                        className="w-full text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-[#E31E24]/20 focus:border-[#E31E24] dark:text-white"
                                                    />
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="text-[10px] font-black text-slate-450 dark:text-slate-500 uppercase tracking-widest ml-0.5">Model</label>
                                                    <input 
                                                        type="text" 
                                                        placeholder="e.g. Swift"
                                                        value={model}
                                                        onChange={(e) => setModel(e.target.value)}
                                                        className="w-full text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-[#E31E24]/20 focus:border-[#E31E24] dark:text-white"
                                                    />
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-2 gap-2">
                                                <div className="space-y-1">
                                                    <label className="text-[10px] font-black text-slate-450 dark:text-slate-500 uppercase tracking-widest ml-0.5">Year of Manufacture</label>
                                                    <input 
                                                        type="text" 
                                                        placeholder="e.g. 2010"
                                                        value={year}
                                                        onChange={(e) => setYear(e.target.value)}
                                                        className="w-full text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-[#E31E24]/20 focus:border-[#E31E24] dark:text-white"
                                                    />
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="text-[10px] font-black text-slate-450 dark:text-slate-500 uppercase tracking-widest ml-0.5">Reg Number</label>
                                                    <input 
                                                        type="text" 
                                                        placeholder="e.g. DL3CA1234"
                                                        value={regNo}
                                                        onChange={(e) => setRegNo(e.target.value)}
                                                        className="w-full text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-[#E31E24]/20 focus:border-[#E31E24] dark:text-white"
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[10px] font-black text-slate-450 dark:text-slate-500 uppercase tracking-widest ml-0.5">Fuel Type</label>
                                                <select 
                                                    value={fuel}
                                                    onChange={(e) => setFuel(e.target.value)}
                                                    className="w-full text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-[#E31E24]/20 focus:border-[#E31E24] dark:text-white"
                                                >
                                                    <option>Petrol</option>
                                                    <option>Diesel</option>
                                                    <option>CNG</option>
                                                    <option>LPG</option>
                                                    <option>Electric</option>
                                                    <option>Hybrid</option>
                                                </select>
                                            </div>
                                            <div className="grid grid-cols-2 gap-2">
                                                <div className="space-y-1">
                                                    <label className="text-[10px] font-black text-slate-450 dark:text-slate-500 uppercase tracking-widest ml-0.5">KMs Driven</label>
                                                    <input 
                                                        type="text" 
                                                        placeholder="e.g. 120000"
                                                        value={kms}
                                                        onChange={(e) => setKms(e.target.value)}
                                                        className="w-full text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-[#E31E24]/20 focus:border-[#E31E24] dark:text-white"
                                                    />
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="text-[10px] font-black text-slate-450 dark:text-slate-500 uppercase tracking-widest ml-0.5">Weight (Tons)</label>
                                                    <input 
                                                        type="text" 
                                                        placeholder="e.g. 1.2"
                                                        value={weight}
                                                        onChange={(e) => setWeight(e.target.value)}
                                                        className="w-full text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-[#E31E24]/20 focus:border-[#E31E24] dark:text-white"
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-1 mt-2">
                                                <label className="text-[10px] font-black text-slate-455 dark:text-slate-500 uppercase tracking-widest ml-0.5">Vehicle Image</label>
                                                {carPhoto ? (
                                                    <div className="relative rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 aspect-video group">
                                                        <img 
                                                            src={carPhoto} 
                                                            alt="Vehicle Preview" 
                                                            className="w-full h-full object-cover"
                                                        />
                                                        <button 
                                                            type="button" 
                                                            onClick={() => setCarPhoto("")}
                                                            className="absolute top-2 right-2 p-1.5 bg-red-650 hover:bg-red-700 text-white rounded-lg transition-colors shadow-md z-10"
                                                        >
                                                            <Trash2 className="w-3.5 h-3.5" />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <div className="relative border border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-4 bg-white dark:bg-slate-900 flex flex-col items-center justify-center gap-1.5 transition-all hover:bg-slate-50/50 dark:hover:bg-slate-900/50 min-h-[90px]">
                                                        {isUploadingPhoto ? (
                                                            <div className="flex flex-col items-center gap-1.5 py-1">
                                                                <Loader2 className="w-5 h-5 animate-spin text-[#E31E24]" />
                                                                <span className="text-[9px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">Uploading...</span>
                                                            </div>
                                                        ) : (
                                                            <>
                                                                <div className="p-1.5 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-lg">
                                                                    <Car className="w-4 h-4" />
                                                                </div>
                                                                <span className="text-[9px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-center">Click to upload photo</span>
                                                                <input 
                                                                    type="file" 
                                                                    accept="image/*" 
                                                                    onChange={handlePhotoUpload}
                                                                    className="absolute inset-0 opacity-0 cursor-pointer"
                                                                />
                                                            </>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Card 3: Buy Preferences (only show if category has buy) */}
                                    <div className={`space-y-4 bg-slate-50/55 dark:bg-slate-900/40 border border-slate-100/50 dark:border-slate-800/50 p-5 rounded-2xl transition-opacity duration-300 ${
                                        category === "scrap_only" ? "opacity-30 pointer-events-none select-none" : "opacity-100"
                                    }`}>
                                        <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-extrabold text-xs uppercase tracking-wider">
                                            <Compass className="w-4 h-4 text-slate-500" />
                                            <span>Desired Vehicle Preferences</span>
                                        </div>
                                        <div className="space-y-3">
                                            <div className="space-y-1">
                                                <label className="text-[10px] font-black text-slate-450 dark:text-slate-500 uppercase tracking-widest ml-0.5">Desired Brand</label>
                                                <input 
                                                    type="text" 
                                                    placeholder="e.g. Hyundai"
                                                    value={desiredCompany}
                                                    onChange={(e) => setDesiredCompany(e.target.value)}
                                                    className="w-full text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-[#E31E24]/20 focus:border-[#E31E24] dark:text-white"
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[10px] font-black text-slate-450 dark:text-slate-500 uppercase tracking-widest ml-0.5">Desired Model</label>
                                                <input 
                                                    type="text" 
                                                    placeholder="e.g. Creta"
                                                    value={desiredModel}
                                                    onChange={(e) => setDesiredModel(e.target.value)}
                                                    className="w-full text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-[#E31E24]/20 focus:border-[#E31E24] dark:text-white"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Inline Error/Success Messages */}
                                {formError && (
                                    <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold dark:bg-red-900/20 dark:border-red-800 dark:text-red-400 animate-pulse">
                                        <ShieldAlert className="w-4 h-4 flex-shrink-0" />
                                        <span>{formError}</span>
                                    </div>
                                )}
                                {formSuccess && (
                                    <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold dark:bg-emerald-900/20 dark:border-emerald-800 dark:text-emerald-400">
                                        <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                                        <span>{formSuccess}</span>
                                    </div>
                                )}

                                <div className="flex justify-end gap-3 pt-4 border-t border-slate-50 dark:border-slate-800">
                                    <button 
                                        type="button" 
                                        onClick={() => { resetForm(); setFormError(""); setFormSuccess(""); }}
                                        className="px-5 py-2.5 rounded-xl font-bold text-xs bg-slate-50 hover:bg-slate-100 text-slate-500 border border-slate-200 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-400"
                                    >
                                        Clear Form
                                    </button>
                                    <button 
                                        type="button" 
                                        disabled={isCreating}
                                        onClick={() => handleCreateLead()}
                                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-8 py-2.5 rounded-xl text-xs flex items-center gap-2 shadow-md disabled:opacity-50 cursor-pointer"
                                    >
                                        {isCreating ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                                        Save Lead Record
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Lead Listings */}
                <div className="bg-white dark:bg-[#0E192D] rounded-[2rem] border border-slate-100 dark:border-slate-800/80 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-slate-50 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <h2 className="text-base font-extrabold text-slate-800 dark:text-white">Registered Lead Logs</h2>
                            <span className="text-[10px] font-black bg-red-50 text-red-700 px-3 py-1 rounded-full border border-red-100/50 uppercase tracking-widest dark:bg-[#E31E24]/10 dark:text-[#E31E24] dark:border-[#E31E24]/20">
                                {leads.length} leads
                            </span>
                        </div>

                        <div className="relative group max-w-sm w-full">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-[#E31E24] transition-colors" />
                            <input 
                                type="text" 
                                placeholder="Search by name, phone, vehicle..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:border-[#E31E24]/50 rounded-xl py-2.5 pl-10 pr-4 outline-none text-xs font-semibold text-slate-700 dark:text-slate-200 transition-all"
                            />
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-50 dark:border-slate-800">
                                    <th className="px-6 py-4 text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Entry Date</th>
                                    <th className="px-6 py-4 text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Customer Details</th>
                                    <th className="px-6 py-4 text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Lead Type</th>
                                    <th className="px-6 py-4 text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Primary Info</th>
                                    <th className="px-6 py-4 text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Status</th>
                                    <th className="px-6 py-4 text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50 dark:divide-slate-800/40">
                                {isLoading ? (
                                    [1, 2, 3].map((i) => (
                                        <tr key={i} className="animate-pulse">
                                            <td colSpan={6} className="px-6 py-6"><div className="h-10 bg-slate-100 dark:bg-slate-900 rounded-xl" /></td>
                                        </tr>
                                    ))
                                ) : filteredLeads.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-16 text-center text-slate-400 font-medium italic text-xs">No manual leads found.</td>
                                    </tr>
                                ) : filteredLeads.map((lead) => (
                                    <tr key={lead._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                                        <td className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 whitespace-nowrap">
                                            {new Date(lead.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 flex items-center justify-center font-black text-xs text-slate-655 dark:text-slate-300">
                                                    {lead.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="text-xs font-bold text-slate-800 dark:text-white">{lead.name}</p>
                                                    <p className="text-[10px] text-slate-400 font-bold font-mono">{lead.phone}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {getCategoryBadge(lead.category)}
                                        </td>
                                        <td className="px-6 py-4">
                                            {lead.category === "buy_only" ? (
                                                <p className="text-xs font-bold text-slate-850 dark:text-slate-300">{lead.desiredCompany} {lead.desiredModel}</p>
                                            ) : (
                                                <div>
                                                    <p className="text-xs font-bold text-slate-850 dark:text-slate-300">{lead.brand} {lead.model}</p>
                                                    <p className="text-[10px] text-slate-450 dark:text-slate-500 font-semibold">{lead.regNo || "NO REG"}</p>
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {getStatusBadge(lead.status)}
                                        </td>
                                        <td className="px-6 py-4 text-right whitespace-nowrap">
                                            <div className="flex items-center justify-end gap-2">
                                                <button 
                                                    onClick={() => setSelectedLead(lead)}
                                                    className="px-3.5 py-1.5 bg-[#E31E24]/10 hover:bg-[#E31E24]/20 text-[#E31E24] rounded-lg text-[10px] font-black uppercase tracking-wider transition-all"
                                                >
                                                    View
                                                </button>
                                                <button 
                                                    onClick={() => handleDeleteLead(lead._id, lead.category)}
                                                    className="p-1.5 hover:bg-red-50 hover:text-red-500 text-slate-400 rounded-lg transition-colors"
                                                    title="Delete Lead"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Side Drawer Details View (Premium Slide-Over Sheet) */}
                <AnimatePresence>
                    {selectedLead && (
                        <>
                            {/* Overlay */}
                            <motion.div 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 0.4 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setSelectedLead(null)}
                                className="fixed inset-0 bg-black z-50"
                            />
                            
                            {/* Slide-over Sheet Panel */}
                            <motion.div 
                                initial={{ x: "100%" }}
                                animate={{ x: 0 }}
                                exit={{ x: "100%" }}
                                transition={{ type: "spring", stiffness: 260, damping: 26 }}
                                className="fixed inset-y-0 right-0 w-full sm:max-w-xl md:max-w-2xl lg:max-w-3xl bg-white dark:bg-[#0B1526] z-50 shadow-2xl border-l border-slate-200 dark:border-slate-800 flex flex-col h-screen"
                            >
                                {/* Drawer Header */}
                                <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/30">
                                    <div>
                                        <h3 className="text-sm font-black text-slate-900 dark:text-white tracking-tight">Manual Lead Details</h3>
                                        <p className="text-[10px] text-slate-400 font-mono mt-0.5">ID: {selectedLead._id}</p>
                                    </div>
                                    <button 
                                        onClick={() => setSelectedLead(null)}
                                        className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-650 rounded-xl transition-all"
                                    >
                                        <X className="w-4.5 h-4.5" />
                                    </button>
                                </div>

                                {/* Drawer Content Scroll */}
                                <div className="flex-1 overflow-y-auto p-6 space-y-8">
                                    <div className="flex items-center justify-between">
                                        {getCategoryBadge(selectedLead.category)}
                                        {getStatusBadge(selectedLead.status)}
                                    </div>

                                    {/* Section 1: Customer Contact info */}
                                    <div className="space-y-4">
                                        <h4 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-1.5 border-b border-slate-100 dark:border-slate-800 pb-1.5">
                                            <UserIcon className="w-3.5 h-3.5" />
                                            <span>Customer Contacts</span>
                                        </h4>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5 text-xs font-semibold">
                                            <div className="md:col-span-2">
                                                <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-widest font-black">Full Name</p>
                                                <p className="text-slate-850 dark:text-white mt-1 text-sm font-bold">{selectedLead.name}</p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-widest font-black">Phone Number</p>
                                                <p className="text-slate-850 dark:text-white mt-1 font-mono text-sm">{selectedLead.phone}</p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-widest font-black">Pincode</p>
                                                <p className="text-slate-850 dark:text-white mt-1 text-sm">{selectedLead.pincode || "N/A"}</p>
                                            </div>
                                            <div className="sm:col-span-2 md:col-span-4">
                                                <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-widest font-black">Location</p>
                                                <p className="text-slate-850 dark:text-white mt-1 text-sm">
                                                    {[selectedLead.city, selectedLead.state].filter(Boolean).join(", ") || "N/A"}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Section 2: Scrap Vehicle (Conditional) */}
                                    {(selectedLead.category === "scrap_only" || selectedLead.category === "scrap_and_buy") && (
                                        <div className="space-y-4">
                                            <h4 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-1.5 border-b border-slate-100 dark:border-slate-800 pb-1.5">
                                                <Car className="w-3.5 h-3.5" />
                                                <span>Scrap Vehicle Information</span>
                                            </h4>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 text-xs font-semibold">
                                                <div>
                                                    <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-widest font-black">Brand / Model</p>
                                                    <p className="text-slate-850 dark:text-white mt-1 text-sm">{selectedLead.brand} {selectedLead.model}</p>
                                                </div>
                                                <div>
                                                    <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-widest font-black">Registration Number</p>
                                                    <p className="text-slate-850 dark:text-white mt-1 uppercase text-sm">{selectedLead.regNo || "N/A"}</p>
                                                </div>
                                                <div>
                                                    <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-widest font-black">Year</p>
                                                    <p className="text-slate-850 dark:text-white mt-1 text-sm">{selectedLead.year || "N/A"}</p>
                                                </div>
                                                <div>
                                                    <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-widest font-black">Fuel Type</p>
                                                    <p className="text-slate-850 dark:text-white mt-1 text-sm">{selectedLead.fuel?.join(", ") || "N/A"}</p>
                                                </div>
                                                <div>
                                                    <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-widest font-black">KMs Driven</p>
                                                    <p className="text-slate-850 dark:text-white mt-1 font-mono text-sm">{selectedLead.kms ? Number(selectedLead.kms).toLocaleString() : "N/A"}</p>
                                                </div>
                                                <div>
                                                    <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-widest font-black">Weight (Tons)</p>
                                                    <p className="text-slate-850 dark:text-white mt-1 text-sm">{selectedLead.weight || "N/A"}</p>
                                                </div>
                                            </div>
                                            {selectedLead.carPhoto && (
                                                <div className="mt-4 space-y-2">
                                                    <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-widest font-black">Vehicle Photo</p>
                                                    <div className="relative rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 aspect-video max-w-sm">
                                                        <img 
                                                            src={selectedLead.carPhoto} 
                                                            alt="Vehicle Photo" 
                                                            className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform duration-300"
                                                            onClick={() => window.open(selectedLead.carPhoto, '_blank')}
                                                        />
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Section 3: Desired Vehicle (Conditional) */}
                                    {(selectedLead.category === "buy_only" || selectedLead.category === "scrap_and_buy") && (
                                        <div className="space-y-4">
                                            <h4 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-1.5 border-b border-slate-100 dark:border-slate-800 pb-1.5">
                                                <Compass className="w-3.5 h-3.5" />
                                                <span>Desired New Vehicle Info</span>
                                            </h4>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs font-semibold">
                                                <div>
                                                    <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-widest font-black">Desired Brand</p>
                                                    <p className="text-slate-850 dark:text-white mt-1 text-sm">{selectedLead.desiredCompany || "N/A"}</p>
                                                </div>
                                                <div>
                                                    <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-widest font-black">Desired Model</p>
                                                    <p className="text-slate-850 dark:text-white mt-1 text-sm">{selectedLead.desiredModel || "N/A"}</p>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Drawer Footer Action Control Menu */}
                                <div className="p-3.5 pb-9 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 flex flex-col gap-2">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                        {/* Communication Buttons Block */}
                                        <div className="flex gap-2">
                                            {/* WhatsApp Chat button */}
                                            <a 
                                                href={`https://wa.me/${selectedLead.phone.replace(/\D/g, '')}`}
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 bg-[#EDFDF3] hover:bg-[#DDFCE7] text-emerald-650 hover:text-emerald-700 dark:bg-emerald-950/20 dark:hover:bg-emerald-900/30 rounded-xl font-bold text-xs shadow-sm transition-all"
                                            >
                                                <MessageCircle className="w-4 h-4 fill-emerald-100" />
                                                <span>Chat</span>
                                            </a>

                                            {/* Phone Dial trigger */}
                                            <a 
                                                href={`tel:${selectedLead.phone}`}
                                                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-650 dark:text-slate-350 rounded-xl flex items-center justify-center transition-all"
                                                title="Call customer directly"
                                            >
                                                <Phone className="w-4 h-4" />
                                            </a>
                                        </div>

                                        {/* Status / Processing Actions Block */}
                                        <div className="flex gap-2">
                                            {/* Convert to Personal Lead button */}
                                            <button 
                                                onClick={() => handleStatusUpdate(selectedLead._id, selectedLead.category, "approved")}
                                                disabled={selectedLead.status === "approved"}
                                                className={`flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl font-bold text-xs shadow-sm transition-all ${
                                                    selectedLead.status === "approved"
                                                    ? "bg-slate-100 text-slate-400 cursor-not-allowed dark:bg-slate-800 dark:text-slate-655"
                                                    : "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/10"
                                                }`}
                                            >
                                                <UserIcon className="w-3.5 h-3.5" />
                                                <span>Personal Lead</span>
                                            </button>

                                            {/* Assign to RVSF button */}
                                            <button 
                                                onClick={() => handleStatusUpdate(selectedLead._id, selectedLead.category, "approved_to_rvsf")}
                                                disabled={selectedLead.status === "approved_to_rvsf"}
                                                className={`flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl font-bold text-xs shadow-sm transition-all ${
                                                    selectedLead.status === "approved_to_rvsf"
                                                    ? "bg-slate-100 text-slate-400 cursor-not-allowed dark:bg-slate-800 dark:text-slate-655"
                                                    : "bg-purple-600 hover:bg-purple-700 text-white shadow-purple-500/10"
                                                }`}
                                            >
                                                <ShieldCheck className="w-3.5 h-3.5" />
                                                <span>Assign to RVSF</span>
                                            </button>
                                        </div>
                                    </div>

                                    {/* Delete button */}
                                    <button 
                                        onClick={() => handleDeleteLead(selectedLead._id, selectedLead.category)}
                                        className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 bg-[#FEE2E2] hover:bg-[#FCA5A5] text-[#EF4444] rounded-xl font-bold text-xs shadow-sm transition-all"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                        <span>Purge / Delete Lead Record</span>
                                    </button>
                                </div>
                            </motion.div>
                        </>
                    )}
                </AnimatePresence>

            </div>
        </div>
    )
}

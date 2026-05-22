"use client"

import React, { useState, useEffect } from "react"
import { 
    Plus, 
    Trash2, 
    User as UserIcon, 
    Mail, 
    Lock, 
    Shield, 
    Search,
    Loader2,
    ShieldCheck,
    RefreshCcw,
    Users,
    UserPlus,
    X,
    Building
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

import { useToast } from "@/components/ui/use-toast"
import { apiFetch } from "@/lib/fetch"

interface RVSFUser {
    _id: string
    name: string
    email: string
    rvsfId: string
    createdAt: string
}

export default function RVSFGeneratorAdmin() {
    const [users, setUsers] = useState<RVSFUser[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isCreating, setIsCreating] = useState(false)
    const [isDeleting, setIsDeleting] = useState<string | null>(null)
    const [showForm, setShowForm] = useState(false)
    
    // Form State
    const [formData, setFormData] = useState({
        name: "",
        rvsfId: "",
        email: "",
        password: ""
    })
    const [searchTerm, setSearchTerm] = useState("")

    const { toast } = useToast()

    useEffect(() => {
        fetchUsers()
        generateCredentials()
    }, [])

    const fetchUsers = async () => {
        setIsLoading(true)
        try {
            const res = await fetch("/api/admin/rvsf-generator")
            if (!res.ok) {
                const data = await res.json()
                throw new Error(data.message || "Failed to fetch identities")
            }
            const data = await res.json()
            if (Array.isArray(data)) setUsers(data)
        } catch (error: any) {
            toast({
                title: "Network Error",
                description: error.message || "Unable to establish connection with the security server.",
                variant: "destructive"
            })
        } finally {
            setIsLoading(false)
        }
    }

    const generateCredentials = () => {
        const randomId = `RVSF${Math.floor(10000 + Math.random() * 90000)}`
        const randomPass = Math.random().toString(36).slice(-8) + Math.floor(Math.random() * 10)
        setFormData(prev => ({ ...prev, rvsfId: prev.rvsfId || randomId, password: randomPass }))
    }

    const handleCreateUser = async (e: React.FormEvent) => {
        e.preventDefault()
        if (formData.password.length < 4) {
            toast({
                title: "Insecure Key",
                description: "Security protocol requires a minimum of 4 characters.",
                variant: "destructive"
            })
            return
        }

        setIsCreating(true)
        try {
            const res = await apiFetch("/api/admin/rvsf-generator", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            })
            
            const data = await res.json()
            
            if (res.ok) {
                toast({
                    title: "Identity Provisioned",
                    description: `Access identity for ${formData.name} has been activated.`,
                })
                setShowForm(false)
                setFormData({ name: "", rvsfId: "", email: "", password: "" })
                generateCredentials()
                fetchUsers()
            } else {
                toast({
                    title: "Provisioning Failed",
                    description: data.message || "An unexpected error occurred during identity generation.",
                    variant: "destructive"
                })
            }
        } catch (error) {
            toast({
                title: "System Error",
                description: "Failed to communicate with the identity provisioning service.",
                variant: "destructive"
            })
        } finally {
            setIsCreating(false)
        }
    }

    const handleDeleteUser = async (id: string) => {
        if (!confirm("Confirm Identity Deletion? This will immediately revoke all portal access.")) return
        
        setIsDeleting(id)
        try {
            const res = await apiFetch(`/api/admin/rvsf-generator/${id}`, {
                method: "DELETE",
            })
            
            if (res.ok) {
                toast({
                    title: "Access Revoked",
                    description: "The identity has been purged from the network.",
                })
                fetchUsers()
            } else {
                const data = await res.json()
                toast({
                    title: "Purge Failed",
                    description: data.message || "Unauthorized or invalid identity deletion request.",
                    variant: "destructive"
                })
            }
        } catch (error) {
            toast({
                title: "Communication Failure",
                description: "Unable to reach the security controller.",
                variant: "destructive"
            })
        } finally {
            setIsDeleting(null)
        }
    }

    const filteredUsers = users.filter(u => 
        u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.rvsfId?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <div className="min-h-screen bg-[#FBFBFE] dark:bg-slate-950 p-6 lg:p-10 font-sans selection:bg-[#E31E24] selection:text-white">
            <div className="max-w-6xl mx-auto space-y-10">
                
                {/* Header Area */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div className="space-y-1">
                        <div className="flex items-center gap-3">
                            <ShieldCheck className="w-8 h-8 text-[#E31E24]" />
                            <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                                RVSF Management
                            </h1>
                        </div>
                        <p className="text-slate-500 dark:text-slate-400 font-medium">Provision and manage secure access identities for RVSF facilities.</p>
                    </div>

                    <button 
                        onClick={() => setShowForm(!showForm)}
                        className={`flex items-center gap-2 px-6 py-3.5 rounded-xl font-bold transition-all shadow-lg active:scale-95 ${
                            showForm 
                            ? "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200" 
                            : "bg-[#E31E24] hover:bg-red-700 text-white shadow-red-600/20"
                        }`}
                    >
                        {showForm ? <X className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />}
                        {showForm ? "Cancel Operation" : "Provision New User"}
                    </button>
                </div>

                {/* Inline Provisioning Form */}
                <AnimatePresence>
                    {showForm && (
                        <motion.div
                            initial={{ opacity: 0, height: 0, y: -20 }}
                            animate={{ opacity: 1, height: "auto", y: 0 }}
                            exit={{ opacity: 0, height: 0, y: -20 }}
                            className="overflow-hidden"
                        >
                            <div className="bg-white dark:bg-[#0E192D] rounded-[2rem] p-8 shadow-sm border border-slate-100 dark:border-slate-800 transition-all">
                                <div className="flex items-center gap-3 mb-8">
                                    <div className="bg-red-50 dark:bg-red-500/10 p-2 rounded-lg">
                                        <Plus className="w-5 h-5 text-[#E31E24]" />
                                    </div>
                                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                                        New Security Identity
                                    </h2>
                                </div>

                                <form onSubmit={handleCreateUser} className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Facility Name</label>
                                        <div className="relative group">
                                            <Building className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-[#E31E24] transition-colors" />
                                            <input 
                                                required
                                                type="text" 
                                                placeholder="RVSF Facility A"
                                                value={formData.name}
                                                onChange={(e) => setFormData({...formData, name: e.target.value})}
                                                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-11 py-3.5 focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none transition-all dark:text-white font-medium text-sm"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">RVSF ID</label>
                                        <div className="relative group">
                                            <Shield className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-[#E31E24] transition-colors" />
                                            <input 
                                                required
                                                type="text" 
                                                placeholder="e.g. RVSF12345"
                                                value={formData.rvsfId}
                                                onChange={(e) => setFormData({...formData, rvsfId: e.target.value})}
                                                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-11 py-3.5 focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none transition-all dark:text-white font-medium text-sm"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Portal Email</label>
                                        <div className="relative group">
                                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-[#E31E24] transition-colors" />
                                            <input 
                                                required
                                                type="email" 
                                                placeholder="contact@rvsf.in"
                                                value={formData.email}
                                                onChange={(e) => setFormData({...formData, email: e.target.value})}
                                                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-11 py-3.5 focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none transition-all dark:text-white font-medium text-sm"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Generated Key</label>
                                        <div className="relative flex gap-2 group">
                                            <div className="relative flex-1">
                                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-[#E31E24] transition-colors" />
                                                <input 
                                                    required
                                                    type="text" 
                                                    placeholder="••••••••"
                                                    value={formData.password}
                                                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                                                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-11 py-3.5 focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none transition-all dark:text-white font-medium text-sm"
                                                />
                                            </div>
                                            <button 
                                                type="button"
                                                onClick={generateCredentials}
                                                className="px-3 bg-slate-100 dark:bg-slate-800 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center justify-center group/btn"
                                                title="Regenerate Credentials"
                                            >
                                                <RefreshCcw className="w-4 h-4 text-slate-500 group-hover/btn:rotate-180 transition-transform duration-500" />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="md:col-span-4 flex justify-end pt-2">
                                        <button 
                                            disabled={isCreating}
                                            type="submit"
                                            className="bg-[#E31E24] hover:bg-red-700 text-white font-bold py-4 px-10 rounded-xl transition-all shadow-lg shadow-red-600/20 flex items-center gap-2 disabled:opacity-50 active:scale-95"
                                        >
                                            {isCreating ? <Loader2 className="w-5 h-5 animate-spin" /> : <ShieldCheck className="w-5 h-5" />}
                                            Activate Identity
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Directory Section */}
                <div className="bg-white dark:bg-[#0E192D] rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden transition-all">
                    <div className="p-8 border-b border-slate-50 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-slate-50/30 dark:bg-white/[0.01]">
                        <div className="flex items-center gap-3">
                            <div className="bg-slate-100 dark:bg-slate-800 p-2 rounded-lg text-slate-500">
                                <Users className="w-5 h-5" />
                            </div>
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Identity Directory</h2>
                            <span className="text-[10px] font-black bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 px-3 py-1 rounded-full border border-red-100 dark:border-red-800/50 uppercase tracking-widest">
                                {users.length} Active
                            </span>
                        </div>

                        <div className="relative flex-1 max-w-sm group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-[#E31E24] transition-colors" />
                            <input 
                                type="text" 
                                placeholder="Search by name, ID or email..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-red-500/50 rounded-xl py-3 pl-11 pr-4 outline-none text-sm font-medium text-slate-700 dark:text-slate-200 transition-all shadow-sm"
                            />
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-50 dark:border-slate-800">
                                    <th className="px-10 py-5 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">RVSF Facility</th>
                                    <th className="px-10 py-5 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">Access Identity</th>
                                    <th className="px-10 py-5 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] text-right">Security Control</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                                {isLoading ? (
                                    [1, 2, 3].map((i) => (
                                        <tr key={i} className="animate-pulse">
                                            <td colSpan={3} className="px-10 py-8">
                                                <div className="h-14 bg-slate-50 dark:bg-slate-900/50 rounded-2xl" />
                                            </td>
                                        </tr>
                                    ))
                                ) : filteredUsers.length === 0 ? (
                                    <tr>
                                        <td colSpan={3} className="px-10 py-24 text-center">
                                            <p className="text-slate-400 font-medium italic">No identities match your search criteria.</p>
                                        </td>
                                    </tr>
                                ) : filteredUsers.map((user) => (
                                    <tr key={user._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors group">
                                        <td className="px-10 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-2xl flex items-center justify-center text-[#E31E24] font-bold text-lg border border-red-200/50 dark:border-red-800/50 transition-all group-hover:scale-105">
                                                    {user.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-slate-900 dark:text-white">{user.name}</p>
                                                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Provisioned {new Date(user.createdAt).toLocaleDateString()}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-10 py-6">
                                             <div className="space-y-1.5">
                                                 <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300 font-bold">
                                                     <Shield className="w-3.5 h-3.5 text-[#E31E24]" />
                                                     {user.rvsfId || 'N/A'}
                                                 </div>
                                                 <div className="flex items-center gap-2 text-[11px] text-slate-400 font-medium">
                                                     <Mail className="w-3.5 h-3.5 text-slate-400" />
                                                     {user.email}
                                                 </div>
                                             </div>
                                         </td>
                                            <td className="px-10 py-6 text-right">
                                                <button 
                                                    onClick={() => handleDeleteUser(user._id)}
                                                    disabled={isDeleting === user._id}
                                                    className="p-3 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-2xl transition-all border border-transparent hover:border-red-500/20 shadow-sm disabled:opacity-50"
                                                    title="Revoke Access"
                                                >
                                                    {isDeleting === user._id ? <Loader2 className="w-5 h-5 animate-spin" /> : <Trash2 className="w-5 h-5" />}
                                                </button>
                                            </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
            </div>
        </div>
    </div>
    )
}

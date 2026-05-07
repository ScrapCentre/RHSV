"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
    Shield, 
    Plus, 
    Trash2, 
    Mail, 
    User as UserIcon, 
    Lock, 
    Loader2, 
    AlertCircle,
    CheckCircle2,
    RefreshCcw,
    Users,
    UserPlus
} from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

export default function AdminExecutivesPage() {
    const [executives, setExecutives] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isCreating, setIsCreating] = useState(false)
    const [showForm, setShowForm] = useState(false)
    
    // Form state
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: ""
    })

    const { toast } = useToast()

    useEffect(() => {
        fetchExecutives()
    }, [])

    const fetchExecutives = async () => {
        setIsLoading(true)
        try {
            const res = await fetch("/api/admin/executives")
            const data = await res.json()
            if (data.success) {
                setExecutives(data.data)
            } else {
                toast({
                    title: "Error",
                    description: data.message,
                    variant: "destructive"
                })
            }
        } catch (error) {
            console.error("Fetch Error:", error)
        } finally {
            setIsLoading(false)
        }
    }

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsCreating(true)

        try {
            const res = await fetch("/api/admin/executives", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            })
            const data = await res.json()

            if (data.success) {
                toast({
                    title: "Success",
                    description: "Executive account created successfully",
                })
                setFormData({ name: "", email: "", password: "" })
                setShowForm(false)
                fetchExecutives()
            } else {
                toast({
                    title: "Creation Failed",
                    description: data.message,
                    variant: "destructive"
                })
            }
        } catch (error) {
            toast({
                title: "Error",
                description: "Something went wrong",
                variant: "destructive"
            })
        } finally {
            setIsCreating(false)
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this executive account?")) return

        try {
            const res = await fetch(`/api/admin/executives/${id}`, {
                method: "DELETE"
            })
            const data = await res.json()

            if (data.success) {
                toast({
                    title: "Deleted",
                    description: "Executive account removed"
                })
                fetchExecutives()
            } else {
                toast({
                    title: "Error",
                    description: data.message,
                    variant: "destructive"
                })
            }
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to delete account",
                variant: "destructive"
            })
        }
    }

    return (
        <div className="space-y-8 max-w-6xl mx-auto pb-12">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 dark:text-white flex items-center gap-3 tracking-tight">
                        <Shield className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                        Executive Management
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-2 font-medium">Create and manage high-authority executive portal accounts.</p>
                </div>

                <button 
                    onClick={() => setShowForm(!showForm)}
                    className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-blue-600/20 active:scale-95"
                >
                    {showForm ? <Trash2 className="w-5 h-5 rotate-45" /> : <UserPlus className="w-5 h-5" />}
                    {showForm ? "Cancel" : "Add New Executive"}
                </button>
            </div>

            {/* Create Form Section */}
            <AnimatePresence>
                {showForm && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="bg-white dark:bg-[#0E192D] rounded-3xl p-8 shadow-sm border border-gray-100 dark:border-slate-800 transition-all">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                                <Plus className="w-5 h-5 text-blue-500" />
                                Provision New Account
                            </h2>
                            <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Full Name</label>
                                    <div className="relative">
                                        <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                        <input 
                                            required
                                            type="text" 
                                            placeholder="John Doe"
                                            value={formData.name}
                                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                                            className="w-full bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl px-11 py-3 focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-white"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Email / Username</label>
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                        <input 
                                            required
                                            type="email" 
                                            placeholder="exec@scrapcenter.in"
                                            value={formData.email}
                                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                                            className="w-full bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl px-11 py-3 focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-white"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Password</label>
                                    <div className="relative flex gap-2">
                                        <div className="relative flex-1">
                                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                            <input 
                                                required
                                                type="text" 
                                                placeholder="••••••••"
                                                value={formData.password}
                                                onChange={(e) => setFormData({...formData, password: e.target.value})}
                                                className="w-full bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl px-11 py-3 focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-white"
                                            />
                                        </div>
                                        <button 
                                            type="button"
                                            onClick={() => setFormData({...formData, password: Math.random().toString(36).slice(-10) + '!'})}
                                            className="px-3 bg-gray-100 dark:bg-slate-800 rounded-xl hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors"
                                            title="Generate Password"
                                        >
                                            <RefreshCcw className="w-4 h-4 text-gray-500" />
                                        </button>
                                    </div>
                                </div>
                                <div className="md:col-span-3 flex justify-end">
                                    <button 
                                        disabled={isCreating}
                                        type="submit"
                                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-xl transition-all shadow-lg flex items-center gap-2 disabled:opacity-50"
                                    >
                                        {isCreating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
                                        Provision Executive
                                    </button>
                                </div>
                            </form>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* List Section */}
            <div className="bg-white dark:bg-[#0E192D] rounded-3xl shadow-sm border border-gray-100 dark:border-slate-800 overflow-hidden transition-all">
                <div className="p-6 md:p-8 border-b border-gray-100 dark:border-slate-800 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <Users className="w-5 h-5 text-gray-400" />
                        Executive Directory
                    </h2>
                    <span className="text-xs font-bold bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-3 py-1.5 rounded-full border border-blue-100 dark:border-blue-800/50">
                        {executives.length} Accounts Active
                    </span>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gray-50 dark:bg-slate-900/50 border-b border-gray-100 dark:border-slate-800">
                                <th className="px-8 py-4 text-xs font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest">Executive</th>
                                <th className="px-8 py-4 text-xs font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest">Auth Credentials</th>
                                <th className="px-8 py-4 text-xs font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 dark:divide-slate-800/50">
                            {isLoading ? (
                                [1, 2, 3].map((i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan={3} className="px-8 py-6">
                                            <div className="h-12 bg-gray-50 dark:bg-slate-900/50 rounded-xl" />
                                        </td>
                                    </tr>
                                ))
                            ) : executives.length === 0 ? (
                                <tr>
                                    <td colSpan={3} className="px-8 py-16 text-center">
                                        <div className="flex flex-col items-center gap-4 opacity-50">
                                            <AlertCircle className="w-12 h-12 text-gray-300" />
                                            <p className="font-bold text-gray-500">No executive accounts found.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                executives.map((exec) => (
                                    <tr key={exec._id} className="hover:bg-gray-50 dark:hover:bg-slate-800/30 transition-colors">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold">
                                                    {exec.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-gray-900 dark:text-white">{exec.name}</p>
                                                    <p className="text-xs text-gray-400 font-medium">Provisioned on {new Date(exec.createdAt).toLocaleDateString()}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 font-medium">
                                                    <Mail className="w-3.5 h-3.5 text-gray-400" />
                                                    {exec.email}
                                                </div>
                                                <div className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-gray-100 dark:bg-slate-800 rounded-md text-[10px] font-black text-gray-500 uppercase tracking-tighter border border-gray-200 dark:border-slate-700">
                                                    <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                                                    Verified Status
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <button 
                                                onClick={() => handleDelete(exec._id)}
                                                className="p-2.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all"
                                                title="Delete Account"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}

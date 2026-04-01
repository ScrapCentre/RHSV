"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Mail, Phone, Calendar, MessageSquare, CheckCircle, Clock, Eye, X, Trash2 } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useToast } from "@/hooks/use-toast"

interface Contact {
    _id: string
    name: string
    email: string
    phone: string
    subject: string
    message: string
    status: "new" | "reviewed" | "resolved"
    createdAt: string
}

interface ContactListProps {
    initialContacts: Contact[]
}

export default function ContactList({ initialContacts }: ContactListProps) {
    const { toast } = useToast()
    const searchParams = useSearchParams()
    const [contacts, setContacts] = useState<Contact[]>(initialContacts)
    const [selectedContact, setSelectedContact] = useState<Contact | null>(null)
    const [isUpdating, setIsUpdating] = useState(false)

    useEffect(() => {
        const highlightId = searchParams.get("id")
        const shouldHighlight = searchParams.get("highlight") === "true"

        if (highlightId && shouldHighlight) {
            const contactToHighlight = contacts.find(c => c._id === highlightId)
            if (contactToHighlight) {
                handleViewContact(contactToHighlight)
            }
        }
    }, [searchParams, contacts])

    const handleViewContact = async (contact: Contact) => {
        // Optimistically set to reviewed if it's new
        const optimisticContact = contact.status === "new" ? { ...contact, status: "reviewed" as const } : contact;
        setSelectedContact(optimisticContact);

        if (contact.status === "new") {
            // Optimistically update the list
            setContacts(prev => prev.map(c => c._id === contact._id ? { ...c, status: "reviewed" } : c));

            try {
                const res = await fetch(`/api/admin/contact/${contact._id}`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ status: "reviewed" })
                })

                if (!res.ok) {
                    throw new Error("Failed to update status")
                }
            } catch (error) {
                console.error("Error updating contact status:", error);

                toast({
                    title: "Error updating status",
                    description: "Reverted status to new. Please try again.",
                    variant: "destructive",
                });

                // Revert on error
                setContacts(prev => prev.map(c => c._id === contact._id ? { ...c, status: "new" } : c));
                setSelectedContact(prev => prev?._id === contact._id ? { ...prev, status: "new" } : prev);
            }
        }
    }

    const handleUpdateStatus = async (id: string, newStatus: "new" | "reviewed" | "resolved") => {
        setIsUpdating(true)
        try {
            const res = await fetch(`/api/admin/contact/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: newStatus })
            })

            if (res.ok) {
                setContacts(prev => prev.map(c => c._id === id ? { ...c, status: newStatus } : c))
                if (selectedContact?._id === id) {
                    setSelectedContact(prev => prev ? { ...prev, status: newStatus } : null)
                }
            } else {
                throw new Error("Failed to update status")
            }
        } catch (error) {
            console.error("Error updating status:", error)
            toast({
                title: "Error updating status",
                description: "Failed to update contact status. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsUpdating(false)
        }
    }

    const handleDeleteContact = async (id: string) => {
        if (!confirm("Are you sure you want to delete this contact request?")) return

        setIsUpdating(true)
        try {
            const res = await fetch(`/api/admin/contact/${id}`, {
                method: "DELETE"
            })

            if (res.ok) {
                setContacts(prev => prev.filter(c => c._id !== id))
                setSelectedContact(null)
                toast({
                    title: "Contact deleted",
                    description: "The contact request has been deleted.",
                });
            } else {
                throw new Error("Failed to delete contact")
            }
        } catch (error) {
            console.error("Error deleting contact:", error)
            toast({
                title: "Error deleting contact",
                description: "There was a problem deleting this request.",
                variant: "destructive",
            });
        } finally {
            setIsUpdating(false)
        }
    }

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.05
            }
        }
    }

    const itemVariants = {
        hidden: { opacity: 0, y: 10 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.4, ease: [0.215, 0.61, 0.355, 1] as any }
        }
    }

    return (
        <div className="space-y-8">
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="bg-white dark:bg-[#0E192D] shadow-sm border border-gray-200 dark:border-slate-800 rounded-2xl overflow-hidden hidden md:block"
            >
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-gray-50 dark:bg-slate-900/50 border-b border-gray-200 dark:border-slate-800">
                                <th className="text-left py-4 px-6 font-semibold text-gray-600 dark:text-slate-400 text-sm uppercase tracking-wider">User</th>
                                <th className="text-left py-4 px-6 font-semibold text-gray-600 dark:text-slate-400 text-sm uppercase tracking-wider">Message Details</th>
                                <th className="text-left py-4 px-6 font-semibold text-gray-600 dark:text-slate-400 text-sm uppercase tracking-wider">Status</th>
                                <th className="text-left py-4 px-6 font-semibold text-gray-600 dark:text-slate-400 text-sm uppercase tracking-wider">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                            {contacts.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="py-12 text-center text-gray-500 dark:text-slate-500">
                                        No contact requests found.
                                    </td>
                                </tr>
                            ) : (
                                contacts.map((contact) => (
                                    <motion.tr
                                        key={contact._id}
                                        variants={itemVariants}
                                        className={`hover:bg-gray-50/50 dark:hover:bg-slate-800/50 transition-colors ${searchParams.get("id") === contact._id && searchParams.get("highlight") === "true" ? "bg-amber-500/10 dark:bg-amber-500/20" : ""}`}
                                        animate={searchParams.get("id") === contact._id && searchParams.get("highlight") === "true" ? {
                                            backgroundColor: ["rgba(245, 158, 11, 0)", "rgba(245, 158, 11, 0.15)", "rgba(245, 158, 11, 0)", "rgba(245, 158, 11, 0.15)", "rgba(245, 158, 11, 0)"],
                                            transition: { duration: 2, times: [0, 0.25, 0.5, 0.75, 1] }
                                        } : {}}
                                    >
                                        <td className="py-4 px-6 align-top">
                                            <div className="space-y-1">
                                                <p className="font-bold text-gray-900 dark:text-white">{contact.name}</p>
                                                <div className="flex items-center text-gray-500 dark:text-slate-400 text-sm">
                                                    <Mail className="w-3.5 h-3.5 mr-1.5" />
                                                    {contact.email}
                                                </div>
                                                <div className="flex items-center text-gray-500 dark:text-slate-400 text-sm">
                                                    <Phone className="w-3.5 h-3.5 mr-1.5" />
                                                    {contact.phone}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6 align-top max-w-xs">
                                            <div className="space-y-1">
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300">
                                                    {contact.subject}
                                                </span>
                                                <p className="text-gray-700 dark:text-slate-300 text-sm leading-relaxed mt-1 line-clamp-2">
                                                    {contact.message}
                                                </p>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6 align-top">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${contact.status === 'resolved' ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400' :
                                                contact.status === 'reviewed' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400' :
                                                    'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400'
                                                }`}>
                                                {contact.status === 'resolved' ? <CheckCircle className="w-3 h-3 mr-1" /> :
                                                    contact.status === 'reviewed' ? <MessageSquare className="w-3 h-3 mr-1" /> :
                                                        <Clock className="w-3 h-3 mr-1" />}
                                                {contact.status.charAt(0).toUpperCase() + contact.status.slice(1)}
                                            </span>
                                            <p className="text-[10px] text-gray-400 dark:text-slate-500 mt-1 flex items-center">
                                                <Calendar className="w-2.5 h-2.5 mr-1" />
                                                {new Date(contact.createdAt).toLocaleDateString()}
                                            </p>
                                        </td>
                                        <td className="py-4 px-6 align-top">
                                            <button
                                                onClick={() => handleViewContact(contact)}
                                                className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-bold bg-gray-100 hover:bg-emerald-500 hover:text-white dark:bg-slate-800 dark:hover:bg-emerald-500 transition-all group"
                                            >
                                                <Eye className="w-3.5 h-3.5 mr-1.5 group-hover:scale-110 transition-transform" />
                                                View
                                            </button>
                                        </td>
                                    </motion.tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </motion.div>

            {/* Mobile View */}
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 gap-4 md:hidden"
            >
                {contacts.length === 0 ? (
                    <div className="bg-white dark:bg-[#0E192D] rounded-2xl shadow-sm border border-gray-200 dark:border-slate-800 p-8 text-center">
                        <p className="text-gray-500 dark:text-slate-500">No contact requests found.</p>
                    </div>
                ) : (
                    contacts.map((contact) => (
                        <motion.div key={contact._id} variants={itemVariants} className="bg-white dark:bg-[#0E192D] rounded-2xl shadow-sm border border-gray-200 dark:border-slate-800 p-5 space-y-4">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="font-bold text-gray-900 dark:text-white text-lg">{contact.name}</p>
                                    <span className="inline-flex items-center px-2.5 py-0.5 mt-1 rounded-full text-xs font-medium bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300">
                                        {contact.subject}
                                    </span>
                                </div>
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${contact.status === 'resolved' ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400' :
                                    contact.status === 'reviewed' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400' :
                                        'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400'
                                    }`}>
                                    {contact.status === 'resolved' ? <CheckCircle className="w-3 h-3 mr-1" /> :
                                        contact.status === 'reviewed' ? <MessageSquare className="w-3 h-3 mr-1" /> :
                                            <Clock className="w-3 h-3 mr-1" />}
                                    {contact.status.charAt(0).toUpperCase() + contact.status.slice(1)}
                                </span>
                            </div>

                            <div className="pt-3 border-t border-gray-100 dark:border-slate-800 flex items-center justify-between">
                                <div className="text-[10px] text-gray-400 dark:text-slate-500 flex items-center">
                                    <Calendar className="w-3 h-3 mr-1" />
                                    {new Date(contact.createdAt).toLocaleDateString()}
                                </div>
                                <button
                                    onClick={() => handleViewContact(contact)}
                                    className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-500 text-white hover:bg-emerald-600 transition-colors shadow-sm"
                                >
                                    <Eye className="w-3.5 h-3.5 mr-1.5" />
                                    View Details
                                </button>
                            </div>
                        </motion.div>
                    ))
                )}
            </motion.div>

            {/* Detail Modal */}
            <AnimatePresence>
                {selectedContact && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedContact(null)}
                            className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm"
                        />

                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="relative w-full max-w-2xl bg-white dark:bg-[#0E192D] rounded-3xl shadow-2xl border border-gray-200 dark:border-slate-800 overflow-hidden"
                        >
                            <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-900/50">
                                <div className="flex items-center gap-3">
                                    <div className="bg-emerald-500/10 p-2.5 rounded-2xl">
                                        <MessageSquare className="w-6 h-6 text-emerald-500" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">Message Details</h3>
                                        <p className="text-xs text-gray-500 dark:text-slate-500 font-medium">Ref: {selectedContact._id.slice(-8).toUpperCase()}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setSelectedContact(null)}
                                    className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-400 transition-colors"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            <div className="p-8 space-y-8">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                        <div>
                                            <p className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-1.5">Full Name</p>
                                            <p className="text-lg font-bold text-gray-900 dark:text-white">{selectedContact.name}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-1.5">Email Address</p>
                                            <div className="flex items-center">
                                                <Mail className="w-4 h-4 mr-2 text-blue-500" />
                                                <a href={`mailto:${selectedContact.email}`} className="text-gray-700 dark:text-slate-300 font-semibold hover:text-emerald-500 transition-colors underline decoration-dotted">
                                                    {selectedContact.email}
                                                </a>
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-1.5">Phone Number</p>
                                            <div className="flex items-center">
                                                <Phone className="w-4 h-4 mr-2 text-green-500" />
                                                <a href={`tel:${selectedContact.phone}`} className="text-gray-700 dark:text-slate-300 font-semibold hover:text-emerald-500 transition-colors underline decoration-dotted">
                                                    {selectedContact.phone}
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <div>
                                            <p className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-1.5">Submission Date</p>
                                            <p className="text-gray-900 dark:text-white font-bold inline-flex items-center px-3 py-1 bg-gray-100 dark:bg-slate-800 rounded-lg">
                                                <Calendar className="w-3.5 h-3.5 mr-2 text-purple-500" />
                                                {new Date(selectedContact.createdAt).toLocaleString()}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-1.5">Current Status</p>
                                            <span className={`inline-flex items-center px-4 py-1.5 rounded-xl text-xs font-bold ${selectedContact.status === 'resolved' ? 'bg-green-500/10 text-green-500' :
                                                selectedContact.status === 'reviewed' ? 'bg-blue-500/10 text-blue-500' :
                                                    'bg-yellow-500/10 text-yellow-500'
                                                }`}>
                                                {selectedContact.status.toUpperCase()}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-gray-50 dark:bg-slate-900/50 rounded-3xl p-6 border border-gray-100 dark:border-slate-800">
                                    <p className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-3">Subject: {selectedContact.subject}</p>
                                    <div className="bg-white dark:bg-slate-950 p-6 rounded-2xl border border-gray-100 dark:border-slate-800 min-h-[120px]">
                                        <p className="text-gray-700 dark:text-slate-300 leading-relaxed font-medium">
                                            {selectedContact.message}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                                    <button
                                        disabled={isUpdating}
                                        onClick={() => handleDeleteContact(selectedContact._id)}
                                        className="flex-1 bg-red-500 text-white font-bold py-3.5 rounded-2xl hover:bg-red-600 transition-all flex items-center justify-center gap-2 shadow-lg shadow-red-500/20 disabled:opacity-50"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                        Delete Request
                                    </button>
                                    <button
                                        onClick={() => setSelectedContact(null)}
                                        className="flex-1 bg-gray-100 dark:bg-slate-800 font-bold py-3.5 rounded-2xl hover:bg-gray-200 dark:hover:bg-slate-700 transition-all flex items-center justify-center gap-2"
                                    >
                                        Close Details
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    )
}

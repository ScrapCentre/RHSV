"use client"

import { Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { useState } from "react"

interface DeleteLeadButtonProps {
    id: string
    type: string
    onDelete?: () => void
}

export default function DeleteLeadButton({ id, type, onDelete }: DeleteLeadButtonProps) {
    const router = useRouter()
    const { toast } = useToast()
    const [isDeleting, setIsDeleting] = useState(false)

    const handleDelete = async (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()

        if (!confirm("Are you sure you want to delete this lead permanently?")) return

        setIsDeleting(true)
        try {
            const res = await fetch(`/api/admin/requests/delete?id=${id}&type=${type}`, {
                method: "DELETE"
            })

            if (res.ok) {
                toast({
                    title: "Success",
                    description: "Lead deleted successfully"
                })
                if (onDelete) {
                    onDelete()
                } else {
                    router.refresh()
                }
            } else {
                toast({
                    title: "Error",
                    description: "Failed to delete lead",
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
            setIsDeleting(false)
        }
    }

    return (
        <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
            title="Delete Lead"
        >
            <Trash2 className={`w-4 h-4 ${isDeleting ? "animate-pulse" : ""}`} />
        </button>
    )
}

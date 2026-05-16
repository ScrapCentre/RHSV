"use client"

import React, { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import EKYCForm from "@/components/eKYCForm"
import { motion } from "framer-motion"
import { Loader2 } from "lucide-react"

export default function EKYCPage() {
    const router = useRouter()
    const [formData, setFormData] = useState<any>({})
    const [valuationId, setValuationId] = useState<string | null>(null)
    const [source, setSource] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const storedData = localStorage.getItem("kycFormData")
        const storedValuationId = localStorage.getItem("kycValuationId")
        const storedSource = localStorage.getItem("kycSource")

        try {
            if (storedData) setFormData(JSON.parse(storedData))
        } catch (error) {
            console.error("Failed to parse form data", error)
        }

        if (storedValuationId) setValuationId(storedValuationId)
        if (storedSource) setSource(storedSource)
        
        setLoading(false)
    }, [])

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <Loader2 className="w-10 h-10 animate-spin text-[#E31E24]" />
            </div>
        )
    }

    return (
        <EKYCForm
            formData={formData}
            valuation={0}
            valuationId={valuationId}
            source={source}
            onBack={() => router.back()}
            isPage={true}
        />
    )
}

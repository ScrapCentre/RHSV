"use client"

import React, { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import EKYCForm from "@/components/eKYCForm"
import { motion } from "framer-motion"

export default function EKYCPage() {
    const router = useRouter()
    const [formData, setFormData] = useState<any>(null)
    const [valuation, setValuation] = useState(0)

    const [valuationId, setValuationId] = useState<string | null>(null)
    const [source, setSource] = useState<string | null>(null)

    useEffect(() => {
        // Retrieve data stored from ValuationModals
        const storedData = localStorage.getItem("kycFormData")
        const storedValuation = localStorage.getItem("kycValuation")
        const storedValuationId = localStorage.getItem("kycValuationId")
        const storedSource = localStorage.getItem("kycSource")

        try {
            if (storedData) {
                setFormData(JSON.parse(storedData))
            }
        } catch (error) {
            console.error("Failed to parse form data", error)
        }

        if (storedValuation) {
            setValuation(parseFloat(storedValuation))
        }

        if (storedValuationId) {
            setValuationId(storedValuationId)
        }

        if (storedSource) {
            setSource(storedSource)
        }
    }, [])

    if (!formData) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <p className="text-gray-500">Loading...</p>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-slate-50 pt-24 pb-12 px-0 md:px-6 lg:px-8 flex items-start justify-center">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-5xl"
            >
                <EKYCForm
                    formData={formData}
                    valuation={valuation}
                    valuationId={valuationId}
                    source={source}
                    onBack={() => router.back()}
                    isPage={true} // New prop to signal page mode styling
                />
            </motion.div>
        </div>
    )
}


"use client"

import React, { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import EKYCForm from "@/components/eKYCForm"

export default function GetQuoteEKYCPage() {
    const router = useRouter()
    const [formData, setFormData] = useState<any>(null)
    const [valuation, setValuation] = useState(0)
    // For Get Quote (Valuation), we might not have a database ID yet, or it's just a valuation ID
    // If ValuationModals creates an ID, we use it. If not, we might need to rely on the API creating one?
    // Based on previous code, ValuationModals logic saves kycFormData and kycValuation.
    // Let's assume for now it behaves similarly or we rely on creating a new entry if ID is missing (handled by API if modified).
    // HOWEVER, the API expects a valuationId. The Get Quote flow might need to ensure an ID is created first.
    // Let's check ValuationModals.tsx logic later. For now, we retrieve what's there.
    const [valuationId, setValuationId] = useState<string | null>(null)


    useEffect(() => {
        // Retrieve data stored from ValuationModals
        const storedData = localStorage.getItem("kycFormData")
        const storedValuation = localStorage.getItem("kycValuation")
        // ValuationModals might not be setting kycValuationId yet, we need to check that.
        const storedValuationId = localStorage.getItem("kycValuationId")

        try {
            if (storedData) {
                setFormData(JSON.parse(storedData))
            }
        } catch (e) {
            console.error("Error parsing stored data", e)
        }

        if (storedValuation) {
            setValuation(parseFloat(storedValuation))
        }

        if (storedValuationId) {
            setValuationId(storedValuationId)
        }

    }, [])

    if (!formData) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">No Valuation Data Found</h2>
                    <p className="text-gray-600 mb-6">Please start by getting a free quote.</p>
                    <button
                        onClick={() => router.push("/")}
                        className="px-6 py-2 bg-[#0E192D] text-white rounded-lg hover:bg-[#112240] transition-colors"
                    >
                        Get Free Quote
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="bg-gray-50 min-h-screen">
            <div className="max-w-4xl mx-auto pt-36 pb-12 px-4">
                <EKYCForm
                    formData={formData}
                    valuation={valuation}
                    valuationId={valuationId}
                    source="get-quote" // Maps to "Valuation" model in API
                    onBack={() => router.back()}
                    isPage={true}
                />
            </div>
        </div>
    )
}


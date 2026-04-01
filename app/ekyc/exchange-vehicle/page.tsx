"use client"

import React, { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import EKYCForm from "@/components/eKYCForm"
import AuthGuard from "@/components/AuthGuard"

export default function ExchangeVehicleEKYCPage() {
    const router = useRouter()
    const [formData, setFormData] = useState<any>(null)
    const [valuation, setValuation] = useState(0) // Exchange might not have a valuation number the same way, but let's keep consistency
    const [valuationId, setValuationId] = useState<string | null>(null)

    useEffect(() => {
        // Retrieve data stored from ExchangeVehicleForm (we need to update it to store this)
        const storedData = localStorage.getItem("kycFormData")
        const storedValuation = localStorage.getItem("kycValuation")
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
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">No Exchange Data Found</h2>
                    <p className="text-gray-600 mb-6">Please submit an exchange request first.</p>
                    <button
                        onClick={() => router.push("/services/exchange-vehicle")}
                        className="px-6 py-2 bg-[#0E192D] text-white rounded-lg hover:bg-[#112240] transition-colors"
                    >
                        Go to Exchange Vehicle
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="bg-gray-50 min-h-screen">
            <AuthGuard />
            <div className="max-w-4xl mx-auto pt-36 pb-12 px-4">
                <EKYCForm
                    formData={formData}
                    valuation={valuation}
                    valuationId={valuationId}
                    source="exchange-vehicle"
                    onBack={() => router.back()}
                    isPage={true}
                />
            </div>
        </div>
    )
}


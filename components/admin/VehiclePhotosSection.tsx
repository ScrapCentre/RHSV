"use client"

import React, { useState } from "react"
import { Image as ImageIcon, Upload, Loader2, Eye, Camera } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface VehiclePhotosSectionProps {
    leadId: string
    leadType: string // "buy" | "exchange" | "quote" | "scrap-buy"
    request: {
        carPhoto?: string
        photoFront?: string
        photoBack?: string
        photoLeft?: string
        photoRight?: string
        [key: string]: any
    }
    onPhotoUploaded: () => void
    className?: string
}

export default function VehiclePhotosSection({ leadId, leadType, request, onPhotoUploaded, className = "" }: VehiclePhotosSectionProps) {
    const { toast } = useToast()
    const [uploading, setUploading] = useState(false)

    // Gather all available photos
    const photos = [
        { label: "General View", url: request?.carPhoto },
        { label: "Front View", url: request?.photoFront },
        { label: "Back View", url: request?.photoBack },
        { label: "Left Side", url: request?.photoLeft },
        { label: "Right Side", url: request?.photoRight }
    ].filter(p => !!p.url)

    const hasPhotos = photos.length > 0

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        // Validate is image
        if (!file.type.startsWith("image/")) {
            toast({
                title: "Invalid file type",
                description: "Please upload an image file (PNG, JPG, JPEG, WEBP)",
                variant: "destructive"
            })
            return
        }

        setUploading(true)
        try {
            // 1. Upload to Cloudinary via API
            const formData = new FormData()
            formData.append("file", file)

            const uploadRes = await fetch("/api/upload", {
                method: "POST",
                body: formData
            })

            if (!uploadRes.ok) {
                const errData = await uploadRes.json()
                throw new Error(errData.message || "Failed to upload image")
            }

            const uploadData = await uploadRes.json()
            const imageUrl = uploadData.url

            // 2. Save image URL to lead
            const updateRes = await fetch("/api/admin/valuations/update-photo", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    id: leadId,
                    type: leadType,
                    carPhoto: imageUrl
                })
            })

            if (!updateRes.ok) {
                const errData = await updateRes.json()
                throw new Error(errData.error || "Failed to save photo to lead")
            }

            toast({
                title: "Photo Uploaded",
                description: "Vehicle photo has been successfully uploaded and saved to this lead."
            })

            // Trigger re-fetch in parent
            onPhotoUploaded()
        } catch (err: any) {
            console.error(err)
            toast({
                title: "Upload Failed",
                description: err.message || "An error occurred during upload",
                variant: "destructive"
            })
        } finally {
            setUploading(false)
        }
    }

    return (
        <div className={`bg-white dark:bg-[#0E192D] rounded-2xl border border-slate-100 dark:border-slate-800/80 p-5 shadow-sm transition-all duration-300 flex flex-col justify-between h-full relative overflow-hidden min-h-[280px] ${className}`}>
            {/* Header */}
            <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2.5">
                        <div className="p-2 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 rounded-lg">
                            <ImageIcon className="w-4.5 h-4.5" />
                        </div>
                        <div>
                            <h2 className="text-sm font-extrabold text-slate-800 dark:text-white tracking-tight">
                                Vehicle Photos
                            </h2>
                            <div className="h-0.5 w-8 bg-blue-500 rounded-full mt-1" />
                        </div>
                    </div>
                </div>

                {/* Content Area */}
                <div className="py-4">
                    {uploading ? (
                        <div className="flex flex-col items-center justify-center py-6 text-center space-y-3">
                            <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 animate-pulse">
                                Uploading photo to secure storage...
                            </p>
                        </div>
                    ) : hasPhotos ? (
                        /* Display Grid Gallery */
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            {photos.map((photo, idx) => (
                                <div key={idx} className="group relative rounded-xl overflow-hidden border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 aspect-video flex flex-col">
                                    <img
                                        src={photo.url}
                                        alt={photo.label}
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                    />
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-300 flex items-center justify-center gap-2">
                                        <button
                                            onClick={() => window.open(photo.url, '_blank')}
                                            className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-2 bg-white/90 dark:bg-slate-900/90 hover:bg-white dark:hover:bg-slate-800 text-slate-800 dark:text-white rounded-full shadow-md"
                                            title="View Full Size"
                                        >
                                            <Eye className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                    <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 to-transparent p-1.5 pt-4">
                                        <span className="text-[9px] font-extrabold text-white uppercase tracking-wider block">
                                            {photo.label}
                                        </span>
                                    </div>
                                </div>
                            ))}

                            {/* Allow uploading additional photos if less than 5 */}
                            {photos.length < 5 && (
                                <label className="border-2 border-dashed border-slate-200 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-500 rounded-xl flex flex-col items-center justify-center p-3 cursor-pointer transition-colors aspect-video group">
                                    <Camera className="w-5 h-5 text-slate-400 group-hover:text-blue-500 transition-colors" />
                                    <span className="text-[10px] font-bold text-slate-400 group-hover:text-blue-500 transition-colors mt-1">
                                        Add Photo
                                    </span>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={handleFileUpload}
                                    />
                                </label>
                            )}
                        </div>
                    ) : (
                        /* Upload Area Placeholder */
                        <div className="flex flex-col items-center justify-center py-6 text-center space-y-4">
                            <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-full border border-blue-100/50 dark:border-blue-900/30">
                                <Camera className="w-8 h-8 text-blue-500" />
                            </div>
                            <div>
                                <h3 className="font-extrabold text-xs text-slate-800 dark:text-white">
                                    No Photos Uploaded
                                </h3>
                                <p className="text-[11px] text-slate-400 dark:text-slate-500 max-w-[200px] mx-auto mt-0.5 leading-relaxed font-medium">
                                    No vehicle photos have been uploaded for this lead yet.
                                </p>
                            </div>
                            
                            <label className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-[11px] cursor-pointer transition-all shadow-md hover:scale-[1.02] active:scale-[0.98]">
                                <Upload className="w-3.5 h-3.5" />
                                <span>Upload Vehicle Photo</span>
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleFileUpload}
                                />
                            </label>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

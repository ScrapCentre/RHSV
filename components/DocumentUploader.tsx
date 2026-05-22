"use client"

/**
 * DocumentUploader — ScrapCentre.com
 * NEW component per design-system §4.10, §8, §6 (extracted from eKYCForm.tsx).
 * Reusable file upload card with camera/gallery split, progress bar, thumbnail.
 * Mobile-first: separate "Take photo" (capture) and "Upload from gallery" buttons.
 * Used by: app/ekyc (Tier 3 document upload), ChatThread (photo upload)
 *
 * Props:
 *   label: string — slot label, e.g. "Front of vehicle"
 *   helperText?: string
 *   onUpload: (file: File) => Promise<string>  — returns uploaded URL
 *   accept?: string  — defaults to "image/*"
 *
 * NOTE: Client-side compression via browser-image-compression is recommended
 * (design-system §8) but the package is not installed.
 * TODO[frontend-dev]: run `npm install browser-image-compression` and wire compression
 *   before the onUpload call. Target: < 2MB per image.
 */

import { useState, useRef } from "react"
import { Camera, Upload, CheckCircle, AlertTriangle, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"

interface DocumentUploaderProps {
  label: string
  helperText?: string
  onUpload: (file: File) => Promise<string>
  accept?: string
  className?: string
}

type UploadState = "idle" | "uploading" | "success" | "error"

export default function DocumentUploader({
  label,
  helperText,
  onUpload,
  accept = "image/*",
  className = "",
}: DocumentUploaderProps) {
  const [state, setState] = useState<UploadState>("idle")
  const [progress, setProgress] = useState(0)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [errorMsg, setErrorMsg] = useState("")

  // Two refs: one with capture (camera), one without (gallery)
  const cameraInputRef = useRef<HTMLInputElement>(null)
  const galleryInputRef = useRef<HTMLInputElement>(null)

  const handleFile = async (file: File) => {
    setErrorMsg("")

    // File size warning (design-system §8) — 8MB pre-compression
    if (file.size > 8 * 1024 * 1024) {
      setErrorMsg(
        "This photo is over 10 MB. Compress it a bit — or take a new one in normal daylight."
      )
      return
    }

    // Local preview
    const reader = new FileReader()
    reader.onload = (e) => setPreviewUrl(e.target?.result as string)
    reader.readAsDataURL(file)

    // Upload with simulated progress (real progress needs XHR — TODO for Full-stack Dev)
    setState("uploading")
    setProgress(10)

    try {
      // Simulate progress ticks while awaiting upload
      const progressInterval = setInterval(() => {
        setProgress((p) => Math.min(p + 15, 85))
      }, 300)

      await onUpload(file)

      clearInterval(progressInterval)
      setProgress(100)
      setState("success")
    } catch {
      setState("error")
      setErrorMsg(
        "Upload failed — probably a connection issue. Check your signal and try again."
      )
      setPreviewUrl(null)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
    // Reset input so same file can be re-selected if needed
    e.target.value = ""
  }

  const handleClear = () => {
    setState("idle")
    setProgress(0)
    setPreviewUrl(null)
    setErrorMsg("")
  }

  const isSuccess = state === "success"

  return (
    <div
      className={`rounded-xl border-2 ${
        isSuccess
          ? "border-[var(--status-success)] bg-emerald-50"
          : state === "error"
          ? "border-[var(--status-error)] bg-[var(--brand-red-xlight)]"
          : "border-dashed border-[var(--brand-gray-300)] bg-[var(--brand-gray-100)]"
      } p-4 transition-colors ${className}`}
      aria-label={`Upload slot: ${label}`}
    >
      {/* Hidden file inputs */}
      {/* Camera input — rear camera (design-system §8: capture="environment") */}
      <input
        ref={cameraInputRef}
        type="file"
        accept={accept}
        capture="environment"
        className="sr-only"
        aria-hidden="true"
        onChange={handleInputChange}
      />
      {/* Gallery input — no capture attribute so OS picker opens gallery */}
      <input
        ref={galleryInputRef}
        type="file"
        accept={accept}
        className="sr-only"
        aria-hidden="true"
        onChange={handleInputChange}
      />

      {/* Label row */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div>
          <p className="text-sm font-semibold text-[var(--brand-gray-700)]">{label}</p>
          {helperText && (
            <p className="text-xs text-[var(--brand-gray-500)] mt-0.5">{helperText}</p>
          )}
        </div>
        {isSuccess && (
          <CheckCircle
            className="w-5 h-5 text-[var(--status-success)] shrink-0"
            aria-label="Upload complete"
          />
        )}
      </div>

      {/* Preview thumbnail */}
      {previewUrl && (
        <div className="relative mb-3 rounded-lg overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={previewUrl}
            alt={`Preview of uploaded ${label}`}
            className="w-full h-32 object-cover"
          />
          {!isSuccess && (
            <button
              onClick={handleClear}
              className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80 transition-colors"
              aria-label="Remove uploaded image"
            >
              <X className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
          )}
        </div>
      )}

      {/* Progress bar */}
      {state === "uploading" && (
        <div className="mb-3">
          <Progress
            value={progress}
            className="h-1.5"
            aria-label={`Upload progress: ${progress}%`}
          />
          <p className="text-xs text-[var(--brand-gray-500)] mt-1">Uploading… {progress}%</p>
        </div>
      )}

      {/* Error message */}
      {errorMsg && (
        <div
          className="flex items-start gap-2 mb-3 text-xs text-[var(--brand-red)]"
          role="alert"
        >
          <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" aria-hidden="true" />
          {errorMsg}
        </div>
      )}

      {/* Upload buttons — idle or error state */}
      {(state === "idle" || state === "error") && (
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => cameraInputRef.current?.click()}
            className="flex-1 gap-1.5 border-[var(--brand-gray-300)] text-[var(--brand-gray-700)] hover:border-[var(--brand-red)] hover:text-[var(--brand-red)]"
            aria-label={`Take photo for ${label}`}
          >
            <Camera className="w-4 h-4" aria-hidden="true" />
            Take photo
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => galleryInputRef.current?.click()}
            className="flex-1 gap-1.5 border-[var(--brand-gray-300)] text-[var(--brand-gray-700)] hover:border-[var(--brand-red)] hover:text-[var(--brand-red)]"
            aria-label={`Upload ${label} from gallery`}
          >
            <Upload className="w-4 h-4" aria-hidden="true" />
            Upload
          </Button>
        </div>
      )}

      {/* Success state — allow replacement */}
      {isSuccess && (
        <button
          onClick={handleClear}
          className="text-xs text-[var(--brand-gray-500)] underline hover:text-[var(--brand-red)] transition-colors mt-1"
          aria-label={`Replace uploaded ${label}`}
        >
          Replace
        </button>
      )}
    </div>
  )
}

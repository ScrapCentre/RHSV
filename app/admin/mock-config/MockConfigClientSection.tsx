"use client"

/**
 * MockConfigClientSection — ScrapCentre.com
 * Client-side section embedded in the admin mock-config RSC page.
 * Handles GET on mount + POST on save against /api/admin/mock-config.
 * Per engineering-design §5: each external integration adapter checks this
 * config (with 10s TTL cache) to decide success / failure / random behaviour.
 *
 * Pattern follows app/admin/triage/TriageClientSection.tsx.
 */

import { useEffect, useState } from "react"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Check, RefreshCw } from "lucide-react"
import { apiFetch } from "@/lib/fetch"

type ServiceMode = "success" | "failure" | "random"

interface MockConfig {
  mode: ServiceMode
  services: Partial<Record<"vahan" | "otp" | "digilocker" | "vision" | "maps", ServiceMode>>
}

const SERVICE_KEYS = ["vahan", "otp", "digilocker", "vision", "maps"] as const

const SERVICE_LABEL: Record<string, string> = {
  vahan: "VAHAN",
  otp: "OTP (mobile verification)",
  digilocker: "DigiLocker (Aadhaar eKYC)",
  vision: "Vision AI (photo verification)",
  maps: "Google Maps (distance / pickup pricing)",
}

const SERVICE_DETAIL: Record<string, string> = {
  vahan: "Vehicle data lookup by registration number",
  otp: "Mobile-number verification SMS",
  digilocker: "Aadhaar eKYC document pull",
  vision: "AI verification of vehicle photos / RC / Aadhaar images",
  maps: "Pickup distance + cost calculation",
}

const MODE_LABEL: Record<ServiceMode, string> = {
  success: "Always succeed",
  failure: "Always fail",
  random: "Random",
}

const MODE_TONE: Record<ServiceMode, string> = {
  success: "bg-emerald-50 text-emerald-700 border-emerald-300",
  failure: "bg-rose-50 text-rose-700 border-rose-300",
  random: "bg-amber-50 text-amber-700 border-amber-300",
}

const MODE_DOT: Record<ServiceMode, string> = {
  success: "bg-emerald-500",
  failure: "bg-rose-500",
  random: "bg-amber-500",
}

export default function MockConfigClientSection() {
  const { toast } = useToast()
  const [config, setConfig] = useState<MockConfig | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [dirty, setDirty] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)

  // Initial load
  useEffect(() => {
    loadConfig()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function loadConfig() {
    setLoading(true)
    setLoadError(null)
    try {
      const res = await fetch("/api/admin/mock-config", { cache: "no-store" })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error ?? `API returned ${res.status}`)
      setConfig({
        mode: (data.mode as ServiceMode) ?? "success",
        services: data.services ?? {},
      })
      setDirty(false)
    } catch (err: any) {
      setLoadError(err?.message ?? "Failed to load mock config")
    } finally {
      setLoading(false)
    }
  }

  async function save() {
    if (!config) return
    setSaving(true)
    try {
      const res = await apiFetch("/api/admin/mock-config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: config.mode, services: config.services }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error ?? "Save failed")

      toast({
        title: "Mock config saved",
        description: "Changes take effect within ~10s (server cache TTL).",
      })
      setDirty(false)
    } catch (err: any) {
      // QA-fix (Wave 4): toast on error per the spec, not just inline state
      toast({
        title: "Failed to save mock config",
        description: err?.message ?? "Unknown error",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  function setGlobalMode(mode: ServiceMode) {
    if (!config) return
    setConfig({ ...config, mode })
    setDirty(true)
  }

  function setServiceMode(svc: string, mode: ServiceMode | "") {
    if (!config) return
    const services = { ...config.services }
    if (mode === "") delete (services as any)[svc]
    else (services as any)[svc] = mode
    setConfig({ ...config, services })
    setDirty(true)
  }

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-6 h-6 animate-spin text-[var(--brand-red)]" />
      </div>
    )
  }

  // Hard load error (no config available)
  if (loadError && !config) {
    return (
      <div className="bg-white card-base p-6 border border-rose-200">
        <p className="text-rose-700 mb-4">Failed to load mock config: {loadError}</p>
        <button
          onClick={loadConfig}
          className="flex items-center gap-2 text-sm text-[var(--brand-red)] hover:underline"
        >
          <RefreshCw className="w-4 h-4" />
          Try again
        </button>
      </div>
    )
  }

  if (!config) return null

  return (
    <div className="space-y-6">
      {/* Global default mode */}
      <section className="bg-white card-base p-6">
        <div className="flex items-baseline justify-between mb-3">
          <h2 className="font-bold text-[var(--brand-black)]">Global default mode</h2>
          <span className="text-xs text-[var(--brand-gray-500)]">
            Used when a service has no override
          </span>
        </div>

        <fieldset
          className="grid grid-cols-1 sm:grid-cols-3 gap-3"
          aria-label="Global mock mode"
        >
          {(["success", "failure", "random"] as ServiceMode[]).map((m) => {
            const checked = config.mode === m
            return (
              <label
                key={m}
                className={`relative flex items-center gap-3 px-4 py-3 rounded-xl border cursor-pointer transition ${
                  checked
                    ? `${MODE_TONE[m]} font-semibold`
                    : "bg-white text-[var(--brand-gray-500)] border-slate-200 hover:border-slate-300"
                }`}
              >
                <input
                  type="radio"
                  name="globalMode"
                  value={m}
                  checked={checked}
                  onChange={() => setGlobalMode(m)}
                  className="sr-only"
                />
                <span
                  className={`w-3 h-3 rounded-full ${
                    checked ? MODE_DOT[m] : "bg-slate-300"
                  }`}
                  aria-hidden="true"
                />
                {MODE_LABEL[m]}
                {checked && (
                  <Check className="w-4 h-4 ml-auto" aria-hidden="true" />
                )}
              </label>
            )
          })}
        </fieldset>
      </section>

      {/* Per-service overrides */}
      <section className="bg-white card-base p-6">
        <div className="flex items-baseline justify-between mb-4">
          <h2 className="font-bold text-[var(--brand-black)]">Per-service overrides</h2>
          <span className="text-xs text-[var(--brand-gray-500)]">
            "Use global" = inherit the default above
          </span>
        </div>

        <div className="divide-y divide-slate-100">
          {SERVICE_KEYS.map((svc) => {
            const current = config.services[svc] ?? ""
            const labelId = `mock-svc-${svc}`
            return (
              <div
                key={svc}
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 py-4"
              >
                <div className="min-w-0">
                  <label
                    htmlFor={labelId}
                    className="font-semibold text-[var(--brand-black)]"
                  >
                    {SERVICE_LABEL[svc]}
                  </label>
                  <div className="text-xs text-[var(--brand-gray-500)] mt-0.5">
                    {SERVICE_DETAIL[svc]} ·{" "}
                    <code className="font-mono text-[var(--brand-gray-500)]">{svc}</code>
                  </div>
                </div>

                <select
                  id={labelId}
                  value={current}
                  onChange={(e) =>
                    setServiceMode(svc, e.target.value as ServiceMode | "")
                  }
                  className={`shrink-0 px-3 py-2 rounded-lg border text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[var(--brand-red)]/40 ${
                    current === ""
                      ? "bg-white border-slate-200 text-[var(--brand-gray-500)]"
                      : MODE_TONE[current as ServiceMode]
                  }`}
                >
                  <option value="">Use global ({MODE_LABEL[config.mode]})</option>
                  <option value="success">Always succeed</option>
                  <option value="failure">Always fail</option>
                  <option value="random">Random</option>
                </select>
              </div>
            )
          })}
        </div>
      </section>

      {/* Save bar */}
      <div className="flex items-center justify-between gap-4 sticky bottom-4 bg-white card-base p-4 shadow-sm">
        <div className="text-sm text-[var(--brand-gray-500)]">
          {dirty ? (
            <span className="text-amber-700">Unsaved changes</span>
          ) : (
            <span>Up to date.</span>
          )}
        </div>
        <button
          onClick={save}
          disabled={saving || !dirty}
          className="px-5 py-2 rounded-lg font-semibold text-white shadow-sm transition disabled:opacity-50 disabled:cursor-not-allowed bg-[var(--brand-red)] hover:bg-[var(--brand-red-dark)]"
        >
          {saving ? (
            <span className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              Saving…
            </span>
          ) : (
            "Save"
          )}
        </button>
      </div>
    </div>
  )
}

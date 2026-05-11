"use client"

/**
 * /admin/mock-config — UI for the mock-service toggle
 *
 * Backend contract: GET /api/admin/mock-config returns { mode, services }
 * POST /api/admin/mock-config accepts { mode?, services? } with partial merge.
 *
 * Per engineering-design.md §5: each external integration (VAHAN, OTP, DigiLocker,
 * Vision-AI, Maps) is mocked behind an adapter. This page lets the admin flip
 * each mock between "success", "failure", and "random" — or fall back to the
 * global mode by setting the per-service value to "" (empty / use global).
 */

import { useEffect, useState } from "react"

type ServiceMode = "success" | "failure" | "random"
type GlobalMode = ServiceMode

interface MockConfig {
  mode: GlobalMode
  services: Partial<Record<"vahan" | "otp" | "digilocker" | "vision" | "maps", ServiceMode>>
}

const SERVICE_KEYS: Array<keyof MockConfig["services"]> = [
  "vahan",
  "otp",
  "digilocker",
  "vision",
  "maps",
]

const SERVICE_LABEL: Record<string, string> = {
  vahan: "VAHAN (vehicle data)",
  otp: "OTP (mobile verification)",
  digilocker: "DigiLocker (Aadhaar eKYC)",
  vision: "Vision AI (photo verification)",
  maps: "Google Maps (distance / pickup)",
}

const MODE_LABEL: Record<ServiceMode, string> = {
  success: "Always succeed",
  failure: "Always fail",
  random: "Random",
}

const MODE_TONE: Record<ServiceMode, string> = {
  success: "bg-emerald-50 text-emerald-700 border-emerald-200",
  failure: "bg-rose-50 text-rose-700 border-rose-200",
  random: "bg-amber-50 text-amber-700 border-amber-200",
}

export default function MockConfigPage() {
  const [config, setConfig] = useState<MockConfig | null>(null)
  const [saving, setSaving] = useState(false)
  const [savedAt, setSavedAt] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch("/api/admin/mock-config")
      .then((r) => r.json())
      .then((data) => {
        if (data?.error) {
          setError(data.error)
          return
        }
        setConfig({ mode: data.mode ?? "success", services: data.services ?? {} })
      })
      .catch((e) => setError(e?.message ?? "Failed to load"))
  }, [])

  async function save() {
    if (!config) return
    setSaving(true)
    setError(null)
    try {
      const res = await fetch("/api/admin/mock-config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: config.mode, services: config.services }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error ?? "Save failed")
      setSavedAt(new Date().toLocaleTimeString())
    } catch (e: any) {
      setError(e?.message ?? "Save failed")
    } finally {
      setSaving(false)
    }
  }

  function setGlobalMode(mode: GlobalMode) {
    if (!config) return
    setConfig({ ...config, mode })
  }

  function setServiceMode(svc: string, mode: ServiceMode | "") {
    if (!config) return
    const services = { ...config.services }
    if (mode === "") delete (services as any)[svc]
    else (services as any)[svc] = mode
    setConfig({ ...config, services })
  }

  if (error && !config) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-rose-800">
          {error}
        </div>
      </div>
    )
  }

  if (!config) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-slate-500">Loading…</div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-4 lg:p-8 space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Mock Service Config</h1>
        <p className="text-sm text-slate-500">
          Flip mock external services between success / failure / random for testing the dummy flow.
          Changes apply within ~10 seconds (config is cached server-side).
        </p>
      </header>

      {/* Global mode */}
      <section className="rounded-xl border border-slate-200 bg-white p-5 space-y-3">
        <div className="flex items-baseline justify-between">
          <h2 className="font-semibold text-slate-900">Global default mode</h2>
          <span className="text-xs text-slate-500">Used when a service has no override</span>
        </div>
        <div className="flex gap-2">
          {(["success", "failure", "random"] as ServiceMode[]).map((m) => (
            <button
              key={m}
              onClick={() => setGlobalMode(m)}
              className={`px-4 py-2 rounded-lg border text-sm font-medium transition ${
                config.mode === m
                  ? MODE_TONE[m]
                  : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
              }`}
            >
              {MODE_LABEL[m]}
            </button>
          ))}
        </div>
      </section>

      {/* Per-service overrides */}
      <section className="rounded-xl border border-slate-200 bg-white p-5 space-y-4">
        <div className="flex items-baseline justify-between">
          <h2 className="font-semibold text-slate-900">Per-service overrides</h2>
          <span className="text-xs text-slate-500">"Use global" = no override</span>
        </div>
        <div className="space-y-3">
          {SERVICE_KEYS.map((svc) => {
            const current = config.services[svc] ?? ""
            return (
              <div key={svc} className="flex items-center justify-between gap-4 py-2 border-t border-slate-100 first:border-t-0">
                <div className="min-w-0">
                  <div className="font-medium text-slate-900">{SERVICE_LABEL[svc as string]}</div>
                  <div className="text-xs text-slate-500">key: <code className="font-mono">{svc}</code></div>
                </div>
                <div className="flex gap-1.5 shrink-0">
                  <button
                    onClick={() => setServiceMode(svc as string, "")}
                    className={`px-2.5 py-1 rounded-md border text-xs font-medium transition ${
                      current === ""
                        ? "bg-slate-900 text-white border-slate-900"
                        : "bg-white text-slate-500 border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    Use global
                  </button>
                  {(["success", "failure", "random"] as ServiceMode[]).map((m) => (
                    <button
                      key={m}
                      onClick={() => setServiceMode(svc as string, m)}
                      className={`px-2.5 py-1 rounded-md border text-xs font-medium transition ${
                        current === m
                          ? MODE_TONE[m]
                          : "bg-white text-slate-500 border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      {MODE_LABEL[m]}
                    </button>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* Save bar */}
      <div className="flex items-center justify-between gap-4 sticky bottom-4 rounded-xl border border-slate-200 bg-white shadow-sm p-4">
        <div className="text-sm text-slate-500">
          {error && <span className="text-rose-600">{error}</span>}
          {!error && savedAt && <span className="text-emerald-600">Saved at {savedAt}</span>}
          {!error && !savedAt && <span>Pending changes apply within ~10s after save.</span>}
        </div>
        <button
          onClick={save}
          disabled={saving}
          className="px-5 py-2 rounded-lg font-semibold text-white shadow-sm transition disabled:opacity-50"
          style={{ backgroundColor: "var(--brand-red)" }}
        >
          {saving ? "Saving…" : "Save"}
        </button>
      </div>
    </div>
  )
}

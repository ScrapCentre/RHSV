// engineering-design.md §5 — getMockConfig() helper with 10-second TTL cache
import connectToDatabase from "@/lib/db"
import Setting from "@/models/Setting"

export type ServiceMode = "success" | "failure" | "random"

export interface MockConfig {
  mode: ServiceMode
  services: {
    vahan?: ServiceMode
    otp?: ServiceMode
    digilocker?: ServiceMode
    vision?: ServiceMode
    maps?: ServiceMode
  }
}

const DEFAULT_CONFIG: MockConfig = { mode: "success", services: {} }

// Module-level TTL cache — safe for next start (process-persistent), not for serverless
let cache: { value: MockConfig; ts: number } | null = null
const CACHE_TTL_MS = 10_000

export async function getMockConfig(): Promise<MockConfig> {
  if (cache && Date.now() - cache.ts < CACHE_TTL_MS) {
    return cache.value
  }

  try {
    await connectToDatabase()
    const doc = await Setting.findOne({ key: "mockConfig" }).lean()
    const value = (doc as any)?.value as MockConfig ?? DEFAULT_CONFIG
    cache = { value, ts: Date.now() }
    return value
  } catch {
    // Fail open: return default so mock adapters still work even if DB is unreachable
    return DEFAULT_CONFIG
  }
}

/** Simulate realistic delay based on mode */
export async function simulateDelay(mode: ServiceMode): Promise<void> {
  if (mode === "success") {
    await new Promise(r => setTimeout(r, 200))
  } else if (mode === "failure") {
    await new Promise(r => setTimeout(r, 50))
  } else {
    // random: 0-500ms
    await new Promise(r => setTimeout(r, Math.floor(Math.random() * 500)))
  }
}

/** Invalidate the config cache (called by POST /api/admin/mock-config) */
export function invalidateMockConfigCache(): void {
  cache = null
}

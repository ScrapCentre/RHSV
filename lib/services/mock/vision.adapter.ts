// engineering-design.md §4.2 / §5 / §7 — AI vision verification mock adapter
// 2-second realistic delay; quality derived from input completeness
import { getMockConfig, simulateDelay } from "./config"

export interface VerifyInput {
  photoUrls: string[]
  rcUrl: string | null
  aadhaarConsent: boolean
}

export interface VerificationResult {
  status: "verified" | "flagged" | "rejected"
  confidence: number  // 0-100
  flags: string[]
  qualityScore: "bronze" | "silver" | "gold"
}

function deriveQuality(input: VerifyInput): "bronze" | "silver" | "gold" {
  if (input.photoUrls.length >= 3 && input.rcUrl && input.aadhaarConsent) return "gold"
  if (input.photoUrls.length >= 1 && input.aadhaarConsent) return "silver"
  return "bronze"
}

export async function runVerificationPipeline(input: VerifyInput): Promise<VerificationResult> {
  const config = await getMockConfig()
  const mode = config.services.vision ?? config.mode

  // 2-second realistic delay per engineering-design.md §5
  await new Promise(r => setTimeout(r, 2000))
  // Additionally apply mode delay
  await simulateDelay(mode)

  if (mode === "failure") {
    return {
      status: "flagged",
      confidence: 23,
      flags: ["photo_tampered"],
      qualityScore: "bronze",
    }
  }

  if (mode === "random" && Math.random() < 0.2) {
    return {
      status: "flagged",
      confidence: 45,
      flags: ["vahan_mismatch"],
      qualityScore: "silver",
    }
  }

  return {
    status: "verified",
    confidence: 87,
    flags: [],
    qualityScore: deriveQuality(input),
  }
}

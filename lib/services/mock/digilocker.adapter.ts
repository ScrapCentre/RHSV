// engineering-design.md §4.2 / §5 — DigiLocker Aadhaar XML pull mock adapter
import { getMockConfig, simulateDelay } from "./config"
import { MockServiceError } from "./vahan.adapter"

export interface DigiLockerResult {
  name: string
  dob: string    // "DD-MM-YYYY"
  maskedUid: string
  address: string
  xmlAvailable: boolean
}

function generateAadhaarFixture(phone: string): DigiLockerResult {
  // Deterministic fixture keyed by last 4 digits of phone
  const suffix = phone.slice(-4)
  const names = ["Priya Sharma", "Ravi Kumar", "Anjali Singh", "Mohit Gupta", "Neha Verma"]
  const nameIdx = parseInt(suffix, 10) % names.length
  return {
    name:        names[nameIdx],
    dob:         `${(parseInt(suffix, 10) % 28) + 1}-${(parseInt(suffix[0], 10) % 12) + 1}-${1970 + parseInt(suffix.slice(-2), 10) % 40}`,
    maskedUid:   `XXXX XXXX ${suffix}`,
    address:     "123, Sector 5, Noida, Uttar Pradesh - 201301",
    xmlAvailable: true,
  }
}

export async function fetchAadhaarData(phone: string): Promise<DigiLockerResult> {
  const config = await getMockConfig()
  const mode = config.services.digilocker ?? config.mode

  await simulateDelay(mode)

  if (mode === "failure") {
    throw new MockServiceError("DIGILOCKER_UNAVAILABLE", "DigiLocker service unavailable")
  }
  if (mode === "random" && Math.random() < 0.2) {
    throw new MockServiceError("DIGILOCKER_UNAVAILABLE", "DigiLocker service unavailable")
  }

  return generateAadhaarFixture(phone)
}

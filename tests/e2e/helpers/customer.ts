// Customer-suite helpers — shared resolution of the seeded demo leads.
//
// The demo seeder (lib/services/demo/seed.ts) re-generates fresh ObjectIds
// for Lead A/B/C on every reseed, so specs MUST resolve them at runtime
// rather than hardcoding ids. We key off stable, seed-fixed signals:
//   - Lead A: registrationNumber "UP70AB1234" (Maruti Swift, marketplace)
//   - Lead B: registrationNumber "DL01CD5678" (Honda City, negotiating,
//             open ₹14,500 RVSF offer)  ← the negotiation-widget lead
//   - Lead C: registrationNumber "MH02EF9012" (Hyundai i20, rejected)
//
// All three belong to client.test@scrapcentre.online.

import { APIRequestContext, expect } from "@playwright/test"

export const LEAD_A_REG = "UP70AB1234"
export const LEAD_B_REG = "DL01CD5678"
export const LEAD_C_REG = "MH02EF9012"

export type DemoLead = {
  _id: string
  state: string
  vehicle?: { registrationNumber?: string; make?: string; model?: string }
}

/** Fetch the caller's leads via /api/leads/mine (must be signed in as client). */
export async function fetchMyLeads(
  request: APIRequestContext,
  base: string
): Promise<DemoLead[]> {
  const res = await request.get(`${base}/api/leads/mine`)
  expect(res.ok(), `/api/leads/mine failed: ${res.status()} ${await res.text()}`).toBeTruthy()
  const { leads } = await res.json()
  expect(Array.isArray(leads), "leads is not an array").toBeTruthy()
  return leads as DemoLead[]
}

/** Resolve one demo lead by registration number. Test-fails if absent. */
export async function resolveLeadByReg(
  request: APIRequestContext,
  base: string,
  reg: string
): Promise<DemoLead> {
  const leads = await fetchMyLeads(request, base)
  const lead = leads.find((l) => l.vehicle?.registrationNumber === reg)
  expect(
    lead,
    `demo lead ${reg} not found — run scripts/seed-demo-leads.ts. Saw: ${leads
      .map((l) => l.vehicle?.registrationNumber)
      .join(", ")}`
  ).toBeTruthy()
  return lead!
}

/**
 * CSRF token for direct (non-browser) API mutations. Browser-driven tests
 * get the token auto-injected by lib/install-csrf-fetch.ts; this is only
 * needed when a spec calls request.post(...) itself.
 */
export async function getCsrfToken(
  request: APIRequestContext,
  base: string
): Promise<string> {
  const res = await request.get(`${base}/api/auth/csrf`)
  expect(res.ok(), "GET /api/auth/csrf failed").toBeTruthy()
  const { csrfToken } = await res.json()
  expect(csrfToken, "csrfToken missing").toBeTruthy()
  return csrfToken
}

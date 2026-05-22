// TEMPORARY exploratory probe — deleted before commit.
import { test, expect } from "@playwright/test"
import { signInAsClient, requireBaseURL } from "./helpers/auth"
import { resolveLeadByReg, LEAD_B_REG } from "./helpers/customer"

test("probe customer surface", async ({ context, page, baseURL }) => {
  const base = requireBaseURL(baseURL)
  await signInAsClient(context, base)

  // /me
  await page.goto(`${base}/me`)
  await page.waitForLoadState("networkidle")
  console.log("=== /me body ===")
  console.log((await page.locator("body").innerText()).slice(0, 600))

  // Lead B detail
  const leadB = await resolveLeadByReg(context.request, base, LEAD_B_REG)
  console.log("Lead B id:", leadB._id, "state:", leadB.state)
  await page.goto(`${base}/me/lead/${leadB._id}`)
  await page.waitForLoadState("networkidle")
  console.log("=== /me/lead/B body ===")
  console.log((await page.locator("body").innerText()).slice(0, 1500))

  // chat inbox
  await page.goto(`${base}/me/chat`)
  await page.waitForLoadState("networkidle")
  console.log("=== /me/chat body ===")
  console.log((await page.locator("body").innerText()).slice(0, 500))

  // chat thread
  await page.goto(`${base}/me/chat/${leadB._id}`)
  await page.waitForLoadState("networkidle")
  console.log("=== /me/chat/B body ===")
  console.log((await page.locator("body").innerText()).slice(0, 800))
})

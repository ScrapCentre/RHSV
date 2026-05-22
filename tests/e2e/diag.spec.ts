import { test } from "@playwright/test"
import { signInAsCcOperator, requireBaseURL } from "./helpers/auth"

test("DIAG cc dashboard", async ({ context, page, baseURL }) => {
  const base = requireBaseURL(baseURL)
  await signInAsCcOperator(context, base)
  const resp = await page.goto(`${base}/cc/dashboard`)
  console.log("STATUS:", resp?.status(), "URL:", page.url())
  await page.waitForTimeout(2500)
  const body = await page.locator("body").innerText()
  console.log("=== BODY TEXT START ===")
  console.log(body)
  console.log("=== BODY TEXT END ===")
})

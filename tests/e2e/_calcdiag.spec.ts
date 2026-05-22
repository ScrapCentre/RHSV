// TEMP — diagnose calculator tier-1 UI retries.
import { test } from "@playwright/test"
import { requireBaseURL } from "./helpers/auth"

test("diag calc tier1 retries", async ({ page, baseURL }) => {
  const base = requireBaseURL(baseURL)

  let n = 0
  page.on("response", async (r) => {
    if (r.url().includes("/api/calc/tier1")) {
      n++
      let body = ""
      try {
        body = (await r.text()).slice(0, 200)
      } catch {}
      console.log(`>>> tier1 #${n}: ${r.status()} ${body}`)
    }
  })
  page.on("requestfailed", (r) => {
    if (r.url().includes("tier1")) console.log(`>>> tier1 REQ FAILED: ${r.failure()?.errorText}`)
  })

  await page.goto(`${base}/calculator`)
  await page.getByPlaceholder("UP32 AB 1234").fill("UP32XY7788")

  for (let i = 1; i <= 6; i++) {
    await page.getByRole("button", { name: /get value/i }).click()
    const shown = await page
      .getByRole("button", { name: /verify your mobile number to unlock/i })
      .waitFor({ state: "visible", timeout: 8000 })
      .then(() => true)
      .catch(() => false)
    console.log(`>>> attempt ${i}: bandShown=${shown}`)
    if (shown) break
  }
})

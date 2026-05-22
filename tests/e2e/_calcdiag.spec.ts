// TEMP — diagnose calculator tier-1 UI lookup.
import { test, expect } from "@playwright/test"
import { requireBaseURL } from "./helpers/auth"

test("diag calc tier1 UI", async ({ page, baseURL }) => {
  const base = requireBaseURL(baseURL)

  page.on("response", async (r) => {
    if (r.url().includes("/api/calc/tier1")) {
      console.log(`>>> tier1 ${r.status()} ${r.url()}`)
      try {
        console.log(`>>> tier1 body: ${(await r.text()).slice(0, 400)}`)
      } catch {}
    }
  })
  page.on("console", (m) => {
    if (m.type() === "error") console.log(`>>> console.error: ${m.text()}`)
  })
  page.on("pageerror", (e) => console.log(`>>> pageerror: ${e.message}`))

  await page.goto(`${base}/calculator`)
  await page.getByPlaceholder("UP32 AB 1234").fill("UP32XY7788")
  await page.getByRole("button", { name: /get value/i }).click()
  await page.waitForTimeout(8000)

  console.log(">>> page main after click:")
  console.log((await page.locator("main").innerText()).slice(0, 600))

  // Dump all button accessible names
  const btns = await page.getByRole("button").all()
  console.log(">>> buttons on page:")
  for (const b of btns) {
    const name = await b.textContent()
    const aria = await b.getAttribute("aria-label")
    console.log(`    text="${(name ?? "").trim()}" aria="${aria ?? ""}"`)
  }
})

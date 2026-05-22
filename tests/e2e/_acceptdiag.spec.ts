// TEMP — diagnose accept "Offer is no longer open" via the BROWSER widget.
import { test, expect } from "@playwright/test"
import { signInAsClient, requireBaseURL } from "./helpers/auth"

test("diag accept via browser widget", async ({ context, page, baseURL }) => {
  const base = requireBaseURL(baseURL)
  await signInAsClient(context, base)

  const minRes = await context.request.get(`${base}/api/leads/mine`)
  const { leads } = await minRes.json()
  const allB = (leads as any[]).filter(
    (l) => l?.vehicle?.registrationNumber === "DL01CD5678"
  )
  console.log(`>>> ${allB.length} leads match DL01CD5678`)
  for (const b of allB) {
    console.log(`    id=${b._id} state=${b.state} agreedPrice=${JSON.stringify(b.agreedPrice)} createdAt=${b.createdAt}`)
  }
  const leadB = allB[0]

  // What offer does the lead page see? Check via messages API.
  const msgRes = await context.request.get(
    `${base}/api/chat/threads/${leadB._id}/messages`
  )
  const { messages } = await msgRes.json()
  const offers = (messages as any[]).filter((m) => m.type === "offer")
  console.log(`>>> ${offers.length} offers in thread; open:`)
  for (const o of offers) {
    console.log(`    _id=${o._id} status=${o.offer?.status} amount=${o.offer?.amountPaise}`)
  }

  // Capture the accept network call.
  page.on("response", async (resp) => {
    if (resp.url().includes("/accept")) {
      console.log(`>>> ACCEPT RESPONSE: ${resp.status()} ${resp.url()}`)
      try {
        console.log(`>>> ACCEPT BODY: ${await resp.text()}`)
      } catch {}
    }
  })

  await page.goto(`${base}/me/lead/${leadB._id}`)
  await expect(page.getByText("Offer from RVSF")).toBeVisible({ timeout: 15_000 })

  page.once("dialog", (d) => d.accept())
  await page.getByRole("button", { name: /Accept ₹/ }).click()

  // Give the request + refresh a moment.
  await page.waitForTimeout(6000)
  console.log(">>> Final page text snippet:")
  const txt = await page.locator("main").innerText()
  console.log(txt.slice(0, 500))
})

// TEMP — diagnose accept "Offer is no longer open".
import { test, expect } from "@playwright/test"
import { signInAsClient, requireBaseURL } from "./helpers/auth"
import { getCsrfToken } from "./helpers/customer"

test("diag accept flow", async ({ context, baseURL }) => {
  const base = requireBaseURL(baseURL)
  await signInAsClient(context, base)

  const minRes = await context.request.get(`${base}/api/leads/mine`)
  const { leads } = await minRes.json()
  const leadB = (leads as any[]).find(
    (l) => l?.vehicle?.registrationNumber === "DL01CD5678"
  )
  console.log("Lead B:", leadB._id, "state:", leadB.state, "agreedPrice:", JSON.stringify(leadB.agreedPrice))

  // Get messages, find ALL offers
  const msgRes = await context.request.get(
    `${base}/api/chat/threads/${leadB._id}/messages`
  )
  const { messages } = await msgRes.json()
  const offers = (messages as any[]).filter((m) => m.type === "offer")
  console.log(`Found ${offers.length} offer messages:`)
  for (const o of offers) {
    console.log(`  _id=${o._id} status=${o.offer?.status} actor=${o.offer?.actor} amount=${o.offer?.amountPaise} senderUserId=${o.senderUserId} senderRole=${o.senderRole}`)
  }

  const openOffers = offers.filter((o) => o.offer?.status === "open")
  console.log(`Open offers: ${openOffers.length}`)
  if (openOffers.length !== 1) {
    console.log("!!! NOT exactly 1 open offer")
    return
  }

  // Try to accept it directly via API
  const offerId = openOffers[0]._id
  const csrf = await getCsrfToken(context.request, base)
  const acc = await context.request.post(
    `${base}/api/chat/offers/${offerId}/accept`,
    { headers: { "Content-Type": "application/json", "X-CSRF-Token": csrf }, data: {} }
  )
  console.log(`accept POST status=${acc.status()} body=${await acc.text()}`)
})

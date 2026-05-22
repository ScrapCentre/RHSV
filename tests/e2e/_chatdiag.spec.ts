// TEMP — diagnose /me/chat "No thread for this lead".
import { test, expect } from "@playwright/test"
import { signInAsClient, requireBaseURL } from "./helpers/auth"

test("diag chat thread api", async ({ context, baseURL }) => {
  const base = requireBaseURL(baseURL)
  await signInAsClient(context, base)

  const minRes = await context.request.get(`${base}/api/leads/mine`)
  const { leads } = await minRes.json()
  const leadB = (leads as any[]).find(
    (l) => l?.vehicle?.registrationNumber === "DL01CD5678"
  )
  console.log("Lead B id:", leadB?._id, "state:", leadB?.state)
  console.log("Lead B agreedPrice:", JSON.stringify(leadB?.agreedPrice))

  // my-threads
  const mt = await context.request.get(`${base}/api/chat/my-threads`)
  console.log("my-threads status:", mt.status())
  console.log("my-threads body:", await mt.text())

  // threads/[leadId]
  const tr = await context.request.get(
    `${base}/api/chat/threads/${leadB._id}`
  )
  console.log("threads/[leadId] status:", tr.status())
  console.log("threads/[leadId] body:", await tr.text())

  // messages
  const msg = await context.request.get(
    `${base}/api/chat/threads/${leadB._id}/messages`
  )
  console.log("messages status:", msg.status())
  console.log("messages body:", (await msg.text()).slice(0, 800))
})

// TEMP — diagnose reseed → Lead B thread active status.
import { test, expect } from "@playwright/test"
import { execSync } from "node:child_process"
import { signInAsClient, requireBaseURL } from "./helpers/auth"

test("diag reseed then leadB thread status", async ({ context, baseURL }) => {
  const base = requireBaseURL(baseURL)

  console.log(">>> running reseed...")
  const out = execSync(
    `cd /opt/scrapcentre && sudo -u scrap bash -lc "set -a && source .env.local && set +a && ALLOW_PROD_SEED=1 npx tsx scripts/seed-demo-leads.ts"`,
    { encoding: "utf8", timeout: 120_000 }
  )
  console.log(">>> reseed stdout tail:", out.slice(-300))

  await signInAsClient(context, base)

  // ALL Lead B's
  const min = await context.request.get(`${base}/api/leads/mine`)
  const { leads } = await min.json()
  const allB = (leads as any[]).filter(
    (l) => l?.vehicle?.registrationNumber === "DL01CD5678"
  )
  console.log(`>>> ${allB.length} leads match DL01CD5678`)
  for (const b of allB) {
    console.log(`    id=${b._id} state=${b.state} agreedPrice=${JSON.stringify(b.agreedPrice)}`)
  }

  for (const b of allB) {
    const tr = await context.request.get(`${base}/api/chat/threads/${b._id}`)
    const trBody = await tr.text()
    console.log(`>>> threads/${b._id}: ${tr.status()} ${trBody.slice(0, 300)}`)
  }
})

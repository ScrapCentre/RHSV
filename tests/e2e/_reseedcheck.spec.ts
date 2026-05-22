// TEMP — verify /api/admin/reseed-demo works on the live server.
import { test, expect } from "@playwright/test"
import { signInAsAdmin, requireBaseURL } from "./helpers/auth"
import { getCsrfToken } from "./helpers/customer"

test("can reseed via API", async ({ context, baseURL }) => {
  const base = requireBaseURL(baseURL)
  await signInAsAdmin(context, base)
  const csrf = await getCsrfToken(context.request, base)
  const res = await context.request.post(`${base}/api/admin/reseed-demo`, {
    headers: { "Content-Type": "application/json", "X-CSRF-Token": csrf },
    data: {
      confirm:
        "I understand this destroys leads matching /^Demo Customer / pattern",
    },
  })
  console.log("reseed status:", res.status())
  console.log("reseed body:", await res.text())
})

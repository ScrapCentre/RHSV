/**
 * DigiELV concierge — PURE DATA BUILDER. No network calls.
 *
 * Builds the per-lead step-by-step instructions for the customer + RVSF
 * to perform the gov-portal flow themselves (since there is NO API per
 * digielv-vscrap-research.md). Surfaces in:
 *   - Customer side panel in chat: /me/lead/[id]/chat
 *   - RVSF checklist in chat:      /rvsf/leads/[id]/chat
 *
 * Strings are pulled verbatim from digielv-vscrap-research.md §7.
 * Lock 2026-05-20 (L38): manual only, no API, copy-paste workflow.
 */

export type ChecklistStep = {
  num: number
  audience: "customer" | "rvsf"
  title: string
  body: string
  outboundUrl?: string
  inputPrompt?: string         // when a paste-back input is rendered
  status: "pending" | "done"
  warningBanner?: string       // for the DSC USB step
}

export type LeadDataForChecklist = {
  vehicleReg: string
  rvsfName: string
  customerName: string
  digiElvAppId?: string | null
  digiElvCdNumber?: string | null
  codUploaded?: boolean
  cvsUploaded?: boolean
  agreedAmountInr?: number | null
}

const VSCRAP_URL = "https://vscrap.parivahan.gov.in/vehiclescrap/"
const DIGIELV_URL = "https://digielv.com"

export function buildCustomerSteps(lead: LeadDataForChecklist): ChecklistStep[] {
  return [
    {
      num: 1,
      audience: "customer",
      title: "Submit your scrapping application on vscrap.parivahan.gov.in",
      body: `Visit ${VSCRAP_URL} and click Login → Vehicle Owner. Enter your vehicle number and Aadhaar number (your Aadhaar mobile must be active to receive the OTP). After login, click Services → Scrap Your Vehicle, enter the last 5 digits of your chassis or engine number, and follow the form.`,
      outboundUrl: VSCRAP_URL,
      inputPrompt: "Paste your vscrap Application ID once you receive it",
      status: lead.digiElvAppId ? "done" : "pending",
    },
    {
      num: 2,
      audience: "customer",
      title: "Wait for the RVSF to accept",
      body: `${lead.rvsfName} will review your application and submit a scrap bid. You'll see an in-app and email notification when this happens.`,
      status: "pending",
    },
    {
      num: 3,
      audience: "customer",
      title: "Receive scrap payment in your bank",
      body: "The RVSF will transfer your scrap value directly to your bank account using the bank details you entered on vscrap.",
      status: "pending",
    },
    {
      num: 4,
      audience: "customer",
      title: "Get your CD number by email from vscrap",
      body: "Once the RVSF generates your Certificate of Deposit (COD), vscrap will email you your CD number. The signed COD PDF will also appear in this chat as soon as the RVSF uploads it.",
      inputPrompt: "Paste your CD number here once received",
      status: lead.digiElvCdNumber ? "done" : "pending",
    },
    {
      num: 5,
      audience: "customer",
      title: "Register on digielv.com to sell your CD",
      body: `Your CD has monetary value beyond the scrap payment. To sell it: go to ${DIGIELV_URL} → Login/Register → Not a user? Register here → CD Owner Registration. You'll need your CD number. After registering, check your email for a KYC link — you'll need your Aadhaar number and DigiLocker PIN to complete it.`,
      outboundUrl: DIGIELV_URL,
      status: "pending",
    },
    {
      num: 6,
      audience: "customer",
      title: "List your CD and accept the best bid",
      body: `After KYC, go to ${DIGIELV_URL} → List of CDs → Sell this CD. Set a price or click Instant Sell. When a buyer accepts, the money lands in your DigiELV account; withdraw via Fund Management.`,
      outboundUrl: DIGIELV_URL,
      status: "pending",
    },
  ]
}

export function buildRvsfSteps(lead: LeadDataForChecklist): ChecklistStep[] {
  const amountLine = lead.agreedAmountInr ? `₹${lead.agreedAmountInr}` : "[the agreed amount]"
  return [
    {
      num: 1,
      audience: "rvsf",
      title: "Review the incoming application on vscrap",
      body: `Log in at ${VSCRAP_URL} as RVSF Operator. Go to Services → Scrapping Bidding Requests → Pending. Find the application for ${lead.vehicleReg} and click View. Enter your scrap bid (with and without pickup charges) and click Submit.`,
      outboundUrl: VSCRAP_URL,
      status: lead.digiElvAppId ? "done" : "pending",
    },
    {
      num: 2,
      audience: "rvsf",
      title: "Accept the application on vscrap",
      body: `Go to Application Verification → Pending → Get Details. Select ${lead.vehicleReg} → View → Accept. The Application ID will be confirmed on screen.`,
      status: "pending",
    },
    {
      num: 3,
      audience: "rvsf",
      title: "Transfer the scrap value to the customer's bank",
      body: "Transfer the agreed scrap amount to the vehicle owner's bank account. Note the payment voucher number and date — you'll need both for the next step.",
      status: "pending",
    },
    {
      num: 4,
      audience: "rvsf",
      title: "Generate the COD on vscrap",
      body: `On vscrap: Certificates → Certificate of Deposit. Select the Application Number for ${lead.vehicleReg}.\n\nCopy-paste block:\n  • Application Number: ${lead.digiElvAppId ?? "[paste once Step 1 done]"}\n  • Registration Number: ${lead.vehicleReg}\n  • Amount: ${amountLine}\n\nClick Generate COD. vscrap will email the vehicle owner automatically.`,
      status: lead.digiElvCdNumber ? "done" : "pending",
    },
    {
      num: 5,
      audience: "rvsf",
      title: "Sign the COD with your DSC USB",
      body: "The COD is not legally valid until digitally signed. Go to Digitally Sign Documents → Type: Digital Sign Document → Document Type: Certificate of Deposit. Connect your DSC USB dongle, run the DSC service (service.bat), select your certificate, enter your DSC password.",
      warningBanner: "⚠ Connect your DSC USB dongle BEFORE pressing 'Upload signed COD' on the next step. The COD is not legally valid until DSC-signed.",
      status: lead.codUploaded ? "done" : "pending",
    },
    {
      num: 6,
      audience: "rvsf",
      title: "Upload the signed COD to this chat",
      body: "Use the attachment button in this chat to upload the DSC-signed COD PDF. Tick the 'I have signed this with my DSC USB' checkbox — this is your legal attestation that the document is valid.",
      status: lead.codUploaded ? "done" : "pending",
    },
    {
      num: 7,
      audience: "rvsf",
      title: "Dismantle the vehicle and generate the CVS",
      body: `Once the vehicle has been physically dismantled: Certificates → Certificate of Vehicle Scrapping. Select ${lead.vehicleReg}. Upload a chassis cutout photo and an engine cutout photo. Click Generate CVS. Then digitally sign it using the same DSC process.`,
      status: lead.cvsUploaded ? "done" : "pending",
    },
    {
      num: 8,
      audience: "rvsf",
      title: "Upload the signed CVS to this chat",
      body: "Use the attachment button in this chat to upload the DSC-signed CVS PDF. This closes out the scrap job; the customer gets their de-registration proof.",
      status: lead.cvsUploaded ? "done" : "pending",
    },
  ]
}

export function buildChecklist(lead: LeadDataForChecklist) {
  return {
    customer: buildCustomerSteps(lead),
    rvsf: buildRvsfSteps(lead),
  }
}

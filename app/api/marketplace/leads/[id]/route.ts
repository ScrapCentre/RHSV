// M11 — single lead detail (pre-unlock view).
// Photos return blurredUrl only; full data on unlock.
import { NextResponse } from "next/server"
import { withAuth } from "@/lib/middleware/requireRole"
import { validateObjectId } from "@/lib/middleware/objectId"
import connectToDatabase from "@/lib/db"
import Lead from "@/models/Lead"
import { unlockAmountPaise, formatRupees } from "@/lib/services/pricing/unlock"
import ConfigSetting from "@/models/ConfigSetting"

export const GET = withAuth(["rvsf_admin", "rvsf_executive"], async (_req, _ctx) => {
  await connectToDatabase()
  // Note: dynamic [id] param — Next.js passes it via the second arg to the handler;
  // when using `withAuth` wrapper, we rebuild from the URL.
  return _handler(_req)
})

async function _handler(req: Request) {
  await connectToDatabase()
  const url = new URL(req.url)
  const id = url.pathname.split("/").pop()
  // Precheck ObjectId shape before hitting Mongo — otherwise mongoose
  // CastError surfaces as a 500 (E2E walker §1.4).
  const badId = validateObjectId(id, "id")
  if (badId) return badId

  const lead = await Lead.findById(id).lean() as any
  if (!lead) return NextResponse.json({ error: "Lead not found" }, { status: 404 })

  const priceSetting = await ConfigSetting.findOne({ key: "pricing.scrapPricePerKg" }).lean() as any
  const pricePerKg = priceSetting?.value ?? 0.75

  const chargeBasisWeightKg = lead.vehicle?.chargeBasisWeightKg
    ?? lead.vehicle?.vahanWeightKg
    ?? 900

  const amountPaise = unlockAmountPaise({ chargeBasisWeightKg, pricePerKg })

  return NextResponse.json({
    lead: {
      _id: lead._id.toString(),
      vehicle: {
        class: lead.vehicle?.class,
        registrationNumber: lead.vehicle?.registrationNumber,
        make: lead.vehicle?.make,
        model: lead.vehicle?.model,
        year: lead.vehicle?.year,
        fuelType: lead.vehicle?.fuelType,
        chargeBasisWeightKg,
        // Pre-unlock: only blurred thumbnails
        photos: (lead.vehicle?.photos ?? []).map((p: any) => ({
          blurredUrl: p.blurredUrl ?? p.url,  // until blur-pipeline is wired in M12
          type: p.type,
        })),
      },
      pickupCity: lead.pickupAddress?.city,
      pickupState: lead.pickupAddress?.state,
      quality: lead.quality,
      calc: {
        scrapValueLow: lead.calc?.scrapValueLow,
        scrapValueHigh: lead.calc?.scrapValueHigh,
      },
      state: lead.state,
      marketplaceVisibleAt: lead.marketplaceVisibleAt,
    },
    unlockPreview: {
      amountPaise,
      amountDisplay: formatRupees(amountPaise),
      basisWeightKg: chargeBasisWeightKg,
      pricePerKg,
    },
  })
}

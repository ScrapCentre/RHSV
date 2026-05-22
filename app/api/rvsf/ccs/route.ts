// M10 — RVSF self-serve CC management endpoints.
// Locked decision 2026-05-20 (L19, L25):
//   - RVSF admin creates CCs (self-service)
//   - CC credentials are auto-generated, shown ONCE to RVSF admin,
//     force-change on first login
import { NextResponse } from "next/server"
import { randomBytes } from "crypto"
import bcrypt from "bcryptjs"
import connectToDatabase from "@/lib/db"
import { withAuth } from "@/lib/middleware/requireRole"
import RVSF from "@/models/RVSF"
import CollectionCenter from "@/models/CollectionCenter"
import User from "@/models/User"

// GET /api/rvsf/ccs — list this RVSF's CCs
export const GET = withAuth(["rvsf_admin", "rvsf_executive"], async (_req, { user }) => {
  await connectToDatabase()
  const ccs = await CollectionCenter.find({ rvsfId: user.linkedRvsfId }).sort({ createdAt: 1 }).lean()
  return NextResponse.json({ ccs })
})

// POST /api/rvsf/ccs — RVSF admin creates a new CC; returns auto-generated CC operator credentials (shown once)
export const POST = withAuth(["rvsf_admin"], async (req, { user }) => {
  try {
    const body = await req.json()
    const { city, state, address, catchment, contact } = body || {}

    if (!city || !state || !address?.line1 || !address?.pincode) {
      return NextResponse.json({ error: "city, state, and full address required" }, { status: 400 })
    }
    if (!catchment?.center?.lng || !catchment?.center?.lat || !catchment?.radiusKm) {
      return NextResponse.json({ error: "catchment center (lng, lat) + radiusKm required" }, { status: 400 })
    }
    if (!contact?.name || !contact?.phone || !contact?.email) {
      return NextResponse.json({ error: "contact name + phone + email required" }, { status: 400 })
    }

    await connectToDatabase()
    const rvsf = await RVSF.findById(user.linkedRvsfId).lean() as any
    if (!rvsf) return NextResponse.json({ error: "RVSF not found" }, { status: 404 })

    // Per L19 / index unique on {rvsfId, city}: enforce one CC per city per RVSF
    const dup = await CollectionCenter.findOne({ rvsfId: rvsf._id, city }).lean()
    if (dup) {
      return NextResponse.json({ error: `Your RVSF already has a CC in ${city}` }, { status: 409 })
    }

    const displayName = `${rvsf.displayName} – ${city}`

    const cc = await CollectionCenter.create({
      rvsfId: rvsf._id,
      city,
      state,
      displayName,
      address,
      catchment: {
        center: { type: "Point", coordinates: [catchment.center.lng, catchment.center.lat] },
        radiusKm: catchment.radiusKm,
      },
      isPrimaryYard: false,
      publicVisible: true,
      status: "active",
      contact,
    })

    // Generate a strong one-time CC operator password (shown to RVSF admin
    // ONCE in this response; not stored anywhere else per L25)
    const plainPassword = randomBytes(9).toString("base64").replace(/[+/=]/g, "").slice(0, 12) + "!"
    const hashed = await bcrypt.hash(plainPassword, 10)

    const ccUser = await User.create({
      name: contact.name,
      email: contact.email.toLowerCase(),
      password: hashed,
      role: "cc_operator",
      provider: "credentials",
      linkedRvsfId: rvsf._id,
      linkedCcId: cc._id,
      mustChangePassword: true,  // forced first-login flow
    })

    return NextResponse.json({
      ok: true,
      cc: {
        id: cc._id.toString(),
        displayName: cc.displayName,
        city: cc.city,
        state: cc.state,
        catchmentKm: catchment.radiusKm,
      },
      operatorCredentials: {
        loginEmail: ccUser.email,
        loginPassword: plainPassword,  // SHOWN ONCE — RVSF admin must copy this now
        note: "Share these credentials with the CC operator out-of-band. " +
              "They will be forced to change the password on first login. " +
              "ScrapCentre does not store this plaintext anywhere.",
      },
    }, { status: 201 })
  } catch (err: any) {
    if (err?.code === 11000 && /email/.test(err.message)) {
      return NextResponse.json({ error: "A user with this email already exists" }, { status: 409 })
    }
    console.error("[rvsf/ccs POST] error:", err?.message)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
})

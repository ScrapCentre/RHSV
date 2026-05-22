// POST /api/cc/change-password — CC operator first-login forced password change.
//
// Accepts { currentPassword, newPassword } from the /cc/first-login form. On
// success the User.password is replaced with the new bcrypt hash and
// mustChangePassword flips to `false`. The next JWT issued (next sign-in OR
// next session refresh via NextAuth's `update()`) will reflect the new state.
//
// Why behind both the role check AND a current-password verification?
//   - Role check defends against non-CC accounts hitting this endpoint.
//   - Current-password verification defends against a session-hijack scenario:
//     a stolen JWT can't be used to lock the legitimate operator out of their
//     account, because the attacker doesn't know the temporary password.

import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import mongoose from "mongoose"
import connectToDatabase from "@/lib/db"
import { requireRole, AuthError } from "@/lib/middleware/requireRole"
import { requireCsrf } from "@/lib/middleware/csrf"
import User from "@/models/User"
import type { NextRequest } from "next/server"

export const dynamic = "force-dynamic"

export async function POST(req: NextRequest) {
  const csrfFail = requireCsrf(req)
  if (csrfFail) return csrfFail
  try {
    const { user } = await requireRole(req, "cc_operator")
    const body = await req.json().catch(() => ({}))
    const currentPassword = String(body?.currentPassword ?? "")
    const newPassword     = String(body?.newPassword ?? "")

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: "Both currentPassword and newPassword are required." },
        { status: 400 }
      )
    }
    if (newPassword.length < 10) {
      return NextResponse.json(
        { error: "New password must be at least 10 characters." },
        { status: 400 }
      )
    }
    if (newPassword === currentPassword) {
      return NextResponse.json(
        { error: "New password must differ from the current one." },
        { status: 400 }
      )
    }
    if (!user.id || !mongoose.isValidObjectId(user.id)) {
      return NextResponse.json({ error: "Session has no valid user id." }, { status: 400 })
    }

    await connectToDatabase()

    const dbUser = await User.findById(user.id).select("+password") as any
    if (!dbUser) {
      return NextResponse.json({ error: "User not found." }, { status: 404 })
    }
    if (!dbUser.password) {
      // Phone-OTP / Google-only accounts can't change a password they don't have.
      return NextResponse.json(
        { error: "Your account does not have a password to change." },
        { status: 409 }
      )
    }

    const valid = await bcrypt.compare(currentPassword, dbUser.password)
    if (!valid) {
      return NextResponse.json({ error: "Current password is incorrect." }, { status: 401 })
    }

    dbUser.password = await bcrypt.hash(newPassword, 10)
    dbUser.mustChangePassword = false
    await dbUser.save()

    return NextResponse.json({ ok: true })
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status })
    }
    console.error("[cc/change-password] error:", (err as any)?.message)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

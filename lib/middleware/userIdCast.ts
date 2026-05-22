/**
 * userIdCast — helpers for safely projecting a session user.id onto Mongo fields.
 *
 * Background (P2 hotfix 2026-05-22, dual-reviewer confirmed):
 * The env-fallback admin in lib/auth.ts (the operational break-glass that fires
 * when ADMIN_EMAIL + ADMIN_PASSWORD are set) returns a NextAuth user object
 * with `id: "env-admin"` — a literal string, not a 24-char Mongo ObjectId.
 *
 * Several admin write paths feed that id directly into a Mongoose
 * `Schema.Types.ObjectId` field — e.g. ConfigSetting.lastUpdatedByUserId or
 * AuditLog.actorUserId. Mongoose tries to cast `"env-admin"` to an ObjectId,
 * throws CastError, and the route handler returns 500. Net: the break-glass
 * admin can log in but cannot use any privileged feature that audits — i.e.
 * the break-glass is effectively useless precisely when it is needed.
 *
 * The two helpers below let call sites do the safe thing in one line:
 *
 *   await AuditLog.create({
 *     actorUserId: toUserObjectId(user.id),   // ObjectId | null
 *     actorLabel:  toActorLabel(user),        // "env-admin" | user.email | user.id
 *     ...
 *   })
 *
 * The corresponding schema fields (ConfigSetting.lastUpdatedByUserId,
 * AuditLog.actorUserId) have been relaxed to allow `null`; a sibling label
 * field preserves the audit trail for env-admin actions.
 */
import mongoose from "mongoose"

/**
 * Returns a valid Mongoose ObjectId for normal users, or `null` for the
 * env-admin (or any other non-ObjectId-shaped id). The null is safe to
 * write to a `Schema.Types.ObjectId` field as long as the field is not
 * marked `required: true`.
 *
 * We tighten beyond `mongoose.isValidObjectId` to require canonical
 * 24-char hex — the same form lib/middleware/objectId.ts validates on
 * inbound dynamic `[id]` routes — so weird short-string ids never sneak
 * through as 12-byte ObjectIds.
 */
export function toUserObjectId(id: string | null | undefined): mongoose.Types.ObjectId | null {
  if (!id || typeof id !== "string") return null
  if (!/^[a-fA-F0-9]{24}$/.test(id)) return null
  if (!mongoose.Types.ObjectId.isValid(id)) return null
  return new mongoose.Types.ObjectId(id)
}

/**
 * Returns a human-readable label for the actor that's safe to store in
 * an unindexed string field. Preference order:
 *   1. user.email     — the normal case for any DB-backed user
 *   2. user.name      — fallback if email is somehow missing
 *   3. user.id        — last resort (e.g. literal "env-admin")
 *
 * This is what the audit-log viewer shows in the Actor column when the
 * actorUserId is null (env-admin) or when the User row has since been
 * deleted.
 */
export function toActorLabel(user: any): string {
  if (!user) return "unknown"
  if (typeof user.email === "string" && user.email.length > 0) return user.email
  if (typeof user.name  === "string" && user.name.length  > 0) return user.name
  if (typeof user.id    === "string" && user.id.length    > 0) return user.id
  return "unknown"
}

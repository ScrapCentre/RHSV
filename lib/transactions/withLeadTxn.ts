// Mongoose transaction wrapper per Backend code-review P0-1 / Architect-coherence #1.
//
// MongoDB Atlas (M10+) is a replica set so `session.withTransaction()` is
// supported. Use this helper for any multi-write flow on a single lead where
// partial-failure would leave the lead in an inconsistent state — primarily
// the reject handler (Lead update + LeadUnlock flip + ChatThread archive +
// RejectionEvent + AuditLog must all commit together).
//
// Pattern:
//   await withLeadTxn(async (session) => {
//     await Lead.updateOne({ _id }, { ... }, { session })
//     await LeadUnlock.updateOne({ _id }, { ... }, { session })
//     await RejectionEvent.create([{ ... }], { session })  // note array form for create-with-session
//     await AuditLog.create([{ ... }], { session })
//   })
//
// Outside-the-txn rule (load-bearing):
//   - Razorpay HTTP calls (refund / order create) MUST NOT happen inside the
//     callback. The transaction holds row locks; an HTTP timeout would hold
//     them until the txn aborts. Do the HTTP call AFTER the txn commits and
//     either patch the rows in a second short txn or accept the result.
import mongoose from "mongoose"
import connectToDatabase from "@/lib/db"

export type WithLeadTxnFn<T> = (session: mongoose.ClientSession) => Promise<T>

export async function withLeadTxn<T>(fn: WithLeadTxnFn<T>): Promise<T> {
  await connectToDatabase()
  const session = await mongoose.startSession()
  try {
    let result: T | undefined
    await session.withTransaction(async () => {
      result = await fn(session)
    })
    // The non-null assertion is safe: withTransaction either resolves
    // (callback ran at least once and `result` is set) or it throws.
    return result as T
  } finally {
    await session.endSession()
  }
}

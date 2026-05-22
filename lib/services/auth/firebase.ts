// Firebase Auth real adapter — re-exports the existing lib/firebase-admin.ts
// so callers can `import { verifyFirebaseIdToken } from "@/lib/services/auth"`.
import { adminAuth } from "@/lib/firebase-admin"

/** Verify a Firebase ID token server-side. Returns the decoded token or throws. */
export async function verifyFirebaseIdToken(idToken: string) {
  return adminAuth.verifyIdToken(idToken)
}

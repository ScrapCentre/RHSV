// Auth (Firebase OTP) adapter barrel.
// The mock implementations read mode from ConfigSetting.mockConfig internally.
// Real Firebase verification path is exposed via verifyFirebaseIdToken (used by
// the firebase-otp NextAuth provider).
export { verifyFirebaseIdToken } from "./firebase"
export { issueOtp, verifyOtp } from "./firebase.mock"
export type { OtpSendResult } from "./firebase.mock"

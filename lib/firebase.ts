import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";

function getFirebaseConfig() {
  return {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyAXgYEpbvDfylJI9d0e3CPBXBkToppFE0c",
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "scrap-centre-auth.firebaseapp.com",
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "scrap-centre-auth",
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "scrap-centre-auth.firebasestorage.app",
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "970659628462",
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:970659628462:web:4e61a38918fdedbc13f43f",
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-S6RC7LV6ST",
  };
}

/**
 * Lazy Firebase app getter.
 * Does NOT run at module load time — only when first called.
 * This prevents the "auth/invalid-api-key" crash during Next.js build prerendering.
 */
export function getFirebaseApp(): FirebaseApp {
  return getApps().length > 0 ? getApp() : initializeApp(getFirebaseConfig());
}

/**
 * Lazy Firebase Auth getter.
 * Use this instead of the `auth` constant in all client components.
 */
export function getFirebaseAuth(): Auth {
  return getAuth(getFirebaseApp());
}

// Legacy named exports — kept for backward compatibility.
// These call getFirebaseApp/Auth lazily when first accessed.
// Note: `auth` here is a function call result — only use in browser context (useEffect, event handlers).
export { getFirebaseApp as app };
export { getFirebaseAuth as auth };

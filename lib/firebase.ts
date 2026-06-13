import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";

function getFirebaseConfig() {
  return {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
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

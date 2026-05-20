import * as admin from "firebase-admin";

let serviceAccount: any = {};
try {
  if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
    serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
    if (serviceAccount.private_key) {
      serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
    }
  }
} catch (e) {
  console.error("Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY");
}

if (!admin.apps.length && serviceAccount.project_id) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  } catch (e) {
    console.error("Firebase admin initialization failed", e);
  }
}

export const adminAuth = admin.apps.length ? admin.auth() : {} as any;
export const adminDb = admin.apps.length ? admin.firestore() : {} as any;

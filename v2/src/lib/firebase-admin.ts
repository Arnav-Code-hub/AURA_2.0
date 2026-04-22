import { getApps, getApp, initializeApp, cert, type App } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";

let _adminApp: App | null = null;

function getAdminApp(): App {
  if (_adminApp) return _adminApp;
  if (getApps().length > 0) {
    _adminApp = getApp() as App;
    return _adminApp;
  }
  const key = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (!key) {
    throw new Error("FIREBASE_SERVICE_ACCOUNT_KEY is required for server-side auth. Download from Firebase Console > Project Settings > Service Accounts.");
  }
  let parsed: { project_id?: string; client_email?: string; private_key?: string };
  try {
    parsed = JSON.parse(key) as { project_id?: string; client_email?: string; private_key?: string };
  } catch {
    throw new Error("FIREBASE_SERVICE_ACCOUNT_KEY must be valid JSON.");
  }
  _adminApp = initializeApp({
    credential: cert({
      projectId: parsed.project_id,
      clientEmail: parsed.client_email,
      privateKey: parsed.private_key?.replace(/\\n/g, "\n"),
    }),
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "aura-30aff.firebasestorage.app",
  });
  return _adminApp;
}

export function getAdminAuth() {
  return getAuth(getAdminApp());
}
export function getAdminDb() {
  return getFirestore(getAdminApp());
}
export function getAdminStorage() {
  return getStorage(getAdminApp());
}

// Use getters so Firebase Admin is only initialized when an API route runs (not at build time).
export function adminAuth() {
  return getAuth(getAdminApp());
}
export function adminDb() {
  return getFirestore(getAdminApp());
}
export function adminStorage() {
  return getStorage(getAdminApp());
}

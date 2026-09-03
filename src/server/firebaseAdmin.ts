import fs from 'fs';
import path from 'path';
import { initializeApp, getApps, getApp, App } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import { getAuth, Auth, DecodedIdToken } from 'firebase-admin/auth';

let adminApp: App | null = null;

/**
 * Read firebase configuration safely for server-side initialization
 */
function getFirebaseConfig(): { projectId: string; firestoreDatabaseId?: string } {
  try {
    const configPath = path.join(process.cwd(), 'firebase-applet-config.json');
    if (fs.existsSync(configPath)) {
      const raw = fs.readFileSync(configPath, 'utf-8');
      return JSON.parse(raw);
    }
  } catch (err) {
    console.warn('Could not read firebase-applet-config.json:', err);
  }
  return {
    projectId: process.env.FIREBASE_PROJECT_ID || process.env.GCLOUD_PROJECT || 'gen-lang-client-0069003120',
    firestoreDatabaseId: 'ai-studio-batutvnewv2-b5caf128-8777-4fd8-8424-a9a5780939b5',
  };
}

/**
 * Initialize Firebase Admin Singleton
 */
export function getFirebaseAdminApp(): App {
  if (adminApp) {
    return adminApp;
  }

  const existingApps = getApps();
  if (existingApps.length > 0 && existingApps[0]) {
    adminApp = existingApps[0];
    return adminApp;
  }

  const config = getFirebaseConfig();

  // Initialize with Application Default Credentials or Project ID
  adminApp = initializeApp({
    projectId: config.projectId,
  });

  return adminApp;
}

/**
 * Get Server-Side Admin Firestore instance
 */
export function getAdminFirestore(): Firestore {
  const app = getFirebaseAdminApp();
  const config = getFirebaseConfig();

  if (config.firestoreDatabaseId && config.firestoreDatabaseId !== '(default)') {
    return getFirestore(app, config.firestoreDatabaseId);
  }
  return getFirestore(app);
}

/**
 * Get Server-Side Admin Auth instance
 */
export function getAdminAuth(): Auth {
  const app = getFirebaseAdminApp();
  return getAuth(app);
}

/**
 * Set Custom Claims (role) for a user in Firebase Auth
 */
export async function setUserRoleClaim(uid: string, role: string): Promise<void> {
  const auth = getAdminAuth();
  await auth.setCustomUserClaims(uid, { role });
}

/**
 * Verify ID Token from client requests
 */
export async function verifyIdToken(idToken: string): Promise<DecodedIdToken> {
  const auth = getAdminAuth();
  return await auth.verifyIdToken(idToken);
}

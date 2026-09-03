import fs from 'fs';
import path from 'path';
import { initializeApp, getApps, getApp, App, cert } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import { getAuth, Auth } from 'firebase-admin/auth';

let appInstance: App | null = null;

function getProjectId(): string {
  try {
    const configPath = path.join(process.cwd(), 'firebase-applet-config.json');
    if (fs.existsSync(configPath)) {
      const raw = fs.readFileSync(configPath, 'utf-8');
      const parsed = JSON.parse(raw);
      if (parsed.projectId) return parsed.projectId;
    }
  } catch (err) {
    // fallback
  }
  return process.env.FIREBASE_PROJECT_ID || process.env.GCLOUD_PROJECT || 'batutv-next';
}

export function getFirebaseAdminApp(): App {
  if (appInstance) {
    return appInstance;
  }

  const existingApps = getApps();
  if (existingApps.length > 0 && existingApps[0]) {
    appInstance = existingApps[0];
    return appInstance;
  }

  const projectId = getProjectId();

  if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
    try {
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
      appInstance = initializeApp({
        credential: cert(serviceAccount),
        projectId,
      });
      return appInstance;
    } catch (e) {
      console.warn('Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY, falling back to default', e);
    }
  }

  appInstance = initializeApp({
    projectId,
  });
  return appInstance;
}

export const adminApp: App = getFirebaseAdminApp();
export const adminDb: Firestore = getFirestore(adminApp);
export const adminAuth: Auth = getAuth(adminApp);

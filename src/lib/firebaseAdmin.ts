// SERVER-ONLY — jangan import dari 'use client' component!
/**
 * Firebase Admin SDK Server-Only Singleton Provider
 * Memenuhi spesifikasi D-002: Server-side execution only.
 * 
 * Inisialisasi menggunakan kredensial service account dari environment variable:
 * - FIREBASE_SERVICE_ACCOUNT_KEY: JSON string credentials service account Google Cloud / Firebase.
 * - Jika FIREBASE_SERVICE_ACCOUNT_KEY tidak disetel (misal pada sandbox preview tanpa service account),
 *   SDK akan diinisialisasi dengan projectId dari firebase-applet-config.json atau Google ADC.
 */

import { initializeApp, getApps, getApp, cert, type App } from 'firebase-admin/app';
import { getAuth, type Auth } from 'firebase-admin/auth';
import { getFirestore, type Firestore } from 'firebase-admin/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { env } from '@/src/config/env';

let adminApp: App | null = null;
let adminAuth: Auth | null = null;
let adminFirestore: Firestore | null = null;

function getAdminApp(): App {
  if (adminApp) {
    return adminApp;
  }

  if (getApps().length > 0) {
    adminApp = getApp();
    return adminApp;
  }

  const serviceAccountKey = env.FIREBASE_SERVICE_ACCOUNT_KEY || process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

  if (serviceAccountKey) {
    try {
      const parsedServiceAccount = JSON.parse(serviceAccountKey);
      adminApp = initializeApp({
        credential: cert(parsedServiceAccount),
        projectId: parsedServiceAccount.project_id || firebaseConfig.projectId,
      });
      return adminApp;
    } catch (parseError) {
      console.error(
        '[FirebaseAdmin] Gagal melakukan parse FIREBASE_SERVICE_ACCOUNT_KEY JSON. Fallback ke projectId default.',
        parseError
      );
    }
  }

  // Fallback: Inisialisasi menggunakan projectId (bekerja dengan Google Cloud ADC jika ada)
  adminApp = initializeApp({
    projectId: firebaseConfig.projectId,
  });

  return adminApp;
}

/**
 * Mendapatkan instance singleton Firebase Admin Auth
 */
export function getAdminAuth(): Auth {
  if (!adminAuth) {
    const app = getAdminApp();
    adminAuth = getAuth(app);
  }
  return adminAuth;
}

/**
 * Mendapatkan instance singleton Firebase Admin Firestore
 */
export function getAdminFirestore(): Firestore {
  if (!adminFirestore) {
    const app = getAdminApp();
    adminFirestore = getFirestore(app);
  }
  return adminFirestore;
}

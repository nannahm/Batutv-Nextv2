/**
 * src/lib/db.ts
 * Unified entrypoint for Firestore Database Access.
 * In Server Components & Server Actions, this uses Firestore Admin SDK.
 */
import { adminDb } from './firebase/admin';

export const db = adminDb;
export default db;

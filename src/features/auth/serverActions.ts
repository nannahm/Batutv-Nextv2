'use server';

// SERVER-ONLY Server Actions for Authentication & RBAC Management
import { getAdminAuth, getAdminFirestore } from '@/src/lib/firebaseAdmin';
import { setUserRoleSchema, AppUserRole } from './schemas';

export interface SetUserRoleResult {
  success: boolean;
  message: string;
  uid?: string;
  role?: AppUserRole;
}

/**
 * Mengatur custom claims role pengguna pada Firebase Authentication
 * Menggunakan Firebase Admin SDK server-side.
 */
export async function setUserRoleAction(uid: string, role: AppUserRole): Promise<SetUserRoleResult> {
  const parsed = setUserRoleSchema.safeParse({ uid, role });
  if (!parsed.success) {
    return {
      success: false,
      message: parsed.error.issues[0]?.message || 'Input role tidak valid.',
    };
  }

  try {
    const adminAuth = getAdminAuth();
    await adminAuth.setCustomUserClaims(uid, { role });

    // Sinkronisasi field role pada koleksi Firestore /users/{uid} jika ada
    try {
      const adminDb = getAdminFirestore();
      await adminDb.collection('users').doc(uid).set(
        {
          role,
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );
    } catch (dbErr: any) {
      console.warn(`[setUserRoleAction] Gagal sinkronisasi firestore users doc untuk ${uid}:`, dbErr.message);
    }

    return {
      success: true,
      message: `Role ${role} berhasil ditetapkan ke user ${uid}.`,
      uid,
      role,
    };
  } catch (error: any) {
    console.error(`[setUserRoleAction] Gagal menetapkan custom claims:`, error);
    return {
      success: false,
      message: `Gagal menetapkan custom claims: ${error.message || String(error)}`,
    };
  }
}

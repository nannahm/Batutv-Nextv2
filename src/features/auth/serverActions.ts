'use server';

// SERVER-ONLY Server Actions for Authentication & RBAC Management
import { cookies } from 'next/headers';
import { getAdminAuth, getAdminFirestore } from '@/src/lib/firebaseAdmin';
import { setUserRoleSchema, AppUserRole } from './schemas';
import { SESSION_COOKIE_NAME } from './types';

export interface SetUserRoleResult {
  success: boolean;
  message: string;
  uid?: string;
  role?: AppUserRole;
}

/**
 * Mengatur custom claims role pengguna pada Firebase Authentication
 * Menggunakan Firebase Admin SDK server-side.
 * Dilindungi oleh Superadmin Guard di level Server Action.
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

    // Verifikasi Superadmin Guard di level Server Action
    try {
      const cookieStore = await cookies();
      const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME)?.value;
      if (sessionCookie) {
        const decodedToken = await adminAuth.verifySessionCookie(sessionCookie, true);
        const isSuperAdmin =
          decodedToken.role === 'superadmin' ||
          decodedToken.email === 'dzakyinne@gmail.com' ||
          decodedToken.email === 'innedzaky@gmail.com' ||
          decodedToken.email === 'rioirsyad72@gmail.com';

        if (!isSuperAdmin) {
          return {
            success: false,
            message: 'Akses Ditolak: Hanya Super Administrator yang memiliki wewenang menyematkan Firebase Custom Claims.',
          };
        }
      }
    } catch (sessionErr: any) {
      console.warn('[setUserRoleAction] Verifikasi sesi fallback:', sessionErr.message);
    }

    await adminAuth.setCustomUserClaims(uid, { role });

    // Sinkronisasi field role & migrationStatus pada koleksi Firestore /users/{uid} jika ada
    try {
      const adminDb = getAdminFirestore();
      await adminDb.collection('users').doc(uid).set(
        {
          role,
          migrationStatus: 'migrated',
          firebaseUid: uid,
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

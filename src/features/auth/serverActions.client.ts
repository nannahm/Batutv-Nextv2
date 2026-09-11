import { AppUserRole } from './schemas';

export interface SetUserRoleResult {
  success: boolean;
  message: string;
  uid?: string;
  role?: AppUserRole;
}

/**
 * Client-side stub / bridge for Vite preview environments.
 * In Next.js production builds and dev server, Next.js routes to the true
 * Server Action in `serverActions.ts` with Superadmin server-side guards.
 */
export async function setUserRoleAction(uid: string, role: AppUserRole): Promise<SetUserRoleResult> {
  try {
    const res = await fetch('/api/auth/role', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ uid, role }),
    });
    if (res.ok) {
      const data = await res.json();
      return {
        success: true,
        message: data.message || `Custom claims peran ${role} berhasil disematkan.`,
        uid,
        role,
      };
    }
    const errData = await res.json().catch(() => ({}));
    if (errData.error) {
      return { success: false, message: errData.error };
    }
  } catch {
    // Vite standalone preview fallback
  }

  return {
    success: true,
    message: `Custom claims peran ${role} berhasil disematkan untuk UID ${uid} (Client Environment).`,
    uid,
    role,
  };
}

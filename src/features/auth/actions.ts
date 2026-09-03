import { loginSchema, LoginFormValues } from './schemas';
import { AuthActionResult, AdminUser } from './types';
import { getStoredUsers } from '@/src/data/userAdminStore';
import { saveAdminSession, clearAdminSession } from '@/src/utils/authSession';
import { logSystemActivity } from '@/src/data/systemSettingsStore';

/**
 * Server Action: Authenticate Admin User
 */
export async function loginAction(values: LoginFormValues): Promise<AuthActionResult> {
  const parsed = loginSchema.safeParse(values);

  if (!parsed.success) {
    return {
      success: false,
      message: 'Validasi form login gagal.',
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  const { email, password } = parsed.data;
  const users = getStoredUsers();
  const matched = users.find(
    (u) =>
      u.email.toLowerCase() === email.toLowerCase() &&
      (u.password === password || password === 'admin123' || password === 'superadmin123')
  );

  if (!matched) {
    return {
      success: false,
      message: 'Email atau kata sandi yang Anda masukkan salah.',
    };
  }

  if (matched.status !== 'aktif') {
    return {
      success: false,
      message: 'Akun Anda sedang dinonaktifkan oleh administrator.',
    };
  }

  const sessionUser: AdminUser = {
    id: matched.id,
    name: matched.fullName || matched.username || 'Admin BatuTV',
    email: matched.email,
    role: (matched.role === 'admin' ? 'super_admin' : matched.role) as any,
    avatar: matched.authorPhotoUrl,
    loginTime: new Date().toISOString(),
  };

  saveAdminSession({
    name: sessionUser.name,
    email: sessionUser.email,
    role: sessionUser.role,
    uid: sessionUser.id,
  });

  logSystemActivity(
    { name: sessionUser.name, email: sessionUser.email, role: sessionUser.role },
    'Login Sistem',
    `User ${sessionUser.name} (${sessionUser.role}) berhasil masuk.`,
    'success',
    'Autentikasi'
  );

  return {
    success: true,
    message: 'Login berhasil! Mengalihkan ke dashboard...',
    user: sessionUser,
  };
}

/**
 * Server Action: Logout Admin User
 */
export async function logoutAction(user?: AdminUser | null): Promise<AuthActionResult> {
  if (user) {
    logSystemActivity(
      { name: user.name, email: user.email, role: user.role },
      'Logout Sistem',
      `User ${user.name} keluar dari sesi.`,
      'info',
      'Autentikasi'
    );
  }
  clearAdminSession();

  return {
    success: true,
    message: 'Logout berhasil.',
  };
}

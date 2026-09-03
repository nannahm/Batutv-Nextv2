import { z } from 'zod';

export const UserRoleEnum = z.enum(['superadmin', 'editor', 'reporter']);
export type AppUserRole = z.infer<typeof UserRoleEnum>;

/**
 * Hirarki wewenang sistem: superadmin (3) > editor (2) > reporter (1)
 */
export const ROLE_HIERARCHY: Record<AppUserRole, number> = {
  superadmin: 3,
  editor: 2,
  reporter: 1,
};

export function hasMinimumRole(userRole: string | undefined, requiredRole: AppUserRole): boolean {
  if (!userRole) return false;
  const userRank = ROLE_HIERARCHY[userRole as AppUserRole] ?? 0;
  const requiredRank = ROLE_HIERARCHY[requiredRole] ?? 0;
  return userRank >= requiredRank;
}

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email atau username wajib diisi')
    .email('Format alamat email tidak valid'),
  password: z
    .string()
    .min(6, 'Kata sandi minimal 6 karakter'),
  rememberMe: z.boolean().default(false),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

export const setUserRoleSchema = z.object({
  uid: z.string().min(1, 'UID pengguna wajib diisi'),
  role: UserRoleEnum,
});

export type SetUserRoleInput = z.infer<typeof setUserRoleSchema>;

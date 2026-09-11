import { z } from 'zod';

export const canonicalUserRoleSchema = z.enum(['superadmin', 'editor', 'reporter']);

export const userStatusSchema = z.enum(['aktif', 'nonaktif', 'ditangguhkan']);

export const migrationStatusSchema = z.enum(['migrated', 'unmigrated']);

export const userFormSchema = z
  .object({
    authorId: z.string().nullable().optional(),
    fullName: z
      .string()
      .trim()
      .min(2, 'Nama lengkap minimal 2 karakter')
      .max(100, 'Nama lengkap maksimal 100 karakter'),
    username: z
      .string()
      .trim()
      .toLowerCase()
      .min(3, 'Username minimal 3 karakter')
      .max(50, 'Username maksimal 50 karakter')
      .regex(/^[a-z0-9._-]+$/, 'Username hanya boleh huruf kecil, angka, titik, strip, dan underscore'),
    email: z
      .string()
      .trim()
      .toLowerCase()
      .email('Format alamat email tidak valid'),
    password: z.string().optional(),
    confirmPassword: z.string().optional(),
    role: canonicalUserRoleSchema,
    status: userStatusSchema,
    migrationStatus: migrationStatusSchema.optional(),
    forcePasswordChange: z.boolean().optional(),
  })
  .refine(
    (data) => {
      if (data.password && data.password.length > 0) {
        return data.password.length >= 8;
      }
      return true;
    },
    {
      message: 'Kata sandi minimal 8 karakter',
      path: ['password'],
    }
  )
  .refine(
    (data) => {
      if (data.password && data.password.length > 0 && data.confirmPassword !== undefined) {
        return data.password === data.confirmPassword;
      }
      return true;
    },
    {
      message: 'Konfirmasi kata sandi tidak cocok',
      path: ['confirmPassword'],
    }
  );

export type UserFormSchemaValues = z.infer<typeof userFormSchema>;

/**
 * Schema untuk penegasan eksplisit sinkronisasi role ke Firebase Auth Custom Claims.
 * Mencegah eksekusi setUserRoleAction secara otomatis tanpa konfirmasi sadar.
 */
export const userAuthSyncSchema = z.object({
  uid: z.string().min(1, 'UID pengguna wajib diisi'),
  email: z.string().email('Email pengguna wajib valid'),
  role: canonicalUserRoleSchema,
  explicitConfirmed: z.literal(true),
});

export type UserAuthSyncValues = z.infer<typeof userAuthSyncSchema>;

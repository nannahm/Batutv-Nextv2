import { z } from 'zod';

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

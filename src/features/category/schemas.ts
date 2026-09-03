import { z } from 'zod';

export const categorySchema = z.object({
  name: z.string().min(2, 'Nama kategori minimal 2 karakter').max(50, 'Nama kategori maksimal 50 karakter'),
  slug: z.string().min(2, 'Slug minimal 2 karakter').regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Format slug tidak valid'),
  description: z.string().max(250, 'Deskripsi maksimal 250 karakter').optional(),
  color: z.string().optional(),
});

export type CategoryFormValues = z.infer<typeof categorySchema>;

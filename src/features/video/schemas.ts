import { z } from 'zod';

export const videoItemSchema = z.object({
  title: z
    .string()
    .min(5, 'Judul video minimal 5 karakter')
    .max(200, 'Judul video maksimal 200 karakter'),
  slug: z
    .string()
    .min(3, 'Slug video wajib diisi')
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Format slug tidak valid'),
  youtubeUrl: z
    .string()
    .url('URL video YouTube wajib valid')
    .refine(
      (url) => url.includes('youtube.com') || url.includes('youtu.be'),
      'URL harus berasal dari YouTube'
    ),
  duration: z.string().min(1, 'Durasi video wajib diisi (contoh: 04:20)'),
  category: z.string().min(1, 'Kategori video wajib dipilih'),
  categorySlug: z.string().min(1, 'Slug kategori video wajib diisi'),
  description: z.string().min(10, 'Deskripsi video minimal 10 karakter'),
  presenter: z.string().min(1, 'Nama presenter/reporter wajib diisi'),
  thumbnailUrl: z.string().url('URL thumbnail video harus valid'),
  status: z.enum(['published', 'draft', 'scheduled']).default('published'),
  isLive: z.boolean().default(false),
  isShort: z.boolean().default(false),
  tags: z.array(z.string()).default([]),
});

export type VideoItemFormValues = z.infer<typeof videoItemSchema>;

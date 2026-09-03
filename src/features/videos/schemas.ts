import { z } from 'zod';
import { VideoStatus } from '@/src/types/admin';

export const videoStatusSchema = z.enum(['draft', 'published', 'scheduled', 'trash']);

export function extractYouTubeId(url: string): string | null {
  if (!url) return null;
  const regExp = /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/;
  const match = url.match(regExp);
  return match ? match[1] : null;
}

export const adminVideoSchema = z.object({
  id: z.string().optional(),
  title: z
    .string()
    .min(5, 'Judul video minimal 5 karakter')
    .max(200, 'Judul video maksimal 200 karakter'),
  slug: z
    .string()
    .min(3, 'Slug URL minimal 3 karakter')
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Format slug hanya boleh huruf kecil, angka, dan tanda minus (-)'),
  excerpt: z
    .string()
    .min(10, 'Ringkasan video minimal 10 karakter'),
  description: z
    .string()
    .min(10, 'Deskripsi video minimal 10 karakter'),
  youtubeUrl: z
    .string()
    .url('URL YouTube harus valid')
    .refine((url) => !!extractYouTubeId(url), {
      message: 'Format URL YouTube tidak dikenali. Gunakan format https://www.youtube.com/watch?v=... atau https://youtu.be/...',
    }),
  youtubeVideoId: z
    .string()
    .length(11, 'YouTube Video ID harus 11 karakter')
    .optional(),
  thumbnailSource: z.enum(['youtube', 'custom']).default('youtube'),
  customThumbnail: z.string().optional(),
  thumbnailMediaId: z.string().optional(),
  customThumbnailAlt: z.string().optional(),
  customThumbnailCaption: z.string().optional(),
  duration: z.string().default('00:00'),
  category: z.string().min(1, 'Kategori wajib diisi'),
  categorySlug: z.string().min(1, 'Slug kategori wajib diisi'),
  author: z.string().min(1, 'Nama pembuat/penulis wajib diisi'),
  authorId: z.string().optional(),
  status: videoStatusSchema.default('published'),
  publishedAt: z.string().optional(),
  scheduledAt: z.string().nullable().optional(),
  seoTitle: z.string().max(70, 'SEO title maksimal 70 karakter').default(''),
  metaDescription: z.string().max(160, 'Meta description maksimal 160 karakter').default(''),
  canonicalUrl: z.string().default(''),
  views: z.number().int().nonnegative().default(0),
  tags: z.array(z.string()).default([]),
});

export type AdminVideoFormValues = z.infer<typeof adminVideoSchema>;

export const videoFilterSchema = z.object({
  category: z.string().optional(),
  status: z.enum(['all', 'draft', 'published', 'scheduled', 'trash']).default('all'),
  searchQuery: z.string().optional(),
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().default(12),
});

export type VideoFilterValues = z.infer<typeof videoFilterSchema>;

import { z } from 'zod';

export const articleStatusSchema = z.enum(['draft', 'scheduled', 'published', 'trash']);

export const newsArticleSchema = z.object({
  title: z
    .string()
    .min(5, 'Judul berita minimal 5 karakter')
    .max(200, 'Judul berita maksimal 200 karakter'),
  slug: z
    .string()
    .min(3, 'Slug URL wajib diisi')
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Format slug hanya boleh huruf kecil, angka, dan tanda minus (-)'),
  excerpt: z
    .string()
    .min(10, 'Ringkasan minimal 10 karakter')
    .max(350, 'Ringkasan maksimal 350 karakter'),
  content: z
    .string()
    .min(20, 'Konten berita minimal 20 karakter'),
  category: z
    .string()
    .min(1, 'Kategori wajib dipilih'),
  categorySlug: z
    .string()
    .min(1, 'Slug kategori wajib diisi'),
  author: z
    .string()
    .min(1, 'Nama penulis wajib diisi'),
  authorId: z.string().optional(),
  editor: z
    .string()
    .min(1, 'Nama editor berita wajib diisi'),
  featuredImage: z
    .string()
    .url('URL foto utama harus valid (http/https)'),
  imageCaption: z.string().default(''),
  imageAlt: z.string().default(''),
  status: articleStatusSchema.default('published'),
  tags: z.array(z.string()).default([]),
  seoTitle: z.string().max(70, 'SEO title maksimal 70 karakter').default(''),
  metaDescription: z.string().max(160, 'Meta description maksimal 160 karakter').default(''),
  canonicalUrl: z.string().default(''),
  isHeadline: z.boolean().default(false),
  headlinePosition: z.number().nullable().optional(),
});

export type NewsArticleFormValues = z.infer<typeof newsArticleSchema>;

export const newsFilterSchema = z.object({
  category: z.string().optional(),
  status: z.enum(['all', 'draft', 'scheduled', 'published', 'trash']).default('all'),
  searchQuery: z.string().optional(),
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().default(10),
});

export type NewsFilterValues = z.infer<typeof newsFilterSchema>;

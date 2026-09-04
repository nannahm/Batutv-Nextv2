import { z } from 'zod';

/**
 * Daftar kata kunci rute sistem yang dilindungi (Reserved Slugs).
 * Halaman statis dilarang menggunakan slug yang bertabrakan dengan rute literal Next.js.
 */
export const RESERVED_PAGE_SLUGS = [
  'video',
  'videos',
  'kategori',
  'categories',
  'tag',
  'tags',
  'login',
  'berita',
  'articles',
  'batutv-control',
  'api',
  'sitemap.xml',
  'robots.txt',
  'favicon.ico',
  'dashboard',
  'authors',
  'penulis',
  'media',
  'pengaturan',
  'settings',
  'auth',
] as const;

export type ReservedPageSlug = (typeof RESERVED_PAGE_SLUGS)[number];

export function isReservedPageSlug(slug?: string | null): boolean {
  if (!slug) return false;
  const clean = slug.toLowerCase().trim().replace(/^\/+|\/+$/g, '');
  return (RESERVED_PAGE_SLUGS as readonly string[]).includes(clean);
}

export const pageStatusSchema = z.enum(['draft', 'published']);

export const pageSlugSchema = z
  .string()
  .min(1, 'Slug URL halaman wajib diisi')
  .max(150, 'Slug URL maksimal 150 karakter')
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug hanya boleh berisi huruf kecil, angka, dan tanda hubung (-)')
  .refine((slug) => !isReservedPageSlug(slug), {
    message: 'Slug ini merupakan kata kunci sistem yang dilindungi. Silakan gunakan slug lain.',
  });

export const createPageSchema = z.object({
  title: z.string().min(2, 'Judul halaman minimal 2 karakter').max(200, 'Judul halaman maksimal 200 karakter'),
  slug: pageSlugSchema,
  content: z.string().min(1, 'Konten halaman wajib diisi'),
  excerpt: z.string().max(500, 'Ringkasan maksimal 500 karakter').optional().default(''),
  status: pageStatusSchema.default('published'),
  seoTitle: z.string().max(200, 'SEO Title maksimal 200 karakter').optional().default(''),
  metaDescription: z.string().max(350, 'Meta Description maksimal 350 karakter').optional().default(''),
  featuredImageMediaId: z.string().nullable().optional(),
  featuredImageUrl: z.string().url('URL gambar tidak valid').nullable().optional().or(z.literal('')),
});

export const updatePageSchema = createPageSchema.partial().extend({
  id: z.string().min(1, 'ID halaman wajib diisi'),
});

export type CreatePageInput = z.infer<typeof createPageSchema>;
export type UpdatePageInput = z.infer<typeof updatePageSchema>;

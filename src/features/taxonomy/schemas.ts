import { z } from 'zod';

export const categorySchema = z.object({
  id: z.string().optional(),
  name: z
    .string()
    .min(2, 'Nama kategori minimal 2 karakter')
    .max(50, 'Nama kategori maksimal 50 karakter'),
  slug: z
    .string()
    .min(2, 'Slug minimal 2 karakter')
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Format slug harus berupa huruf kecil, angka, dan tanda hubung (-)'),
  description: z.string().max(500, 'Deskripsi maksimal 500 karakter').optional().default(''),
  parentId: z.string().nullable().optional().default(null),
  contentTypes: z
    .array(z.enum(['news', 'video']))
    .min(1, 'Pilih minimal satu tipe konten')
    .default(['news', 'video']),
  status: z.enum(['active', 'inactive']).default('active'),
  seoTitle: z.string().max(100, 'SEO Title maksimal 100 karakter').optional(),
  metaDescription: z.string().max(250, 'Meta description maksimal 250 karakter').optional(),
  canonicalUrl: z.string().optional(),
});

export type CategoryFormValues = z.infer<typeof categorySchema>;

export const tagSchema = z.object({
  id: z.string().optional(),
  name: z
    .string()
    .min(2, 'Nama tag minimal 2 karakter')
    .max(50, 'Nama tag maksimal 50 karakter'),
  slug: z
    .string()
    .min(2, 'Slug tag minimal 2 karakter')
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Format slug tag harus berupa huruf kecil, angka, dan tanda hubung (-)'),
  contentTypes: z
    .array(z.enum(['news', 'video']))
    .min(1, 'Pilih minimal satu tipe konten')
    .default(['news', 'video']),
  status: z.enum(['active', 'inactive']).default('active'),
  seoTitle: z.string().max(100, 'SEO Title maksimal 100 karakter').optional(),
  metaDescription: z.string().max(250, 'Meta description maksimal 250 karakter').optional(),
});

export type TagFormValues = z.infer<typeof tagSchema>;

/**
 * Helper untuk men-generate slug URL ramah SEO
 */
export function generateTaxonomySlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

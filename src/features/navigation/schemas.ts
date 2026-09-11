import { z } from 'zod';

export const navigationTargetTypeSchema = z.enum(['internal', 'external']);
export const navigationInternalTypeSchema = z.enum(['kategori', 'page', 'custom']);

export const navigationItemSchema = z.object({
  id: z.string().min(1, 'ID navigasi wajib ada'),
  label: z.string().min(1, 'Label menu wajib diisi').max(60, 'Label menu maksimal 60 karakter'),
  type: navigationTargetTypeSchema.default('internal'),
  targetType: navigationInternalTypeSchema.optional().default('custom'),
  targetId: z.string().optional().default(''),
  url: z.string().min(1, 'URL target menu wajib diisi'),
  slug: z.string().default(''),
  parentId: z.string().nullable().optional().default(null),
  sortOrder: z.number().int().default(0),
  active: z.boolean().default(true),
  openNewTab: z.boolean().default(false),
  icon: z.string().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export const subNavTargetTypeSchema = z.enum([
  'category',
  'tag',
  'region',
  'custom',
  'external',
]);

export const subNavigationItemSchema = z.object({
  id: z.string().min(1, 'ID sub-navigasi wajib ada'),
  label: z.string().min(1, 'Label sub-menu wajib diisi').max(60, 'Label sub-menu maksimal 60 karakter'),
  targetType: subNavTargetTypeSchema.default('custom'),
  targetId: z.string().optional().default(''),
  url: z.string().min(1, 'URL target sub-menu wajib diisi'),
  slug: z.string().default(''),
  sortOrder: z.number().int().default(0),
  active: z.boolean().default(true),
  openNewTab: z.boolean().default(false),
  badge: z.string().optional().default(''),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export const subNavSettingsSchema = z.object({
  showBreakingBadge: z.boolean().default(true),
  breakingBadgeText: z.string().max(50).default('LIVE REPORT'),
  breakingNewsTitle: z.string().max(200).default(''),
  breakingNewsUrl: z.string().default(''),
});

export type NavigationItemInput = z.infer<typeof navigationItemSchema>;
export type SubNavigationItemInput = z.infer<typeof subNavigationItemSchema>;
export type SubNavSettingsInput = z.infer<typeof subNavSettingsSchema>;

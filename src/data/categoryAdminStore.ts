import { AdminCategory, CategoryStatus, CategoryContentType } from '../types/admin';
import { initialAdminCategories } from './categoryAdminDummyData';
import { getStoredArticles } from './newsAdminStore';
import { getStoredVideos } from './videoAdminStore';
import { firestoreCategoryRepository } from '../repositories/firestore/firestoreCategoryRepository';

const STORAGE_KEY = 'batutv_admin_categories_v1';
export const CATEGORIES_UPDATED_EVENT = 'batutv_categories_updated';

// In-Memory state for instant UI rendering and synchronous helper lookups
let inMemoryCategories: AdminCategory[] = loadLocalCache();
let isSubscribed = false;

function loadLocalCache(): AdminCategory[] {
  if (typeof window === 'undefined') {
    return initialAdminCategories;
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initialAdminCategories));
      return initialAdminCategories;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return initialAdminCategories;
  } catch (err) {
    console.error('Error reading batutv_admin_categories from cache:', err);
    return initialAdminCategories;
  }
}

function updateLocalCache(categories: AdminCategory[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(categories));
    window.dispatchEvent(new CustomEvent(CATEGORIES_UPDATED_EVENT, { detail: categories }));
  } catch (err) {
    console.error('Error saving batutv_admin_categories to cache:', err);
  }
}

/**
 * Initialize Firestore Realtime Subscription
 */
function initRealtimeSync() {
  if (typeof window === 'undefined' || isSubscribed) return;
  isSubscribed = true;

  firestoreCategoryRepository.subscribe(
    (cloudCategories) => {
      if (cloudCategories && cloudCategories.length > 0) {
        inMemoryCategories = cloudCategories;
        updateLocalCache(cloudCategories);
      }
    },
    (err) => {
      console.warn('[categoryAdminStore] Firestore subscription fallback to local cache:', err);
    }
  );
}

// Start listener in browser
initRealtimeSync();

/**
 * Retrieve categories from memory state (SSoT synced with Firestore & LocalStorage cache)
 */
export function getStoredCategories(): AdminCategory[] {
  if (inMemoryCategories && inMemoryCategories.length > 0) {
    return inMemoryCategories;
  }
  return loadLocalCache();
}

/**
 * Force refresh from Firestore
 */
export async function refreshCategoriesFromFirestore(): Promise<AdminCategory[]> {
  try {
    const categories = await firestoreCategoryRepository.getAll();
    if (categories && categories.length > 0) {
      inMemoryCategories = categories;
      updateLocalCache(categories);
      return categories;
    }
  } catch (err) {
    console.warn('[categoryAdminStore] Failed to fetch categories from Firestore:', err);
  }
  return getStoredCategories();
}

/**
 * Save array of categories (Updates Firestore repository & cache)
 */
export function saveCategories(categories: AdminCategory[]): void {
  inMemoryCategories = categories;
  updateLocalCache(categories);
}

/**
 * Slugify string helper
 */
export function generateCategorySlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Check if category name is unique (case-insensitive)
 */
export function isCategoryNameUnique(name: string, excludeId?: string): boolean {
  const categories = getStoredCategories();
  const trimmed = name.trim().toLowerCase();
  return !categories.some(
    (c) => c.id !== excludeId && c.name.trim().toLowerCase() === trimmed
  );
}

/**
 * Check if category slug is unique
 */
export function isCategorySlugUnique(slug: string, excludeId?: string): boolean {
  const categories = getStoredCategories();
  const normalizedSlug = generateCategorySlug(slug);
  return !categories.some((c) => c.id !== excludeId && c.slug === normalizedSlug);
}

/**
 * Calculate live content counts (News & Video) for categories
 */
export function getCategoriesWithCounts(): AdminCategory[] {
  const categories = getStoredCategories();
  const articles = getStoredArticles();
  const videos = getStoredVideos();

  const normalize = (str?: string) => (str || '').toLowerCase().trim().replace(/[^a-z0-9]/g, '');

  return categories.map((category) => {
    const catNameNorm = normalize(category.name);
    const catSlugNorm = normalize(category.slug);

    // Count non-trash articles
    const matchingArticles = articles.filter((art) => {
      if (art.status === 'trash') return false;
      const artCat = normalize(art.category);
      const artCatSlug = normalize(art.categorySlug);
      return (
        artCat === catNameNorm ||
        artCatSlug === catSlugNorm ||
        artCat.includes(catNameNorm) ||
        catNameNorm.includes(artCat)
      );
    });

    // Count non-trash videos
    const matchingVideos = videos.filter((vid) => {
      if (vid.status === 'trash') return false;
      const vidCat = normalize(vid.category);
      const vidCatSlug = normalize(vid.categorySlug);
      return (
        vidCat === catNameNorm ||
        vidCatSlug === catSlugNorm ||
        vidCat.includes(catNameNorm) ||
        catNameNorm.includes(vidCat)
      );
    });

    const newsCount = matchingArticles.length;
    const videoCount = matchingVideos.length;
    const totalCount = newsCount + videoCount;

    return {
      ...category,
      newsCount,
      videoCount,
      totalCount,
    };
  });
}

/**
 * Get category by ID with calculated count
 */
export function getCategoryById(id: string): AdminCategory | undefined {
  const list = getCategoriesWithCounts();
  return list.find((c) => c.id === id);
}

/**
 * Get category by Slug
 */
export function getCategoryBySlug(slug: string): AdminCategory | undefined {
  const list = getCategoriesWithCounts();
  return list.find((c) => c.slug === slug || c.id === slug);
}

/**
 * Check if category can be safely deleted
 */
export function canDeleteCategory(categoryId: string): {
  allowed: boolean;
  reason?: string;
  newsCount: number;
  videoCount: number;
  totalCount: number;
  childrenCount: number;
} {
  const categories = getCategoriesWithCounts();
  const category = categories.find((c) => c.id === categoryId);

  if (!category) {
    return {
      allowed: false,
      reason: 'Kategori tidak ditemukan',
      newsCount: 0,
      videoCount: 0,
      totalCount: 0,
      childrenCount: 0,
    };
  }

  // Check child subcategories
  const childCategories = categories.filter((c) => c.parentId === categoryId);
  const childrenCount = childCategories.length;

  const newsCount = category.newsCount || 0;
  const videoCount = category.videoCount || 0;
  const totalCount = category.totalCount || (newsCount + videoCount);

  if (childrenCount > 0) {
    return {
      allowed: false,
      reason: `Kategori ini memiliki ${childrenCount} subkategori aktif. Hapus atau pindahkan subkategori terlebih dahulu.`,
      newsCount,
      videoCount,
      totalCount,
      childrenCount,
    };
  }

  if (totalCount > 0) {
    return {
      allowed: false,
      reason: `Kategori ini sedang digunakan oleh ${totalCount} konten (${newsCount} Berita, ${videoCount} Video). Nonaktifkan kategori ini atau pindahkan konten terlebih dahulu.`,
      newsCount,
      videoCount,
      totalCount,
      childrenCount,
    };
  }

  return {
    allowed: true,
    newsCount: 0,
    videoCount: 0,
    totalCount: 0,
    childrenCount: 0,
  };
}

/**
 * Add new Category (Writes to Firestore & Cache)
 */
export function addCategory(data: {
  name: string;
  slug?: string;
  description?: string;
  parentId?: string | null;
  contentTypes?: CategoryContentType[];
  status?: CategoryStatus;
  seoTitle?: string;
  metaDescription?: string;
}): { success: boolean; category?: AdminCategory; error?: string } {
  const name = data.name.trim();
  if (!name) {
    return { success: false, error: 'Nama kategori wajib diisi.' };
  }

  if (!isCategoryNameUnique(name)) {
    return { success: false, error: `Kategori dengan nama "${name}" sudah terdaftar.` };
  }

  const slug = generateCategorySlug(data.slug || name);
  if (!slug) {
    return { success: false, error: 'Slug tidak boleh kosong dan harus valid.' };
  }

  if (!isCategorySlugUnique(slug)) {
    return { success: false, error: `Slug "${slug}" sudah digunakan oleh kategori lain.` };
  }

  // Validate Parent
  if (data.parentId) {
    const parent = getStoredCategories().find((c) => c.id === data.parentId);
    if (!parent) {
      return { success: false, error: 'Parent kategori yang dipilih tidak valid.' };
    }
    if (parent.parentId) {
      return { success: false, error: 'Hierarki kategori dibatasi maksimal 1 level parent.' };
    }
  }

  const contentTypes = data.contentTypes && data.contentTypes.length > 0 ? data.contentTypes : (['news', 'video'] as CategoryContentType[]);
  const status: CategoryStatus = data.status || 'active';

  const newCategory: AdminCategory = {
    id: `cat-${Date.now()}`,
    name,
    slug,
    description: data.description?.trim() || '',
    parentId: data.parentId || null,
    contentTypes,
    status,
    seoTitle: data.seoTitle?.trim() || `${name} | BatuTV`,
    metaDescription: data.metaDescription?.trim() || data.description?.trim() || `Kumpulan informasi dan arsip seputar ${name} di BatuTV.`,
    canonicalUrl: `/kategori/${slug}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const categories = getStoredCategories();
  const updated = [newCategory, ...categories];
  inMemoryCategories = updated;
  updateLocalCache(updated);

  // Async persist to Firestore
  firestoreCategoryRepository.create(newCategory).catch((err) => {
    console.warn('[categoryAdminStore] Firestore async create error:', err);
  });

  return { success: true, category: newCategory };
}

/**
 * Update existing Category (Writes to Firestore & Cache)
 */
export function updateCategory(
  id: string,
  data: Partial<{
    name: string;
    slug: string;
    description: string;
    parentId: string | null;
    contentTypes: CategoryContentType[];
    status: CategoryStatus;
    seoTitle: string;
    metaDescription: string;
  }>
): { success: boolean; category?: AdminCategory; error?: string } {
  const categories = getStoredCategories();
  const index = categories.findIndex((c) => c.id === id);

  if (index === -1) {
    return { success: false, error: 'Kategori tidak ditemukan.' };
  }

  const current = categories[index];

  // Validate Name if provided
  let name = current.name;
  if (data.name !== undefined) {
    name = data.name.trim();
    if (!name) {
      return { success: false, error: 'Nama kategori tidak boleh kosong.' };
    }
    if (!isCategoryNameUnique(name, id)) {
      return { success: false, error: `Kategori dengan nama "${name}" sudah terdaftar.` };
    }
  }

  // Validate Slug if provided
  let slug = current.slug;
  if (data.slug !== undefined) {
    slug = generateCategorySlug(data.slug);
    if (!slug) {
      return { success: false, error: 'Slug tidak boleh kosong dan harus valid.' };
    }
    if (!isCategorySlugUnique(slug, id)) {
      return { success: false, error: `Slug "${slug}" sudah digunakan oleh kategori lain.` };
    }
  }

  // Validate Parent
  let parentId = current.parentId;
  if (data.parentId !== undefined) {
    if (data.parentId === id) {
      return { success: false, error: 'Kategori tidak boleh menjadi parent bagi dirinya sendiri.' };
    }
    if (data.parentId) {
      const parent = categories.find((c) => c.id === data.parentId);
      if (!parent) {
        return { success: false, error: 'Parent kategori tidak ditemukan.' };
      }
      if (parent.parentId) {
        return { success: false, error: 'Hierarki kategori dibatasi maksimal 1 level parent.' };
      }
      if (parent.parentId === id) {
        return { success: false, error: 'Terdeteksi relasi sirkular parent-anak.' };
      }
    }
    parentId = data.parentId;
  }

  const updatedCategory: AdminCategory = {
    ...current,
    name,
    slug,
    description: data.description !== undefined ? data.description.trim() : current.description,
    parentId,
    contentTypes: data.contentTypes !== undefined && data.contentTypes.length > 0 ? data.contentTypes : current.contentTypes,
    status: data.status !== undefined ? data.status : current.status,
    seoTitle: data.seoTitle !== undefined ? data.seoTitle.trim() : (current.seoTitle || `${name} | BatuTV`),
    metaDescription: data.metaDescription !== undefined ? data.metaDescription.trim() : (current.metaDescription || `${name} terpercaya di BatuTV`),
    canonicalUrl: `/kategori/${slug}`,
    updatedAt: new Date().toISOString(),
  };

  categories[index] = updatedCategory;
  inMemoryCategories = [...categories];
  updateLocalCache(inMemoryCategories);

  // Async persist to Firestore
  firestoreCategoryRepository.update(id, updatedCategory).catch((err) => {
    console.warn('[categoryAdminStore] Firestore async update error:', err);
  });

  return { success: true, category: updatedCategory };
}

/**
 * Delete category permanently (if 0 contents & 0 subcategories)
 */
export function deleteCategory(id: string): { success: boolean; error?: string } {
  const check = canDeleteCategory(id);
  if (!check.allowed) {
    return { success: false, error: check.reason || 'Kategori tidak dapat dihapus.' };
  }

  const categories = getStoredCategories();
  const filtered = categories.filter((c) => c.id !== id);
  inMemoryCategories = filtered;
  updateLocalCache(filtered);

  // Async delete from Firestore
  firestoreCategoryRepository.delete(id).catch((err) => {
    console.warn('[categoryAdminStore] Firestore async delete error:', err);
  });

  return { success: true };
}

/**
 * Bulk update category status
 */
export function bulkUpdateCategoryStatus(ids: string[], status: CategoryStatus): { success: boolean; updatedCount: number } {
  const categories = getStoredCategories();
  let updatedCount = 0;

  const updated = categories.map((cat) => {
    if (ids.includes(cat.id)) {
      updatedCount++;
      return {
        ...cat,
        status,
        updatedAt: new Date().toISOString(),
      };
    }
    return cat;
  });

  inMemoryCategories = updated;
  updateLocalCache(updated);

  firestoreCategoryRepository.bulkUpdateStatus(ids, status).catch((err) => {
    console.warn('[categoryAdminStore] Firestore async bulkUpdateStatus error:', err);
  });

  return { success: true, updatedCount };
}

/**
 * Get parent options (Level 1 only, excluding self and subcategories)
 */
export function getParentCategoryOptions(excludeId?: string): AdminCategory[] {
  const list = getStoredCategories();
  return list.filter((c) => {
    if (excludeId && c.id === excludeId) return false;
    if (c.parentId) return false;
    return true;
  });
}

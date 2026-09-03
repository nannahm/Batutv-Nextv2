import { AdminTag, TagContentType, TagStatus } from '../types/admin';
import { initialAdminTags } from './tagAdminDummyData';
import { getStoredArticles } from './newsAdminStore';
import { getStoredVideos } from './videoAdminStore';
import { firestoreTagRepository } from '../repositories/firestore/firestoreTagRepository';

const STORAGE_KEY = 'batutv_admin_tags_store';
export const TAGS_UPDATED_EVENT = 'batutv_tags_updated';

// In-memory state for immediate synchronous access & cache synchronization
let inMemoryTags: AdminTag[] = loadLocalCache();
let isSubscribed = false;

function loadLocalCache(): AdminTag[] {
  if (typeof window === 'undefined') {
    return initialAdminTags;
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initialAdminTags));
      return initialAdminTags;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return initialAdminTags;
  } catch (err) {
    console.error('Failed to read tags from cache:', err);
    return initialAdminTags;
  }
}

function updateLocalCache(tags: AdminTag[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tags));
    window.dispatchEvent(new CustomEvent(TAGS_UPDATED_EVENT, { detail: tags }));
  } catch (err) {
    console.error('Failed to save tags to cache:', err);
  }
}

function initRealtimeSync() {
  if (typeof window === 'undefined' || isSubscribed) return;
  isSubscribed = true;

  firestoreTagRepository.subscribe(
    (cloudTags) => {
      if (cloudTags && cloudTags.length > 0) {
        inMemoryTags = cloudTags;
        updateLocalCache(cloudTags);
      }
    },
    (err) => {
      console.warn('[tagAdminStore] Firestore subscription fallback to local cache:', err);
    }
  );
}

initRealtimeSync();

/**
 * Normalizes text for matching comparison
 */
function normalizeString(val?: string): string {
  return (val || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]/g, '');
}

/**
 * Generates an SEO-compliant, URL-friendly slug from tag name
 */
export function generateTagSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Reads all tags from SSoT in-memory cache
 */
export function getStoredTags(): AdminTag[] {
  if (inMemoryTags && inMemoryTags.length > 0) {
    return inMemoryTags;
  }
  return loadLocalCache();
}

/**
 * Force refresh from Firestore
 */
export async function refreshTagsFromFirestore(): Promise<AdminTag[]> {
  try {
    const tags = await firestoreTagRepository.getAll();
    if (tags && tags.length > 0) {
      inMemoryTags = tags;
      updateLocalCache(tags);
      return tags;
    }
  } catch (err) {
    console.warn('[tagAdminStore] Failed to fetch tags from Firestore:', err);
  }
  return getStoredTags();
}

/**
 * Saves tags array
 */
export function saveStoredTags(tags: AdminTag[]): void {
  inMemoryTags = tags;
  updateLocalCache(tags);
}

/**
 * Checks if a slug is unique among tags
 */
export function isTagSlugUnique(slug: string, excludeId?: string): boolean {
  const cleanSlug = generateTagSlug(slug);
  const tags = getStoredTags();
  return !tags.some((t) => t.slug === cleanSlug && t.id !== excludeId);
}

export interface TagUsageItem {
  id: string;
  title: string;
  type: 'news' | 'video';
  slug?: string;
}

/**
 * Computes live usage of a tag across news articles and video items
 */
export function calculateTagUsage(tag: AdminTag): {
  newsCount: number;
  videoCount: number;
  totalCount: number;
  usedInItems: TagUsageItem[];
} {
  const articles = getStoredArticles();
  const videos = getStoredVideos();
  const usedInItems: TagUsageItem[] = [];

  const targetNameNorm = normalizeString(tag.name);
  const targetSlugNorm = normalizeString(tag.slug);

  // 1. Match in News Articles
  articles.forEach((art) => {
    if (Array.isArray(art.tags)) {
      const isMatched = art.tags.some((t) => {
        const tNorm = normalizeString(t);
        return (
          tNorm === targetNameNorm ||
          tNorm === targetSlugNorm ||
          generateTagSlug(t) === tag.slug
        );
      });

      if (isMatched && !usedInItems.some((ex) => ex.id === art.id)) {
        usedInItems.push({
          id: art.id,
          title: art.title,
          type: 'news',
          slug: art.slug,
        });
      }
    }
  });

  // 2. Match in Video Items
  videos.forEach((vid) => {
    if (Array.isArray(vid.tags)) {
      const isMatched = vid.tags.some((t) => {
        const tNorm = normalizeString(t);
        return (
          tNorm === targetNameNorm ||
          tNorm === targetSlugNorm ||
          generateTagSlug(t) === tag.slug
        );
      });

      if (isMatched && !usedInItems.some((ex) => ex.id === vid.id)) {
        usedInItems.push({
          id: vid.id,
          title: vid.title,
          type: 'video',
          slug: vid.slug,
        });
      }
    }
  });

  const newsCount = usedInItems.filter((i) => i.type === 'news').length;
  const videoCount = usedInItems.filter((i) => i.type === 'video').length;

  return {
    newsCount,
    videoCount,
    totalCount: usedInItems.length,
    usedInItems,
  };
}

/**
 * Returns all tags enriched with real-time news & video usage counts
 */
export function getTagsWithCounts(): AdminTag[] {
  const rawTags = getStoredTags();
  return rawTags.map((tag) => {
    const { newsCount, videoCount, totalCount } = calculateTagUsage(tag);
    return {
      ...tag,
      newsCount,
      videoCount,
      totalCount,
    };
  });
}

/**
 * Gets a single tag by ID with computed usage counts
 */
export function getTagById(id: string): AdminTag | undefined {
  const tags = getTagsWithCounts();
  return tags.find((t) => t.id === id);
}

/**
 * Gets a single tag by Slug with computed usage counts
 */
export function getTagBySlug(slug: string): AdminTag | undefined {
  const cleanSlug = generateTagSlug(slug);
  const tags = getTagsWithCounts();
  return tags.find((t) => t.slug === cleanSlug);
}

/**
 * Adds a new tag with validation (Writes to Firestore & Cache)
 */
export function addTag(data: {
  name: string;
  slug?: string;
  contentTypes: TagContentType[];
  status: TagStatus;
  seoTitle?: string;
  metaDescription?: string;
}): { success: boolean; error?: string; tag?: AdminTag } {
  const trimmedName = (data.name || '').trim();
  if (!trimmedName) {
    return { success: false, error: 'Nama tag wajib diisi.' };
  }

  const generatedSlug = generateTagSlug(data.slug || trimmedName);
  if (!generatedSlug) {
    return { success: false, error: 'Slug tag tidak valid.' };
  }

  if (!isTagSlugUnique(generatedSlug)) {
    return {
      success: false,
      error: `Slug "${generatedSlug}" sudah digunakan oleh tag lain. Harap gunakan slug yang unik.`,
    };
  }

  if (!data.contentTypes || data.contentTypes.length === 0) {
    return {
      success: false,
      error: 'Pilih minimal satu tipe konten (Berita atau Video).',
    };
  }

  const now = new Date().toISOString();
  const newTag: AdminTag = {
    id: `tag-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    name: trimmedName,
    slug: generatedSlug,
    contentTypes: data.contentTypes,
    status: data.status || 'active',
    seoTitle: data.seoTitle?.trim() || `${trimmedName} | BatuTV`,
    metaDescription:
      data.metaDescription?.trim() ||
      `Kumpulan berita dan informasi terkini seputar topik ${trimmedName} di BatuTV.`,
    createdAt: now,
    updatedAt: now,
  };

  const currentTags = getStoredTags();
  const updatedTags = [newTag, ...currentTags];
  inMemoryTags = updatedTags;
  updateLocalCache(updatedTags);

  // Async persist to Firestore
  firestoreTagRepository.create(newTag).catch((err) => {
    console.warn('[tagAdminStore] Firestore async create error:', err);
  });

  return { success: true, tag: newTag };
}

/**
 * Updates an existing tag with validation (Writes to Firestore & Cache)
 */
export function updateTag(
  id: string,
  data: Partial<{
    name: string;
    slug: string;
    contentTypes: TagContentType[];
    status: TagStatus;
    seoTitle: string;
    metaDescription: string;
  }>
): { success: boolean; error?: string; tag?: AdminTag } {
  const currentTags = getStoredTags();
  const index = currentTags.findIndex((t) => t.id === id);

  if (index === -1) {
    return { success: false, error: 'Tag tidak ditemukan.' };
  }

  const existing = currentTags[index];
  const newName = data.name !== undefined ? data.name.trim() : existing.name;
  if (!newName) {
    return { success: false, error: 'Nama tag tidak boleh kosong.' };
  }

  let newSlug = existing.slug;
  if (data.slug !== undefined) {
    newSlug = generateTagSlug(data.slug);
    if (!newSlug) {
      return { success: false, error: 'Slug tag tidak valid.' };
    }
    if (!isTagSlugUnique(newSlug, id)) {
      return {
        success: false,
        error: `Slug "${newSlug}" sudah digunakan oleh tag lain.`,
      };
    }
  }

  const newContentTypes =
    data.contentTypes !== undefined ? data.contentTypes : existing.contentTypes;
  if (!newContentTypes || newContentTypes.length === 0) {
    return {
      success: false,
      error: 'Pilih minimal satu tipe konten (Berita atau Video).',
    };
  }

  const updatedTag: AdminTag = {
    ...existing,
    name: newName,
    slug: newSlug,
    contentTypes: newContentTypes,
    status: data.status !== undefined ? data.status : existing.status,
    seoTitle:
      data.seoTitle !== undefined
        ? data.seoTitle.trim()
        : existing.seoTitle || `${newName} | BatuTV`,
    metaDescription:
      data.metaDescription !== undefined
        ? data.metaDescription.trim()
        : existing.metaDescription ||
          `Kumpulan berita dan informasi terkini seputar topik ${newName} di BatuTV.`,
    updatedAt: new Date().toISOString(),
  };

  currentTags[index] = updatedTag;
  inMemoryTags = [...currentTags];
  updateLocalCache(inMemoryTags);

  // Async persist to Firestore
  firestoreTagRepository.update(id, updatedTag).catch((err) => {
    console.warn('[tagAdminStore] Firestore async update error:', err);
  });

  return { success: true, tag: updatedTag };
}

/**
 * Deletes a tag with delete guard for used items
 */
export function deleteTag(id: string): { success: boolean; error?: string } {
  const tags = getStoredTags();
  const tagToDelete = tags.find((t) => t.id === id);

  if (!tagToDelete) {
    return { success: false, error: 'Tag tidak ditemukan.' };
  }

  // Check live usage
  const { totalCount, newsCount, videoCount } = calculateTagUsage(tagToDelete);

  if (totalCount > 0) {
    return {
      success: false,
      error: `Tag "${tagToDelete.name}" sedang digunakan oleh ${totalCount} konten (${newsCount} Berita, ${videoCount} Video). Tag tidak dapat dihapus langsung untuk mencegah kerusakan relasi konten. Silakan nonaktifkan tag atau lepaskan relasi pada konten terlebih dahulu.`,
    };
  }

  const filtered = tags.filter((t) => t.id !== id);
  inMemoryTags = filtered;
  updateLocalCache(filtered);

  // Async delete from Firestore
  firestoreTagRepository.delete(id).catch((err) => {
    console.warn('[tagAdminStore] Firestore async delete error:', err);
  });

  return { success: true };
}

/**
 * Bulk updates the status of multiple tags
 */
export function bulkUpdateTagStatus(
  ids: string[],
  status: TagStatus
): { success: boolean; updatedCount: number } {
  const currentTags = getStoredTags();
  let updatedCount = 0;
  const now = new Date().toISOString();

  const updated = currentTags.map((tag) => {
    if (ids.includes(tag.id)) {
      updatedCount++;
      return {
        ...tag,
        status,
        updatedAt: now,
      };
    }
    return tag;
  });

  inMemoryTags = updated;
  updateLocalCache(updated);

  firestoreTagRepository.bulkUpdateStatus(ids, status).catch((err) => {
    console.warn('[tagAdminStore] Firestore async bulkUpdateStatus error:', err);
  });

  return { success: true, updatedCount };
}

/**
 * Gets high level stats for Tag dashboard
 */
export function getStoredTagCounts() {
  const tags = getTagsWithCounts();
  const total = tags.length;
  const active = tags.filter((t) => t.status === 'active').length;
  const inactive = tags.filter((t) => t.status === 'inactive').length;
  const bothContentTypes = tags.filter(
    (t) => t.contentTypes.includes('news') && t.contentTypes.includes('video')
  ).length;
  const newsOnly = tags.filter(
    (t) => t.contentTypes.includes('news') && !t.contentTypes.includes('video')
  ).length;
  const videoOnly = tags.filter(
    (t) => !t.contentTypes.includes('news') && t.contentTypes.includes('video')
  ).length;
  const totalConnectedContent = tags.reduce((acc, t) => acc + (t.totalCount || 0), 0);

  return {
    total,
    active,
    inactive,
    bothContentTypes,
    newsOnly,
    videoOnly,
    totalConnectedContent,
  };
}

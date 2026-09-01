import { AdminAuthor, AuthorPosition, AuthorStatus } from '../types/admin';
import { initialAdminAuthors } from './authorAdminDummyData';
import { getStoredArticles } from './newsAdminStore';
import { getStoredVideos } from './videoAdminStore';
import { firestoreAuthorRepository } from '../repositories/firestore/firestoreAuthorRepository';

const STORAGE_KEY = 'batutv_admin_authors_v1';
export const AUTHORS_UPDATED_EVENT = 'batutv_authors_updated';

// In-Memory state for instant UI rendering & synchronization
let inMemoryAuthors: AdminAuthor[] = loadLocalCache();
let isSubscribed = false;

function loadLocalCache(): AdminAuthor[] {
  if (typeof window === 'undefined') {
    return initialAdminAuthors;
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initialAdminAuthors));
      return initialAdminAuthors;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return initialAdminAuthors;
  } catch (err) {
    console.error('Error reading batutv_admin_authors from cache:', err);
    return initialAdminAuthors;
  }
}

function updateLocalCache(authors: AdminAuthor[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(authors));
    window.dispatchEvent(new CustomEvent(AUTHORS_UPDATED_EVENT, { detail: authors }));
  } catch (err) {
    console.error('Error saving batutv_admin_authors to cache:', err);
  }
}

function initRealtimeSync() {
  if (typeof window === 'undefined' || isSubscribed) return;
  isSubscribed = true;

  firestoreAuthorRepository.subscribe(
    (cloudAuthors) => {
      if (cloudAuthors && cloudAuthors.length > 0) {
        inMemoryAuthors = cloudAuthors;
        updateLocalCache(cloudAuthors);
      }
    },
    (err) => {
      console.warn('[authorAdminStore] Firestore subscription fallback to local cache:', err);
    }
  );
}

initRealtimeSync();

/**
 * Retrieve author list from memory state
 */
export function getStoredAuthors(): AdminAuthor[] {
  if (inMemoryAuthors && inMemoryAuthors.length > 0) {
    return inMemoryAuthors;
  }
  return loadLocalCache();
}

/**
 * Force refresh from Firestore
 */
export async function refreshAuthorsFromFirestore(): Promise<AdminAuthor[]> {
  try {
    const authors = await firestoreAuthorRepository.getAll();
    if (authors && authors.length > 0) {
      inMemoryAuthors = authors;
      updateLocalCache(authors);
      return authors;
    }
  } catch (err) {
    console.warn('[authorAdminStore] Failed to fetch authors from Firestore:', err);
  }
  return getStoredAuthors();
}

/**
 * Save array of authors
 */
export function saveStoredAuthors(authors: AdminAuthor[]): void {
  inMemoryAuthors = authors;
  updateLocalCache(authors);
}

/**
 * Generates an SEO & URL compliant slug for author
 */
export function generateAuthorSlug(name: string, excludeId?: string): string {
  const base = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

  let slug = base;
  let counter = 1;
  const existing = getStoredAuthors();

  while (existing.some((a) => a.slug === slug && a.id !== excludeId)) {
    slug = `${base}-${counter}`;
    counter++;
  }

  return slug;
}

/**
 * Basic Email validation helper
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Resolve photo URL with fallback
 */
export function resolveAuthorPhoto(author: AdminAuthor): string {
  if (author.photoUrl && author.photoUrl.trim() !== '') {
    return author.photoUrl;
  }
  if (author.photoMediaId) {
    try {
      const mediaRaw = localStorage.getItem('batutv_admin_media_v1');
      if (mediaRaw) {
        const mediaList = JSON.parse(mediaRaw);
        const item = mediaList.find((m: any) => m.id === author.photoMediaId);
        if (item && item.url) return item.url;
      }
    } catch {
      // ignore
    }
  }
  return 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80';
}

/**
 * Calculate dynamic usage count of an author in News & Video stores
 */
export function calculateAuthorUsage(author: AdminAuthor) {
  const articles = getStoredArticles();
  const videos = getStoredVideos();

  const authorNameNorm = author.name.trim().toLowerCase();

  // News matching by authorId OR author name
  const linkedArticles = articles.filter((a) => {
    if (a.status === 'trash') return false;
    if (a.authorId && a.authorId === author.id) return true;
    const aAuthor = (a.author || '').trim().toLowerCase();
    return aAuthor === authorNameNorm || aAuthor.includes(authorNameNorm);
  });

  // Video matching by authorId OR author name
  const linkedVideos = videos.filter((v) => {
    if (v.status === 'trash') return false;
    if (v.authorId && v.authorId === author.id) return true;
    const vAuthor = (v.author || '').trim().toLowerCase();
    return vAuthor === authorNameNorm || vAuthor.includes(authorNameNorm);
  });

  const dynamicNewsCount = linkedArticles.length;
  const dynamicVideoCount = linkedVideos.length;

  const finalNewsCount = Math.max(author.newsCount ?? 0, dynamicNewsCount);
  const finalVideoCount = Math.max(author.videoCount ?? 0, dynamicVideoCount);

  return {
    newsCount: finalNewsCount,
    videoCount: finalVideoCount,
    totalCount: finalNewsCount + finalVideoCount,
    linkedArticles,
    linkedVideos,
  };
}

/**
 * Get all authors with calculated live usage counts
 */
export function getAuthorsWithCounts(): AdminAuthor[] {
  const authors = getStoredAuthors();
  return authors.map((author) => {
    const usage = calculateAuthorUsage(author);
    return {
      ...author,
      photoUrl: resolveAuthorPhoto(author),
      newsCount: usage.newsCount,
      videoCount: usage.videoCount,
      totalCount: usage.totalCount,
    };
  });
}

/**
 * Get active authors only for News & Video creation dropdowns
 */
export function getActiveAuthors(): AdminAuthor[] {
  const authors = getAuthorsWithCounts();
  return authors.filter((a) => a.status === 'active');
}

/**
 * Get single author by ID
 */
export function getAuthorById(id: string): AdminAuthor | undefined {
  const list = getAuthorsWithCounts();
  return list.find((a) => a.id === id);
}

/**
 * Get single author by Slug
 */
export function getAuthorBySlug(slug: string): AdminAuthor | undefined {
  const list = getAuthorsWithCounts();
  return list.find((a) => a.slug === slug || a.id === slug);
}

/**
 * Add a new author (Writes to Firestore & Cache)
 */
export function addAuthor(data: {
  name: string;
  slug?: string;
  photoMediaId?: string;
  photoUrl?: string;
  position: AuthorPosition;
  email: string;
  phone?: string;
  bio?: string;
  status?: AuthorStatus;
  seoTitle?: string;
  metaDescription?: string;
}): { success: boolean; author?: AdminAuthor; error?: string } {
  const trimmedName = data.name?.trim();
  if (!trimmedName) {
    return { success: false, error: 'Nama lengkap penulis wajib diisi.' };
  }

  const trimmedEmail = data.email?.trim();
  if (!trimmedEmail) {
    return { success: false, error: 'Alamat email penulis wajib diisi.' };
  }
  if (!validateEmail(trimmedEmail)) {
    return {
      success: false,
      error: 'Format email tidak valid. Gunakan format yang benar seperti nama@batutv.id',
    };
  }

  if (data.bio && data.bio.length > 300) {
    return {
      success: false,
      error: `Panjang bio melebihi batas maksimal 300 karakter (${data.bio.length}/300).`,
    };
  }

  const slug = data.slug?.trim() ? generateAuthorSlug(data.slug) : generateAuthorSlug(trimmedName);

  const existingAuthors = getStoredAuthors();
  if (existingAuthors.some((a) => a.slug === slug)) {
    return {
      success: false,
      error: `Slug "${slug}" sudah digunakan oleh penulis lain. Silakan gunakan slug unik.`,
    };
  }

  const now = new Date().toISOString();
  const newAuthor: AdminAuthor = {
    id: `aut-${Date.now()}`,
    name: trimmedName,
    slug,
    photoMediaId: data.photoMediaId || undefined,
    photoUrl: data.photoUrl || undefined,
    position: data.position || 'Reporter',
    email: trimmedEmail,
    phone: data.phone?.trim() || undefined,
    bio: data.bio?.trim() || undefined,
    status: data.status || 'active',
    newsCount: 0,
    videoCount: 0,
    totalCount: 0,
    seoTitle: data.seoTitle?.trim() || `Profil & Berita Karya ${trimmedName} - BatuTV`,
    metaDescription:
      data.metaDescription?.trim() ||
      `Kumpulan artikel berita dan liputan video oleh ${trimmedName} (${data.position || 'Reporter'}) di portal resmi BatuTV.`,
    createdAt: now,
    updatedAt: now,
  };

  const updatedList = [newAuthor, ...existingAuthors];
  inMemoryAuthors = updatedList;
  updateLocalCache(updatedList);

  // Async persist to Firestore
  firestoreAuthorRepository.create(newAuthor).catch((err) => {
    console.warn('[authorAdminStore] Firestore async create error:', err);
  });

  return { success: true, author: newAuthor };
}

/**
 * Update an existing author (Writes to Firestore & Cache)
 */
export function updateAuthor(
  id: string,
  data: Partial<AdminAuthor>
): { success: boolean; author?: AdminAuthor; error?: string } {
  const existingAuthors = getStoredAuthors();
  const authorIndex = existingAuthors.findIndex((a) => a.id === id);

  if (authorIndex === -1) {
    return { success: false, error: 'Data penulis tidak ditemukan.' };
  }

  const current = existingAuthors[authorIndex];

  if (data.name !== undefined) {
    if (!data.name.trim()) {
      return { success: false, error: 'Nama penulis tidak boleh kosong.' };
    }
  }

  if (data.email !== undefined) {
    if (!data.email.trim()) {
      return { success: false, error: 'Alamat email tidak boleh kosong.' };
    }
    if (!validateEmail(data.email)) {
      return {
        success: false,
        error: 'Format email tidak valid. Gunakan format yang benar seperti nama@batutv.id',
      };
    }
  }

  if (data.bio && data.bio.length > 300) {
    return {
      success: false,
      error: `Panjang bio melebihi batas maksimal 300 karakter (${data.bio.length}/300).`,
    };
  }

  let finalSlug = current.slug;
  if (data.slug && data.slug.trim() !== current.slug) {
    const candidateSlug = generateAuthorSlug(data.slug.trim(), id);
    if (existingAuthors.some((a) => a.id !== id && a.slug === candidateSlug)) {
      return {
        success: false,
        error: `Slug "${candidateSlug}" sudah digunakan oleh penulis lain.`,
      };
    }
    finalSlug = candidateSlug;
  }

  const updatedAuthor: AdminAuthor = {
    ...current,
    ...data,
    name: data.name !== undefined ? data.name.trim() : current.name,
    slug: finalSlug,
    email: data.email !== undefined ? data.email.trim() : current.email,
    phone: data.phone !== undefined ? data.phone.trim() : current.phone,
    bio: data.bio !== undefined ? data.bio.trim() : current.bio,
    updatedAt: new Date().toISOString(),
  };

  existingAuthors[authorIndex] = updatedAuthor;
  inMemoryAuthors = [...existingAuthors];
  updateLocalCache(inMemoryAuthors);

  // Async persist to Firestore
  firestoreAuthorRepository.update(id, updatedAuthor).catch((err) => {
    console.warn('[authorAdminStore] Firestore async update error:', err);
  });

  return { success: true, author: updatedAuthor };
}

/**
 * Check if an author is linked to a CMS Login User account
 */
export function getAuthorLinkedUser(authorId: string): {
  id: string;
  username: string;
  role: string;
  status: string;
} | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem('batutv_cms_users');
    if (!raw) return null;
    const users = JSON.parse(raw);
    if (Array.isArray(users)) {
      const found = users.find((u: any) => u.authorId === authorId);
      if (found) {
        return {
          id: found.id,
          username: found.username,
          role: found.role,
          status: found.status,
        };
      }
    }
  } catch (err) {
    console.error('Error finding linked user for author:', err);
  }
  return null;
}

/**
 * Delete an author with DELETE PROTECTION (Content Usage & CMS Account Link)
 */
export function deleteAuthor(id: string): {
  success: boolean;
  error?: string;
  isProtected?: boolean;
  isLinkedToCMS?: boolean;
  linkedUsername?: string;
  linkedRole?: string;
  usageCount?: number;
} {
  const existingAuthors = getStoredAuthors();
  const target = existingAuthors.find((a) => a.id === id);

  if (!target) {
    return { success: false, error: 'Penulis tidak ditemukan.' };
  }

  // 1. Check if linked to an active CMS user account
  const linkedUser = getAuthorLinkedUser(id);
  if (linkedUser) {
    return {
      success: false,
      isProtected: true,
      isLinkedToCMS: true,
      linkedUsername: linkedUser.username,
      linkedRole: linkedUser.role,
      error: `Penulis ini terhubung dengan akun CMS (@${linkedUser.username} - Role: ${linkedUser.role.toUpperCase()}). Putuskan relasi atau hapus akun CMS terlebih dahulu sebelum menghapus master data penulis.`,
    };
  }

  // 2. Calculate content usage count
  const usage = calculateAuthorUsage(target);

  if (usage.totalCount > 0) {
    return {
      success: false,
      isProtected: true,
      usageCount: usage.totalCount,
      error: `Penulis masih digunakan oleh ${usage.totalCount} konten (${usage.newsCount} Berita, ${usage.videoCount} Video). Tidak dapat dihapus secara permanen.`,
    };
  }

  const filtered = existingAuthors.filter((a) => a.id !== id);
  inMemoryAuthors = filtered;
  updateLocalCache(filtered);

  // Async delete from Firestore
  firestoreAuthorRepository.delete(id).catch((err) => {
    console.warn('[authorAdminStore] Firestore async delete error:', err);
  });

  return { success: true };
}

/**
 * Get summary counts for metrics dashboard
 */
export function getStoredAuthorCounts() {
  const list = getAuthorsWithCounts();
  return {
    all: list.length,
    active: list.filter((a) => a.status === 'active').length,
    inactive: list.filter((a) => a.status === 'inactive').length,
    reporter: list.filter((a) => a.position === 'Reporter').length,
    editor: list.filter((a) => a.position === 'Editor').length,
    redaksi: list.filter((a) => a.position === 'Redaksi').length,
    kontributor: list.filter((a) => a.position === 'Kontributor').length,
    totalContent: list.reduce((acc, a) => acc + (a.totalCount || 0), 0),
  };
}

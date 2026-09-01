import { AdminMedia, MediaUsageReference } from '../types/admin';
import { initialAdminMedia } from './mediaAdminDummyData';
import { getStoredArticles } from './newsAdminStore';
import { getStoredVideos } from './videoAdminStore';
import { firestoreMediaRepository } from '../repositories/firestore/firestoreMediaRepository';

const STORAGE_KEY = 'batutv_admin_media_v1';
export const MEDIA_UPDATED_EVENT = 'batutv_media_updated';

// In-Memory state for instant UI rendering & synchronization
let inMemoryMedia: AdminMedia[] = loadLocalCache();
let isSubscribed = false;

function loadLocalCache(): AdminMedia[] {
  if (typeof window === 'undefined') {
    return initialAdminMedia;
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    let list: AdminMedia[] = [];
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        list = parsed;
        const logoAsset = initialAdminMedia.find((m) => m.id === 'med-logo-001');
        if (logoAsset && !list.some((m) => m.id === 'med-logo-001' || m.filename === 'batutv-logo.svg')) {
          list = [logoAsset, ...list];
        }
      }
    }
    if (list.length === 0) {
      list = initialAdminMedia;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initialAdminMedia));
    }
    return list;
  } catch (e) {
    console.warn('Failed to read media from cache:', e);
    return initialAdminMedia;
  }
}

function updateLocalCache(mediaList: AdminMedia[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(mediaList));
    window.dispatchEvent(new CustomEvent(MEDIA_UPDATED_EVENT, { detail: mediaList }));
  } catch (e) {
    console.warn('Failed to save media to cache:', e);
  }
}

function initRealtimeSync() {
  if (typeof window === 'undefined' || isSubscribed) return;
  isSubscribed = true;

  firestoreMediaRepository.subscribe(
    (cloudMedia) => {
      if (cloudMedia && cloudMedia.length > 0) {
        inMemoryMedia = cloudMedia;
        updateLocalCache(cloudMedia);
      }
    },
    (err) => {
      console.warn('[mediaAdminStore] Firestore subscription fallback to local cache:', err);
    }
  );
}

initRealtimeSync();

/**
 * Generate standard responsive dimension variations from base URL
 */
export function generateUrlVariations(url: string, origWidth: number = 1200, origHeight: number = 800) {
  const isUnsplash = url.includes('unsplash.com');
  const isBatuAsset = url.startsWith('/brand/') || url.startsWith('/batutv-logo');

  if (isBatuAsset) {
    return {
      thumbnail: url,
      medium: url,
      large: url,
      original: url,
    };
  }

  if (isUnsplash) {
    const baseUrl = url.split('?')[0];
    return {
      thumbnail: `${baseUrl}?w=300&h=200&fit=crop&auto=format&q=75`,
      medium: `${baseUrl}?w=768&h=512&fit=crop&auto=format&q=80`,
      large: `${baseUrl}?w=1200&h=800&fit=crop&auto=format&q=85`,
      original: `${baseUrl}?w=${origWidth}&h=${origHeight}&fit=max&auto=format&q=90`,
    };
  }

  return {
    thumbnail: url,
    medium: url,
    large: url,
    original: url,
  };
}

/**
 * Dynamic calculation of media asset usage across News & Video articles
 */
export function calculateMediaUsage(media: AdminMedia): {
  count: number;
  newsCount: number;
  videoCount: number;
  items: MediaUsageReference[];
} {
  const articles = getStoredArticles();
  const videos = getStoredVideos();
  const usageItems: MediaUsageReference[] = [];

  const mediaId = media.id;
  const mediaUrl = media.url ? media.url.toLowerCase().trim() : '';
  const mediaFilename = media.filename ? media.filename.toLowerCase().trim() : '';

  // 1. Check in News articles
  articles.forEach((art) => {
    const artImg = ((art as any).image || art.featuredImage || '').toLowerCase().trim();
    const artContent = (art.content || '').toLowerCase();

    // Check featured image match
    const isFeaturedMatched =
      (mediaUrl && artImg.includes(mediaUrl.split('?')[0])) ||
      (artImg && mediaUrl.includes(artImg.split('?')[0])) ||
      (art.id && media.usedIn?.some((u) => u.id === art.id && u.field?.includes('Featured')));

    if (isFeaturedMatched) {
      usageItems.push({
        id: art.id,
        title: art.title,
        type: 'news',
        slug: art.slug,
        field: 'Featured Image Berita',
      });
    }

    // Check in-article content body (inserted via Naskah Editor)
    const isContentMatched =
      (mediaId && artContent.includes(`data-media-id="${mediaId.toLowerCase()}"`)) ||
      (mediaUrl && artContent.includes(mediaUrl.split('?')[0])) ||
      (mediaFilename && artContent.includes(mediaFilename));

    if (isContentMatched && !usageItems.some((u) => u.id === art.id && u.field?.includes('Naskah'))) {
      usageItems.push({
        id: `${art.id}-content`,
        title: art.title,
        type: 'news',
        slug: art.slug,
        field: 'Naskah Berita (Foto Sisipan)',
      });
    }
  });

  // 2. Check in Video items
  videos.forEach((vid) => {
    const vidCustomThumb = (vid.customThumbnail || '').toLowerCase().trim();
    const isMatched =
      (mediaId && vid.thumbnailMediaId === mediaId) ||
      (mediaUrl && vidCustomThumb.includes(mediaUrl.split('?')[0])) ||
      (vidCustomThumb && mediaUrl.includes(vidCustomThumb.split('?')[0])) ||
      (vid.id && media.usedIn?.some((u) => u.id === vid.id));

    if (isMatched && !usageItems.some((ex) => ex.id === vid.id)) {
      usageItems.push({
        id: vid.id,
        title: vid.title,
        type: 'video',
        slug: vid.slug,
        field: 'Custom Thumbnail Video',
      });
    }
  });

  // 3. Also retain any existing non-news/video usages from dummy data (e.g. banners or logos)
  if (media.usedIn) {
    media.usedIn.forEach((u) => {
      if (!usageItems.some((ex) => ex.id === u.id)) {
        usageItems.push(u);
      }
    });
  }

  const newsCount = usageItems.filter((i) => i.type === 'news').length;
  const videoCount = usageItems.filter((i) => i.type === 'video').length;

  return {
    count: usageItems.length,
    newsCount,
    videoCount,
    items: usageItems,
  };
}

/**
 * Retrieve all media from memory / cache with computed live usage
 */
export function getStoredMedia(): AdminMedia[] {
  const list = inMemoryMedia && inMemoryMedia.length > 0 ? inMemoryMedia : loadLocalCache();

  return list.map((item) => {
    const usage = calculateMediaUsage(item);
    return {
      ...item,
      usageCount: usage.count,
      usedIn: usage.items,
    };
  });
}

/**
 * Force refresh from Firestore
 */
export async function refreshMediaFromFirestore(): Promise<AdminMedia[]> {
  try {
    const mediaList = await firestoreMediaRepository.getAll();
    if (mediaList && mediaList.length > 0) {
      inMemoryMedia = mediaList;
      updateLocalCache(mediaList);
      return getStoredMedia();
    }
  } catch (err) {
    console.warn('[mediaAdminStore] Failed to fetch media from Firestore:', err);
  }
  return getStoredMedia();
}

/**
 * Save media to cache & memory
 */
export function saveStoredMedia(mediaList: AdminMedia[]): void {
  inMemoryMedia = mediaList;
  updateLocalCache(mediaList);
}

/**
 * Get media counts for tabs and statistics
 */
export function getMediaCounts() {
  const mediaList = getStoredMedia();
  return {
    total: mediaList.length,
    images: mediaList.filter((m) => m.mediaType === 'image').length,
    documents: mediaList.filter((m) => m.mediaType === 'document').length,
    used: mediaList.filter((m) => (m.usageCount || 0) > 0).length,
    unused: mediaList.filter((m) => (m.usageCount || 0) === 0).length,
    totalSizeBytes: mediaList.reduce((acc, curr) => acc + (curr.fileSize || 0), 0),
  };
}

/**
 * Get single media by ID
 */
export function getMediaById(id: string): AdminMedia | undefined {
  const list = getStoredMedia();
  return list.find((m) => m.id === id);
}

/**
 * Get single media by Filename
 */
export function getMediaByFilename(filename: string): AdminMedia | undefined {
  const list = getStoredMedia();
  return list.find((m) => m.filename.toLowerCase() === filename.toLowerCase());
}

/**
 * Sanitize filename to lowercase, hyphenated SEO format
 */
export function sanitizeFilename(name: string): string {
  const parts = name.split('.');
  const ext = parts.length > 1 ? parts.pop() : '';
  const base = parts.join('.');

  const cleanBase = base
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9-_]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');

  return ext ? `${cleanBase || 'media-asset'}.${ext.toLowerCase()}` : cleanBase || 'media-asset';
}

/**
 * Create a new Media item (Writes to Firestore & Cache)
 */
export function createMedia(
  mediaData: Omit<AdminMedia, 'id' | 'createdAt' | 'updatedAt' | 'usageCount' | 'usedIn'>
): { success: boolean; message: string; media?: AdminMedia } {
  const list = inMemoryMedia;

  // Validate URL
  if (!mediaData.url || !mediaData.url.trim()) {
    return { success: false, message: 'URL gambar tidak boleh kosong' };
  }

  // Sanitize filename
  const cleanFilename = sanitizeFilename(mediaData.filename || 'media-foto.jpg');

  // Check unique filename
  const isDuplicate = list.some((m) => m.filename.toLowerCase() === cleanFilename.toLowerCase());
  const finalFilename = isDuplicate
    ? `${cleanFilename.replace(/\.[^/.]+$/, '')}-${Date.now().toString().slice(-4)}.${mediaData.extension || 'jpg'}`
    : cleanFilename;

  const newId = `med-${Date.now().toString().slice(-6)}`;
  const now = new Date().toISOString();

  const newMedia: AdminMedia = {
    id: newId,
    filename: finalFilename,
    originalName: mediaData.originalName || finalFilename,
    mimeType: mediaData.mimeType || 'image/jpeg',
    extension: mediaData.extension || 'jpg',
    mediaType: mediaData.mediaType || 'image',
    width: mediaData.width || 1200,
    height: mediaData.height || 800,
    fileSize: mediaData.fileSize || 450000,
    altText: mediaData.altText || finalFilename.replace(/[-_.]/g, ' '),
    caption: mediaData.caption || '',
    description: mediaData.description || '',
    url: mediaData.url,
    sizes: mediaData.sizes && mediaData.sizes.thumbnail
      ? mediaData.sizes
      : generateUrlVariations(mediaData.url, mediaData.width || 1920, mediaData.height || 1080),
    usageCount: 0,
    usedIn: [],
    createdAt: now,
    updatedAt: now,
  };

  const updatedList = [newMedia, ...list];
  inMemoryMedia = updatedList;
  updateLocalCache(updatedList);

  // Async persist to Firestore
  firestoreMediaRepository.create(newMedia).catch((err) => {
    console.warn('[mediaAdminStore] Firestore async create error:', err);
  });

  return {
    success: true,
    message: 'Media berhasil diunggah ke pustaka aset',
    media: newMedia,
  };
}

/**
 * Update media metadata (Writes to Firestore & Cache)
 */
export function updateMedia(
  id: string,
  updates: Partial<Pick<AdminMedia, 'filename' | 'altText' | 'caption' | 'description'>>
): { success: boolean; message: string; media?: AdminMedia } {
  const list = inMemoryMedia;
  const index = list.findIndex((m) => m.id === id);

  if (index === -1) {
    return { success: false, message: 'Media tidak ditemukan' };
  }

  const existing = list[index];

  // If filename updated, sanitize and check uniqueness
  let updatedFilename = existing.filename;
  if (updates.filename && updates.filename.trim() !== existing.filename) {
    const clean = sanitizeFilename(updates.filename.trim());
    const isDuplicate = list.some((m) => m.id !== id && m.filename.toLowerCase() === clean.toLowerCase());
    if (isDuplicate) {
      return { success: false, message: `Nama file "${clean}" sudah digunakan media lain` };
    }
    updatedFilename = clean;
  }

  const updatedMedia: AdminMedia = {
    ...existing,
    filename: updatedFilename,
    altText: updates.altText !== undefined ? updates.altText : existing.altText,
    caption: updates.caption !== undefined ? updates.caption : existing.caption,
    description: updates.description !== undefined ? updates.description : existing.description,
    updatedAt: new Date().toISOString(),
  };

  list[index] = updatedMedia;
  inMemoryMedia = [...list];
  updateLocalCache(inMemoryMedia);

  // Async persist to Firestore
  firestoreMediaRepository.update(id, updatedMedia).catch((err) => {
    console.warn('[mediaAdminStore] Firestore async update error:', err);
  });

  return {
    success: true,
    message: 'Metadata media berhasil diperbarui',
    media: updatedMedia,
  };
}

/**
 * Delete media permanently with protection guard
 */
export function deleteMedia(id: string): { success: boolean; message: string; media?: AdminMedia } {
  const list = inMemoryMedia;
  const media = list.find((m) => m.id === id);

  if (!media) {
    return { success: false, message: 'Media tidak ditemukan' };
  }

  // Calculate live usage
  const usage = calculateMediaUsage(media);
  if (usage.count > 0) {
    return {
      success: false,
      message: `Media "${media.filename}" sedang digunakan oleh ${usage.count} konten dan tidak boleh dihapus secara permanen.`,
      media: {
        ...media,
        usageCount: usage.count,
        usedIn: usage.items,
      },
    };
  }

  const filtered = list.filter((m) => m.id !== id);
  inMemoryMedia = filtered;
  updateLocalCache(filtered);

  // Async delete from Firestore
  firestoreMediaRepository.delete(id).catch((err) => {
    console.warn('[mediaAdminStore] Firestore async delete error:', err);
  });

  return {
    success: true,
    message: `Media "${media.filename}" berhasil dihapus permanen`,
    media,
  };
}

/**
 * Format bytes into human readable string
 */
export function formatBytes(bytes: number, decimals: number = 2): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

/**
 * Format dimensions (e.g. 1920 × 1080 px)
 */
export function formatDimensions(width: number, height: number): string {
  if (!width || !height) return '-';
  return `${width} × ${height} px`;
}

/**
 * Get aspect ratio label (e.g. 16:9, 4:3, 1:1)
 */
export function getAspectRatioLabel(width: number, height: number, mediaType?: string): string {
  if (mediaType && mediaType !== 'image') return mediaType.toUpperCase();
  if (!width || !height) return '-';
  const ratio = width / height;
  if (Math.abs(ratio - 16 / 9) < 0.05) return '16:9 (Landscape HD)';
  if (Math.abs(ratio - 4 / 3) < 0.05) return '4:3 (Standar)';
  if (Math.abs(ratio - 1) < 0.05) return '1:1 (Persegi)';
  if (Math.abs(ratio - 9 / 16) < 0.05) return '9:16 (Story / Reel)';
  if (Math.abs(ratio - 3 / 2) < 0.05) return '3:2 (Foto DSLR)';
  return `${ratio.toFixed(2)}:1`;
}

/**
 * Format media creation / update date
 */
export function formatMediaDate(dateStr: string): string {
  if (!dateStr) return '-';
  try {
    const d = new Date(dateStr);
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(d);
  } catch {
    return dateStr;
  }
}


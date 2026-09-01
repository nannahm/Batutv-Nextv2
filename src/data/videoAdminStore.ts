import { AdminVideo, VideoStatus } from '../types/admin';
import { initialAdminVideos } from './videoAdminDummyData';
import { extractYouTubeVideoId, generateVideoSlug } from '../utils/youtube';
import { getMediaById } from './mediaAdminStore';
import { canRolePublish, canRolePermanentDelete, canRoleTrashPublished } from '../utils/rbac';

const STORAGE_KEY = 'batutv_admin_videos_v1';

/**
 * Helper to safely retrieve videos from localStorage or seed initial dummy data
 */
export function getStoredVideos(): AdminVideo[] {
  if (typeof window === 'undefined') {
    return initialAdminVideos;
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === null) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initialAdminVideos));
      return initialAdminVideos;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed;
    }
    return initialAdminVideos;
  } catch (err) {
    console.error('Error reading batutv_admin_videos from localStorage:', err);
    return initialAdminVideos;
  }
}

/**
 * Save array of videos to localStorage
 */
export function saveVideos(videos: AdminVideo[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(videos));
    window.dispatchEvent(new CustomEvent('batutv_videos_updated'));
  } catch (err) {
    console.error('Error saving batutv_admin_videos to localStorage:', err);
  }
}

/**
 * Get Video by ID
 */
export function getVideoById(id: string): AdminVideo | undefined {
  const list = getStoredVideos();
  return list.find((v) => v.id === id);
}

/**
 * Get Video by Slug
 */
export function getVideoBySlug(slug: string): AdminVideo | undefined {
  const list = getStoredVideos();
  return list.find((v) => v.slug === slug || v.id === slug);
}

/**
 * Insert or Update a Video (with RBAC enforcement)
 */
export function persistVideo(videoInput: AdminVideo, callerRole?: string): AdminVideo[] {
  const list = getStoredVideos();
  const existingIdx = list.findIndex((v) => v.id === videoInput.id);

  // If caller cannot publish and attempts to set 'published' or 'scheduled', coerce to 'draft'
  let targetStatus = videoInput.status;
  if (callerRole && !canRolePublish(callerRole)) {
    if (targetStatus === 'published' || targetStatus === 'scheduled') {
      console.warn(`[RBAC] User with role "${callerRole}" cannot publish video directly. Coerced to draft.`);
      targetStatus = 'draft';
    }
  }

  // Validate or auto-extract YouTube Video ID if missing
  const detectedVideoId = extractYouTubeVideoId(videoInput.youtubeUrl) || videoInput.youtubeVideoId || 'dQw4w9WgXcQ';
  
  // Format slug safely
  const cleanSlug = videoInput.slug ? generateVideoSlug(videoInput.slug) : generateVideoSlug(videoInput.title);

  const normalizedVideo: AdminVideo = {
    ...videoInput,
    status: targetStatus,
    youtubeVideoId: detectedVideoId,
    slug: cleanSlug || `video-${Date.now()}`,
    updatedAt: new Date().toISOString(),
  };

  let updated: AdminVideo[];
  if (existingIdx >= 0) {
    // Update existing
    updated = [...list];
    updated[existingIdx] = normalizedVideo;
  } else {
    // Create new
    updated = [normalizedVideo, ...list];
  }

  saveVideos(updated);
  return updated;
}

/**
 * Move a Video to Trash (with RBAC check)
 */
export function moveVideoToTrash(id: string, callerRole?: string): AdminVideo[] {
  const list = getStoredVideos();
  const target = list.find((v) => v.id === id);
  if (target && target.status === 'published' && callerRole && !canRoleTrashPublished(callerRole)) {
    console.warn(`[RBAC] User with role "${callerRole}" cannot trash published video "${target.title}". Operation blocked.`);
    return list;
  }

  const updated = list.map((v) => {
    if (v.id === id) {
      return {
        ...v,
        status: 'trash' as VideoStatus,
        updatedAt: new Date().toISOString(),
      };
    }
    return v;
  });
  saveVideos(updated);
  return updated;
}

/**
 * Restore Video from Trash (defaults back to draft)
 */
export function restoreVideoFromTrash(id: string): AdminVideo[] {
  const list = getStoredVideos();
  const updated = list.map((v) => {
    if (v.id === id) {
      return {
        ...v,
        status: 'draft' as VideoStatus,
        updatedAt: new Date().toISOString(),
      };
    }
    return v;
  });
  saveVideos(updated);
  return updated;
}

/**
 * Permanently delete a Video (Admin only)
 */
export function deleteVideoPermanently(id: string, callerRole?: string): AdminVideo[] {
  if (callerRole && !canRolePermanentDelete(callerRole)) {
    console.warn(`[RBAC] Unauthorized permanent delete attempted by role "${callerRole}". Operation blocked.`);
    return getStoredVideos();
  }
  const list = getStoredVideos();
  const updated = list.filter((v) => v.id !== id);
  saveVideos(updated);
  return updated;
}

/**
 * Duplicate a video as a new draft
 */
export function duplicateVideo(id: string): { updatedVideos: AdminVideo[]; newVideo?: AdminVideo } {
  const list = getStoredVideos();
  const target = list.find((v) => v.id === id);
  if (!target) return { updatedVideos: list };

  const now = new Date().toISOString();
  const newId = `vid-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  const newSlug = `${target.slug}-salinan-${Math.floor(Math.random() * 1000)}`;

  const newVideo: AdminVideo = {
    ...target,
    id: newId,
    title: `[Salinan] ${target.title}`,
    slug: newSlug,
    status: 'draft',
    publishedAt: now,
    scheduledAt: null,
    createdAt: now,
    updatedAt: now,
    views: 0,
  };

  const updated = [newVideo, ...list];
  saveVideos(updated);
  return { updatedVideos: updated, newVideo };
}

/**
 * Bulk status update for videos (with RBAC enforcement)
 */
export function bulkUpdateVideoStatus(ids: string[], newStatus: VideoStatus, callerRole?: string): AdminVideo[] {
  if (callerRole && newStatus === 'published' && !canRolePublish(callerRole)) {
    console.warn(`[RBAC] User with role "${callerRole}" cannot bulk publish videos. Operation blocked.`);
    return getStoredVideos();
  }
  const list = getStoredVideos();
  const updated = list.map((v) => {
    if (ids.includes(v.id)) {
      return {
        ...v,
        status: newStatus,
        updatedAt: new Date().toISOString(),
      };
    }
    return v;
  });
  saveVideos(updated);
  return updated;
}

/**
 * Bulk permanent delete for videos (Admin only)
 */
export function bulkPermanentDeleteVideos(ids: string[], callerRole?: string): AdminVideo[] {
  if (callerRole && !canRolePermanentDelete(callerRole)) {
    console.warn(`[RBAC] Unauthorized bulk permanent delete attempted by role "${callerRole}". Operation blocked.`);
    return getStoredVideos();
  }
  const list = getStoredVideos();
  const updated = list.filter((v) => !ids.includes(v.id));
  saveVideos(updated);
  return updated;
}

/**
 * Get Counts for Tab & Sidebar Badges
 */
export function getVideosCounts(): {
  all: number;
  draft: number;
  scheduled: number;
  published: number;
  trash: number;
} {
  const list = getStoredVideos();
  return {
    all: list.filter((v) => v.status !== 'trash').length,
    draft: list.filter((v) => v.status === 'draft').length,
    scheduled: list.filter((v) => v.status === 'scheduled').length,
    published: list.filter((v) => v.status === 'published').length,
    trash: list.filter((v) => v.status === 'trash').length,
  };
}

/**
 * Check if a video is live (published, or scheduled whose time has arrived)
 * Draft and Trash are NEVER live.
 */
export function isVideoLive(v: AdminVideo): boolean {
  if (!v || v.status === 'trash' || v.status === 'draft') return false;
  if (v.status === 'scheduled') {
    if (!v.scheduledAt) return false;
    const scheduledTime = new Date(v.scheduledAt).getTime();
    return !isNaN(scheduledTime) && scheduledTime <= Date.now();
  }
  return v.status === 'published';
}

/**
 * Get all live published videos sorted by publishedAt DESC
 */
export function getPublishedLiveVideos(): AdminVideo[] {
  const list = getStoredVideos();
  return list
    .filter(isVideoLive)
    .sort((a, b) => {
      const timeA = new Date(a.publishedAt).getTime() || 0;
      const timeB = new Date(b.publishedAt).getTime() || 0;
      return timeB - timeA;
    });
}

/**
 * Get the live Featured Video (top published video or fallback)
 */
export function getLiveFeaturedVideo(): AdminVideo | undefined {
  const published = getPublishedLiveVideos();
  return published[0];
}

/**
 * Helper to resolve thumbnail URL from video record
 */
export function resolveVideoThumbnailUrl(v: AdminVideo): string {
  const ytId = v.youtubeVideoId || extractYouTubeVideoId(v.youtubeUrl) || 'dQw4w9WgXcQ';
  if (v.thumbnailSource === 'custom') {
    if (v.customThumbnail) return v.customThumbnail;
    if (v.thumbnailMediaId) {
      const media = getMediaById(v.thumbnailMediaId);
      if (media?.url) return media.url;
    }
  }
  return `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`;
}

/**
 * Get live related videos for a given video
 */
export function getLiveRelatedVideos(currentVideoId: string, category?: string, limit = 4) {
  const allLive = getPublishedLiveVideos().filter((v) => v.id !== currentVideoId && v.slug !== currentVideoId);
  
  // Prefer same category, then fallback to newest
  const sameCategory = category
    ? allLive.filter((v) => v.category?.toLowerCase() === category.toLowerCase())
    : [];
  
  const others = allLive.filter((v) => !sameCategory.some((sc) => sc.id === v.id));
  const combined = [...sameCategory, ...others].slice(0, limit);

  return combined.map((v) => ({
    id: v.id,
    slug: v.slug,
    title: v.title,
    category: v.category,
    duration: v.duration || '04:00',
    thumbnailUrl: resolveVideoThumbnailUrl(v),
    publishedAt: formatHumanDate(v.publishedAt),
    views: `${(v.views || 1000).toLocaleString('id-ID')} views`,
    youtubeVideoId: v.youtubeVideoId,
    youtubeUrl: v.youtubeUrl,
  }));
}

/**
 * Get live latest videos feed
 */
export function getLiveLatestVideosFeed(currentVideoId?: string, limit = 6) {
  const allLive = getPublishedLiveVideos().filter((v) => !currentVideoId || (v.id !== currentVideoId && v.slug !== currentVideoId));
  return allLive.slice(0, limit).map((v) => ({
    id: v.id,
    slug: v.slug,
    title: v.title,
    category: v.category,
    duration: v.duration || '04:00',
    thumbnailUrl: resolveVideoThumbnailUrl(v),
    timeAgo: formatHumanDate(v.publishedAt),
    views: v.views || 1200,
    youtubeVideoId: v.youtubeVideoId,
    youtubeUrl: v.youtubeUrl,
  }));
}

/**
 * Feed for S06 — Video Terbaru
 * Rule: status === "published" or scheduled reached, sort by publishedAt DESC, limit (default 6)
 */
export function getPublishedVideosForHomepage(limit = 6) {
  const list = getPublishedLiveVideos();
  return list
    .slice(0, limit)
    .map((v) => ({
      id: v.id,
      title: v.title,
      slug: v.slug,
      category: v.category,
      categorySlug: v.categorySlug || v.category.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      date: formatHumanDate(v.publishedAt),
      duration: v.duration || '04:00',
      thumbnailUrl: resolveVideoThumbnailUrl(v),
      youtubeVideoId: v.youtubeVideoId || extractYouTubeVideoId(v.youtubeUrl) || 'dQw4w9WgXcQ',
      youtubeUrl: v.youtubeUrl,
      href: `/video/${v.slug}`,
      views: v.views,
      author: v.author,
      excerpt: v.excerpt,
    }));
}

/**
 * Format date string to Indonesian human format (e.g. 27 Agustus 2026)
 */
function formatHumanDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const months = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
  } catch {
    return dateStr;
  }
}

/**
 * Reset local state to initial dummy data
 */
export function resetToDefaultVideos(): AdminVideo[] {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initialAdminVideos));
  }
  return initialAdminVideos;
}

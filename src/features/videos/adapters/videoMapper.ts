import { AdminVideo } from '@/src/types/admin';
import { PublicVideoItem } from '../types';
import { getYouTubeThumbnailUrl, extractYouTubeVideoId } from '@/src/utils/youtube';

/**
 * Resolves the primary thumbnail URL for a video.
 * Prefers customThumbnail if thumbnailSource is 'custom' and non-empty.
 * Otherwise uses YouTube HQ thumbnail based on the video ID.
 */
export function resolveVideoThumbnail(video: Partial<AdminVideo>): string {
  if (video.thumbnailSource === 'custom' && video.customThumbnail && video.customThumbnail.trim()) {
    return video.customThumbnail;
  }
  const videoId =
    video.youtubeVideoId ||
    (video.youtubeUrl ? extractYouTubeVideoId(video.youtubeUrl) : null) ||
    'dQw4w9WgXcQ';
  return getYouTubeThumbnailUrl(videoId, 'hq');
}

/**
 * Formats a given date string into relative Indonesian time.
 */
export function formatRelativeTimestamp(dateString: string): string {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Baru saja';
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Baru saja';
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `${diffInMinutes} menit lalu`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} jam lalu`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays} hari lalu`;
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(date);
  } catch {
    return 'Baru saja';
  }
}

/**
 * Formats a date string into full Indonesian date (e.g. 27 Agustus 2026, 10:15 WIB).
 */
export function formatFullDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    const formatted = new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
    return `${formatted} WIB`;
  } catch {
    return dateString;
  }
}

/**
 * Maps an AdminVideo domain model to a PublicVideoItem view model.
 */
export function toPublicVideoItem(admin: AdminVideo): PublicVideoItem {
  const publishedDate = admin.publishedAt || admin.createdAt || new Date().toISOString();
  const videoId =
    admin.youtubeVideoId ||
    (admin.youtubeUrl ? extractYouTubeVideoId(admin.youtubeUrl) : null) ||
    'dQw4w9WgXcQ';

  return {
    id: admin.id,
    title: admin.title,
    slug: admin.slug || `video-${admin.id}`,
    category: admin.category || 'Berita',
    categorySlug: admin.categorySlug || 'berita',
    duration: admin.duration || '00:00',
    thumbnailUrl: resolveVideoThumbnail(admin),
    videoEmbedId: videoId,
    publishedAt: formatFullDate(publishedDate),
    timestamp: formatRelativeTimestamp(publishedDate),
    views: admin.views || 0,
    presenter: admin.author || 'Tim Redaksi BatuTV',
    program: admin.category || 'Liputan Khusus',
    description: admin.description || admin.excerpt || '',
    excerpt: admin.excerpt || '',
    tags: admin.tags || [],
    youtubeUrl: admin.youtubeUrl || `https://www.youtube.com/watch?v=${videoId}`,
  };
}

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

/**
 * Maps an array of AdminVideo models to LatestVideoItem[] format for MainPortalFeed / LatestVideosSection.
 * Filters for published status and sorts by publishedAt DESC.
 */
export function mapAdminVideosToHomepageItems(
  videos: AdminVideo[],
  limit: number = 6
): {
  id: string | number;
  title: string;
  category: string;
  categorySlug?: string;
  date: string;
  duration: string;
  thumbnailUrl: string;
  videoEmbedId?: string;
  youtubeVideoId?: string;
  youtubeUrl?: string;
  description?: string;
  excerpt?: string;
  author?: string;
  views?: number;
  href: string;
  slug: string;
}[] {
  const published = videos.filter((v) => {
    if (v.status !== 'published') return false;
    if (v.publishedAt) {
      const pubTime = new Date(v.publishedAt).getTime();
      if (!isNaN(pubTime) && pubTime > Date.now()) return false;
    }
    return true;
  });

  const sorted = [...published].sort((a, b) => {
    const timeA = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
    const timeB = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
    return timeB - timeA;
  });

  return sorted.slice(0, limit).map((v) => {
    const pubDate = v.publishedAt || v.createdAt || new Date().toISOString();
    const vidId =
      v.youtubeVideoId ||
      (v.youtubeUrl ? extractYouTubeVideoId(v.youtubeUrl) : null) ||
      'dQw4w9WgXcQ';

    let formattedDate = 'Baru saja';
    try {
      const d = new Date(pubDate);
      if (!isNaN(d.getTime())) {
        formattedDate = new Intl.DateTimeFormat('id-ID', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        }).format(d);
      }
    } catch {
      formattedDate = 'Baru saja';
    }

    const cleanSlug = v.slug || `video-${v.id}`;

    return {
      id: v.id,
      title: v.title,
      slug: cleanSlug,
      category: v.category || 'Berita',
      categorySlug: v.categorySlug || (v.category ? v.category.toLowerCase().replace(/[^a-z0-9]+/g, '-') : 'berita'),
      date: formattedDate,
      duration: v.duration || '04:00',
      thumbnailUrl: resolveVideoThumbnail(v),
      videoEmbedId: vidId,
      youtubeVideoId: vidId,
      youtubeUrl: v.youtubeUrl || `https://www.youtube.com/watch?v=${vidId}`,
      href: `/video/${cleanSlug}`,
      views: v.views || 0,
      author: v.author,
      excerpt: v.excerpt,
      description: v.description || v.excerpt,
    };
  });
}

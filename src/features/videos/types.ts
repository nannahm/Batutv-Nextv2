import { AdminVideo, VideoStatus } from '@/src/types/admin';
import { VideoNews } from '@/src/types/news';

export type { AdminVideo, VideoStatus, VideoNews };

export interface PublicVideoItem extends VideoNews {
  slug: string;
  categorySlug: string;
  excerpt: string;
  tags: string[];
  timestamp: string;
  youtubeUrl: string;
}

export interface VideoFilterOptions {
  categorySlug?: string;
  status?: VideoStatus | 'all';
  searchQuery?: string;
  page?: number;
  limit?: number;
}
